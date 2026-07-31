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
  ContextoRegistro,
  NuevaCarga,
  NuevaFoto,
  RepositorioCargas,
} from "./tipos.js";
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
