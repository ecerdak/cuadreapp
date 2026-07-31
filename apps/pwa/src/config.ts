export const URL_API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
export const VERSION_APP = "0.1.0";

const CLAVE_DEVICE_ID = "cuadreapp:device_id";

/** Identificador estable del dispositivo (viaja en cada carga para trazabilidad). */
export function obtenerDeviceId(): string {
  let id = localStorage.getItem(CLAVE_DEVICE_ID);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLAVE_DEVICE_ID, id);
  }
  return id;
}
