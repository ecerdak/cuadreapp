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
  nombre: string;
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

export interface RepositorioAdmin {
  resumen(inicioHoyIso: string, ahoraIso: string): Promise<ResumenAdmin>;
  listarCargas(filtro: { clienteId?: string; limite: number }): Promise<CargaAdmin[]>;

  /** Catálogo de Perfiles Operativos (DEC-016), para el selector. */
  listarPerfiles(): Promise<PerfilOperativoAdmin[]>;

  listarClientes(buscar?: string): Promise<ClienteAdmin[]>;
  crearCliente(datos: {
    nombre: string;
    nit: string | null;
    perfilCodigo: CodigoPerfil;
  }): Promise<ClienteAdmin>;
  editarCliente(
    id: string,
    cambios: { nombre?: string; nit?: string | null; activo?: boolean; perfilCodigo?: CodigoPerfil },
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
    nombre: string;
    codigo: string;
    pinHash: string;
  }): Promise<OperadorAdmin>;
  editarOperador(
    id: string,
    cambios: { nombre?: string; codigo?: string; pinHash?: string; activo?: boolean },
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
}

/** Violación de unicidad (Postgres 23505) traducida a un error propio. */
export class ConflictoUnicidad extends Error {
  constructor() {
    super("CONFLICTO");
  }
}
