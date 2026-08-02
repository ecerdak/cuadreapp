// [Pestaña Equipos] Quién se salió de su patrón de consumo (spec §8.2),
// con la tabla del diseño aprobado: 6 columnas incluida "Uso", fila
// resaltada cuando el desvío es fuerte y el pie que explica qué suele
// significar un desvío.

import { useFuenteTablero } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import { Esqueleto, EstadoError, EstadoVacio, Eyebrow, Panel, Th, ZonaA } from "../componentes/basicos";
import { formatearGal } from "../componentes/numeros";
import { TEMA } from "../tema";

export function Equipos() {
  const fuente = useFuenteTablero();
  const { consulta, recargar } = useConsulta(() => fuente.resumenEquipos());

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={120} />
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

  const masDesviado = [...datos.equipos].sort(
    (a, b) => Math.abs(b.desvioPct ?? 0) - Math.abs(a.desvioPct ?? 0),
  )[0];

  return (
    <>
      <ZonaA
        veredicto={datos.veredicto}
        titulo="Desvío detectado"
        hechos={[
          ...(masDesviado && masDesviado.desvioPct !== null
            ? [
                {
                  valor: `${masDesviado.desvioPct > 0 ? "+" : ""}${masDesviado.desvioPct.toLocaleString("es-CO")}%`,
                  etiqueta: `${masDesviado.codigo} sobre su patrón`,
                  color:
                    Math.abs(masDesviado.desvioPct) >= 15
                      ? TEMA.rojo
                      : Math.abs(masDesviado.desvioPct) > 5
                        ? TEMA.ambar
                        : TEMA.suave,
                },
              ]
            : []),
          { valor: String(datos.equipos.length), etiqueta: "Equipos con consumo registrado" },
        ]}
      />
      <Panel>
        <div className="px-5 pt-5">
          <Eyebrow>Consumo por equipo · últimos 7 días</Eyebrow>
        </div>
        <div className="mt-3 overflow-x-auto px-2 pb-3">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 620 }}>
            <caption className="sr-only">Consumo por equipo y desvío contra su histórico</caption>
            <thead>
              <tr>
                <Th>Equipo</Th>
                <Th>Descripción</Th>
                <Th derecha>Galones</Th>
                <Th derecha>Uso</Th>
                <Th derecha>Rendimiento</Th>
                <Th derecha>Desvío</Th>
              </tr>
            </thead>
            <tbody>
              {datos.equipos.map((equipo) => {
                const desvio = equipo.desvioPct ?? 0;
                const alerta = Math.abs(desvio) >= 15;
                const celda = {
                  padding: "11px 12px",
                  borderBottom: `1px solid ${TEMA.lineaSuave}`,
                } as const;
                return (
                  <tr
                    key={equipo.codigo}
                    style={{ background: alerta ? `${TEMA.rojo}0F` : "transparent" }}
                  >
                    <td className="font-mono font-semibold" style={{ ...celda, fontSize: 13 }}>
                      {equipo.codigo}
                    </td>
                    <td style={{ ...celda, fontSize: 12, color: TEMA.suave }}>{equipo.descripcion}</td>
                    <td className="font-mono" style={{ ...celda, fontSize: 13, textAlign: "right" }}>
                      {formatearGal(equipo.galones7d)}
                    </td>
                    <td
                      className="font-mono"
                      style={{ ...celda, fontSize: 12, color: TEMA.suave, textAlign: "right" }}
                    >
                      {equipo.uso ?? "—"}
                    </td>
                    <td className="font-mono" style={{ ...celda, fontSize: 13, textAlign: "right" }}>
                      {equipo.rendimiento !== null
                        ? `${equipo.rendimiento.toLocaleString("es-CO")} ${equipo.medida ?? ""}`
                        : "—"}
                    </td>
                    <td style={{ ...celda, textAlign: "right" }}>
                      <span
                        className="font-mono font-semibold"
                        style={{
                          fontSize: 12.5,
                          color: alerta ? TEMA.rojo : desvio > 5 ? TEMA.ambar : TEMA.suave,
                        }}
                      >
                        {equipo.desvioPct !== null
                          ? `${desvio > 0 ? "+" : ""}${desvio.toLocaleString("es-CO")}%`
                          : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 pb-5" style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.6 }}>
          El desvío compara cada equipo contra su propia mediana histórica y contra los equipos de su
          misma clase. Un tractor que se sale del patrón suele ser inyectores, filtro, un operario que
          deja el motor encendido en las esperas — o combustible que sale del equipo por otro lado.
        </div>
      </Panel>
    </>
  );
}
