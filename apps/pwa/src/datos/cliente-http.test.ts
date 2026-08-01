import { describe, expect, it } from "vitest";
import { ClienteHttp, ErrorRed, ErrorSesionVencida } from "./cliente-http";
import { TokenStoreMemoria } from "../seguridad/token-store";

const URL = "http://api.prueba";

interface LlamadaRegistrada {
  url: string;
  autorizacion: string | undefined;
}

function crearFetchFalso(manejar: (url: string, init: RequestInit, numero: number) => Response): {
  fetchFn: typeof fetch;
  llamadas: LlamadaRegistrada[];
} {
  const llamadas: LlamadaRegistrada[] = [];
  const fetchFn = (async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const url = String(entrada);
    const encabezados = (init?.headers ?? {}) as Record<string, string>;
    llamadas.push({ url, autorizacion: encabezados.authorization });
    return manejar(url, init ?? {}, llamadas.length);
  }) as typeof fetch;
  return { fetchFn, llamadas };
}

const respuestaJson = (estado: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { "content-type": "application/json" },
  });

const tokensNuevos = { access_token: "acc-nuevo", refresh_token: "ref-nuevo", expira_en_s: 3600 };

function accesoVigente(token = "acc-vigente") {
  return { token, expiraEnMs: Date.now() + 3600_000 };
}

describe("ClienteHttp — el único camino a la API (DEC-014)", () => {
  it("adjunta el Bearer del access vigente", async () => {
    const tokens = new TokenStoreMemoria({ access: accesoVigente(), refresh: "ref-1" });
    const { fetchFn, llamadas } = crearFetchFalso(() => respuestaJson(200, { ok: true }));
    const http = new ClienteHttp(URL, tokens, { fetchFn });

    const respuesta = await http.solicitar("/api/v1/me");

    expect(respuesta.status).toBe(200);
    expect(llamadas).toHaveLength(1);
    expect(llamadas[0]!.autorizacion).toBe("Bearer acc-vigente");
  });

  it("renueva ANTES de la petición si el access está vencido o por vencer", async () => {
    const tokens = new TokenStoreMemoria({
      access: { token: "acc-viejo", expiraEnMs: Date.now() + 10_000 }, // dentro del margen de 60 s
      refresh: "ref-1",
    });
    const { fetchFn, llamadas } = crearFetchFalso((url) =>
      url.endsWith("/auth/refresh")
        ? respuestaJson(200, tokensNuevos)
        : respuestaJson(200, { ok: true }),
    );
    const http = new ClienteHttp(URL, tokens, { fetchFn });

    await http.solicitar("/api/v1/me");

    expect(llamadas[0]!.url).toContain("/auth/refresh");
    expect(llamadas[1]!.autorizacion).toBe("Bearer acc-nuevo");
  });

  it("ante un 401 renueva y reintenta UNA sola vez", async () => {
    const tokens = new TokenStoreMemoria({ access: accesoVigente("acc-revocado"), refresh: "ref-1" });
    const { fetchFn, llamadas } = crearFetchFalso((url, _init, numero) => {
      if (url.endsWith("/auth/refresh")) return respuestaJson(200, tokensNuevos);
      return numero === 1 ? respuestaJson(401, {}) : respuestaJson(200, { ok: true });
    });
    const http = new ClienteHttp(URL, tokens, { fetchFn });

    const respuesta = await http.solicitar("/api/v1/me");

    expect(respuesta.status).toBe(200);
    expect(llamadas.map((l) => l.url.includes("/auth/refresh"))).toEqual([false, true, false]);
    expect(llamadas[2]!.autorizacion).toBe("Bearer acc-nuevo");
  });

  it("la renovación es single-flight: dos peticiones concurrentes comparten UN refresh", async () => {
    const tokens = new TokenStoreMemoria({ access: null, refresh: "ref-1" });
    const { fetchFn, llamadas } = crearFetchFalso((url) =>
      url.endsWith("/auth/refresh")
        ? respuestaJson(200, tokensNuevos)
        : respuestaJson(200, { ok: true }),
    );
    const http = new ClienteHttp(URL, tokens, { fetchFn });

    await Promise.all([http.solicitar("/api/v1/me"), http.solicitar("/api/v1/catalogo")]);

    expect(llamadas.filter((l) => l.url.includes("/auth/refresh"))).toHaveLength(1);
  });

  it("refresh rechazado: limpia los tokens, notifica sesión vencida y lanza ErrorSesionVencida", async () => {
    const tokens = new TokenStoreMemoria({ access: null, refresh: "ref-robado" });
    let notificado = false;
    const { fetchFn } = crearFetchFalso((url) =>
      url.endsWith("/auth/refresh") ? respuestaJson(401, {}) : respuestaJson(200, { ok: true }),
    );
    const http = new ClienteHttp(URL, tokens, { fetchFn, alSesionVencida: () => (notificado = true) });

    await expect(http.solicitar("/api/v1/me")).rejects.toBeInstanceOf(ErrorSesionVencida);
    expect(notificado).toBe(true);
    expect(await tokens.obtenerRefresh()).toBeNull();
  });

  it("sin refresh token no toca la red: sesión vencida directa", async () => {
    const tokens = new TokenStoreMemoria();
    const { fetchFn, llamadas } = crearFetchFalso(() => respuestaJson(200, { ok: true }));
    const http = new ClienteHttp(URL, tokens, { fetchFn });

    await expect(http.solicitar("/api/v1/me")).rejects.toBeInstanceOf(ErrorSesionVencida);
    expect(llamadas).toHaveLength(0);
  });

  it("una caída de red se clasifica como ErrorRed (la cola reintenta, la sesión NO se pierde)", async () => {
    const tokens = new TokenStoreMemoria({ access: accesoVigente(), refresh: "ref-1" });
    const fetchFn = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    const http = new ClienteHttp(URL, tokens, { fetchFn });

    await expect(http.solicitar("/api/v1/me")).rejects.toBeInstanceOf(ErrorRed);
    expect(await tokens.obtenerRefresh()).toBe("ref-1");
  });

  it("las rutas no autenticadas (enrolar, refresh) no llevan Bearer ni exigen sesión", async () => {
    const tokens = new TokenStoreMemoria();
    const { fetchFn, llamadas } = crearFetchFalso(() => respuestaJson(201, {}));
    const http = new ClienteHttp(URL, tokens, { fetchFn });

    await http.solicitar("/api/v1/dispositivos/enrolar", { method: "POST" }, { autenticado: false });

    expect(llamadas[0]!.autorizacion).toBeUndefined();
  });
});
