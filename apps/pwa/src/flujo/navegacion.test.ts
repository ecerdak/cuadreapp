// Reglas de navegación hacia atrás del wizard: qué paso precede a
// cuál, cuándo está bloqueado, qué se invalida y qué se confirma.

import { describe, expect, it } from "vitest";
import {
  CONFIRMACIONES,
  decidirAtras,
  hayDatosDependientesDeEquipo,
  invalidacionPorCambioDeEquipo,
  PASO_ANTERIOR,
  puedeVolver,
  type DatosDependientes,
} from "./navegacion";

const SIN_DATOS: DatosDependientes = {
  conductor: false,
  fotoInicial: false,
  fotoFinal: false,
  lecturas: false,
  iniciada: false,
};

describe("mapa de retroceso", () => {
  it("cada paso editable vuelve exactamente al anterior", () => {
    expect(PASO_ANTERIOR.equipo).toBe("inicio");
    expect(PASO_ANTERIOR.conductor).toBe("equipo");
    expect(PASO_ANTERIOR.antes).toBe("conductor");
    expect(PASO_ANTERIOR.cargando).toBe("antes");
    expect(PASO_ANTERIOR.despues).toBe("cargando");
    expect(PASO_ANTERIOR.diagnostico).toBe("inicio");
  });

  it("inicio es la raíz: no hay atrás", () => {
    expect(PASO_ANTERIOR.inicio).toBeNull();
    expect(puedeVolver("inicio")).toBe(false);
  });

  it("desde Listo NO se puede volver: la carga ya está guardada (test 16)", () => {
    expect(PASO_ANTERIOR.listo).toBeNull();
    expect(puedeVolver("listo")).toBe(false);
    expect(decidirAtras("listo", SIN_DATOS)).toEqual({ tipo: "bloqueado" });
  });

  it("guardando bloquea el retroceso en cualquier paso (test 12)", () => {
    for (const paso of ["equipo", "conductor", "antes", "cargando", "despues"] as const) {
      expect(puedeVolver(paso, { guardando: true })).toBe(false);
      expect(decidirAtras(paso, SIN_DATOS, { guardando: true })).toEqual({ tipo: "bloqueado" });
    }
  });
});

describe("invalidación por cambio de equipo (tests 1-2)", () => {
  it("cambiar de equipo limpia conductor, fotos, lecturas y tiempos — nunca el GPS", () => {
    const limpieza = invalidacionPorCambioDeEquipo();
    expect(limpieza.conductor).toBeNull();
    expect(limpieza.fotoInicial).toBeNull();
    expect(limpieza.fotoFinal).toBeNull();
    expect(limpieza.tandaFinal).toBe("");
    expect(limpieza.lecturaEquipo).toBe("");
    expect(limpieza.iniciadaEn).toBeNull();
    expect(limpieza).not.toHaveProperty("gps");
  });

  it("solo exige confirmación cuando hay algo que perder", () => {
    expect(hayDatosDependientesDeEquipo(SIN_DATOS)).toBe(false);
    expect(hayDatosDependientesDeEquipo({ ...SIN_DATOS, conductor: true })).toBe(true);
    expect(hayDatosDependientesDeEquipo({ ...SIN_DATOS, fotoInicial: true })).toBe(true);
    expect(hayDatosDependientesDeEquipo({ ...SIN_DATOS, lecturas: true })).toBe(true);
  });
});

describe("decisiones de retroceso por paso", () => {
  it("conductor → equipo: directo, sin confirmación (test 3: cambiar conductor conserva equipo)", () => {
    expect(decidirAtras("conductor", SIN_DATOS)).toEqual({ tipo: "volver", destino: "equipo" });
  });

  it("antes SIN foto → conductor: directo (test 6: la lectura editada se conserva en el borrador)", () => {
    expect(decidirAtras("antes", SIN_DATOS)).toEqual({ tipo: "volver", destino: "conductor" });
  });

  it("antes CON foto → exige confirmación y descarta SOLO la foto inicial (tests 4-5, 15)", () => {
    const decision = decidirAtras("antes", { ...SIN_DATOS, fotoInicial: true });
    expect(decision).toMatchObject({
      tipo: "volver",
      destino: "conductor",
      limpiar: { fotoInicial: null },
      confirmar: CONFIRMACIONES.descartarFotoInicial,
    });
  });

  it("cargando → antes: avisa que el cronómetro sigue y NO limpia nada (test 7)", () => {
    const decision = decidirAtras("cargando", { ...SIN_DATOS, fotoInicial: true, iniciada: true });
    expect(decision).toMatchObject({
      tipo: "volver",
      destino: "antes",
      confirmar: CONFIRMACIONES.volverConCargaIniciada,
    });
    expect("limpiar" in decision && decision.limpiar).toBeFalsy();
  });

  it("despues → cargando: directo, conserva fotos y lecturas finales (tests 8-9)", () => {
    const decision = decidirAtras("despues", {
      ...SIN_DATOS,
      fotoInicial: true,
      fotoFinal: true,
      lecturas: true,
      iniciada: true,
    });
    expect(decision).toEqual({ tipo: "volver", destino: "cargando" });
  });
});

describe("mensajes de confirmación (lenguaje de operador)", () => {
  it("no usan jerga técnica y ofrecen la acción clara", () => {
    for (const c of Object.values(CONFIRMACIONES)) {
      expect(c.cuerpo).not.toMatch(/borrador|estado|sesión|cache|sync|null/i);
      expect(c.accion.length).toBeGreaterThan(0);
      expect(c.titulo).toMatch(/\?/);
    }
    expect(CONFIRMACIONES.descartarFotoInicial.cuerpo).toContain("tomar nuevamente la foto");
    expect(CONFIRMACIONES.cambiarEquipo.cuerpo).toContain("se eliminarán el conductor");
    expect(CONFIRMACIONES.volverConCargaIniciada.cuerpo).toContain("no detendrá el cronómetro");
  });
});
