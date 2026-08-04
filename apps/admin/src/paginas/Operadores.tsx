// [Operadores] Operadores y conductores (mismo modelo: la persona que
// se identifica con código+PIN al registrar cargas). Crear con PIN,
// rotar PIN, activar/desactivar, buscar. El PIN jamás se muestra:
// solo se asigna.

import { useState } from "react";
import { useFuenteAdmin } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import type { Operador } from "../datos/puertos";
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
  horaCorta,
  useFormulario,
} from "../ui";
import { TEMA } from "../tema";

export function Operadores() {
  const fuente = useFuenteAdmin();
  const [buscar, setBuscar] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  const { consulta, recargar } = useConsulta(
    async () => ({
      clientes: await fuente.clientes(),
      operadores: await fuente.operadores({ buscar: buscar || undefined }),
    }),
    [buscar],
  );

  const [dialogo, setDialogo] = useState<"crear" | Operador | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { valores, cambiar, reiniciar } = useFormulario({
    clienteId: "",
    nombre: "",
    codigo: "",
    pin: "",
  });

  const guardar = () => {
    if (dialogo === "crear" && !/^\d{4}$/.test(valores.pin)) {
      setError("El PIN debe ser de 4 dígitos.");
      return;
    }
    setEnviando(true);
    const operacion =
      dialogo === "crear"
        ? fuente.crearOperador({
            clienteId: valores.clienteId,
            // Vista global: nace compartido entre sedes; se asigna en
            // la ficha del cliente → Operación (DEC-018).
            sedeId: null,
            nombre: valores.nombre,
            codigo: valores.codigo,
            pin: valores.pin,
          })
        : fuente.editarOperador((dialogo as Operador).id, {
            nombre: valores.nombre,
            codigo: valores.codigo,
            ...(valores.pin ? { pin: valores.pin } : {}),
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

  const { clientes, operadores } = consulta.datos;
  const visibles = operadores.filter((o) => !soloActivos || o.activo);

  return (
    <div className="flex flex-col gap-4">
      <BarraBusqueda
        buscar={buscar}
        onBuscar={setBuscar}
        soloActivos={soloActivos}
        onSoloActivos={setSoloActivos}
        accion={
          <Boton
            onClick={() => {
              reiniciar();
              cambiar("clienteId")(clientes[0]?.id ?? "");
              setError(null);
              setDialogo("crear");
            }}
          >
            Nuevo operador
          </Boton>
        }
      />
      <Panel>
        <div className="overflow-x-auto px-2 pb-2 pt-2">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Código</Th>
                <Th>Cliente</Th>
                <Th>Último acceso (última carga)</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((operador) => (
                <tr key={operador.id}>
                  <td className="font-semibold" style={celda}>
                    {operador.nombre}
                  </td>
                  <td className="font-mono" style={celda}>
                    {operador.codigo}
                  </td>
                  <td style={{ ...celda, color: TEMA.suave }}>{operador.clienteNombre}</td>
                  <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                    {horaCorta(operador.ultimaCargaEn)}
                  </td>
                  <td style={celda}>
                    <ChipActivo activo={operador.activo} />
                  </td>
                  <td style={celda}>
                    <div className="flex" style={{ gap: 12 }}>
                      <button
                        type="button"
                        className="focus-visible:outline"
                        style={{ fontSize: 12, color: TEMA.azul }}
                        onClick={() => {
                          cambiar("clienteId")(operador.clienteId);
                          cambiar("nombre")(operador.nombre);
                          cambiar("codigo")(operador.codigo);
                          cambiar("pin")("");
                          setError(null);
                          setDialogo(operador);
                        }}
                      >
                        Editar / PIN
                      </button>
                      <button
                        type="button"
                        className="focus-visible:outline"
                        style={{ fontSize: 12, color: TEMA.azul }}
                        onClick={() =>
                          void fuente
                            .editarOperador(operador.id, { activo: !operador.activo })
                            .then(recargar)
                        }
                      >
                        {operador.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibles.length === 0 ? (
            <p className="px-3 py-4" style={{ fontSize: 12.5, color: TEMA.suave }}>
              Sin operadores para este filtro.
            </p>
          ) : null}
        </div>
      </Panel>

      {dialogo ? (
        <Dialogo
          titulo={dialogo === "crear" ? "Nuevo operador" : `Editar ${(dialogo as Operador).nombre}`}
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
          <Campo rotulo="Nombre" valor={valores.nombre} onCambio={cambiar("nombre")} requerido />
          <Campo
            rotulo="Código (con el que se identifica en la app)"
            valor={valores.codigo}
            onCambio={cambiar("codigo")}
            placeholder="01"
            requerido
          />
          <Campo
            rotulo={dialogo === "crear" ? "PIN (4 dígitos)" : "Nuevo PIN (vacío = no cambiar)"}
            valor={valores.pin}
            onCambio={cambiar("pin")}
            tipo="password"
            placeholder="••••"
          />
        </Dialogo>
      ) : null}
    </div>
  );
}
