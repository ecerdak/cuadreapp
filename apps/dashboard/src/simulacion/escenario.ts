// Escenario de demostración determinista. Dos propiedades no
// negociables, heredadas del mockup aprobado:
//   1. La aritmética CIERRA: las tandas suman el totalizador y los
//      galones por equipo suman el despachado. Si alguien saca la
//      calculadora en la reunión, cuadra.
//   2. Los estados y banderas NO se inventan: cada carga simulada pasa
//      por validarCarga de @cuadreapp/dominio con su contexto encadenado
//      — ni los datos falsos reinterpretan reglas (DEC-011).
// Incluye a propósito: un salto de totalizador HOY (inconsistente), una
// tanda sin resetear ayer (advertencia) y una carga sin GPS (info).

import { validarCarga, type Bandera, type EstadoCarga, type TipoMedidor } from "@cuadreapp/dominio";

export const HOY_SIMULADO = "2026-08-01";
export const TOT_INSTALACION_GAL = 1200.0;
export const EXISTENCIA_INICIAL_GAL = 600.0;

export interface EquipoSimulado {
  codigo: string;
  descripcion: string;
  categoria: string;
  tipoMedidor: TipoMedidor;
  capacidadTanqueGal: number;
  lecturaInicial: number;
  /** Rendimiento histórico (gal/h u gal/km) contra el que se calcula el desvío. */
  medianaHistorica: number;
}

export const EQUIPOS_SIMULADOS: EquipoSimulado[] = [
  {
    codigo: "T-01",
    descripcion: "Tractor Massey Ferguson 4275",
    categoria: "Tractor",
    tipoMedidor: "horometro",
    capacidadTanqueGal: 80,
    lecturaInicial: 2310.0,
    medianaHistorica: 6.0,
  },
  {
    codigo: "T-04",
    descripcion: "Tractor Massey Ferguson 4292",
    categoria: "Tractor",
    tipoMedidor: "horometro",
    capacidadTanqueGal: 80,
    lecturaInicial: 1086.5,
    medianaHistorica: 6.4,
  },
  {
    codigo: "AL-01",
    descripcion: "Alzadora Bell 1745",
    categoria: "Alzadora",
    tipoMedidor: "horometro",
    capacidadTanqueGal: 100,
    lecturaInicial: 5120.0,
    medianaHistorica: 8.8,
  },
  {
    codigo: "C-01",
    descripcion: "Camión Kodiak",
    categoria: "Camión",
    tipoMedidor: "odometro",
    capacidadTanqueGal: 150,
    lecturaInicial: 184200.0,
    medianaHistorica: 0.34,
  },
  {
    codigo: "P-01",
    descripcion: "Pickup Toyota Hilux",
    categoria: "Pickup",
    tipoMedidor: "odometro",
    capacidadTanqueGal: 60,
    lecturaInicial: 96500.0,
    medianaHistorica: 0.11,
  },
];

const CONDUCTORES = ["Duván Bonilla", "Jhon Cortés", "María Fernanda Ríos", "Aníbal Rengifo"];

export interface CargaSimulada {
  id: string;
  fecha: string;
  hora: string;
  equipoCodigo: string;
  equipoDescripcion: string;
  conductorNombre: string;
  tandaInicial: number;
  totInicial: number;
  tandaFinal: number;
  totFinal: number;
  galones: number;
  lecturaEquipo: number;
  deltaLectura: number;
  duracionSegundos: number;
  estado: EstadoCarga;
  banderas: Bandera[];
  galNoRegistrados: number | null;
  notas: string | null;
}

interface Spec {
  diasAtras: number;
  hora: string;
  eq: string;
  gal: number;
  delta: number; // avance del horómetro/odómetro desde la carga anterior del equipo
  salto?: number; // gal que "alguien cargó sin registrar" antes de esta carga
  tandaInicial?: number; // ≠ 0 → no resetearon
  sinGps?: boolean;
  nota?: string;
}

// 14 días de operación, 2 turnos de conductores, aritmética encadenada.
const SPECS: Spec[] = [
  { diasAtras: 13, hora: "06:10", eq: "T-01", gal: 38.5, delta: 6.5 },
  { diasAtras: 13, hora: "07:05", eq: "AL-01", gal: 55.0, delta: 6.0 },
  { diasAtras: 12, hora: "06:20", eq: "T-04", gal: 42.0, delta: 6.5 },
  { diasAtras: 12, hora: "09:40", eq: "C-01", gal: 60.0, delta: 175.0 },
  { diasAtras: 11, hora: "06:15", eq: "AL-01", gal: 58.5, delta: 6.5 },
  { diasAtras: 10, hora: "06:30", eq: "T-01", gal: 36.0, delta: 6.0 },
  { diasAtras: 10, hora: "11:20", eq: "P-01", gal: 14.0, delta: 120.0 },
  { diasAtras: 9, hora: "06:25", eq: "T-04", gal: 40.5, delta: 6.2 },
  { diasAtras: 8, hora: "06:40", eq: "AL-01", gal: 61.0, delta: 6.4 },
  { diasAtras: 7, hora: "06:05", eq: "T-01", gal: 37.5, delta: 6.3 },
  { diasAtras: 7, hora: "10:15", eq: "C-01", gal: 58.0, delta: 168.0 },
  { diasAtras: 6, hora: "06:35", eq: "T-04", gal: 41.0, delta: 6.4 },
  { diasAtras: 6, hora: "07:50", eq: "AL-01", gal: 63.5, delta: 6.1 },
  { diasAtras: 5, hora: "06:15", eq: "T-01", gal: 35.5, delta: 5.9 },
  { diasAtras: 4, hora: "06:45", eq: "AL-01", gal: 66.0, delta: 6.0 },
  { diasAtras: 4, hora: "12:10", eq: "P-01", gal: 13.5, delta: 110.0 },
  { diasAtras: 3, hora: "06:20", eq: "T-04", gal: 39.5, delta: 6.1 },
  { diasAtras: 2, hora: "06:30", eq: "C-01", gal: 62.0, delta: 180.0 },
  { diasAtras: 2, hora: "08:15", eq: "AL-01", gal: 64.5, delta: 5.8 },
  {
    diasAtras: 1,
    hora: "06:25",
    eq: "T-01",
    gal: 38.0,
    delta: 6.2,
    tandaInicial: 0.5,
    nota: "La tanda quedó en 0,5 de la purga de la bomba de ayer.",
  },
  // HOY
  { diasAtras: 0, hora: "06:12", eq: "T-04", gal: 42.5, delta: 6.5 },
  {
    diasAtras: 0,
    hora: "06:41",
    eq: "AL-01",
    gal: 52.0,
    delta: 5.6,
    salto: 18.0,
  },
  { diasAtras: 0, hora: "07:20", eq: "P-01", gal: 14.2, delta: 118.0, sinGps: true },
];

const SEDE = { lat: 3.9, lng: -76.3, radioGeocercaM: 150 };

function fechaDe(diasAtras: number): string {
  const base = new Date(`${HOY_SIMULADO}T12:00:00-05:00`);
  base.setDate(base.getDate() - diasAtras);
  return base.toISOString().slice(0, 10);
}

function construirCargas(): CargaSimulada[] {
  const cargas: CargaSimulada[] = [];
  let totActual = TOT_INSTALACION_GAL;
  const porEquipo = new Map(
    EQUIPOS_SIMULADOS.map((equipo) => [
      equipo.codigo,
      { equipo, lectura: equipo.lecturaInicial, ultimaCarga: null as string | null },
    ]),
  );

  SPECS.forEach((spec, indice) => {
    const estadoEquipo = porEquipo.get(spec.eq)!;
    const { equipo } = estadoEquipo;
    const fecha = fechaDe(spec.diasAtras);
    const iniciadaEn = `${fecha}T${spec.hora}:00-05:00`;
    const duracionSegundos = 180 + (indice % 5) * 45;
    const finalizadaEn = new Date(
      new Date(iniciadaEn).getTime() + duracionSegundos * 1000,
    ).toISOString();

    const tandaInicial = spec.tandaInicial ?? 0.0;
    const totInicial = Math.round((totActual + (spec.salto ?? 0)) * 10) / 10;
    const tandaFinal = Math.round((tandaInicial + spec.gal) * 10) / 10;
    const totFinal = Math.round((totInicial + spec.gal) * 10) / 10;
    const lecturaEquipo = Math.round((estadoEquipo.lectura + spec.delta) * 10) / 10;

    // El veredicto lo decide el dominio, con el contexto encadenado real.
    const resultado = validarCarga(
      {
        tandaInicialGal: tandaInicial,
        totInicialGal: totInicial,
        tandaFinalGal: tandaFinal,
        totFinalGal: totFinal,
        lecturaEquipo,
        iniciadaEn,
        finalizadaEn,
        lat: spec.sinGps ? null : SEDE.lat,
        lng: spec.sinGps ? null : SEDE.lng,
        origen: "app",
        fotoInicial: true,
        fotoFinal: true,
      },
      {
        dispensador: { totActualGal: totActual, toleranciaTandaGal: 1.0 },
        equipo: {
          tipoMedidor: equipo.tipoMedidor,
          ultimaLectura: estadoEquipo.lectura,
          capacidadTanqueGal: equipo.capacidadTanqueGal,
          ultimaCargaFinalizadaEn: estadoEquipo.ultimaCarga,
        },
        sede: SEDE,
      },
    );

    cargas.push({
      id: `demo-${String(indice + 1).padStart(3, "0")}`,
      fecha,
      hora: spec.hora,
      equipoCodigo: equipo.codigo,
      equipoDescripcion: equipo.descripcion,
      conductorNombre: CONDUCTORES[indice % CONDUCTORES.length]!,
      tandaInicial,
      totInicial,
      tandaFinal,
      totFinal,
      galones: spec.gal,
      lecturaEquipo,
      deltaLectura: spec.delta,
      duracionSegundos,
      estado: resultado.estado,
      banderas: resultado.banderas,
      galNoRegistrados: resultado.galNoRegistrados,
      notas: spec.nota ?? null,
    });

    totActual = totFinal;
    estadoEquipo.lectura = lecturaEquipo;
    estadoEquipo.ultimaCarga = finalizadaEn;
  });

  return cargas;
}

export const CARGAS_SIMULADAS: CargaSimulada[] = construirCargas();

export const TOTALIZADOR_FINAL_GAL = CARGAS_SIMULADAS[CARGAS_SIMULADAS.length - 1]!.totFinal;

export const ENTREGAS_SIMULADAS = [
  {
    numeroRemision: "R-4411",
    fecha: "2026-07-19",
    galones: 900.0,
    placaCarrotanque: "WLK-427",
    recibidoPor: "Aníbal Rengifo",
  },
  {
    numeroRemision: "R-4523",
    fecha: "2026-07-28",
    galones: 650.0,
    placaCarrotanque: "WLK-427",
    recibidoPor: "Aníbal Rengifo",
  },
];

export function balanceSimulado() {
  const despachado = Math.round((TOTALIZADOR_FINAL_GAL - TOT_INSTALACION_GAL) * 10) / 10;
  const entregado = ENTREGAS_SIMULADAS.reduce((suma, entrega) => suma + entrega.galones, 0);
  const existencia = Math.round((EXISTENCIA_INICIAL_GAL + entregado - despachado) * 10) / 10;

  const hace7 = fechaDe(6);
  const despachado7d = CARGAS_SIMULADAS.filter((carga) => carga.fecha >= hace7).reduce(
    (suma, carga) => suma + carga.galones + (carga.galNoRegistrados ?? 0),
    0,
  );
  const consumoDiario = Math.round((despachado7d / 7) * 10) / 10;
  const autonomiaDias = consumoDiario > 0 ? Math.round((existencia / consumoDiario) * 10) / 10 : 0;

  const proxima = new Date(`${HOY_SIMULADO}T12:00:00-05:00`);
  proxima.setDate(proxima.getDate() + Math.max(0, Math.floor(autonomiaDias - 2 - 2)));

  return {
    despachadoTotalGal: despachado,
    entregadoTotalGal: entregado,
    existenciaEstimadaGal: existencia,
    consumoDiarioGal: consumoDiario,
    autonomiaDias,
    proximaEntregaSugerida: proxima.toISOString().slice(0, 10),
  };
}

export function consumoPorDia14(): Array<{ fecha: string; galones: number; parcial?: boolean }> {
  const dias: Array<{ fecha: string; galones: number; parcial?: boolean }> = [];
  for (let atras = 13; atras >= 0; atras--) {
    const fecha = fechaDe(atras);
    const galones = CARGAS_SIMULADAS.filter((carga) => carga.fecha === fecha).reduce(
      (suma, carga) => suma + carga.galones,
      0,
    );
    // El día de hoy va parcial: el corte es a media mañana (diseño aprobado).
    dias.push({
      fecha,
      galones: Math.round(galones * 10) / 10,
      ...(atras === 0 ? { parcial: true } : {}),
    });
  }
  return dias;
}

/** Galones despachados sin equipo asignado: los saltos positivos del totalizador. */
export function galSinRegistrar(): number {
  return (
    Math.round(
      CARGAS_SIMULADAS.reduce((suma, carga) => suma + Math.max(0, carga.galNoRegistrados ?? 0), 0) * 10,
    ) / 10
  );
}
