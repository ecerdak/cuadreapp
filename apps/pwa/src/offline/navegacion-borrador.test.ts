// Integración retroceso ↔ borrador persistido (tests 13-15 del plan de
// navegación): el paso guardado sigue al retroceso, una foto descartada
// voluntariamente NO resucita al reabrir, y una foto conservada NO se
// pierde. Siempre hay a lo sumo un borrador por flujo.

import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { crearBd } from "./bd";
import { cargarBorrador, guardarBorrador, limpiarBorrador } from "./borrador";
import { invalidacionPorCambioDeEquipo, limpiezaFotoInicial } from "../flujo/navegacion";

const foto = () => ({ bytes: new Uint8Array([9, 9, 9]).buffer, tipo: "image/webp" });

describe("retroceso y borrador persistido", () => {
  it("volver atrás actualiza el paso guardado: reabrir restaura el paso correcto (test 13)", async () => {
    const nombre = `prueba-${crypto.randomUUID()}`;
    const bd = crearBd(nombre);
    await guardarBorrador(bd, "cargando", { tandaInicial: "0,0", iniciadaEn: "2026-08-02T10:00:00Z" });
    // el conductor vuelve a "antes"; el borrador se persiste con el paso nuevo
    await guardarBorrador(bd, "antes", { tandaInicial: "0,0", iniciadaEn: "2026-08-02T10:00:00Z" });
    bd.close();

    const reabierta = crearBd(nombre); // como matar y reabrir la app
    const guardado = await cargarBorrador(reabierta);
    expect(guardado?.paso).toBe("antes");
    expect(await reabierta.borradores.count()).toBe(1); // jamás dos borradores (test 6 de borrador + regla 6)
  });

  it("una foto descartada al retroceder NO resucita al reabrir (test 15: cero pérdida silenciosa, cero resurrección)", async () => {
    const nombre = `prueba-${crypto.randomUUID()}`;
    const bd = crearBd(nombre);
    await guardarBorrador(bd, "antes", { fotoInicial: foto(), tandaInicial: "0,0" });

    // El conductor confirma "Volver": se aplica la limpieza del modelo
    // y el borrador se persiste SIN la foto (mismo camino que App.tsx).
    await guardarBorrador(bd, "conductor", { ...limpiezaFotoInicial(), tandaInicial: "0,0" });
    bd.close();

    const reabierta = crearBd(nombre);
    const guardado = await cargarBorrador(reabierta);
    expect(guardado?.paso).toBe("conductor");
    expect((guardado?.datos as { fotoInicial: unknown }).fotoInicial).toBeNull();
  });

  it("una foto conservada al retroceder sigue intacta tras reabrir (test 15, bytes exactos)", async () => {
    const nombre = `prueba-${crypto.randomUUID()}`;
    const bd = crearBd(nombre);
    // despues → cargando conserva TODO (decisión sin limpieza)
    await guardarBorrador(bd, "cargando", {
      fotoInicial: foto(),
      fotoFinal: foto(),
      tandaFinal: "42,5",
    });
    bd.close();

    const reabierta = crearBd(nombre);
    const datos = (await cargarBorrador(reabierta))?.datos as {
      fotoInicial: { bytes: ArrayBuffer } | null;
      fotoFinal: { bytes: ArrayBuffer } | null;
      tandaFinal: string;
    };
    expect(new Uint8Array(datos.fotoInicial!.bytes)).toEqual(new Uint8Array([9, 9, 9]));
    expect(new Uint8Array(datos.fotoFinal!.bytes)).toEqual(new Uint8Array([9, 9, 9]));
    expect(datos.tandaFinal).toBe("42,5");
  });

  it("cambiar de equipo persiste el borrador ya invalidado (test 2)", async () => {
    const nombre = `prueba-${crypto.randomUUID()}`;
    const bd = crearBd(nombre);
    await guardarBorrador(bd, "antes", {
      conductor: { id: "c1" },
      fotoInicial: foto(),
      lecturaEquipo: "1093,0",
    });
    // cambio de equipo confirmado → invalidación del modelo + nuevo paso
    await guardarBorrador(bd, "conductor", { ...invalidacionPorCambioDeEquipo() });
    bd.close();

    const reabierta = crearBd(nombre);
    const datos = (await cargarBorrador(reabierta))?.datos as Record<string, unknown>;
    expect(datos.conductor).toBeNull();
    expect(datos.fotoInicial).toBeNull();
    expect(datos.lecturaEquipo).toBe("");
  });

  it("guardar la carga limpia el borrador: no queda nada que restaurar (regla 5-6)", async () => {
    const bd = crearBd(`prueba-${crypto.randomUUID()}`);
    await guardarBorrador(bd, "despues", { fotoFinal: foto() });
    await limpiarBorrador(bd);
    expect(await cargarBorrador(bd)).toBeNull();
  });
});
