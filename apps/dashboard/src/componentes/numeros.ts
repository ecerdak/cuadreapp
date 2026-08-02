// Formato numérico colombiano (spec §13): punto de miles, coma decimal.

export function formatearGal(valor: number): string {
  return valor.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatearEntero(valor: number): string {
  return valor.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}
