// Sesión del tablero: login, renovación y expiración.
//
// Es la puerta del producto multiempresa: aquí NO se elige empresa, ni
// se manda un identificador de cliente. Se mandan credenciales y el
// servidor decide. Estas pruebas fijan justamente eso, además del
// comportamiento ante tokens inválidos.

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cerrarSesion,
  cerrarSesionLocal,
  haySesion,
  iniciarSesion,
  SesionVencida,
  solicitar,
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

describe("login del supervisor", () => {
  it("solo manda credenciales: ni empresa, ni sede, ni cliente_id", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuesta(TOKENS));
    vi.stubGlobal("fetch", fetchFalso);

    expect(await iniciarSesion("supervisora@empresa.com", "clave")).toBe(true);

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
    expect(await iniciarSesion("quien@sea.com", "mal")).toBe(false);
    expect(haySesion()).toBe(false);
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
