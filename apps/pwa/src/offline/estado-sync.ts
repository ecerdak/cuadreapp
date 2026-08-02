// Estado observable de la sincronización (FASE 4 del hardening PWA):
// conectividad, progreso "X de Y", última sincronización exitosa
// (persistida), último error y aviso de actualización de la PWA.
// Store mínimo sin dependencias; React lo consume con
// useSyncExternalStore. Regla absoluta: jamás decir "todo sincronizado"
// si hay pendientes — eso lo decide la UI cruzando este estado con los
// contadores reales de la cola.

import type { BdLocal } from "./bd";
import { pendientesListas } from "./cola";
import { procesarPendientes, type ClienteApi, type ResumenSincronizacion } from "./sincronizador";

export interface EstadoSync {
  conectado: boolean;
  sincronizando: { actual: number; total: number } | null;
  ultimaSincronizacionEn: string | null;
  ultimoError: string | null;
  actualizacionLista: boolean;
}

const INICIAL: EstadoSync = {
  conectado: true,
  sincronizando: null,
  ultimaSincronizacionEn: null,
  ultimoError: null,
  actualizacionLista: false,
};

let estado: EstadoSync = { ...INICIAL };
const oyentes = new Set<() => void>();

export const obtenerEstadoSync = (): EstadoSync => estado;

export function suscribirEstadoSync(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => void oyentes.delete(oyente);
}

function emitir(parcial: Partial<EstadoSync>): void {
  estado = { ...estado, ...parcial };
  for (const oyente of oyentes) oyente();
}

/** Solo para pruebas. */
export function _reiniciarEstadoSync(): void {
  estado = { ...INICIAL };
}

const CLAVE_META = "meta:ultima-sync";

export async function cargarEstadoInicial(bd: BdLocal): Promise<void> {
  const fila = await bd.contexto.get(CLAVE_META);
  emitir({
    ultimaSincronizacionEn: fila?.valor ?? null,
    conectado: typeof navigator === "undefined" ? true : navigator.onLine,
  });
}

/** Sincroniza reportando progreso al estado y persistiendo la última
 *  sincronización exitosa. Es el camino que usan la app y el
 *  sincronizador periódico. */
export async function sincronizarConEstado(
  bd: BdLocal,
  api: ClienteApi,
): Promise<ResumenSincronizacion> {
  const total = (await pendientesListas(bd, new Date())).length;
  if (total > 0) emitir({ sincronizando: { actual: 0, total } });

  const resumen = await procesarPendientes(bd, api, undefined, (actual, delTotal) =>
    emitir({ sincronizando: { actual, total: delTotal } }),
  );

  const parcial: Partial<EstadoSync> = { sincronizando: null };
  if (resumen.sincronizadas > 0) {
    const ahora = new Date().toISOString();
    parcial.ultimaSincronizacionEn = ahora;
    await bd.contexto.put({ clave: CLAVE_META, valor: ahora });
  }
  parcial.ultimoError =
    resumen.reintentables > 0
      ? "sin conexión con el servidor"
      : resumen.definitivas > 0
        ? "hay registros rechazados que necesitan al supervisor"
        : null;
  emitir(parcial);
  return resumen;
}

/** Cablea los eventos del navegador. Devuelve la función para detener. */
export function iniciarEstadoSync(bd: BdLocal): () => void {
  void cargarEstadoInicial(bd);

  const alConectar = () => emitir({ conectado: true });
  const alDesconectar = () => emitir({ conectado: false });
  window.addEventListener("online", alConectar);
  window.addEventListener("offline", alDesconectar);

  // Actualización de la PWA: el SW nuevo toma control (autoUpdate sin
  // recarga forzada — verificado en el artefacto de build). El primer
  // controllerchange tras la instalación inicial NO cuenta.
  let habiaControlador = Boolean(navigator.serviceWorker?.controller);
  const alCambiarControlador = () => {
    if (habiaControlador) emitir({ actualizacionLista: true });
    habiaControlador = true;
  };
  navigator.serviceWorker?.addEventListener("controllerchange", alCambiarControlador);

  return () => {
    window.removeEventListener("online", alConectar);
    window.removeEventListener("offline", alDesconectar);
    navigator.serviceWorker?.removeEventListener("controllerchange", alCambiarControlador);
  };
}
