// Flujos de captura por Perfil Operativo — el punto de despacho de la
// PWA (DEC-016). La secuencia de pasos de cada perfil vive AQUÍ como
// dato, una sola vez: el retroceso (PASO_ANTERIOR) y la barra de
// avance se derivan, nunca se duplican. Este archivo es uno de los
// cuatro lugares del sistema autorizados a nombrar códigos de perfil.
//
// Reglas fijas de todo flujo:
//  - `inicio` es la raíz: no tiene retroceso.
//  - `listo` no tiene retroceso: la carga YA está en la cola — volver
//    podría reabrir/duplicar un registro confirmado.
//  - `diagnostico` es un paso satélite que siempre cuelga de inicio.

import type { CodigoPerfil } from "@cuadreapp/dominio";

/** Todos los pasos posibles del wizard (unión de todos los perfiles).
 *  ÚNICA definición — App, navegación y cabecera la importan de aquí. */
export type PasoWizard =
  | "inicio"
  | "equipo"
  | "conductor"
  | "antes"
  | "cargando"
  | "despues"
  | "llegada"
  | "despacho"
  | "listo"
  | "diagnostico";

export interface DefinicionFlujo {
  perfil: CodigoPerfil;
  /** Secuencia principal de captura, en orden, de inicio a listo. */
  pasos: PasoWizard[];
}

/** Flujo original (El Trébol): los 7 pasos del spec §8.1, intactos. */
export const FLUJO_MEDIDOR_DOBLE: DefinicionFlujo = {
  perfil: "medidor_doble",
  pasos: ["inicio", "equipo", "conductor", "antes", "cargando", "despues", "listo"],
};

/** Flujo «Carga sobre Inventario» (Sacyr, DEC-016): llegada (foto +
 *  galones con los que llegó) → cargando → despacho (foto + galones
 *  despachados por Lubryco; el total al salir se calcula, jamás se
 *  teclea). Sin tandas ni totalizadores. */
export const FLUJO_CARGA_INVENTARIO: DefinicionFlujo = {
  perfil: "carga_inventario",
  pasos: ["inicio", "equipo", "conductor", "llegada", "cargando", "despacho", "listo"],
};

const FLUJOS: Record<CodigoPerfil, DefinicionFlujo> = {
  medidor_doble: FLUJO_MEDIDOR_DOBLE,
  carga_inventario: FLUJO_CARGA_INVENTARIO,
};

/** Selector de flujo — el punto de despacho de la PWA (DEC-016). */
export function flujoDe(perfil: CodigoPerfil): DefinicionFlujo {
  return FLUJOS[perfil];
}

/** Paso inmediatamente anterior, derivado de la secuencia. Los pasos
 *  que no pertenecen al flujo quedan en null (inalcanzables). */
export function derivarPasoAnterior(flujo: DefinicionFlujo): Record<PasoWizard, PasoWizard | null> {
  const anterior: Record<PasoWizard, PasoWizard | null> = {
    inicio: null,
    equipo: null,
    conductor: null,
    antes: null,
    cargando: null,
    despues: null,
    llegada: null,
    despacho: null,
    listo: null,
    diagnostico: "inicio",
  };
  flujo.pasos.forEach((paso, indice) => {
    if (paso === "inicio" || paso === "listo") return;
    anterior[paso] = flujo.pasos[indice - 1] ?? null;
  });
  return anterior;
}

/** Paso siguiente en la secuencia del flujo (avance hacia adelante,
 *  ahora también derivado del dato — no más setPaso hardcodeados). */
export function pasoSiguiente(flujo: DefinicionFlujo, paso: PasoWizard): PasoWizard | null {
  const indice = flujo.pasos.indexOf(paso);
  if (indice === -1) return null;
  return flujo.pasos[indice + 1] ?? null;
}

/** Barra de avance: los pasos de captura (entre inicio y listo) valen
 *  1..N y `listo` muestra la barra completa. */
export function derivarAvance(flujo: DefinicionFlujo): {
  porPaso: Record<string, number>;
  total: number;
} {
  const captura = flujo.pasos.filter((paso) => paso !== "inicio" && paso !== "listo");
  const porPaso: Record<string, number> = {};
  captura.forEach((paso, indice) => {
    porPaso[paso] = indice + 1;
  });
  porPaso.listo = captura.length;
  return { porPaso, total: captura.length };
}
