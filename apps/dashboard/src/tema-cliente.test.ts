// TemaCliente (DEC-018): la base guarda SOLO dos colores; hover,
// sombras, estados, bordes, fondos, gradientes y contrastes se derivan
// aquí. Estas pruebas fijan la restricción: un cliente puede cambiar
// su identidad, nunca la experiencia CuadreApp.

import { describe, expect, it } from "vitest";
import {
  COLOR_CUADREAPP,
  contraste,
  contrasteInsuficiente,
  esHexValido,
  textoSobre,
  variablesTema,
} from "./tema-cliente";

describe("validación de color", () => {
  it("acepta solo #RRGGBB — nunca CSS libre", () => {
    expect(esHexValido("#1E9B4B")).toBe(true);
    expect(esHexValido("#1b4f9c")).toBe(true);
    for (const invalido of ["#FFF", "rojo", "rgb(0,0,0)", "url(x)", "#GGGGGG", "", null]) {
      expect(esHexValido(invalido)).toBe(false);
    }
  });
});

describe("derivación del tema", () => {
  it("deriva todas las variables a partir de los dos colores", () => {
    const vars = variablesTema({ colorPrimario: "#1E9B4B", colorSecundario: "#0E5C2C" });
    expect(vars["--cliente-primario"]).toBe("#1E9B4B");
    expect(vars["--cliente-secundario"]).toBe("#0E5C2C");
    // Estados, superficies y gradiente existen sin que el cliente los defina.
    for (const clave of [
      "--cliente-primario-hover",
      "--cliente-primario-activo",
      "--cliente-primario-suave",
      "--cliente-primario-borde",
      "--cliente-primario-sombra",
      "--cliente-primario-texto",
      "--cliente-gradiente",
    ]) {
      expect(vars[clave]).toBeTruthy();
    }
  });

  it("es determinista: mismos colores, mismas variables", () => {
    const identidad = { colorPrimario: "#C0392B", colorSecundario: "#7B241C" };
    expect(variablesTema(identidad)).toEqual(variablesTema(identidad));
  });

  it("sin colores propios usa la paleta CuadreApp (la experiencia nunca se rompe)", () => {
    const vars = variablesTema({ colorPrimario: null, colorSecundario: null });
    expect(vars["--cliente-primario"]).toBe(COLOR_CUADREAPP.primario);
    expect(vars["--cliente-secundario"]).toBe(COLOR_CUADREAPP.secundario);
  });

  it("un color inválido cae al de CuadreApp en vez de inyectarse crudo", () => {
    const vars = variablesTema({
      colorPrimario: "javascript:alert(1)",
      colorSecundario: "url(http://x)",
    });
    expect(vars["--cliente-primario"]).toBe(COLOR_CUADREAPP.primario);
    expect(JSON.stringify(vars)).not.toContain("javascript:");
    expect(JSON.stringify(vars)).not.toContain("url(http");
  });

  it("clientes distintos producen identidades distintas — sin tocar código", () => {
    const verde = variablesTema({ colorPrimario: "#1E9B4B", colorSecundario: "#0E5C2C" });
    const azul = variablesTema({ colorPrimario: "#1B4F9C", colorSecundario: "#0C2A55" });
    const rojo = variablesTema({ colorPrimario: "#C0392B", colorSecundario: "#7B241C" });
    expect(new Set([verde, azul, rojo].map((v) => v["--cliente-primario"])).size).toBe(3);
  });
});

describe("contraste — lo decide el Design System, no el cliente", () => {
  it("elige texto claro u oscuro según legibilidad (WCAG)", () => {
    expect(textoSobre("#0C2A55")).toBe("#FFFFFF"); // azul oscuro → texto blanco
    expect(textoSobre("#F4D03F")).toBe("#0B1116"); // amarillo claro → texto oscuro
    // Y siempre con contraste suficiente para leerse.
    for (const color of ["#1E9B4B", "#1B4F9C", "#C0392B", "#F4D03F"]) {
      expect(contraste(color, textoSobre(color))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("advierte (sin bloquear) cuando el color casi no contrasta con el panel oscuro", () => {
    expect(contrasteInsuficiente("#0B1116")).toBe(true);
    expect(contrasteInsuficiente("#5B90C4")).toBe(false);
    expect(contrasteInsuficiente(null)).toBe(false);
  });
});
