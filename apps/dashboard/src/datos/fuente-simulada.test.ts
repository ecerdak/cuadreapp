import { describe, expect, it } from "vitest";
import { FuenteSimulada } from "./fuente-simulada";
import { HOY_SIMULADO } from "../simulacion/escenario";

const fuente = () => new FuenteSimulada({ latenciaMs: [0, 0] });

describe("FuenteSimulada — proyección a los modelos de lectura", () => {
  it("resumenHoy trae solo las cargas de hoy y un veredicto de problema (hay un salto hoy)", async () => {
    const resumen = await fuente().resumenHoy();
    expect(resumen.cargasDeHoy.length).toBeGreaterThan(0);
    expect(resumen.cargasDeHoy.every((carga) => carga.fecha === HOY_SIMULADO)).toBe(true);
    expect(resumen.veredicto.tono).toBe("problema");
    expect(resumen.consumo14d).toHaveLength(14);
    expect(resumen.existenciaEstimadaGal).toBeGreaterThan(0);
  });

  it("listarCargas filtra por estado y reporta cuántas cuadran", async () => {
    const todas = await fuente().listarCargas({ estado: "todas" });
    const inconsistentes = await fuente().listarCargas({ estado: "inconsistente" });
    expect(todas.cargas.length).toBe(todas.total);
    expect(inconsistentes.cargas).toHaveLength(1);
    expect(todas.cuadran).toBeLessThan(todas.total);
  });

  it("detalleCarga entrega lecturas, 3 candados y fotos; el candado de continuidad falla en el salto", async () => {
    const salto = (await fuente().listarCargas({ estado: "inconsistente" })).cargas[0]!;
    const detalle = await fuente().detalleCarga(salto.id);
    expect(detalle.candados).toHaveLength(3);
    expect(detalle.candados.find((c) => c.nombre.includes("Continuidad"))!.cumple).toBe(false);
    expect(detalle.candados.filter((c) => c.cumple)).toHaveLength(2);
    expect(detalle.fotos.inicial).toContain("data:image/svg+xml");
    expect(detalle.galNoRegistrados).toBe(18.0);
  });

  it("detalleCarga rechaza un id inexistente", async () => {
    await expect(fuente().detalleCarga("no-existe")).rejects.toThrow(/No existe/);
  });

  it("resumenEquipos calcula rendimiento y señala al equipo desviado", async () => {
    const resumen = await fuente().resumenEquipos();
    expect(resumen.equipos.length).toBeGreaterThan(3);
    const conRendimiento = resumen.equipos.filter((equipo) => equipo.rendimiento !== null);
    expect(conRendimiento.length).toBe(resumen.equipos.length);
  });

  it("resumenSuministro expone el balance que cierra y la próxima entrega sugerida", async () => {
    const resumen = await fuente().resumenSuministro();
    expect(resumen.existenciaEstimadaGal).toBeCloseTo(
      600 + resumen.entregadoTotalGal - resumen.despachadoTotalGal,
      1,
    );
    expect(resumen.proximaEntregaSugerida).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("el conmutador de fallos hace rechazar todas las llamadas (para ejercitar EstadoError)", async () => {
    const conError = new FuenteSimulada({ latenciaMs: [0, 0], simularError: true });
    await expect(conError.resumenHoy()).rejects.toThrow(/simulado/);
    await expect(conError.listarCargas({})).rejects.toThrow(/simulado/);
  });
});
