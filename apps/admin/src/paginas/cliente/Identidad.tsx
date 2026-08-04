// [Cliente → Identidad] Logo, colores corporativos y datos legales
// (DEC-018). La base guarda SOLO los dos colores; hover, estados,
// bordes y contrastes los deriva el Design System (tema-cliente.ts).
// El Perfil Operativo NO vive aquí: es Configuración.

import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFuenteAdmin } from "../../datos/proveedor";
import { Boton, Campo, Eyebrow, Panel } from "../../ui";
import { TEMA } from "../../tema";
import { COLOR_CUADREAPP, contrasteInsuficiente, esHexValido } from "../../tema-cliente";
import type { ContextoFicha } from "./FichaCliente";
import { LogoCliente } from "./LogoCliente";

const TIPOS_LOGO = ["image/png", "image/jpeg", "image/webp"];
const LOGO_BYTES_MAXIMOS = 1024 * 1024; // 1 MB (DEC-017)

export function IdentidadCliente() {
  const { cliente, recargar } = useOutletContext<ContextoFicha>();
  const fuente = useFuenteAdmin();

  const [nombre, setNombre] = useState(cliente.nombre);
  const [nombreComercial, setNombreComercial] = useState(cliente.nombreComercial ?? "");
  const [nit, setNit] = useState(cliente.nit ?? "");
  const [primario, setPrimario] = useState(cliente.colorPrimario ?? "");
  const [secundario, setSecundario] = useState(cliente.colorSecundario ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const guardar = () => {
    setError(null);
    for (const [rotulo, valor] of [
      ["primario", primario],
      ["secundario", secundario],
    ] as const) {
      if (valor !== "" && !esHexValido(valor)) {
        setError(`El color ${rotulo} debe tener el formato #RRGGBB (por ejemplo #1E9B4B).`);
        return;
      }
    }
    setGuardando(true);
    void fuente
      .editarCliente(cliente.id, {
        nombre,
        nombreComercial: nombreComercial.trim() || null,
        nit: nit.trim() || null,
        colorPrimario: primario.trim() || null,
        colorSecundario: secundario.trim() || null,
      })
      .then(() => {
        setGuardado(true);
        recargar();
        setTimeout(() => setGuardado(false), 2500);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setGuardando(false));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel className="flex flex-col gap-3 p-5">
        <Eyebrow>Datos legales</Eyebrow>
        <Campo rotulo="Razón social" valor={nombre} onCambio={setNombre} requerido />
        <Campo
          rotulo="Nombre comercial"
          valor={nombreComercial}
          onCambio={setNombreComercial}
          placeholder="Nombre corto visible en la app"
        />
        <Campo rotulo="NIT" valor={nit} onCambio={setNit} />

        <div className="mt-2">
          <Eyebrow>Colores corporativos</Eyebrow>
          <p style={{ fontSize: 11, color: TEMA.suave, marginTop: 4, lineHeight: 1.5 }}>
            Solo estos dos colores se guardan. Estados, bordes, sombras y contrastes los deriva CuadreApp
            automáticamente: la identidad cambia, la experiencia no.
          </p>
        </div>
        <CampoColor rotulo="Color primario" valor={primario} onCambio={setPrimario} />
        <CampoColor rotulo="Color secundario" valor={secundario} onCambio={setSecundario} />

        {error ? (
          <div role="alert" style={{ fontSize: 12, color: TEMA.rojo }}>
            {error}
          </div>
        ) : null}
        <div className="flex items-center" style={{ gap: 10 }}>
          <Boton onClick={guardar} deshabilitado={guardando}>
            {guardando ? "Guardando…" : "Guardar identidad"}
          </Boton>
          {guardado ? (
            <span role="status" style={{ fontSize: 12, color: TEMA.verde }}>
              ✓ Identidad actualizada
            </span>
          ) : null}
        </div>
      </Panel>

      <div className="flex flex-col gap-4">
        <SeccionLogo />
        <VistaPrevia
          nombre={nombreComercial.trim() || nombre}
          primario={primario}
          secundario={secundario}
        />
      </div>
    </div>
  );
}

function CampoColor(props: { rotulo: string; valor: string; onCambio: (valor: string) => void }) {
  const valido = esHexValido(props.valor);
  const bajo = contrasteInsuficiente(valido ? props.valor : null);
  return (
    <div>
      <Eyebrow>{props.rotulo}</Eyebrow>
      <div className="mt-1 flex items-center" style={{ gap: 8 }}>
        <input
          type="color"
          aria-label={`${props.rotulo} — selector`}
          value={valido ? props.valor : "#5B90C4"}
          onChange={(evento) => props.onCambio(evento.target.value.toUpperCase())}
          style={{
            width: 42,
            height: 38,
            background: "transparent",
            border: `1px solid ${TEMA.linea}`,
            borderRadius: 6,
            padding: 2,
          }}
        />
        <input
          type="text"
          aria-label={props.rotulo}
          value={props.valor}
          onChange={(evento) => props.onCambio(evento.target.value.toUpperCase())}
          placeholder="#RRGGBB (opcional)"
          className="w-full rounded-md px-3 py-2 font-mono focus-visible:outline focus-visible:outline-2"
          style={{
            background: TEMA.panelAlto,
            border: `1px solid ${props.valor && !valido ? TEMA.rojo : TEMA.linea}`,
            fontSize: 13,
            color: TEMA.texto,
          }}
        />
        {props.valor ? (
          <button
            type="button"
            onClick={() => props.onCambio("")}
            style={{ fontSize: 11, color: TEMA.suave }}
          >
            Quitar
          </button>
        ) : null}
      </div>
      {bajo ? (
        <p style={{ fontSize: 11, color: TEMA.ambar, marginTop: 4 }}>
          Este color contrasta poco con el fondo oscuro de la consola. Se usará igual, pero un tono más
          claro se lee mejor.
        </p>
      ) : null}
    </div>
  );
}

/** Muestra cómo se verá la identidad — con los mismos derivados que
 *  usará la aplicación (nada de CSS libre del cliente). */
function VistaPrevia(props: { nombre: string; primario: string; secundario: string }) {
  const primario = esHexValido(props.primario) ? props.primario : COLOR_CUADREAPP.primario;
  const propio = esHexValido(props.primario);
  return (
    <Panel className="p-5">
      <Eyebrow>Vista previa</Eyebrow>
      <div className="mt-3 flex flex-wrap items-center" style={{ gap: 10 }}>
        <span
          className="rounded-md px-3 py-2 font-semibold"
          style={{
            fontSize: 12.5,
            background: "var(--cliente-primario)",
            color: "var(--cliente-primario-texto)",
          }}
        >
          Botón principal
        </span>
        <span
          className="rounded-full px-3 py-1 font-semibold"
          style={{
            fontSize: 11,
            background: "var(--cliente-primario-suave)",
            border: "1px solid var(--cliente-primario-borde)",
            color: TEMA.texto,
          }}
        >
          {props.nombre || "Cliente"}
        </span>
        <span
          style={{
            fontSize: 12,
            paddingBottom: 6,
            borderBottom: `2px solid var(--cliente-primario)`,
          }}
        >
          Pestaña activa
        </span>
      </div>
      <p style={{ fontSize: 11, color: TEMA.suave, marginTop: 12, lineHeight: 1.5 }}>
        {propio
          ? `Identidad propia (${primario}). El texto sobre el color lo elige el sistema por contraste.`
          : "Sin color propio: se usa la paleta CuadreApp."}
      </p>
    </Panel>
  );
}

/** Subir / reemplazar / eliminar el logo, con estados y validación. */
function SeccionLogo() {
  const { cliente, recargar } = useOutletContext<ContextoFicha>();
  const fuente = useFuenteAdmin();
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorLogo, setErrorLogo] = useState<string | null>(null);

  const alElegir = (archivo: File | undefined) => {
    if (!archivo) return;
    setErrorLogo(null);
    if (!TIPOS_LOGO.includes(archivo.type)) {
      setErrorLogo("Formato no admitido: se acepta PNG, JPEG o WebP (SVG no).");
      return;
    }
    if (archivo.size > LOGO_BYTES_MAXIMOS) {
      setErrorLogo("El archivo pesa más de 1 MB. Reduce la imagen e intenta de nuevo.");
      return;
    }
    setSubiendo(true);
    void fuente
      .subirLogo(cliente.id, archivo)
      .then(() => recargar())
      .catch((e: Error) => setErrorLogo(e.message))
      .finally(() => setSubiendo(false));
  };

  return (
    <Panel className="p-5">
      <Eyebrow>Logo del cliente</Eyebrow>
      <div className="mt-3 flex items-center" style={{ gap: 14 }}>
        <LogoCliente
          nombre={cliente.nombreComercial ?? cliente.nombre}
          logoUrl={cliente.logoUrl}
          tamano={64}
        />
        <div className="flex flex-col" style={{ gap: 8 }}>
          <input
            ref={entrada}
            type="file"
            accept={TIPOS_LOGO.join(",")}
            className="hidden"
            aria-label="Elegir archivo de logo"
            onChange={(evento) => {
              alElegir(evento.target.files?.[0]);
              evento.target.value = "";
            }}
          />
          <div className="flex" style={{ gap: 8 }}>
            <Boton secundario onClick={() => entrada.current?.click()} deshabilitado={subiendo}>
              {subiendo ? "Subiendo…" : cliente.logoUrl ? "Reemplazar" : "Subir logo"}
            </Boton>
            {cliente.logoUrl ? (
              <Boton
                secundario
                deshabilitado={subiendo}
                onClick={() => {
                  setSubiendo(true);
                  setErrorLogo(null);
                  void fuente
                    .eliminarLogo(cliente.id)
                    .then(() => recargar())
                    .catch((e: Error) => setErrorLogo(e.message))
                    .finally(() => setSubiendo(false));
                }}
              >
                Eliminar
              </Boton>
            ) : null}
          </div>
          <p style={{ fontSize: 11, color: TEMA.suave }}>PNG, JPEG o WebP · máx. 1 MB.</p>
        </div>
      </div>
      {errorLogo ? (
        <div role="alert" style={{ fontSize: 12, color: TEMA.rojo, marginTop: 8 }}>
          {errorLogo}
        </div>
      ) : null}
    </Panel>
  );
}
