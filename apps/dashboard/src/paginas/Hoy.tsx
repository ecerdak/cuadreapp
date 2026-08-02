// [Pestaña Hoy] La composición del diseño aprobado: ZonaA con el
// veredicto y sus hechos, el panel del totalizador con el Rodillo y el
// desglose, el gráfico de 14 días y las cargas del día con el borde
// izquierdo de color. Única pestaña con polling (60 s, pausado si la
// pestaña no está visible).

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useFuenteTablero } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import {
  Chip,
  Esqueleto,
  EstadoError,
  EstadoVacio,
  Eyebrow,
  Panel,
  ZonaA,
} from "../componentes/basicos";
import { GraficoConsumo, Rodillo } from "../componentes/medidor";
import { formatearEntero, formatearGal } from "../componentes/numeros";
import { MEDIDOR } from "../datos/contexto-cliente";
import { COLOR_ESTADO, TEMA } from "../tema";

export function Hoy() {
  const fuente = useFuenteTablero();
  const { consulta, recargar } = useConsulta(() => fuente.resumenHoy());

  useEffect(() => {
    const temporizador = setInterval(() => {
      if (document.visibilityState === "visible") recargar();
    }, 60_000);
    return () => clearInterval(temporizador);
  }, [recargar]);

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={120} />
        <div className="grid gap-4 lg:grid-cols-3">
          <Esqueleto alto={220} />
          <div className="lg:col-span-2">
            <Esqueleto alto={220} />
          </div>
        </div>
        <Esqueleto alto={180} />
      </div>
    );
  }
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { datos } = consulta;
  return (
    <>
      <ZonaA
        veredicto={datos.veredicto}
        titulo="Acción de hoy"
        hechos={[
          {
            valor: `${formatearEntero(datos.existenciaEstimadaGal)} gal`,
            etiqueta: "Existencia estimada en tanque",
          },
          {
            valor: `${formatearEntero(datos.consumoDiarioGal)} gal/día`,
            etiqueta: "Consumo promedio, últimos 7 días",
          },
          ...(datos.galSinRegistrarGal > 0
            ? [
                {
                  valor: `${formatearEntero(datos.galSinRegistrarGal)} gal`,
                  etiqueta: "Despachados sin equipo asignado",
                  color: TEMA.rojo,
                },
              ]
            : []),
        ]}
        derecha={
          <div className="flex flex-col items-end" style={{ gap: 8 }}>
            <span style={{ fontSize: 11, color: TEMA.suave }}>
              Actualizado{" "}
              {consulta.actualizadoEn.toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              type="button"
              onClick={recargar}
              className="rounded-md font-semibold focus-visible:outline focus-visible:outline-2"
              style={{ background: TEMA.amarillo, color: "#12202C", padding: "12px 20px", fontSize: 14 }}
            >
              Actualizar
            </button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5">
          <Eyebrow>Totalizador del medidor</Eyebrow>
          <div className="mt-3">
            <Rodillo valor={datos.totalizadorGal} enteros={6} alto={40} />
          </div>
          <div className="mt-3" style={{ fontSize: 12, color: TEMA.suave, lineHeight: 1.6 }}>
            Galones acumulados desde que se instaló el dispensador el {MEDIDOR.instalado}. Este número no
            se puede resetear: es la única cifra que no depende de nadie.
          </div>
          <div
            className="mt-4 flex justify-between pt-4"
            style={{ borderTop: `1px solid ${TEMA.lineaSuave}` }}
          >
            <div>
              <div className="font-mono font-semibold" style={{ fontSize: 15 }}>
                {formatearEntero(datos.entregadoTotalGal)} gal
              </div>
              <div style={{ fontSize: 11, color: TEMA.suave }}>Entregado por Lubryco</div>
            </div>
            <div>
              <div className="font-mono font-semibold" style={{ fontSize: 15 }}>
                {formatearEntero(datos.despachadoTotalGal)} gal
              </div>
              <div style={{ fontSize: 11, color: TEMA.suave }}>Despachado a equipos</div>
            </div>
          </div>
        </Panel>

        <Panel className="p-5 lg:col-span-2">
          <Eyebrow>Consumo diario · últimos 14 días</Eyebrow>
          <div className="mt-5">
            <GraficoConsumo dias={datos.consumo14d} />
          </div>
          <div className="mt-3" style={{ fontSize: 11, color: TEMA.suave }}>
            El día de hoy va parcial.
          </div>
        </Panel>
      </div>

      <Panel className="mt-4 p-5">
        <Eyebrow>
          Cargas de hoy · {datos.cargasDeHoy.length} registrada
          {datos.cargasDeHoy.length === 1 ? "" : "s"}
        </Eyebrow>
        {datos.cargasDeHoy.length === 0 ? (
          <div className="mt-4">
            <EstadoVacio
              mensaje="Aún no hay cargas hoy"
              detalle="Las cargas del conductor aparecen aquí apenas sincronizan."
            />
          </div>
        ) : (
          <div className="mt-4 flex flex-col" style={{ gap: 8 }}>
            {datos.cargasDeHoy.map((carga) => (
              <Link
                key={carga.id}
                to={`/cargas/${carga.id}`}
                className="flex flex-wrap items-center rounded-md px-3 py-3 focus-visible:outline focus-visible:outline-2"
                style={{
                  background: TEMA.panelAlto,
                  gap: 14,
                  borderLeft: `2px solid ${COLOR_ESTADO[carga.estado]}`,
                }}
              >
                <span className="font-mono" style={{ fontSize: 12, color: TEMA.suave, width: 42 }}>
                  {carga.hora}
                </span>
                <span className="font-mono font-semibold" style={{ fontSize: 13, width: 54 }}>
                  {carga.equipoCodigo}
                </span>
                <span style={{ fontSize: 12, color: TEMA.suave, flex: 1, minWidth: 150 }}>
                  {carga.equipoDescripcion} · {carga.conductorNombre}
                </span>
                <span
                  className="font-mono font-semibold"
                  style={{ fontSize: 14, width: 74, textAlign: "right" }}
                >
                  {formatearGal(carga.galones)} gal
                </span>
                <Chip estado={carga.estado} />
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
