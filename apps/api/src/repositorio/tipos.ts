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

// ============ Seguridad e identidad (Etapa S) ============

import type { SesionAutenticada } from "../seguridad/tipos.js";

export interface CodigoEnrolamientoValido {
  id: string;
  sedeId: string;
  clienteId: string;
}

export interface CatalogoSede {
  sede: { id: string; nombre: string; lat: number | null; lng: number | null; radio_geocerca_m: number };
  dispensadores: Array<{
    id: string;
    nombre: string;
    tot_actual_gal: number;
    tolerancia_tanda_gal: number;
  }>;
  equipos: Array<{
    id: string;
    codigo_interno: string;
    descripcion: string | null;
    tipo_medidor: string;
    ultima_lectura: number | null;
    capacidad_tanque_gal: number | null;
  }>;
  /** Incluye pin_hash (bcrypt) para la verificación offline en el
   *  dispositivo enrolado — decisión aprobada en la Etapa S: el PIN
   *  identifica, no protege (spec §5). */
  conductores: Array<{ id: string; nombre: string; codigo: string; pin_hash: string }>;
}

export interface RepositorioSeguridad {
  /** Resuelve identidad + rol + alcance + permisos del RBAC propio.
   *  null si el usuario no existe o está inactivo. */
  obtenerSesion(usuarioId: string): Promise<SesionAutenticada | null>;
  /** null si el código no existe, expiró o ya fue usado. */
  validarCodigoEnrolamiento(codigo: string, ahora: Date): Promise<CodigoEnrolamientoValido | null>;
  /** Crea usuarios (rol dispositivo) + dispositivos y consume el código. */
  registrarDispositivoEnrolado(datos: {
    usuarioId: string;
    codigoId: string;
    sedeId: string;
    clienteId: string;
    nombre: string | null;
  }): Promise<void>;
  obtenerCatalogo(clienteId: string, sedeId: string | null): Promise<CatalogoSede | null>;
}
