import { describe, expect, it } from "vitest";
import { almacenamientoEsPersistente, solicitarAlmacenamientoPersistente } from "./persistencia";

// RC1-A3: la cola offline es la evidencia probatoria del producto; sin
// navigator.storage.persist() el navegador puede purgarla bajo presión
// de almacenamiento.

const gestor = (respuestas: { persist?: boolean; persisted?: boolean; falla?: boolean }) =>
  ({
    persist: async () => {
      if (respuestas.falla) throw new Error("no disponible");
      return respuestas.persist ?? false;
    },
    persisted: async () => {
      if (respuestas.falla) throw new Error("no disponible");
      return respuestas.persisted ?? false;
    },
  }) as unknown as StorageManager;

describe("RC1-A3 — almacenamiento persistente de la cola offline", () => {
  it("solicita persist() y devuelve true cuando el navegador lo concede", async () => {
    expect(await solicitarAlmacenamientoPersistente(gestor({ persist: true }))).toBe(true);
  });

  it("devuelve false cuando el navegador lo niega (la UI debe avisar)", async () => {
    expect(await solicitarAlmacenamientoPersistente(gestor({ persist: false }))).toBe(false);
  });

  it("no revienta si la API no existe (navegadores viejos): false/null, jamás throw", async () => {
    expect(await solicitarAlmacenamientoPersistente(undefined)).toBe(false);
    expect(await almacenamientoEsPersistente(undefined)).toBeNull();
  });

  it("no revienta si el navegador lanza", async () => {
    expect(await solicitarAlmacenamientoPersistente(gestor({ falla: true }))).toBe(false);
    expect(await almacenamientoEsPersistente(gestor({ falla: true }))).toBeNull();
  });

  it("reporta el estado actual de persistencia", async () => {
    expect(await almacenamientoEsPersistente(gestor({ persisted: true }))).toBe(true);
    expect(await almacenamientoEsPersistente(gestor({ persisted: false }))).toBe(false);
  });
});
