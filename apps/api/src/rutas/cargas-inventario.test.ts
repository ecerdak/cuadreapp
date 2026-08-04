// Pruebas del despacho por perfil en POST /api/v1/cargas (DEC-016):
// el perfil de la SESIÓN decide el contrato. El perfil carga_inventario
// (Sacyr) registra llegada + despachados y el inventario final lo
// calcula el sistema — el operador jamás lo escribe. El contrato de
// medidor_doble (El Trébol) lo custodian las pruebas existentes de
// cargas.test.ts, que no cambian.

import { describe, expect, it } from "vitest";
import {
  armarAplicacion,
  crearToken,
  cuerpoCargaBase,
  sesionDispositivoInventario,
  ID_CARGA,
  ID_CLIENTE,
  ID_CONDUCTOR,
  ID_DISPOSITIVO_USUARIO,
  ID_EQUIPO,
  ID_SEDE,
} from "../pruebas/apoyo.js";

function armarInventario() {
  const armado = armarAplicacion();
  armado.repositorioSeguridad.sesiones.set(ID_DISPOSITIVO_USUARIO, sesionDispositivoInventario());
  return armado;
}

async function encabezados() {
  return { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` };
}

/** El ejemplo aprobado del piloto: llegó con 150, se despacharon 600. */
function cuerpoInventarioBase(cambios: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: ID_CARGA,
    equipo_id: ID_EQUIPO,
    conductor_id: ID_CONDUCTOR,
    llegada_gal: 150.0,
    despachados_gal: 600.0,
    iniciada_en: "2026-08-04T09:00:00-05:00",
    finalizada_en: "2026-08-04T09:05:00-05:00",
    lat: 3.9,
    lng: -76.3,
    origen: "app",
    foto_inicial_path: "fotos/llegada.webp",
    foto_final_path: "fotos/despacho.webp",
    ...cambios,
  };
}

describe("POST /api/v1/cargas — perfil carga_inventario (Sacyr)", () => {
  // Timeout amplio: es la PRIMERA prueba del archivo y paga el arranque
  // de Fastify + jose bajo la carga paralela del monorepo completo.
  it(
    "registra la carga y calcula 150 + 600 = 750; el operador nunca manda el total",
    { timeout: 15_000 },
    async () => {
      const { app, repositorio, eventos } = armarInventario();
      const respuesta = await app.inject({
        method: "POST",
        url: "/api/v1/cargas",
        headers: await encabezados(),
        payload: cuerpoInventarioBase(),
      });

      expect(respuesta.statusCode).toBe(201);
      const cuerpo = respuesta.json();
      expect(cuerpo.estado).toBe("ok");
      expect(cuerpo.galones).toBe(600.0);
      expect(cuerpo.llegada_gal).toBe(150.0);
      expect(cuerpo.inventario_final_gal).toBe(750.0);

      // La fila persistida tiene la forma exacta del perfil (el CHECK de
      // la base la exige igual).
      const { carga } = repositorio.inserciones[0]!;
      expect(carga.perfil_codigo).toBe("carga_inventario");
      expect(carga.dispensador_id).toBeNull();
      expect(carga.tanda_inicial_gal).toBeNull();
      expect(carga.tot_final_gal).toBeNull();
      expect(carga.llegada_gal).toBe(150.0);
      expect(carga.galones).toBe(600.0);
      expect(carga.cliente_id).toBe(ID_CLIENTE);
      expect(carga.sede_id).toBe(ID_SEDE);

      // Observabilidad (DEC-012 + DEC-016): el evento lleva el perfil.
      const evento = eventos.find((e) => e.endpoint === "POST /api/v1/cargas");
      expect(evento?.perfil).toBe("carga_inventario");
    },
  );

  it("es idempotente: reintento con el mismo id devuelve lo persistido con su total", async () => {
    const { app } = armarInventario();
    const headers = await encabezados();
    await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers,
      payload: cuerpoInventarioBase(),
    });
    const reintento = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers,
      payload: cuerpoInventarioBase(),
    });
    expect(reintento.statusCode).toBe(200);
    expect(reintento.json().idempotente).toBe(true);
    expect(reintento.json().inventario_final_gal).toBe(750.0);
  });

  it("nunca bloquea: despacho 0.0 se persiste marcado inconsistente (SIN_DESPACHO)", async () => {
    const { app } = armarInventario();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoInventarioBase({ despachados_gal: 0.0 }),
    });
    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json().estado).toBe("inconsistente");
    expect(respuesta.json().banderas).toContain("SIN_DESPACHO");
    expect(respuesta.json().inventario_final_gal).toBe(150.0);
  });

  it("rechaza la forma del OTRO perfil: un payload de medidor doble da 400", async () => {
    const { app } = armarInventario();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoCargaBase(), // tandas + totalizadores + dispensador
    });
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.json().error).toBe("VALIDACION_ESTRUCTURAL");
  });

  it("y al revés: un dispositivo medidor_doble no puede mandar llegada_gal (esquema estricto)", async () => {
    const { app } = armarAplicacion(); // sesión por defecto: medidor_doble
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoInventarioBase(),
    });
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.json().error).toBe("VALIDACION_ESTRUCTURAL");
  });

  it("404 cuando el equipo/conductor no existen o son de otro cliente", async () => {
    const armado = armarInventario();
    armado.repositorio.contextoInventario = null;
    const respuesta = await armado.app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoInventarioBase(),
    });
    expect(respuesta.statusCode).toBe(404);
    expect(respuesta.json().error).toBe("REFERENCIA_NO_ENCONTRADA");
  });

  it("llegada_gal negativa es error estructural, no de negocio", async () => {
    const { app } = armarInventario();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: await encabezados(),
      payload: cuerpoInventarioBase({ llegada_gal: -1 }),
    });
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.json().detalles[0].campo).toBe("llegada_gal");
  });
});

describe("GET /api/v1/catalogo — identidad del cliente (DEC-016/DEC-017)", () => {
  it("entrega cliente, perfil y sede visibles; el logo va como URL firmada, jamás la clave", async () => {
    const { app, repositorioSeguridad } = armarInventario();
    repositorioSeguridad.catalogo = {
      cliente: {
        id: ID_CLIENTE,
        nombre: "Sacyr",
        nombre_comercial: "Sacyr",
        color_primario: "#1B4F9C",
        color_secundario: "#0C2A55",
        logo_clave: `clientes/${ID_CLIENTE}/logo.png`,
      },
      perfil: { codigo: "carga_inventario", nombre: "Carga sobre Inventario" },
      sede: {
        id: ID_SEDE,
        nombre: "Obra Principal",
        ciudad: null,
        direccion: null,
        lat: null,
        lng: null,
        radio_geocerca_m: 150,
      },
      dispensadores: [],
      equipos: [],
      conductores: [],
    };

    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/catalogo",
      headers: await encabezados(),
    });

    expect(respuesta.statusCode).toBe(200);
    const cuerpo = respuesta.json();
    expect(cuerpo.cliente.nombre).toBe("Sacyr");
    expect(cuerpo.cliente.logo_url).toBe(`https://firmada.prueba/clientes/${ID_CLIENTE}/logo.png`);
    expect(cuerpo.cliente.logo_clave).toBeUndefined();
    expect(cuerpo.perfil).toEqual({ codigo: "carga_inventario", nombre: "Carga sobre Inventario" });
  });

  it("sin logo: logo_url null (el cliente muestra iniciales, nunca imagen rota)", async () => {
    const { app, repositorioSeguridad } = armarInventario();
    repositorioSeguridad.catalogo = {
      cliente: {
        id: ID_CLIENTE,
        nombre: "Sacyr",
        nombre_comercial: null,
        color_primario: null,
        color_secundario: null,
        logo_clave: null,
      },
      perfil: { codigo: "carga_inventario", nombre: "Carga sobre Inventario" },
      sede: {
        id: ID_SEDE,
        nombre: "Obra Principal",
        ciudad: null,
        direccion: null,
        lat: null,
        lng: null,
        radio_geocerca_m: 150,
      },
      dispensadores: [],
      equipos: [],
      conductores: [],
    };
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/catalogo",
      headers: await encabezados(),
    });
    expect(respuesta.json().cliente.logo_url).toBeNull();
  });
});
