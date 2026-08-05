// Implementación Postgres de las lecturas del Dashboard de Cliente.
// Mismo estilo de los otros repositorios: consultas explícitas,
// numeric como texto → Number, y una sola consulta por hecho.
//
// Dos invariantes que sostienen el aislamiento multiempresa:
//   1. El cliente_id SIEMPRE es $1 y viene del alcance de la sesión.
//      No hay ninguna consulta que lo tome de la petición.
//   2. La sede es opcional y se compara con `is null or = $2`: una
//      sesión sin sede fija ve todas las de SU cliente, nunca más.
//
// El tiempo de la operación es `finalizada_en` (cuándo ocurrió la
// carga), no `registrada_en` (cuándo llegó al servidor): una carga
// sincronizada dos días después pertenece al día en que se hizo.

import pg from "pg";
import type { Bandera, CodigoPerfil, EstadoCarga } from "@cuadreapp/dominio";
import type {
  AlcanceTablero,
  BalanceTablero,
  CargaTablero,
  ContextoTableroDatos,
  DetalleCargaTablero,
  EquipoTablero,
  HechosHoy,
  PaginaCargasTablero,
  RepositorioTablero,
  SuministroTablero,
  VentanaTablero,
} from "./tablero.js";
import { fechaBogota, horaBogota } from "../tiempo.js";

const numeroONulo = (valor: string | null): number | null => (valor === null ? null : Number(valor));
const redondear = (valor: number): number => Math.round(valor * 10) / 10;

/** Columnas de una carga tal como la ve el tablero. */
const SELECT_CARGA = `
  select c.id, c.finalizada_en, c.galones, c.estado, c.banderas, c.perfil_codigo,
         c.llegada_gal, c.inventario_final_gal,
         e.codigo_interno, e.descripcion as equipo_descripcion, e.capacidad_tanque_gal,
         co.nombre as conductor_nombre
  from cargas c
  join equipos e      on e.id = c.equipo_id
  join conductores co on co.id = c.conductor_id`;

function filaACarga(fila: Record<string, unknown>): CargaTablero {
  const finalizada = fila.finalizada_en as string;
  return {
    id: fila.id as string,
    fecha: fechaBogota(finalizada),
    hora: horaBogota(finalizada),
    equipoCodigo: fila.codigo_interno as string,
    equipoDescripcion: (fila.equipo_descripcion as string | null) ?? null,
    conductorNombre: fila.conductor_nombre as string,
    galones: Number(fila.galones),
    estado: fila.estado as EstadoCarga,
    banderas: fila.banderas as Bandera[],
    perfilCodigo: fila.perfil_codigo as CodigoPerfil,
    llegadaGal: numeroONulo(fila.llegada_gal as string | null),
    inventarioFinalGal: numeroONulo(fila.inventario_final_gal as string | null),
    capacidadEquipoGal: numeroONulo(fila.capacidad_tanque_gal as string | null),
  };
}

/** Serie de 14 fechas locales desde el inicio de la ventana. */
function catorceDias(desde14d: string): string[] {
  const dias: string[] = [];
  const inicio = new Date(desde14d);
  for (let indice = 0; indice < 14; indice += 1) {
    const dia = new Date(inicio.getTime() + indice * 86_400_000);
    dias.push(fechaBogota(dia));
  }
  return dias;
}

export class RepositorioTableroPostgres implements RepositorioTablero {
  constructor(private readonly pool: pg.Pool) {}

  async contexto(alcance: AlcanceTablero): Promise<ContextoTableroDatos | null> {
    const cliente = await this.pool.query(
      `select cl.id, cl.nombre, cl.nombre_comercial, cl.color_primario, cl.color_secundario,
              cl.logo_url as logo_clave, p.codigo as perfil_codigo, p.nombre as perfil_nombre
       from clientes cl
       join perfiles_operativos p on p.codigo = cl.perfil_codigo
       where cl.id = $1 and cl.activo`,
      [alcance.clienteId],
    );
    const fila = cliente.rows[0];
    if (!fila) return null;

    const [sedes, medidor] = await Promise.all([
      this.pool.query(
        `select id, nombre, ciudad
         from sedes
         where cliente_id = $1 and activo and ($2::uuid is null or id = $2)
         order by nombre`,
        [alcance.clienteId, alcance.sedeId],
      ),
      this.pool.query(
        `select d.marca_medidor, to_char(d.fecha_instalacion, 'YYYY-MM-DD') as fecha_instalacion
         from dispensadores d
         join sedes s on s.id = d.sede_id
         where s.cliente_id = $1 and d.activo and ($2::uuid is null or d.sede_id = $2)
         order by d.fecha_instalacion
         limit 1`,
        [alcance.clienteId, alcance.sedeId],
      ),
    ]);

    const filaMedidor = medidor.rows[0];
    return {
      cliente: {
        id: fila.id,
        nombre: fila.nombre,
        nombreComercial: fila.nombre_comercial ?? null,
        colorPrimario: fila.color_primario ?? null,
        colorSecundario: fila.color_secundario ?? null,
        logoClave: fila.logo_clave ?? null,
      },
      perfil: { codigo: fila.perfil_codigo as CodigoPerfil, nombre: fila.perfil_nombre },
      sedes: sedes.rows.map((s) => ({ id: s.id, nombre: s.nombre, ciudad: s.ciudad ?? null })),
      medidor: filaMedidor
        ? {
            modelo: filaMedidor.marca_medidor ?? "Medidor",
            // `date` sin hora: se lee tal cual, sin convertir zona.
            instalado: filaMedidor.fecha_instalacion as string,
          }
        : null,
    };
  }

  async hoy(alcance: AlcanceTablero, ventana: VentanaTablero): Promise<HechosHoy> {
    const parametrosAlcance = [alcance.clienteId, alcance.sedeId];

    const [cargasHoy, consumo, totalizador, sinRegistrar, inventario, balance] = await Promise.all([
      this.pool.query(
        `${SELECT_CARGA}
         where c.cliente_id = $1 and ($2::uuid is null or c.sede_id = $2) and c.finalizada_en >= $3
         order by c.finalizada_en desc`,
        [...parametrosAlcance, ventana.inicioHoy],
      ),
      this.pool.query(
        `select to_char(c.finalizada_en at time zone 'America/Bogota', 'YYYY-MM-DD') as dia,
                coalesce(sum(c.galones), 0) as galones
         from cargas c
         where c.cliente_id = $1 and ($2::uuid is null or c.sede_id = $2) and c.finalizada_en >= $3
         group by 1`,
        [...parametrosAlcance, ventana.desde14d],
      ),
      this.pool.query(
        `select d.tot_actual_gal
         from dispensadores d
         join sedes s on s.id = d.sede_id
         where s.cliente_id = $1 and d.activo and ($2::uuid is null or d.sede_id = $2)`,
        parametrosAlcance,
      ),
      this.pool.query(
        `select coalesce(sum(greatest(c.gal_no_registrados, 0)), 0) as gal
         from cargas c
         where c.cliente_id = $1 and ($2::uuid is null or c.sede_id = $2) and c.finalizada_en >= $3`,
        [...parametrosAlcance, ventana.desde14d],
      ),
      this.pool.query(
        `with del_dia as (
           select c.equipo_id, c.llegada_gal, c.galones, c.inventario_final_gal
           from cargas c
           where c.cliente_id = $1 and ($2::uuid is null or c.sede_id = $2)
             and c.finalizada_en >= $3 and c.llegada_gal is not null
         )
         select coalesce(sum(llegada_gal), 0)         as recibido,
                coalesce(sum(galones), 0)             as despachado,
                coalesce(sum(inventario_final_gal), 0) as total_salida,
                (select sum(e.capacidad_tanque_gal) from equipos e
                  where e.id in (select distinct equipo_id from del_dia)) as capacidad
         from del_dia`,
        [...parametrosAlcance, ventana.inicioHoy],
      ),
      this.balance(alcance, ventana),
    ]);

    const porDia = new Map<string, number>(
      consumo.rows.map((fila) => [fila.dia as string, Number(fila.galones)]),
    );
    const filaInventario = inventario.rows[0]!;

    return {
      cargasDeHoy: cargasHoy.rows.map(filaACarga),
      consumo14d: catorceDias(ventana.desde14d).map((fecha) => ({
        fecha,
        galones: redondear(porDia.get(fecha) ?? 0),
      })),
      // Sumar totalizadores de sedes distintas no significa nada: con
      // más de un medidor en alcance el tablero no muestra el panel.
      totalizadorGal: totalizador.rows.length === 1 ? Number(totalizador.rows[0]!.tot_actual_gal) : null,
      galSinRegistrarGal: redondear(Number(sinRegistrar.rows[0]!.gal)),
      balance,
      inventarioHoy: {
        recibidoGal: redondear(Number(filaInventario.recibido)),
        despachadoGal: redondear(Number(filaInventario.despachado)),
        totalSalidaGal: redondear(Number(filaInventario.total_salida)),
        capacidadGal: numeroONulo(filaInventario.capacidad),
      },
    };
  }

  private async balance(alcance: AlcanceTablero, ventana: VentanaTablero): Promise<BalanceTablero> {
    const resultado = await this.pool.query(
      `select
         (select coalesce(sum(c.galones), 0) + coalesce(sum(greatest(c.gal_no_registrados, 0)), 0)
            from cargas c
           where c.cliente_id = $1 and ($2::uuid is null or c.sede_id = $2))          as despachado_total,
         (select coalesce(sum(c.galones), 0) + coalesce(sum(greatest(c.gal_no_registrados, 0)), 0)
            from cargas c
           where c.cliente_id = $1 and ($2::uuid is null or c.sede_id = $2)
             and c.finalizada_en >= $3)                                              as despachado_7d,
         (select coalesce(sum(e.galones), 0)
            from entregas e
           where e.cliente_id = $1 and ($2::uuid is null or e.sede_id = $2))          as entregado_total,
         (select count(*)
            from entregas e
           where e.cliente_id = $1 and ($2::uuid is null or e.sede_id = $2))          as entregas`,
      [alcance.clienteId, alcance.sedeId, ventana.desde7d],
    );
    const fila = resultado.rows[0]!;
    const entregadoTotalGal = redondear(Number(fila.entregado_total));
    const despachadoTotalGal = redondear(Number(fila.despachado_total));
    const consumoDiarioGal = redondear(Number(fila.despachado_7d) / 7);
    // Sin entregas registradas no hay línea base del tanque: la
    // existencia se declara desconocida antes que inventada.
    const hayEntregas = Number(fila.entregas) > 0;
    const existenciaEstimadaGal = hayEntregas ? redondear(entregadoTotalGal - despachadoTotalGal) : null;
    return {
      entregadoTotalGal,
      despachadoTotalGal,
      consumoDiarioGal,
      existenciaEstimadaGal,
      autonomiaDias:
        existenciaEstimadaGal !== null && consumoDiarioGal > 0
          ? redondear(existenciaEstimadaGal / consumoDiarioGal)
          : null,
    };
  }

  async cargas(
    alcance: AlcanceTablero,
    filtro: { estado?: EstadoCarga; desde: string },
  ): Promise<PaginaCargasTablero> {
    const parametros = [alcance.clienteId, alcance.sedeId, filtro.desde];

    const [lista, totales] = await Promise.all([
      this.pool.query(
        `${SELECT_CARGA}
         where c.cliente_id = $1 and ($2::uuid is null or c.sede_id = $2) and c.finalizada_en >= $3
           and ($4::text is null or c.estado = $4)
         order by c.finalizada_en desc
         limit 500`,
        [...parametros, filtro.estado ?? null],
      ),
      this.pool.query(
        `select count(*)                                                     as total,
                count(*) filter (where c.estado = 'ok')                      as cuadran,
                count(*) filter (where c.banderas @> '["FOTO_FALTANTE"]')    as sin_foto,
                coalesce(sum(greatest(c.gal_no_registrados, 0)), 0)          as sin_registrar
         from cargas c
         where c.cliente_id = $1 and ($2::uuid is null or c.sede_id = $2) and c.finalizada_en >= $3`,
        parametros,
      ),
    ]);

    const fila = totales.rows[0]!;
    return {
      cargas: lista.rows.map(filaACarga),
      total: Number(fila.total),
      cuadran: Number(fila.cuadran),
      sinFotoFinal: Number(fila.sin_foto),
      galSinRegistrarGal: redondear(Number(fila.sin_registrar)),
    };
  }

  async detalleCarga(alcance: AlcanceTablero, id: string): Promise<DetalleCargaTablero | null> {
    const resultado = await this.pool.query(
      `select c.id, c.finalizada_en, c.iniciada_en, c.galones, c.estado, c.banderas, c.perfil_codigo,
              c.llegada_gal, c.inventario_final_gal, c.gal_no_registrados, c.notas,
              c.tanda_inicial_gal, c.tot_inicial_gal, c.tanda_final_gal, c.tot_final_gal,
              c.lectura_equipo, c.tipo_lectura,
              e.codigo_interno, e.descripcion as equipo_descripcion, e.capacidad_tanque_gal,
              co.nombre as conductor_nombre,
              coalesce(json_agg(json_build_object('momento', f.momento, 'ruta', f.storage_path))
                       filter (where f.carga_id is not null), '[]') as fotos
       from cargas c
       join equipos e      on e.id = c.equipo_id
       join conductores co on co.id = c.conductor_id
       left join fotos f   on f.carga_id = c.id
       where c.id = $1 and c.cliente_id = $2 and ($3::uuid is null or c.sede_id = $3)
       group by c.id, e.codigo_interno, e.descripcion, e.capacidad_tanque_gal, co.nombre`,
      [id, alcance.clienteId, alcance.sedeId],
    );
    const fila = resultado.rows[0];
    if (!fila) return null;

    const duracionSegundos = Math.max(
      0,
      Math.round(
        (new Date(fila.finalizada_en as string).getTime() -
          new Date(fila.iniciada_en as string).getTime()) /
          1000,
      ),
    );
    const llegadaGal = numeroONulo(fila.llegada_gal);

    return {
      carga: filaACarga(fila),
      lecturas:
        fila.tot_final_gal === null
          ? null
          : {
              tandaInicial: Number(fila.tanda_inicial_gal),
              totInicial: Number(fila.tot_inicial_gal),
              tandaFinal: Number(fila.tanda_final_gal),
              totFinal: Number(fila.tot_final_gal),
            },
      inventario:
        llegadaGal === null
          ? null
          : {
              llegadaGal,
              despachadosGal: Number(fila.galones),
              totalSalidaGal: Number(fila.inventario_final_gal),
            },
      lecturaEquipo: numeroONulo(fila.lectura_equipo),
      tipoLectura: fila.tipo_lectura ?? null,
      duracionSegundos,
      galNoRegistrados: numeroONulo(fila.gal_no_registrados),
      notas: fila.notas ?? null,
      fotos: fila.fotos as Array<{ momento: string; ruta: string }>,
    };
  }

  async equipos(alcance: AlcanceTablero, ventana: VentanaTablero): Promise<EquipoTablero[]> {
    // El rendimiento de una carga es galones ÷ avance del contador
    // desde la carga anterior DEL MISMO equipo (lag). La mediana de
    // esos rendimientos es el patrón histórico contra el que el
    // tablero compara el período. Es aritmética de reporte: ninguna
    // regla del dominio se recalcula aquí (DEC-011).
    const resultado = await this.pool.query(
      `with deltas as (
         select c.equipo_id, c.galones, c.finalizada_en, c.inventario_final_gal,
                c.lectura_equipo - lag(c.lectura_equipo)
                  over (partition by c.equipo_id order by c.finalizada_en) as delta
         from cargas c
         where c.cliente_id = $1 and ($2::uuid is null or c.sede_id = $2)
       ),
       periodo as (
         select equipo_id,
                sum(galones)                              as galones,
                sum(case when delta > 0 then delta end)   as uso
         from deltas where finalizada_en >= $3 group by equipo_id
       ),
       mediana as (
         select equipo_id,
                percentile_cont(0.5) within group (order by galones / delta) as mediana
         from deltas where delta > 0 group by equipo_id
       ),
       ultimo as (
         select distinct on (equipo_id) equipo_id, inventario_final_gal
         from deltas where inventario_final_gal is not null
         order by equipo_id, finalizada_en desc
       )
       select e.codigo_interno, e.descripcion, e.categoria, e.tipo_medidor, e.capacidad_tanque_gal,
              coalesce(p.galones, 0) as galones, p.uso, m.mediana, u.inventario_final_gal
       from equipos e
       left join periodo p on p.equipo_id = e.id
       left join mediana m on m.equipo_id = e.id
       left join ultimo u  on u.equipo_id = e.id
       where e.cliente_id = $1 and e.activo
         and ($2::uuid is null or e.sede_id is null or e.sede_id = $2)
       order by e.codigo_interno`,
      [alcance.clienteId, alcance.sedeId, ventana.desde7d],
    );

    return resultado.rows.map((fila) => {
      const uso = numeroONulo(fila.uso);
      const galonesPeriodoGal = redondear(Number(fila.galones));
      return {
        codigo: fila.codigo_interno,
        descripcion: fila.descripcion ?? null,
        categoria: fila.categoria ?? null,
        tipoMedidor: fila.tipo_medidor,
        capacidadTanqueGal: numeroONulo(fila.capacidad_tanque_gal),
        galonesPeriodoGal,
        usoPeriodo: uso === null ? null : redondear(uso),
        rendimiento: uso !== null && uso > 0 ? Math.round((galonesPeriodoGal / uso) * 100) / 100 : null,
        medianaHistorica: fila.mediana === null ? null : Math.round(Number(fila.mediana) * 100) / 100,
        ultimoInventarioGal: numeroONulo(fila.inventario_final_gal),
      };
    });
  }

  async suministro(alcance: AlcanceTablero, ventana: VentanaTablero): Promise<SuministroTablero> {
    const [entregas, balance] = await Promise.all([
      this.pool.query(
        `select numero_remision, to_char(fecha, 'YYYY-MM-DD') as fecha,
                galones, placa_carrotanque, recibido_por
         from entregas
         where cliente_id = $1 and ($2::uuid is null or sede_id = $2)
         order by fecha desc
         limit 60`,
        [alcance.clienteId, alcance.sedeId],
      ),
      this.balance(alcance, ventana),
    ]);

    return {
      entregas: entregas.rows.map((fila) => ({
        numeroRemision: fila.numero_remision,
        fecha: fila.fecha as string,
        galones: Number(fila.galones),
        placaCarrotanque: fila.placa_carrotanque ?? null,
        recibidoPor: fila.recibido_por ?? null,
      })),
      balance,
    };
  }

  async sedePerteneceACliente(clienteId: string, sedeId: string): Promise<boolean> {
    const resultado = await this.pool.query(
      `select 1 from sedes where id = $1 and cliente_id = $2 and activo`,
      [sedeId, clienteId],
    );
    return resultado.rowCount === 1;
  }
}
