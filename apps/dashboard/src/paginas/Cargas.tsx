// [Pestaña Cargas] Veredicto (X cuadran de Y) + tabla filtrable por
// estado. El filtro vive en la URL: un enlace a ?estado=inconsistente
// es compartible. Tabla en escritorio, tarjetas en móvil.

import { Link, useSearchParams } from "react-router-dom";
import type { EstadoCarga } from "@cuadreapp/dominio";
import { useFuenteTablero } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import {
  ChipEstado,
  Esqueleto,
  EstadoError,
  EstadoVacio,
  VeredictoBanner,
} from "../componentes/basicos";
import { formatearGal } from "../componentes/numeros";
import { TEMA } from "../tema";

const FILTROS: Array<{ valor: EstadoCarga | "todas"; rotulo: string }> = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "ok", rotulo: "Cuadran" },
  { valor: "advertencia", rotulo: "Con advertencia" },
  { valor: "inconsistente", rotulo: "No cuadran" },
];

export function Cargas() {
  const fuente = useFuenteTablero();
  const [parametros, setParametros] = useSearchParams();
  const estado = (parametros.get("estado") ?? "todas") as EstadoCarga | "todas";
  const { consulta, recargar } = useConsulta(() => fuente.listarCargas({ estado }), [estado]);

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={84} />
        <Esqueleto alto={320} />
      </div>
    );
  }
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { datos } = consulta;
  return (
    <div className="flex flex-col gap-4">
      <VeredictoBanner veredicto={datos.veredicto} />

      <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        {FILTROS.map((filtro) => (
          <button
            key={filtro.valor}
            type="button"
            aria-pressed={estado === filtro.valor}
            onClick={() => setParametros(filtro.valor === "todas" ? {} : { estado: filtro.valor })}
            className="rounded-full px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2"
            style={{
              background: estado === filtro.valor ? TEMA.azul : TEMA.panel,
              color: estado === filtro.valor ? "#000" : TEMA.suave,
            }}
          >
            {filtro.rotulo}
          </button>
        ))}
      </div>

      {datos.cargas.length === 0 ? (
        <EstadoVacio mensaje="No hay cargas con este filtro" detalle="Prueba con otro estado." />
      ) : (
        <>
          {/* Escritorio: tabla completa */}
          <div className="hidden overflow-x-auto rounded-xl md:block" style={{ background: TEMA.panel }}>
            <table className="w-full text-sm">
              <caption className="sr-only">Detalle de cargas de los últimos 14 días</caption>
              <thead>
                <tr className="text-left" style={{ color: TEMA.suave }}>
                  {["Fecha", "Hora", "Equipo", "Conductor", "Galones", "Estado", ""].map((titulo) => (
                    <th key={titulo} scope="col" className="px-3 py-2.5 font-semibold">
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.cargas.map((carga) => (
                  <tr key={carga.id} style={{ borderTop: `1px solid ${TEMA.linea}` }}>
                    <td className="px-3 py-2.5 tabular-nums">{carga.fecha}</td>
                    <td className="px-3 py-2.5 tabular-nums">{carga.hora}</td>
                    <td className="px-3 py-2.5 font-bold">{carga.equipoCodigo}</td>
                    <td className="px-3 py-2.5">{carga.conductorNombre}</td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                      {formatearGal(carga.galones)}
                    </td>
                    <td className="px-3 py-2.5">
                      <ChipEstado estado={carga.estado} />
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        to={`/cargas/${carga.id}`}
                        className="font-semibold focus-visible:outline"
                        style={{ color: TEMA.azul }}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Móvil: tarjetas */}
          <ul className="flex flex-col gap-2 md:hidden">
            {datos.cargas.map((carga) => (
              <li key={carga.id}>
                <Link
                  to={`/cargas/${carga.id}`}
                  className="block rounded-xl p-3 focus-visible:outline focus-visible:outline-2"
                  style={{ background: TEMA.panel }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{carga.equipoCodigo}</span>
                    <ChipEstado estado={carga.estado} />
                  </div>
                  <div
                    className="mt-1 flex items-center justify-between text-sm"
                    style={{ color: TEMA.suave }}
                  >
                    <span>
                      {carga.fecha} · {carga.hora} · {carga.conductorNombre}
                    </span>
                    <span className="font-bold tabular-nums" style={{ color: TEMA.texto }}>
                      {formatearGal(carga.galones)} gal
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
