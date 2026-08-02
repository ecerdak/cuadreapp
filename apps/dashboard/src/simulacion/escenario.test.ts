import { describe, expect, it } from "vitest";
import {
  balanceSimulado,
  CARGAS_SIMULADAS,
  consumoPorDia14,
  EXISTENCIA_INICIAL_GAL,
  HOY_SIMULADO,
  TOT_INSTALACION_GAL,
  TOTALIZADOR_FINAL_GAL,
} from "./escenario";

describe("escenario simulado — la aritmética cierra (requisito del mockup)", () => {
  it("las tandas más los saltos suman exactamente el avance del totalizador", () => {
    const tandas = CARGAS_SIMULADAS.reduce((suma, carga) => suma + carga.galones, 0);
    const saltos = CARGAS_SIMULADAS.reduce((suma, carga) => suma + (carga.galNoRegistrados ?? 0), 0);
    expect(TOTALIZADOR_FINAL_GAL - TOT_INSTALACION_GAL).toBeCloseTo(tandas + saltos, 1);
  });

  it("cada carga encadena: el totalizador final de una es el inicial de la siguiente (salvo el salto deliberado)", () => {
    for (let i = 1; i < CARGAS_SIMULADAS.length; i++) {
      const anterior = CARGAS_SIMULADAS[i - 1]!;
      const actual = CARGAS_SIMULADAS[i]!;
      const brecha = Math.round((actual.totInicial - anterior.totFinal) * 10) / 10;
      expect(brecha).toBeCloseTo(actual.galNoRegistrados ?? 0, 1);
    }
  });

  it("el balance cierra: existencia = inicial + entregado − despachado", () => {
    const balance = balanceSimulado();
    expect(balance.existenciaEstimadaGal).toBeCloseTo(
      EXISTENCIA_INICIAL_GAL + balance.entregadoTotalGal - balance.despachadoTotalGal,
      1,
    );
  });

  it("el consumo de 14 días suma lo mismo que las tandas de esos días", () => {
    const porDias = consumoPorDia14().reduce((suma, dia) => suma + dia.galones, 0);
    const tandas = CARGAS_SIMULADAS.reduce((suma, carga) => suma + carga.galones, 0);
    expect(porDias).toBeCloseTo(tandas, 1);
  });
});

describe("escenario simulado — los veredictos los decide el dominio, no el generador", () => {
  it("existe exactamente una carga inconsistente HOY, con SALTO_TOTALIZADOR de 18 gal", () => {
    const inconsistentes = CARGAS_SIMULADAS.filter((carga) => carga.estado === "inconsistente");
    expect(inconsistentes).toHaveLength(1);
    expect(inconsistentes[0]).toMatchObject({
      fecha: HOY_SIMULADO,
      banderas: ["SALTO_TOTALIZADOR"],
      galNoRegistrados: 18.0,
    });
  });

  it("existe la advertencia de tanda sin resetear, con su nota", () => {
    const advertencias = CARGAS_SIMULADAS.filter((carga) =>
      carga.banderas.includes("TANDA_NO_RESETEADA"),
    );
    expect(advertencias).toHaveLength(1);
    expect(advertencias[0]!.estado).toBe("advertencia");
    expect(advertencias[0]!.notas).toBeTruthy();
  });

  it("la carga sin GPS lleva SIN_GPS informativa y sigue en 'ok'", () => {
    const sinGps = CARGAS_SIMULADAS.filter((carga) => carga.banderas.includes("SIN_GPS"));
    expect(sinGps.length).toBeGreaterThan(0);
    expect(sinGps.every((carga) => carga.estado === "ok")).toBe(true);
  });

  it("el resto de las cargas está limpio: la mayoría del escenario cuadra", () => {
    const ok = CARGAS_SIMULADAS.filter((carga) => carga.estado === "ok").length;
    expect(ok).toBeGreaterThanOrEqual(CARGAS_SIMULADAS.length - 2);
  });
});
