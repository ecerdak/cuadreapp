import { describe, expect, it } from "vitest";
import {
  armarAplicacion,
  crearToken,
  cuerpoCargaBase,
  ID_CARGA,
  ID_CLIENTE,
  ID_DISPOSITIVO_USUARIO,
  ID_SEDE,
} from "../pruebas/apoyo.js";

async function encabezados() {
  return { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` };
}

describe("GET /salud", () => {
  it("responde ok sin autenticación (única ruta pública además de auth)", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({ method: "GET", url: "/salud" });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toMatchObject({ ok: true });
  });
});

describe("POST /api/v1/cargas — validación estructural (400)", () => {
  it("rechaza un cuerpo vacío con la lista de campos faltantes", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: {},
    });
    expect(respuesta.statusCode).toBe(400);
    const cuerpo = respuesta.json();
    expect(cuerpo.error).toBe("VALIDACION_ESTRUCTURAL");
    expect(cuerpo.detalles.length).toBeGreaterThan(5);
  });

  it("rechaza un uuid malformado", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase({ id: "no-es-un-uuid" }),
    });
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.json().detalles[0].campo).toBe("id");
  });

  it("rechaza un origen inválido", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase({ origen: "telepatia" }),
    });
    expect(respuesta.statusCode).toBe(400);
  });

  it("rechaza campos desconocidos (contrato estricto: el cliente NO manda su veredicto)", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase({ estado: "ok" }),
    });
    expect(respuesta.statusCode).toBe(400);
  });

  it("rechaza galones negativos", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase({ tanda_final_gal: -5 }),
    });
    expect(respuesta.statusCode).toBe(400);
  });
});

describe("POST /api/v1/cargas — referencias (404)", () => {
  it("responde 404 si el dispensador/equipo/conductor no existen o no son del mismo cliente", async () => {
    const { app, repositorio } = armarAplicacion();
    repositorio.contexto = null;
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase(),
    });
    expect(respuesta.statusCode).toBe(404);
    expect(respuesta.json().error).toBe("REFERENCIA_NO_ENCONTRADA");
    expect(repositorio.inserciones).toHaveLength(0);
  });
});

describe("POST /api/v1/cargas — camino feliz (201)", () => {
  it("persiste una carga limpia con el veredicto del dominio", async () => {
    const { app, repositorio } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase(),
    });

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
      cliente_id: ID_CLIENTE,
      sede_id: ID_SEDE,
      galones: 42.5,
      tipo_lectura: "horometro",
      dentro_geocerca: true,
      estado: "ok",
    });
    expect(fotos.map((f) => f.momento)).toEqual(["inicial", "final"]);
  });
});

describe("POST /api/v1/cargas — el dominio decide, la API no bloquea", () => {
  it("una carga con salto de totalizador se persiste igual, marcada inconsistente", async () => {
    const { app, repositorio } = armarAplicacion();
    repositorio.contexto!.validacion.dispensador.totActualGal = 1829.0;

    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase(),
    });

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json()).toMatchObject({
      estado: "inconsistente",
      banderas: ["SALTO_TOTALIZADOR"],
      gal_no_registrados: 18.0,
    });
    expect(repositorio.inserciones[0]!.carga.estado).toBe("inconsistente");
  });

  it("una carga sin fotos (origen app) se persiste con FOTO_FALTANTE y bloquea_cierre para la UI", async () => {
    const { app, repositorio } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase({ foto_inicial_path: null, foto_final_path: null }),
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
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase({ tanda_inicial_gal: 0.5, tanda_final_gal: 42.0 }),
    });
    expect(respuesta.json()).toMatchObject({ estado: "advertencia", exige_nota: true });
  });

  it("sin GPS: dentro_geocerca queda desconocido (null) y SIN_GPS no cambia el estado", async () => {
    const { app, repositorio } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase({ lat: null, lng: null }),
    });
    expect(respuesta.json()).toMatchObject({ estado: "ok", banderas: ["SIN_GPS"] });
    expect(repositorio.inserciones[0]!.carga.dentro_geocerca).toBeNull();
  });
});

describe("POST /api/v1/cargas — idempotencia (spec §10.4)", () => {
  it("un reintento con el mismo id devuelve 200 con lo ya persistido, sin insertar de nuevo", async () => {
    const { app, repositorio } = armarAplicacion();
    const cabeceras = await encabezados();

    const primera = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: cabeceras,
      payload: cuerpoCargaBase(),
    });
    expect(primera.statusCode).toBe(201);

    const reintento = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: cabeceras,
      payload: cuerpoCargaBase(),
    });
    expect(reintento.statusCode).toBe(200);
    expect(reintento.json()).toMatchObject({ id: ID_CARGA, estado: "ok", idempotente: true });

    expect(repositorio.inserciones).toHaveLength(1);
  });
});
