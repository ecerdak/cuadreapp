// Contrato de persistencia de la API. La implementación real es
// Postgres (Supabase como infraestructura, DEC-009); las pruebas usan
// un repositorio en memoria.

import type { Bandera, ContextoValidacion, EstadoCarga } from "@cuadreapp/dominio";

/** Contexto resuelto por la base para validar un registro. Además de los
 *  datos de validación trae los ids que el cliente NO manda (cliente_id
 *  y sede_id se derivan del dispensador en el servidor, nunca se confía
 *  en el cliente para el tenant). */
export interface ContextoRegistro {
  clienteId: string;
  sedeId: string;
  validacion: ContextoValidacion;
}

/** Resumen de una carga ya persistida (para la respuesta idempotente). */
export interface CargaPersistida {
  id: string;
  estado: EstadoCarga;
  banderas: Bandera[];
  galones: number;
  galNoRegistrados: number | null;
}

/** Fila lista para insertar en `cargas`. Los nombres siguen las columnas. */
export interface NuevaCarga {
  id: string;
  cliente_id: string;
  sede_id: string;
  dispensador_id: string;
  equipo_id: string;
  conductor_id: string;
  tanda_inicial_gal: number;
  tot_inicial_gal: number;
  tanda_final_gal: number;
  tot_final_gal: number;
  galones: number;
  lectura_equipo: number | null;
  tipo_lectura: string | null;
  iniciada_en: string;
  finalizada_en: string;
  lat: number | null;
  lng: number | null;
  precision_gps_m: number | null;
  dentro_geocerca: boolean | null;
  origen: string;
  estado: EstadoCarga;
  banderas: Bandera[];
  gal_no_registrados: number | null;
  notas: string | null;
  device_id: string | null;
  version_app: string | null;
}

export interface NuevaFoto {
  carga_id: string;
  momento: "inicial" | "final";
  storage_path: string;
}

export interface RepositorioCargas {
  buscarCargaPorId(id: string): Promise<CargaPersistida | null>;
  /** null si el dispensador, el equipo o el conductor no existen, están
   *  inactivos, o no pertenecen todos al mismo cliente. */
  obtenerContextoRegistro(referencias: {
    dispensadorId: string;
    equipoId: string;
    conductorId: string;
  }): Promise<ContextoRegistro | null>;
  insertarCarga(carga: NuevaCarga, fotos: NuevaFoto[]): Promise<void>;
}
