// [Resumen] Dashboard administrativo operativo: indicadores del día,
// alertas y las cargas recientes de todos los clientes.

import { Link } from "react-router-dom";
import { useFuenteAdmin } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import { ChipEstado, Esqueleto, EstadoError, Eyebrow, Panel, Th, celda, gal, horaCorta } from "../ui";
import { TEMA } from "../tema";

function Indicador(props: { rotulo: string; valor: string; color?: string }) {
  return (
    <Panel className="p-4">
      <Eyebrow>{props.rotulo}</Eyebrow>
      <div
        className="mt-1 font-mono font-semibold"
        style={{ fontSize: 24, color: props.color ?? TEMA.texto }}
      >
        {props.valor}
      </div>
    </Panel>
  );
}

export function Resumen() {
  const fuente = useFuenteAdmin();
  const { consulta, recargar } = useConsulta(async () => ({
    resumen: await fuente.resumen(),
    cargas: await fuente.cargas({ limite: 15 }),
  }));

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={110} />
        <Esqueleto alto={300} />
      </div>
    );
  }
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { resumen, cargas } = consulta.datos;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Indicador rotulo="Cargas hoy" valor={String(resumen.cargasHoy)} />
        <Indicador rotulo="Galones hoy" valor={gal(resumen.galonesHoy)} />
        <Indicador rotulo="Clientes activos" valor={String(resumen.clientesActivos)} />
        <Indicador rotulo="Equipos activos" valor={String(resumen.equiposActivos)} />
        <Indicador rotulo="Operadores" valor={String(resumen.operadoresActivos)} />
        <Indicador
          rotulo="Alertas"
          valor={String(resumen.alertas.length)}
          color={resumen.alertas.length > 0 ? TEMA.ambar : TEMA.verde}
        />
      </div>

      {resumen.alertas.length > 0 ? (
        <Panel className="p-4" alto>
          <Eyebrow color={TEMA.ambar}>Alertas</Eyebrow>
          <ul className="mt-2 flex flex-col" style={{ gap: 6 }}>
            {resumen.alertas.map((alerta, indice) => (
              <li key={indice} style={{ fontSize: 12.5, color: TEMA.texto }}>
                <span style={{ color: TEMA.ambar }}>!</span> {alerta.mensaje}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel>
        <div className="flex items-baseline justify-between px-5 pt-5">
          <Eyebrow>Cargas recientes · todos los clientes</Eyebrow>
          <Link
            to="/cargas"
            className="focus-visible:outline"
            style={{ fontSize: 12, color: TEMA.azul }}
          >
            Ver todas
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto px-2 pb-3">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr>
                <Th>Hora</Th>
                <Th>Cliente</Th>
                <Th>Equipo</Th>
                <Th>Operador</Th>
                <Th derecha>Galones</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {cargas.map((carga) => (
                <tr key={carga.id}>
                  <td className="font-mono" style={celda}>
                    {horaCorta(carga.registradaEn)}
                  </td>
                  <td style={{ ...celda, color: TEMA.suave }}>{carga.clienteNombre}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
          {cargas.length === 0 ? (
            <p className="px-3 py-4" style={{ fontSize: 12.5, color: TEMA.suave }}>
              Aún no hay cargas registradas.
            </p>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
