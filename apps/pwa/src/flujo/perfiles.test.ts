// La secuencia como dato (Etapa P, DEC-016) es un refactor NEUTRAL:
// estas pruebas fijan que lo derivado del flujo medidor_doble es
// EXACTAMENTE lo que el wizard siempre tuvo hardcodeado. El retroceso
// lo custodian además las 16 pruebas de navegacion.test.ts, que no
// cambiaron una sola expectativa.

import { describe, expect, it } from "vitest";
import { derivarAvance, derivarPasoAnterior, FLUJO_MEDIDOR_DOBLE } from "./perfiles";

describe("derivaciones del flujo medidor_doble (equivalencia con lo previo)", () => {
  it("PASO_ANTERIOR derivado = el mapa histórico, byte por byte", () => {
    expect(derivarPasoAnterior(FLUJO_MEDIDOR_DOBLE)).toEqual({
      inicio: null,
      equipo: "inicio",
      conductor: "equipo",
      antes: "conductor",
      cargando: "antes",
      despues: "cargando",
      listo: null,
      diagnostico: "inicio",
    });
  });

  it("la barra de avance derivada = equipo 1 … despues 5, listo 5, total 5", () => {
    expect(derivarAvance(FLUJO_MEDIDOR_DOBLE)).toEqual({
      porPaso: { equipo: 1, conductor: 2, antes: 3, cargando: 4, despues: 5, listo: 5 },
      total: 5,
    });
  });
});
