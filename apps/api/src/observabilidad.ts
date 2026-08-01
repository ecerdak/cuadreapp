// Observabilidad por defecto (DEC-012): un solo middleware, ningún
// endpoint repite lógica. Cada petición emite un evento estructurado y
// toda respuesta JSON lleva el request_id (cuerpo + encabezado
// x-request-id). Prohibido registrar fotografías, tokens o datos
// sensibles: por eso el evento se arma con una lista cerrada de campos
// y nunca con el cuerpo de la petición.

import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import type { FastifyInstance } from "fastify";

const requerir = createRequire(import.meta.url);
const VERSION_API: string = requerir("../package.json").version;
const VERSION_DOMINIO: string = requerir("@cuadreapp/dominio/package.json").version;

/** Contexto que las rutas pueden aportar al evento (nunca es lógica de
 *  observabilidad repetida: es la ruta contando qué pasó). */
export interface ContextoObservable {
  clienteId?: string;
  sedeId?: string;
  usuarioId?: string; // llega cuando exista autenticación
  banderas?: string[];
  resultado?: string;
  error?: string;
}

export interface EventoSolicitud {
  request_id: string;
  timestamp: string;
  endpoint: string;
  estado_http: number;
  duracion_ms: number;
  resultado: string;
  errores: string | null;
  cliente_id: string | null;
  sede_id: string | null;
  usuario_id: string | null;
  banderas: string[] | null;
  version_api: string;
  version_dominio: string;
}

declare module "fastify" {
  interface FastifyRequest {
    idSolicitud: string;
    inicioNs: bigint;
    observable: ContextoObservable;
  }
}

export type EmisorEventos = (evento: EventoSolicitud) => void;

const emitirAConsola: EmisorEventos = (evento) => {
  console.log(JSON.stringify(evento));
};

export function registrarObservabilidad(
  app: FastifyInstance,
  emitir: EmisorEventos = emitirAConsola,
): void {
  app.addHook("onRequest", async (solicitud, respuesta) => {
    solicitud.idSolicitud = randomUUID();
    solicitud.inicioNs = process.hrtime.bigint();
    solicitud.observable = {};
    respuesta.header("x-request-id", solicitud.idSolicitud);
  });

  app.addHook("onSend", async (solicitud, respuesta, cuerpo) => {
    const tipoContenido = String(respuesta.getHeader("content-type") ?? "");
    if (typeof cuerpo === "string" && tipoContenido.includes("application/json")) {
      try {
        const objeto = JSON.parse(cuerpo);
        if (objeto !== null && typeof objeto === "object" && !Array.isArray(objeto)) {
          objeto.request_id = solicitud.idSolicitud;
          return JSON.stringify(objeto);
        }
      } catch {
        // cuerpo no parseable: se deja intacto, el encabezado ya lleva el id
      }
    }
    return cuerpo;
  });

  app.addHook("onError", async (solicitud, _respuesta, error) => {
    solicitud.observable.error = error.message;
  });

  app.addHook("onResponse", async (solicitud, respuesta) => {
    const duracionMs = Number(process.hrtime.bigint() - solicitud.inicioNs) / 1_000_000;
    emitir({
      request_id: solicitud.idSolicitud,
      timestamp: new Date().toISOString(),
      endpoint: `${solicitud.method} ${solicitud.routeOptions.url ?? solicitud.url}`,
      estado_http: respuesta.statusCode,
      duracion_ms: Math.round(duracionMs * 10) / 10,
      resultado: solicitud.observable.resultado ?? (respuesta.statusCode < 400 ? "ok" : "error"),
      errores: solicitud.observable.error ?? null,
      cliente_id: solicitud.observable.clienteId ?? null,
      sede_id: solicitud.observable.sedeId ?? null,
      usuario_id: solicitud.observable.usuarioId ?? null,
      banderas: solicitud.observable.banderas ?? null,
      version_api: VERSION_API,
      version_dominio: VERSION_DOMINIO,
    });
  });
}
