import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import type { ResultadoValidacion } from "@cuadreapp/dominio";
import { crearBd, type PayloadCarga } from "./bd";
import { encolarCarga } from "./cola";
import { procesarPendientes, type ClienteApi, type RespuestaApi } from "./sincronizador";

const veredictoOk: ResultadoValidacion = {
  estado: "ok",
  banderas: [],
  marcas: [],
  galNoRegistrados: null,
  exigeNota: false,
  bloqueaAvance: false,
  bloqueaCierre: false,
};

function payloadBase(): PayloadCarga {
  return {
    id: crypto.randomUUID(),
    dispensador_id: "11111111-1111-4111-8111-111111111111",
    equipo_id: "22111111-1111-4111-8111-111111111111",
    conductor_id: "31111111-1111-4111-8111-111111111111",
    tanda_inicial_gal: 0.0,
    tot_inicial_gal: 1847.0,
    tanda_final_gal: 42.5,
    tot_final_gal: 1889.5,
    lectura_equipo: null,
    iniciada_en: "2026-07-31T09:00:00-05:00",
    finalizada_en: "2026-07-31T09:05:00-05:00",
    lat: null,
    lng: null,
    precision_gps_m: null,
    origen: "app",
    foto_inicial_path: null,
    foto_final_path: null,
    notas: null,
    device_id: null,
    version_app: null,
  };
}

async function bdConCargas(cantidad: number) {
  const bd = crearBd(`prueba-${crypto.randomUUID()}`);
  const ids: string[] = [];
  for (let i = 0; i < cantidad; i++) {
    const payload = payloadBase();
    ids.push(payload.id);
    await encolarCarga(bd, {
      payload,
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 42.5 },
      fotos: { inicial: null, final: null },
      creadaEn: `2026-07-31T09:0${i}:00.000Z`,
    });
  }
  return { bd, ids };
}

function apiQueResponde(...respuestas: RespuestaApi[]): ClienteApi & { llamadas: PayloadCarga[] } {
  const llamadas: PayloadCarga[] = [];
  return {
    llamadas,
    async registrarCarga(payload) {
      llamadas.push(payload);
      return respuestas[Math.min(llamadas.length - 1, respuestas.length - 1)]!;
    },
  };
}

const aceptada = (): RespuestaApi => ({
  tipo: "aceptada",
  veredicto: { estado: "ok", banderas: [], gal_no_registrados: null, request_id: "req-1" },
});

describe("sincronizador", () => {
  it("sube una carga pendiente y guarda el veredicto del servidor", async () => {
    const { bd, ids } = await bdConCargas(1);
    const api = apiQueResponde(aceptada());

    const resumen = await procesarPendientes(bd, api);

    expect(resumen).toEqual({ sincronizadas: 1, reintentables: 0, definitivas: 0 });
    const carga = await bd.cargas.get(ids[0]!);
    expect(carga).toMatchObject({
      sincronizacion: "sincronizada",
      veredictoServidor: { estado: "ok", request_id: "req-1" },
    });
  });

  it("una carga sincronizada no se vuelve a enviar", async () => {
    const { bd } = await bdConCargas(1);
    const api = apiQueResponde(aceptada());

    await procesarPendientes(bd, api);
    await procesarPendientes(bd, api);

    expect(api.llamadas).toHaveLength(1);
  });

  it("el veredicto del servidor puede diferir del local y queda guardado (el servidor es la autoridad)", async () => {
    const { bd, ids } = await bdConCargas(1);
    const api = apiQueResponde({
      tipo: "aceptada",
      veredicto: {
        estado: "inconsistente",
        banderas: ["SALTO_TOTALIZADOR"],
        gal_no_registrados: 18.0,
        request_id: "req-2",
      },
    });

    await procesarPendientes(bd, api);

    const carga = await bd.cargas.get(ids[0]!);
    expect(carga!.estadoLocal).toBe("ok"); // lo que vio el conductor en el momento
    expect(carga!.veredictoServidor).toMatchObject({
      estado: "inconsistente",
      banderas: ["SALTO_TOTALIZADOR"],
    });
  });

  it("un rechazo definitivo (4xx) marca error_definitivo y no se reintenta", async () => {
    const { bd, ids } = await bdConCargas(1);
    const api = apiQueResponde({ tipo: "rechazo_definitivo", detalle: "HTTP 400: campo inválido" });

    await procesarPendientes(bd, api);
    await procesarPendientes(bd, api);

    expect(api.llamadas).toHaveLength(1);
    expect((await bd.cargas.get(ids[0]!))!.sincronizacion).toBe("error_definitivo");
  });

  it("MODO AVIÓN: sin red se programa el reintento con backoff y se detiene la cola", async () => {
    const { bd, ids } = await bdConCargas(3);
    const api = apiQueResponde({ tipo: "reintentable", detalle: "sin conexión" });
    const ahora = new Date("2026-07-31T10:00:00.000Z");

    const resumen = await procesarPendientes(bd, api, () => ahora);

    expect(resumen).toEqual({ sincronizadas: 0, reintentables: 1, definitivas: 0 });
    expect(api.llamadas).toHaveLength(1); // se detuvo: no martilla las otras dos
    const primera = (await bd.cargas.get(ids[0]!))!;
    expect(primera.intentos).toBe(1);
    expect(primera.proximoIntentoEn).toBe("2026-07-31T10:00:02.000Z"); // +2 s (backoff intento 1)
  });

  it("RECUPERACIÓN: al volver la señal, toda la cola se vacía en orden", async () => {
    const { bd, ids } = await bdConCargas(3);

    // Primer intento: sin señal.
    const sinRed = apiQueResponde({ tipo: "reintentable", detalle: "sin conexión" });
    await procesarPendientes(bd, sinRed, () => new Date("2026-07-31T10:00:00.000Z"));

    // Vuelve la señal (el evento 'online' dispara otro procesamiento,
    // ya pasado el backoff): todo sube, en orden FIFO.
    const conRed = apiQueResponde(aceptada());
    const resumen = await procesarPendientes(bd, conRed, () => new Date("2026-07-31T10:00:05.000Z"));

    expect(resumen).toEqual({ sincronizadas: 3, reintentables: 0, definitivas: 0 });
    expect(conRed.llamadas.map((p) => p.id)).toEqual(ids);
    for (const id of ids) {
      expect((await bd.cargas.get(id))!.sincronizacion).toBe("sincronizada");
    }
  });
});
