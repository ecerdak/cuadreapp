// Identidad del cliente y del medidor que viste el marco del tablero
// (header, línea de contexto). Es configuración de presentación, no
// datos de operación: cuando llegue la Fase C, vendrá de la API junto
// con la sesión del supervisor.

export const CLIENTE = {
  nombre: "Industrias Alimenticias El Trébol S.A.S.",
  corto: "El Trébol S.A.S.",
  sede: "Planta Buga, Valle del Cauca",
} as const;

export const MEDIDOR = {
  modelo: "Fill-Rite Serie 900",
  instalado: "6 jul 2026",
} as const;
