// Cliente del único punto de escritura del sistema: POST /api/v1/cargas
// (DEC-009). Clasifica las respuestas para el sincronizador: aceptada
// (201 creada / 200 idempotente), rechazo definitivo (4xx: reintentar
// no lo va a arreglar) o reintentable (sin red / 5xx).

import type { ClienteApi, RespuestaApi } from "../offline/sincronizador";
import type { PayloadCarga } from "../offline/bd";

export function crearClienteApi(urlBase: string): ClienteApi {
  return {
    async registrarCarga(payload: PayloadCarga): Promise<RespuestaApi> {
      let respuesta: Response;
      try {
        respuesta = await fetch(`${urlBase}/api/v1/cargas`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        return { tipo: "reintentable", detalle: `sin conexión: ${String(error)}` };
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
        return { tipo: "rechazo_definitivo", detalle: `HTTP ${respuesta.status}: ${await respuesta.text()}` };
      }

      return { tipo: "reintentable", detalle: `HTTP ${respuesta.status}` };
    },
  };
}
