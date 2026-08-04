// [Clientes] Crear, editar, activar/desactivar, buscar. Cada cliente
// tiene su Perfil Operativo (DEC-016) y su identidad visual (DEC-017):
// logo real en Storage con URL firmada — nunca base64, nunca imagen
// rota (fallback a iniciales). Las sedes llevan ciudad/dirección/
// referencia; el dispensador (con su totalizador inicial) solo se pide
// cuando el perfil del cliente requiere medidor — decidido por el
// registro del dominio, jamás por nombre de cliente.

import { useRef, useState } from "react";
import { PERFILES, esCodigoPerfil } from "@cuadreapp/dominio";
import { useFuenteAdmin } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import type { Cliente, Sede } from "../datos/puertos";
import {
  BarraBusqueda,
  Boton,
  Campo,
  ChipActivo,
  Dialogo,
  Esqueleto,
  EstadoError,
  Eyebrow,
  Panel,
  Selector,
  Th,
  celda,
  gal,
  useFormulario,
} from "../ui";
import { TEMA } from "../tema";

const AVISO_CAMBIO_PERFIL =
  "La historia conserva el perfil con el que fue registrada. " +
  "Los dispositivos utilizarán el nuevo perfil después de sincronizar nuevamente.";

const TIPOS_LOGO = ["image/png", "image/jpeg", "image/webp"];
const LOGO_BYTES_MAXIMOS = 1024 * 1024; // 1 MB (DEC-017)

/** El perfil requiere dispensador/medidor — lo dice el registro del
 *  dominio; un código desconocido se trata como si lo requiriera. */
const requiereMedidor = (codigo: string): boolean =>
  esCodigoPerfil(codigo) ? PERFILES[codigo].requiereMedidor : true;

/** Logo del cliente o sus iniciales — nunca una imagen rota. */
export function LogoCliente(props: { nombre: string; logoUrl: string | null; tamano?: number }) {
  const tamano = props.tamano ?? 34;
  const [fallo, setFallo] = useState(false);
  const iniciales = props.nombre
    .split(/\s+/)
    .filter((palabra) => /^[a-záéíóúñ]/i.test(palabra))
    .slice(0, 2)
    .map((palabra) => palabra[0]!.toUpperCase())
    .join("");
  if (props.logoUrl && !fallo) {
    return (
      <img
        src={props.logoUrl}
        alt={`Logo de ${props.nombre}`}
        width={tamano}
        height={tamano}
        onError={() => setFallo(true)}
        className="rounded-md"
        style={{ objectFit: "contain", background: TEMA.panelAlto }}
      />
    );
  }
  return (
    <div
      aria-label={`Iniciales de ${props.nombre}`}
      className="flex items-center justify-center rounded-md font-semibold"
      style={{
        width: tamano,
        height: tamano,
        background: TEMA.panelAlto,
        border: `1px solid ${TEMA.linea}`,
        color: TEMA.suave,
        fontSize: tamano * 0.38,
      }}
    >
      {iniciales || "?"}
    </div>
  );
}

export function Clientes() {
  const fuente = useFuenteAdmin();
  const [buscar, setBuscar] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  const { consulta, recargar } = useConsulta(() => fuente.clientes(buscar || undefined), [buscar]);
  const perfiles = useConsulta(() => fuente.perfiles(), []);

  const [dialogo, setDialogo] = useState<"crear" | Cliente | null>(null);
  const [sedesDe, setSedesDe] = useState<Cliente | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { valores, cambiar, reiniciar } = useFormulario({
    nombre: "",
    nit: "",
    perfil: "medidor_doble",
  });

  const nombrePerfil = (codigo: string): string =>
    (perfiles.consulta.estado === "listo"
      ? perfiles.consulta.datos.find((p) => p.codigo === codigo)?.nombre
      : undefined) ?? codigo;

  const abrirCrear = () => {
    reiniciar();
    setError(null);
    setDialogo("crear");
  };
  const abrirEditar = (cliente: Cliente) => {
    cambiar("nombre")(cliente.nombre);
    cambiar("nit")(cliente.nit ?? "");
    cambiar("perfil")(cliente.perfilCodigo);
    setError(null);
    setDialogo(cliente);
  };

  const guardar = () => {
    setEnviando(true);
    const operacion =
      dialogo === "crear"
        ? fuente.crearCliente({
            nombre: valores.nombre,
            nit: valores.nit || null,
            perfilCodigo: valores.perfil,
          })
        : fuente.editarCliente((dialogo as Cliente).id, {
            nombre: valores.nombre,
            nit: valores.nit || null,
            perfilCodigo: valores.perfil,
          });
    void operacion
      .then(() => {
        setDialogo(null);
        recargar();
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setEnviando(false));
  };

  const alternarActivo = (cliente: Cliente) => {
    void fuente.editarCliente(cliente.id, { activo: !cliente.activo }).then(recargar);
  };

  if (consulta.estado === "cargando") return <Esqueleto alto={300} />;
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const clientes = consulta.datos.filter((c) => !soloActivos || c.activo);
  const editando = dialogo !== null && dialogo !== "crear" ? (dialogo as Cliente) : null;
  const cambioDePerfilConHistoria =
    editando !== null && valores.perfil !== editando.perfilCodigo && editando.cargas > 0;

  return (
    <div className="flex flex-col gap-4">
      <BarraBusqueda
        buscar={buscar}
        onBuscar={setBuscar}
        soloActivos={soloActivos}
        onSoloActivos={setSoloActivos}
        accion={<Boton onClick={abrirCrear}>Nuevo cliente</Boton>}
      />
      <Panel>
        <div className="overflow-x-auto px-2 pb-2 pt-2">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr>
                <Th>Cliente</Th>
                <Th>NIT</Th>
                <Th>Perfil</Th>
                <Th derecha>Sedes</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="font-semibold" style={celda}>
                    <div className="flex items-center" style={{ gap: 10 }}>
                      <LogoCliente nombre={cliente.nombre} logoUrl={cliente.logoUrl} tamano={28} />
                      {cliente.nombre}
                    </div>
                  </td>
                  <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                    {cliente.nit ?? "—"}
                  </td>
                  <td style={{ ...celda, fontSize: 12 }}>{nombrePerfil(cliente.perfilCodigo)}</td>
                  <td className="font-mono" style={{ ...celda, textAlign: "right" }}>
                    {cliente.sedes}
                  </td>
                  <td style={celda}>
                    <ChipActivo activo={cliente.activo} />
                  </td>
                  <td style={celda}>
                    <div className="flex" style={{ gap: 12 }}>
                      <Accion onClick={() => abrirEditar(cliente)}>Editar</Accion>
                      <Accion onClick={() => setSedesDe(cliente)}>Sedes</Accion>
                      <Accion onClick={() => alternarActivo(cliente)}>
                        {cliente.activo ? "Desactivar" : "Activar"}
                      </Accion>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clientes.length === 0 ? (
            <p className="px-3 py-4" style={{ fontSize: 12.5, color: TEMA.suave }}>
              Sin clientes para este filtro.
            </p>
          ) : null}
        </div>
      </Panel>

      {dialogo ? (
        <Dialogo
          titulo={dialogo === "crear" ? "Nuevo cliente" : `Editar ${(dialogo as Cliente).nombre}`}
          error={error}
          enviando={enviando}
          onCerrar={() => setDialogo(null)}
          onEnviar={guardar}
        >
          <Campo rotulo="Nombre" valor={valores.nombre} onCambio={cambiar("nombre")} requerido />
          <Campo rotulo="NIT (opcional)" valor={valores.nit} onCambio={cambiar("nit")} />
          <Selector
            rotulo="Perfil Operativo"
            valor={valores.perfil}
            onCambio={cambiar("perfil")}
            opciones={
              perfiles.consulta.estado === "listo"
                ? perfiles.consulta.datos
                    .filter((p) => p.activo)
                    .map((p) => ({ valor: p.codigo, rotulo: p.nombre }))
                : [{ valor: valores.perfil, rotulo: nombrePerfil(valores.perfil) }]
            }
          />
          {cambioDePerfilConHistoria ? (
            <div
              role="alert"
              className="rounded-md px-3 py-2"
              style={{
                fontSize: 12,
                color: TEMA.ambar,
                border: `1px solid ${TEMA.ambar}55`,
                background: `${TEMA.ambar}11`,
              }}
            >
              {AVISO_CAMBIO_PERFIL}
            </div>
          ) : null}
          {editando ? (
            <SeccionLogo cliente={editando} alCambiar={recargar} onActualizado={setDialogo} />
          ) : (
            <p style={{ fontSize: 11.5, color: TEMA.suave }}>
              El logo se agrega después de crear el cliente (pestaña Editar).
            </p>
          )}
        </Dialogo>
      ) : null}

      {sedesDe ? (
        <Sedes cliente={sedesDe} onCerrar={() => setSedesDe(null)} alCambiar={recargar} />
      ) : null}
    </div>
  );
}

/** Subir / reemplazar / eliminar el logo, con vista previa y estados. */
function SeccionLogo(props: {
  cliente: Cliente;
  alCambiar: () => void;
  onActualizado: (cliente: Cliente) => void;
}) {
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
      .subirLogo(props.cliente.id, archivo)
      .then((cliente) => {
        props.onActualizado(cliente);
        props.alCambiar();
      })
      .catch((e: Error) => setErrorLogo(e.message))
      .finally(() => setSubiendo(false));
  };

  const eliminar = () => {
    setSubiendo(true);
    setErrorLogo(null);
    void fuente
      .eliminarLogo(props.cliente.id)
      .then((cliente) => {
        props.onActualizado(cliente);
        props.alCambiar();
      })
      .catch((e: Error) => setErrorLogo(e.message))
      .finally(() => setSubiendo(false));
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg p-3" style={{ border: `1px solid ${TEMA.linea}` }}>
      <Eyebrow>Logo del cliente</Eyebrow>
      <div className="flex items-center" style={{ gap: 12 }}>
        <LogoCliente nombre={props.cliente.nombre} logoUrl={props.cliente.logoUrl} tamano={48} />
        <div className="flex flex-col" style={{ gap: 6 }}>
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
              {subiendo ? "Subiendo…" : props.cliente.logoUrl ? "Reemplazar logo" : "Subir logo"}
            </Boton>
            {props.cliente.logoUrl ? (
              <Boton secundario onClick={eliminar} deshabilitado={subiendo}>
                Eliminar logo
              </Boton>
            ) : null}
          </div>
          <p style={{ fontSize: 11, color: TEMA.suave }}>PNG, JPEG o WebP · máx. 1 MB.</p>
        </div>
      </div>
      {errorLogo ? (
        <div role="alert" style={{ fontSize: 12, color: TEMA.rojo }}>
          {errorLogo}
        </div>
      ) : null}
    </div>
  );
}

function Accion(props: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="focus-visible:outline"
      style={{ fontSize: 12, color: TEMA.azul }}
    >
      {props.children}
    </button>
  );
}

/** Sedes del cliente: listar, crear y editar. El dispensador (con su
 *  totalizador inicial) solo se pide si el perfil requiere medidor. */
function Sedes(props: { cliente: Cliente; onCerrar: () => void; alCambiar: () => void }) {
  const fuente = useFuenteAdmin();
  const { consulta, recargar } = useConsulta(() => fuente.sedes(props.cliente.id), [props.cliente.id]);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Sede | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { valores, cambiar, reiniciar } = useFormulario({
    nombre: "",
    ciudad: "",
    direccion: "",
    referencia: "",
    dispensador: "",
    tot: "0",
  });

  const conMedidor = requiereMedidor(props.cliente.perfilCodigo);

  const abrirCrear = () => {
    reiniciar();
    setError(null);
    setEditando(null);
    setCreando(true);
  };

  const abrirEditar = (sede: Sede) => {
    cambiar("nombre")(sede.nombre);
    cambiar("ciudad")(sede.ciudad ?? "");
    cambiar("direccion")(sede.direccion ?? "");
    cambiar("referencia")(sede.referencia ?? "");
    setError(null);
    setCreando(false);
    setEditando(sede);
  };

  const guardar = () => {
    setEnviando(true);
    const operacion = editando
      ? fuente.editarSede(editando.id, {
          nombre: valores.nombre,
          ciudad: valores.ciudad || null,
          direccion: valores.direccion || null,
          referencia: valores.referencia || null,
        })
      : fuente.crearSede({
          clienteId: props.cliente.id,
          nombre: valores.nombre,
          ciudad: valores.ciudad || null,
          direccion: valores.direccion || null,
          referencia: valores.referencia || null,
          dispensador: conMedidor
            ? {
                nombre: valores.dispensador,
                totInstalacionGal: Number(valores.tot.replace(",", ".")) || 0,
              }
            : null,
        });
    void operacion
      .then(() => {
        setCreando(false);
        setEditando(null);
        reiniciar();
        recargar();
        props.alCambiar();
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setEnviando(false));
  };

  const alternarActiva = (sede: Sede) => {
    void fuente.editarSede(sede.id, { activo: !sede.activo }).then(() => {
      recargar();
      props.alCambiar();
    });
  };

  const formulario = creando || editando !== null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Sedes de ${props.cliente.nombre}`}
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: "rgba(4,8,12,.62)" }}
    >
      <div
        className="flex w-full max-w-lg flex-col gap-3 rounded-lg p-5"
        style={{
          background: TEMA.panel,
          border: `1px solid ${TEMA.linea}`,
          maxHeight: "88vh",
          overflowY: "auto",
        }}
      >
        <div className="flex items-baseline justify-between">
          <div className="font-semibold" style={{ fontSize: 16 }}>
            Sedes de {props.cliente.nombre}
          </div>
          <Boton secundario onClick={props.onCerrar}>
            Cerrar
          </Boton>
        </div>
        {consulta.estado === "listo" ? (
          consulta.datos.length === 0 ? (
            <p style={{ fontSize: 12.5, color: TEMA.suave }}>Este cliente aún no tiene sedes.</p>
          ) : (
            <div className="flex flex-col" style={{ gap: 8 }}>
              {consulta.datos.map((sede: Sede) => (
                <Panel key={sede.id} className="p-3" alto>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold" style={{ fontSize: 13 }}>
                      {sede.nombre}
                      {sede.ciudad ? (
                        <span style={{ color: TEMA.suave, fontWeight: 400 }}>, {sede.ciudad}</span>
                      ) : null}
                    </div>
                    <div className="flex items-center" style={{ gap: 10 }}>
                      <ChipActivo activo={sede.activo} />
                      <Accion onClick={() => abrirEditar(sede)}>Editar</Accion>
                      <Accion onClick={() => alternarActiva(sede)}>
                        {sede.activo ? "Desactivar" : "Activar"}
                      </Accion>
                    </div>
                  </div>
                  {sede.direccion ? (
                    <div style={{ fontSize: 11.5, color: TEMA.suave, marginTop: 3 }}>
                      {sede.direccion}
                    </div>
                  ) : null}
                  {sede.referencia ? (
                    <div style={{ fontSize: 11.5, color: TEMA.suave, marginTop: 3 }}>
                      {sede.referencia}
                    </div>
                  ) : null}
                  {sede.dispensadores.map((dispensador) => (
                    <div
                      key={dispensador.id}
                      style={{ fontSize: 11.5, color: TEMA.suave, marginTop: 3 }}
                    >
                      {dispensador.nombre} · totalizador{" "}
                      <span className="font-mono">{gal(dispensador.totActualGal)}</span> gal
                    </div>
                  ))}
                </Panel>
              ))}
            </div>
          )
        ) : (
          <Esqueleto alto={60} />
        )}
        {formulario ? (
          <div
            className="flex flex-col gap-3 rounded-lg p-3"
            style={{ border: `1px solid ${TEMA.linea}` }}
          >
            <Eyebrow>
              {editando
                ? `Editar ${editando.nombre}`
                : conMedidor
                  ? "Nueva sede (nace con su dispensador)"
                  : "Nueva sede"}
            </Eyebrow>
            <Campo
              rotulo="Nombre visible de la sede"
              valor={valores.nombre}
              onCambio={cambiar("nombre")}
              requerido
            />
            <Campo
              rotulo="Ciudad / municipio"
              valor={valores.ciudad}
              onCambio={cambiar("ciudad")}
              placeholder="Buga, Valle del Cauca"
            />
            <Campo
              rotulo="Dirección (opcional)"
              valor={valores.direccion}
              onCambio={cambiar("direccion")}
            />
            <Campo
              rotulo="Referencia operativa (opcional)"
              valor={valores.referencia}
              onCambio={cambiar("referencia")}
            />
            {!editando && conMedidor ? (
              <>
                <Campo
                  rotulo="Nombre del dispensador"
                  valor={valores.dispensador}
                  onCambio={cambiar("dispensador")}
                  placeholder="Isla 1 · Fill-Rite 900"
                  requerido
                />
                <Campo
                  rotulo="Totalizador de instalación (gal)"
                  valor={valores.tot}
                  onCambio={cambiar("tot")}
                />
              </>
            ) : null}
            {error ? (
              <div role="alert" style={{ fontSize: 12, color: TEMA.rojo }}>
                {error}
              </div>
            ) : null}
            <div className="flex justify-end" style={{ gap: 8 }}>
              <Boton
                secundario
                onClick={() => {
                  setCreando(false);
                  setEditando(null);
                }}
              >
                Cancelar
              </Boton>
              <Boton onClick={guardar} deshabilitado={enviando}>
                {enviando ? "Guardando…" : editando ? "Guardar cambios" : "Crear sede"}
              </Boton>
            </div>
          </div>
        ) : (
          <div>
            <Boton onClick={abrirCrear}>Nueva sede</Boton>
          </div>
        )}
      </div>
    </div>
  );
}
