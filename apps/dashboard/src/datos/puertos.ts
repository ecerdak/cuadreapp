// EL CONTRATO de la capa de datos del tablero. Los componentes solo
// conocen esta interfaz y estos modelos de lectura — jamás la fuente
// concreta ni el nombre de una empresa.
//
// Etapa P.2: el contrato es el de los endpoints /api/v1/tablero/*,
// método a método, con una diferencia deliberada — la API devuelve
// HECHOS (conteos, totales, estados) y el adaptador compone el
// veredicto. La frase que lee el supervisor es copia de producto: vive
// con la interfaz, no en el servidor.

import type { Bandera, CodigoPerfil, ComposicionTablero, EstadoCarga } from "@cuadreapp/dominio";
import type { TonoVeredicto } from "../tema";

export interface Veredicto {
  tono: TonoVeredicto;
  titulo: string;
  detalle?: string;
}

/** Sede sobre la que se consulta. null = todas las del alcance. */
export interface AlcanceConsulta {
  sedeId: string | null;
}

/* ============ Contexto: quién es la empresa ============ */

/** Lo que el login resuelve: identidad, perfil, alcance y permisos.
 *  TODO viaja por datos (DEC-017/DEC-018) — el código jamás nombra a
 *  un cliente ni conoce su configuración de antemano. */
export interface ContextoTablero {
  usuario: { nombre: string; rol: string };
  permisos: string[];
  cliente: {
    id: string;
    /** Razón social. */
    nombre: string;
    /** Nombre comercial (corto); null = se usa la razón social. */
    nombreComercial: string | null;
    /** Identidad corporativa (DEC-018): la UI deriva el resto del
     *  Design System; null = paleta CuadreApp. */
    colorPrimario: string | null;
    colorSecundario: string | null;
    /** URL firmada temporal; null = fallback a iniciales. */
    logoUrl: string | null;
  };
  /** Perfil Operativo con la composición que declara el dominio. */
  perfil: { codigo: CodigoPerfil; nombre: string } & ComposicionTablero;
  sedes: Array<{ id: string; nombre: string; ciudad: string | null }>;
  /** Sede fija de la sesión; null = el usuario ve todas las suyas. */
  sedeActual: string | null;
  /** Solo perfiles con medidor. */
  medidor: { modelo: string; instalado: string } | null;
}

/* ============ Modelos de lectura ============ */

export interface CargaResumen {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  equipoCodigo: string;
  equipoDescripcion: string;
  conductorNombre: string;
  /** Galones despachados por Lubryco — misma semántica en todo perfil. */
  galones: number;
  estado: EstadoCarga;
  banderas: Bandera[];
  /** Snapshot del perfil con el que nació la carga (DEC-016): la
   *  historia se muestra como se capturó, jamás reinterpretada. */
  perfilCodigo: CodigoPerfil;
  llegadaGal: number | null;
  inventarioFinalGal: number | null;
  capacidadEquipoGal: number | null;
  /** Tamaño del salto del totalizador, si lo hubo. */
  galNoRegistrados: number | null;
}

/** Balance del combustible. Las cifras estimadas van en null cuando no
 *  hay línea base (sin entregas registradas): el tablero muestra «—»
 *  antes que un número que el supervisor no pueda auditar. */
export interface Balance {
  entregadoTotalGal: number;
  despachadoTotalGal: number;
  consumoDiarioGal: number;
  existenciaEstimadaGal: number | null;
  autonomiaDias: number | null;
}

export interface InventarioHoy {
  recibidoGal: number;
  despachadoGal: number;
  totalSalidaGal: number;
  capacidadGal: number | null;
  /** Porcentaje de llenado; null sin capacidad configurada. */
  llenadoPct: number | null;
}

export interface ResumenHoy {
  /** false = el alcance no registró NINGUNA carga en su historia: el
   *  tablero muestra la bienvenida, no paneles en cero (P0.6). */
  tieneCargas: boolean;
  veredicto: Veredicto;
  /** Totalizador del medidor; null en perfiles sin medidor o cuando el
   *  alcance abarca varias sedes (sumarlos no significaría nada). */
  totalizadorGal: number | null;
  /** Galones despachados sin equipo asignado (saltos del totalizador). */
  galSinRegistrarGal: number;
  balance: Balance;
  inventarioHoy: InventarioHoy;
  consumo14d: Array<{ fecha: string; galones: number; parcial?: boolean }>;
  cargasDeHoy: CargaResumen[];
}

export interface FiltroCargas extends AlcanceConsulta {
  estado?: EstadoCarga | "todas";
}

export interface PaginaCargas {
  veredicto: Veredicto;
  total: number;
  cuadran: number;
  galSinRegistrarGal: number;
  sinFotoFinal: number;
  cargas: CargaResumen[];
}

export interface CandadoDetalle {
  nombre: string;
  descripcion: string;
  cumple: boolean;
}

export interface DetalleCarga {
  resumen: CargaResumen;
  /** Perfiles con medidor; null cuando la carga es de otro perfil. */
  lecturas: {
    tandaInicial: number;
    totInicial: number;
    tandaFinal: number;
    totFinal: number;
  } | null;
  /** Perfiles de carga sobre inventario; null en los de medidor. */
  inventario: {
    llegadaGal: number;
    despachadosGal: number;
    totalSalidaGal: number;
  } | null;
  lecturaEquipo: number | null;
  tipoLectura: string | null;
  duracionSegundos: number;
  candados: CandadoDetalle[];
  galNoRegistrados: number | null;
  notas: string | null;
  fotos: { inicial: string | null; final: string | null };
}

export interface EquipoResumen {
  codigo: string;
  descripcion: string;
  categoria: string;
  galones7d: number;
  /** Uso registrado del período, ya formateado ("90,5 h" / "1.185 km"). */
  uso: string | null;
  medida: "gal/h" | "gal/km" | null;
  rendimiento: number | null;
  desvioPct: number | null;
  capacidadTanqueGal: number | null;
  ultimoInventarioGal: number | null;
  llenadoPct: number | null;
}

export interface ResumenEquipos {
  veredicto: Veredicto;
  equipos: EquipoResumen[];
}

export interface EntregaResumen {
  numeroRemision: string;
  fecha: string;
  galones: number;
  placaCarrotanque: string | null;
  recibidoPor: string | null;
}

export interface ResumenSuministro {
  veredicto: Veredicto;
  entregas: EntregaResumen[];
  balance: Balance;
  /** null sin línea base de existencia (no hay qué proyectar). */
  proximaEntregaSugerida: string | null;
  pedidoSugeridoGal: number | null;
}

export interface FuenteDatosTablero {
  /** Resuelve la empresa de la sesión. Es lo primero que carga el
   *  tablero: sin contexto no hay identidad, ni perfil, ni módulos. */
  contexto(): Promise<ContextoTablero>;
  resumenHoy(alcance: AlcanceConsulta): Promise<ResumenHoy>;
  listarCargas(filtro: FiltroCargas): Promise<PaginaCargas>;
  detalleCarga(id: string): Promise<DetalleCarga>;
  resumenEquipos(alcance: AlcanceConsulta): Promise<ResumenEquipos>;
  resumenSuministro(alcance: AlcanceConsulta): Promise<ResumenSuministro>;
}
