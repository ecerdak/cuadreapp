// Núcleo compartido entre perfiles operativos (DEC-016): helpers de
// aritmética/tiempo/geometría y constantes de negocio comunes a más de
// un perfil. Extraído de validacion.ts en un refactor puro (mismos
// valores, mismo comportamiento — la prueba dorada de perfiles.test.ts
// y las 77 pruebas congeladas lo garantizan). Una constante de negocio
// compartida vive aquí y solo aquí.

/** R6/RI2 — margen sobre la capacidad del tanque antes de marcar. */
export const FACTOR_EXCESO_CAPACIDAD = 1.15;
/** R11/RI5 — ventana de duplicado entre cargas del mismo equipo. */
export const VENTANA_DUPLICADO_MS = 3 * 60 * 1000;
/** R12/RI6 — duración plausible de una carga. */
export const DURACION_MINIMA_S = 20;
export const DURACION_MAXIMA_S = 60 * 60;

// Toda la aritmética de galones se hace en décimas enteras para que la
// representación flotante (0.1 + 0.2) nunca dispare una bandera falsa.
export const enDecimas = (gal: number): number => Math.round(gal * 10);
export const aGalones = (decimas: number): number => decimas / 10;

export const enMs = (fecha: string | Date): number => new Date(fecha).getTime();

export function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const RADIO_TIERRA_M = 6_371_000;
  const rad = (grados: number) => (grados * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.sqrt(a));
}
