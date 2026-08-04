// EL CONTRATO de la capa de datos del tablero. Los componentes solo
// conocen esta interfaz y estos modelos de lectura — jamás la fuente
// concreta. Cuando el tablero se conecte a la API, este contrato se
// convierte, método a método, en el de los endpoints /api/v1/tablero/*.

import type { Bandera, EstadoCarga } from "@cuadreapp/dominio";
import type { TonoVeredicto } from "../tema";

export interface Veredicto {
  tono: TonoVeredicto;
  titulo: string;
  detalle?: string;
}

export interface CargaResumen {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  equipoCodigo: string;
  equipoDescripcion: string;
  conductorNombre: string;
  galones: number;
  estado: EstadoCarga;
  banderas: Bandera[];
}

export interface ResumenHoy {
  veredicto: Veredicto;
  existenciaEstimadaGal: number;
  autonomiaDias: number;
  totalizadorGal: number;
  /** Desglose del panel del totalizador (diseño aprobado). */
  entregadoTotalGal: number;
  despachadoTotalGal: number;
  consumoDiarioGal: number;
  /** Galones despachados sin equipo asignado (saltos del totalizador). */
  galSinRegistrarGal: number;
  consumo14d: Array<{ fecha: string; galones: number; parcial?: boolean }>;
  cargasDeHoy: CargaResumen[];
}

export interface FiltroCargas {
  estado?: EstadoCarga | "todas";
}

export interface PaginaCargas {
  veredicto: Veredicto;
  total: number;
  cuadran: number;
  /** Hechos de la ZonaA del diseño aprobado. */
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
  /** Perfil Medidor Doble; null cuando la carga es de otro perfil. */
  lecturas: {
    tandaInicial: number;
    totInicial: number;
    tandaFinal: number;
    totFinal: number;
  } | null;
  /** Perfil «Carga sobre Inventario» (DEC-016); null en Medidor Doble.
   *  Cada carga se muestra según SU perfil (snapshot), no el del cliente. */
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
  fotos: { inicial: string | null; final: string | null }; // urls (en esta fase, data-uris)
}

/** Identidad visual del cliente (DEC-017): viaja por DATOS desde la
 *  fuente — jamás hardcodeada por nombre de cliente. En la fase
 *  simulada la provee FuenteSimulada; al conectar, la API. */
export interface IdentidadTablero {
  /** Razón social. */
  clienteNombre: string;
  /** Nombre comercial (corto), el visible en el marco. */
  clienteCorto: string;
  sedeVisible: string;
  /** null = fallback a iniciales, nunca una imagen rota. */
  logoUrl: string | null;
  /** Identidad corporativa (DEC-018): la UI deriva el resto del
   *  Design System; null = paleta CuadreApp. */
  colorPrimario: string | null;
  colorSecundario: string | null;
  perfil: { codigo: string; nombre: string };
  /** Solo perfiles con medidor; null para Carga sobre Inventario. */
  medidor: { modelo: string; instalado: string } | null;
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
}

export interface ResumenEquipos {
  veredicto: Veredicto;
  equipos: EquipoResumen[];
}

export interface EntregaResumen {
  numeroRemision: string;
  fecha: string;
  galones: number;
  placaCarrotanque: string;
  recibidoPor: string;
}

export interface ResumenSuministro {
  veredicto: Veredicto;
  entregas: EntregaResumen[];
  entregadoTotalGal: number;
  despachadoTotalGal: number;
  existenciaEstimadaGal: number;
  autonomiaDias: number;
  proximaEntregaSugerida: string; // YYYY-MM-DD
  /** Pedido sugerido para hoy, en galones (diseño aprobado). */
  pedidoSugeridoGal: number;
}

export interface FuenteDatosTablero {
  identidad(): Promise<IdentidadTablero>;
  resumenHoy(): Promise<ResumenHoy>;
  listarCargas(filtro: FiltroCargas): Promise<PaginaCargas>;
  detalleCarga(id: string): Promise<DetalleCarga>;
  resumenEquipos(): Promise<ResumenEquipos>;
  resumenSuministro(): Promise<ResumenSuministro>;
}
