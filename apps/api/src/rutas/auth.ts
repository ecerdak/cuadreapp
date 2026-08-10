// Endpoints de autenticación (DEC-013): la API media contra Supabase
// Auth del lado del servidor. Son los únicos endpoints (junto con
// /salud y el enrolamiento) que no exigen un token — porque son
// quienes lo emiten. Las credenciales atraviesan la API pero nunca se
// persisten ni se loguean (DEC-012 lo garantiza estructuralmente).

import { z } from "zod";
import { decodeJwt } from "jose";
import type { FastifyInstance } from "fastify";
import type { ProveedorIdentidad } from "../seguridad/tipos.js";
import type { PreManejador } from "../seguridad/autenticacion.js";
import type { RepositorioSeguridad } from "../repositorio/tipos.js";

const esquemaLogin = z.object({ email: z.string().email(), password: z.string().min(1) }).strict();
const esquemaRefresh = z.object({ refresh_token: z.string().min(1) }).strict();

export function registrarRutasAuth(
  app: FastifyInstance,
  dependencias: {
    proveedor: ProveedorIdentidad;
    autenticar: PreManejador;
    /** Etapa P.2: sella el último acceso. Opcional — sin él el login
     *  funciona igual, solo no queda el sello. */
    repositorioSeguridad?: RepositorioSeguridad;
  },
): void {
  const { autenticar } = dependencias;

  /** Sella el login sin poder tumbarlo: el token ya se emitió y la
   *  telemetría jamás decide si alguien entra. El `sub` sale del
   *  access token recién acuñado por el proveedor — no hace falta
   *  verificarlo porque lo acabamos de recibir de él. */
  const sellarAcceso = async (accessToken: string): Promise<void> => {
    if (!dependencias.repositorioSeguridad) return;
    try {
      const sub = decodeJwt(accessToken).sub;
      if (typeof sub === "string") {
        await dependencias.repositorioSeguridad.registrarAcceso(sub, new Date().toISOString());
      }
    } catch {
      /* el sello es telemetría: nunca rompe el login */
    }
  };

  // Superficie de fuerza bruta: límites estrictos por IP (Etapa H).
  const limiteAuth = { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } };

  app.post("/api/v1/auth/login", limiteAuth, async (solicitud, respuesta) => {
    const analisis = esquemaLogin.safeParse(solicitud.body);
    if (!analisis.success) {
      solicitud.observable.resultado = "invalido";
      return respuesta.status(400).send({ error: "VALIDACION_ESTRUCTURAL" });
    }

    const tokens = await dependencias.proveedor.iniciarSesionConPassword(
      analisis.data.email,
      analisis.data.password,
    );
    if (!tokens) {
      solicitud.observable.resultado = "credenciales_invalidas";
      // Respuesta idéntica exista o no el email: sin oráculo de cuentas.
      return respuesta.status(401).send({ error: "CREDENCIALES_INVALIDAS" });
    }

    await sellarAcceso(tokens.access_token);
    solicitud.observable.resultado = "login";
    return respuesta.status(200).send(tokens);
  });

  app.post("/api/v1/auth/refresh", limiteAuth, async (solicitud, respuesta) => {
    const analisis = esquemaRefresh.safeParse(solicitud.body);
    if (!analisis.success) {
      solicitud.observable.resultado = "invalido";
      return respuesta.status(400).send({ error: "VALIDACION_ESTRUCTURAL" });
    }

    const tokens = await dependencias.proveedor.refrescarSesion(analisis.data.refresh_token);
    if (!tokens) {
      solicitud.observable.resultado = "refresh_invalido";
      return respuesta.status(401).send({ error: "REFRESH_INVALIDO" });
    }

    solicitud.observable.resultado = "refresh";
    return respuesta.status(200).send(tokens);
  });

  app.post("/api/v1/auth/logout", { preHandler: [autenticar] }, async (solicitud, respuesta) => {
    const encabezado = solicitud.headers.authorization!;
    await dependencias.proveedor.cerrarSesion(encabezado.slice("Bearer ".length));
    solicitud.observable.resultado = "logout";
    return respuesta.status(200).send({ ok: true });
  });

  app.get("/api/v1/me", { preHandler: [autenticar] }, async (solicitud, respuesta) => {
    const sesion = solicitud.sesion!;
    return respuesta.status(200).send({
      usuario_id: sesion.usuarioId,
      nombre: sesion.nombre,
      rol: sesion.rol,
      cliente_id: sesion.clienteId,
      sede_id: sesion.sedeId,
      permisos: sesion.permisos,
      perfil: sesion.perfil,
    });
  });
}
