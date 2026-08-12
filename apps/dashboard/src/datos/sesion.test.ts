// Sesión del tablero: login, renovación y expiración.
//
// Es la puerta del producto multiempresa: aquí NO se elige empresa, ni
// se manda un identificador de cliente. Se mandan credenciales y el
// servidor decide. Estas pruebas fijan justamente eso, además del
// comportamiento ante tokens inválidos.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AccesoDesactivado,
  alPerderLaSesion,
  cambiarPassword,
  cerrarSesion,
  cerrarSesionLocal,
  haySesion,
  iniciarSesion,
  restablecerPassword,
  SesionVencida,
  solicitar,
  solicitarRecuperacion,
  tokensDelFragmento,
  tomarPasswordTemporal,
} from "./sesion";

/** localStorage mínimo: el entorno de pruebas no trae navegador. */
function almacenEnMemoria() {
  const datos = new Map<string, string>();
  return {
    getItem: (clave: string) => datos.get(clave) ?? null,
    setItem: (clave: string, valor: string) => datos.set(clave, valor),
    removeItem: (clave: string) => datos.delete(clave),
    get tamano() {
      return datos.size;
    },
  };
}

let almacen = almacenEnMemoria();
const respuesta = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "content-type": "application/json" } });
const TOKENS = { access_token: "acceso-1", refresh_token: "refresco-1" };

beforeEach(() => {
  almacen = almacenEnMemoria();
  vi.stubGlobal("localStorage", almacen);
  cerrarSesionLocal();
});

afterEach(() => {
  alPerderLaSesion(null);
});

describe("login del supervisor", () => {
  it("solo manda credenciales: ni empresa, ni sede, ni cliente_id", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuesta(TOKENS));
    vi.stubGlobal("fetch", fetchFalso);

    expect(await iniciarSesion("supervisora@empresa.com", "clave")).toMatchObject({ ok: true });

    const [url, opciones] = fetchFalso.mock.calls[0]!;
    expect(String(url)).toContain("/api/v1/auth/login");
    expect(JSON.parse(String(opciones.body))).toEqual({
      email: "supervisora@empresa.com",
      password: "clave",
    });
    expect(haySesion()).toBe(true);
  });

  it("credenciales incorrectas no abren sesión", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta({ error: "CREDENCIALES" }, 401)));
    expect(await iniciarSesion("quien@sea.com", "mal")).toMatchObject({
      ok: false,
      motivo: "credenciales",
    });
    expect(haySesion()).toBe(false);
  });

  it("el límite de intentos (429) se distingue de las credenciales malas", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta({ error: "SOLICITUD_RECHAZADA" }, 429)));
    expect(await iniciarSesion("quien@sea.com", "bien")).toMatchObject({
      ok: false,
      motivo: "limite",
    });
  });

  it("el acceso revocado por la consola se distingue de las credenciales malas (P0.4)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta({ error: "ACCESO_DESACTIVADO" }, 403)));
    expect(await iniciarSesion("revocada@empresa.com", "correcta")).toMatchObject({
      ok: false,
      motivo: "desactivado",
    });
    expect(haySesion()).toBe(false);
  });

  it("informa la contraseña temporal y la guarda SOLO en memoria para el primer cambio", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respuesta({ ...TOKENS, debe_cambiar_password: true })),
    );
    const resultado = await iniciarSesion("nueva@empresa.com", "Cuadre-temporal1");
    expect(resultado).toEqual({ ok: true, debeCambiarPassword: true });
    // La temporal se consume UNA vez y desaparece.
    expect(tomarPasswordTemporal()).toBe("Cuadre-temporal1");
    expect(tomarPasswordTemporal()).toBeNull();
    // Jamás toca el almacenamiento del navegador.
    expect(almacen.getItem("cuadreapp-tablero:refresh")).toBe(TOKENS.refresh_token);
    expect(almacen.tamano).toBe(1);
  });
});

describe("ciclo de contraseña (P0.1)", () => {
  it("cambiarPassword manda actual y nueva por el cliente autenticado", async () => {
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(respuesta(TOKENS)) // login
      .mockResolvedValueOnce(respuesta({ ok: true })); // cambio
    vi.stubGlobal("fetch", fetchFalso);
    await iniciarSesion("supervisora@empresa.com", "clave");

    expect(await cambiarPassword("Cuadre-temporal1", "MiClavePropia1")).toBe("ok");
    const [url, opciones] = fetchFalso.mock.calls[1]!;
    expect(String(url)).toContain("/api/v1/auth/password");
    expect(JSON.parse(String(opciones.body))).toEqual({
      password_actual: "Cuadre-temporal1",
      password_nueva: "MiClavePropia1",
    });
  });

  it("distingue la contraseña actual incorrecta del resto de fallos", async () => {
    // La API responde 403 (no 401) a propósito: un 401 dispararía la
    // renovación de una sesión que está perfectamente viva.
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(respuesta(TOKENS))
      .mockResolvedValueOnce(respuesta({ error: "PASSWORD_ACTUAL_INCORRECTA" }, 403))
      .mockResolvedValueOnce(respuesta({ error: "ERROR_INTERNO" }, 500));
    vi.stubGlobal("fetch", fetchFalso);
    await iniciarSesion("supervisora@empresa.com", "clave");

    expect(await cambiarPassword("mala", "MiClavePropia1")).toBe("actual_incorrecta");
    expect(await cambiarPassword("Cuadre-temporal1", "MiClavePropia1")).toBe("error");
    // La sesión sigue viva: equivocarse de contraseña no te saca.
    expect(haySesion()).toBe(true);
  });

  it("solicitarRecuperacion contacta al servidor y solo distingue la red caída", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuesta({ ok: true }));
    vi.stubGlobal("fetch", fetchFalso);
    expect(await solicitarRecuperacion("persona@empresa.com")).toBe(true);
    expect(String(fetchFalso.mock.calls[0]![0])).toContain("/api/v1/auth/recuperar");

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    expect(await solicitarRecuperacion("persona@empresa.com")).toBe(false);
  });

  it("tokensDelFragmento lee el enlace del correo y rechaza fragmentos incompletos", () => {
    expect(tokensDelFragmento("#access_token=acc-1&refresh_token=ref-1&type=recovery")).toEqual({
      access_token: "acc-1",
      refresh_token: "ref-1",
    });
    expect(tokensDelFragmento("#type=recovery")).toBeNull();
    expect(tokensDelFragmento("")).toBeNull();
  });

  it("restablecerPassword adopta la sesión del enlace y define la nueva", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuesta({ ok: true }));
    vi.stubGlobal("fetch", fetchFalso);

    const ok = await restablecerPassword(
      { access_token: "acc-enlace", refresh_token: "ref-enlace" },
      "MiClavePropia1",
    );

    expect(ok).toBe(true);
    const [url, opciones] = fetchFalso.mock.calls[0]!;
    expect(String(url)).toContain("/api/v1/auth/password-restablecer");
    expect((opciones.headers as Record<string, string>).authorization).toBe("Bearer acc-enlace");
    expect(JSON.parse(String(opciones.body))).toEqual({ password_nueva: "MiClavePropia1" });
    // La sesión adoptada queda viva: el tablero abre sin volver a entrar.
    expect(haySesion()).toBe(true);
  });
});

describe("tokens: renovación y expiración", () => {
  it("sin sesión, cualquier petición muere con SesionVencida antes de salir a la red", async () => {
    const fetchFalso = vi.fn();
    vi.stubGlobal("fetch", fetchFalso);
    await expect(solicitar("/api/v1/tablero/hoy")).rejects.toBeInstanceOf(SesionVencida);
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("un 401 dispara UNA renovación y reintenta con el token nuevo", async () => {
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(respuesta(TOKENS)) // login
      .mockResolvedValueOnce(respuesta({ error: "TOKEN_INVALIDO" }, 401)) // 1er intento
      .mockResolvedValueOnce(respuesta({ ...TOKENS, access_token: "acceso-2" })) // refresh
      .mockResolvedValueOnce(respuesta({ ok: true })); // reintento
    vi.stubGlobal("fetch", fetchFalso);

    await iniciarSesion("supervisora@empresa.com", "clave");
    const salida = await solicitar("/api/v1/tablero/hoy");

    expect(salida.status).toBe(200);
    expect(fetchFalso).toHaveBeenCalledTimes(4);
    const reintento = fetchFalso.mock.calls[3]![1] as RequestInit;
    expect((reintento.headers as Record<string, string>).authorization).toBe("Bearer acceso-2");
  });

  it("si la renovación también falla, la sesión local se borra y se exige entrar de nuevo", async () => {
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(respuesta(TOKENS))
      .mockResolvedValueOnce(respuesta({ error: "TOKEN_INVALIDO" }, 401))
      .mockResolvedValueOnce(respuesta({ error: "REFRESH_INVALIDO" }, 401));
    vi.stubGlobal("fetch", fetchFalso);

    await iniciarSesion("supervisora@empresa.com", "clave");
    await expect(solicitar("/api/v1/tablero/hoy")).rejects.toBeInstanceOf(SesionVencida);
    expect(haySesion()).toBe(false);
  });

  it("un 401 SESION_INACTIVA es un acceso revocado: ni renueva, ni finge expiración (P0.4)", async () => {
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(respuesta(TOKENS)) // login
      .mockResolvedValueOnce(respuesta({ error: "SESION_INACTIVA" }, 401)); // petición
    vi.stubGlobal("fetch", fetchFalso);
    const motivos: string[] = [];
    alPerderLaSesion((motivo) => motivos.push(motivo));

    await iniciarSesion("supervisora@empresa.com", "clave");
    await expect(solicitar("/api/v1/tablero/hoy")).rejects.toBeInstanceOf(AccesoDesactivado);

    // Sin intento de refresh: revocado no se arregla renovando tokens.
    expect(fetchFalso).toHaveBeenCalledTimes(2);
    expect(haySesion()).toBe(false);
    expect(motivos).toEqual(["desactivado"]);
  });

  it("la expiración en una pestaña montada avisa al marco para volver al login (P0.4)", async () => {
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(respuesta(TOKENS))
      .mockResolvedValueOnce(respuesta({ error: "TOKEN_INVALIDO" }, 401))
      .mockResolvedValueOnce(respuesta({ error: "REFRESH_INVALIDO" }, 401));
    vi.stubGlobal("fetch", fetchFalso);
    const motivos: string[] = [];
    alPerderLaSesion((motivo) => motivos.push(motivo));

    await iniciarSesion("supervisora@empresa.com", "clave");
    await expect(solicitar("/api/v1/tablero/hoy")).rejects.toBeInstanceOf(SesionVencida);
    expect(motivos).toEqual(["sesion"]);
  });

  it("cerrar sesión revoca en el servidor y no deja rastro local", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuesta(TOKENS));
    vi.stubGlobal("fetch", fetchFalso);
    await iniciarSesion("supervisora@empresa.com", "clave");

    await cerrarSesion();

    expect(String(fetchFalso.mock.calls.at(-1)![0])).toContain("/api/v1/auth/logout");
    expect(haySesion()).toBe(false);
    expect(almacen.tamano).toBe(0);
  });
});
