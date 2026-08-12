// Endpoints de autenticación (DEC-013): la API media contra Supabase
// Auth del lado del servidor. Son los únicos endpoints (junto con
// /salud y el enrolamiento) que no exigen un token — porque son
// quienes lo emiten. Las credenciales atraviesan la API pero nunca se
// persisten ni se loguean (DEC-012 lo garantiza estructuralmente).
//
// P0.1 — ciclo de contraseña del Dashboard:
//   · el login informa `debe_cambiar_password` (la vigente es la
//     temporal de la consola);
//   · /auth/password cambia la propia verificando la actual por el
//     mismo camino del login;
//   · /auth/recuperar dispara el correo de recuperación del proveedor
//     (sin oráculo de cuentas: la respuesta nunca cambia);
//   · /auth/password-restablecer consume la sesión que emite el enlace
//     del correo — poseer ese enlace ES la prueba, no hay contraseña
//     actual que pedir.

import { z } from "zod";
import { decodeJwt } from "jose";
import type { FastifyInstance } from "fastify";
import type { ProveedorIdentidad } from "../seguridad/tipos.js";
import type { PreManejador } from "../seguridad/autenticacion.js";
import type { RepositorioSeguridad } from "../repositorio/tipos.js";

const esquemaLogin = z.object({ email: z.string().email(), password: z.string().min(1) }).strict();
const esquemaRefresh = z.object({ refresh_token: z.string().min(1) }).strict();
// Mínimo 10: el mismo piso que exige el alta de accesos de la consola.
const passwordNueva = z.string().min(10).max(72);
const esquemaPasswordCambio = z
  .object({ password_actual: z.string().min(1), password_nueva: passwordNueva })
  .strict();
const esquemaPasswordRestablecer = z.object({ password_nueva: passwordNueva }).strict();
const esquemaRecuperar = z.object({ email: z.string().trim().toLowerCase().email() }).strict();

/** Claims del access token YA verificado por el middleware (o recién
 *  acuñado por el proveedor): aquí solo se leen, no se re-verifica. */
function claimsDe(token: string): { sub?: string; email?: string; amr?: string[] } {
  try {
    const payload = decodeJwt(token);
    const amr = Array.isArray(payload.amr)
      ? (payload.amr as Array<{ method?: string }>)
          .map((registro) => registro?.method)
          .filter((metodo): metodo is string => typeof metodo === "string")
      : undefined;
    return {
      sub: typeof payload.sub === "string" ? payload.sub : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined,
      amr,
    };
  } catch {
    return {};
  }
}

export function registrarRutasAuth(
  app: FastifyInstance,
  dependencias: {
    proveedor: ProveedorIdentidad;
    autenticar: PreManejador;
    /** Etapa P.2: sella el último acceso. Opcional — sin él el login
     *  funciona igual, solo no queda el sello. */
    repositorioSeguridad?: RepositorioSeguridad;
    /** P0.1: adónde manda el enlace del correo de recuperación
     *  (pantalla /restablecer del Dashboard). Sin él, decide la
     *  Site URL configurada en Supabase. */
    urlRestablecerPassword?: string;
  },
): void {
  const { autenticar } = dependencias;

  /** Sella el login sin poder tumbarlo: el token ya se emitió y la
   *  telemetría jamás decide si alguien entra. */
  const sellarAcceso = async (usuarioId: string | undefined): Promise<void> => {
    if (!usuarioId || !dependencias.repositorioSeguridad) return;
    try {
      await dependencias.repositorioSeguridad.registrarAcceso(usuarioId, new Date().toISOString());
    } catch {
      /* el sello es telemetría: nunca rompe el login */
    }
  };

  /** El flag de contraseña temporal viaja en el login para que el
   *  Dashboard fuerce definir una propia ANTES de pintar el tablero.
   *  Consultarlo jamás tumba el login: sin dato se asume false y el
   *  tablero (403 PASSWORD_TEMPORAL) sigue siendo la autoridad. */
  const debeCambiarPassword = async (usuarioId: string | undefined): Promise<boolean> => {
    if (!usuarioId || !dependencias.repositorioSeguridad) return false;
    try {
      const sesion = await dependencias.repositorioSeguridad.obtenerSesion(usuarioId);
      return sesion?.debeCambiarPassword === true;
    } catch {
      return false;
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

    const usuarioId = claimsDe(tokens.access_token).sub;

    // P0.4: el usuario revocado desde la consola no recibe sesión del
    // Dashboard — y se le dice, en vez de dejarlo rebotar contra 401.
    // Consultar el estado jamás tumba el login de los demás (si el
    // repo falla se sigue: el middleware corta en CADA petición y es
    // la barrera real; esto es la versión con explicación).
    if (usuarioId && dependencias.repositorioSeguridad) {
      try {
        if (await dependencias.repositorioSeguridad.usuarioEstaDesactivado(usuarioId)) {
          solicitud.observable.resultado = "acceso_desactivado";
          return respuesta.status(403).send({ error: "ACCESO_DESACTIVADO" });
        }
      } catch {
        /* ver comentario */
      }
    }

    await sellarAcceso(usuarioId);
    solicitud.observable.resultado = "login";
    return respuesta
      .status(200)
      .send({ ...tokens, debe_cambiar_password: await debeCambiarPassword(usuarioId) });
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

  /* ============ Ciclo de contraseña (P0.1) ============ */

  // Cambio con sesión: la persona conoce su contraseña actual y define
  // una propia. La actual se verifica contra el proveedor por el MISMO
  // camino del login — la API nunca compara contraseñas por su cuenta.
  app.post(
    "/api/v1/auth/password",
    { ...limiteAuth, preHandler: [autenticar] },
    async (solicitud, respuesta) => {
      const analisis = esquemaPasswordCambio.safeParse(solicitud.body);
      if (!analisis.success) {
        solicitud.observable.resultado = "invalido";
        return respuesta.status(400).send({
          error: "VALIDACION_ESTRUCTURAL",
          detalle: "La contraseña nueva debe tener entre 10 y 72 caracteres.",
        });
      }

      const sesion = solicitud.sesion!;
      const email = claimsDe(solicitud.headers.authorization!.slice("Bearer ".length)).email;
      if (!email) {
        // Sesiones sin correo (dispositivos) no tienen contraseña que cambiar.
        solicitud.observable.resultado = "sesion_sin_correo";
        return respuesta.status(400).send({ error: "SESION_SIN_CORREO" });
      }

      const verificacion = await dependencias.proveedor.iniciarSesionConPassword(
        email,
        analisis.data.password_actual,
      );
      if (!verificacion) {
        solicitud.observable.resultado = "password_actual_incorrecta";
        // 403, no 401: un 401 en una ruta autenticada significa «token
        // vencido» para el cliente HTTP y dispararía su renovación —
        // aquí la sesión está bien, lo incorrecto es la contraseña.
        return respuesta.status(403).send({ error: "PASSWORD_ACTUAL_INCORRECTA" });
      }

      if (
        !(await dependencias.proveedor.cambiarPassword(sesion.usuarioId, analisis.data.password_nueva))
      ) {
        solicitud.observable.resultado = "password_no_cambiada";
        return respuesta.status(502).send({ error: "PASSWORD_NO_CAMBIADA" });
      }

      // La contraseña YA cambió en el proveedor: si el flag no se puede
      // limpiar, el tablero volverá a pedir el cambio y la persona lo
      // completa con su contraseña nueva — se auto-repara, no se falla.
      try {
        await dependencias.repositorioSeguridad?.marcarPasswordDefinitiva(sesion.usuarioId);
      } catch {
        /* ver comentario */
      }
      solicitud.observable.resultado = "password_cambiada";
      return respuesta.status(200).send({ ok: true });
    },
  );

  // Restablecimiento: la sesión del bearer nació del ENLACE del correo
  // de recuperación — poseerlo es la prueba de control de la cuenta.
  // Si el token declara sus métodos (amr) y ninguno es `recovery`, no
  // es un restablecimiento: el cambio normal es /auth/password.
  app.post(
    "/api/v1/auth/password-restablecer",
    { ...limiteAuth, preHandler: [autenticar] },
    async (solicitud, respuesta) => {
      const analisis = esquemaPasswordRestablecer.safeParse(solicitud.body);
      if (!analisis.success) {
        solicitud.observable.resultado = "invalido";
        return respuesta.status(400).send({
          error: "VALIDACION_ESTRUCTURAL",
          detalle: "La contraseña nueva debe tener entre 10 y 72 caracteres.",
        });
      }

      const amr = claimsDe(solicitud.headers.authorization!.slice("Bearer ".length)).amr;
      if (amr !== undefined && !amr.includes("recovery")) {
        solicitud.observable.resultado = "solo_recuperacion";
        return respuesta.status(403).send({ error: "SOLO_RECUPERACION" });
      }

      const sesion = solicitud.sesion!;
      if (
        !(await dependencias.proveedor.cambiarPassword(sesion.usuarioId, analisis.data.password_nueva))
      ) {
        solicitud.observable.resultado = "password_no_cambiada";
        return respuesta.status(502).send({ error: "PASSWORD_NO_CAMBIADA" });
      }
      try {
        await dependencias.repositorioSeguridad?.marcarPasswordDefinitiva(sesion.usuarioId);
      } catch {
        /* igual que en /auth/password: se auto-repara en el siguiente ingreso */
      }
      solicitud.observable.resultado = "password_restablecida";
      return respuesta.status(200).send({ ok: true });
    },
  );

  // «Olvidé mi contraseña»: siempre la misma respuesta, exista o no la
  // cuenta. El correo lo envía el proveedor (Supabase Auth) — la
  // dependencia de configuración está documentada en OPERACIONES.md.
  app.post("/api/v1/auth/recuperar", limiteAuth, async (solicitud, respuesta) => {
    const analisis = esquemaRecuperar.safeParse(solicitud.body);
    if (!analisis.success) {
      solicitud.observable.resultado = "invalido";
      return respuesta.status(400).send({ error: "VALIDACION_ESTRUCTURAL" });
    }

    await dependencias.proveedor.enviarRecuperacion(
      analisis.data.email,
      dependencias.urlRestablecerPassword,
    );
    solicitud.observable.resultado = "recuperacion_solicitada";
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
      debe_cambiar_password: sesion.debeCambiarPassword === true,
    });
  });
}
