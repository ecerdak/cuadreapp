// Back físico / gesto del sistema, sin hacks frágiles: un ancla en el
// historial hace que "atrás" dispare popstate en vez de salir de la
// PWA. La app decide (misma lógica que el botón visual) y el control
// re-ancla solo mientras haya wizard al que volver — en la raíz, el
// siguiente "atrás" sale con normalidad (jamás un cierre abrupto a
// mitad de carga). Adaptador inyectable: probado sin navegador.

export type ResultadoRetroceso =
  /** El wizard atendió el retroceso: seguimos dentro (re-anclar). */
  | "permanecer"
  /** Estamos en la raíz: no se re-ancla y el próximo atrás sale. */
  | "liberar";

export interface AdaptadorHistorial {
  /** Empuja la entrada-ancla del wizard al historial. */
  anclar(): void;
  /** Suscribe al retroceso (popstate); devuelve la des-suscripción. */
  alRetroceder(oyente: () => void): () => void;
}

export function adaptadorNavegador(ventana: Window): AdaptadorHistorial {
  return {
    anclar: () => ventana.history.pushState({ cuadreapp: "wizard" }, ""),
    alRetroceder: (oyente) => {
      const manejador = () => oyente();
      ventana.addEventListener("popstate", manejador);
      return () => ventana.removeEventListener("popstate", manejador);
    },
  };
}

/**
 * Instala el control. `manejar` se invoca en cada retroceso del
 * sistema y decide si permanecemos (se re-ancla) o se libera la
 * salida. Devuelve la función de desinstalación.
 */
export function instalarControlDeAtras(
  adaptador: AdaptadorHistorial,
  manejar: () => ResultadoRetroceso,
): () => void {
  let anclado = false;

  const asegurarAncla = () => {
    if (!anclado) {
      adaptador.anclar();
      anclado = true;
    }
  };

  asegurarAncla();
  const desuscribir = adaptador.alRetroceder(() => {
    anclado = false; // el pop consumió el ancla
    if (manejar() === "permanecer") asegurarAncla();
  });

  return desuscribir;
}

/* ============ Decisión pura del Back del sistema ============ */

export interface ContextoBack {
  /** Fuera del wizard (splash, enrolamiento, sin catálogo). */
  puertaActiva: boolean;
  paso: string;
  guardando: boolean;
  confirmacionAbierta: boolean;
}

export type AccionBack =
  | { accion: "ignorar"; resultado: "permanecer" } // guardando: ni un paso atrás
  | { accion: "cerrar_confirmacion"; resultado: "permanecer" }
  | { accion: "salir_de_listo"; resultado: "liberar" } // → inicio; jamás reabre la carga
  | { accion: "atras"; resultado: "permanecer" } // misma lógica que el botón visual
  | { accion: "nada"; resultado: "liberar" }; // raíz o puertas: salida normal

/** El Back físico se comporta EXACTAMENTE como el botón visual. */
export function decidirBackDelSistema(ctx: ContextoBack): AccionBack {
  if (ctx.puertaActiva) return { accion: "nada", resultado: "liberar" };
  if (ctx.guardando) return { accion: "ignorar", resultado: "permanecer" };
  if (ctx.confirmacionAbierta) return { accion: "cerrar_confirmacion", resultado: "permanecer" };
  if (ctx.paso === "listo") return { accion: "salir_de_listo", resultado: "liberar" };
  if (ctx.paso === "inicio") return { accion: "nada", resultado: "liberar" };
  return { accion: "atras", resultado: "permanecer" };
}
