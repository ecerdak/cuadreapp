// [Dispositivos] Fin del SQL manual: generar códigos de enrolamiento,
// ver estado y último uso, revocar y reenrolar desde la consola.

import { useState } from "react";
import { useFuenteAdmin } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import type { Codigo, Sede } from "../datos/puertos";
import {
  Boton,
  ChipActivo,
  Esqueleto,
  EstadoError,
  Eyebrow,
  Panel,
  Selector,
  Th,
  celda,
  horaCorta,
} from "../ui";
import { TEMA } from "../tema";

export function Dispositivos() {
  const fuente = useFuenteAdmin();
  const { consulta, recargar } = useConsulta(async () => {
    const [dispositivos, codigos, clientes] = await Promise.all([
      fuente.dispositivos(),
      fuente.codigos(),
      fuente.clientes(),
    ]);
    const sedesPorCliente = await Promise.all(clientes.map((cliente) => fuente.sedes(cliente.id)));
    return { dispositivos, codigos, sedes: sedesPorCliente.flat(), clientes };
  });
  const [sedeId, setSedeId] = useState("");
  const [codigoNuevo, setCodigoNuevo] = useState<Codigo | null>(null);
  const [generando, setGenerando] = useState(false);

  if (consulta.estado === "cargando") return <Esqueleto alto={320} />;
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { dispositivos, codigos, sedes, clientes } = consulta.datos;
  const nombreSede = (sede: Sede) =>
    `${clientes.find((c) => c.id === sede.clienteId)?.nombre ?? "?"} · ${sede.nombre}`;

  const generar = () => {
    if (!sedeId || generando) return;
    setGenerando(true);
    void fuente
      .crearCodigo({ sedeId })
      .then((codigo) => {
        setCodigoNuevo(codigo);
        recargar();
      })
      .finally(() => setGenerando(false));
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel className="p-5">
        <Eyebrow>Generar código de enrolamiento</Eyebrow>
        <div className="mt-3 flex flex-wrap items-end" style={{ gap: 10 }}>
          <div style={{ minWidth: 280 }}>
            <Selector
              rotulo="Sede"
              valor={sedeId}
              onCambio={setSedeId}
              opciones={[
                { valor: "", rotulo: "Elige la sede…" },
                ...sedes.map((sede) => ({ valor: sede.id, rotulo: nombreSede(sede) })),
              ]}
            />
          </div>
          <Boton onClick={generar} deshabilitado={!sedeId || generando}>
            {generando ? "Generando…" : "Generar código"}
          </Boton>
        </div>
        {codigoNuevo ? (
          <div
            className="mt-4 rounded-lg p-4"
            style={{ background: `${TEMA.verde}16`, border: `1px solid ${TEMA.verde}4D` }}
          >
            <div style={{ fontSize: 12, color: TEMA.suave }}>
              Código nuevo para {codigoNuevo.sedeNombre} — un solo uso, expira{" "}
              {horaCorta(codigoNuevo.expiraEn)}:
            </div>
            <div className="mt-1 font-mono font-bold" style={{ fontSize: 26, color: TEMA.verde }}>
              {codigoNuevo.codigo}
            </div>
          </div>
        ) : null}
      </Panel>

      <Panel>
        <div className="px-5 pt-5">
          <Eyebrow>Dispositivos enrolados</Eyebrow>
        </div>
        <div className="mt-3 overflow-x-auto px-2 pb-3">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr>
                <Th>Dispositivo</Th>
                <Th>Cliente · sede</Th>
                <Th>Enrolado</Th>
                <Th>Último uso</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {dispositivos.map((dispositivo) => (
                <tr key={dispositivo.id}>
                  <td className="font-semibold" style={celda}>
                    {dispositivo.nombre ?? "Sin nombre"}
                  </td>
                  <td style={{ ...celda, color: TEMA.suave }}>
                    {dispositivo.clienteNombre} · {dispositivo.sedeNombre}
                  </td>
                  <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                    {horaCorta(dispositivo.enroladoEn)}
                  </td>
                  <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                    {horaCorta(dispositivo.ultimoVistoEn)}
                  </td>
                  <td style={celda}>
                    <ChipActivo activo={dispositivo.activo} />
                  </td>
                  <td style={celda}>
                    {dispositivo.activo ? (
                      <div className="flex" style={{ gap: 12 }}>
                        <button
                          type="button"
                          className="focus-visible:outline"
                          style={{ fontSize: 12, color: TEMA.azul }}
                          onClick={() =>
                            void fuente.reenrolarDispositivo(dispositivo.id).then(({ codigo }) => {
                              setCodigoNuevo(codigo);
                              recargar();
                            })
                          }
                        >
                          Reenrolar
                        </button>
                        <button
                          type="button"
                          className="focus-visible:outline"
                          style={{ fontSize: 12, color: TEMA.rojo }}
                          onClick={() =>
                            void fuente.desactivarDispositivo(dispositivo.id).then(recargar)
                          }
                        >
                          Revocar
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: TEMA.suave }}>revocado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dispositivos.length === 0 ? (
            <p className="px-3 py-4" style={{ fontSize: 12.5, color: TEMA.suave }}>
              Aún no hay dispositivos enrolados. Genera un código y enrola el teléfono de la operadora.
            </p>
          ) : null}
        </div>
      </Panel>

      <Panel>
        <div className="px-5 pt-5">
          <Eyebrow>Códigos de enrolamiento emitidos</Eyebrow>
        </div>
        <div className="mt-3 overflow-x-auto px-2 pb-3">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr>
                <Th>Código</Th>
                <Th>Cliente · sede</Th>
                <Th>Expira</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {codigos.map((codigo) => (
                <tr key={codigo.id}>
                  <td className="font-mono font-semibold" style={celda}>
                    {codigo.codigo}
                  </td>
                  <td style={{ ...celda, color: TEMA.suave }}>
                    {codigo.clienteNombre} · {codigo.sedeNombre}
                  </td>
                  <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                    {horaCorta(codigo.expiraEn)}
                  </td>
                  <td style={celda}>
                    <span
                      className="inline-flex items-center rounded-full font-semibold uppercase"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        padding: "3px 8px",
                        color:
                          codigo.estado === "vigente"
                            ? TEMA.verde
                            : codigo.estado === "usado"
                              ? TEMA.suave
                              : TEMA.ambar,
                        background: `${codigo.estado === "vigente" ? TEMA.verde : codigo.estado === "usado" ? TEMA.suave : TEMA.ambar}1F`,
                        border: `1px solid ${codigo.estado === "vigente" ? TEMA.verde : codigo.estado === "usado" ? TEMA.suave : TEMA.ambar}55`,
                      }}
                    >
                      {codigo.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
