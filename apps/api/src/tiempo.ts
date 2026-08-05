// Tiempo de la operación. CuadreApp vive en America/Bogota (UTC-5 fija,
// sin horario de verano): el día del supervisor empieza a medianoche
// local, no a medianoche UTC. Un solo lugar para esa cuenta.

const OFFSET_BOGOTA_MS = 5 * 3_600_000;

/** Medianoche de HOY en America/Bogota, como instante ISO con offset. */
export function inicioHoyBogota(ahora: Date): string {
  const bogota = new Date(ahora.getTime() - OFFSET_BOGOTA_MS);
  return `${bogota.toISOString().slice(0, 10)}T00:00:00-05:00`;
}

/** Medianoche de hace `dias` días en America/Bogota. `dias = 13` abre
 *  la ventana de 14 días (13 días atrás + hoy) que usa el tablero. */
export function inicioHaceDiasBogota(ahora: Date, dias: number): string {
  const bogota = new Date(ahora.getTime() - OFFSET_BOGOTA_MS);
  bogota.setUTCDate(bogota.getUTCDate() - dias);
  return `${bogota.toISOString().slice(0, 10)}T00:00:00-05:00`;
}

/** Fecha local (YYYY-MM-DD) de un instante, en America/Bogota. */
export function fechaBogota(instante: string | Date): string {
  const fecha = typeof instante === "string" ? new Date(instante) : instante;
  return new Date(fecha.getTime() - OFFSET_BOGOTA_MS).toISOString().slice(0, 10);
}

/** Hora local (HH:MM) de un instante, en America/Bogota. */
export function horaBogota(instante: string | Date): string {
  const fecha = typeof instante === "string" ? new Date(instante) : instante;
  return new Date(fecha.getTime() - OFFSET_BOGOTA_MS).toISOString().slice(11, 16);
}
