// Sincronización (spec §10): fotos PRIMERO, luego el registro con las
// rutas confirmadas (§10.3); backoff exponencial y recuperación
// automática al volver la señal. Los blobs locales se borran solo
// cuando el servidor acepta la carga (§10.6). La app abierta es el
// supuesto: iOS Safari no tiene Background Sync.

import type { BdLocal, CargaLocal, PayloadCarga, VeredictoServidor } from "./bd";
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

export type RespuestaFoto =
  | { tipo: "aceptada"; storagePath: string }
  | { tipo: "rechazo_definitivo"; detalle: string }
  | { tipo: "reintentable"; detalle: string };

export interface ClienteApi {
  registrarCarga(payload: PayloadCarga): Promise<RespuestaApi>;
  subirFoto(
    cargaId: string,
    momento: "inicial" | "final",
    bytes: ArrayBuffer,
    tipo: string,
  ): Promise<RespuestaFoto>;
}

export interface ResumenSincronizacion {
  sincronizadas: number;
  reintentables: number;
  definitivas: number;
}

/** Sube la evidencia de una carga. "ok" = todas arriba y paths
 *  confirmados en el payload; si algo falla, quién decide es el que
 *  llama. La subida es idempotente (misma ruta, upsert del servidor). */
async function subirFotosDeCarga(
  bd: BdLocal,
  api: ClienteApi,
  carga: CargaLocal,
): Promise<"ok" | "reintentable" | "definitivo"> {
  const fotos = (await bd.fotos.where("cargaId").equals(carga.id).toArray())
    // Orden determinista: la evidencia inicial primero, como el flujo físico.
    .sort((a, b) => (a.momento === b.momento ? 0 : a.momento === "inicial" ? -1 : 1));

  for (const foto of fotos) {
    const respuesta = await api.subirFoto(carga.id, foto.momento, foto.bytes, foto.tipo);
    if (respuesta.tipo === "reintentable") return "reintentable";
    if (respuesta.tipo === "rechazo_definitivo") return "definitivo";

    // La ruta real la decide la API: se confirma en el payload antes de
    // registrar la carga (spec §10.3: fotos primero, luego el registro).
    const campo = foto.momento === "inicial" ? "foto_inicial_path" : "foto_final_path";
    if (carga.payload[campo] !== respuesta.storagePath) {
      carga.payload[campo] = respuesta.storagePath;
      await bd.cargas.update(carga.id, { payload: carga.payload });
    }
  }
  return "ok";
}

export async function procesarPendientes(
  bd: BdLocal,
  api: ClienteApi,
  ahora: () => Date = () => new Date(),
): Promise<ResumenSincronizacion> {
  const resumen: ResumenSincronizacion = { sincronizadas: 0, reintentables: 0, definitivas: 0 };

  for (const carga of await pendientesListas(bd, ahora())) {
    const fotos = await subirFotosDeCarga(bd, api, carga);
    if (fotos === "reintentable") {
      await registrarFalloReintentable(bd, carga.id, "fallo subiendo evidencia", ahora());
      resumen.reintentables += 1;
      break; // la red está caída: no martillar el resto de la cola
    }
    if (fotos === "definitivo") {
      await marcarErrorDefinitivo(bd, carga.id, "evidencia rechazada por la API");
      resumen.definitivas += 1;
      continue;
    }

    const respuesta = await api.registrarCarga(carga.payload);

    if (respuesta.tipo === "aceptada") {
      await marcarSincronizada(bd, carga.id, respuesta.veredicto);
      // El servidor ya tiene la evidencia: se liberan los blobs locales
      // (el resumen de la carga se conserva — spec §10.6).
      await bd.fotos.where("cargaId").equals(carga.id).delete();
      resumen.sincronizadas += 1;
    } else if (respuesta.tipo === "rechazo_definitivo") {
      await marcarErrorDefinitivo(bd, carga.id, respuesta.detalle);
      resumen.definitivas += 1;
    } else {
      await registrarFalloReintentable(bd, carga.id, respuesta.detalle, ahora());
      resumen.reintentables += 1;
      break;
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
