// Exportación por Perfil Operativo (P0.8): cada perfil exporta SU
// vocabulario. La vista de inventario sale de la lista (sin detalle);
// la de medidor conserva exactamente sus 15 columnas de siempre.

import { describe, expect, it, vi } from "vitest";
import type { CargaResumen, DetalleCarga } from "./puertos";
import { filaCargaInventario, filaCargaMedidor, porLotes } from "./excel";

const CARGA_INVENTARIO: CargaResumen = {
  id: "c2",
  fecha: "2026-08-12",
  hora: "07:41",
  equipoCodigo: "SMW-477",
  equipoDescripcion: "Carrotanque 1",
  conductorNombre: "Operadora EDS",
  galones: 600,
  estado: "ok",
  banderas: [],
  perfilCodigo: "carga_inventario",
  duracionSegundos: 754,
  llegadaGal: 150,
  inventarioFinalGal: 750,
  capacidadEquipoGal: 1000,
  galNoRegistrados: null,
};

const DETALLE_MEDIDOR: DetalleCarga = {
  resumen: {
    ...CARGA_INVENTARIO,
    id: "c1",
    equipoCodigo: "T-04",
    equipoDescripcion: "Tractor",
    conductorNombre: "Duván Bonilla",
    galones: 42.5,
    perfilCodigo: "medidor_doble",
    llegadaGal: null,
    inventarioFinalGal: null,
    capacidadEquipoGal: 80,
  },
  lecturas: { tandaInicial: 0, totInicial: 1847, tandaFinal: 42.5, totFinal: 1889.5 },
  inventario: null,
  lecturaEquipo: 1093,
  tipoLectura: "horometro",
  galNoRegistrados: null,
  duracionSegundos: 312,
  notas: null,
  fotos: { inicial: null, final: null },
  candados: [],
};

describe("filaCargaInventario (P0.8)", () => {
  it("exporta llegada, cargados, total al salir, duración y estado — el caso 150/600/750", () => {
    const fila = filaCargaInventario(CARGA_INVENTARIO);
    expect(fila).toEqual({
      Fecha: "2026-08-12",
      Hora: "07:41",
      Equipo: "SMW-477",
      Descripción: "Carrotanque 1",
      Operador: "Operadora EDS",
      "Llegó con (gal)": 150,
      "Galones cargados (gal)": 600,
      "Total al salir (gal)": 750,
      Duración: "12 min 34 s",
      Veredicto: "Cuadra",
      Banderas: "—",
    });
  });

  it("no arrastra columnas de medidor que no significan nada en inventario", () => {
    const columnas = Object.keys(filaCargaInventario(CARGA_INVENTARIO));
    expect(columnas.join()).not.toContain("Tanda");
    expect(columnas.join()).not.toContain("Totalizador");
  });

  it("sin duración registrada, la celda queda vacía en vez de inventarse", () => {
    const fila = filaCargaInventario({ ...CARGA_INVENTARIO, duracionSegundos: null });
    expect(fila["Duración"]).toBe("");
  });
});

describe("filaCargaMedidor — sin regresión", () => {
  it("conserva exactamente sus 15 columnas de siempre, en el mismo orden", () => {
    expect(Object.keys(filaCargaMedidor(DETALLE_MEDIDOR))).toEqual([
      "Fecha",
      "Hora",
      "Equipo",
      "Descripción",
      "Conductor",
      "Tanda inicial (gal)",
      "Totalizador inicial",
      "Tanda final (gal)",
      "Totalizador final",
      "Galones despachados",
      "Contador del equipo",
      "Tipo de contador",
      "Veredicto",
      "Banderas",
      "Gal sin registrar",
    ]);
  });

  it("las lecturas del medidor viajan como número", () => {
    const fila = filaCargaMedidor(DETALLE_MEDIDOR);
    expect(fila["Tanda final (gal)"]).toBe(42.5);
    expect(fila["Totalizador final"]).toBe(1889.5);
    expect(fila["Galones despachados"]).toBe(42.5);
  });
});

describe("porLotes — el detalle de medidor no dispara cientos de peticiones a la vez", () => {
  it("respeta el tope de concurrencia y conserva el orden", async () => {
    let simultaneas = 0;
    let maximo = 0;
    const operacion = vi.fn(async (n: number) => {
      simultaneas += 1;
      maximo = Math.max(maximo, simultaneas);
      await new Promise((listo) => setTimeout(listo, 1));
      simultaneas -= 1;
      return n * 2;
    });

    const resultado = await porLotes([1, 2, 3, 4, 5, 6, 7], 3, operacion);

    expect(resultado).toEqual([2, 4, 6, 8, 10, 12, 14]);
    expect(maximo).toBeLessThanOrEqual(3);
    expect(operacion).toHaveBeenCalledTimes(7);
  });
});
