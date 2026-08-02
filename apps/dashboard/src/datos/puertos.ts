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
  consumo14d: Array<{ fecha: string; galones: number }>;
  cargasDeHoy: CargaResumen[];
}

export interface FiltroCargas {
  estado?: EstadoCarga | "todas";
}

export interface PaginaCargas {
  veredicto: Veredicto;
  total: number;
  cuadran: number;
  cargas: CargaResumen[];
}

export interface CandadoDetalle {
  nombre: string;
  descripcion: string;
  cumple: boolean;
}

export interface DetalleCarga {
  resumen: CargaResumen;
  lecturas: { tandaInicial: number; totInicial: number; tandaFinal: number; totFinal: number };
  lecturaEquipo: number | null;
  tipoLectura: string | null;
  duracionSegundos: number;
  candados: CandadoDetalle[];
  galNoRegistrados: number | null;
  notas: string | null;
  fotos: { inicial: string | null; final: string | null }; // urls (en esta fase, data-uris)
}

export interface EquipoResumen {
  codigo: string;
  descripcion: string;
  galones7d: number;
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
}

export interface ResumenSuministro {
  veredicto: Veredicto;
  entregas: EntregaResumen[];
  entregadoTotalGal: number;
  despachadoTotalGal: number;
  existenciaEstimadaGal: number;
  autonomiaDias: number;
  proximaEntregaSugerida: string; // YYYY-MM-DD
}

export interface FuenteDatosTablero {
  resumenHoy(): Promise<ResumenHoy>;
  listarCargas(filtro: FiltroCargas): Promise<PaginaCargas>;
  detalleCarga(id: string): Promise<DetalleCarga>;
  resumenEquipos(): Promise<ResumenEquipos>;
  resumenSuministro(): Promise<ResumenSuministro>;
}
