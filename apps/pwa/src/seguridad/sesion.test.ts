import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import type { ResultadoValidacion } from "@cuadreapp/dominio";
import { crearBd, type PayloadCarga } from "../offline/bd";
import { encolarCarga } from "../offline/cola";
import { ServicioSesion } from "./sesion";
import { TokenStoreMemoria } from "./token-store";
import type { ClienteHttp } from "../datos/cliente-http";

const httpFalso = {
  solicitar: async () => new Response("{}", { status: 200 }),
} as unknown as ClienteHttp;

const veredictoOk: ResultadoValidacion = {
  estado: "ok",
  banderas: [],
  marcas: [],
  galNoRegistrados: null,
  exigeNota: false,
  bloqueaAvance: false,
  bloqueaCierre: false,
};

async function bdConPendiente() {
  const bd = crearBd(`prueba-${crypto.randomUUID()}`);
  const payload = {
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
  } as PayloadCarga;
  await encolarCarga(bd, {
    payload,
    veredicto: veredictoOk,
    resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 5 },
    fotos: { inicial: null, final: null },
  });
  return bd;
}

describe("cierre de sesión con guardia de pendientes (FASE 5)", () => {
  it("se NIEGA a cerrar con cargas pendientes y conserva los tokens", async () => {
    const bd = await bdConPendiente();
    const tokens = new TokenStoreMemoria({ refresh: "ref-1" });
    const sesion = new ServicioSesion(httpFalso, tokens, bd);

    const resultado = await sesion.cerrar();

    expect(resultado).toEqual({ ok: false, pendientes: 1 });
    expect(await tokens.obtenerRefresh()).toBe("ref-1"); // la sesión sigue viva
    expect(await bd.cargas.count()).toBe(1); // la evidencia, intacta
  });

  it("con forzar explícito cierra, limpia tokens y JAMÁS toca la cola", async () => {
    const bd = await bdConPendiente();
    const tokens = new TokenStoreMemoria({ refresh: "ref-1" });
    const sesion = new ServicioSesion(httpFalso, tokens, bd);

    const resultado = await sesion.cerrar({ forzar: true });

    expect(resultado).toEqual({ ok: true });
    expect(await tokens.obtenerRefresh()).toBeNull();
    expect(await bd.cargas.count()).toBe(1); // la cola sube tras re-enrolar
  });

  it("sin pendientes cierra normalmente", async () => {
    const bd = crearBd(`prueba-${crypto.randomUUID()}`);
    const tokens = new TokenStoreMemoria({ refresh: "ref-1" });
    const sesion = new ServicioSesion(httpFalso, tokens, bd);
    expect(await sesion.cerrar()).toEqual({ ok: true });
  });
});
