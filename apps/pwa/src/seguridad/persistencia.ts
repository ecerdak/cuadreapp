// RC1-A3: la cola offline (cargas + fotos pendientes) es la evidencia
// probatoria del producto. Sin persistencia declarada, el navegador
// puede purgar IndexedDB bajo presión de almacenamiento. Se solicita
// al enrolar (el momento en que el dispositivo se vuelve "oficial") y
// la UI avisa cuando el navegador la niega.
//
// El StorageManager es inyectable solo para pruebas: en la app siempre
// es navigator.storage.

export async function solicitarAlmacenamientoPersistente(
  almacen: StorageManager | undefined = globalThis.navigator?.storage,
): Promise<boolean> {
  if (!almacen?.persist) return false;
  try {
    return await almacen.persist();
  } catch {
    return false;
  }
}

/** null = el navegador no expone la API (no se puede saber). */
export async function almacenamientoEsPersistente(
  almacen: StorageManager | undefined = globalThis.navigator?.storage,
): Promise<boolean | null> {
  if (!almacen?.persisted) return null;
  try {
    return await almacen.persisted();
  } catch {
    return null;
  }
}
