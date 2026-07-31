import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { validarCarga, type ResultadoValidacion } from "@cuadreapp/dominio";
import { crearBd, type PayloadCarga } from "./bd";
import {
  contarPendientes,
  encolarCarga,
  obtenerContextoValidacion,
  pendientesListas,
  retrasoReintento,
} from "./cola";
import type { DispensadorCatalogo, EquipoCatalogo, SedeCatalogo } from "../datos/catalogo";

const DISPENSADOR: DispensadorCatalogo = {
  id: "11111111-1111-4111-8111-111111111111",
  nombre: "Isla 1",
  totConocidoGal: 1847.0,
  toleranciaTandaGal: 1.0,
};
const EQUIPO: EquipoCatalogo = {
  id: "22111111-1111-4111-8111-111111111111",
  codigo: "T-04",
  descripcion: "Tractor Massey Ferguson 4292",
  tipoMedidor: "horometro",
  ultimaLecturaConocida: 1086.5,
  capacidadTanqueGal: 80.0,
};
const SEDE: SedeCatalogo = { nombre: "Planta Buga", lat: null, lng: null, radioGeocercaM: 150 };

function payloadBase(cambios: Partial<PayloadCarga> = {}): PayloadCarga {
  return {
    id: crypto.randomUUID(),
    dispensador_id: DISPENSADOR.id,
    equipo_id: EQUIPO.id,
    conductor_id: "31111111-1111-4111-8111-111111111111",
    tanda_inicial_gal: 0.0,
    tot_inicial_gal: 1847.0,
    tanda_final_gal: 42.5,
    tot_final_gal: 1889.5,
    lectura_equipo: 1093.0,
    iniciada_en: "2026-07-31T09:00:00-05:00",
    finalizada_en: "2026-07-31T09:05:00-05:00",
    lat: null,
    lng: null,
    precision_gps_m: null,
    origen: "app",
    foto_inicial_path: "cargas/x/inicial.webp",
    foto_final_path: "cargas/x/final.webp",
    notas: null,
    device_id: "dispositivo-prueba",
    version_app: "0.1.0",
    ...cambios,
  };
}

const veredictoOk: ResultadoValidacion = {
  estado: "ok",
  banderas: [],
  marcas: [],
  galNoRegistrados: null,
  exigeNota: false,
  bloqueaAvance: false,
  bloqueaCierre: false,
};

const fotoPrueba = () => ({ bytes: new ArrayBuffer(8), tipo: "image/webp" });

function bdNueva() {
  return crearBd(`prueba-${crypto.randomUUID()}`);
}

describe("cola offline — encolar", () => {
  it("guarda la carga pendiente y sus dos fotos", async () => {
    const bd = bdNueva();
    const payload = payloadBase();
    await encolarCarga(bd, {
      payload,
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván Bonilla", galones: 42.5 },
      fotos: { inicial: fotoPrueba(), final: fotoPrueba() },
    });

    const carga = await bd.cargas.get(payload.id);
    expect(carga).toMatchObject({ sincronizacion: "pendiente", intentos: 0, estadoLocal: "ok" });
    expect(await bd.fotos.where("cargaId").equals(payload.id).count()).toBe(2);
    expect(await contarPendientes(bd)).toBe(1);
  });

  it("avanza el contexto local del dispensador y del equipo", async () => {
    const bd = bdNueva();
    const payload = payloadBase();
    await encolarCarga(bd, {
      payload,
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 42.5 },
      fotos: { inicial: null, final: null },
    });

    const contexto = await obtenerContextoValidacion(bd, DISPENSADOR, EQUIPO, SEDE);
    expect(contexto.dispensador.totActualGal).toBe(1889.5);
    expect(contexto.equipo.ultimaLectura).toBe(1093.0);
    expect(contexto.equipo.ultimaCargaFinalizadaEn).toBe(payload.finalizada_en);
  });

  it("MODO AVIÓN: dos cargas seguidas encadenan el totalizador sin señal", async () => {
    const bd = bdNueva();

    // Primera carga offline: 1847.0 → 1889.5
    await encolarCarga(bd, {
      payload: payloadBase(),
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 42.5 },
      fotos: { inicial: null, final: null },
    });

    // Segunda carga, aún sin señal: el contexto local ya avanzó, así que
    // el dominio valida contra 1889.5 y NO marca salto de totalizador.
    const contexto = await obtenerContextoValidacion(bd, DISPENSADOR, EQUIPO, SEDE);
    const resultado = validarCarga(
      {
        tandaInicialGal: 0.0,
        totInicialGal: 1889.5,
        tandaFinalGal: 30.0,
        totFinalGal: 1919.5,
        lecturaEquipo: 1097.0,
        iniciadaEn: "2026-07-31T14:00:00-05:00",
        finalizadaEn: "2026-07-31T14:04:00-05:00",
        lat: null,
        lng: null,
        origen: "app",
        fotoInicial: true,
        fotoFinal: true,
      },
      contexto,
    );

    expect(resultado.banderas).not.toContain("SALTO_TOTALIZADOR");
    expect(resultado.estado).toBe("ok");
  });

  it("el contexto local no retrocede si se encola un tot menor", async () => {
    const bd = bdNueva();
    await encolarCarga(bd, {
      payload: payloadBase({ tot_final_gal: 1889.5 }),
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 42.5 },
      fotos: { inicial: null, final: null },
    });
    await encolarCarga(bd, {
      payload: payloadBase({ tot_final_gal: 1500.0 }),
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 42.5 },
      fotos: { inicial: null, final: null },
    });

    const contexto = await obtenerContextoValidacion(bd, DISPENSADOR, EQUIPO, SEDE);
    expect(contexto.dispensador.totActualGal).toBe(1889.5);
  });
});

describe("cola offline — pendientes y reintentos", () => {
  it("pendientesListas respeta el orden de creación (FIFO)", async () => {
    const bd = bdNueva();
    const primera = payloadBase();
    const segunda = payloadBase();
    await encolarCarga(bd, {
      payload: segunda,
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 1 },
      fotos: { inicial: null, final: null },
      creadaEn: "2026-07-31T10:00:00.000Z",
    });
    await encolarCarga(bd, {
      payload: primera,
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 1 },
      fotos: { inicial: null, final: null },
      creadaEn: "2026-07-31T09:00:00.000Z",
    });

    const listas = await pendientesListas(bd, new Date("2026-07-31T11:00:00.000Z"));
    expect(listas.map((c) => c.id)).toEqual([primera.id, segunda.id]);
  });

  it("una carga con reintento programado en el futuro no está lista todavía", async () => {
    const bd = bdNueva();
    const payload = payloadBase();
    await encolarCarga(bd, {
      payload,
      veredicto: veredictoOk,
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 1 },
      fotos: { inicial: null, final: null },
    });
    await bd.cargas.update(payload.id, { proximoIntentoEn: "2026-07-31T12:00:00.000Z" });

    expect(await pendientesListas(bd, new Date("2026-07-31T11:59:00.000Z"))).toHaveLength(0);
    expect(await pendientesListas(bd, new Date("2026-07-31T12:00:00.000Z"))).toHaveLength(1);
  });

  it("el backoff crece exponencialmente y se detiene en 5 minutos (spec §10.5)", () => {
    expect(retrasoReintento(1)).toBe(2_000);
    expect(retrasoReintento(2)).toBe(4_000);
    expect(retrasoReintento(5)).toBe(32_000);
    expect(retrasoReintento(20)).toBe(300_000);
  });
});
