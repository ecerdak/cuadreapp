// Borrador persistente de la captura en curso (FASE 5 del hardening):
// hasta ahora el borrador vivía solo en memoria React — si Android
// mataba la app a mitad de una carga, las fotos ya tomadas se perdían.
// Regla absoluta del sprint: nunca perder una fotografía. El borrador
// se persiste en Dexie en cada cambio y se restaura al reabrir; solo
// se limpia al guardar la carga o al volver al inicio.

import type { BdLocal } from "./bd";

const CLAVE = "actual";

export interface BorradorGuardado {
  clave: string;
  paso: string;
  datos: unknown;
  guardadoEn: string;
}

export async function guardarBorrador(bd: BdLocal, paso: string, datos: unknown): Promise<void> {
  await bd.borradores.put({ clave: CLAVE, paso, datos, guardadoEn: new Date().toISOString() });
}

export async function cargarBorrador(bd: BdLocal): Promise<BorradorGuardado | null> {
  return (await bd.borradores.get(CLAVE)) ?? null;
}

export async function limpiarBorrador(bd: BdLocal): Promise<void> {
  await bd.borradores.delete(CLAVE);
}
