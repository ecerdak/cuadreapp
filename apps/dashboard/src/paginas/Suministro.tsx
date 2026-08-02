// [Pestaña Suministro] La composición del diseño aprobado: ZonaA de
// reabastecimiento con la tarjeta de balance a la derecha (entregado −
// despachado = en tanque) y la tabla de remisiones con "Recibido por".

import { useFuenteTablero } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import { Esqueleto, EstadoError, EstadoVacio, Eyebrow, Panel, Th, ZonaA } from "../componentes/basicos";
import { formatearEntero } from "../componentes/numeros";
import { TEMA } from "../tema";

export function Suministro() {
  const fuente = useFuenteTablero();
  const { consulta, recargar } = useConsulta(() => fuente.resumenSuministro());

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={160} />
        <Esqueleto alto={200} />
      </div>
    );
  }
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { datos } = consulta;
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
            valor: `${datos.autonomiaDias.toLocaleString("es-CO")} días`,
            etiqueta: "Autonomía restante",
            color:
              datos.autonomiaDias <= 4 ? TEMA.rojo : datos.autonomiaDias <= 7 ? TEMA.ambar : TEMA.texto,
          },
          ...(datos.pedidoSugeridoGal > 0
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
                <span className="font-mono">{formatearEntero(datos.entregadoTotalGal)} gal</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: TEMA.suave }}>Despachado</span>
                <span className="font-mono">− {formatearEntero(datos.despachadoTotalGal)} gal</span>
              </div>
              <div
                className="flex justify-between pt-2"
                style={{ borderTop: `1px solid ${TEMA.linea}` }}
              >
                <span style={{ color: TEMA.texto }}>En tanque</span>
                <span className="font-mono font-semibold" style={{ color: TEMA.amarillo }}>
                  {formatearEntero(datos.existenciaEstimadaGal)} gal
                </span>
              </div>
            </div>
            <div style={{ fontSize: 10.5, color: TEMA.suave, marginTop: 10, lineHeight: 1.5 }}>
              Cifra estimada. Se confirma con aforo del tanque; margen esperado ±2 %.
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
            <EstadoVacio mensaje="Sin entregas registradas" />
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
                        {entrega.placaCarrotanque}
                      </td>
                      <td style={{ ...celda, fontSize: 12, color: TEMA.suave }}>
                        {entrega.recibidoPor}
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
