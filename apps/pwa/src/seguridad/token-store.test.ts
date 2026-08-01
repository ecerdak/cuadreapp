import { beforeEach, describe, expect, it } from "vitest";
import { TokenStoreMemoria, TokenStoreNavegador } from "./token-store";

// Polyfill mínimo de localStorage para el entorno de pruebas (node).
const almacen = new Map<string, string>();
beforeEach(() => {
  almacen.clear();
  globalThis.localStorage = {
    getItem: (clave: string) => almacen.get(clave) ?? null,
    setItem: (clave: string, valor: string) => void almacen.set(clave, valor),
    removeItem: (clave: string) => void almacen.delete(clave),
    clear: () => almacen.clear(),
    key: () => null,
    get length() {
      return almacen.size;
    },
  } as Storage;
});

const tokens = { access_token: "acc-1", refresh_token: "ref-1", expira_en_s: 3600 };

describe("TokenStoreNavegador (DEC-014)", () => {
  it("guarda el par y expone access con su expiración", async () => {
    const store = new TokenStoreNavegador();
    await store.guardar(tokens);
    expect(store.obtenerAccess()?.token).toBe("acc-1");
    expect(store.obtenerAccess()!.expiraEnMs).toBeGreaterThan(Date.now());
    expect(await store.obtenerRefresh()).toBe("ref-1");
  });

  it("el access token vive SOLO en memoria: una instancia nueva lo pierde, pero conserva el refresh", async () => {
    const primera = new TokenStoreNavegador();
    await primera.guardar(tokens);

    const segunda = new TokenStoreNavegador(); // como reabrir la app
    expect(segunda.obtenerAccess()).toBeNull();
    expect(await segunda.obtenerRefresh()).toBe("ref-1");
  });

  it("limpiar borra todo", async () => {
    const store = new TokenStoreNavegador();
    await store.guardar(tokens);
    await store.limpiar();
    expect(store.obtenerAccess()).toBeNull();
    expect(await store.obtenerRefresh()).toBeNull();
  });

  it("jamás persiste el access token en el almacenamiento del navegador", async () => {
    const store = new TokenStoreNavegador();
    await store.guardar(tokens);
    expect([...almacen.values()].join("|")).not.toContain("acc-1");
  });
});

describe("TokenStoreMemoria", () => {
  it("cumple el mismo contrato", async () => {
    const store = new TokenStoreMemoria({ refresh: "ref-previo" });
    expect(await store.obtenerRefresh()).toBe("ref-previo");
    await store.guardar(tokens);
    expect(store.obtenerAccess()?.token).toBe("acc-1");
    await store.limpiar();
    expect(store.obtenerAccess()).toBeNull();
    expect(await store.obtenerRefresh()).toBeNull();
  });
});
