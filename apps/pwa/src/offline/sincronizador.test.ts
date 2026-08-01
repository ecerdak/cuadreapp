import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import type { ResultadoValidacion } from "@cuadreapp/dominio";
import { crearBd, type PayloadCarga } from "./bd";
import { encolarCarga } from "./cola";
import {
  procesarPendientes,
  type ClienteApi,
  type RespuestaApi,
  type RespuestaFoto,
} from "./sincronizador";

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

async function bdConCargas(cantidad: number, conFotos = false) {
  const bd = crearBd(`prueba-${crypto.randomUUID()}`);
  const ids: string[] = [];
  for (let i = 0; i < cantidad; i++) {
    const payload = payloadBase();
    if (conFotos) {
      payload.foto_inicial_path = `cargas/${payload.id}/inicial.webp`;
      payload.foto_final_path = `cargas/${payload.id}/final.webp`;
    }
    ids.push(payload.id);
    await encolarCarga(bd, {
      payload,
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 42.5 },
      fotos: conFotos
        ? {
            inicial: { bytes: new ArrayBuffer(8), tipo: "image/webp" },
            final: { bytes: new ArrayBuffer(8), tipo: "image/webp" },
          }
        : { inicial: null, final: null },
      creadaEn: `2026-07-31T09:0${i}:00.000Z`,
    });
  }
  return { bd, ids };
}

interface ApiFalsa extends ClienteApi {
  llamadasCarga: PayloadCarga[];
  llamadasFoto: Array<{ cargaId: string; momento: string }>;
}

function apiFalsa(
  opciones: {
    carga?: RespuestaApi;
    foto?: RespuestaFoto | ((cargaId: string, momento: string) => RespuestaFoto);
  } = {},
): ApiFalsa {
  const llamadasCarga: PayloadCarga[] = [];
  const llamadasFoto: Array<{ cargaId: string; momento: string }> = [];
  return {
    llamadasCarga,
    llamadasFoto,
    async registrarCarga(payload) {
      llamadasCarga.push(payload);
      return (
        opciones.carga ?? {
          tipo: "aceptada",
          veredicto: { estado: "ok", banderas: [], gal_no_registrados: null, request_id: "req-1" },
        }
      );
    },
    async subirFoto(cargaId, momento) {
      llamadasFoto.push({ cargaId, momento });
      const respuesta = opciones.foto ?? {
        tipo: "aceptada" as const,
        storagePath: `cliente-x/cargas/${cargaId}/${momento}.webp`,
      };
      return typeof respuesta === "function" ? respuesta(cargaId, momento) : respuesta;
    },
  };
}

describe("sincronizador — cargas sin fotos", () => {
  it("sube una carga pendiente y guarda el veredicto del servidor", async () => {
    const { bd, ids } = await bdConCargas(1);
    const api = apiFalsa();

    const resumen = await procesarPendientes(bd, api);

    expect(resumen).toEqual({ sincronizadas: 1, reintentables: 0, definitivas: 0 });
    expect(api.llamadasFoto).toHaveLength(0);
    const carga = await bd.cargas.get(ids[0]!);
    expect(carga).toMatchObject({
      sincronizacion: "sincronizada",
      veredictoServidor: { estado: "ok", request_id: "req-1" },
    });
  });

  it("una carga sincronizada no se vuelve a enviar", async () => {
    const { bd } = await bdConCargas(1);
    const api = apiFalsa();
    await procesarPendientes(bd, api);
    await procesarPendientes(bd, api);
    expect(api.llamadasCarga).toHaveLength(1);
  });

  it("el veredicto del servidor puede diferir del local y queda guardado (el servidor es la autoridad)", async () => {
    const { bd, ids } = await bdConCargas(1);
    const api = apiFalsa({
      carga: {
        tipo: "aceptada",
        veredicto: {
          estado: "inconsistente",
          banderas: ["SALTO_TOTALIZADOR"],
          gal_no_registrados: 18.0,
          request_id: "req-2",
        },
      },
    });

    await procesarPendientes(bd, api);

    const carga = await bd.cargas.get(ids[0]!);
    expect(carga!.estadoLocal).toBe("ok");
    expect(carga!.veredictoServidor).toMatchObject({ estado: "inconsistente" });
  });

  it("un rechazo definitivo (4xx) marca error_definitivo y no se reintenta", async () => {
    const { bd, ids } = await bdConCargas(1);
    const api = apiFalsa({ carga: { tipo: "rechazo_definitivo", detalle: "HTTP 400" } });
    await procesarPendientes(bd, api);
    await procesarPendientes(bd, api);
    expect(api.llamadasCarga).toHaveLength(1);
    expect((await bd.cargas.get(ids[0]!))!.sincronizacion).toBe("error_definitivo");
  });

  it("MODO AVIÓN: sin red se programa el reintento con backoff y se detiene la cola", async () => {
    const { bd, ids } = await bdConCargas(3);
    const api = apiFalsa({ carga: { tipo: "reintentable", detalle: "sin conexión" } });
    const ahora = new Date("2026-07-31T10:00:00.000Z");

    const resumen = await procesarPendientes(bd, api, () => ahora);

    expect(resumen).toEqual({ sincronizadas: 0, reintentables: 1, definitivas: 0 });
    expect(api.llamadasCarga).toHaveLength(1);
    const primera = (await bd.cargas.get(ids[0]!))!;
    expect(primera.intentos).toBe(1);
    expect(primera.proximoIntentoEn).toBe("2026-07-31T10:00:02.000Z");
  });

  it("RECUPERACIÓN: al volver la señal, toda la cola se vacía en orden", async () => {
    const { bd, ids } = await bdConCargas(3);
    await procesarPendientes(
      bd,
      apiFalsa({ carga: { tipo: "reintentable", detalle: "sin conexión" } }),
      () => new Date("2026-07-31T10:00:00.000Z"),
    );

    const conRed = apiFalsa();
    const resumen = await procesarPendientes(bd, conRed, () => new Date("2026-07-31T10:00:05.000Z"));

    expect(resumen).toEqual({ sincronizadas: 3, reintentables: 0, definitivas: 0 });
    expect(conRed.llamadasCarga.map((p) => p.id)).toEqual(ids);
  });
});

describe("sincronizador — evidencia fotográfica (fotos primero, spec §10.3)", () => {
  it("sube las fotos ANTES que la carga, confirma las rutas que decidió la API y borra los blobs tras la aceptación", async () => {
    const { bd, ids } = await bdConCargas(1, true);
    const api = apiFalsa();

    const resumen = await procesarPendientes(bd, api);

    expect(resumen.sincronizadas).toBe(1);
    // Orden: las dos fotos primero, luego la carga.
    expect(api.llamadasFoto).toEqual([
      { cargaId: ids[0], momento: "inicial" },
      { cargaId: ids[0], momento: "final" },
    ]);
    // El payload registrado lleva las rutas REALES que devolvió la API.
    expect(api.llamadasCarga[0]!.foto_inicial_path).toBe(`cliente-x/cargas/${ids[0]}/inicial.webp`);
    expect(api.llamadasCarga[0]!.foto_final_path).toBe(`cliente-x/cargas/${ids[0]}/final.webp`);
    // Los blobs locales se liberaron tras la aceptación (spec §10.6).
    expect(await bd.fotos.where("cargaId").equals(ids[0]!).count()).toBe(0);
  });

  it("si la subida de una foto falla por red, la carga queda pendiente, el blob intacto y NO se registra la carga", async () => {
    const { bd, ids } = await bdConCargas(1, true);
    const api = apiFalsa({ foto: { tipo: "reintentable", detalle: "sin conexión" } });
    const ahora = new Date("2026-07-31T10:00:00.000Z");

    const resumen = await procesarPendientes(bd, api, () => ahora);

    expect(resumen).toEqual({ sincronizadas: 0, reintentables: 1, definitivas: 0 });
    expect(api.llamadasCarga).toHaveLength(0);
    expect(await bd.fotos.where("cargaId").equals(ids[0]!).count()).toBe(2);
    expect((await bd.cargas.get(ids[0]!))!.sincronizacion).toBe("pendiente");
  });

  it("los reintentos de foto son idempotentes: al recuperar señal sube todo y termina sincronizada", async () => {
    const { bd, ids } = await bdConCargas(1, true);
    await procesarPendientes(
      bd,
      apiFalsa({ foto: { tipo: "reintentable", detalle: "sin red" } }),
      () => new Date("2026-07-31T10:00:00.000Z"),
    );

    const conRed = apiFalsa();
    const resumen = await procesarPendientes(bd, conRed, () => new Date("2026-07-31T10:00:05.000Z"));

    expect(resumen.sincronizadas).toBe(1);
    expect((await bd.cargas.get(ids[0]!))!.sincronizacion).toBe("sincronizada");
  });
});
