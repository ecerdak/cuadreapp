// Confirmaciones de Accesos (P0.9): desactivar y regenerar contraseña
// dicen su consecuencia ANTES de ejecutar. Las frases son el contrato.
// Activar no confirma a propósito: es inocua y re-ejecutable.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Dialogo } from "../../ui";
import { textoConfirmacion } from "./AccesosDashboard";

describe("textoConfirmacion (P0.9)", () => {
  it("desactivar dice que la persona pierde el acceso, y que es reversible", () => {
    const texto = textoConfirmacion("desactivar", "Marta Ruiz");
    expect(texto).toContain("Marta Ruiz perderá el acceso al Dashboard");
    expect(texto).toContain("activarlo de nuevo");
  });

  it("nueva contraseña dice que la actual deja de funcionar y que la nueva es de UN ingreso", () => {
    const texto = textoConfirmacion("reiniciar", "Marta Ruiz");
    expect(texto).toContain("La contraseña actual de Marta Ruiz dejará de funcionar");
    expect(texto).toContain("UN ingreso");
  });
});

describe("el diálogo de confirmación usa el shell (una sola acción primaria)", () => {
  it("desactivar: consecuencia + «Desactivar acceso» + «Cancelar» real", () => {
    const html = renderToStaticMarkup(
      <Dialogo
        titulo="Desactivar acceso"
        onCerrar={() => {}}
        onEnviar={() => {}}
        etiquetaEnviar="Desactivar acceso"
      >
        <p>{textoConfirmacion("desactivar", "Marta Ruiz")}</p>
      </Dialogo>,
    );
    expect(html).toContain("perderá el acceso al Dashboard");
    expect(html).toContain("Desactivar acceso");
    expect(html).toContain("Cancelar");
    expect(html.match(/type="submit"/g)).toHaveLength(1);
  });
});
