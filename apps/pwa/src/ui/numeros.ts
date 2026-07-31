// Formato numérico colombiano (spec §13): coma decimal en pantalla.
// Estas funciones son de presentación y parseo — no de negocio.

export function aNumero(texto: string): number | null {
  const limpio = texto.trim().replace(/\./g, "").replace(",", ".");
  if (limpio === "") return null;
  const valor = Number(limpio);
  return Number.isFinite(valor) ? valor : null;
}

export function formatearGal(valor: number): string {
  return valor.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
