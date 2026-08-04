// Reglas del perfil «Carga sobre Inventario» (RI1–RI6) — DEC-016,
// docs/ESPEC_App_Cuadre_Lubryco.md §7 (addendum 4-ago-2026).
// Mismo contrato que R1–R12: funciones puras, null = pasó o no aplica,
// nunca se bloquea un registro — se guarda y se marca. Las banderas
// reutilizan el vocabulario existente donde la semántica es idéntica,
// así los mensajes de PWA y Dashboard se heredan sin duplicarse.
//
// Las R1–R12 congeladas (validacion.ts) NO se tocan: este es un
// conjunto nuevo, del perfil nuevo.

import type {
  ContextoInventario,
  MarcaRegla,
  RegistroCargaInventario,
  ResultadoInventario,
} from "./tipos";
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

/** Cálculo del perfil: inventario final = llegada + despachados, en
 *  décimas enteras (una decimal exacta, sin ruido flotante). El
 *  operador JAMÁS escribe este número; la base lo garantiza además
 *  con una columna generada. */
export function calcularInventarioFinal(llegadaGal: number, despachadosGal: number): number {
  return aGalones(enDecimas(llegadaGal) + enDecimas(despachadosGal));
}

/** RI1 — hubo despacho real: Lubryco despachó más de 0.0 gal. */
export function reglaRI1(registro: RegistroCargaInventario): MarcaRegla | null {
  if (enDecimas(registro.despachadosGal) > 0) return null;
  return { bandera: "SIN_DESPACHO", clase: "inconsistente" };
}

/** RI2 — plausibilidad: el inventario final (llegada + despachados)
 *  no excede la capacidad del carrotanque (+15%), cuando se conoce. */
export function reglaRI2(
  registro: RegistroCargaInventario,
  contexto: ContextoInventario,
): MarcaRegla | null {
  const capacidad = contexto.equipo.capacidadTanqueGal;
  if (capacidad === null) return null;
  const limite = Math.round(enDecimas(capacidad) * FACTOR_EXCESO_CAPACIDAD);
  const total = enDecimas(registro.llegadaGal) + enDecimas(registro.despachadosGal);
  if (total <= limite) return null;
  return { bandera: "EXCEDE_CAPACIDAD", clase: "advertencia" };
}

/** RI3 — las dos fotos existen y vienen de cámara en vivo. papel_retro
 *  queda exento (no tiene fotos por definición); las correcciones SÍ
 *  las requieren — misma precisión aprobada que R9. */
export function reglaRI3(registro: RegistroCargaInventario): MarcaRegla | null {
  if (registro.origen === "papel_retro") return null;
  if (registro.fotoInicial && registro.fotoFinal) return null;
  return { bandera: "FOTO_FALTANTE", clase: "inconsistente", bloqueaCierre: true };
}

/** RI4 — el GPS está dentro de la geocerca de la sede; sin coordenadas
 *  del dispositivo o sin geocerca configurada emite SIN_GPS (info) —
 *  misma semántica que R10. */
export function reglaRI4(
  registro: RegistroCargaInventario,
  contexto: ContextoInventario,
): MarcaRegla | null {
  const { lat: sedeLat, lng: sedeLng, radioGeocercaM } = contexto.sede;
  if (registro.lat === null || registro.lng === null || sedeLat === null || sedeLng === null) {
    return { bandera: "SIN_GPS", clase: "info" };
  }
  if (distanciaMetros(registro.lat, registro.lng, sedeLat, sedeLng) <= radioGeocercaM) return null;
  return { bandera: "FUERA_DE_SEDE", clase: "advertencia" };
}

/** RI5 — no existe otra carga del mismo equipo en los últimos 3
 *  minutos: `finalizada_en` de la anterior contra `iniciada_en` de la
 *  nueva — mismos puntos de referencia que R11. */
export function reglaRI5(
  registro: RegistroCargaInventario,
  contexto: ContextoInventario,
): MarcaRegla | null {
  const ultima = contexto.equipo.ultimaCargaFinalizadaEn;
  if (ultima === null) return null;
  if (enMs(registro.iniciadaEn) - enMs(ultima) >= VENTANA_DUPLICADO_MS) return null;
  return { bandera: "POSIBLE_DUPLICADO", clase: "advertencia" };
}

/** RI6 — la duración de la carga es plausible: entre 20 s y 60 min. */
export function reglaRI6(registro: RegistroCargaInventario): MarcaRegla | null {
  const duracionS = (enMs(registro.finalizadaEn) - enMs(registro.iniciadaEn)) / 1000;
  if (duracionS >= DURACION_MINIMA_S && duracionS <= DURACION_MAXIMA_S) return null;
  return { bandera: "TIEMPO_ATIPICO", clase: "advertencia" };
}

/** Evalúa RI1–RI6 en orden y compone el veredicto con la misma regla
 *  general del §7: inconsistente > advertencia > ok ('info' no cuenta).
 *  El inventario final se calcula siempre, marcada o no la carga. */
export function validarCargaInventario(
  registro: RegistroCargaInventario,
  contexto: ContextoInventario,
): ResultadoInventario {
  const marcas: MarcaRegla[] = [
    reglaRI1(registro),
    reglaRI2(registro, contexto),
    reglaRI3(registro),
    reglaRI4(registro, contexto),
    reglaRI5(registro, contexto),
    reglaRI6(registro),
  ].filter((marca): marca is MarcaRegla => marca !== null);

  const hayInconsistencia = marcas.some((m) => m.clase === "inconsistente");
  const hayAdvertencia = marcas.some((m) => m.clase === "advertencia");

  return {
    estado: hayInconsistencia ? "inconsistente" : hayAdvertencia ? "advertencia" : "ok",
    banderas: marcas.map((m) => m.bandera),
    marcas,
    galNoRegistrados: null,
    exigeNota: marcas.some((m) => m.exigeNota === true),
    bloqueaAvance: marcas.some((m) => m.bloqueaAvance === true),
    bloqueaCierre: marcas.some((m) => m.bloqueaCierre === true),
    inventarioFinalGal: calcularInventarioFinal(registro.llegadaGal, registro.despachadosGal),
  };
}
