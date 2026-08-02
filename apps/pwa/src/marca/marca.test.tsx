// Pruebas de fidelidad de la marca (contrato visual §1-§3): protegen
// los tokens, las cuatro capas del logotipo y la placa contra
// regresiones. Los valores esperados vienen del mockup aprobado — si
// esta prueba falla, se rompió el contrato, no la prueba.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { APP, C, MARCA } from "./tokens";
import { Logotipo, Placa } from "./Logotipo";

describe("tokens del contrato visual", () => {
  it("la marca es exactamente la aprobada", () => {
    expect(MARCA.amarillo).toBe("#F5E01B");
    expect(MARCA.azul).toBe("#4A7CAB");
    expect(MARCA.negro).toBe("#0B0B0B");
    expect(MARCA.script).toContain("Yellowtail");
    expect(MARCA.ui).toContain("Barlow");
    expect(MARCA.condensada).toContain("Barlow Condensed");
  });

  it("la paleta C es exactamente la aprobada", () => {
    expect(C.fondo).toBe("#0B1219");
    expect(C.panel).toBe("#111C26");
    expect(C.panelAlto).toBe("#16232F");
    expect(C.linea).toBe("#22374A");
    expect(C.lineaSuave).toBe("#1A2A38");
    expect(C.texto).toBe("#E7EEF6");
    expect(C.suave).toBe("#8AA0B6");
    expect(C.verde).toBe("#3FAE7E");
    expect(C.ambar).toBe("#E2A233");
    expect(C.rojo).toBe("#E2594C");
    expect(C.azul).toBe("#5B90C4");
  });

  it("los tonos propios de la app móvil son los aprobados", () => {
    expect(APP.fondo).toBe("#070D13");
    expect(APP.tarjeta).toBe("#121C25");
    expect(APP.tarjeta2).toBe("#18242F");
  });
});

describe("Logotipo — cuatro capas apiladas", () => {
  it("a 34 px usa los grosores canónicos de la tabla CAPAS", () => {
    const html = renderToStaticMarkup(<Logotipo tam={34} />);
    // sombra 6 · halo 4.5 · contorno 3 · filete 1 (tabla del contrato)
    expect(html).toContain("-webkit-text-stroke:6px #0B0B0B");
    expect(html).toContain("-webkit-text-stroke:4.5px #FFFFFF");
    expect(html).toContain("-webkit-text-stroke:3px #0B0B0B");
    expect(html).toContain("-webkit-text-stroke:1px #0B0B0B");
    expect(html).toContain("Yellowtail");
    expect(html).toContain("paint-order:stroke");
    expect(html).toContain(">Cuadre</span>");
  });

  it("en tamaños no canónicos deriva por proporción (sombra 17 %)", () => {
    const html = renderToStaticMarkup(<Logotipo tam={28} />);
    expect(html).toContain(`-webkit-text-stroke:${28 * 0.17}px #0B0B0B`);
  });

  it("sin halo omite la capa blanca", () => {
    const html = renderToStaticMarkup(<Logotipo tam={34} halo={false} />);
    expect(html).not.toContain("#FFFFFF");
  });
});

describe("Placa APP", () => {
  it("es Barlow Condensed 700 sobre el amarillo, con el padding exacto", () => {
    const html = renderToStaticMarkup(<Placa />);
    expect(html).toContain(">APP</span>");
    expect(html).toContain("letter-spacing:0.2em");
    expect(html).toContain("padding:5px 7px 4px");
    expect(html).toContain("background:#F5E01B");
    expect(html).toContain("Barlow Condensed");
  });
});
