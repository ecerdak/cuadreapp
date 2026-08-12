// mensajeDeError (P0.5): la persona lee una frase en su idioma y la
// referencia de soporte — jamás HTTP_500, TypeError ni Failed to fetch
// como mensaje principal. Estas pruebas fijan la traducción.

import { describe, expect, it } from "vitest";
import { mensajeDeError } from "./contexto";
import { ErrorApi } from "./fuente-api";
import { SesionVencida } from "./sesion";

describe("mensajeDeError (P0.5)", () => {
  it("un 500 del servidor se dice en humano, con la referencia de soporte", () => {
    const humano = mensajeDeError(new ErrorApi("HTTP_500", "req-abc123"));
    expect(humano.frase).toBe("El servidor tuvo un problema al responder. Intenta nuevamente.");
    expect(humano.frase).not.toContain("HTTP_500");
    expect(humano.referencia).toBe("req-abc123");
  });

  it("otros HTTP crudos tampoco se muestran como código", () => {
    const humano = mensajeDeError(new ErrorApi("HTTP_404"));
    expect(humano.frase).toBe("No se pudo consultar la información. Intenta nuevamente.");
    expect(humano.referencia).toBeNull();
  });

  it("los códigos conocidos del dominio tienen su frase propia", () => {
    expect(mensajeDeError(new ErrorApi("CARGA_NO_ENCONTRADA")).frase).toBe(
      "Esa carga ya no está disponible.",
    );
    expect(mensajeDeError(new ErrorApi("CLIENTE_NO_DISPONIBLE")).frase).toBe(
      "La empresa de tu usuario está desactivada.",
    );
  });

  it("un código de dominio desconocido se cita: nombra una regla, no una tripa", () => {
    const humano = mensajeDeError(new ErrorApi("EQUIPO_SIN_MEDIDOR", "req-9"));
    expect(humano.frase).toContain("(EQUIPO_SIN_MEDIDOR)");
    expect(humano.referencia).toBe("req-9");
  });

  it("la red caída no es un TypeError para la persona", () => {
    const humano = mensajeDeError(new TypeError("Failed to fetch"));
    expect(humano.frase).toBe(
      "No se pudo contactar el servidor. Revisa tu conexión e intenta de nuevo.",
    );
    expect(humano.frase).not.toContain("TypeError");
    expect(humano.frase).not.toContain("Failed to fetch");
  });

  it("la sesión vencida tiene frase propia aunque llegue por aquí", () => {
    expect(mensajeDeError(new SesionVencida()).frase).toBe("Tu sesión expiró. Vuelve a entrar.");
  });

  it("cualquier otra cosa cae en la frase genérica, nunca en String(error)", () => {
    const humano = mensajeDeError(new Error("boom interno"));
    expect(humano.frase).toBe("Algo no salió bien al cargar la información. Intenta nuevamente.");
    expect(humano.frase).not.toContain("boom");
  });
});
