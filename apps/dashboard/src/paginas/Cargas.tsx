// [Pestaña Cargas] Maestro-detalle: tabla seleccionable a la izquierda,
// panel de evidencia a la derecha. La ruta /cargas/:id selecciona la
// fila (deep-link conservado) y el filtro por estado vive en la URL.
//
// Dos cosas las decide el perfil, no esta página: las columnas de
// cifras de la tabla (el cliente puede medir galones, o llegada y total
// al salir) y la vista de evidencia — esta última por el SNAPSHOT de
// cada carga, no por el perfil actual del cliente.

import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { EstadoCarga } from "@cuadreapp/dominio";
import { useFuenteTablero } from "../datos/proveedor";
import { mensajeDeError, useTablero, type ErrorHumano } from "../datos/contexto";
import { useConsulta } from "../datos/consulta";
import {
  BotonExcel,
  Chip,
  Esqueleto,
  EstadoError,
  EstadoVacio,
  Eyebrow,
  Panel,
  Th,
  ZonaA,
} from "../componentes/basicos";
import { formatearEntero } from "../componentes/numeros";
import { columnaDe, evidenciaDeCarga } from "../perfiles/registro";
import { descargarExcel } from "../datos/excel";
import { TEMA } from "../tema";

const FILTROS: Array<{ valor: EstadoCarga | "todas"; rotulo: string }> = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "ok", rotulo: "Cuadran" },
  { valor: "advertencia", rotulo: "Revisar" },
  { valor: "inconsistente", rotulo: "No cuadran" },
];

export function Cargas() {
  const fuente = useFuenteTablero();
  const { contexto, sedeId } = useTablero();
  const navegar = useNavigate();
  const { id: idSeleccion } = useParams<{ id: string }>();
  const [parametros, setParametros] = useSearchParams();
  const estado = (parametros.get("estado") ?? "todas") as EstadoCarga | "todas";
  const [exportando, setExportando] = useState(false);
  const [errorExportacion, setErrorExportacion] = useState<ErrorHumano | null>(null);
  const { consulta, recargar } = useConsulta(
    () => fuente.listarCargas({ estado, sedeId }),
    [estado, sedeId],
  );

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={140} />
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Esqueleto alto={360} />
          </div>
          <div className="lg:col-span-2">
            <Esqueleto alto={360} />
          </div>
        </div>
      </div>
    );
  }
  if (consulta.estado === "error") {
    const humano = mensajeDeError(consulta.causa);
    return <EstadoError detalle={humano.frase} referencia={humano.referencia} onReintentar={recargar} />;
  }

  const { datos } = consulta;
  const seleccionada = datos.cargas.find((carga) => carga.id === idSeleccion) ?? datos.cargas[0] ?? null;
  const columnas = contexto.perfil.columnasCargas.map(columnaDe);

  const exportar = (alcance: "dia" | "mes") => {
    if (exportando) return;
    setExportando(true);
    setErrorExportacion(null);
    // P0.5: una exportación que falla lo DICE — antes el botón dejaba
    // de girar y no pasaba nada, con la promesa rechazada en silencio.
    descargarExcel(fuente, contexto, { alcance, sedeId })
      .catch((error: unknown) => setErrorExportacion(mensajeDeError(error)))
      .finally(() => setExportando(false));
  };

  return (
    <>
      <ZonaA
        veredicto={datos.veredicto}
        titulo="Estado del registro · últimos 14 días"
        hechos={[
          {
            valor: `${datos.cuadran} / ${datos.total}`,
            etiqueta: "Cargas que cuadran",
            color: TEMA.verde,
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
          ...(datos.sinFotoFinal > 0
            ? [
                {
                  valor: String(datos.sinFotoFinal),
                  etiqueta: `Carga${datos.sinFotoFinal === 1 ? "" : "s"} sin foto final`,
                  color: TEMA.ambar,
                },
              ]
            : []),
        ]}
        derecha={
          datos.total > 0 ? (
            <div style={{ minWidth: 226 }}>
              <Eyebrow>Descargar el detalle</Eyebrow>
              <div className="mt-3 flex flex-col" style={{ gap: 8 }}>
                <BotonExcel principal onClick={() => exportar("dia")}>
                  {exportando ? "Generando…" : "Día · hoy"}
                </BotonExcel>
                <BotonExcel onClick={() => exportar("mes")}>
                  {exportando ? "Generando…" : "Últimos 14 días"}
                </BotonExcel>
              </div>
              {errorExportacion ? (
                <div
                  role="alert"
                  style={{ fontSize: 11, color: TEMA.rojo, marginTop: 9, lineHeight: 1.5 }}
                >
                  No se pudo generar el Excel. {errorExportacion.frase}
                  {errorExportacion.referencia ? ` Soporte: ${errorExportacion.referencia}` : ""}
                </div>
              ) : null}
              <div style={{ fontSize: 10.5, color: TEMA.suave, marginTop: 9, lineHeight: 1.5 }}>
                {contexto.perfil.modulos.includes("suministro")
                  ? "El archivo completo trae cinco hojas: cargas, consumo por día, consumo por equipo, entregas y balance."
                  : "El archivo completo trae tres hojas: cargas, consumo por día y consumo por equipo."}
              </div>
            </div>
          ) : undefined
        }
      />

      <div
        role="group"
        aria-label="Filtrar por estado"
        className="mb-4 flex flex-wrap"
        style={{ gap: 8 }}
      >
        {FILTROS.map((filtro) => {
          const activo = estado === filtro.valor;
          return (
            <button
              key={filtro.valor}
              type="button"
              aria-pressed={activo}
              onClick={() => {
                navegar(filtro.valor === "todas" ? "/cargas" : `/cargas?estado=${filtro.valor}`);
                setParametros(filtro.valor === "todas" ? {} : { estado: filtro.valor });
              }}
              className="rounded-full font-semibold uppercase focus-visible:outline focus-visible:outline-2"
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                padding: "3px 8px",
                color: activo ? TEMA.texto : TEMA.suave,
                background: activo ? TEMA.panelAlto : "transparent",
                border: `1px solid ${activo ? TEMA.linea : TEMA.lineaSuave}`,
              }}
            >
              {filtro.rotulo}
            </button>
          );
        })}
      </div>

      {datos.cargas.length === 0 ? (
        <EstadoVacio
          mensaje={datos.total === 0 ? "Aún no hay cargas registradas" : "No hay cargas con este filtro"}
          detalle={
            datos.total === 0
              ? "Aparecerán aquí apenas el dispositivo de planta sincronice la primera."
              : "Prueba con otro estado."
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <Panel className="lg:col-span-3">
            <div className="px-5 pt-5">
              <Eyebrow>Últimas cargas · toca una fila para ver la evidencia</Eyebrow>
            </div>
            <div className="mt-3 overflow-x-auto px-2 pb-2">
              <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 520 }}>
                <caption className="sr-only">Detalle de cargas de los últimos 14 días</caption>
                <thead>
                  <tr>
                    <Th>Fecha</Th>
                    <Th>Hora</Th>
                    <Th>Equipo</Th>
                    <Th>Operador</Th>
                    {columnas.map((columna) => (
                      <Th key={columna.rotulo} derecha>
                        {columna.rotulo}
                      </Th>
                    ))}
                    <Th>Estado</Th>
                  </tr>
                </thead>
                <tbody>
                  {datos.cargas.map((carga) => {
                    const activa = seleccionada?.id === carga.id;
                    const celda = {
                      padding: "10px",
                      borderBottom: `1px solid ${TEMA.lineaSuave}`,
                    } as const;
                    return (
                      <tr
                        key={carga.id}
                        onClick={() =>
                          navegar(`/cargas/${carga.id}${estado === "todas" ? "" : `?estado=${estado}`}`)
                        }
                        className="cursor-pointer"
                        style={{ background: activa ? TEMA.panelAlto : "transparent" }}
                      >
                        <td style={{ ...celda, fontSize: 12, color: TEMA.suave }}>{carga.fecha}</td>
                        <td className="font-mono" style={{ ...celda, fontSize: 12 }}>
                          {carga.hora}
                        </td>
                        <td className="font-mono font-semibold" style={{ ...celda, fontSize: 13 }}>
                          {carga.equipoCodigo}
                        </td>
                        <td style={{ ...celda, fontSize: 12, color: TEMA.suave }}>
                          {carga.conductorNombre}
                        </td>
                        {columnas.map((columna) => (
                          <td
                            key={columna.rotulo}
                            className={`font-mono ${columna.principal ? "font-semibold" : ""}`}
                            style={{
                              ...celda,
                              fontSize: 13,
                              textAlign: "right",
                              color: columna.principal ? TEMA.texto : TEMA.suave,
                            }}
                          >
                            {columna.valor(carga)}
                          </td>
                        ))}
                        <td style={celda}>
                          <Chip estado={carga.estado} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          {seleccionada ? <PanelEvidencia key={seleccionada.id} id={seleccionada.id} /> : null}
        </div>
      )}
    </>
  );
}

/** Evidencia de la carga seleccionada. La vista la elige el perfil con
 *  el que NACIÓ la carga (DEC-016): la historia no se reinterpreta. */
function PanelEvidencia(props: { id: string }) {
  const fuente = useFuenteTablero();
  const { consulta, recargar } = useConsulta(() => fuente.detalleCarga(props.id), [props.id]);

  if (consulta.estado === "cargando") {
    return (
      <div className="lg:col-span-2">
        <Esqueleto alto={360} />
      </div>
    );
  }
  if (consulta.estado === "error") {
    const humano = mensajeDeError(consulta.causa);
    return (
      <div className="lg:col-span-2">
        <EstadoError detalle={humano.frase} referencia={humano.referencia} onReintentar={recargar} />
      </div>
    );
  }

  const { datos } = consulta;
  const Evidencia = evidenciaDeCarga(datos.resumen.perfilCodigo);
  return <Evidencia datos={datos} />;
}
