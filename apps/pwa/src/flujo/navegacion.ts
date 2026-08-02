// Modelo de navegación hacia atrás del wizard del conductor.
// Una sola fuente de verdad: qué paso precede a cuál, cuándo se puede
// volver, qué se invalida y con qué mensaje se pide confirmación.
// Cero dependencias de React o del navegador: reglas puras y probadas.

/** Pasos del flujo (los mismos de App.tsx). */
export type PasoWizard =
  "inicio" | "equipo" | "conductor" | "antes" | "cargando" | "despues" | "listo" | "diagnostico";

/**
 * Paso inmediatamente anterior. `null` = no se puede volver:
 *  - inicio: es la raíz del flujo.
 *  - listo: la carga YA está guardada en la cola — volver podría
 *    reabrir/duplicar un registro confirmado.
 */
export const PASO_ANTERIOR: Record<PasoWizard, PasoWizard | null> = {
  inicio: null,
  equipo: "inicio",
  conductor: "equipo",
  antes: "conductor",
  cargando: "antes",
  despues: "cargando",
  listo: null,
  diagnostico: "inicio",
};

/**
 * ¿Se permite retroceder desde este paso ahora?
 * `guardando` bloquea TODO retroceso: entre el toque de "Guardar la
 * carga" y la escritura en la cola no hay vuelta atrás (evita
 * duplicados y estados a medias).
 */
export function puedeVolver(paso: PasoWizard, opciones?: { guardando?: boolean }): boolean {
  if (opciones?.guardando) return false;
  return PASO_ANTERIOR[paso] !== null;
}

/* ============ Datos del borrador que participan en las reglas ============ */

export interface DatosDependientes {
  conductor: boolean;
  fotoInicial: boolean;
  fotoFinal: boolean;
  lecturas: boolean; // tanda/tot finales o contador del equipo ya escritos
  iniciada: boolean;
}

/** ¿Cambiar de equipo destruiría información ya capturada? */
export function hayDatosDependientesDeEquipo(datos: DatosDependientes): boolean {
  return datos.conductor || datos.fotoInicial || datos.fotoFinal || datos.lecturas || datos.iniciada;
}

/**
 * Regla de invalidación al CAMBIAR de equipo: todo lo que dependía del
 * equipo anterior deja de ser válido. Devuelve los campos del borrador
 * que deben limpiarse (el GPS se conserva: es del lugar, no del equipo).
 */
export function invalidacionPorCambioDeEquipo() {
  return {
    conductor: null,
    fotoInicial: null,
    fotoFinal: null,
    tandaInicial: "0,0",
    tandaFinal: "",
    totFinal: "",
    lecturaEquipo: "",
    nota: "",
    iniciadaEn: null,
    finalizadaEn: null,
  } as const;
}

/* ============ Confirmaciones (lenguaje de operador, no técnico) ============ */

export interface Confirmacion {
  titulo: string;
  cuerpo: string;
  accion: string; // rótulo del botón que confirma
}

export const CONFIRMACIONES = {
  descartarFotoInicial: {
    titulo: "¿Volver a la pantalla anterior?",
    cuerpo: "Si vuelves, tendrás que tomar nuevamente la foto inicial.",
    accion: "Volver",
  },
  cambiarEquipo: {
    titulo: "¿Cambiar de equipo?",
    cuerpo:
      "Si cambias de equipo, se eliminarán el conductor, las lecturas y las fotografías de esta carga.",
    accion: "Cambiar de equipo",
  },
  volverConCargaIniciada: {
    titulo: "¿Volver con la carga iniciada?",
    cuerpo:
      "Esta carga ya comenzó. Volver no detendrá el cronómetro, pero podrás corregir la foto y las lecturas iniciales.",
    accion: "Volver",
  },
} satisfies Record<string, Confirmacion>;

/**
 * Decisión de retroceso desde un paso: a dónde ir, qué limpiar y si
 * hace falta confirmar. La UI ejecuta; aquí se decide.
 */
export type DecisionAtras =
  | { tipo: "bloqueado" }
  | {
      tipo: "volver";
      destino: PasoWizard;
      limpiar?: ReturnType<typeof limpiezaFotoInicial>;
      confirmar?: Confirmacion;
    };

export function limpiezaFotoInicial() {
  return { fotoInicial: null } as const;
}

export function decidirAtras(
  paso: PasoWizard,
  datos: DatosDependientes,
  opciones?: { guardando?: boolean },
): DecisionAtras {
  if (!puedeVolver(paso, opciones)) return { tipo: "bloqueado" };
  const destino = PASO_ANTERIOR[paso]!;

  // antes → conductor: la foto inicial pertenece al momento de la
  // captura; al retroceder se descarta, y JAMÁS sin confirmación.
  if (paso === "antes" && datos.fotoInicial) {
    return {
      tipo: "volver",
      destino,
      limpiar: limpiezaFotoInicial(),
      confirmar: CONFIRMACIONES.descartarFotoInicial,
    };
  }

  // cargando → antes: se conserva TODO (el cronómetro no se detiene);
  // se avisa para que el operador entienda qué está pasando.
  if (paso === "cargando") {
    return { tipo: "volver", destino, confirmar: CONFIRMACIONES.volverConCargaIniciada };
  }

  // despues → cargando, conductor → equipo, equipo → inicio,
  // diagnostico → inicio: no se pierde nada, retroceso directo.
  return { tipo: "volver", destino };
}
