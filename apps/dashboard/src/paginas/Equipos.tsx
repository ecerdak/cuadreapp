// [Pestaña Equipos] Quién se salió de su patrón de consumo (spec §8.2).
// La tabla se adapta a lo que el equipo mide: con contador muestra uso,
// rendimiento y desvío; sin contador (carrotanques, por ejemplo)
// muestra capacidad y llenado. Lo decide el DATO del equipo, no el
// cliente ni una configuración aparte.

import { useFuenteTablero } from "../datos/proveedor";
import { mensajeDeError, useTablero } from "../datos/contexto";
import { useConsulta } from "../datos/consulta";
import { Esqueleto, EstadoError, EstadoVacio, Eyebrow, Panel, Th, ZonaA } from "../componentes/basicos";
import { formatearEntero, formatearGal } from "../componentes/numeros";
import { TEMA } from "../tema";

export function Equipos() {
  const fuente = useFuenteTablero();
  const { sedeId } = useTablero();
  const { consulta, recargar } = useConsulta(() => fuente.resumenEquipos({ sedeId }), [sedeId]);

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={120} />
        <Esqueleto alto={280} />
      </div>
    );
  }
  if (consulta.estado === "error") {
    const humano = mensajeDeError(consulta.causa);
    return <EstadoError detalle={humano.frase} referencia={humano.referencia} onReintentar={recargar} />;
  }

  const { datos } = consulta;
  if (datos.equipos.length === 0) {
    return (
      <EstadoVacio
        mensaje="Sin equipos registrados"
        detalle="Lubryco registra los equipos de tu operación; aparecen aquí apenas queden listos."
      />
    );
  }

  // Con contador se mide rendimiento; sin contador, llenado del tanque.
  const hayRendimiento = datos.equipos.some((equipo) => equipo.medida !== null);
  const hayLlenado = datos.equipos.some((equipo) => equipo.llenadoPct !== null);
  const masDesviado = [...datos.equipos].sort(
    (uno, otro) => Math.abs(otro.desvioPct ?? 0) - Math.abs(uno.desvioPct ?? 0),
  )[0];

  return (
    <>
      <ZonaA
        veredicto={datos.veredicto}
        titulo={hayRendimiento ? "Desvío detectado" : "Equipos del cliente"}
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
                {hayRendimiento ? <Th derecha>Uso</Th> : null}
                {hayRendimiento ? <Th derecha>Rendimiento</Th> : null}
                {hayRendimiento ? <Th derecha>Desvío</Th> : null}
                {hayLlenado ? <Th derecha>Capacidad</Th> : null}
                {hayLlenado ? <Th derecha>Llenado</Th> : null}
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
                const suave = { ...celda, fontSize: 12, color: TEMA.suave, textAlign: "right" } as const;
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
                    {hayRendimiento ? (
                      <td className="font-mono" style={suave}>
                        {equipo.uso ?? "—"}
                      </td>
                    ) : null}
                    {hayRendimiento ? (
                      <td className="font-mono" style={{ ...celda, fontSize: 13, textAlign: "right" }}>
                        {equipo.rendimiento !== null
                          ? `${equipo.rendimiento.toLocaleString("es-CO")} ${equipo.medida ?? ""}`
                          : "—"}
                      </td>
                    ) : null}
                    {hayRendimiento ? (
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
                    ) : null}
                    {hayLlenado ? (
                      <td className="font-mono" style={suave}>
                        {equipo.capacidadTanqueGal === null
                          ? "—"
                          : `${formatearEntero(equipo.capacidadTanqueGal)} gal`}
                      </td>
                    ) : null}
                    {hayLlenado ? (
                      <td
                        className="font-mono font-semibold"
                        style={{ ...celda, fontSize: 13, textAlign: "right" }}
                      >
                        {equipo.llenadoPct === null
                          ? "—"
                          : `${equipo.llenadoPct.toLocaleString("es-CO")} %`}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {hayRendimiento ? (
          <div className="px-5 pb-5" style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.6 }}>
            El desvío compara cada equipo contra su propia mediana histórica y contra los equipos de su
            misma clase. Un tractor que se sale del patrón suele ser inyectores, filtro, un operario que
            deja el motor encendido en las esperas — o combustible que sale del equipo por otro lado.
          </div>
        ) : (
          <div className="px-5 pb-5" style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.6 }}>
            Estos equipos no llevan horómetro ni odómetro: lo que se sigue es cuánto reciben y con cuánto
            quedan frente a su capacidad.
          </div>
        )}
      </Panel>
    </>
  );
}
