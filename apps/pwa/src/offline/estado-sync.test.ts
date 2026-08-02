import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import type { ResultadoValidacion } from "@cuadreapp/dominio";
import { crearBd, type PayloadCarga } from "./bd";
import { encolarCarga } from "./cola";
import type { ClienteApi } from "./sincronizador";
import {
  _reiniciarEstadoSync,
  cargarEstadoInicial,
  obtenerEstadoSync,
  sincronizarConEstado,
  suscribirEstadoSync,
} from "./estado-sync";

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
    tanda_inicial_gal: 0,
    tot_inicial_gal: 1847,
    tanda_final_gal: 5,
    tot_final_gal: 1852,
    lectura_equipo: null,
    iniciada_en: "2026-08-02T09:00:00-05:00",
    finalizada_en: "2026-08-02T09:05:00-05:00",
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

async function bdConCargas(n: number) {
  const bd = crearBd(`prueba-${crypto.randomUUID()}`);
  for (let i = 0; i < n; i++) {
    await encolarCarga(bd, {
      payload: payloadBase(),
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 5 },
      fotos: { inicial: null, final: null },
      creadaEn: `2026-08-02T09:0${i}:00.000Z`,
    });
  }
  return bd;
}

const apiOk: ClienteApi = {
  registrarCarga: async () => ({
    tipo: "aceptada",
    veredicto: { estado: "ok", banderas: [], gal_no_registrados: null },
  }),
  subirFoto: async () => ({ tipo: "aceptada", storagePath: "x" }),
};

beforeEach(() => _reiniciarEstadoSync());

describe("estado de sincronización observable (FASE 4)", () => {
  it("reporta el progreso X de Y y termina sin 'sincronizando'", async () => {
    const bd = await bdConCargas(3);
    const progresos: Array<[number, number]> = [];
    const cancelar = suscribirEstadoSync(() => {
      const s = obtenerEstadoSync().sincronizando;
      if (s) progresos.push([s.actual, s.total]);
    });

    const resumen = await sincronizarConEstado(bd, apiOk);
    cancelar();

    expect(resumen.sincronizadas).toBe(3);
    expect(progresos).toEqual([
      [0, 3],
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
    expect(obtenerEstadoSync().sincronizando).toBeNull();
  });

  it("persiste la última sincronización exitosa y la recupera tras 'reiniciar' la app", async () => {
    const bd = await bdConCargas(1);
    await sincronizarConEstado(bd, apiOk);
    const guardada = obtenerEstadoSync().ultimaSincronizacionEn;
    expect(guardada).toBeTruthy();

    _reiniciarEstadoSync();
    expect(obtenerEstadoSync().ultimaSincronizacionEn).toBeNull();
    await cargarEstadoInicial(bd); // como reabrir la app
    expect(obtenerEstadoSync().ultimaSincronizacionEn).toBe(guardada);
  });

  it("un fallo de red queda como último error SIN tocar la última sincronización exitosa", async () => {
    const bd = await bdConCargas(1);
    const apiCaida: ClienteApi = {
      registrarCarga: async () => ({ tipo: "reintentable", detalle: "sin conexión" }),
      subirFoto: async () => ({ tipo: "reintentable", detalle: "sin conexión" }),
    };

    await sincronizarConEstado(bd, apiCaida);

    const estado = obtenerEstadoSync();
    expect(estado.ultimoError).toContain("sin conexión");
    expect(estado.ultimaSincronizacionEn).toBeNull();
    expect(estado.sincronizando).toBeNull();
  });

  it("sin pendientes no inventa progreso ni toca la última sincronización", async () => {
    const bd = crearBd(`prueba-${crypto.randomUUID()}`);
    const resumen = await sincronizarConEstado(bd, apiOk);
    expect(resumen).toEqual({ sincronizadas: 0, reintentables: 0, definitivas: 0 });
    expect(obtenerEstadoSync().ultimaSincronizacionEn).toBeNull();
  });
});
