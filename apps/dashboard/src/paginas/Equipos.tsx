// [Pestaña Equipos] Quién se salió de su patrón de consumo (spec §8.2).

import { useFuenteTablero } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import { Esqueleto, EstadoError, EstadoVacio, VeredictoBanner } from "../componentes/basicos";
import { formatearGal } from "../componentes/numeros";
import { TEMA } from "../tema";

export function Equipos() {
  const fuente = useFuenteTablero();
  const { consulta, recargar } = useConsulta(() => fuente.resumenEquipos());

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={84} />
        <Esqueleto alto={280} />
      </div>
    );
  }
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { datos } = consulta;
  if (datos.equipos.length === 0) {
    return (
      <EstadoVacio
        mensaje="Sin equipos registrados"
        detalle="Los equipos aparecen aquí al configurar la sede."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <VeredictoBanner veredicto={datos.veredicto} />

      <div className="overflow-x-auto rounded-xl" style={{ background: TEMA.panel }}>
        <table className="w-full text-sm">
          <caption className="sr-only">Consumo por equipo y desvío contra su histórico</caption>
          <thead>
            <tr className="text-left" style={{ color: TEMA.suave }}>
              {["Equipo", "Descripción", "Gal · 7 días", "Rendimiento", "Desvío %"].map((titulo) => (
                <th key={titulo} scope="col" className="px-3 py-2.5 font-semibold">
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.equipos.map((equipo) => {
              const desvio = equipo.desvioPct ?? 0;
              const colorDesvio = Math.abs(desvio) >= 10 ? TEMA.ambar : TEMA.suave;
              return (
                <tr key={equipo.codigo} style={{ borderTop: `1px solid ${TEMA.linea}` }}>
                  <td className="px-3 py-2.5 font-bold">{equipo.codigo}</td>
                  <td className="px-3 py-2.5" style={{ color: TEMA.suave }}>
                    {equipo.descripcion}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                    {formatearGal(equipo.galones7d)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {equipo.rendimiento !== null
                      ? `${equipo.rendimiento.toLocaleString("es-CO")} ${equipo.medida}`
                      : "—"}
                  </td>
                  <td
                    className="px-3 py-2.5 text-right font-bold tabular-nums"
                    style={{ color: colorDesvio }}
                  >
                    {equipo.desvioPct !== null
                      ? `${desvio > 0 ? "+" : ""}${desvio.toLocaleString("es-CO")}%`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs" style={{ color: TEMA.suave }}>
        El desvío compara el rendimiento reciente contra la mediana histórica de cada equipo. Variaciones
        menores al 2% son la imprecisión normal del medidor, no un problema.
      </p>
    </div>
  );
}
