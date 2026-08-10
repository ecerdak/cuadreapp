// El CTA de la pantalla de llegada nombra siempre lo que falta.
//
// Antes: con la foto tomada el botón decía «Empezar a cargar» aunque
// faltaran los galones, y al tocarlo no hacía nada. El rótulo y la
// acción salen ahora de la misma condición.

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Llegada, rotuloLlegada } from "./Llegada";

/** El CTA primario es el único amarillo con relleno de la pantalla. */
const ctaHabilitado = (html: string) => html.includes("background:#F5E01B;color:#101A22");

describe("Pantalla de llegada · el CTA nombra lo que falta", () => {
  it("sin foto", () => {
    expect(rotuloLlegada(false, false)).toBe("Toma la foto para continuar");
    expect(rotuloLlegada(false, true)).toBe("Toma la foto para continuar");
  });

  it("foto tomada, sin lectura", () => {
    expect(rotuloLlegada(true, false)).toBe("Escribe los galones para seguir");
  });

  it("foto + lectura", () => {
    expect(rotuloLlegada(true, true)).toBe("Empezar a cargar");
  });

  const props = {
    onLlegada: () => {},
    onFoto: () => {},
    onEmpezarACargar: () => {},
  };

  it("sin foto: rótulo correcto y botón deshabilitado", () => {
    const html = renderToStaticMarkup(<Llegada llegada="" fotoInicial={null} {...props} />);
    expect(html).toContain("Toma la foto para continuar");
    expect(html).not.toContain("Empezar a cargar");
    expect(ctaHabilitado(html)).toBe(false);
  });

  it("con foto y SIN lectura: ya no miente diciendo «Empezar a cargar»", () => {
    const foto = { bytes: new ArrayBuffer(8), tipo: "image/webp" };
    const html = renderToStaticMarkup(<Llegada llegada="" fotoInicial={foto} {...props} />);
    expect(html).toContain("Escribe los galones para seguir");
    expect(html).not.toContain("Empezar a cargar");
    expect(ctaHabilitado(html)).toBe(false); // el botón NO aparenta avanzar
  });

  it("con foto y lectura: el botón habilita y anuncia el avance", () => {
    const foto = { bytes: new ArrayBuffer(8), tipo: "image/webp" };
    const html = renderToStaticMarkup(<Llegada llegada="120,5" fotoInicial={foto} {...props} />);
    expect(html).toContain("Empezar a cargar");
    expect(ctaHabilitado(html)).toBe(true);
  });

  it("llegar con 0,0 es válido: cuenta como lectura (carrotanque vacío)", () => {
    const foto = { bytes: new ArrayBuffer(8), tipo: "image/webp" };
    const html = renderToStaticMarkup(<Llegada llegada="0,0" fotoInicial={foto} {...props} />);
    expect(html).toContain("Empezar a cargar");
    expect(ctaHabilitado(html)).toBe(true);
  });
});
