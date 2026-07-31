import { describe, expect, it } from "vitest";
import { construirAplicacion } from "../aplicacion.js";
import type {
  CargaPersistida,
  ContextoRegistro,
  NuevaCarga,
  NuevaFoto,
  RepositorioCargas,
} from "../repositorio/tipos.js";

/* ============================================================
   Repositorio en memoria: mismo contrato que Postgres, cero red.
   El contexto replica el caso base del dominio (tot 1847, horómetro
   1086.5, última carga 15 h antes) para que los veredictos sean
   comparables con las pruebas de packages/dominio.
   ============================================================ */

const ID_CARGA = "3f8e9a10-1111-4222-8333-444455556666";
const ID_DISPENSADOR = "aaaa1111-2222-4333-8444-555566667777";
const ID_EQUIPO = "bbbb1111-2222-4333-8444-555566667777";
const ID_CONDUCTOR = "cccc1111-2222-4333-8444-555566667777";
const ID_CLIENTE = "dddd1111-2222-4333-8444-555566667777";
const ID_SEDE = "eeee1111-2222-4333-8444-555566667777";

function contextoBase(): ContextoRegistro {
  return {
    clienteId: ID_CLIENTE,
    sedeId: ID_SEDE,
    validacion: {
      dispensador: { totActualGal: 1847.0, toleranciaTandaGal: 1.0 },
      equipo: {
        tipoMedidor: "horometro",
        ultimaLectura: 1086.5,
        capacidadTanqueGal: 80.0,
        ultimaCargaFinalizadaEn: "2026-07-30T18:00:00-05:00",
      },
      sede: { lat: 3.9, lng: -76.3, radioGeocercaM: 150 },
    },
  };
}

class RepositorioEnMemoria implements RepositorioCargas {
  cargas = new Map<string, CargaPersistida>();
  inserciones: Array<{ carga: NuevaCarga; fotos: NuevaFoto[] }> = [];
  contexto: ContextoRegistro | null = contextoBase();

  async buscarCargaPorId(id: string): Promise<CargaPersistida | null> {
    return this.cargas.get(id) ?? null;
  }

  async obtenerContextoRegistro(): Promise<ContextoRegistro | null> {
    return this.contexto;
  }

  async insertarCarga(carga: NuevaCarga, fotos: NuevaFoto[]): Promise<void> {
    this.inserciones.push({ carga, fotos });
    this.cargas.set(carga.id, {
      id: carga.id,
      estado: carga.estado,
      banderas: carga.banderas,
      galones: carga.galones,
      galNoRegistrados: carga.gal_no_registrados,
    });
  }
}

function cuerpoBase(cambios: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: ID_CARGA,
    dispensador_id: ID_DISPENSADOR,
    equipo_id: ID_EQUIPO,
    conductor_id: ID_CONDUCTOR,
    tanda_inicial_gal: 0.0,
    tot_inicial_gal: 1847.0,
    tanda_final_gal: 42.5,
    tot_final_gal: 1889.5,
    lectura_equipo: 1093.0,
    iniciada_en: "2026-07-31T09:00:00-05:00",
    finalizada_en: "2026-07-31T09:05:00-05:00",
    lat: 3.9,
    lng: -76.3,
    origen: "app",
    foto_inicial_path: "fotos/carga-inicial.webp",
    foto_final_path: "fotos/carga-final.webp",
    ...cambios,
  };
}

function armar() {
  const repositorio = new RepositorioEnMemoria();
  const app = construirAplicacion({ repositorio });
  return { repositorio, app };
}

/* ============================================================ */

describe("GET /salud", () => {
  it("responde ok (con el request_id que agrega la observabilidad)", async () => {
    const { app } = armar();
    const respuesta = await app.inject({ method: "GET", url: "/salud" });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toMatchObject({ ok: true });
  });
});

describe("POST /api/v1/cargas — validación estructural (400)", () => {
  it("rechaza un cuerpo vacío con la lista de campos faltantes", async () => {
    const { app } = armar();
    const respuesta = await app.inject({ method: "POST", url: "/api/v1/cargas", payload: {} });
    expect(respuesta.statusCode).toBe(400);
    const cuerpo = respuesta.json();
    expect(cuerpo.error).toBe("VALIDACION_ESTRUCTURAL");
    expect(cuerpo.detalles.length).toBeGreaterThan(5);
  });

  it("rechaza un uuid malformado", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      payload: cuerpoBase({ id: "no-es-un-uuid" }),
    });
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.json().detalles[0].campo).toBe("id");
  });

  it("rechaza un origen inválido", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      payload: cuerpoBase({ origen: "telepatia" }),
    });
    expect(respuesta.statusCode).toBe(400);
  });

  it("rechaza campos desconocidos (contrato estricto)", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      payload: cuerpoBase({ estado: "ok" }), // el cliente NO manda el veredicto
    });
    expect(respuesta.statusCode).toBe(400);
  });

  it("rechaza galones negativos", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      payload: cuerpoBase({ tanda_final_gal: -5 }),
    });
    expect(respuesta.statusCode).toBe(400);
  });
});

describe("POST /api/v1/cargas — referencias (404)", () => {
  it("responde 404 si el dispensador/equipo/conductor no existen o no son del mismo cliente", async () => {
    const { app, repositorio } = armar();
    repositorio.contexto = null;
    const respuesta = await app.inject({ method: "POST", url: "/api/v1/cargas", payload: cuerpoBase() });
    expect(respuesta.statusCode).toBe(404);
    expect(respuesta.json().error).toBe("REFERENCIA_NO_ENCONTRADA");
    expect(repositorio.inserciones).toHaveLength(0);
  });
});

describe("POST /api/v1/cargas — camino feliz (201)", () => {
  it("persiste una carga limpia con el veredicto del dominio", async () => {
    const { app, repositorio } = armar();
    const respuesta = await app.inject({ method: "POST", url: "/api/v1/cargas", payload: cuerpoBase() });

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json()).toMatchObject({
      id: ID_CARGA,
      estado: "ok",
      banderas: [],
      galones: 42.5,
      gal_no_registrados: null,
      exige_nota: false,
      bloquea_avance: false,
      bloquea_cierre: false,
    });

    expect(repositorio.inserciones).toHaveLength(1);
    const { carga, fotos } = repositorio.inserciones[0]!;
    expect(carga).toMatchObject({
      cliente_id: ID_CLIENTE, // derivado del dispensador, no del cliente HTTP
      sede_id: ID_SEDE,
      galones: 42.5, // = tanda_final (spec §6)
      tipo_lectura: "horometro", // copia del equipo al momento
      dentro_geocerca: true,
      estado: "ok",
    });
    expect(fotos.map((f) => f.momento)).toEqual(["inicial", "final"]);
  });
});

describe("POST /api/v1/cargas — el dominio decide, la API no bloquea", () => {
  it("una carga con salto de totalizador se persiste igual, marcada inconsistente", async () => {
    const { app, repositorio } = armar();
    // El dispensador quedó en 1829 pero el conductor lee 1847: salto de +18.
    repositorio.contexto!.validacion.dispensador.totActualGal = 1829.0;

    const respuesta = await app.inject({ method: "POST", url: "/api/v1/cargas", payload: cuerpoBase() });

    expect(respuesta.statusCode).toBe(201); // nunca se bloquea un registro (§7)
    expect(respuesta.json()).toMatchObject({
      estado: "inconsistente",
      banderas: ["SALTO_TOTALIZADOR"],
      gal_no_registrados: 18.0,
    });
    expect(repositorio.inserciones[0]!.carga.estado).toBe("inconsistente");
  });

  it("una carga sin fotos (origen app) se persiste con FOTO_FALTANTE y bloquea_cierre para la UI", async () => {
    const { app, repositorio } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      payload: cuerpoBase({ foto_inicial_path: null, foto_final_path: null }),
    });

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json()).toMatchObject({
      estado: "inconsistente",
      banderas: ["FOTO_FALTANTE"],
      bloquea_cierre: true,
    });
    expect(repositorio.inserciones[0]!.fotos).toHaveLength(0);
  });

  it("la tanda sin resetear exige nota en la respuesta", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      payload: cuerpoBase({ tanda_inicial_gal: 0.5, tanda_final_gal: 42.0 }),
    });
    expect(respuesta.json()).toMatchObject({ estado: "advertencia", exige_nota: true });
  });

  it("sin GPS: dentro_geocerca queda desconocido (null) y SIN_GPS no cambia el estado", async () => {
    const { app, repositorio } = armar();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      payload: cuerpoBase({ lat: null, lng: null }),
    });
    expect(respuesta.json()).toMatchObject({ estado: "ok", banderas: ["SIN_GPS"] });
    expect(repositorio.inserciones[0]!.carga.dentro_geocerca).toBeNull();
  });
});

describe("POST /api/v1/cargas — idempotencia (spec §10.4)", () => {
  it("un reintento con el mismo id devuelve 200 con lo ya persistido, sin insertar de nuevo", async () => {
    const { app, repositorio } = armar();

    const primera = await app.inject({ method: "POST", url: "/api/v1/cargas", payload: cuerpoBase() });
    expect(primera.statusCode).toBe(201);

    const reintento = await app.inject({ method: "POST", url: "/api/v1/cargas", payload: cuerpoBase() });
    expect(reintento.statusCode).toBe(200);
    expect(reintento.json()).toMatchObject({ id: ID_CARGA, estado: "ok", idempotente: true });

    expect(repositorio.inserciones).toHaveLength(1);
  });
});
