// [Cliente → Operación] La jerarquía congelada (DEC-018) en una sola
// pantalla: Sedes → Equipos → Operadores → Dispositivos, todo con el
// alcance del cliente de la ficha. Multi-sede es el supuesto: equipos y
// operadores pueden ser exclusivos de una sede o compartidos entre
// todas (sede_id null).

import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PERFILES, esCodigoPerfil } from "@cuadreapp/dominio";
import { useFuenteAdmin } from "../../datos/proveedor";
import { useConsulta } from "../../datos/consulta";
import type { Equipo, Operador, Sede } from "../../datos/puertos";
import {
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
} from "../../ui";
import { TEMA } from "../../tema";
import type { ContextoFicha } from "./FichaCliente";

const COMPARTIDO = "";
const ROTULO_COMPARTIDO = "Todas las sedes";

export function OperacionCliente() {
  const { cliente } = useOutletContext<ContextoFicha>();
  const fuente = useFuenteAdmin();
  const { consulta, recargar } = useConsulta(
    async () => ({
      sedes: await fuente.sedes(cliente.id),
      equipos: await fuente.equipos({ clienteId: cliente.id }),
      operadores: await fuente.operadores({ clienteId: cliente.id }),
      dispositivos: await fuente.dispositivos(),
    }),
    [cliente.id],
  );

  if (consulta.estado === "cargando") return <Esqueleto alto={420} />;
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { sedes, equipos, operadores, dispositivos } = consulta.datos;
  const idsSede = new Set(sedes.map((s) => s.id));
  const dispositivosDelCliente = dispositivos.filter((d) => idsSede.has(d.sedeId));

  return (
    <div className="flex flex-col gap-4">
      <Sedes cliente={cliente} sedes={sedes} alCambiar={recargar} />
      <Equipos cliente={cliente} sedes={sedes} equipos={equipos} alCambiar={recargar} />
      <Operadores cliente={cliente} sedes={sedes} operadores={operadores} alCambiar={recargar} />
      <Dispositivos dispositivos={dispositivosDelCliente} sedes={sedes} alCambiar={recargar} />
    </div>
  );
}

/** Opciones de sede para equipos y operadores: la sede o compartido. */
function opcionesSede(sedes: Sede[]) {
  return [
    { valor: COMPARTIDO, rotulo: ROTULO_COMPARTIDO },
    ...sedes.map((sede) => ({ valor: sede.id, rotulo: sede.nombre })),
  ];
}

function Bloque(props: { titulo: string; accion?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Panel>
      <div className="flex items-center justify-between px-5 pt-5">
        <Eyebrow>{props.titulo}</Eyebrow>
        {props.accion}
      </div>
      {props.children}
    </Panel>
  );
}

const Accion = (props: { onClick: () => void; children: string }) => (
  <button
    type="button"
    onClick={props.onClick}
    className="focus-visible:outline"
    style={{ fontSize: 12, color: "var(--cliente-primario)" }}
  >
    {props.children}
  </button>
);

/* ============ Sedes ============ */

function Sedes(props: { cliente: ContextoFicha["cliente"]; sedes: Sede[]; alCambiar: () => void }) {
  const fuente = useFuenteAdmin();
  const [dialogo, setDialogo] = useState<"crear" | Sede | null>(null);
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

  const conMedidor = esCodigoPerfil(props.cliente.perfilCodigo)
    ? PERFILES[props.cliente.perfilCodigo].requiereMedidor
    : true;

  const guardar = () => {
    setEnviando(true);
    const operacion =
      dialogo === "crear"
        ? fuente.crearSede({
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
          })
        : fuente.editarSede((dialogo as Sede).id, {
            nombre: valores.nombre,
            ciudad: valores.ciudad || null,
            direccion: valores.direccion || null,
            referencia: valores.referencia || null,
          });
    void operacion
      .then(() => {
        setDialogo(null);
        props.alCambiar();
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setEnviando(false));
  };

  return (
    <Bloque
      titulo="Sedes"
      accion={
        <Boton
          onClick={() => {
            reiniciar();
            setError(null);
            setDialogo("crear");
          }}
        >
          Nueva sede
        </Boton>
      }
    >
      <div className="flex flex-col px-5 pb-5 pt-3" style={{ gap: 8 }}>
        {props.sedes.length === 0 ? (
          <p style={{ fontSize: 12.5, color: TEMA.suave }}>
            Este cliente aún no tiene sedes. La operación empieza aquí.
          </p>
        ) : (
          props.sedes.map((sede) => (
            <div
              key={sede.id}
              className="rounded-lg p-3"
              style={{ border: `1px solid ${TEMA.linea}`, background: TEMA.panelAlto }}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold" style={{ fontSize: 13 }}>
                  {sede.nombre}
                  {sede.ciudad ? (
                    <span style={{ color: TEMA.suave, fontWeight: 400 }}>, {sede.ciudad}</span>
                  ) : null}
                </div>
                <div className="flex items-center" style={{ gap: 10 }}>
                  <ChipActivo activo={sede.activo} />
                  <Accion
                    onClick={() => {
                      cambiar("nombre")(sede.nombre);
                      cambiar("ciudad")(sede.ciudad ?? "");
                      cambiar("direccion")(sede.direccion ?? "");
                      cambiar("referencia")(sede.referencia ?? "");
                      setError(null);
                      setDialogo(sede);
                    }}
                  >
                    Editar
                  </Accion>
                  <Accion
                    onClick={() =>
                      void fuente.editarSede(sede.id, { activo: !sede.activo }).then(props.alCambiar)
                    }
                  >
                    {sede.activo ? "Desactivar" : "Activar"}
                  </Accion>
                </div>
              </div>
              {sede.direccion ? (
                <div style={{ fontSize: 11.5, color: TEMA.suave, marginTop: 3 }}>{sede.direccion}</div>
              ) : null}
              {sede.referencia ? (
                <div style={{ fontSize: 11.5, color: TEMA.suave, marginTop: 3 }}>{sede.referencia}</div>
              ) : null}
              {sede.dispensadores.map((dispensador) => (
                <div key={dispensador.id} style={{ fontSize: 11.5, color: TEMA.suave, marginTop: 3 }}>
                  {dispensador.nombre} · totalizador{" "}
                  <span className="font-mono">{gal(dispensador.totActualGal)}</span> gal
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {dialogo ? (
        <Dialogo
          titulo={dialogo === "crear" ? "Nueva sede" : `Editar ${(dialogo as Sede).nombre}`}
          error={error}
          enviando={enviando}
          onCerrar={() => setDialogo(null)}
          onEnviar={guardar}
        >
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
          {dialogo === "crear" && conMedidor ? (
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
        </Dialogo>
      ) : null}
    </Bloque>
  );
}

/* ============ Equipos ============ */

function Equipos(props: {
  cliente: ContextoFicha["cliente"];
  sedes: Sede[];
  equipos: Equipo[];
  alCambiar: () => void;
}) {
  const fuente = useFuenteAdmin();
  const [dialogo, setDialogo] = useState<"crear" | Equipo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { valores, cambiar, reiniciar } = useFormulario({
    codigo: "",
    categoria: "Carrotanque",
    descripcion: "",
    sedeId: COMPARTIDO,
  });

  const guardar = () => {
    setEnviando(true);
    const comunes = {
      codigoInterno: valores.codigo,
      categoria: valores.categoria || null,
      descripcion: valores.descripcion || null,
      sedeId: valores.sedeId || null,
    };
    const operacion =
      dialogo === "crear"
        ? fuente.crearEquipo({ clienteId: props.cliente.id, ...comunes })
        : fuente.editarEquipo((dialogo as Equipo).id, comunes);
    void operacion
      .then(() => {
        setDialogo(null);
        props.alCambiar();
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setEnviando(false));
  };

  return (
    <Bloque
      titulo="Equipos"
      accion={
        <Boton
          onClick={() => {
            reiniciar();
            setError(null);
            setDialogo("crear");
          }}
        >
          Nuevo equipo
        </Boton>
      }
    >
      <div className="overflow-x-auto px-2 pb-3 pt-3">
        <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 620 }}>
          <thead>
            <tr>
              <Th>Código / placa</Th>
              <Th>Sede</Th>
              <Th>Categoría</Th>
              <Th>Observaciones</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {props.equipos.map((equipo) => (
              <tr key={equipo.id}>
                <td className="font-mono font-semibold" style={celda}>
                  {equipo.codigoInterno}
                </td>
                <td style={{ ...celda, fontSize: 12, color: TEMA.suave }}>
                  {equipo.sedeNombre ?? ROTULO_COMPARTIDO}
                </td>
                <td style={{ ...celda, color: TEMA.suave }}>{equipo.categoria ?? "—"}</td>
                <td style={{ ...celda, color: TEMA.suave, maxWidth: 240 }}>
                  {equipo.descripcion ?? "—"}
                </td>
                <td style={celda}>
                  <ChipActivo activo={equipo.activo} />
                </td>
                <td style={celda}>
                  <div className="flex" style={{ gap: 12 }}>
                    <Accion
                      onClick={() => {
                        cambiar("codigo")(equipo.codigoInterno);
                        cambiar("categoria")(equipo.categoria ?? "");
                        cambiar("descripcion")(equipo.descripcion ?? "");
                        cambiar("sedeId")(equipo.sedeId ?? COMPARTIDO);
                        setError(null);
                        setDialogo(equipo);
                      }}
                    >
                      Editar
                    </Accion>
                    <Accion
                      onClick={() =>
                        void fuente
                          .editarEquipo(equipo.id, { activo: !equipo.activo })
                          .then(props.alCambiar)
                      }
                    >
                      {equipo.activo ? "Desactivar" : "Activar"}
                    </Accion>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {props.equipos.length === 0 ? (
          <p className="px-3 py-4" style={{ fontSize: 12.5, color: TEMA.suave }}>
            Sin equipos registrados para este cliente.
          </p>
        ) : null}
      </div>

      {dialogo ? (
        <Dialogo
          titulo={dialogo === "crear" ? "Nuevo equipo" : `Editar ${(dialogo as Equipo).codigoInterno}`}
          error={error}
          enviando={enviando}
          onCerrar={() => setDialogo(null)}
          onEnviar={guardar}
        >
          <Campo
            rotulo="Código / placa"
            valor={valores.codigo}
            onCambio={cambiar("codigo")}
            placeholder="SMW-477"
            requerido
          />
          <Selector
            rotulo="Sede"
            valor={valores.sedeId}
            onCambio={cambiar("sedeId")}
            opciones={opcionesSede(props.sedes)}
          />
          <Campo rotulo="Categoría" valor={valores.categoria} onCambio={cambiar("categoria")} />
          <Campo rotulo="Observaciones" valor={valores.descripcion} onCambio={cambiar("descripcion")} />
        </Dialogo>
      ) : null}
    </Bloque>
  );
}

/* ============ Operadores ============ */

function Operadores(props: {
  cliente: ContextoFicha["cliente"];
  sedes: Sede[];
  operadores: Operador[];
  alCambiar: () => void;
}) {
  const fuente = useFuenteAdmin();
  const [dialogo, setDialogo] = useState<"crear" | Operador | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { valores, cambiar, reiniciar } = useFormulario({
    nombre: "",
    codigo: "",
    pin: "",
    sedeId: COMPARTIDO,
  });

  const guardar = () => {
    setEnviando(true);
    const operacion =
      dialogo === "crear"
        ? fuente.crearOperador({
            clienteId: props.cliente.id,
            sedeId: valores.sedeId || null,
            nombre: valores.nombre,
            codigo: valores.codigo,
            pin: valores.pin,
          })
        : fuente.editarOperador((dialogo as Operador).id, {
            sedeId: valores.sedeId || null,
            nombre: valores.nombre,
            codigo: valores.codigo,
            ...(valores.pin ? { pin: valores.pin } : {}),
          });
    void operacion
      .then(() => {
        setDialogo(null);
        props.alCambiar();
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setEnviando(false));
  };

  return (
    <Bloque
      titulo="Operadores"
      accion={
        <Boton
          onClick={() => {
            reiniciar();
            setError(null);
            setDialogo("crear");
          }}
        >
          Nuevo operador
        </Boton>
      }
    >
      <div className="overflow-x-auto px-2 pb-3 pt-3">
        <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr>
              <Th>Operador</Th>
              <Th>Código</Th>
              <Th>Sede</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {props.operadores.map((operador) => (
              <tr key={operador.id}>
                <td className="font-semibold" style={celda}>
                  {operador.nombre}
                </td>
                <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                  {operador.codigo}
                </td>
                <td style={{ ...celda, fontSize: 12, color: TEMA.suave }}>
                  {operador.sedeNombre ?? ROTULO_COMPARTIDO}
                </td>
                <td style={celda}>
                  <ChipActivo activo={operador.activo} />
                </td>
                <td style={celda}>
                  <div className="flex" style={{ gap: 12 }}>
                    <Accion
                      onClick={() => {
                        cambiar("nombre")(operador.nombre);
                        cambiar("codigo")(operador.codigo);
                        cambiar("pin")("");
                        cambiar("sedeId")(operador.sedeId ?? COMPARTIDO);
                        setError(null);
                        setDialogo(operador);
                      }}
                    >
                      Editar
                    </Accion>
                    <Accion
                      onClick={() =>
                        void fuente
                          .editarOperador(operador.id, { activo: !operador.activo })
                          .then(props.alCambiar)
                      }
                    >
                      {operador.activo ? "Desactivar" : "Activar"}
                    </Accion>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {props.operadores.length === 0 ? (
          <p className="px-3 py-4" style={{ fontSize: 12.5, color: TEMA.suave }}>
            Sin operadores registrados para este cliente.
          </p>
        ) : null}
      </div>

      {dialogo ? (
        <Dialogo
          titulo={dialogo === "crear" ? "Nuevo operador" : `Editar ${(dialogo as Operador).nombre}`}
          error={error}
          enviando={enviando}
          onCerrar={() => setDialogo(null)}
          onEnviar={guardar}
        >
          <Campo rotulo="Nombre" valor={valores.nombre} onCambio={cambiar("nombre")} requerido />
          <Campo
            rotulo="Código (1 a 4 dígitos)"
            valor={valores.codigo}
            onCambio={cambiar("codigo")}
            requerido
          />
          <Selector
            rotulo="Sede"
            valor={valores.sedeId}
            onCambio={cambiar("sedeId")}
            opciones={opcionesSede(props.sedes)}
          />
          <Campo
            rotulo={dialogo === "crear" ? "PIN (4 dígitos)" : "PIN nuevo (dejar vacío para conservar)"}
            valor={valores.pin}
            onCambio={cambiar("pin")}
            requerido={dialogo === "crear"}
          />
        </Dialogo>
      ) : null}
    </Bloque>
  );
}

/* ============ Dispositivos ============ */

function Dispositivos(props: {
  dispositivos: Array<{
    id: string;
    sedeNombre: string;
    nombre: string | null;
    enroladoEn: string;
    ultimoVistoEn: string | null;
    activo: boolean;
  }>;
  sedes: Sede[];
  alCambiar: () => void;
}) {
  const fuente = useFuenteAdmin();
  const [codigoNuevo, setCodigoNuevo] = useState<string | null>(null);
  const [sedeCodigo, setSedeCodigo] = useState("");

  const sedesActivas = props.sedes.filter((s) => s.activo);
  const sedeElegida = sedeCodigo || sedesActivas[0]?.id || "";

  return (
    <Bloque
      titulo="Dispositivos"
      accion={
        sedesActivas.length > 0 ? (
          <div className="flex items-end" style={{ gap: 8 }}>
            {sedesActivas.length > 1 ? (
              <div style={{ minWidth: 170 }}>
                <Selector
                  rotulo="Sede del código"
                  valor={sedeElegida}
                  onCambio={setSedeCodigo}
                  opciones={sedesActivas.map((s) => ({ valor: s.id, rotulo: s.nombre }))}
                />
              </div>
            ) : null}
            <Boton
              onClick={() =>
                void fuente
                  .crearCodigo({ sedeId: sedeElegida })
                  .then((codigo) => setCodigoNuevo(codigo.codigo))
              }
            >
              Generar código
            </Boton>
          </div>
        ) : null
      }
    >
      <div className="px-5 pb-5 pt-3">
        {codigoNuevo ? (
          <div
            className="mb-3 rounded-md px-3 py-2"
            style={{
              fontSize: 12.5,
              border: `1px solid var(--cliente-primario-borde)`,
              background: "var(--cliente-primario-suave)",
            }}
          >
            Código de enrolamiento:{" "}
            <span className="font-mono font-bold" style={{ fontSize: 14 }}>
              {codigoNuevo}
            </span>{" "}
            · válido 7 días, un solo uso.
          </div>
        ) : null}
        {props.dispositivos.length === 0 ? (
          <p style={{ fontSize: 12.5, color: TEMA.suave }}>
            Sin dispositivos enrolados. Genera un código y enrólalo desde el celular de planta.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr>
                  <Th>Dispositivo</Th>
                  <Th>Sede</Th>
                  <Th>Último visto</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {props.dispositivos.map((dispositivo) => (
                  <tr key={dispositivo.id}>
                    <td className="font-semibold" style={celda}>
                      {dispositivo.nombre ?? "Sin nombre"}
                    </td>
                    <td style={{ ...celda, color: TEMA.suave }}>{dispositivo.sedeNombre}</td>
                    <td className="font-mono" style={{ ...celda, fontSize: 12, color: TEMA.suave }}>
                      {dispositivo.ultimoVistoEn
                        ? new Date(dispositivo.ultimoVistoEn).toLocaleString("es-CO")
                        : "nunca"}
                    </td>
                    <td style={celda}>
                      <ChipActivo activo={dispositivo.activo} />
                    </td>
                    <td style={celda}>
                      {dispositivo.activo ? (
                        <Accion
                          onClick={() =>
                            void fuente.reenrolarDispositivo(dispositivo.id).then(({ codigo }) => {
                              setCodigoNuevo(codigo.codigo);
                              props.alCambiar();
                            })
                          }
                        >
                          Reenrolar
                        </Accion>
                      ) : (
                        <span style={{ fontSize: 12, color: TEMA.suave }}>revocado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Bloque>
  );
}
