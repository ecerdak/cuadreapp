// Implementación Postgres del repositorio. Supabase es solo la
// infraestructura que hospeda esta base (DEC-009); la conexión es un
// Postgres normal vía DATABASE_URL (pooler de Supabase).
//
// Nota de concurrencia, documentada a propósito: entre la lectura del
// contexto y el insert no hay bloqueo (FOR UPDATE). Es una decisión
// deliberada para el piloto: un dispensador tiene una sola manguera,
// así que dos cargas físicamente simultáneas en el mismo dispensador
// no existen, y el trigger de tot_actual_gal solo avanza hacia
// adelante. Si el volumen algún día lo exige, este es el lugar donde
// se agrega el bloqueo.

import pg from "pg";
import type {
  CargaPersistida,
  CatalogoSede,
  CodigoEnrolamientoValido,
  ContextoRegistro,
  NuevaCarga,
  NuevaFoto,
  RepositorioCargas,
  RepositorioSeguridad,
} from "./tipos.js";
import type { SesionAutenticada } from "../seguridad/tipos.js";
import type { Bandera, EstadoCarga, TipoMedidor } from "@cuadreapp/dominio";

// pg entrega los numeric como texto para no perder precisión.
const numeroONulo = (valor: string | null): number | null => (valor === null ? null : Number(valor));

export class RepositorioCargasPostgres implements RepositorioCargas {
  constructor(private readonly pool: pg.Pool) {}

  async buscarCargaPorId(id: string): Promise<CargaPersistida | null> {
    const resultado = await this.pool.query(
      `select id, estado, banderas, galones, gal_no_registrados
       from cargas
       where id = $1`,
      [id],
    );
    const fila = resultado.rows[0];
    if (!fila) return null;
    return {
      id: fila.id,
      estado: fila.estado as EstadoCarga,
      banderas: fila.banderas as Bandera[],
      galones: Number(fila.galones),
      galNoRegistrados: numeroONulo(fila.gal_no_registrados),
    };
  }

  async obtenerContextoRegistro(referencias: {
    dispensadorId: string;
    equipoId: string;
    conductorId: string;
  }): Promise<ContextoRegistro | null> {
    // Una sola consulta que además garantiza integridad de tenant: el
    // equipo y el conductor deben pertenecer al mismo cliente de la
    // sede del dispensador, o no hay contexto.
    const resultado = await this.pool.query(
      `select s.cliente_id,
              d.sede_id,
              d.tot_actual_gal,
              d.tolerancia_tanda_gal,
              e.tipo_medidor,
              e.ultima_lectura,
              e.capacidad_tanque_gal,
              s.lat  as sede_lat,
              s.lng  as sede_lng,
              s.radio_geocerca_m,
              (select max(c.finalizada_en)
               from cargas c
               where c.equipo_id = e.id) as ultima_carga_finalizada_en
       from dispensadores d
       join sedes s        on s.id = d.sede_id
       join equipos e      on e.id = $2 and e.cliente_id = s.cliente_id and e.activo
       join conductores co on co.id = $3 and co.cliente_id = s.cliente_id and co.activo
       where d.id = $1 and d.activo`,
      [referencias.dispensadorId, referencias.equipoId, referencias.conductorId],
    );
    const fila = resultado.rows[0];
    if (!fila) return null;

    return {
      clienteId: fila.cliente_id,
      sedeId: fila.sede_id,
      validacion: {
        dispensador: {
          totActualGal: Number(fila.tot_actual_gal),
          toleranciaTandaGal: Number(fila.tolerancia_tanda_gal),
        },
        equipo: {
          tipoMedidor: fila.tipo_medidor as TipoMedidor,
          ultimaLectura: numeroONulo(fila.ultima_lectura),
          capacidadTanqueGal: numeroONulo(fila.capacidad_tanque_gal),
          ultimaCargaFinalizadaEn: fila.ultima_carga_finalizada_en ?? null,
        },
        sede: {
          lat: numeroONulo(fila.sede_lat),
          lng: numeroONulo(fila.sede_lng),
          radioGeocercaM: Number(fila.radio_geocerca_m),
        },
      },
    };
  }

  async insertarCarga(carga: NuevaCarga, fotos: NuevaFoto[]): Promise<void> {
    const cliente = await this.pool.connect();
    try {
      await cliente.query("begin");

      await cliente.query(
        `insert into cargas (
           id, cliente_id, sede_id, dispensador_id, equipo_id, conductor_id,
           tanda_inicial_gal, tot_inicial_gal, tanda_final_gal, tot_final_gal, galones,
           lectura_equipo, tipo_lectura,
           iniciada_en, finalizada_en,
           lat, lng, precision_gps_m, dentro_geocerca,
           origen, estado, banderas, gal_no_registrados,
           notas, device_id, version_app
         ) values (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11,
           $12, $13,
           $14, $15,
           $16, $17, $18, $19,
           $20, $21, $22, $23,
           $24, $25, $26
         )`,
        [
          carga.id, carga.cliente_id, carga.sede_id, carga.dispensador_id, carga.equipo_id, carga.conductor_id,
          carga.tanda_inicial_gal, carga.tot_inicial_gal, carga.tanda_final_gal, carga.tot_final_gal, carga.galones,
          carga.lectura_equipo, carga.tipo_lectura,
          carga.iniciada_en, carga.finalizada_en,
          carga.lat, carga.lng, carga.precision_gps_m, carga.dentro_geocerca,
          carga.origen, carga.estado, JSON.stringify(carga.banderas), carga.gal_no_registrados,
          carga.notas, carga.device_id, carga.version_app,
        ],
      );

      for (const foto of fotos) {
        await cliente.query(
          `insert into fotos (carga_id, momento, storage_path) values ($1, $2, $3)`,
          [foto.carga_id, foto.momento, foto.storage_path],
        );
      }

      await cliente.query("commit");
    } catch (error) {
      await cliente.query("rollback");
      throw error;
    } finally {
      cliente.release();
    }
  }
}

export class RepositorioSeguridadPostgres implements RepositorioSeguridad {
  constructor(private readonly pool: pg.Pool) {}

  async obtenerSesion(usuarioId: string): Promise<SesionAutenticada | null> {
    const resultado = await this.pool.query(
      `select u.id, u.nombre, u.cliente_id, u.sede_id, r.codigo as rol,
              coalesce(array_agg(rp.permiso_codigo) filter (where rp.permiso_codigo is not null), '{}') as permisos
       from usuarios u
       join roles r on r.id = u.rol_id
       left join rol_permisos rp on rp.rol_id = u.rol_id
       where u.id = $1 and u.activo
       group by u.id, u.nombre, u.cliente_id, u.sede_id, r.codigo`,
      [usuarioId],
    );
    const fila = resultado.rows[0];
    if (!fila) return null;
    return {
      usuarioId: fila.id,
      nombre: fila.nombre,
      rol: fila.rol,
      clienteId: fila.cliente_id,
      sedeId: fila.sede_id,
      permisos: fila.permisos,
    };
  }

  async validarCodigoEnrolamiento(codigo: string, ahora: Date): Promise<CodigoEnrolamientoValido | null> {
    const resultado = await this.pool.query(
      `select c.id, c.sede_id, s.cliente_id
       from codigos_enrolamiento c
       join sedes s on s.id = c.sede_id
       where c.codigo = $1 and c.usado_en is null and c.expira_en > $2`,
      [codigo, ahora.toISOString()],
    );
    const fila = resultado.rows[0];
    if (!fila) return null;
    return { id: fila.id, sedeId: fila.sede_id, clienteId: fila.cliente_id };
  }

  async registrarDispositivoEnrolado(datos: {
    usuarioId: string;
    codigoId: string;
    sedeId: string;
    clienteId: string;
    nombre: string | null;
  }): Promise<void> {
    const cliente = await this.pool.connect();
    try {
      await cliente.query("begin");
      await cliente.query(
        `insert into usuarios (id, cliente_id, sede_id, rol_id, nombre, activo)
         values ($1, $2, $3, (select id from roles where codigo = 'dispositivo'), $4, true)`,
        [datos.usuarioId, datos.clienteId, datos.sedeId, datos.nombre ?? "Dispositivo de planta"],
      );
      const dispositivo = await cliente.query(
        `insert into dispositivos (sede_id, usuario_id, nombre, enrolado_en, activo)
         values ($1, $2, $3, now(), true)
         returning id`,
        [datos.sedeId, datos.usuarioId, datos.nombre],
      );
      // Consumo condicionado a que siga sin usar: dos enrolamientos
      // simultáneos con el mismo código no pueden pasar ambos.
      const consumo = await cliente.query(
        `update codigos_enrolamiento
         set usado_en = now(), dispositivo_id = $2
         where id = $1 and usado_en is null`,
        [datos.codigoId, dispositivo.rows[0].id],
      );
      if (consumo.rowCount !== 1) throw new Error("código de enrolamiento ya consumido");
      await cliente.query("commit");
    } catch (error) {
      await cliente.query("rollback");
      throw error;
    } finally {
      cliente.release();
    }
  }

  async obtenerCatalogo(clienteId: string, sedeId: string | null): Promise<CatalogoSede | null> {
    const sede = await this.pool.query(
      sedeId
        ? `select id, nombre, lat, lng, radio_geocerca_m from sedes where id = $1 and cliente_id = $2`
        : `select id, nombre, lat, lng, radio_geocerca_m from sedes where cliente_id = $1 limit 1`,
      sedeId ? [sedeId, clienteId] : [clienteId],
    );
    const filaSede = sede.rows[0];
    if (!filaSede) return null;

    const [dispensadores, equipos, conductores] = await Promise.all([
      this.pool.query(
        `select id, nombre, tot_actual_gal, tolerancia_tanda_gal
         from dispensadores where sede_id = $1 and activo`,
        [filaSede.id],
      ),
      this.pool.query(
        `select id, codigo_interno, descripcion, tipo_medidor, ultima_lectura, capacidad_tanque_gal
         from equipos where cliente_id = $1 and activo order by codigo_interno`,
        [clienteId],
      ),
      this.pool.query(
        `select id, nombre, codigo, pin_hash from conductores where cliente_id = $1 and activo order by codigo`,
        [clienteId],
      ),
    ]);

    return {
      sede: {
        id: filaSede.id,
        nombre: filaSede.nombre,
        lat: numeroONulo(filaSede.lat),
        lng: numeroONulo(filaSede.lng),
        radio_geocerca_m: Number(filaSede.radio_geocerca_m),
      },
      dispensadores: dispensadores.rows.map((d) => ({
        id: d.id,
        nombre: d.nombre,
        tot_actual_gal: Number(d.tot_actual_gal),
        tolerancia_tanda_gal: Number(d.tolerancia_tanda_gal),
      })),
      equipos: equipos.rows.map((e) => ({
        id: e.id,
        codigo_interno: e.codigo_interno,
        descripcion: e.descripcion,
        tipo_medidor: e.tipo_medidor,
        ultima_lectura: numeroONulo(e.ultima_lectura),
        capacidad_tanque_gal: numeroONulo(e.capacidad_tanque_gal),
      })),
      conductores: conductores.rows,
    };
  }
}
