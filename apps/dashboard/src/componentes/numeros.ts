// Formato numérico colombiano (spec §13): punto de miles, coma decimal.

export function formatearGal(valor: number): string {
  return valor.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatearEntero(valor: number): string {
  return valor.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

/** «12 min 05 s». La usan la evidencia y la exportación a Excel. */
export function formatearDuracion(segundos: number | null): string {
  if (segundos === null) return "";
  const minutos = Math.floor(segundos / 60);
  return `${minutos} min ${String(Math.round(segundos % 60)).padStart(2, "0")} s`;
}
