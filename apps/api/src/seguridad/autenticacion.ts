// Middleware de autenticación (DEC-013): verifica la firma del JWT de
// Supabase localmente (sin viaje de red por petición) y resuelve la
// sesión contra el RBAC propio en la base — nunca contra claims del
// token (DEC-004). Dar de baja un usuario o dispositivo surte efecto
// en la siguiente petición, sin esperar expiración de tokens.
//
// Cierre de infraestructura: los proyectos nuevos de Supabase firman
// con claves ASIMÉTRICAS (ES256, publicadas por JWKS); los legados,
// con el secreto compartido HS256. Se decide por el header del token:
// HS256 → secreto; ES256/RS256 → JWKS (jose cachea las claves, sin
// viaje de red por petición).

import { decodeProtectedHeader, jwtVerify, type JWTVerifyGetKey } from "jose";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { SesionAutenticada } from "./tipos.js";
import type { RepositorioSeguridad } from "../repositorio/tipos.js";

declare module "fastify" {
  interface FastifyRequest {
    sesion?: SesionAutenticada;
  }
}

export type PreManejador = (solicitud: FastifyRequest, respuesta: FastifyReply) => Promise<unknown>;

export function crearAutenticacion(opciones: {
  secretoJwt: string;
  repositorio: RepositorioSeguridad;
  /** JWKS del proyecto (createRemoteJWKSet en producción; local en pruebas). */
  jwks?: JWTVerifyGetKey;
}): PreManejador {
  const clave = new TextEncoder().encode(opciones.secretoJwt);

  return async (solicitud, respuesta) => {
    const encabezado = solicitud.headers.authorization;
    if (!encabezado?.startsWith("Bearer ")) {
      solicitud.observable.resultado = "no_autenticado";
      return respuesta.status(401).send({ error: "NO_AUTENTICADO" });
    }

    let usuarioId: string;
    try {
      const token = encabezado.slice("Bearer ".length);
      const alg = decodeProtectedHeader(token).alg;
      const { payload } =
        alg === "HS256"
          ? await jwtVerify(token, clave)
          : opciones.jwks
            ? await jwtVerify(token, opciones.jwks)
            : (() => {
                throw new Error(`token ${alg} sin JWKS configurado`);
              })();
      if (typeof payload.sub !== "string") throw new Error("token sin sub");
      usuarioId = payload.sub;
    } catch {
      solicitud.observable.resultado = "token_invalido";
      return respuesta.status(401).send({ error: "TOKEN_INVALIDO" });
    }

    const sesion = await opciones.repositorio.obtenerSesion(usuarioId);
    if (!sesion) {
      solicitud.observable.resultado = "sesion_inactiva";
      return respuesta.status(401).send({ error: "SESION_INACTIVA" });
    }

    solicitud.sesion = sesion;
    solicitud.observable.usuarioId = sesion.usuarioId;
    solicitud.observable.clienteId = sesion.clienteId ?? undefined;
    solicitud.observable.sedeId = sesion.sedeId ?? undefined;
  };
}

/** Middleware de autorización RBAC: la ruta declara el permiso que
 *  exige y el middleware lo busca en la sesión ya resuelta. */
export function exigirPermiso(permiso: string): PreManejador {
  return async (solicitud, respuesta) => {
    if (!solicitud.sesion?.permisos.includes(permiso)) {
      solicitud.observable.resultado = "sin_permiso";
      return respuesta.status(403).send({ error: "SIN_PERMISO", permiso });
    }
  };
}
