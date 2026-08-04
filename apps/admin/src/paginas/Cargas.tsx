// [Cargas] Tabla operativa de cargas recientes con filtro por cliente,
// observaciones y acceso a la evidencia (vía tablero del cliente).

import { useState } from "react";
import { useFuenteAdmin } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import {
  ChipEstado,
  Esqueleto,
  EstadoError,
  Eyebrow,
  Panel,
  Selector,
  Th,
  celda,
  gal,
  horaCorta,
} from "../ui";
import { TEMA } from "../tema";

export function Cargas() {
  const fuente = useFuenteAdmin();
  const [clienteId, setClienteId] = useState("");
  const { consulta, recargar } = useConsulta(
    async () => ({
      clientes: await fuente.clientes(),
      cargas: await fuente.cargas({ clienteId: clienteId || undefined, limite: 60 }),
    }),
    [clienteId],
  );

  if (consulta.estado === "cargando") return <Esqueleto alto={380} />;
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { clientes, cargas } = consulta.datos;
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
      <Panel>
        <div className="px-5 pt-5">
          <Eyebrow>Cargas recientes · sincronizadas desde los dispositivos</Eyebrow>
        </div>
        <div className="mt-3 overflow-x-auto px-2 pb-3">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr>
                <Th>Hora</Th>
                <Th>Cliente</Th>
                <Th>Sede</Th>
                <Th>Equipo</Th>
                <Th>Operador</Th>
                <Th derecha>Galones</Th>
                <Th>Estado</Th>
                <Th>Observaciones</Th>
                <Th derecha>Fotos</Th>
              </tr>
            </thead>
            <tbody>
              {cargas.map((carga) => (
                <tr key={carga.id}>
                  <td className="font-mono" style={celda}>
                    {horaCorta(carga.registradaEn)}
                  </td>
                  <td style={{ ...celda, color: TEMA.suave }}>{carga.clienteNombre}</td>
                  <td style={{ ...celda, color: TEMA.suave }}>{carga.sedeNombre}</td>
                  <td className="font-mono font-semibold" style={celda}>
                    {carga.equipoCodigo}
                  </td>
                  <td style={{ ...celda, color: TEMA.suave }}>{carga.operadorNombre}</td>
                  <td className="font-mono font-semibold" style={{ ...celda, textAlign: "right" }}>
                    {gal(carga.galones)}
                  </td>
                  <td style={celda}>
                    <ChipEstado estado={carga.estado} />
                  </td>
                  <td style={{ ...celda, color: TEMA.suave, maxWidth: 220 }}>
                    {carga.notas ?? (carga.banderas.length > 0 ? carga.banderas.join(", ") : "—")}
                  </td>
                  <td className="font-mono" style={{ ...celda, textAlign: "right" }}>
                    {carga.fotos.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cargas.length === 0 ? (
            <p className="px-3 py-4" style={{ fontSize: 12.5, color: TEMA.suave }}>
              Sin cargas para este filtro.
            </p>
          ) : null}
        </div>
        <p className="px-5 pb-4" style={{ fontSize: 11, color: TEMA.suave }}>
          La evidencia fotográfica se consulta en el tablero del cliente (pestaña Tablero).
        </p>
      </Panel>
    </div>
  );
}
