// [Pestaña Suministro] Reabastecimiento: entregas de Lubryco y el
// balance entregado − despachado = en tanque.
//
// Mientras no exista el registro de entregas (Etapa 3), la pestaña
// muestra su estado vacío honesto y el balance en «—». Deliberado: la
// existencia estimada necesita una línea base, y una cifra que el
// supervisor no pueda auditar es peor que no mostrar ninguna.

import { useFuenteTablero } from "../datos/proveedor";
import { mensajeDeError, useTablero } from "../datos/contexto";
import { useConsulta } from "../datos/consulta";
import { Esqueleto, EstadoError, EstadoVacio, Eyebrow, Panel, Th, ZonaA } from "../componentes/basicos";
import { formatearEntero } from "../componentes/numeros";
import { TEMA } from "../tema";

const gal = (valor: number | null): string => (valor === null ? "—" : `${formatearEntero(valor)} gal`);

export function Suministro() {
  const fuente = useFuenteTablero();
  const { sedeId } = useTablero();
  const { consulta, recargar } = useConsulta(() => fuente.resumenSuministro({ sedeId }), [sedeId]);

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={160} />
        <Esqueleto alto={200} />
      </div>
    );
  }
  if (consulta.estado === "error")
    return <EstadoError detalle={mensajeDeError(consulta.detalle)} onReintentar={recargar} />;

  const { datos } = consulta;
  const { balance } = datos;
  const ultima = datos.entregas[0];

  return (
    <>
      <ZonaA
        veredicto={datos.veredicto}
        titulo="Reabastecimiento"
        hechos={[
          ...(ultima
            ? [
                {
                  valor: ultima.fecha,
                  etiqueta: `Última entrega · ${formatearEntero(ultima.galones)} gal`,
                },
              ]
            : []),
          {
            valor:
              balance.autonomiaDias === null
                ? "—"
                : `${balance.autonomiaDias.toLocaleString("es-CO")} días`,
            etiqueta: "Autonomía restante",
            color:
              balance.autonomiaDias === null
                ? TEMA.suave
                : balance.autonomiaDias <= 4
                  ? TEMA.rojo
                  : balance.autonomiaDias <= 7
                    ? TEMA.ambar
                    : TEMA.texto,
          },
          ...(datos.pedidoSugeridoGal !== null && datos.pedidoSugeridoGal > 0
            ? [
                {
                  valor: `${formatearEntero(datos.pedidoSugeridoGal)} gal`,
                  etiqueta: "Pedido sugerido",
                },
              ]
            : []),
        ]}
        derecha={
          <div
            className="rounded-md p-4"
            style={{ background: TEMA.panelAlto, border: `1px solid ${TEMA.linea}`, minWidth: 210 }}
          >
            <Eyebrow>Balance de suministro</Eyebrow>
            <div className="mt-3 flex flex-col" style={{ gap: 7, fontSize: 12 }}>
              <div className="flex justify-between">
                <span style={{ color: TEMA.suave }}>Entregado</span>
                <span className="font-mono">{gal(balance.entregadoTotalGal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: TEMA.suave }}>Despachado</span>
                <span className="font-mono">− {gal(balance.despachadoTotalGal)}</span>
              </div>
              <div
                className="flex justify-between pt-2"
                style={{ borderTop: `1px solid ${TEMA.linea}` }}
              >
                <span style={{ color: TEMA.texto }}>En tanque</span>
                <span className="font-mono font-semibold" style={{ color: TEMA.amarillo }}>
                  {gal(balance.existenciaEstimadaGal)}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 10.5, color: TEMA.suave, marginTop: 10, lineHeight: 1.5 }}>
              {balance.existenciaEstimadaGal === null
                ? "La existencia se calcula desde la primera entrega registrada."
                : "Cifra estimada. Se confirma con aforo del tanque; margen esperado ±2 %."}
            </div>
          </div>
        }
      />
      <Panel>
        <div className="px-5 pt-5">
          <Eyebrow>Entregas de Lubryco</Eyebrow>
        </div>
        {datos.entregas.length === 0 ? (
          <div className="p-5">
            <EstadoVacio
              mensaje="Sin entregas registradas"
              detalle="Cada entrega llega con la lectura y la foto del medidor del carrotanque; aparecerán aquí en cuanto se registren."
            />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto px-2 pb-3">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 520 }}>
              <caption className="sr-only">Entregas de combustible de Lubryco</caption>
              <thead>
                <tr>
                  <Th>Remisión</Th>
                  <Th>Fecha</Th>
                  <Th derecha>Galones</Th>
                  <Th>Carrotanque</Th>
                  <Th>Recibido por</Th>
                </tr>
              </thead>
              <tbody>
                {datos.entregas.map((entrega) => {
                  const celda = {
                    padding: "11px 12px",
                    borderBottom: `1px solid ${TEMA.lineaSuave}`,
                  } as const;
                  return (
                    <tr key={entrega.numeroRemision}>
                      <td className="font-mono font-semibold" style={{ ...celda, fontSize: 13 }}>
                        {entrega.numeroRemision}
                      </td>
                      <td style={{ ...celda, fontSize: 12, color: TEMA.suave }}>{entrega.fecha}</td>
                      <td
                        className="font-mono font-semibold"
                        style={{ ...celda, fontSize: 13, textAlign: "right" }}
                      >
                        {formatearEntero(entrega.galones)}
                      </td>
                      <td className="font-mono" style={{ ...celda, fontSize: 12, color: TEMA.suave }}>
                        {entrega.placaCarrotanque ?? "—"}
                      </td>
                      <td style={{ ...celda, fontSize: 12, color: TEMA.suave }}>
                        {entrega.recibidoPor ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 pb-5" style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.6 }}>
          Cada entrega llega con la lectura y la foto del medidor del carrotanque. El galón que Lubryco
          factura y el galón que entra al tanque son el mismo número, verificable por las dos partes.
        </div>
      </Panel>
    </>
  );
}
