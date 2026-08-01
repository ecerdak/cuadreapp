import { describe, expect, it } from "vitest";
import {
  armarAplicacion,
  crearToken,
  cuerpoCargaBase,
  ID_CLIENTE,
  ID_DISPOSITIVO_USUARIO,
  ID_SEDE,
} from "./pruebas/apoyo.js";

describe("Observabilidad por defecto (DEC-012)", () => {
  it("toda respuesta incluye el request_id en el cuerpo y en el encabezado, y coinciden", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({ method: "GET", url: "/salud" });
    const idEncabezado = respuesta.headers["x-request-id"];
    expect(idEncabezado).toMatch(/^[0-9a-f-]{36}$/);
    expect(respuesta.json().request_id).toBe(idEncabezado);
  });

  it("cada petición emite exactamente un evento con la lista cerrada de campos", async () => {
    const { app, eventos } = armarAplicacion();
    await app.inject({ method: "GET", url: "/salud" });

    expect(eventos).toHaveLength(1);
    const evento = eventos[0]!;
    expect(Object.keys(evento).sort()).toEqual(
      [
        "request_id",
        "timestamp",
        "endpoint",
        "estado_http",
        "duracion_ms",
        "resultado",
        "errores",
        "cliente_id",
        "sede_id",
        "usuario_id",
        "banderas",
        "version_api",
        "version_dominio",
      ].sort(),
    );
    expect(evento.endpoint).toBe("GET /salud");
    expect(evento.estado_http).toBe(200);
    expect(evento.duracion_ms).toBeGreaterThanOrEqual(0);
    expect(evento.version_api).toMatch(/^\d+\.\d+\.\d+$/);
    expect(evento.version_dominio).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("una carga registrada aporta usuario, cliente, sede y banderas al evento (usuario_id ya con autenticación)", async () => {
    const { app, eventos } = armarAplicacion();
    await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` },
      payload: cuerpoCargaBase(),
    });

    const evento = eventos[0]!;
    expect(evento.resultado).toBe("registrada");
    expect(evento.estado_http).toBe(201);
    expect(evento.usuario_id).toBe(ID_DISPOSITIVO_USUARIO);
    expect(evento.cliente_id).toBe(ID_CLIENTE);
    expect(evento.sede_id).toBe(ID_SEDE);
    expect(evento.banderas).toEqual([]);
  });

  it("una petición estructuralmente inválida (autenticada) queda trazada como 'invalido'", async () => {
    const { app, eventos } = armarAplicacion();
    await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` },
      payload: {},
    });

    expect(eventos[0]!.resultado).toBe("invalido");
    expect(eventos[0]!.estado_http).toBe(400);
  });

  it("una petición sin token queda trazada como 'no_autenticado'", async () => {
    const { app, eventos } = armarAplicacion();
    await app.inject({ method: "POST", url: "/api/v1/cargas", payload: {} });
    expect(eventos[0]!.resultado).toBe("no_autenticado");
    expect(eventos[0]!.estado_http).toBe(401);
  });

  it("el evento jamás contiene el cuerpo de la petición (ni fotos, ni lecturas, ni tokens)", async () => {
    const { app, eventos } = armarAplicacion();
    const token = await crearToken(ID_DISPOSITIVO_USUARIO);
    await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: { authorization: `Bearer ${token}` },
      payload: cuerpoCargaBase(),
    });

    const serializado = JSON.stringify(eventos[0]);
    expect(serializado).not.toContain("foto");
    expect(serializado).not.toContain("42.5");
    expect(serializado).not.toContain(token);
  });

  it("el evento del login jamás contiene la contraseña", async () => {
    const { app, eventos } = armarAplicacion();
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "supervisor@trebol.com", password: "correcta" },
    });
    const serializado = JSON.stringify(eventos[0]);
    expect(serializado).not.toContain("correcta");
    expect(serializado).not.toContain("supervisor@trebol.com");
  });

  it("la respuesta del endpoint de cargas también lleva request_id", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/cargas",
      headers: { authorization: `Bearer ${await crearToken(ID_DISPOSITIVO_USUARIO)}` },
      payload: cuerpoCargaBase(),
    });
    expect(respuesta.json().request_id).toBe(respuesta.headers["x-request-id"]);
  });
});
