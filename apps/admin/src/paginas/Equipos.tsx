// [Equipos] Carrotanques y demás equipos por cliente: crear, editar,
// activar/desactivar, buscar, filtrar. La placa del carrotanque es el
// código interno (así se identifica en campo); observaciones van en la
// descripción.

import { useState } from "react";
import { useFuenteAdmin } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import type { Equipo } from "../datos/puertos";
import {
  BarraBusqueda,
  Boton,
  Campo,
  ChipActivo,
  Dialogo,
  Esqueleto,
  EstadoError,
  Panel,
  Selector,
  Th,
  celda,
  useFormulario,
} from "../ui";
import { TEMA } from "../tema";

export function Equipos() {
  const fuente = useFuenteAdmin();
  const [buscar, setBuscar] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  const [clienteId, setClienteId] = useState("");
  const { consulta, recargar } = useConsulta(
    async () => ({
      clientes: await fuente.clientes(),
      equipos: await fuente.equipos({ clienteId: clienteId || undefined, buscar: buscar || undefined }),
    }),
    [buscar, clienteId],
  );

  const [dialogo, setDialogo] = useState<"crear" | Equipo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { valores, cambiar, reiniciar } = useFormulario({
    clienteId: "",
    codigo: "",
    categoria: "Carrotanque",
    descripcion: "",
  });

  const guardar = () => {
    setEnviando(true);
    const operacion =
      dialogo === "crear"
        ? fuente.crearEquipo({
            clienteId: valores.clienteId,
            codigoInterno: valores.codigo,
            categoria: valores.categoria || null,
            descripcion: valores.descripcion || null,
          })
        : fuente.editarEquipo((dialogo as Equipo).id, {
            codigoInterno: valores.codigo,
            categoria: valores.categoria || null,
            descripcion: valores.descripcion || null,
          });
    void operacion
      .then(() => {
        setDialogo(null);
        recargar();
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setEnviando(false));
  };

  if (consulta.estado === "cargando") return <Esqueleto alto={300} />;
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { clientes, equipos } = consulta.datos;
  const visibles = equipos.filter((e) => !soloActivos || e.activo);

  return (
    <div className="flex flex-col gap-4">
      <div style={{ maxWidth: 280 }}>
        <Selector
          rotulo="Cliente"
          valor={clienteId}
          onCambio={setClienteId}
          opciones={[
            { valor: "", rotulo: "Todos" },
            ...clientes.map((cliente) => ({ valor: cliente.id, rotulo: cliente.nombre })),
          ]}
        />
      </div>
      <BarraBusqueda
        buscar={buscar}
        onBuscar={setBuscar}
        soloActivos={soloActivos}
        onSoloActivos={setSoloActivos}
        accion={
          <Boton
            onClick={() => {
              reiniciar();
              cambiar("clienteId")(clienteId || clientes[0]?.id || "");
              setError(null);
              setDialogo("crear");
            }}
          >
            Nuevo equipo
          </Boton>
        }
      />
      <Panel>
        <div className="overflow-x-auto px-2 pb-2 pt-2">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr>
                <Th>Código / placa</Th>
                <Th>Cliente</Th>
                <Th>Categoría</Th>
                <Th>Observaciones</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((equipo) => (
                <tr key={equipo.id}>
                  <td className="font-mono font-semibold" style={celda}>
                    {equipo.codigoInterno}
                  </td>
                  <td style={{ ...celda, color: TEMA.suave }}>{equipo.clienteNombre}</td>
                  <td style={{ ...celda, color: TEMA.suave }}>{equipo.categoria ?? "—"}</td>
                  <td style={{ ...celda, color: TEMA.suave, maxWidth: 260 }}>
                    {equipo.descripcion ?? "—"}
                  </td>
                  <td style={celda}>
                    <ChipActivo activo={equipo.activo} />
                  </td>
                  <td style={celda}>
                    <div className="flex" style={{ gap: 12 }}>
                      <button
                        type="button"
                        className="focus-visible:outline"
                        style={{ fontSize: 12, color: TEMA.azul }}
                        onClick={() => {
                          cambiar("clienteId")(equipo.clienteId);
                          cambiar("codigo")(equipo.codigoInterno);
                          cambiar("categoria")(equipo.categoria ?? "");
                          cambiar("descripcion")(equipo.descripcion ?? "");
                          setError(null);
                          setDialogo(equipo);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="focus-visible:outline"
                        style={{ fontSize: 12, color: TEMA.azul }}
                        onClick={() =>
                          void fuente.editarEquipo(equipo.id, { activo: !equipo.activo }).then(recargar)
                        }
                      >
                        {equipo.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibles.length === 0 ? (
            <p className="px-3 py-4" style={{ fontSize: 12.5, color: TEMA.suave }}>
              Sin equipos para este filtro.
            </p>
          ) : null}
        </div>
      </Panel>

      {dialogo ? (
        <Dialogo
          titulo={dialogo === "crear" ? "Nuevo equipo" : `Editar ${(dialogo as Equipo).codigoInterno}`}
          error={error}
          enviando={enviando}
          onCerrar={() => setDialogo(null)}
          onEnviar={guardar}
        >
          {dialogo === "crear" ? (
            <Selector
              rotulo="Cliente"
              valor={valores.clienteId}
              onCambio={cambiar("clienteId")}
              opciones={clientes.map((cliente) => ({ valor: cliente.id, rotulo: cliente.nombre }))}
            />
          ) : null}
          <Campo
            rotulo="Código / placa"
            valor={valores.codigo}
            onCambio={cambiar("codigo")}
            placeholder="SMW-477"
            requerido
          />
          <Campo rotulo="Categoría" valor={valores.categoria} onCambio={cambiar("categoria")} />
          <Campo rotulo="Observaciones" valor={valores.descripcion} onCambio={cambiar("descripcion")} />
        </Dialogo>
      ) : null}
    </div>
  );
}
