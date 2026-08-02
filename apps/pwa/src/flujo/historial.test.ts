// Back físico / gesto del sistema (tests 10-12 y 16 del plan): el
// control ancla el historial, re-ancla mientras el wizard atienda el
// retroceso, libera la salida en la raíz y jamás cierra la app a mitad
// de carga. Probado con un adaptador falso, sin navegador.

import { describe, expect, it, vi } from "vitest";
import { decidirBackDelSistema, instalarControlDeAtras, type AdaptadorHistorial } from "./historial";

function adaptadorFalso() {
  let oyente: (() => void) | null = null;
  const anclas: number[] = [];
  const adaptador: AdaptadorHistorial = {
    anclar: () => anclas.push(anclas.length + 1),
    alRetroceder: (fn) => {
      oyente = fn;
      return () => {
        oyente = null;
      };
    },
  };
  return {
    adaptador,
    anclas,
    retroceder: () => oyente?.(),
    suscrito: () => oyente !== null,
  };
}

describe("instalarControlDeAtras", () => {
  it("ancla el historial al instalar y re-ancla mientras el wizard atienda (test 11: no cierra la PWA)", () => {
    const { adaptador, anclas, retroceder } = adaptadorFalso();
    const manejar = vi.fn().mockReturnValue("permanecer");
    instalarControlDeAtras(adaptador, manejar);
    expect(anclas).toHaveLength(1);

    retroceder(); // back físico con carga activa
    expect(manejar).toHaveBeenCalledTimes(1);
    expect(anclas).toHaveLength(2); // re-anclado: la app NO se cierra

    retroceder();
    expect(anclas).toHaveLength(3);
  });

  it("al liberar no re-ancla: el siguiente atrás sale con normalidad", () => {
    const { adaptador, anclas, retroceder } = adaptadorFalso();
    instalarControlDeAtras(adaptador, () => "liberar");
    retroceder();
    expect(anclas).toHaveLength(1); // solo el ancla inicial, sin re-anclar
  });

  it("desinstalar deja de escuchar el retroceso", () => {
    const { adaptador, retroceder, suscrito } = adaptadorFalso();
    const manejar = vi.fn().mockReturnValue("permanecer");
    const desinstalar = instalarControlDeAtras(adaptador, manejar);
    desinstalar();
    expect(suscrito()).toBe(false);
    retroceder();
    expect(manejar).not.toHaveBeenCalled();
  });
});

describe("decidirBackDelSistema — equivale al botón visual (test 10)", () => {
  const base = { puertaActiva: false, guardando: false, confirmacionAbierta: false };

  it("en un paso editable ejecuta el MISMO atrás que el botón visual", () => {
    for (const paso of ["equipo", "conductor", "antes", "cargando", "despues", "diagnostico"]) {
      expect(decidirBackDelSistema({ ...base, paso })).toEqual({
        accion: "atras",
        resultado: "permanecer",
      });
    }
  });

  it("guardando: ignora el back — ni un paso atrás, ni salir (test 12)", () => {
    expect(decidirBackDelSistema({ ...base, paso: "despues", guardando: true })).toEqual({
      accion: "ignorar",
      resultado: "permanecer",
    });
  });

  it("con una confirmación abierta, back = Cancelar (no salta pasos)", () => {
    expect(decidirBackDelSistema({ ...base, paso: "antes", confirmacionAbierta: true })).toEqual({
      accion: "cerrar_confirmacion",
      resultado: "permanecer",
    });
  });

  it("desde Listo va al inicio: jamás reabre una carga confirmada (test 16)", () => {
    expect(decidirBackDelSistema({ ...base, paso: "listo" })).toEqual({
      accion: "salir_de_listo",
      resultado: "liberar",
    });
  });

  it("en el inicio y en las puertas (enrolamiento) libera la salida normal", () => {
    expect(decidirBackDelSistema({ ...base, paso: "inicio" })).toEqual({
      accion: "nada",
      resultado: "liberar",
    });
    expect(decidirBackDelSistema({ ...base, paso: "equipo", puertaActiva: true })).toEqual({
      accion: "nada",
      resultado: "liberar",
    });
  });
});
