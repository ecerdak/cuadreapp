// El CTA de la pantalla de despacho nombra siempre lo que falta.
//
// Antes: con la foto final tomada el botón decía «Guardar la carga»
// aunque faltaran los galones despachados, y al tocarlo no hacía nada.
// Es el mismo estado muerto ya corregido en la pantalla de llegada, un
// paso más adelante del mismo flujo carga_inventario.

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Despacho, rotuloDespacho } from "./Despacho";

/** El CTA primario es el único amarillo con relleno de la pantalla. */
const ctaHabilitado = (html: string) => html.includes("background:#F5E01B;color:#101A22");

const FOTO = { bytes: new ArrayBuffer(8), tipo: "image/webp" };
const props = {
  llegada: "150,0",
  nota: "",
  onDespachados: () => {},
  onNota: () => {},
  onFoto: () => {},
  onGuardar: () => {},
};

describe("Pantalla de despacho · el CTA nombra lo que falta", () => {
  it("sin foto final", () => {
    expect(rotuloDespacho(false, false, false)).toBe("Toma la foto para continuar");
    expect(rotuloDespacho(false, true, false)).toBe("Toma la foto para continuar");
  });

  it("foto final tomada, sin galones despachados", () => {
    expect(rotuloDespacho(true, false, false)).toBe("Escribe los galones para seguir");
  });

  it("foto final + galones despachados", () => {
    expect(rotuloDespacho(true, true, false)).toBe("Guardar la carga");
  });

  it("guardando manda sobre todo lo demás", () => {
    expect(rotuloDespacho(true, true, true)).toBe("Guardando…");
    expect(rotuloDespacho(false, false, true)).toBe("Guardando…");
  });

  it("sin foto: rótulo correcto y botón deshabilitado", () => {
    const html = renderToStaticMarkup(<Despacho despachados="" fotoFinal={null} {...props} />);
    expect(html).toContain("Toma la foto para continuar");
    expect(html).not.toContain("Guardar la carga");
    expect(ctaHabilitado(html)).toBe(false);
  });

  it("con foto y SIN lectura: ya no miente diciendo «Guardar la carga»", () => {
    const html = renderToStaticMarkup(<Despacho despachados="" fotoFinal={FOTO} {...props} />);
    expect(html).toContain("Escribe los galones para seguir");
    expect(html).not.toContain("Guardar la carga");
    expect(ctaHabilitado(html)).toBe(false); // el botón NO aparenta avanzar
  });

  it("con foto y lectura: el botón habilita y anuncia el guardado", () => {
    const html = renderToStaticMarkup(<Despacho despachados="600,0" fotoFinal={FOTO} {...props} />);
    expect(html).toContain("Guardar la carga");
    expect(ctaHabilitado(html)).toBe(true);
  });

  it("0,0 despachados cuenta como lectura: se guarda y se marca, nunca se bloquea (RI1)", () => {
    const html = renderToStaticMarkup(<Despacho despachados="0,0" fotoFinal={FOTO} {...props} />);
    expect(html).toContain("Guardar la carga");
    expect(ctaHabilitado(html)).toBe(true);
    // …y el aviso de revisión sigue apareciendo, sin impedir el guardado
    expect(html).toContain("No se registró despacho");
  });

  it("guardando: el botón queda en gris con el rótulo de espera", () => {
    const html = renderToStaticMarkup(
      <Despacho despachados="600,0" fotoFinal={FOTO} guardando {...props} />,
    );
    expect(html).toContain("Guardando…");
    expect(ctaHabilitado(html)).toBe(false);
  });

  it("no regresión: el total al salir se sigue calculando solo", () => {
    const html = renderToStaticMarkup(<Despacho despachados="600,0" fotoFinal={FOTO} {...props} />);
    expect(html).toContain("Total al salir");
    expect(html).toContain("750,0 gal"); // 150,0 + 600,0 — cálculo del dominio
    expect(html).toContain("El total lo calcula la aplicación — nunca se escribe a mano.");
  });
});
