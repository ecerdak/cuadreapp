// Sincronización (spec §10): sube las cargas pendientes cuando hay
// señal, con backoff exponencial y recuperación automática al volver
// la conectividad (evento 'online' + tic periódico). La app abierta es
// el supuesto: iOS Safari no tiene Background Sync.

import type { BdLocal, PayloadCarga, VeredictoServidor } from "./bd";
import {
  marcarErrorDefinitivo,
  marcarSincronizada,
  pendientesListas,
  registrarFalloReintentable,
} from "./cola";

export type RespuestaApi =
  | { tipo: "aceptada"; veredicto: VeredictoServidor }
  | { tipo: "rechazo_definitivo"; detalle: string }
  | { tipo: "reintentable"; detalle: string };

export interface ClienteApi {
  registrarCarga(payload: PayloadCarga): Promise<RespuestaApi>;
}

export interface ResumenSincronizacion {
  sincronizadas: number;
  reintentables: number;
  definitivas: number;
}

export async function procesarPendientes(
  bd: BdLocal,
  api: ClienteApi,
  ahora: () => Date = () => new Date(),
): Promise<ResumenSincronizacion> {
  const resumen: ResumenSincronizacion = { sincronizadas: 0, reintentables: 0, definitivas: 0 };

  for (const carga of await pendientesListas(bd, ahora())) {
    const respuesta = await api.registrarCarga(carga.payload);

    if (respuesta.tipo === "aceptada") {
      await marcarSincronizada(bd, carga.id, respuesta.veredicto);
      resumen.sincronizadas += 1;
    } else if (respuesta.tipo === "rechazo_definitivo") {
      await marcarErrorDefinitivo(bd, carga.id, respuesta.detalle);
      resumen.definitivas += 1;
    } else {
      await registrarFalloReintentable(bd, carga.id, respuesta.detalle, ahora());
      resumen.reintentables += 1;
      break; // la red está caída: no martillar el resto de la cola
    }
  }

  return resumen;
}

export function iniciarSincronizador(
  bd: BdLocal,
  api: ClienteApi,
  opciones: { intervaloMs?: number } = {},
): { detener(): void } {
  const intervaloMs = opciones.intervaloMs ?? 15_000;
  let procesando = false;

  const tic = async () => {
    if (procesando) return;
    procesando = true;
    try {
      await procesarPendientes(bd, api);
    } finally {
      procesando = false;
    }
  };

  const alVolverSenal = () => void tic();
  window.addEventListener("online", alVolverSenal);
  const temporizador = setInterval(() => void tic(), intervaloMs);
  void tic();

  return {
    detener() {
      clearInterval(temporizador);
      window.removeEventListener("online", alVolverSenal);
    },
  };
}
