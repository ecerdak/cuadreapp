// Estados de acceso (P0.4): el usuario revocado desde la consola no
// recibe sesión del Dashboard — y el login se lo DICE, en lugar de
// dejarlo rebotar contra 401 con un «tu sesión expiró» falso.

import { describe, expect, it } from "vitest";
import { armarAplicacion, crearToken, ID_CLIENTE } from "../pruebas/apoyo.js";
import type { SesionAutenticada } from "../seguridad/tipos.js";

const ID_PERSONA = "77bb1111-2222-4333-8444-555566667777";
const EMAIL = "supervisor@trebol.com";

function sesionPersona(): SesionAutenticada {
  return {
    usuarioId: ID_PERSONA,
    nombre: "Patricia Gómez",
    rol: "supervisor",
    clienteId: ID_CLIENTE,
    sedeId: null,
    permisos: ["tablero.leer"],
    perfil: "medidor_doble",
  };
}

describe("POST /api/v1/auth/login — acceso desactivado (P0.4)", () => {
  it("responde 403 ACCESO_DESACTIVADO al usuario revocado, sin sellar el acceso", async () => {
    const { app, proveedorIdentidad, repositorioSeguridad } = armarAplicacion();
    proveedorIdentidad.usuarioIdSesion = ID_PERSONA;
    repositorioSeguridad.desactivados.add(ID_PERSONA);

    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: EMAIL, password: "correcta" },
    });

    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json()).toMatchObject({ error: "ACCESO_DESACTIVADO" });
    // Revocado no cuenta como «último acceso»: la consola seguiría
    // creyendo que la cuenta se usa.
    expect(repositorioSeguridad.accesosSellados).toHaveLength(0);
    // Y no viajan tokens en la respuesta.
    expect(respuesta.json().access_token).toBeUndefined();
  });

  it("el usuario activo entra igual que siempre", async () => {
    const { app, proveedorIdentidad, repositorioSeguridad } = armarAplicacion();
    proveedorIdentidad.usuarioIdSesion = ID_PERSONA;
    repositorioSeguridad.sesiones.set(ID_PERSONA, sesionPersona());

    const respuesta = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: EMAIL, password: "correcta" },
    });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json().access_token).toBeDefined();
  });

  it("una petición autenticada del usuario revocado sigue muriendo con 401 SESION_INACTIVA", async () => {
    // La barrera real es el middleware, en CADA petición: revocar
    // surte efecto aunque el token viva. El login solo agrega la
    // explicación.
    const { app, repositorioSeguridad } = armarAplicacion();
    repositorioSeguridad.desactivados.add(ID_PERSONA);

    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: { authorization: `Bearer ${await crearToken(ID_PERSONA)}` },
    });

    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.json().error).toBe("SESION_INACTIVA");
  });
});
