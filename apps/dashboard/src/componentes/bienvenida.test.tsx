// Bienvenida del tablero (P0.6): el cliente sin NINGUNA carga ve una
// presentación con el proceso, contada con el vocabulario de SU perfil
// — jamás por nombre de cliente y sin mencionar la consola de Lubryco.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ContextoTablero } from "../datos/puertos";
import { BienvenidaTablero } from "./bienvenida";

function contexto(panelesHoy: string[]): ContextoTablero {
  return {
    usuario: { nombre: "Supervisora", rol: "supervisor" },
    permisos: ["tablero.leer"],
    cliente: {
      id: "cliente-1",
      nombre: "Empresa Industrial S.A.",
      nombreComercial: null,
      logoUrl: null,
      colorPrimario: null,
      colorSecundario: null,
    },
    perfil: {
      codigo: "medidor_doble",
      nombre: "Perfil",
      modulos: ["hoy", "cargas", "equipos"],
      panelesHoy: panelesHoy as ContextoTablero["perfil"]["panelesHoy"],
      columnasCargas: ["galones"],
      vistaEvidencia: "medidor",
    },
    sedes: [{ id: "sede-1", nombre: "Planta", ciudad: null }],
    sedeActual: null,
    medidor: null,
  } as ContextoTablero;
}

const html = (paneles: string[]) =>
  renderToStaticMarkup(<BienvenidaTablero contexto={contexto(paneles)} alActualizar={() => {}} />);

describe("BienvenidaTablero (P0.6)", () => {
  it("presenta el tablero con el proceso en tres pasos", () => {
    const salida = html(["totalizador", "consumo", "cargas_del_dia"]);
    expect(salida).toContain("Bienvenido a CuadreApp");
    expect(salida).toContain("Tu Dashboard está listo");
    expect(salida).toContain("cuando se registre la primera carga");
    expect(salida).toContain("El operador abre CuadreApp");
    expect(salida).toContain("se actualiza automáticamente");
    expect(salida).toContain("Actualizar ahora");
  });

  it("con paneles de medidor habla de tanda y totalizador", () => {
    const salida = html(["totalizador", "consumo", "cargas_del_dia"]);
    expect(salida).toContain("tanda y totalizador");
    expect(salida).not.toContain("total al salir");
  });

  it("con paneles de inventario habla de llegada, carga y total al salir", () => {
    const salida = html(["inventario", "consumo", "cargas_del_dia"]);
    expect(salida).toContain("total al salir");
    expect(salida).not.toContain("totalizador");
  });

  it("nunca le pide al cliente configurar nada en la consola de Lubryco", () => {
    for (const paneles of [["totalizador"], ["inventario"], []]) {
      expect(html(paneles)).not.toContain("consola");
    }
  });
});
