// La secuencia como dato (Etapa P, DEC-016) es un refactor NEUTRAL:
// estas pruebas fijan que lo derivado del flujo medidor_doble es
// EXACTAMENTE lo que el wizard siempre tuvo hardcodeado. El retroceso
// lo custodian además las 16 pruebas de navegacion.test.ts, que no
// cambiaron una sola expectativa.

import { describe, expect, it } from "vitest";
import {
  derivarAvance,
  derivarPasoAnterior,
  flujoDe,
  FLUJO_CARGA_INVENTARIO,
  FLUJO_MEDIDOR_DOBLE,
  pasoSiguiente,
} from "./perfiles";

describe("derivaciones del flujo medidor_doble (equivalencia con lo previo)", () => {
  it("PASO_ANTERIOR derivado = el mapa histórico (los pasos de otros flujos quedan inalcanzables)", () => {
    expect(derivarPasoAnterior(FLUJO_MEDIDOR_DOBLE)).toMatchObject({
      inicio: null,
      equipo: "inicio",
      conductor: "equipo",
      antes: "conductor",
      cargando: "antes",
      despues: "cargando",
      listo: null,
      diagnostico: "inicio",
      llegada: null,
      despacho: null,
    });
  });

  it("la barra de avance derivada = equipo 1 … despues 5, listo 5, total 5", () => {
    expect(derivarAvance(FLUJO_MEDIDOR_DOBLE)).toEqual({
      porPaso: { equipo: 1, conductor: 2, antes: 3, cargando: 4, despues: 5, listo: 5 },
      total: 5,
    });
  });

  it("el avance hacia adelante también se deriva del dato", () => {
    expect(pasoSiguiente(FLUJO_MEDIDOR_DOBLE, "conductor")).toBe("antes");
    expect(pasoSiguiente(FLUJO_MEDIDOR_DOBLE, "despues")).toBe("listo");
    expect(pasoSiguiente(FLUJO_MEDIDOR_DOBLE, "listo")).toBeNull();
  });
});

describe("flujo carga_inventario (Sacyr, DEC-016)", () => {
  it("secuencia: inicio → equipo → conductor → llegada → cargando → despacho → listo", () => {
    expect(FLUJO_CARGA_INVENTARIO.pasos).toEqual([
      "inicio",
      "equipo",
      "conductor",
      "llegada",
      "cargando",
      "despacho",
      "listo",
    ]);
  });

  it("retroceso derivado: despacho→cargando→llegada→conductor; sin tandas ni totalizadores", () => {
    const anterior = derivarPasoAnterior(FLUJO_CARGA_INVENTARIO);
    expect(anterior.llegada).toBe("conductor");
    expect(anterior.cargando).toBe("llegada");
    expect(anterior.despacho).toBe("cargando");
    expect(anterior.antes).toBeNull();
    expect(anterior.despues).toBeNull();
    expect(anterior.listo).toBeNull();
  });

  it("misma barra de 5 segmentos que el flujo original", () => {
    expect(derivarAvance(FLUJO_CARGA_INVENTARIO)).toEqual({
      porPaso: { equipo: 1, conductor: 2, llegada: 3, cargando: 4, despacho: 5, listo: 5 },
      total: 5,
    });
  });

  it("flujoDe selecciona por código de perfil", () => {
    expect(flujoDe("medidor_doble")).toBe(FLUJO_MEDIDOR_DOBLE);
    expect(flujoDe("carga_inventario")).toBe(FLUJO_CARGA_INVENTARIO);
  });
});
