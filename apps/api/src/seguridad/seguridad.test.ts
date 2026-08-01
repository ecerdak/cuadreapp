import { describe, expect, it } from "vitest";
import {
  armarAplicacion,
  crearToken,
  cuerpoCargaBase,
  ID_CLIENTE,
  ID_DISPOSITIVO_USUARIO,
  ID_SEDE,
  sesionDispositivo,
} from "../pruebas/apoyo.js";

describe("Middleware de autenticación (DEC-013)", () => {
  it("rechaza el POST de cargas sin token", async () => {
    const { app, repositorio } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      payload: cuerpoCargaBase(),
    });
    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.json().error).toBe("NO_AUTENTICADO");
    expect(repositorio.inserciones).toHaveLength(0);
  });

  it("rechaza un token firmado con otro secreto", async () => {
    const { app } = armarAplicacion();
    const token = await crearToken(ID_DISPOSITIVO_USUARIO, "otro-secreto-completamente-distinto-123456");
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: { authorization: `Bearer ${token}` },
      payload: cuerpoCargaBase(),
    });
    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.json().error).toBe("TOKEN_INVALIDO");
  });

  it("rechaza un token válido cuyo usuario fue dado de baja (RBAC contra la base, no contra claims)", async () => {
    const { app, repositorioSeguridad } = armarAplicacion();
    repositorioSeguridad.sesiones.delete(ID_DISPOSITIVO_USUARIO);
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` },
      payload: cuerpoCargaBase(),
    });
    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.json().error).toBe("SESION_INACTIVA");
  });
});

describe("Middleware de autorización RBAC", () => {
  it("rechaza con 403 a una sesión sin el permiso requerido", async () => {
    const { app, repositorioSeguridad } = armarAplicacion();
    repositorioSeguridad.sesiones.set(ID_DISPOSITIVO_USUARIO, {
      ...sesionDispositivo(),
      permisos: ["catalogo.leer"], // sin cargas.registrar
    });
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` },
      payload: cuerpoCargaBase(),
    });
    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json()).toMatchObject({ error: "SIN_PERMISO", permiso: "cargas.registrar" });
  });

  it("rechaza con 403 una carga fuera del alcance de la sede de la sesión", async () => {
    const { app, repositorio } = armarAplicacion();
    repositorio.contexto!.sedeId = "ffff1111-2222-4333-8444-555566667777"; // otra sede
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` },
      payload: cuerpoCargaBase(),
    });
    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json().error).toBe("FUERA_DE_ALCANCE");
    expect(repositorio.inserciones).toHaveLength(0);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("entrega tokens con credenciales válidas", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "supervisor@trebol.com", password: "correcta" },
    });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toMatchObject({
      access_token: "access-login",
      refresh_token: "refresh-login",
      expira_en_s: 3600,
    });
  });

  it("responde 401 idéntico con credenciales inválidas (sin oráculo de cuentas)", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "supervisor@trebol.com", password: "incorrecta" },
    });
    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.json().error).toBe("CREDENCIALES_INVALIDAS");
  });
});

describe("POST /api/v1/auth/refresh", () => {
  it("rota los tokens con un refresh vigente", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: { refresh_token: "refresh-vigente" },
    });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json().access_token).toBe("access-renovado");
  });

  it("responde 401 con un refresh revocado", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: { refresh_token: "refresh-robado" },
    });
    expect(respuesta.statusCode).toBe(401);
  });
});

describe("POST /api/v1/auth/logout y GET /api/v1/me", () => {
  it("logout revoca la sesión en el proveedor", async () => {
    const { app, proveedorIdentidad } = armarAplicacion();
    const token = await crearToken(ID_DISPOSITIVO_USUARIO);
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(respuesta.statusCode).toBe(200);
    expect(proveedorIdentidad.sesionesCerradas).toEqual([token]);
  });

  it("/me devuelve identidad, rol, alcance y permisos del RBAC propio", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` },
    });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toMatchObject({
      usuario_id: ID_DISPOSITIVO_USUARIO,
      rol: "dispositivo",
      cliente_id: ID_CLIENTE,
      sede_id: ID_SEDE,
      permisos: ["cargas.registrar", "cargas.subir_foto", "catalogo.leer"],
    });
  });
});

describe("POST /api/v1/dispositivos/enrolar", () => {
  it("canjea un código vigente por la identidad del dispositivo", async () => {
    const { app, repositorioSeguridad } = armarAplicacion();
    repositorioSeguridad.codigoValido = { id: "cod-1", sedeId: ID_SEDE, clienteId: ID_CLIENTE };

    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/dispositivos/enrolar",
      payload: { codigo: "CODIGO-VALIDO-123", nombre_dispositivo: "Tablet almacén" },
    });

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json()).toMatchObject({ access_token: "access-dispositivo" });
    expect(repositorioSeguridad.enrolamientos).toHaveLength(1);
    expect(repositorioSeguridad.enrolamientos[0]).toMatchObject({
      usuarioId: ID_DISPOSITIVO_USUARIO,
      sedeId: ID_SEDE,
      clienteId: ID_CLIENTE,
    });
  });

  it("rechaza un código inexistente, vencido o ya usado", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/dispositivos/enrolar",
      payload: { codigo: "CODIGO-FALSO-999" },
    });
    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.json().error).toBe("CODIGO_INVALIDO");
  });
});

describe("GET /api/v1/catalogo", () => {
  it("entrega el catálogo con el alcance de la sesión (incluye pin_hash para verificación offline)", async () => {
    const { app, repositorioSeguridad } = armarAplicacion();
    repositorioSeguridad.catalogo = {
      sede: { id: ID_SEDE, nombre: "Planta Buga", lat: null, lng: null, radio_geocerca_m: 150 },
      dispensadores: [{ id: "d1", nombre: "Isla 1", tot_actual_gal: 1847.0, tolerancia_tanda_gal: 1.0 }],
      equipos: [],
      conductores: [{ id: "c1", nombre: "Duván Bonilla", codigo: "07", pin_hash: "$2a$10$hash" }],
    };

    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/catalogo",
      headers: { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` },
    });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json().sede.nombre).toBe("Planta Buga");
    expect(respuesta.json().conductores[0].pin_hash).toBeDefined();
  });

  it("exige el permiso catalogo.leer", async () => {
    const { app, repositorioSeguridad } = armarAplicacion();
    repositorioSeguridad.sesiones.set(ID_DISPOSITIVO_USUARIO, { ...sesionDispositivo(), permisos: [] });
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/catalogo",
      headers: { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` },
    });
    expect(respuesta.statusCode).toBe(403);
  });
});

describe("POST /api/v1/cargas/:id/fotos/:momento", () => {
  it("guarda la foto en la ruta que decide la API (aislada por cliente) y la devuelve", async () => {
    const { app, almacenFotos } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas/3f8e9a10-1111-4222-8333-444455556666/fotos/inicial",
      headers: {
        authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}`,
        "content-type": "image/webp",
      },
      payload: Buffer.from([1, 2, 3, 4]),
    });

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json().storage_path).toBe(
      `${ID_CLIENTE}/cargas/3f8e9a10-1111-4222-8333-444455556666/inicial.webp`,
    );
    expect(almacenFotos.guardadas).toEqual([
      { ruta: respuesta.json().storage_path, bytes: 4, tipo: "image/webp" },
    ]);
  });

  it("rechaza un momento inválido", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas/3f8e9a10-1111-4222-8333-444455556666/fotos/intermedia",
      headers: {
        authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}`,
        "content-type": "image/webp",
      },
      payload: Buffer.from([1]),
    });
    expect(respuesta.statusCode).toBe(400);
  });

  it("exige autenticación", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas/3f8e9a10-1111-4222-8333-444455556666/fotos/inicial",
      headers: { "content-type": "image/webp" },
      payload: Buffer.from([1]),
    });
    expect(respuesta.statusCode).toBe(401);
  });
});
