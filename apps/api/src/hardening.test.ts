import { describe, expect, it } from "vitest";
import { cargarConfiguracion } from "./config.js";
import { armarAplicacion } from "./pruebas/apoyo.js";

const ENTORNO_VALIDO = {
  DATABASE_URL: "postgresql://usuario:clave@host:5432/bd",
  SUPABASE_URL: "https://proyecto.supabase.co",
  SUPABASE_ANON_KEY: "clave-anon-de-mas-de-veinte-caracteres",
  SUPABASE_SERVICE_ROLE_KEY: "clave-service-role-de-mas-de-veinte",
  SUPABASE_JWT_SECRET: "secreto-jwt-de-mas-de-veinte-caracteres",
};

describe("Configuración de entorno tipada (Etapa H)", () => {
  it("acepta un entorno completo y aplica los defaults", () => {
    const config = cargarConfiguracion(ENTORNO_VALIDO);
    expect(config.BUCKET_FOTOS).toBe("fotos-cargas");
    expect(config.PORT).toBe(3000);
  });

  it("se niega a arrancar nombrando exactamente lo que falta", () => {
    expect(() => cargarConfiguracion({ DATABASE_URL: "postgres://x" })).toThrowError(
      /SUPABASE_URL.*SUPABASE_ANON_KEY|SUPABASE_ANON_KEY/,
    );
  });

  it("rechaza una DATABASE_URL que no sea postgres", () => {
    expect(() => cargarConfiguracion({ ...ENTORNO_VALIDO, DATABASE_URL: "mysql://nope" })).toThrowError(
      /postgres/,
    );
  });
});

describe("Headers de seguridad (Etapa H)", () => {
  it("toda respuesta lleva los headers de helmet", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({ method: "GET", url: "/salud" });
    expect(respuesta.headers["x-content-type-options"]).toBe("nosniff");
    expect(respuesta.headers["x-frame-options"]).toBeDefined();
    expect(respuesta.headers["strict-transport-security"]).toBeDefined();
  });
});

describe("Rate limiting en la superficie de autenticación (Etapa H)", () => {
  it("el login se limita por IP: la petición 11 en un minuto recibe 429", async () => {
    const { app } = armarAplicacion();
    let ultimo = 0;
    for (let i = 0; i < 11; i++) {
      const respuesta = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: { email: "atacante@x.com", password: "adivinando" },
      });
      ultimo = respuesta.statusCode;
    }
    expect(ultimo).toBe(429);
  });
});

describe("Liveness y readiness (Etapa H)", () => {
  it("/salud responde sin tocar dependencias (liveness)", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({ method: "GET", url: "/salud" });
    expect(respuesta.statusCode).toBe(200);
  });

  it("/listo responde 200 cuando la base de datos está disponible", async () => {
    const { app } = armarAplicacion({ verificarListo: async () => ({ baseDatos: true }) });
    const respuesta = await app.inject({ method: "GET", url: "/listo" });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toMatchObject({ listo: true, dependencias: { baseDatos: true } });
  });

  it("/listo responde 503 cuando la base de datos no responde (readiness)", async () => {
    const { app } = armarAplicacion({ verificarListo: async () => ({ baseDatos: false }) });
    const respuesta = await app.inject({ method: "GET", url: "/listo" });
    expect(respuesta.statusCode).toBe(503);
    expect(respuesta.json().listo).toBe(false);
  });
});

describe("Errores no controlados (Etapa H)", () => {
  it("un error interno responde 500 genérico SIN filtrar detalle, y queda trazado con request_id", async () => {
    const { app, eventos } = armarAplicacion();
    app.get("/exploto", async () => {
      throw new Error("detalle interno secreto: contraseña=123");
    });

    const respuesta = await app.inject({ method: "GET", url: "/exploto" });

    expect(respuesta.statusCode).toBe(500);
    expect(respuesta.json()).toMatchObject({ error: "ERROR_INTERNO" });
    expect(respuesta.body).not.toContain("secreto");
    expect(respuesta.json().request_id).toBe(respuesta.headers["x-request-id"]);
    expect(eventos[0]).toMatchObject({
      estado_http: 500,
      resultado: "error_interno",
      errores: "detalle interno secreto: contraseña=123", // en el log interno sí, nunca al cliente
    });
  });
});

describe("CORS (cierre de infraestructura)", () => {
  it("el preflight desde un frontend del proyecto es aceptado con los headers correctos", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "OPTIONS",
      url: "/api/v1/auth/refresh",
      headers: {
        origin: "https://cuadreapppwa-production.up.railway.app",
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type,authorization",
      },
    });
    expect(respuesta.statusCode).toBeLessThan(300);
    expect(respuesta.headers["access-control-allow-origin"]).toBe(
      "https://cuadreapppwa-production.up.railway.app",
    );
    expect(String(respuesta.headers["access-control-allow-headers"])).toContain("authorization");
  });

  it("un origen ajeno NO recibe headers CORS (el navegador lo bloquea)", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "OPTIONS",
      url: "/api/v1/auth/refresh",
      headers: { origin: "https://atacante.example.com", "access-control-request-method": "POST" },
    });
    expect(respuesta.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("con allowlist explícita, solo esa lista pasa", async () => {
    const { app } = armarAplicacion({ origenesCors: ["https://tablero.lubryco.com"] });
    const permitido = await app.inject({
      method: "OPTIONS",
      url: "/api/v1/auth/refresh",
      headers: { origin: "https://tablero.lubryco.com", "access-control-request-method": "POST" },
    });
    expect(permitido.headers["access-control-allow-origin"]).toBe("https://tablero.lubryco.com");
    const railway = await app.inject({
      method: "OPTIONS",
      url: "/api/v1/auth/refresh",
      headers: {
        origin: "https://cuadreapppwa-production.up.railway.app",
        "access-control-request-method": "POST",
      },
    });
    expect(railway.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("las respuestas normales exponen x-request-id al navegador", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "GET",
      url: "/salud",
      headers: { origin: "https://cuadreapppwa-production.up.railway.app" },
    });
    expect(String(respuesta.headers["access-control-expose-headers"])).toContain("x-request-id");
  });
});
