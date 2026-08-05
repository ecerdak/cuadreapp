// El fixture de escenario cumple el MISMO contrato que la fuente real.
// Estas pruebas lo verifican método a método: si el contrato cambia y
// el fixture se queda atrás, falla aquí y no en producción.

import { describe, expect, it } from "vitest";
import { FuenteSimulada } from "./fuente-simulada";
import { HOY_SIMULADO } from "./escenario";

const fuente = () => new FuenteSimulada({ latenciaMs: [0, 0] });
const SIN_SEDE = { sedeId: null };

describe("FuenteSimulada — proyección a los modelos de lectura", () => {
  it("el contexto entrega identidad, perfil con su composición y sede", async () => {
    const contexto = await fuente().contexto();
    expect(contexto.cliente.nombre).toContain("El Trébol");
    expect(contexto.perfil.codigo).toBe("medidor_doble");
    expect(contexto.perfil.modulos).toContain("suministro");
    expect(contexto.perfil.vistaEvidencia).toBe("medidor");
    expect(contexto.cliente.colorPrimario).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(contexto.medidor?.modelo).toBe("Fill-Rite Serie 900");
  });

  it("resumenHoy trae solo las cargas de hoy y un veredicto de problema (hay un salto hoy)", async () => {
    const resumen = await fuente().resumenHoy(SIN_SEDE);
    expect(resumen.cargasDeHoy.length).toBeGreaterThan(0);
    expect(resumen.cargasDeHoy.every((carga) => carga.fecha === HOY_SIMULADO)).toBe(true);
    expect(resumen.veredicto.tono).toBe("problema");
    expect(resumen.consumo14d).toHaveLength(14);
    expect(resumen.balance.existenciaEstimadaGal).toBeGreaterThan(0);
  });

  it("listarCargas filtra por estado y reporta cuántas cuadran", async () => {
    const todas = await fuente().listarCargas({ estado: "todas", sedeId: null });
    const inconsistentes = await fuente().listarCargas({ estado: "inconsistente", sedeId: null });
    expect(todas.cargas.length).toBe(todas.total);
    expect(inconsistentes.cargas).toHaveLength(1);
    expect(todas.cuadran).toBeLessThan(todas.total);
  });

  it("detalleCarga entrega lecturas, 3 candados y fotos; el candado de continuidad falla en el salto", async () => {
    const salto = (await fuente().listarCargas({ estado: "inconsistente", sedeId: null })).cargas[0]!;
    const detalle = await fuente().detalleCarga(salto.id);
    expect(detalle.candados).toHaveLength(3);
    expect(detalle.candados.find((c) => c.nombre.includes("Continuidad"))!.cumple).toBe(false);
    expect(detalle.candados.filter((c) => c.cumple)).toHaveLength(2);
    // La evidencia simulada usa los assets originales del paquete de diseño.
    expect(detalle.fotos.inicial).toContain("fillrite-antes");
    expect(detalle.galNoRegistrados).toBe(18.0);
    // El perfil del snapshot decide con qué vista se muestra la carga.
    expect(detalle.resumen.perfilCodigo).toBe("medidor_doble");
    expect(detalle.inventario).toBeNull();
  });

  it("detalleCarga rechaza un id inexistente", async () => {
    await expect(fuente().detalleCarga("no-existe")).rejects.toThrow(/No existe/);
  });

  it("resumenEquipos calcula rendimiento y señala al equipo desviado", async () => {
    const resumen = await fuente().resumenEquipos(SIN_SEDE);
    expect(resumen.equipos.length).toBeGreaterThan(3);
    const conRendimiento = resumen.equipos.filter((equipo) => equipo.rendimiento !== null);
    expect(conRendimiento.length).toBe(resumen.equipos.length);
  });

  it("resumenSuministro expone el balance que cierra y la próxima entrega sugerida", async () => {
    const resumen = await fuente().resumenSuministro(SIN_SEDE);
    expect(resumen.balance.existenciaEstimadaGal).toBeCloseTo(
      600 + resumen.balance.entregadoTotalGal - resumen.balance.despachadoTotalGal,
      1,
    );
    expect(resumen.proximaEntregaSugerida).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("el conmutador de fallos hace rechazar todas las llamadas (para ejercitar EstadoError)", async () => {
    const conError = new FuenteSimulada({ latenciaMs: [0, 0], simularError: true });
    await expect(conError.resumenHoy(SIN_SEDE)).rejects.toThrow(/simulado/);
    await expect(conError.listarCargas({ sedeId: null })).rejects.toThrow(/simulado/);
  });
});
