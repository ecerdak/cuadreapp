// Fechas de NEGOCIO en la zona horaria de la operación (spec §13:
// America/Bogota). Nunca usar toISOString() para decidir "qué día es":
// ISO es UTC y en Colombia el día cambiaría a las 7 p. m. locales.
// Los timestamps se siguen guardando en ISO/UTC; esto es solo para
// agrupar y mostrar.

const ZONA_OPERACION = "America/Bogota";

/** Fecha local (YYYY-MM-DD) de un instante, en la zona de la operación. */
export function fechaLocalDe(instante: string | Date, zona: string = ZONA_OPERACION): string {
  // en-CA formatea YYYY-MM-DD directamente.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof instante === "string" ? new Date(instante) : instante);
}

/** El "hoy" del negocio. `ahora` es inyectable para pruebas. */
export function fechaLocalHoy(zona: string = ZONA_OPERACION, ahora: Date = new Date()): string {
  return fechaLocalDe(ahora, zona);
}
