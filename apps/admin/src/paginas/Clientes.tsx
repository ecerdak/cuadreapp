// [Clientes] Crear, editar, activar/desactivar, buscar. Estructura
// multicliente lista: Sacyr hoy, El Trébol y otros después, sin tocar
// código. Cada cliente expande sus sedes (con su dispensador).

import { useState } from "react";
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
  Th,
  celda,
  gal,
  useFormulario,
} from "../ui";
import { TEMA } from "../tema";

export function Clientes() {
  const fuente = useFuenteAdmin();
  const [buscar, setBuscar] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  const { consulta, recargar } = useConsulta(() => fuente.clientes(buscar || undefined), [buscar]);

  const [dialogo, setDialogo] = useState<"crear" | Cliente | null>(null);
  const [sedesDe, setSedesDe] = useState<Cliente | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { valores, cambiar, reiniciar } = useFormulario({ nombre: "", nit: "" });

  const abrirCrear = () => {
    reiniciar();
    setError(null);
    setDialogo("crear");
  };
  const abrirEditar = (cliente: Cliente) => {
    cambiar("nombre")(cliente.nombre);
    cambiar("nit")(cliente.nit ?? "");
    setError(null);
    setDialogo(cliente);
  };

  const guardar = () => {
    setEnviando(true);
    const operacion =
      dialogo === "crear"
        ? fuente.crearCliente({ nombre: valores.nombre, nit: valores.nit || null })
        : fuente.editarCliente((dialogo as Cliente).id, {
            nombre: valores.nombre,
            nit: valores.nit || null,
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
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr>
                <Th>Cliente</Th>
                <Th>NIT</Th>
                <Th derecha>Sedes</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="font-semibold" style={celda}>
                    {cliente.nombre}
                  </td>
                  <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                    {cliente.nit ?? "—"}
                  </td>
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
        </Dialogo>
      ) : null}

      {sedesDe ? (
        <Sedes cliente={sedesDe} onCerrar={() => setSedesDe(null)} alCambiar={recargar} />
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

/** Sedes del cliente: listar y crear (cada sede nace con su dispensador). */
function Sedes(props: { cliente: Cliente; onCerrar: () => void; alCambiar: () => void }) {
  const fuente = useFuenteAdmin();
  const { consulta, recargar } = useConsulta(() => fuente.sedes(props.cliente.id), [props.cliente.id]);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { valores, cambiar, reiniciar } = useFormulario({ nombre: "", dispensador: "", tot: "0" });

  const crear = () => {
    setEnviando(true);
    void fuente
      .crearSede({
        clienteId: props.cliente.id,
        nombre: valores.nombre,
        dispensadorNombre: valores.dispensador,
        totInstalacionGal: Number(valores.tot.replace(",", ".")) || 0,
      })
      .then(() => {
        setCreando(false);
        reiniciar();
        recargar();
        props.alCambiar();
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setEnviando(false));
  };

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
        style={{ background: TEMA.panel, border: `1px solid ${TEMA.linea}` }}
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
                  <div className="font-semibold" style={{ fontSize: 13 }}>
                    {sede.nombre}
                  </div>
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
        {creando ? (
          <div
            className="flex flex-col gap-3 rounded-lg p-3"
            style={{ border: `1px solid ${TEMA.linea}` }}
          >
            <Eyebrow>Nueva sede (nace con su dispensador)</Eyebrow>
            <Campo
              rotulo="Nombre de la sede"
              valor={valores.nombre}
              onCambio={cambiar("nombre")}
              requerido
            />
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
            {error ? (
              <div role="alert" style={{ fontSize: 12, color: TEMA.rojo }}>
                {error}
              </div>
            ) : null}
            <div className="flex justify-end" style={{ gap: 8 }}>
              <Boton secundario onClick={() => setCreando(false)}>
                Cancelar
              </Boton>
              <Boton onClick={crear} deshabilitado={enviando}>
                {enviando ? "Guardando…" : "Crear sede"}
              </Boton>
            </div>
          </div>
        ) : (
          <div>
            <Boton onClick={() => setCreando(true)}>Nueva sede</Boton>
          </div>
        )}
      </div>
    </div>
  );
}
