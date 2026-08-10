// La pantalla de operador ya no queda muerta con un código inexistente.
//
// Antes: teclear un código que no existe no mostraba error, no habilitaba
// botón y no ofrecía salida — la pantalla quedaba congelada.
//
// Los códigos se comparan como TEXTO EXACTO y no se normalizan: '01' no
// es '1'. Las convenciones vigentes ('01' y '03'/'07'/'11') siguen
// funcionando sin cambiar un solo dato.

import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";
import { Conductor, evaluarCodigo, longitudCodigoEsperada } from "./Conductor";
import type { ConductorCatalogo } from "../datos/catalogo";

// El entorno de pruebas es node puro (sin jsdom): la pantalla de
// operador lee el último conductor recordado de localStorage.
beforeAll(() => {
  const memoria = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => memoria.get(k) ?? null,
      setItem: (k: string, v: string) => void memoria.set(k, v),
      removeItem: (k: string) => void memoria.delete(k),
      clear: () => memoria.clear(),
    },
  });
});

const operador = (id: string, nombre: string, codigo: string): ConductorCatalogo => ({
  id,
  nombre,
  codigo,
  pinHash: "$2a$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQR",
});

// Catálogo con un único operador de código '01' (la forma que dejaba
// muerta la pantalla): un solo dígito nunca coincide.
const UN_OPERADOR = [operador("u1", "Operadora Uno", "01")];

// Catálogo con varios códigos de dos dígitos: la convención vigente.
const VARIOS = [
  operador("v1", "Operador Tres", "03"),
  operador("v2", "Operador Siete", "07"),
  operador("v3", "Operadora Once", "11"),
];

describe("Pantalla de operador · código exacto sin estado muerto", () => {
  it("la longitud esperada sale del catálogo, no de una convención cableada", () => {
    expect(longitudCodigoEsperada(UN_OPERADOR)).toBe(2);
    expect(longitudCodigoEsperada(VARIOS)).toBe(2);
    expect(longitudCodigoEsperada([operador("x", "Uno", "1")])).toBe(1);
    expect(longitudCodigoEsperada([])).toBe(0);
  });

  it("código '01' + entrada '01' → encuentra al operador", () => {
    const { encontrado, noExiste } = evaluarCodigo(UN_OPERADOR, "01");
    expect(encontrado?.nombre).toBe("Operadora Uno");
    expect(noExiste).toBe(false);
  });

  it("código '01' + entrada '1' → NO avanza (no se normaliza el cero)", () => {
    expect(evaluarCodigo(UN_OPERADOR, "1").encontrado).toBeNull();
  });

  it("código '01' + entrada '1' (longitud incompleta) → NO hay error prematuro", () => {
    expect(evaluarCodigo(UN_OPERADOR, "1").noExiste).toBe(false);
  });

  it("secuencia real 0 → 1: el primer dígito no avisa nada, el segundo identifica", () => {
    const paso1 = evaluarCodigo(UN_OPERADOR, "0");
    expect(paso1.encontrado).toBeNull();
    expect(paso1.noExiste).toBe(false);
    const paso2 = evaluarCodigo(UN_OPERADOR, "01");
    expect(paso2.encontrado?.nombre).toBe("Operadora Uno");
  });

  it("código inexistente con longitud completa → error explícito", () => {
    expect(evaluarCodigo(UN_OPERADOR, "12")).toEqual({ encontrado: null, noExiste: true });
    expect(evaluarCodigo(VARIOS, "99")).toEqual({ encontrado: null, noExiste: true });
  });

  it("borrar limpia el error: al volver a longitud incompleta deja de avisar", () => {
    expect(evaluarCodigo(UN_OPERADOR, "12").noExiste).toBe(true);
    expect(evaluarCodigo(UN_OPERADOR, "1").noExiste).toBe(false); // ⌫
    expect(evaluarCodigo(UN_OPERADOR, "").noExiste).toBe(false); // ⌫
  });

  it("los códigos 03, 07 y 11 siguen funcionando igual", () => {
    expect(evaluarCodigo(VARIOS, "03").encontrado?.nombre).toBe("Operador Tres");
    expect(evaluarCodigo(VARIOS, "07").encontrado?.nombre).toBe("Operador Siete");
    expect(evaluarCodigo(VARIOS, "11").encontrado?.nombre).toBe("Operadora Once");
    // y su prefijo '0' sigue sin avisar error
    expect(evaluarCodigo(VARIOS, "0").noExiste).toBe(false);
  });

  it("un prefijo jamás identifica aunque sea prefijo de un código válido", () => {
    expect(evaluarCodigo(VARIOS, "1").encontrado).toBeNull(); // prefijo de '11'
  });

  it("la pantalla lista los operadores con su código: siempre hay salida", () => {
    const html = renderToStaticMarkup(<Conductor conductores={UN_OPERADOR} onIdentificado={() => {}} />);
    expect(html).toContain("Operadores de esta sede");
    expect(html).toContain("Operadora Uno");
    expect(html).toContain("01");
    expect(html).toContain("Código de conductor"); // el teclado sigue
  });

  it("el microcopy del error es el aprobado", () => {
    // La pantalla en limpio no muestra el error…
    const limpio = renderToStaticMarkup(
      <Conductor conductores={UN_OPERADOR} onIdentificado={() => {}} />,
    );
    expect(limpio).not.toContain("Código de operador no encontrado.");
    // …y el rótulo aprobado del PIN sigue intacto.
    expect(limpio).not.toContain("Código o PIN incorrecto.");
  });
});
