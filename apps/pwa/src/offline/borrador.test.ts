import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { crearBd } from "./bd";
import { cargarBorrador, guardarBorrador, limpiarBorrador } from "./borrador";

describe("borrador persistente (FASE 5 — nunca perder una fotografía)", () => {
  it("guarda y recupera el borrador con sus fotos (bytes intactos)", async () => {
    const bd = crearBd(`prueba-${crypto.randomUUID()}`);
    const bytes = new Uint8Array([1, 2, 3, 4, 5]).buffer;
    await guardarBorrador(bd, "despues", {
      tandaFinal: "42,5",
      fotoInicial: { bytes, tipo: "image/webp" },
    });

    const guardado = await cargarBorrador(bd);
    expect(guardado?.paso).toBe("despues");
    const datos = guardado!.datos as { fotoInicial: { bytes: ArrayBuffer; tipo: string } };
    expect(new Uint8Array(datos.fotoInicial.bytes)).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
  });

  it("SOBREVIVE al reinicio de la app: otra instancia de la misma base lo encuentra", async () => {
    const nombre = `prueba-${crypto.randomUUID()}`;
    const primera = crearBd(nombre);
    await guardarBorrador(primera, "cargando", { tandaInicial: "0,0" });
    primera.close();

    const segunda = crearBd(nombre); // como reabrir la app tras matarla
    const guardado = await cargarBorrador(segunda);
    expect(guardado?.paso).toBe("cargando");
  });

  it("limpiar lo elimina del todo", async () => {
    const bd = crearBd(`prueba-${crypto.randomUUID()}`);
    await guardarBorrador(bd, "antes", {});
    await limpiarBorrador(bd);
    expect(await cargarBorrador(bd)).toBeNull();
  });

  it("guardar de nuevo reemplaza (siempre hay a lo sumo un borrador)", async () => {
    const bd = crearBd(`prueba-${crypto.randomUUID()}`);
    await guardarBorrador(bd, "antes", { totInicial: "1.847,0" });
    await guardarBorrador(bd, "despues", { totInicial: "1.847,0", tandaFinal: "42,5" });
    const guardado = await cargarBorrador(bd);
    expect(guardado?.paso).toBe("despues");
    expect(await bd.borradores.count()).toBe(1);
  });
});
