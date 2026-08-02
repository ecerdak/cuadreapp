// Tokens del design system del tablero, tomados del mockup aprobado.
// Un solo lugar: los componentes no inventan colores.

import type { EstadoCarga } from "@cuadreapp/dominio";

export const TEMA = {
  fondo: "#0B1219",
  panel: "#111C26",
  panel2: "#18242F",
  linea: "#22374A",
  texto: "#E7EEF6",
  suave: "#8AA0B6",
  verde: "#3FAE7E",
  ambar: "#E2A233",
  rojo: "#E2594C",
  amarillo: "#F5E01B",
  azul: "#5B90C4",
} as const;

export const COLOR_ESTADO: Record<EstadoCarga, string> = {
  ok: TEMA.verde,
  advertencia: TEMA.ambar,
  inconsistente: TEMA.rojo,
};

export const TEXTO_ESTADO: Record<EstadoCarga, string> = {
  ok: "Cuadra",
  advertencia: "Revisar",
  inconsistente: "No cuadra",
};

export type TonoVeredicto = "ok" | "atencion" | "problema";

export const COLOR_TONO: Record<TonoVeredicto, string> = {
  ok: TEMA.verde,
  atencion: TEMA.ambar,
  problema: TEMA.rojo,
};
