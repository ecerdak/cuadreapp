// Pantallas del ciclo de contraseña (P0.1). Mismo estilo del resto del
// Dashboard: renderizado estático + aserciones sobre el texto real —
// lo que la persona lee es el contrato.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import {
  CambiarContrasena,
  ContrasenaActualizada,
  ContrasenaNueva,
  Recuperar,
  Restablecer,
} from "./Contrasena";
import { Entrar } from "./Entrar";
import { clasificarFalla, SinEmpresa, SinPermiso } from "../datos/contexto";
import { iniciarSesion, tomarPasswordTemporal } from "../datos/sesion";

function pintar(elemento: React.ReactElement, ruta = "/"): string {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[ruta]}>{elemento}</MemoryRouter>);
}

const respuesta = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "content-type": "application/json" } });

beforeEach(() => {
  // useMarca corre en useEffect: el render estático no lo dispara y no
  // necesita documento. Solo iniciarSesion toca localStorage.
  vi.stubGlobal("localStorage", {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  });
});

describe("primer ingreso forzado (ContrasenaNueva)", () => {
  it("con la temporal en memoria NO vuelve a pedir la contraseña actual", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          respuesta({ access_token: "a", refresh_token: "r", debe_cambiar_password: true }),
        ),
    );
    await iniciarSesion("nueva@empresa.com", "Cuadre-temporal1");

    const html = pintar(<ContrasenaNueva />);
    expect(html).toContain("Crea tu contraseña");
    expect(html).toContain("la temporal deja de funcionar");
    expect(html).not.toContain("Contraseña actual");
    expect(html).toContain("Contraseña nueva");
    expect(html).toContain("Repite la contraseña nueva");
    expect(html).toContain("Guardar y entrar");
  });

  it("tras una recarga (sin temporal en memoria) sí pide la contraseña actual", () => {
    tomarPasswordTemporal(); // asegura memoria vacía
    const html = pintar(<ContrasenaNueva />);
    expect(html).toContain("Contraseña actual");
  });

  it("no es un callejón: ofrece cerrar sesión sin definir la contraseña", () => {
    const html = pintar(<ContrasenaNueva />);
    expect(html).toContain("Cerrar sesión");
  });
});

describe("cambio voluntario (CambiarContrasena)", () => {
  it("pide actual, nueva y confirmación", () => {
    const html = pintar(<CambiarContrasena />);
    expect(html).toContain("Cambiar contraseña");
    expect(html).toContain("Contraseña actual");
    expect(html).toContain("Repite la contraseña nueva");
  });

  it("permite volver al tablero sin cambiar la contraseña", () => {
    const html = pintar(<CambiarContrasena />);
    expect(html).toContain("Volver al tablero sin cambiarla");
    expect(html).toContain('href="/hoy"');
  });

  it("la confirmación tiene una vuelta al tablero real, no decorativa", () => {
    const html = pintar(<ContrasenaActualizada alVolver={() => {}} />);
    expect(html).toContain("✓ Contraseña actualizada.");
    expect(html).toContain("Volver al tablero");
    // El botón envía el formulario cuyo onSubmit navega: es un submit
    // dentro de una tarjeta CON manejador, no un adorno.
    expect(html).toContain('type="submit"');
  });
});

describe("recuperación (Recuperar)", () => {
  it("explica el paso y ofrece volver a entrar", () => {
    const html = pintar(<Recuperar />);
    expect(html).toContain("te enviaremos un enlace");
    expect(html).toContain("Enviar enlace");
    expect(html).toContain("Volver a entrar");
  });
});

describe("restablecimiento (Restablecer)", () => {
  it("sin fragmento del correo explica que el enlace no sirve y ofrece pedir otro", () => {
    vi.stubGlobal("window", { location: { hash: "" } });
    const html = pintar(<Restablecer />);
    expect(html).toContain("El enlace no es válido o ya expiró");
    expect(html).toContain("Pedir un enlace nuevo");
  });

  it("con el fragmento del correo ofrece definir la contraseña nueva", () => {
    vi.stubGlobal("window", {
      location: { hash: "#access_token=a&refresh_token=r&type=recovery" },
    });
    const html = pintar(<Restablecer />);
    expect(html).toContain("Define tu contraseña nueva");
    expect(html).toContain("Guardar y entrar");
  });
});

describe("la puerta del login (Entrar)", () => {
  it("ofrece el camino de recuperación", () => {
    const html = pintar(<Entrar />);
    expect(html).toContain("¿Olvidaste tu contraseña?");
  });

  it("avisa cuando se volvió por sesión expirada", () => {
    const html = pintar(<Entrar />, "/entrar?motivo=sesion");
    expect(html).toContain("Tu sesión expiró. Vuelve a entrar.");
  });

  it("un acceso revocado se dice con la verdad, no como sesión expirada (P0.4)", () => {
    const html = pintar(<Entrar />, "/entrar?motivo=desactivado");
    expect(html).toContain("Tu acceso al Dashboard está desactivado");
    expect(html).toContain("Contacta al administrador de tu empresa");
    expect(html).not.toContain("Tu sesión expiró");
  });
});

describe("clasificación de la falla del contexto", () => {
  it("PASSWORD_TEMPORAL manda a definir la contraseña propia", () => {
    expect(clasificarFalla("Error: PASSWORD_TEMPORAL")).toBe("password_temporal");
  });

  it("ACCESO_DESACTIVADO se distingue de la sesión vencida (P0.4)", () => {
    expect(clasificarFalla("Error: ACCESO_DESACTIVADO")).toBe("acceso_desactivado");
    expect(clasificarFalla("Error: SESION_VENCIDA")).toBe("sesion_vencida");
  });
});

describe("pantallas de acceso denegado (P0.4)", () => {
  it("SinPermiso explica y tiene salida: cerrar sesión", () => {
    const html = pintar(<SinPermiso />);
    expect(html).toContain("Tu usuario no tiene acceso al Dashboard");
    expect(html).toContain("Cerrar sesión");
  });

  it("SinEmpresa explica y tiene salida: cerrar sesión", () => {
    const html = pintar(<SinEmpresa />);
    expect(html).toContain("Tu usuario no tiene una empresa asignada");
    expect(html).toContain("Cerrar sesión");
  });
});
