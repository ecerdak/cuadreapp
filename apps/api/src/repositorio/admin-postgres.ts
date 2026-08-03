// Implementación Postgres del repositorio Admin. Mismo estilo del
// repositorio de cargas: consultas explícitas, numeric como texto →
// Number, y transacción donde la operación toca más de una tabla.

import pg from "pg";
import type {
  CargaAdmin,
  ClienteAdmin,
  CodigoAdmin,
  DispositivoAdmin,
  EquipoAdmin,
  OperadorAdmin,
  RepositorioAdmin,
  ResumenAdmin,
  SedeAdmin,
  TableroCliente,
} from "./admin.js";
import { ConflictoUnicidad } from "./admin.js";
import type { Bandera, EstadoCarga } from "@cuadreapp/dominio";

const numeroONulo = (valor: string | null): number | null => (valor === null ? null : Number(valor));

function traducirUnicidad(error: unknown): never {
  if (typeof error === "object" && error !== null && (error as { code?: string }).code === "23505") {
    throw new ConflictoUnicidad();
  }
  throw error;
}

const SELECT_CARGA = `
  select c.id, c.registrada_en, cl.nombre as cliente_nombre, s.nombre as sede_nombre,
         e.codigo_interno, co.nombre as operador_nombre, c.galones, c.estado, c.banderas,
         c.notas,
         extract(epoch from (c.finalizada_en - c.iniciada_en))::int as duracion_s,
         coalesce(json_agg(json_build_object('momento', f.momento, 'ruta', f.storage_path))
                  filter (where f.carga_id is not null), '[]') as fotos
  from cargas c
  join clientes cl    on cl.id = c.cliente_id
  join sedes s        on s.id = c.sede_id
  join equipos e      on e.id = c.equipo_id
  join conductores co on co.id = c.conductor_id
  left join fotos f   on f.carga_id = c.id`;

const GROUP_CARGA = ` group by c.id, cl.nombre, s.nombre, e.codigo_interno, co.nombre`;

function filaACarga(fila: Record<string, unknown>): CargaAdmin {
  return {
    id: fila.id as string,
    registradaEn: new Date(fila.registrada_en as string).toISOString(),
    clienteNombre: fila.cliente_nombre as string,
    sedeNombre: fila.sede_nombre as string,
    equipoCodigo: fila.codigo_interno as string,
    operadorNombre: fila.operador_nombre as string,
    galones: Number(fila.galones),
    duracionS: Number(fila.duracion_s ?? 0),
    estado: fila.estado as EstadoCarga,
    banderas: fila.banderas as Bandera[],
    notas: (fila.notas as string | null) ?? null,
    fotos: fila.fotos as Array<{ momento: string; ruta: string }>,
  };
}

export class RepositorioAdminPostgres implements RepositorioAdmin {
  constructor(private readonly pool: pg.Pool) {}

  async resumen(inicioHoyIso: string, ahoraIso: string): Promise<ResumenAdmin> {
    const [conteos, alertasCargas, sinSenal] = await Promise.all([
      this.pool.query(
        `select
           (select count(*) from clientes where activo)                          as clientes,
           (select count(*) from equipos where activo)                           as equipos,
           (select count(*) from conductores where activo)                       as operadores,
           (select count(*) from dispositivos where activo)                      as dispositivos,
           (select count(*) from cargas where registrada_en >= $1)               as cargas_hoy,
           (select coalesce(sum(galones), 0) from cargas where registrada_en >= $1) as galones_hoy`,
        [inicioHoyIso],
      ),
      this.pool.query(
        `select e.codigo_interno, c.estado
         from cargas c join equipos e on e.id = c.equipo_id
         where c.registrada_en >= $1 and c.estado <> 'ok'`,
        [inicioHoyIso],
      ),
      this.pool.query(
        `select d.nombre, s.nombre as sede
         from dispositivos d join sedes s on s.id = d.sede_id
         where d.activo and (d.ultimo_visto_en is null or d.ultimo_visto_en < $1::timestamptz - interval '24 hours')`,
        [ahoraIso],
      ),
    ]);
    const fila = conteos.rows[0]!;
    return {
      clientesActivos: Number(fila.clientes),
      equiposActivos: Number(fila.equipos),
      operadoresActivos: Number(fila.operadores),
      dispositivosEnrolados: Number(fila.dispositivos),
      cargasHoy: Number(fila.cargas_hoy),
      galonesHoy: Number(fila.galones_hoy),
      alertas: [
        ...alertasCargas.rows.map((a) => ({
          tipo: "carga_no_cuadra" as const,
          mensaje: `Carga de ${a.codigo_interno} hoy quedó en estado "${a.estado}".`,
        })),
        ...sinSenal.rows.map((d) => ({
          tipo: "dispositivo_sin_senal" as const,
          mensaje: `El dispositivo "${d.nombre ?? "sin nombre"}" (${d.sede}) lleva más de 24 h sin señal.`,
        })),
      ],
    };
  }

  async listarCargas(filtro: { clienteId?: string; limite: number }): Promise<CargaAdmin[]> {
    const condicion = filtro.clienteId ? ` where c.cliente_id = $2` : "";
    const parametros: unknown[] = [filtro.limite];
    if (filtro.clienteId) parametros.push(filtro.clienteId);
    const resultado = await this.pool.query(
      `${SELECT_CARGA}${condicion}${GROUP_CARGA} order by c.registrada_en desc limit $1`,
      parametros,
    );
    return resultado.rows.map(filaACarga);
  }

  async listarClientes(buscar?: string): Promise<ClienteAdmin[]> {
    const resultado = await this.pool.query(
      `select c.id, c.nombre, c.nit, c.activo,
              (select count(*) from sedes s where s.cliente_id = c.id) as sedes
       from clientes c
       where ($1::text is null or c.nombre ilike '%' || $1 || '%')
       order by c.nombre`,
      [buscar ?? null],
    );
    return resultado.rows.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      nit: f.nit,
      activo: f.activo,
      sedes: Number(f.sedes),
    }));
  }

  async crearCliente(datos: { nombre: string; nit: string | null }): Promise<ClienteAdmin> {
    try {
      const resultado = await this.pool.query(
        `insert into clientes (nombre, nit) values ($1, $2) returning id, nombre, nit, activo`,
        [datos.nombre, datos.nit],
      );
      const f = resultado.rows[0]!;
      return { id: f.id, nombre: f.nombre, nit: f.nit, activo: f.activo, sedes: 0 };
    } catch (error) {
      traducirUnicidad(error);
    }
  }

  async editarCliente(
    id: string,
    cambios: { nombre?: string; nit?: string | null; activo?: boolean },
  ): Promise<ClienteAdmin | null> {
    try {
      const resultado = await this.pool.query(
        `update clientes set
           nombre = coalesce($2, nombre),
           nit    = case when $4 then $3 else nit end,
           activo = coalesce($5, activo)
         where id = $1
         returning id, nombre, nit, activo,
           (select count(*) from sedes s where s.cliente_id = clientes.id) as sedes`,
        [id, cambios.nombre ?? null, cambios.nit ?? null, "nit" in cambios, cambios.activo ?? null],
      );
      const f = resultado.rows[0];
      if (!f) return null;
      return { id: f.id, nombre: f.nombre, nit: f.nit, activo: f.activo, sedes: Number(f.sedes) };
    } catch (error) {
      traducirUnicidad(error);
    }
  }

  async listarSedes(clienteId: string): Promise<SedeAdmin[]> {
    const resultado = await this.pool.query(
      `select s.id, s.cliente_id, s.nombre, s.lat, s.lng, s.radio_geocerca_m,
              coalesce(json_agg(json_build_object('id', d.id, 'nombre', d.nombre, 'tot', d.tot_actual_gal))
                       filter (where d.id is not null), '[]') as dispensadores
       from sedes s left join dispensadores d on d.sede_id = s.id
       where s.cliente_id = $1
       group by s.id order by s.nombre`,
      [clienteId],
    );
    return resultado.rows.map((f) => ({
      id: f.id,
      clienteId: f.cliente_id,
      nombre: f.nombre,
      lat: numeroONulo(f.lat),
      lng: numeroONulo(f.lng),
      radioGeocercaM: Number(f.radio_geocerca_m),
      dispensadores: (f.dispensadores as Array<{ id: string; nombre: string; tot: string }>).map(
        (d) => ({ id: d.id, nombre: d.nombre, totActualGal: Number(d.tot) }),
      ),
    }));
  }

  async crearSede(datos: {
    clienteId: string;
    nombre: string;
    lat: number | null;
    lng: number | null;
    radioGeocercaM: number;
    dispensador: { nombre: string; totInstalacionGal: number };
  }): Promise<SedeAdmin> {
    const conexion = await this.pool.connect();
    try {
      await conexion.query("begin");
      const sede = await conexion.query(
        `insert into sedes (cliente_id, nombre, lat, lng, radio_geocerca_m)
         values ($1, $2, $3, $4, $5) returning id`,
        [datos.clienteId, datos.nombre, datos.lat, datos.lng, datos.radioGeocercaM],
      );
      const sedeId = sede.rows[0]!.id as string;
      const dispensador = await conexion.query(
        `insert into dispensadores (sede_id, nombre, tot_instalacion_gal, tot_actual_gal, fecha_instalacion)
         values ($1, $2, $3, $3, now()) returning id, nombre, tot_actual_gal`,
        [sedeId, datos.dispensador.nombre, datos.dispensador.totInstalacionGal],
      );
      await conexion.query("commit");
      const d = dispensador.rows[0]!;
      return {
        id: sedeId,
        clienteId: datos.clienteId,
        nombre: datos.nombre,
        lat: datos.lat,
        lng: datos.lng,
        radioGeocercaM: datos.radioGeocercaM,
        dispensadores: [{ id: d.id, nombre: d.nombre, totActualGal: Number(d.tot_actual_gal) }],
      };
    } catch (error) {
      await conexion.query("rollback");
      traducirUnicidad(error);
    } finally {
      conexion.release();
    }
  }

  async listarEquipos(filtro: { clienteId?: string; buscar?: string }): Promise<EquipoAdmin[]> {
    const resultado = await this.pool.query(
      `select e.id, e.cliente_id, cl.nombre as cliente_nombre, e.codigo_interno, e.descripcion,
              e.categoria, e.tipo_medidor, e.capacidad_tanque_gal, e.activo
       from equipos e join clientes cl on cl.id = e.cliente_id
       where ($1::uuid is null or e.cliente_id = $1)
         and ($2::text is null or e.codigo_interno ilike '%' || $2 || '%' or e.descripcion ilike '%' || $2 || '%')
       order by cl.nombre, e.codigo_interno`,
      [filtro.clienteId ?? null, filtro.buscar ?? null],
    );
    return resultado.rows.map((f) => ({
      id: f.id,
      clienteId: f.cliente_id,
      clienteNombre: f.cliente_nombre,
      codigoInterno: f.codigo_interno,
      descripcion: f.descripcion,
      categoria: f.categoria,
      tipoMedidor: f.tipo_medidor,
      capacidadTanqueGal: numeroONulo(f.capacidad_tanque_gal),
      activo: f.activo,
    }));
  }

  async crearEquipo(datos: {
    clienteId: string;
    codigoInterno: string;
    qrToken: string;
    descripcion: string | null;
    categoria: string | null;
    tipoMedidor: string;
    capacidadTanqueGal: number | null;
  }): Promise<EquipoAdmin> {
    try {
      const resultado = await this.pool.query(
        `insert into equipos (cliente_id, codigo_interno, qr_token, descripcion, categoria, tipo_medidor, capacidad_tanque_gal)
         values ($1, $2, $3, $4, $5, $6, $7)
         returning id, activo, (select nombre from clientes where id = $1) as cliente_nombre`,
        [
          datos.clienteId,
          datos.codigoInterno,
          datos.qrToken,
          datos.descripcion,
          datos.categoria,
          datos.tipoMedidor,
          datos.capacidadTanqueGal,
        ],
      );
      const f = resultado.rows[0]!;
      return {
        id: f.id,
        clienteId: datos.clienteId,
        clienteNombre: f.cliente_nombre,
        codigoInterno: datos.codigoInterno,
        descripcion: datos.descripcion,
        categoria: datos.categoria,
        tipoMedidor: datos.tipoMedidor,
        capacidadTanqueGal: datos.capacidadTanqueGal,
        activo: f.activo,
      };
    } catch (error) {
      traducirUnicidad(error);
    }
  }

  async editarEquipo(
    id: string,
    cambios: {
      codigoInterno?: string;
      descripcion?: string | null;
      categoria?: string | null;
      tipoMedidor?: string;
      capacidadTanqueGal?: number | null;
      activo?: boolean;
    },
  ): Promise<EquipoAdmin | null> {
    try {
      const resultado = await this.pool.query(
        `update equipos set
           codigo_interno       = coalesce($2, codigo_interno),
           descripcion          = case when $4 then $3 else descripcion end,
           categoria            = coalesce($5, categoria),
           tipo_medidor         = coalesce($6, tipo_medidor),
           capacidad_tanque_gal = case when $8 then $7 else capacidad_tanque_gal end,
           activo               = coalesce($9, activo)
         where id = $1
         returning id, cliente_id, codigo_interno, descripcion, categoria, tipo_medidor,
                   capacidad_tanque_gal, activo,
                   (select nombre from clientes where id = equipos.cliente_id) as cliente_nombre`,
        [
          id,
          cambios.codigoInterno ?? null,
          cambios.descripcion ?? null,
          "descripcion" in cambios,
          cambios.categoria ?? null,
          cambios.tipoMedidor ?? null,
          cambios.capacidadTanqueGal ?? null,
          "capacidadTanqueGal" in cambios,
          cambios.activo ?? null,
        ],
      );
      const f = resultado.rows[0];
      if (!f) return null;
      return {
        id: f.id,
        clienteId: f.cliente_id,
        clienteNombre: f.cliente_nombre,
        codigoInterno: f.codigo_interno,
        descripcion: f.descripcion,
        categoria: f.categoria,
        tipoMedidor: f.tipo_medidor,
        capacidadTanqueGal: numeroONulo(f.capacidad_tanque_gal),
        activo: f.activo,
      };
    } catch (error) {
      traducirUnicidad(error);
    }
  }

  async listarOperadores(filtro: { clienteId?: string; buscar?: string }): Promise<OperadorAdmin[]> {
    const resultado = await this.pool.query(
      `select co.id, co.cliente_id, cl.nombre as cliente_nombre, co.nombre, co.codigo, co.activo,
              (select max(c.registrada_en) from cargas c where c.conductor_id = co.id) as ultima_carga_en
       from conductores co join clientes cl on cl.id = co.cliente_id
       where ($1::uuid is null or co.cliente_id = $1)
         and ($2::text is null or co.nombre ilike '%' || $2 || '%' or co.codigo ilike '%' || $2 || '%')
       order by cl.nombre, co.nombre`,
      [filtro.clienteId ?? null, filtro.buscar ?? null],
    );
    return resultado.rows.map((f) => ({
      id: f.id,
      clienteId: f.cliente_id,
      clienteNombre: f.cliente_nombre,
      nombre: f.nombre,
      codigo: f.codigo,
      activo: f.activo,
      ultimaCargaEn: f.ultima_carga_en ? new Date(f.ultima_carga_en).toISOString() : null,
    }));
  }

  async crearOperador(datos: {
    clienteId: string;
    nombre: string;
    codigo: string;
    pinHash: string;
  }): Promise<OperadorAdmin> {
    try {
      const resultado = await this.pool.query(
        `insert into conductores (cliente_id, nombre, codigo, pin_hash)
         values ($1, $2, $3, $4)
         returning id, activo, (select nombre from clientes where id = $1) as cliente_nombre`,
        [datos.clienteId, datos.nombre, datos.codigo, datos.pinHash],
      );
      const f = resultado.rows[0]!;
      return {
        id: f.id,
        clienteId: datos.clienteId,
        clienteNombre: f.cliente_nombre,
        nombre: datos.nombre,
        codigo: datos.codigo,
        activo: f.activo,
        ultimaCargaEn: null,
      };
    } catch (error) {
      traducirUnicidad(error);
    }
  }

  async editarOperador(
    id: string,
    cambios: { nombre?: string; codigo?: string; pinHash?: string; activo?: boolean },
  ): Promise<OperadorAdmin | null> {
    try {
      const resultado = await this.pool.query(
        `update conductores set
           nombre   = coalesce($2, nombre),
           codigo   = coalesce($3, codigo),
           pin_hash = coalesce($4, pin_hash),
           activo   = coalesce($5, activo)
         where id = $1
         returning id, cliente_id, nombre, codigo, activo,
                   (select nombre from clientes where id = conductores.cliente_id) as cliente_nombre,
                   (select max(c.registrada_en) from cargas c where c.conductor_id = conductores.id) as ultima_carga_en`,
        [
          id,
          cambios.nombre ?? null,
          cambios.codigo ?? null,
          cambios.pinHash ?? null,
          cambios.activo ?? null,
        ],
      );
      const f = resultado.rows[0];
      if (!f) return null;
      return {
        id: f.id,
        clienteId: f.cliente_id,
        clienteNombre: f.cliente_nombre,
        nombre: f.nombre,
        codigo: f.codigo,
        activo: f.activo,
        ultimaCargaEn: f.ultima_carga_en ? new Date(f.ultima_carga_en).toISOString() : null,
      };
    } catch (error) {
      traducirUnicidad(error);
    }
  }

  async listarCodigos(filtro: { sedeId?: string }): Promise<CodigoAdmin[]> {
    const resultado = await this.pool.query(
      `select ce.id, ce.sede_id, s.nombre as sede_nombre, cl.nombre as cliente_nombre,
              ce.codigo, ce.expira_en, ce.usado_en
       from codigos_enrolamiento ce
       join sedes s on s.id = ce.sede_id
       join clientes cl on cl.id = s.cliente_id
       where ($1::uuid is null or ce.sede_id = $1)
       order by ce.creado_en desc limit 100`,
      [filtro.sedeId ?? null],
    );
    return resultado.rows.map((f) => ({
      id: f.id,
      sedeId: f.sede_id,
      sedeNombre: f.sede_nombre,
      clienteNombre: f.cliente_nombre,
      codigo: f.codigo,
      expiraEn: new Date(f.expira_en).toISOString(),
      usadoEn: f.usado_en ? new Date(f.usado_en).toISOString() : null,
    }));
  }

  async crearCodigo(datos: { sedeId: string; codigo: string; expiraEn: string }): Promise<CodigoAdmin> {
    try {
      const resultado = await this.pool.query(
        `insert into codigos_enrolamiento (sede_id, codigo, expira_en)
         values ($1, $2, $3)
         returning id, expira_en,
           (select nombre from sedes where id = $1) as sede_nombre,
           (select cl.nombre from sedes s join clientes cl on cl.id = s.cliente_id where s.id = $1) as cliente_nombre`,
        [datos.sedeId, datos.codigo, datos.expiraEn],
      );
      const f = resultado.rows[0]!;
      return {
        id: f.id,
        sedeId: datos.sedeId,
        sedeNombre: f.sede_nombre,
        clienteNombre: f.cliente_nombre,
        codigo: datos.codigo,
        expiraEn: new Date(f.expira_en).toISOString(),
        usadoEn: null,
      };
    } catch (error) {
      traducirUnicidad(error);
    }
  }

  async listarDispositivos(): Promise<DispositivoAdmin[]> {
    const resultado = await this.pool.query(
      `select d.id, d.usuario_id, d.sede_id, s.nombre as sede_nombre, cl.nombre as cliente_nombre,
              d.nombre, d.enrolado_en, d.ultimo_visto_en, d.activo
       from dispositivos d
       join sedes s on s.id = d.sede_id
       join clientes cl on cl.id = s.cliente_id
       order by d.enrolado_en desc`,
    );
    return resultado.rows.map((f) => ({
      id: f.id,
      usuarioId: f.usuario_id,
      sedeId: f.sede_id,
      sedeNombre: f.sede_nombre,
      clienteNombre: f.cliente_nombre,
      nombre: f.nombre,
      enroladoEn: new Date(f.enrolado_en).toISOString(),
      ultimoVistoEn: f.ultimo_visto_en ? new Date(f.ultimo_visto_en).toISOString() : null,
      activo: f.activo,
    }));
  }

  async desactivarDispositivo(id: string): Promise<DispositivoAdmin | null> {
    const conexion = await this.pool.connect();
    try {
      await conexion.query("begin");
      const dispositivo = await conexion.query(
        `update dispositivos set activo = false where id = $1 returning usuario_id`,
        [id],
      );
      const fila = dispositivo.rows[0];
      if (!fila) {
        await conexion.query("rollback");
        return null;
      }
      // Revocación efectiva: el usuario técnico inactivo no obtiene sesión.
      await conexion.query(`update usuarios set activo = false where id = $1`, [fila.usuario_id]);
      await conexion.query("commit");
    } catch (error) {
      await conexion.query("rollback");
      throw error;
    } finally {
      conexion.release();
    }
    const lista = await this.listarDispositivos();
    return lista.find((d) => d.id === id) ?? null;
  }

  async tableroCliente(
    clienteId: string,
    inicioHoyIso: string,
    desdeHistorialIso: string,
  ): Promise<TableroCliente | null> {
    const cliente = await this.pool.query(`select nombre from clientes where id = $1`, [clienteId]);
    if (!cliente.rows[0]) return null;

    const [hoy, porEquipo, historial] = await Promise.all([
      this.pool.query(
        `select count(*) as cargas, coalesce(sum(galones), 0) as galones,
                avg(extract(epoch from (finalizada_en - iniciada_en)))::int as duracion_prom,
                max(registrada_en) as ultima,
                coalesce(array_agg(distinct co.nombre), '{}') as operadores
         from cargas c join conductores co on co.id = c.conductor_id
         where c.cliente_id = $1 and c.registrada_en >= $2`,
        [clienteId, inicioHoyIso],
      ),
      this.pool.query(
        `select e.codigo_interno, e.descripcion,
                count(c.id) as cargas, coalesce(sum(c.galones), 0) as galones, max(c.registrada_en) as ultima
         from equipos e
         left join cargas c on c.equipo_id = e.id and c.registrada_en >= $2
         where e.cliente_id = $1 and e.activo
         group by e.id order by e.codigo_interno`,
        [clienteId, inicioHoyIso],
      ),
      this.pool.query(
        `${SELECT_CARGA} where c.cliente_id = $1 and c.registrada_en >= $2${GROUP_CARGA}
         order by c.registrada_en desc limit 60`,
        [clienteId, desdeHistorialIso],
      ),
    ]);

    const h = hoy.rows[0]!;
    return {
      clienteId,
      clienteNombre: cliente.rows[0].nombre,
      hoy: {
        cargas: Number(h.cargas),
        galones: Number(h.galones),
        duracionPromedioS: h.duracion_prom === null ? null : Number(h.duracion_prom),
        operadores: (h.operadores as string[]).filter(Boolean),
        ultimaCargaEn: h.ultima ? new Date(h.ultima).toISOString() : null,
      },
      porEquipo: porEquipo.rows.map((f) => ({
        equipoCodigo: f.codigo_interno,
        descripcion: f.descripcion,
        cargas: Number(f.cargas),
        galones: Number(f.galones),
        ultimaCargaEn: f.ultima ? new Date(f.ultima).toISOString() : null,
      })),
      historial: historial.rows.map(filaACarga),
    };
  }
}
