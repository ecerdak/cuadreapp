// DATOS DE DEMOSTRACIÓN del cliente del escenario simulado. No es
// configuración de la aplicación: es el equivalente a una fila de la
// tabla `clientes` mientras el Dashboard no se conecta a la API
// (DEC-018 — la identidad viene SIEMPRE de la base). Cuando llegue la
// Fase C, FuenteApi reemplaza a FuenteSimulada y este archivo
// desaparece con ella.

export const CLIENTE = {
  nombre: "Industrias Alimenticias El Trébol S.A.S.",
  corto: "El Trébol S.A.S.",
  sede: "Planta Buga, Valle del Cauca",
  colorPrimario: "#1E9B4B",
  colorSecundario: "#0E5C2C",
} as const;

export const MEDIDOR = {
  modelo: "Fill-Rite Serie 900",
  instalado: "6 jul 2026",
} as const;
