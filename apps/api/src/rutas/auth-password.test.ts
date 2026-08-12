// Ciclo de contraseña del Dashboard (P0.1). El eje: la contraseña
// TEMPORAL de la consola sirve para entrar UNA vez — el tablero exige
// definir una propia, el cambio verifica la actual por el mismo camino
// del login, y la recuperación jamás revela si una cuenta existe.

import { describe, expect, it } from "vitest";
import { armarAplicacion, crearToken, ID_CLIENTE } from "../pruebas/apoyo.js";
import { RepositorioAdminFalso, sesionAdmin, ID_ADMIN } from "../pruebas/apoyo-admin.js";
import { ID_SUPERVISOR, RepositorioTableroFalso, sesionSupervisor } from "../pruebas/apoyo-tablero.js";
import type { SesionAutenticada } from "../seguridad/tipos.js";

const ID_PERSONA = "77aa1111-2222-4333-8444-555566667777";
const EMAIL = "supervisor@trebol.com";

function sesionPersona(sobre: Partial<SesionAutenticada> = {}): SesionAutenticada {
  return {
    usuarioId: ID_PERSONA,
    nombre: "Patricia Gómez",
    rol: "supervisor",
    clienteId: ID_CLIENTE,
    sedeId: null,
    permisos: ["tablero.leer"],
    perfil: "medidor_doble",
    ...sobre,
  };
}

function armar(sobreSesion: Partial<SesionAutenticada> = {}) {
  const contexto = armarAplicacion();
  contexto.repositorioSeguridad.sesiones.set(ID_PERSONA, sesionPersona(sobreSesion));
  return contexto;
}

const auth = async (claims: Record<string, unknown> = {}) => ({
  authorization: `Bearer ${await crearToken(ID_PERSONA, undefined, claims)}`,
});

describe("POST /api/v1/auth/login — el flag de contraseña temporal viaja en el login", () => {
  it("informa true cuando la vigente es la temporal de la consola", async () => {
    const { app, proveedorIdentidad, repositorioSeguridad } = armar({ debeCambiarPassword: true });
    proveedorIdentidad.usuarioIdSesion = ID_PERSONA;
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: EMAIL, password: "correcta" },
    });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json().debe_cambiar_password).toBe(true);
    expect(repositorioSeguridad.accesosSellados[0]?.usuarioId).toBe(ID_PERSONA);
  });

  it("informa false con contraseña propia (y ante cualquier duda)", async () => {
    const { app, proveedorIdentidad } = armar();
    proveedorIdentidad.usuarioIdSesion = ID_PERSONA;
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: EMAIL, password: "correcta" },
    });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json().debe_cambiar_password).toBe(false);
  });
});

describe("El tablero exige contraseña propia (P0.1)", () => {
  it("responde 403 PASSWORD_TEMPORAL mientras la vigente sea la temporal", async () => {
    const repositorioTablero = new RepositorioTableroFalso();
    const contexto = armarAplicacion({ repositorioTablero });
    contexto.repositorioSeguridad.sesiones.set(
      ID_SUPERVISOR,
      sesionSupervisor({ debeCambiarPassword: true }),
    );
    const respuesta = await contexto.app.inject({
      method: "GET",
      url: "/api/v1/tablero/contexto",
      headers: { authorization: `Bearer ${await crearToken(ID_SUPERVISOR)}` },
    });
    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json().error).toBe("PASSWORD_TEMPORAL");
  });

  it("con contraseña propia el tablero abre normal", async () => {
    const repositorioTablero = new RepositorioTableroFalso();
    const contexto = armarAplicacion({ repositorioTablero });
    contexto.repositorioSeguridad.sesiones.set(ID_SUPERVISOR, sesionSupervisor({}));
    const respuesta = await contexto.app.inject({
      method: "GET",
      url: "/api/v1/tablero/contexto",
      headers: { authorization: `Bearer ${await crearToken(ID_SUPERVISOR)}` },
    });
    expect(respuesta.statusCode).toBe(200);
  });
});

describe("POST /api/v1/auth/password — cambio con sesión", () => {
  it("cambia la contraseña verificando la actual y limpia el flag", async () => {
    const { app, proveedorIdentidad, repositorioSeguridad } = armar({ debeCambiarPassword: true });
    proveedorIdentidad.credencialesValidas = { email: EMAIL, password: "Cuadre-temporal1" };
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password",
      headers: await auth({ email: EMAIL }),
      payload: { password_actual: "Cuadre-temporal1", password_nueva: "MiClavePropia1" },
    });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json().ok).toBe(true);
    expect(proveedorIdentidad.passwordsCambiadas).toEqual([
      { usuarioId: ID_PERSONA, password: "MiClavePropia1" },
    ]);
    expect(repositorioSeguridad.passwordsDefinitivas).toContain(ID_PERSONA);
    // La siguiente sesión ya no está forzada a cambiar.
    expect(repositorioSeguridad.sesiones.get(ID_PERSONA)?.debeCambiarPassword).toBe(false);
  });

  it("rechaza la contraseña actual incorrecta sin tocar nada", async () => {
    const { app, proveedorIdentidad, repositorioSeguridad } = armar();
    proveedorIdentidad.credencialesValidas = { email: EMAIL, password: "Cuadre-temporal1" };
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password",
      headers: await auth({ email: EMAIL }),
      payload: { password_actual: "equivocada", password_nueva: "MiClavePropia1" },
    });
    // 403, no 401: un 401 haría que el cliente HTTP intente renovar la
    // sesión (que está perfectamente viva) y hasta la cierre.
    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json().error).toBe("PASSWORD_ACTUAL_INCORRECTA");
    expect(proveedorIdentidad.passwordsCambiadas).toEqual([]);
    expect(repositorioSeguridad.passwordsDefinitivas).toEqual([]);
  });

  it("rechaza una contraseña nueva corta con detalle humano", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password",
      headers: await auth({ email: EMAIL }),
      payload: { password_actual: "Cuadre-temporal1", password_nueva: "corta" },
    });
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.json().detalle).toContain("entre 10 y 72");
  });

  it("una sesión sin correo (dispositivo) no tiene contraseña que cambiar", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password",
      headers: await auth(), // token sin claim email
      payload: { password_actual: "Cuadre-temporal1", password_nueva: "MiClavePropia1" },
    });
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.json().error).toBe("SESION_SIN_CORREO");
  });

  it("si el proveedor no puede cambiarla, el flag queda intacto (502)", async () => {
    const { app, proveedorIdentidad, repositorioSeguridad } = armar({ debeCambiarPassword: true });
    proveedorIdentidad.credencialesValidas = { email: EMAIL, password: "Cuadre-temporal1" };
    proveedorIdentidad.fallaAlCambiarPassword = true;
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password",
      headers: await auth({ email: EMAIL }),
      payload: { password_actual: "Cuadre-temporal1", password_nueva: "MiClavePropia1" },
    });
    expect(respuesta.statusCode).toBe(502);
    expect(respuesta.json().error).toBe("PASSWORD_NO_CAMBIADA");
    expect(repositorioSeguridad.passwordsDefinitivas).toEqual([]);
  });

  it("sin token responde 401", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password",
      payload: { password_actual: "x", password_nueva: "MiClavePropia1" },
    });
    expect(respuesta.statusCode).toBe(401);
  });
});

describe("POST /api/v1/auth/password-restablecer — desde el enlace del correo", () => {
  it("acepta la sesión de recuperación y define la contraseña", async () => {
    const { app, proveedorIdentidad, repositorioSeguridad } = armar({ debeCambiarPassword: true });
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password-restablecer",
      headers: await auth({ amr: [{ method: "recovery" }] }),
      payload: { password_nueva: "MiClavePropia1" },
    });
    expect(respuesta.statusCode).toBe(200);
    expect(proveedorIdentidad.passwordsCambiadas).toEqual([
      { usuarioId: ID_PERSONA, password: "MiClavePropia1" },
    ]);
    expect(repositorioSeguridad.passwordsDefinitivas).toContain(ID_PERSONA);
  });

  it("rechaza una sesión normal que declara sus métodos sin recovery", async () => {
    const { app, proveedorIdentidad } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password-restablecer",
      headers: await auth({ amr: [{ method: "password" }] }),
      payload: { password_nueva: "MiClavePropia1" },
    });
    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json().error).toBe("SOLO_RECUPERACION");
    expect(proveedorIdentidad.passwordsCambiadas).toEqual([]);
  });

  it("sin claim amr se acepta (tokens que no declaran métodos)", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password-restablecer",
      headers: await auth(),
      payload: { password_nueva: "MiClavePropia1" },
    });
    expect(respuesta.statusCode).toBe(200);
  });

  it("rechaza una contraseña corta", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password-restablecer",
      headers: await auth({ amr: [{ method: "recovery" }] }),
      payload: { password_nueva: "corta" },
    });
    expect(respuesta.statusCode).toBe(400);
  });
});

describe("POST /api/v1/auth/recuperar — sin oráculo de cuentas", () => {
  it("dispara la recuperación del proveedor con el destino configurado", async () => {
    const contexto = armarAplicacion({
      urlRestablecerPassword: "https://tablero.ejemplo/restablecer",
    });
    const respuesta = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/auth/recuperar",
      payload: { email: "Persona@Trebol.com" },
    });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json().ok).toBe(true);
    expect(contexto.proveedorIdentidad.recuperacionesEnviadas).toEqual([
      { email: "persona@trebol.com", redirigirA: "https://tablero.ejemplo/restablecer" },
    ]);
  });

  it("responde idéntico exista o no la cuenta", async () => {
    const { app } = armar();
    const conocida = await app.inject({
      method: "POST",
      url: "/api/v1/auth/recuperar",
      payload: { email: EMAIL },
    });
    const desconocida = await app.inject({
      method: "POST",
      url: "/api/v1/auth/recuperar",
      payload: { email: "nadie@ninguna.com" },
    });
    expect(conocida.statusCode).toBe(200);
    expect(desconocida.statusCode).toBe(200);
    expect(conocida.json().ok).toBe(desconocida.json().ok);
  });

  it("rechaza un correo malformado", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/recuperar",
      payload: { email: "no-es-correo" },
    });
    expect(respuesta.statusCode).toBe(400);
  });
});

describe("La consola marca la contraseña temporal (P0.1)", () => {
  const CLIENTE = "dddd1111-2222-4333-8444-555566667777";

  async function armarAdmin() {
    const repositorioAdmin = new RepositorioAdminFalso();
    const contexto = armarAplicacion({ repositorioAdmin });
    contexto.repositorioSeguridad.sesiones.set(ID_ADMIN, sesionAdmin());
    const headers = { authorization: `Bearer ${await crearToken(ID_ADMIN)}` };
    return { ...contexto, repositorioAdmin, headers };
  }

  it("el alta nace con contraseña temporal", async () => {
    const { app, repositorioAdmin, headers } = await armarAdmin();
    const respuesta = await app.inject({
      method: "POST",
      url: `/api/v1/admin/clientes/${CLIENTE}/accesos`,
      headers,
      payload: { nombre: "Patricia Gómez", email: "patricia@cliente.com" },
    });
    expect(respuesta.statusCode).toBe(201);
    expect(repositorioAdmin.passwordsTemporales.has(respuesta.json().usuarioId)).toBe(true);
  });

  it("regenerar la contraseña vuelve a marcarla temporal", async () => {
    const { app, repositorioAdmin, headers } = await armarAdmin();
    const alta = await app.inject({
      method: "POST",
      url: `/api/v1/admin/clientes/${CLIENTE}/accesos`,
      headers,
      payload: { nombre: "Patricia Gómez", email: "patricia@cliente.com" },
    });
    const usuarioId = alta.json().usuarioId;
    repositorioAdmin.passwordsTemporales.delete(usuarioId); // definió la suya

    const respuesta = await app.inject({
      method: "POST",
      url: `/api/v1/admin/clientes/${CLIENTE}/accesos/${usuarioId}/password`,
      headers,
    });
    expect(respuesta.statusCode).toBe(200);
    expect(repositorioAdmin.passwordsTemporales.has(usuarioId)).toBe(true);
  });
});
