// Tokens del contrato visual, transcritos de cuadre_app_conductor.jsx
// (fuente de verdad). Duplicados deliberadamente en apps/pwa/src/marca — los mockups los copian literalmente en ambos archivos; la
// extracción a paquete queda para después del congelamiento.

export const MARCA = {
  amarillo: "#F5E01B",
  azul: "#4A7CAB",
  negro: "#0B0B0B",
  halo: "#FFFFFF",
  script: "'Yellowtail', cursive",
  ui: "'Barlow', system-ui, -apple-system, sans-serif",
  condensada: "'Barlow Condensed', 'Barlow', sans-serif",
} as const;

export const C = {
  fondo: "#0B1219",
  panel: "#111C26",
  panelAlto: "#16232F",
  linea: "#22374A",
  lineaSuave: "#1A2A38",
  texto: "#E7EEF6",
  suave: "#8AA0B6",
  tenue: "#5C748A",
  amarillo: MARCA.amarillo,
  azul: "#5B90C4",
  verde: "#3FAE7E",
  ambar: "#E2A233",
  rojo: "#E2594C",
  trebol: "#1E9B4B",
} as const;

/* Fondo de la app más oscuro que la página, tarjetas y teclado propios. */
export const APP = { fondo: "#070D13", tarjeta: "#121C25", tarjeta2: "#18242F" } as const;
