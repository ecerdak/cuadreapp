// Adaptador entre el sincronizador y la API, montado sobre el ÚNICO
// cliente HTTP (DEC-014): aquí no hay fetch, ni tokens, ni renovación —
// eso es del ClienteHttp. Solo clasificación de respuestas para la
// cola: aceptada (201 / 200 idempotente), rechazo definitivo (4xx) o
// reintentable (sin red / 5xx / sesión vencida — la cola queda intacta
// y sube tras re-enrolar).

import { ClienteHttp, ErrorRed, ErrorSesionVencida } from "./cliente-http";
import type { ClienteApi, RespuestaApi, RespuestaFoto } from "../offline/sincronizador";
import type { PayloadCarga } from "../offline/bd";

function comoReintentable(error: unknown): { tipo: "reintentable"; detalle: string } {
  if (error instanceof ErrorSesionVencida) {
    return { tipo: "reintentable", detalle: "sesión vencida: re-enrolar el dispositivo" };
  }
  if (error instanceof ErrorRed) {
    return { tipo: "reintentable", detalle: "sin conexión" };
  }
  throw error;
}

export function crearClienteApi(http: ClienteHttp): ClienteApi {
  return {
    async registrarCarga(payload: PayloadCarga): Promise<RespuestaApi> {
      let respuesta: Response;
      try {
        respuesta = await http.solicitar("/api/v1/cargas", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        return comoReintentable(error);
      }

      if (respuesta.status === 201 || respuesta.status === 200) {
        const cuerpo = await respuesta.json();
        return {
          tipo: "aceptada",
          veredicto: {
            estado: cuerpo.estado,
            banderas: cuerpo.banderas,
            gal_no_registrados: cuerpo.gal_no_registrados ?? null,
            request_id: cuerpo.request_id,
          },
        };
      }
      if (respuesta.status >= 400 && respuesta.status < 500) {
        return {
          tipo: "rechazo_definitivo",
          detalle: `HTTP ${respuesta.status}: ${await respuesta.text()}`,
        };
      }
      return { tipo: "reintentable", detalle: `HTTP ${respuesta.status}` };
    },

    async subirFoto(cargaId, momento, bytes, tipo): Promise<RespuestaFoto> {
      let respuesta: Response;
      try {
        respuesta = await http.solicitar(`/api/v1/cargas/${cargaId}/fotos/${momento}`, {
          method: "POST",
          headers: { "content-type": tipo },
          body: bytes,
        });
      } catch (error) {
        return comoReintentable(error);
      }

      if (respuesta.status === 201) {
        const cuerpo = await respuesta.json();
        return { tipo: "aceptada", storagePath: cuerpo.storage_path };
      }
      if (respuesta.status >= 400 && respuesta.status < 500) {
        return { tipo: "rechazo_definitivo", detalle: `HTTP ${respuesta.status}` };
      }
      return { tipo: "reintentable", detalle: `HTTP ${respuesta.status}` };
    },
  };
}
