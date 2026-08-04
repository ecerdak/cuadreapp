// [Pestaña Cargas] La composición del diseño aprobado: ZonaA con los
// hechos y la descarga a Excel, y el maestro-detalle — tabla
// seleccionable a la izquierda, panel de evidencia (fotos, lecturas,
// candados) a la derecha. La ruta /cargas/:id selecciona la fila
// (deep-link conservado). El filtro por estado vive en la URL.

import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Bandera, EstadoCarga } from "@cuadreapp/dominio";
import type { DetalleCarga } from "../datos/puertos";
import { useFuenteTablero } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import {
  BotonExcel,
  Candado,
  Chip,
  Esqueleto,
  EstadoError,
  EstadoVacio,
  Eyebrow,
  Panel,
  Th,
  ZonaA,
} from "../componentes/basicos";
import { formatearEntero, formatearGal } from "../componentes/numeros";
import { descargarExcel } from "../datos/excel";
import { TEMA } from "../tema";

const FILTROS: Array<{ valor: EstadoCarga | "todas"; rotulo: string }> = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "ok", rotulo: "Cuadran" },
  { valor: "advertencia", rotulo: "Revisar" },
  { valor: "inconsistente", rotulo: "No cuadran" },
];

// Mensajes por bandera con tono de supervisor (mejora funcional
// validada; se muestran en el panel de evidencia).
const MENSAJE_SUPERVISOR: Partial<Record<Bandera, string>> = {
  TANDA_NO_RESETEADA: "La tanda no arrancó en 0,0: el conductor dejó nota.",
  SALTO_TOTALIZADOR:
    "El totalizador arrancó más arriba de lo esperado. No significa que falte combustible: esos galones ya los contó el medidor — falta saber a qué equipo fueron.",
  SALTO_TOTALIZADOR_NEGATIVO:
    "El totalizador arrancó por debajo del último valor registrado: revisar lecturas.",
  TANDA_NO_CUADRA: "La tanda no coincide con lo que subió el totalizador.",
  SIN_GPS: "No fue posible verificar la ubicación (sin GPS). Solo informativo.",
  FUERA_DE_SEDE: "El GPS marcó fuera de la estación.",
  POSIBLE_DUPLICADO: "Hay otra carga del mismo equipo pocos minutos antes.",
  TIEMPO_ATIPICO: "La duración de la carga fue atípica.",
  CONTADOR_RETROCEDE: "El horómetro/odómetro quedó por debajo de la lectura anterior.",
  SALTO_CONTADOR: "El salto del horómetro/odómetro no es posible en el tiempo transcurrido.",
  EXCEDE_CAPACIDAD: "Los galones superan la capacidad del tanque del equipo.",
  FOTO_FALTANTE: "Falta evidencia fotográfica.",
  TOTALIZADOR_RETROCEDE: "El totalizador retrocedió: lectura imposible.",
  TOTALIZADOR_SIN_AVANCE: "El totalizador no se movió.",
};

export function Cargas() {
  const fuente = useFuenteTablero();
  const navegar = useNavigate();
  const { id: idSeleccion } = useParams<{ id: string }>();
  const [parametros, setParametros] = useSearchParams();
  const estado = (parametros.get("estado") ?? "todas") as EstadoCarga | "todas";
  const [exportando, setExportando] = useState(false);
  const { consulta, recargar } = useConsulta(() => fuente.listarCargas({ estado }), [estado]);

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
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { datos } = consulta;
  const seleccionada = datos.cargas.find((carga) => carga.id === idSeleccion) ?? datos.cargas[0] ?? null;

  const exportar = (alcance: "dia" | "mes") => {
    if (exportando) return;
    setExportando(true);
    void descargarExcel(fuente, alcance).finally(() => setExportando(false));
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
                  etiqueta: "Carga sin foto final",
                  color: TEMA.ambar,
                },
              ]
            : []),
        ]}
        derecha={
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
            <div style={{ fontSize: 10.5, color: TEMA.suave, marginTop: 9, lineHeight: 1.5 }}>
              El archivo completo trae cinco hojas: cargas, consumo por día, consumo por equipo, entregas
              y balance.
            </div>
          </div>
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
        <EstadoVacio mensaje="No hay cargas con este filtro" detalle="Prueba con otro estado." />
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
                    <Th>Conductor</Th>
                    <Th derecha>Galones</Th>
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
                        <td
                          className="font-mono font-semibold"
                          style={{ ...celda, fontSize: 13, textAlign: "right" }}
                        >
                          {formatearGal(carga.galones)}
                        </td>
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

/* Panel de evidencia del diseño: fotos 2×138, lecturas por foto,
   verificación automática (candados) y el contador del equipo. */
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
  if (consulta.estado === "error")
    return (
      <div className="lg:col-span-2">
        <EstadoError detalle={consulta.detalle} onReintentar={recargar} />
      </div>
    );

  const { datos } = consulta;

  // Despacho por perfil (DEC-016): cada carga se muestra según SU
  // perfil — el snapshot con el que nació, no el del cliente.
  if (datos.inventario) {
    return <EvidenciaInventario datos={datos} />;
  }
  const lecturas = datos.lecturas;
  if (!lecturas) return null; // forma imposible: toda carga trae lecturas o inventario

  const { resumen } = datos;
  const sinFotoFinal = resumen.banderas.includes("FOTO_FALTANTE");
  const mensajes = resumen.banderas
    .map((bandera) => MENSAJE_SUPERVISOR[bandera])
    .filter((mensaje): mensaje is string => Boolean(mensaje));

  return (
    <Panel className="p-5 lg:col-span-2" alto>
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>Evidencia de la carga</Eyebrow>
          <div className="mt-2 font-semibold" style={{ fontSize: 16 }}>
            {resumen.equipoCodigo} · {formatearGal(resumen.galones)} gal
          </div>
          <div style={{ fontSize: 12, color: TEMA.suave, marginTop: 2 }}>
            {resumen.equipoDescripcion} · {resumen.conductorNombre} · {resumen.fecha} {resumen.hora}
          </div>
        </div>
        <Chip estado={resumen.estado} />
      </div>

      <div className="mt-4 grid grid-cols-2" style={{ gap: 10 }}>
        {(
          [
            {
              rot: "Antes de cargar",
              foto: datos.fotos.inicial,
              tanda: lecturas.tandaInicial,
              tot: lecturas.totInicial,
            },
            {
              rot: "Después de cargar",
              foto: sinFotoFinal ? null : datos.fotos.final,
              tanda: lecturas.tandaFinal,
              tot: lecturas.totFinal,
            },
          ] as const
        ).map((f) => (
          <div key={f.rot}>
            <div style={{ fontSize: 11, color: TEMA.suave, marginBottom: 6 }}>{f.rot}</div>
            <div
              className="flex items-center justify-center overflow-hidden rounded-md"
              style={{ height: 138, background: "#0A1017", border: `1px solid ${TEMA.linea}` }}
            >
              {f.foto ? (
                <img
                  src={f.foto}
                  alt={`Foto del medidor — ${f.rot.toLowerCase()}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span className="px-3 text-center" style={{ fontSize: 11, color: TEMA.ambar }}>
                  Sin foto. El conductor cerró la carga sin capturar el medidor.
                </span>
              )}
            </div>
            <div
              className="mt-2 flex items-baseline justify-between"
              style={{ fontSize: 11, color: TEMA.suave }}
            >
              <span>Tanda</span>
              <span className="font-mono font-semibold" style={{ fontSize: 13, color: TEMA.texto }}>
                {formatearGal(f.tanda)}
              </span>
            </div>
            <div
              className="flex items-baseline justify-between"
              style={{ fontSize: 11, color: TEMA.suave }}
            >
              <span>Totalizador</span>
              <span className="font-mono font-semibold" style={{ fontSize: 13, color: TEMA.texto }}>
                {formatearEntero(f.tot)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${TEMA.linea}` }}>
        <Eyebrow>Verificación automática</Eyebrow>
        <div className="mt-3 flex flex-col" style={{ gap: 9 }}>
          {datos.candados.map((candado) => (
            <Candado
              key={candado.nombre}
              ok={candado.cumple}
              texto={candado.nombre}
              detalle={candado.descripcion}
            />
          ))}
        </div>
        {mensajes.length > 0 ? (
          <div className="mt-4 flex flex-col" style={{ gap: 6 }}>
            {mensajes.map((mensaje) => (
              <div key={mensaje} style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.5 }}>
                {mensaje}
                {datos.galNoRegistrados
                  ? ` Tamaño del salto: ${formatearGal(datos.galNoRegistrados)} gal.`
                  : ""}
              </div>
            ))}
          </div>
        ) : null}
        {datos.lecturaEquipo !== null ? (
          <div
            className="mt-4 flex items-baseline justify-between"
            style={{ fontSize: 11, color: TEMA.suave }}
          >
            <span>{datos.tipoLectura === "horometro" ? "Horómetro" : "Odómetro"} del equipo</span>
            <span className="font-mono font-semibold" style={{ fontSize: 13, color: TEMA.texto }}>
              {datos.lecturaEquipo.toLocaleString("es-CO", { minimumFractionDigits: 1 })}
            </span>
          </div>
        ) : null}
        {datos.notas ? (
          <div className="mt-4" style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.5 }}>
            <span style={{ color: TEMA.texto }}>Nota del conductor:</span> {datos.notas}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

/* Vista de evidencia del perfil «Carga sobre Inventario» (DEC-016):
   Llegó con · Despachado por Lubryco · Total al salir, las dos fotos
   del carrotanque, operador, duración y observaciones. Exportada para
   probarse como componente puro. */
export function EvidenciaInventario(props: { datos: DetalleCarga }) {
  const { datos } = props;
  const { resumen } = datos;
  const inventario = datos.inventario!;
  const sinFotoFinal = resumen.banderas.includes("FOTO_FALTANTE");
  const minutos = Math.floor(datos.duracionSegundos / 60);
  const duracion = `${minutos} min ${String(Math.round(datos.duracionSegundos % 60)).padStart(2, "0")} s`;
  const mensajes = resumen.banderas
    .map((bandera) => MENSAJE_SUPERVISOR[bandera])
    .filter((mensaje): mensaje is string => Boolean(mensaje));

  return (
    <Panel className="p-5 lg:col-span-2" alto>
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>Evidencia de la carga</Eyebrow>
          <div className="mt-2 font-semibold" style={{ fontSize: 16 }}>
            {resumen.equipoCodigo} · {formatearGal(resumen.galones)} gal despachados
          </div>
          <div style={{ fontSize: 12, color: TEMA.suave, marginTop: 2 }}>
            {resumen.equipoDescripcion} · {resumen.conductorNombre} · {resumen.fecha} {resumen.hora} ·{" "}
            {duracion}
          </div>
        </div>
        <Chip estado={resumen.estado} />
      </div>

      <div className="mt-4 rounded-md px-4 py-3" style={{ border: `1px solid ${TEMA.linea}` }}>
        {(
          [
            ["Llegó con", inventario.llegadaGal, false],
            ["Despachado por Lubryco", inventario.despachadosGal, false],
            ["Total al salir", inventario.totalSalidaGal, true],
          ] as const
        ).map(([rotulo, valor, destacado]) => (
          <div
            key={rotulo}
            className="flex items-baseline justify-between py-1"
            style={{ fontSize: 11, color: TEMA.suave }}
          >
            <span>{rotulo}</span>
            <span
              className={`font-mono ${destacado ? "font-bold" : "font-semibold"}`}
              style={{ fontSize: destacado ? 15 : 13, color: TEMA.texto }}
            >
              {formatearGal(valor)} gal
            </span>
          </div>
        ))}
        <div style={{ fontSize: 10, color: TEMA.suave, marginTop: 4 }}>
          El total lo calcula el sistema — el operador nunca lo escribe.
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2" style={{ gap: 10 }}>
        {(
          [
            { rot: "Llegada", foto: datos.fotos.inicial },
            { rot: "Salida", foto: sinFotoFinal ? null : datos.fotos.final },
          ] as const
        ).map((f) => (
          <div key={f.rot}>
            <div style={{ fontSize: 11, color: TEMA.suave, marginBottom: 6 }}>{f.rot}</div>
            <div
              className="flex items-center justify-center overflow-hidden rounded-md"
              style={{ height: 138, background: "#0A1017", border: `1px solid ${TEMA.linea}` }}
            >
              {f.foto ? (
                <img
                  src={f.foto}
                  alt={`Foto del carrotanque — ${f.rot.toLowerCase()}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span className="px-3 text-center" style={{ fontSize: 11, color: TEMA.ambar }}>
                  Sin foto. El operador cerró la carga sin capturar el carrotanque.
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {mensajes.length > 0 ? (
        <div className="mt-4 flex flex-col" style={{ gap: 6 }}>
          {mensajes.map((mensaje) => (
            <div key={mensaje} style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.5 }}>
              {mensaje}
            </div>
          ))}
        </div>
      ) : null}
      {datos.notas ? (
        <div className="mt-4" style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.5 }}>
          <span style={{ color: TEMA.texto }}>Observaciones:</span> {datos.notas}
        </div>
      ) : null}
    </Panel>
  );
}
