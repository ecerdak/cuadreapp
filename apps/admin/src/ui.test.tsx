// Shell de diálogos (P0.3): UNA sola acción primaria por modal, con la
// etiqueta que el modal declara; el envío se bloquea mientras está
// deshabilitado u ocupado; y un modal informativo puede quedarse sin
// pie para traer sus propias acciones.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Boton, Dialogo } from "./ui";

const html = (elemento: React.ReactElement) => renderToStaticMarkup(elemento);

describe("Dialogo (P0.3)", () => {
  it("tiene UNA sola acción primaria, con la etiqueta del modal", () => {
    const salida = html(
      <Dialogo
        titulo="Crear acceso al Dashboard"
        onCerrar={() => {}}
        onEnviar={() => {}}
        etiquetaEnviar="Crear acceso"
      >
        <span>campos</span>
      </Dialogo>,
    );
    expect(salida.match(/type="submit"/g)).toHaveLength(1);
    expect(salida).toContain("Crear acceso");
    expect(salida).not.toContain(">Guardar<");
    expect(salida).toContain("Cancelar");
  });

  it("sin etiqueta declarada conserva «Guardar» (los diálogos de edición)", () => {
    const salida = html(
      <Dialogo titulo="Editar sede" onCerrar={() => {}} onEnviar={() => {}}>
        <span>campos</span>
      </Dialogo>,
    );
    expect(salida).toContain(">Guardar<");
  });

  it("deshabilitado y enviando bloquean el botón de envío (sin doble submit)", () => {
    const deshabilitado = html(
      <Dialogo titulo="x" onCerrar={() => {}} onEnviar={() => {}} deshabilitado>
        <span />
      </Dialogo>,
    );
    expect(deshabilitado).toContain("disabled");

    const enviando = html(
      <Dialogo titulo="x" onCerrar={() => {}} onEnviar={() => {}} enviando etiquetaEnviando="Creando…">
        <span />
      </Dialogo>,
    );
    expect(enviando).toContain("Creando…");
    expect(enviando).toContain("disabled");
  });

  it("sinPie no pinta acciones propias: el contenido manda", () => {
    const salida = html(
      <Dialogo titulo="Credenciales" onCerrar={() => {}} sinPie>
        <button type="button">Copiar credenciales</button>
      </Dialogo>,
    );
    expect(salida).not.toContain("Cancelar");
    expect(salida).not.toContain(">Guardar<");
    expect(salida).toContain("Copiar credenciales");
  });
});

describe("Boton deshabilitado (P0.3)", () => {
  it("el rótulo de un botón deshabilitado sigue siendo legible", () => {
    const salida = html(<Boton deshabilitado>Guardando…</Boton>);
    // El color del texto no puede ser la tinta del panel (#12202C).
    expect(salida).not.toContain("color:#12202C");
  });
});
