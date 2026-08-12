// Contrato de persistencia de la API. La implementación real es
// Postgres (Supabase como infraestructura, DEC-009); las pruebas usan
// un repositorio en memoria.

import type {
  Bandera,
  CodigoPerfil,
  ContextoInventario,
  ContextoValidacion,
  EstadoCarga,
} from "@cuadreapp/dominio";

/** Contexto resuelto por la base para validar un registro. Además de los
 *  datos de validación trae los ids que el cliente NO manda (cliente_id
 *  y sede_id se derivan del dispensador en el servidor, nunca se confía
 *  en el cliente para el tenant). */
export interface ContextoRegistro {
  clienteId: string;
  sedeId: string;
  validacion: ContextoValidacion;
}

/** Contexto del perfil «Carga sobre Inventario» (DEC-016): sin
 *  dispensador, la sede viene de la sesión del dispositivo y el equipo
 *  y el conductor deben pertenecer al cliente de esa sede. */
export interface ContextoRegistroInventario {
  clienteId: string;
  sedeId: string;
  validacion: ContextoInventario;
}

/** Resumen de una carga ya persistida (para la respuesta idempotente). */
export interface CargaPersistida {
  id: string;
  estado: EstadoCarga;
  banderas: Bandera[];
  galones: number;
  galNoRegistrados: number | null;
  /** Solo perfil carga_inventario; null en medidor_doble. */
  llegadaGal: number | null;
  inventarioFinalGal: number | null;
}

/** Fila lista para insertar en `cargas`. Los nombres siguen las columnas.
 *  Las columnas del medidor son propias del perfil medidor_doble y
 *  llegada_gal del perfil carga_inventario — el CHECK de la base exige
 *  la forma exacta por perfil. inventario_final_gal NO está aquí: es
 *  una columna generada, jamás la escribe la aplicación. */
export interface NuevaCarga {
  id: string;
  perfil_codigo: CodigoPerfil;
  cliente_id: string;
  sede_id: string;
  dispensador_id: string | null;
  equipo_id: string;
  conductor_id: string;
  tanda_inicial_gal: number | null;
  tot_inicial_gal: number | null;
  tanda_final_gal: number | null;
  tot_final_gal: number | null;
  /** Galones despachados por Lubryco — misma semántica en todo perfil. */
  galones: number;
  llegada_gal: number | null;
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
  /** Perfil carga_inventario: la sede viene de la sesión; null si la
   *  sede no existe o el equipo/conductor no son de su cliente o están
   *  inactivos. */
  obtenerContextoInventario(referencias: {
    sedeId: string;
    equipoId: string;
    conductorId: string;
  }): Promise<ContextoRegistroInventario | null>;
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
  /** Identidad del cliente (DEC-017). logo_clave es la clave del
   *  objeto en el bucket privado — la ruta HTTP la convierte en URL
   *  firmada antes de responder; la clave nunca sale al cliente. */
  cliente: {
    id: string;
    nombre: string;
    nombre_comercial: string | null;
    /** Identidad corporativa (DEC-018): #RRGGBB; el resto lo deriva el Design System. */
    color_primario: string | null;
    color_secundario: string | null;
    logo_clave: string | null;
  };
  /** Perfil Operativo del cliente (DEC-016): decide el flujo de la PWA. */
  perfil: { codigo: CodigoPerfil; nombre: string };
  sede: {
    id: string;
    nombre: string;
    /** «Planta Buga, Valle del Cauca» = nombre + ciudad (identidad visible). */
    ciudad: string | null;
    direccion: string | null;
    lat: number | null;
    lng: number | null;
    radio_geocerca_m: number;
  };
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
  /** P0.4: true SOLO si la fila existe y está desactivada — el login
   *  le dice «tu acceso está desactivado» a quien fue revocado, nunca
   *  a quien simplemente no está en el RBAC. */
  usuarioEstaDesactivado(usuarioId: string): Promise<boolean>;
  /** Sella el último login exitoso (Etapa P.2). Es lo que permite a la
   *  consola responder «¿esta cuenta se usa?» antes de revocarla. Se
   *  invoca solo en /api/v1/auth/login, jamás por petición. */
  registrarAcceso(usuarioId: string, cuandoIso: string): Promise<void>;
  /** P0.1: la persona definió su contraseña propia — la temporal deja
   *  de gobernar el ingreso al tablero. */
  marcarPasswordDefinitiva(usuarioId: string): Promise<void>;
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
