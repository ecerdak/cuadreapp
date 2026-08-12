// Entrega de credenciales (P0.2): el texto que se pega en WhatsApp, la
// política de copia/cierre (pura) y el contrato de marcado del diálogo.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DialogoCredenciales,
  ENTREGA_INICIAL,
  textoCredenciales,
  transicionEntrega,
} from "./DialogoCredenciales";

const CREDENCIAL = {
  nombre: "Marta Ruiz",
  email: "marta@empresa.com",
  password: "Cuadre-9f3k2m",
};
const URL = "https://dashboard.ejemplo";

describe("textoCredenciales", () => {
  it("arma el mensaje completo, listo para WhatsApp o correo", () => {
    expect(textoCredenciales(CREDENCIAL, URL)).toBe(
      [
        "Acceso a CuadreApp",
        "",
        "Dashboard:",
        "https://dashboard.ejemplo",
        "",
        "Usuario:",
        "marta@empresa.com",
        "",
        "Contraseña temporal:",
        "Cuadre-9f3k2m",
        "",
        "En tu primer ingreso deberás crear una contraseña nueva.",
      ].join("\n"),
    );
  });
});

describe("política de entrega (transicionEntrega)", () => {
  it("copia exitosa: confirma y habilita el cierre directo", () => {
    const { estado, cerrar } = transicionEntrega(ENTREGA_INICIAL, {
      tipo: "copia_ok",
      exito: "Credenciales copiadas ✓",
    });
    expect(cerrar).toBe(false);
    expect(estado.copiado).toBe(true);
    expect(estado.aviso).toEqual({ tono: "ok", texto: "Credenciales copiadas ✓" });

    const despues = transicionEntrega(estado, { tipo: "cerrar" });
    expect(despues.cerrar).toBe(true);
  });

  it("fallo del portapapeles: avisa y el diálogo NO se cierra", () => {
    const { estado, cerrar } = transicionEntrega(ENTREGA_INICIAL, { tipo: "copia_fallo" });
    expect(cerrar).toBe(false);
    expect(estado.copiado).toBe(false);
    expect(estado.aviso?.tono).toBe("error");
    expect(estado.aviso?.texto).toContain("cópialo a mano");
  });

  it("cerrar sin copiar pide una segunda intención antes de perder la contraseña", () => {
    const primero = transicionEntrega(ENTREGA_INICIAL, { tipo: "cerrar" });
    expect(primero.cerrar).toBe(false);
    expect(primero.estado.confirmandoCierre).toBe(true);

    const segundo = transicionEntrega(primero.estado, { tipo: "cerrar" });
    expect(segundo.cerrar).toBe(true);
  });

  it("copiar después de la advertencia la retira: ya no hay nada que perder", () => {
    const advertido = transicionEntrega(ENTREGA_INICIAL, { tipo: "cerrar" }).estado;
    const { estado } = transicionEntrega(advertido, {
      tipo: "copia_ok",
      exito: "Contraseña copiada ✓",
    });
    expect(estado.confirmandoCierre).toBe(false);
    expect(estado.copiado).toBe(true);
  });
});

describe("marcado del diálogo", () => {
  const html = renderToStaticMarkup(
    <DialogoCredenciales credencial={CREDENCIAL} urlDashboard={URL} alCerrar={() => {}} />,
  );

  it("muestra nombre, URL del Dashboard, usuario y contraseña temporal", () => {
    expect(html).toContain("Marta Ruiz");
    expect(html).toContain("https://dashboard.ejemplo");
    expect(html).toContain("marta@empresa.com");
    expect(html).toContain("Cuadre-9f3k2m");
    expect(html).toContain("UN ingreso");
  });

  it("sus acciones son Copiar credenciales / Copiar contraseña / Cerrar — sin Cancelar ni Guardar", () => {
    expect(html).toContain("Copiar credenciales");
    expect(html).toContain("Copiar contraseña");
    expect(html).toContain(">Cerrar<");
    expect(html).not.toContain("Cancelar");
    expect(html).not.toContain(">Guardar<");
    // Sin pie del shell: ninguna acción es submit — nada se envía.
    expect(html).not.toContain('type="submit"');
  });
});
