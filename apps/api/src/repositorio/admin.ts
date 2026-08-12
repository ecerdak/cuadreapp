// Contrato de persistencia del módulo Admin (piloto Sacyr). CRUD de
// catálogos y lecturas operativas — cero reglas de negocio (DEC-011).
// Implementación real: Postgres; pruebas: fake en memoria.

import type { Bandera, CodigoPerfil, EstadoCarga } from "@cuadreapp/dominio";

/** Fila del catálogo perfiles_operativos (DEC-016). */
export interface PerfilOperativoAdmin {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface ClienteAdmin {
  id: string;
  /** Razón social. */
  nombre: string;
  /** Identidad corporativa (DEC-018). */
  nombreComercial: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  nit: string | null;
  activo: boolean;
  sedes: number;
  /** Para la advertencia de cambio de perfil con historia (DEC-016). */
  cargas: number;
  perfilCodigo: CodigoPerfil;
  /** Clave del objeto en el bucket privado de logos (DEC-017). Las
   *  rutas HTTP la convierten en URL firmada — jamás sale tal cual. */
  logoClave: string | null;
}

export interface SedeAdmin {
  id: string;
  clienteId: string;
  nombre: string;
  ciudad: string | null;
  direccion: string | null;
  referencia: string | null;
  activo: boolean;
  lat: number | null;
  lng: number | null;
  radioGeocercaM: number;
  dispensadores: Array<{ id: string; nombre: string; totActualGal: number }>;
}

export interface EquipoAdmin {
  id: string;
  clienteId: string;
  clienteNombre: string;
  /** DEC-018: null = todas las sedes del cliente. */
  sedeId: string | null;
  sedeNombre: string | null;
  codigoInterno: string;
  descripcion: string | null;
  categoria: string | null;
  tipoMedidor: string;
  capacidadTanqueGal: number | null;
  activo: boolean;
}

export interface OperadorAdmin {
  id: string;
  clienteId: string;
  clienteNombre: string;
  /** DEC-018: null = opera en todas las sedes del cliente. */
  sedeId: string | null;
  sedeNombre: string | null;
  nombre: string;
  codigo: string;
  activo: boolean;
  /** Último acceso operativo = su última carga registrada. */
  ultimaCargaEn: string | null;
}

export interface DispositivoAdmin {
  id: string;
  usuarioId: string;
  sedeId: string;
  sedeNombre: string;
  clienteNombre: string;
  nombre: string | null;
  enroladoEn: string;
  ultimoVistoEn: string | null;
  activo: boolean;
}

export interface CodigoAdmin {
  id: string;
  sedeId: string;
  sedeNombre: string;
  clienteNombre: string;
  codigo: string;
  expiraEn: string;
  usadoEn: string | null;
}

export interface CargaAdmin {
  id: string;
  registradaEn: string;
  clienteNombre: string;
  sedeNombre: string;
  equipoCodigo: string;
  operadorNombre: string;
  /** Galones despachados por Lubryco — todo perfil (DEC-016). */
  galones: number;
  /** Snapshot del perfil con el que nació la carga. */
  perfilCodigo: string;
  /** Solo carga_inventario; null en medidor_doble. */
  llegadaGal: number | null;
  inventarioFinalGal: number | null;
  duracionS: number;
  estado: EstadoCarga;
  banderas: Bandera[];
  notas: string | null;
  fotos: Array<{ momento: string; ruta: string }>;
}

export interface ResumenAdmin {
  clientesActivos: number;
  equiposActivos: number;
  operadoresActivos: number;
  dispositivosEnrolados: number;
  cargasHoy: number;
  galonesHoy: number;
  /** Cargas de hoy que no cuadran + dispositivos activos sin señal >24 h. */
  alertas: Array<{ tipo: "carga_no_cuadra" | "dispositivo_sin_senal"; mensaje: string }>;
}

export interface TableroCliente {
  clienteId: string;
  clienteNombre: string;
  hoy: {
    cargas: number;
    galones: number;
    duracionPromedioS: number | null;
    operadores: string[];
    ultimaCargaEn: string | null;
  };
  porEquipo: Array<{
    equipoCodigo: string;
    descripcion: string | null;
    cargas: number;
    galones: number;
    ultimaCargaEn: string | null;
  }>;
  historial: CargaAdmin[];
}

/** Persona con acceso al Dashboard de UN cliente (Etapa P.2).
 *
 *  No confundir con un operador de campo: los operadores viven en
 *  `conductores`, se identifican con código+PIN dentro de la app y no
 *  tienen sesión. Estos son usuarios de Auth con correo y contraseña.
 *  Una misma persona puede ser ambas cosas sin que las filas se
 *  relacionen — son dominios distintos a propósito. */
export interface AccesoDashboardAdmin {
  usuarioId: string;
  nombre: string;
  email: string | null;
  /** `supervisor` o `admin_cliente`: los dos roles con tablero.leer. */
  rol: string;
  /** null = ve todas las sedes de su cliente (DEC-018). */
  sedeId: string | null;
  sedeNombre: string | null;
  activo: boolean;
  creadoEn: string;
  /** null = la cuenta nunca se ha usado. */
  ultimoAccesoEn: string | null;
}

/** Roles que pueden entrar al Dashboard. Son los mismos a los que
 *  20260805120000_tablero_cliente otorga `tablero.leer`: la consola no
 *  puede inventar uno que el RBAC no reconozca. */
export const ROLES_DASHBOARD = ["supervisor", "admin_cliente"] as const;
export type RolDashboard = (typeof ROLES_DASHBOARD)[number];

export interface RepositorioAdmin {
  resumen(inicioHoyIso: string, ahoraIso: string): Promise<ResumenAdmin>;
  listarCargas(filtro: { clienteId?: string; limite: number }): Promise<CargaAdmin[]>;

  /** Catálogo de Perfiles Operativos (DEC-016), para el selector. */
  listarPerfiles(): Promise<PerfilOperativoAdmin[]>;

  listarClientes(buscar?: string): Promise<ClienteAdmin[]>;
  crearCliente(datos: {
    nombre: string;
    nombreComercial: string | null;
    colorPrimario: string | null;
    colorSecundario: string | null;
    nit: string | null;
    perfilCodigo: CodigoPerfil;
  }): Promise<ClienteAdmin>;
  editarCliente(
    id: string,
    cambios: {
      nombre?: string;
      nombreComercial?: string | null;
      colorPrimario?: string | null;
      colorSecundario?: string | null;
      nit?: string | null;
      activo?: boolean;
      perfilCodigo?: CodigoPerfil;
    },
  ): Promise<ClienteAdmin | null>;
  /** Registra la clave del logo (DEC-017); devuelve la anterior para
   *  que la ruta borre el objeto viejo si cambió de extensión. */
  guardarLogoCliente(
    id: string,
    clave: string,
  ): Promise<{ cliente: ClienteAdmin; claveAnterior: string | null } | null>;
  quitarLogoCliente(id: string): Promise<{ cliente: ClienteAdmin; claveAnterior: string | null } | null>;

  listarSedes(clienteId: string): Promise<SedeAdmin[]>;
  /** dispensador null: sedes de perfiles sin medidor (carga_inventario)
   *  no requieren dispensador ni totalizador inicial. */
  crearSede(datos: {
    clienteId: string;
    nombre: string;
    ciudad: string | null;
    direccion: string | null;
    referencia: string | null;
    lat: number | null;
    lng: number | null;
    radioGeocercaM: number;
    dispensador: { nombre: string; totInstalacionGal: number } | null;
  }): Promise<SedeAdmin>;
  editarSede(
    id: string,
    cambios: {
      nombre?: string;
      ciudad?: string | null;
      direccion?: string | null;
      referencia?: string | null;
      lat?: number | null;
      lng?: number | null;
      radioGeocercaM?: number;
      activo?: boolean;
    },
  ): Promise<SedeAdmin | null>;

  listarEquipos(filtro: { clienteId?: string; buscar?: string }): Promise<EquipoAdmin[]>;
  crearEquipo(datos: {
    clienteId: string;
    sedeId: string | null;
    codigoInterno: string;
    qrToken: string;
    descripcion: string | null;
    categoria: string | null;
    tipoMedidor: string;
    capacidadTanqueGal: number | null;
  }): Promise<EquipoAdmin>;
  editarEquipo(
    id: string,
    cambios: {
      sedeId?: string | null;
      codigoInterno?: string;
      descripcion?: string | null;
      categoria?: string | null;
      tipoMedidor?: string;
      capacidadTanqueGal?: number | null;
      activo?: boolean;
    },
  ): Promise<EquipoAdmin | null>;

  listarOperadores(filtro: { clienteId?: string; buscar?: string }): Promise<OperadorAdmin[]>;
  crearOperador(datos: {
    clienteId: string;
    sedeId: string | null;
    nombre: string;
    codigo: string;
    pinHash: string;
  }): Promise<OperadorAdmin>;
  editarOperador(
    id: string,
    cambios: {
      sedeId?: string | null;
      nombre?: string;
      codigo?: string;
      pinHash?: string;
      activo?: boolean;
    },
  ): Promise<OperadorAdmin | null>;

  listarCodigos(filtro: { sedeId?: string }): Promise<CodigoAdmin[]>;
  crearCodigo(datos: { sedeId: string; codigo: string; expiraEn: string }): Promise<CodigoAdmin>;

  listarDispositivos(): Promise<DispositivoAdmin[]>;
  /** Desactiva el dispositivo Y su usuario técnico (la API rechaza
   *  sesiones de usuarios inactivos: revocación efectiva). */
  desactivarDispositivo(id: string): Promise<DispositivoAdmin | null>;

  tableroCliente(
    clienteId: string,
    inicioHoyIso: string,
    desdeHistorialIso: string,
  ): Promise<TableroCliente | null>;

  /* ============ Accesos al Dashboard (Etapa P.2) ============ */

  /** Los usuarios del Dashboard de UN cliente. El clienteId lo fija la
   *  ruta con el alcance del administrador — nunca el navegador. */
  listarAccesosDashboard(clienteId: string): Promise<AccesoDashboardAdmin[]>;

  /** Inserta la fila de `usuarios` para una identidad de Auth YA
   *  creada. `usuarioId` es el id de auth.users (la PK es compartida).
   *  Lanza ConflictoUnicidad si el correo ya está tomado. */
  crearAccesoDashboard(datos: {
    usuarioId: string;
    clienteId: string;
    sedeId: string | null;
    rol: RolDashboard;
    nombre: string;
    email: string;
  }): Promise<AccesoDashboardAdmin>;

  /** Edita un acceso comprobando que pertenezca al cliente indicado:
   *  el filtro por cliente es parte de la escritura, no una validación
   *  previa que se pueda olvidar. null = no existe en ese cliente. */
  editarAccesoDashboard(
    clienteId: string,
    usuarioId: string,
    cambios: { nombre?: string; sedeId?: string | null; rol?: RolDashboard; activo?: boolean },
  ): Promise<AccesoDashboardAdmin | null>;

  /** Comprueba pertenencia antes de tocar la identidad en Auth. */
  accesoDashboardDeCliente(clienteId: string, usuarioId: string): Promise<AccesoDashboardAdmin | null>;

  /** P0.1: la consola regeneró la contraseña — vuelve a ser temporal y
   *  el tablero exigirá definir una propia en el siguiente ingreso. */
  marcarPasswordTemporal(clienteId: string, usuarioId: string): Promise<void>;
}

/** Violación de unicidad (Postgres 23505) traducida a un error propio. */
export class ConflictoUnicidad extends Error {
  constructor() {
    super("CONFLICTO");
  }
}
