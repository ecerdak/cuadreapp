// Reglas de validación R1–R12 — docs/ESPEC_App_Cuadre_Lubryco.md §7.
// Única fuente de verdad: la importan la PWA (feedback inmediato) y la
// API (autoridad final). Funciones puras, sin I/O ni dependencias de
// entorno (DEC-003, DEC-007, DEC-009).

import type { ContextoValidacion, MarcaRegla, RegistroCarga, ResultadoValidacion } from "./tipos";

// El totalizador Fill-Rite tiene 6 dígitos enteros: después de 999999
// vuelve a 000000. La tanda tiene 4 enteros + décimas: una sola carga
// jamás puede superar 9999.9 gal, y ese es el umbral para distinguir
// una vuelta legítima de un retroceso.
const VUELTA_TOTALIZADOR_GAL = 1_000_000;
const TANDA_MAXIMA_GAL = 9_999.9;

const FACTOR_EXCESO_CAPACIDAD = 1.15; // R6
const MAX_SALTO_HOROMETRO_H = 24; // R8
const MAX_SALTO_ODOMETRO_KM = 800; // R8
const VENTANA_DUPLICADO_MS = 3 * 60 * 1000; // R11
const DURACION_MINIMA_S = 20; // R12
const DURACION_MAXIMA_S = 60 * 60; // R12

// Toda la aritmética de galones se hace en décimas enteras para que la
// representación flotante (0.1 + 0.2) nunca dispare una bandera falsa.
const enDecimas = (gal: number): number => Math.round(gal * 10);
const aGalones = (decimas: number): number => decimas / 10;

const enMs = (fecha: string | Date): number => new Date(fecha).getTime();

export function deltaTotalizador(
  totInicialGal: number,
  totFinalGal: number,
): { delta: number; dioVuelta: boolean; retrocede: boolean } {
  const inicial = enDecimas(totInicialGal);
  const final = enDecimas(totFinalGal);

  if (final > inicial) {
    return { delta: aGalones(final - inicial), dioVuelta: false, retrocede: false };
  }

  const conVuelta = final + enDecimas(VUELTA_TOTALIZADOR_GAL) - inicial;
  if (conVuelta > 0 && conVuelta <= enDecimas(TANDA_MAXIMA_GAL)) {
    return { delta: aGalones(conVuelta), dioVuelta: true, retrocede: false };
  }

  return { delta: 0, dioVuelta: false, retrocede: true };
}

/** R1 — la tanda inicial debe estar en 0.0: prueba de que se reseteó el medidor. */
export function reglaR1(registro: RegistroCarga): MarcaRegla | null {
  if (enDecimas(registro.tandaInicialGal) === 0) return null;
  return { bandera: "TANDA_NO_RESETEADA", clase: "advertencia", exigeNota: true };
}

/** R2 — el totalizador inicial debe coincidir con el último conocido del dispensador. */
export function reglaR2(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const inicial = enDecimas(registro.totInicialGal);
  const actual = enDecimas(contexto.dispensador.totActualGal);
  if (inicial === actual) return null;
  return {
    bandera: "SALTO_TOTALIZADOR",
    clase: "inconsistente",
    galNoRegistrados: aGalones(inicial - actual),
  };
}

/** R3 — la tanda final debe cuadrar con lo que subió el totalizador (± tolerancia). */
export function reglaR3(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const { delta, retrocede } = deltaTotalizador(registro.totInicialGal, registro.totFinalGal);
  if (retrocede) return null; // el retroceso es asunto de R4; aquí no hay delta que comparar

  const diferencia = Math.abs(enDecimas(registro.tandaFinalGal) - enDecimas(delta));
  if (diferencia <= enDecimas(contexto.dispensador.toleranciaTandaGal)) return null;
  return { bandera: "TANDA_NO_CUADRA", clase: "inconsistente" };
}

/** R4 — el totalizador nunca retrocede (salvo la vuelta legítima en 999999). */
export function reglaR4(registro: RegistroCarga): MarcaRegla | null {
  const { retrocede } = deltaTotalizador(registro.totInicialGal, registro.totFinalGal);
  if (!retrocede) return null;
  return { bandera: "TOTALIZADOR_RETROCEDE", clase: "inconsistente", bloqueaAvance: true };
}

/** R5 — tiene que haber despacho real. */
export function reglaR5(registro: RegistroCarga): MarcaRegla | null {
  if (enDecimas(registro.tandaFinalGal) > 0) return null;
  return { bandera: "SIN_DESPACHO", clase: "inconsistente" };
}

/** R6 — plausibilidad: los galones no exceden la capacidad del tanque del equipo (+15%). */
export function reglaR6(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const capacidad = contexto.equipo.capacidadTanqueGal;
  if (capacidad === null) return null;
  const limite = Math.round(enDecimas(capacidad) * FACTOR_EXCESO_CAPACIDAD);
  if (enDecimas(registro.tandaFinalGal) <= limite) return null;
  return { bandera: "EXCEDE_CAPACIDAD", clase: "advertencia" };
}

/** R7 — el horómetro/odómetro del equipo no retrocede. */
export function reglaR7(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const { tipoMedidor, ultimaLectura } = contexto.equipo;
  if (tipoMedidor === "ninguno" || ultimaLectura === null || registro.lecturaEquipo === null) return null;
  if (enDecimas(registro.lecturaEquipo) >= enDecimas(ultimaLectura)) return null;
  return { bandera: "CONTADOR_RETROCEDE", clase: "advertencia" };
}

/** R8 — el salto del contador es plausible: ≤ 24 h de horómetro, ≤ 800 km de odómetro. */
export function reglaR8(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const { tipoMedidor, ultimaLectura } = contexto.equipo;
  if (tipoMedidor === "ninguno" || ultimaLectura === null || registro.lecturaEquipo === null) return null;

  const salto = enDecimas(registro.lecturaEquipo) - enDecimas(ultimaLectura);
  if (salto < 0) return null; // el retroceso es asunto de R7

  const maximo = tipoMedidor === "horometro" ? MAX_SALTO_HOROMETRO_H : MAX_SALTO_ODOMETRO_KM;
  if (salto <= enDecimas(maximo)) return null;
  return { bandera: "SALTO_CONTADOR", clase: "advertencia" };
}

/** R9 — las dos fotos existen y vienen de cámara en vivo. Solo aplica al
 *  flujo en vivo de la app: un registro retroactivo de papel no tiene
 *  fotos por definición. */
export function reglaR9(registro: RegistroCarga): MarcaRegla | null {
  if (registro.origen === "papel_retro") return null;
  if (registro.fotoInicial && registro.fotoFinal) return null;
  return { bandera: "FOTO_FALTANTE", clase: "inconsistente", bloqueaCierre: true };
}

function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const RADIO_TIERRA_M = 6_371_000;
  const rad = (grados: number) => (grados * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.sqrt(a));
}

/** R10 — el GPS está dentro de la geocerca de la sede. Sin GPS o sin
 *  coordenadas de sede no se marca nada: puede no haber señal. */
export function reglaR10(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const { lat: sedeLat, lng: sedeLng, radioGeocercaM } = contexto.sede;
  if (registro.lat === null || registro.lng === null || sedeLat === null || sedeLng === null) return null;
  if (distanciaMetros(registro.lat, registro.lng, sedeLat, sedeLng) <= radioGeocercaM) return null;
  return { bandera: "FUERA_DE_SEDE", clase: "advertencia" };
}

/** R11 — no existe otra carga del mismo equipo en los últimos 3 minutos. */
export function reglaR11(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const ultima = contexto.equipo.ultimaCargaFinalizadaEn;
  if (ultima === null) return null;
  if (enMs(registro.iniciadaEn) - enMs(ultima) >= VENTANA_DUPLICADO_MS) return null;
  return { bandera: "POSIBLE_DUPLICADO", clase: "advertencia" };
}

/** R12 — la duración de la carga es plausible: entre 20 s y 60 min. */
export function reglaR12(registro: RegistroCarga): MarcaRegla | null {
  const duracionS = (enMs(registro.finalizadaEn) - enMs(registro.iniciadaEn)) / 1000;
  if (duracionS >= DURACION_MINIMA_S && duracionS <= DURACION_MAXIMA_S) return null;
  return { bandera: "TIEMPO_ATIPICO", clase: "advertencia" };
}

/** Evalúa R1–R12 en orden y compone el resultado según §7:
 *  inconsistente > advertencia > ok. */
export function validarCarga(registro: RegistroCarga, contexto: ContextoValidacion): ResultadoValidacion {
  const marcas: MarcaRegla[] = [
    reglaR1(registro),
    reglaR2(registro, contexto),
    reglaR3(registro, contexto),
    reglaR4(registro),
    reglaR5(registro),
    reglaR6(registro, contexto),
    reglaR7(registro, contexto),
    reglaR8(registro, contexto),
    reglaR9(registro),
    reglaR10(registro, contexto),
    reglaR11(registro, contexto),
    reglaR12(registro),
  ].filter((marca): marca is MarcaRegla => marca !== null);

  const hayInconsistencia = marcas.some((m) => m.clase === "inconsistente");
  const saltoTotalizador = marcas.find((m) => m.galNoRegistrados !== undefined);

  return {
    estado: hayInconsistencia ? "inconsistente" : marcas.length > 0 ? "advertencia" : "ok",
    banderas: marcas.map((m) => m.bandera),
    marcas,
    galNoRegistrados: saltoTotalizador?.galNoRegistrados ?? null,
    exigeNota: marcas.some((m) => m.exigeNota === true),
    bloqueaAvance: marcas.some((m) => m.bloqueaAvance === true),
    bloqueaCierre: marcas.some((m) => m.bloqueaCierre === true),
  };
}
