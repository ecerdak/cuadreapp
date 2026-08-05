// Vistas de evidencia de UNA carga, una por perfil. Cuál se usa lo
// decide el SNAPSHOT de la carga (DEC-016): una carga capturada con
// medidor se sigue viendo con vocabulario de medidor aunque el cliente
// haya cambiado de perfil después. La historia no se reinterpreta.

import type { Bandera } from "@cuadreapp/dominio";
import type { DetalleCarga } from "../datos/puertos";
import { Candado, Chip, Eyebrow, Panel } from "../componentes/basicos";
import { formatearEntero, formatearGal } from "../componentes/numeros";
import { TEMA } from "../tema";

/** Mensajes por bandera con tono de supervisor. Traduce el veredicto
 *  del dominio a lenguaje de planta; jamás lo recalcula. */
export const MENSAJE_SUPERVISOR: Partial<Record<Bandera, string>> = {
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

export interface PropsEvidencia {
  datos: DetalleCarga;
}

const mensajesDe = (banderas: Bandera[]): string[] =>
  banderas
    .map((bandera) => MENSAJE_SUPERVISOR[bandera])
    .filter((mensaje): mensaje is string => Boolean(mensaje));

function duracionLegible(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  return `${minutos} min ${String(Math.round(segundos % 60)).padStart(2, "0")} s`;
}

function Foto(props: { rotulo: string; url: string | null; faltaTexto: string; alt: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: TEMA.suave, marginBottom: 6 }}>{props.rotulo}</div>
      <div
        className="flex items-center justify-center overflow-hidden rounded-md"
        style={{ height: 138, background: "#0A1017", border: `1px solid ${TEMA.linea}` }}
      >
        {props.url ? (
          <img
            src={props.url}
            alt={props.alt}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span className="px-3 text-center" style={{ fontSize: 11, color: TEMA.ambar }}>
            {props.faltaTexto}
          </span>
        )}
      </div>
    </div>
  );
}

function Encabezado(props: { datos: DetalleCarga; cifra: string; contexto: string }) {
  const { resumen } = props.datos;
  return (
    <div className="flex items-start justify-between">
      <div>
        <Eyebrow>Evidencia de la carga</Eyebrow>
        <div className="mt-2 font-semibold" style={{ fontSize: 16 }}>
          {resumen.equipoCodigo} · {props.cifra}
        </div>
        <div style={{ fontSize: 12, color: TEMA.suave, marginTop: 2 }}>{props.contexto}</div>
      </div>
      <Chip estado={resumen.estado} />
    </div>
  );
}

function Notas(props: {
  mensajes: string[];
  notas: string | null;
  rotuloNotas: string;
  extra?: string;
}) {
  return (
    <>
      {props.mensajes.length > 0 ? (
        <div className="mt-4 flex flex-col" style={{ gap: 6 }}>
          {props.mensajes.map((mensaje) => (
            <div key={mensaje} style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.5 }}>
              {mensaje}
              {props.extra ?? ""}
            </div>
          ))}
        </div>
      ) : null}
      {props.notas ? (
        <div className="mt-4" style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.5 }}>
          <span style={{ color: TEMA.texto }}>{props.rotuloNotas}:</span> {props.notas}
        </div>
      ) : null}
    </>
  );
}

/* ============ Perfiles con medidor ============ */

export function EvidenciaMedidor({ datos }: PropsEvidencia) {
  const lecturas = datos.lecturas;
  if (!lecturas) return null; // forma imposible: el perfil garantiza las lecturas
  const { resumen } = datos;
  const sinFotoFinal = resumen.banderas.includes("FOTO_FALTANTE");

  return (
    <Panel className="p-5 lg:col-span-2" alto>
      <Encabezado
        datos={datos}
        cifra={`${formatearGal(resumen.galones)} gal`}
        contexto={`${resumen.equipoDescripcion} · ${resumen.conductorNombre} · ${resumen.fecha} ${resumen.hora}`}
      />

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
            <Foto
              rotulo={f.rot}
              url={f.foto}
              alt={`Foto del medidor — ${f.rot.toLowerCase()}`}
              faltaTexto="Sin foto. El conductor cerró la carga sin capturar el medidor."
            />
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
        <Notas
          mensajes={mensajesDe(resumen.banderas)}
          notas={datos.notas}
          rotuloNotas="Nota del conductor"
          extra={
            datos.galNoRegistrados
              ? ` Tamaño del salto: ${formatearGal(datos.galNoRegistrados)} gal.`
              : ""
          }
        />
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
      </div>
    </Panel>
  );
}

/* ============ Perfiles de carga sobre inventario ============ */

export function EvidenciaInventario({ datos }: PropsEvidencia) {
  const inventario = datos.inventario;
  if (!inventario) return null;
  const { resumen } = datos;
  const sinFotoFinal = resumen.banderas.includes("FOTO_FALTANTE");

  return (
    <Panel className="p-5 lg:col-span-2" alto>
      <Encabezado
        datos={datos}
        cifra={`${formatearGal(resumen.galones)} gal despachados`}
        contexto={`${resumen.equipoDescripcion} · ${resumen.conductorNombre} · ${resumen.fecha} ${resumen.hora} · ${duracionLegible(datos.duracionSegundos)}`}
      />

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
        <Foto
          rotulo="Llegada"
          url={datos.fotos.inicial}
          alt="Foto del carrotanque — llegada"
          faltaTexto="Sin foto. El operador cerró la carga sin capturar el carrotanque."
        />
        <Foto
          rotulo="Salida"
          url={sinFotoFinal ? null : datos.fotos.final}
          alt="Foto del carrotanque — salida"
          faltaTexto="Sin foto. El operador cerró la carga sin capturar el carrotanque."
        />
      </div>

      <Notas mensajes={mensajesDe(resumen.banderas)} notas={datos.notas} rotuloNotas="Observaciones" />
    </Panel>
  );
}
