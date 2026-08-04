// Reglas de validación R1–R12 — docs/ESPEC_App_Cuadre_Lubryco.md §7.
// Única fuente de verdad: la importan la PWA (feedback inmediato) y la
// API (autoridad final). Funciones puras, sin I/O ni dependencias de
// entorno (DEC-003, DEC-007, DEC-009).

import type { ContextoValidacion, MarcaRegla, RegistroCarga, ResultadoValidacion } from "./tipos";
import {
  aGalones,
  DURACION_MAXIMA_S,
  DURACION_MINIMA_S,
  distanciaMetros,
  enDecimas,
  enMs,
  FACTOR_EXCESO_CAPACIDAD,
  VENTANA_DUPLICADO_MS,
} from "./nucleo";

// El totalizador Fill-Rite tiene 6 dígitos enteros: después de 999999
// vuelve a 000000. La tanda tiene 4 enteros + décimas: una sola carga
// jamás puede superar 9999.9 gal, y ese es el umbral para distinguir
// una vuelta legítima de un retroceso.
const VUELTA_TOTALIZADOR_GAL = 1_000_000;
const TANDA_MAXIMA_GAL = 9_999.9;

// R8 — constante de negocio (Product Bible §6, precisiones aprobadas):
// un odómetro no puede acumular más km de los que caben en el tiempo
// calendario transcurrido a esta velocidad sostenida.
const VELOCIDAD_MAXIMA_PLAUSIBLE_KMH = 100;

export function deltaTotalizador(
  totInicialGal: number,
  totFinalGal: number,
): { delta: number; dioVuelta: boolean; retrocede: boolean; sinAvance: boolean } {
  const inicial = enDecimas(totInicialGal);
  const final = enDecimas(totFinalGal);

  if (final > inicial) {
    return { delta: aGalones(final - inicial), dioVuelta: false, retrocede: false, sinAvance: false };
  }

  if (final === inicial) {
    return { delta: 0, dioVuelta: false, retrocede: false, sinAvance: true };
  }

  const conVuelta = final + enDecimas(VUELTA_TOTALIZADOR_GAL) - inicial;
  if (conVuelta > 0 && conVuelta <= enDecimas(TANDA_MAXIMA_GAL)) {
    return { delta: aGalones(conVuelta), dioVuelta: true, retrocede: false, sinAvance: false };
  }

  return { delta: 0, dioVuelta: false, retrocede: true, sinAvance: false };
}

/** R1 — la tanda inicial debe estar en 0.0: prueba de que se reseteó el medidor. */
export function reglaR1(registro: RegistroCarga): MarcaRegla | null {
  if (enDecimas(registro.tandaInicialGal) === 0) return null;
  return { bandera: "TANDA_NO_RESETEADA", clase: "advertencia", exigeNota: true };
}

/** R2 — el totalizador inicial debe coincidir con el último conocido del
 *  dispensador. El salto positivo (arrancó más arriba: alguien cargó sin
 *  registrar) y el negativo (arrancó más abajo) llevan banderas distintas
 *  para que la UI muestre mensajes distintos. */
export function reglaR2(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const inicial = enDecimas(registro.totInicialGal);
  const actual = enDecimas(contexto.dispensador.totActualGal);
  if (inicial === actual) return null;
  return {
    bandera: inicial > actual ? "SALTO_TOTALIZADOR" : "SALTO_TOTALIZADOR_NEGATIVO",
    clase: "inconsistente",
    galNoRegistrados: aGalones(inicial - actual),
  };
}

/** R3 — la tanda final debe cuadrar con lo que subió el totalizador (± tolerancia). */
export function reglaR3(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const { delta, retrocede, sinAvance } = deltaTotalizador(registro.totInicialGal, registro.totFinalGal);
  if (retrocede || sinAvance) return null; // ambos son asunto de R4; aquí no hay delta que comparar

  const diferencia = Math.abs(enDecimas(registro.tandaFinalGal) - enDecimas(delta));
  if (diferencia <= enDecimas(contexto.dispensador.toleranciaTandaGal)) return null;
  return { bandera: "TANDA_NO_CUADRA", clase: "inconsistente" };
}

/** R4 — el totalizador debe avanzar. Separa el retroceso real
 *  (TOTALIZADOR_RETROCEDE) del que no se movió (TOTALIZADOR_SIN_AVANCE),
 *  para que la UI dé mensajes distintos. La vuelta legítima en 999999
 *  no marca ninguno de los dos. */
export function reglaR4(registro: RegistroCarga): MarcaRegla | null {
  const { retrocede, sinAvance } = deltaTotalizador(registro.totInicialGal, registro.totFinalGal);
  if (!retrocede && !sinAvance) return null;
  return {
    bandera: retrocede ? "TOTALIZADOR_RETROCEDE" : "TOTALIZADOR_SIN_AVANCE",
    clase: "inconsistente",
    bloqueaAvance: true,
  };
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
  if (tipoMedidor === "ninguno" || ultimaLectura === null || registro.lecturaEquipo === null)
    return null;
  if (enDecimas(registro.lecturaEquipo) >= enDecimas(ultimaLectura)) return null;
  return { bandera: "CONTADOR_RETROCEDE", clase: "advertencia" };
}

/** R8 — el salto del contador es plausible contra el TIEMPO CALENDARIO
 *  transcurrido desde la última carga del equipo (precisión aprobada,
 *  Product Bible §6): un horómetro no puede acumular más horas que las
 *  transcurridas, y un odómetro no puede acumular más km de los que
 *  caben en ese tiempo a velocidad máxima plausible. El objetivo es
 *  detectar saltos imposibles, no penalizar equipos que pasan días sin
 *  abastecer. Sin fecha de última carga no hay referencia y no se evalúa. */
export function reglaR8(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const { tipoMedidor, ultimaLectura, ultimaCargaFinalizadaEn } = contexto.equipo;
  if (tipoMedidor === "ninguno" || ultimaLectura === null || registro.lecturaEquipo === null)
    return null;
  if (ultimaCargaFinalizadaEn === null) return null;

  const salto = enDecimas(registro.lecturaEquipo) - enDecimas(ultimaLectura);
  if (salto < 0) return null; // el retroceso es asunto de R7

  const horasTranscurridas = Math.max(
    0,
    (enMs(registro.iniciadaEn) - enMs(ultimaCargaFinalizadaEn)) / 3_600_000,
  );
  const maximoPlausible =
    tipoMedidor === "horometro"
      ? horasTranscurridas
      : horasTranscurridas * VELOCIDAD_MAXIMA_PLAUSIBLE_KMH;

  if (salto <= enDecimas(maximoPlausible)) return null;
  return { bandera: "SALTO_CONTADOR", clase: "advertencia" };
}

/** R9 — las dos fotos existen y vienen de cámara en vivo. papel_retro
 *  queda exento (no tiene fotos por definición); las correcciones SÍ
 *  las requieren (precisión aprobada). La falta de fotos clasifica la
 *  carga como inconsistente. */
export function reglaR9(registro: RegistroCarga): MarcaRegla | null {
  if (registro.origen === "papel_retro") return null;
  if (registro.fotoInicial && registro.fotoFinal) return null;
  return { bandera: "FOTO_FALTANTE", clase: "inconsistente", bloqueaCierre: true };
}

/** R10 — el GPS está dentro de la geocerca de la sede. Cuando no hay
 *  coordenadas del dispositivo, o la sede no tiene geocerca configurada,
 *  se emite SIN_GPS (clase 'info'): no bloquea ni cambia el estado, solo
 *  deja constancia de que la geocerca no pudo validarse (precisión
 *  aprobada). */
export function reglaR10(registro: RegistroCarga, contexto: ContextoValidacion): MarcaRegla | null {
  const { lat: sedeLat, lng: sedeLng, radioGeocercaM } = contexto.sede;
  if (registro.lat === null || registro.lng === null || sedeLat === null || sedeLng === null) {
    return { bandera: "SIN_GPS", clase: "info" };
  }
  if (distanciaMetros(registro.lat, registro.lng, sedeLat, sedeLng) <= radioGeocercaM) return null;
  return { bandera: "FUERA_DE_SEDE", clase: "advertencia" };
}

/** R11 — no existe otra carga del mismo equipo en los últimos 3 minutos.
 *  Puntos de referencia (precisión aprobada): `finalizada_en` de la carga
 *  anterior del equipo contra `iniciada_en` de la nueva. */
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
export function validarCarga(
  registro: RegistroCarga,
  contexto: ContextoValidacion,
): ResultadoValidacion {
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
  const hayAdvertencia = marcas.some((m) => m.clase === "advertencia");
  const saltoTotalizador = marcas.find((m) => m.galNoRegistrados !== undefined);

  return {
    // Las marcas 'info' (SIN_GPS) no afectan el estado: solo informan.
    estado: hayInconsistencia ? "inconsistente" : hayAdvertencia ? "advertencia" : "ok",
    banderas: marcas.map((m) => m.bandera),
    marcas,
    galNoRegistrados: saltoTotalizador?.galNoRegistrados ?? null,
    exigeNota: marcas.some((m) => m.exigeNota === true),
    bloqueaAvance: marcas.some((m) => m.bloqueaAvance === true),
    bloqueaCierre: marcas.some((m) => m.bloqueaCierre === true),
  };
}
