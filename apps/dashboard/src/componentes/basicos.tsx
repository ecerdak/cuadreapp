// Piezas del tablero transcritas del contrato visual (docs/design/
// CUADREAPP_VISUAL_CONTRACT.md §7). Regla de la casa conservada: el
// estado nunca se comunica solo por color, el foco es visible y los
// esqueletos respetan prefers-reduced-motion.

import type { ReactNode } from "react";
import type { EstadoCarga } from "@cuadreapp/dominio";
import { COLOR_ESTADO, TEMA, TEXTO_ESTADO, TONO_ZONA } from "../tema";
import type { Veredicto } from "../datos/puertos";

/* Etiqueta en mayúsculas, 10 px, tracking .14em. */
export function Eyebrow(props: { children: ReactNode; color?: string }) {
  return (
    <div
      className="uppercase font-semibold"
      style={{ fontSize: 10, letterSpacing: "0.14em", color: props.color ?? TEMA.suave }}
    >
      {props.children}
    </div>
  );
}

/* Tarjeta con borde; `alto` usa el fondo elevado. */
export function Panel(props: { children: ReactNode; className?: string; alto?: boolean }) {
  return (
    <div
      className={`rounded-lg ${props.className ?? ""}`}
      style={{
        background: props.alto ? TEMA.panelAlto : TEMA.panel,
        border: `1px solid ${TEMA.lineaSuave}`,
      }}
    >
      {props.children}
    </div>
  );
}

/* Píldora de estado: Cuadra / Revisar / No cuadra. */
export function Chip(props: { estado: EstadoCarga }) {
  const col = COLOR_ESTADO[props.estado];
  return (
    <span
      className="inline-flex items-center rounded-full font-semibold uppercase"
      style={{
        fontSize: 10,
        letterSpacing: "0.08em",
        padding: "3px 8px",
        color: col,
        background: `${col}1F`,
        border: `1px solid ${col}55`,
      }}
    >
      {TEXTO_ESTADO[props.estado]}
    </span>
  );
}

export interface Hecho {
  valor: string;
  etiqueta: string;
  color?: string;
}

/* Zona A — el veredicto antes de los datos. Degradado lateral, borde
   izquierdo del tono, frase de 21 px y los hechos en mono. */
export function ZonaA(props: {
  veredicto: Veredicto;
  titulo: string;
  hechos?: Hecho[];
  derecha?: ReactNode;
}) {
  const tono = TONO_ZONA[props.veredicto.tono];
  const col = tono === "alto" ? TEMA.rojo : tono === "medio" ? TEMA.ambar : TEMA.verde;
  return (
    <section
      aria-live="polite"
      className="mb-5 rounded-lg"
      style={{
        background: `linear-gradient(90deg, ${col}14 0%, ${TEMA.panel} 55%)`,
        border: `1px solid ${TEMA.lineaSuave}`,
        borderLeft: `3px solid ${col}`,
      }}
    >
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start md:justify-between">
        <div style={{ maxWidth: 620 }}>
          <Eyebrow color={col}>{props.titulo}</Eyebrow>
          <p
            className="mt-2 font-semibold leading-snug"
            style={{ fontSize: 21, color: TEMA.texto, letterSpacing: "-0.01em" }}
          >
            {props.veredicto.titulo}
          </p>
          {props.veredicto.detalle ? (
            <p style={{ fontSize: 12, color: TEMA.suave, marginTop: 8, lineHeight: 1.6 }}>
              {props.veredicto.detalle}
            </p>
          ) : null}
          {props.hechos && props.hechos.length > 0 ? (
            <div className="mt-4 flex flex-wrap" style={{ gap: "18px 28px" }}>
              {props.hechos.map((hecho, indice) => (
                <div key={indice}>
                  <div
                    className="font-mono font-semibold"
                    style={{ fontSize: 17, color: hecho.color ?? TEMA.texto }}
                  >
                    {hecho.valor}
                  </div>
                  <div style={{ fontSize: 11, color: TEMA.suave, marginTop: 2 }}>{hecho.etiqueta}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {props.derecha ? <div className="shrink-0">{props.derecha}</div> : null}
      </div>
    </section>
  );
}

/* Verificación individual: cuadrito ✓ / ! con texto y detalle. */
export function Candado(props: { ok: boolean; texto: string; detalle: string }) {
  const col = props.ok ? TEMA.verde : TEMA.rojo;
  return (
    <div className="flex" style={{ gap: 10 }}>
      <span
        className="flex shrink-0 items-center justify-center font-bold"
        style={{
          width: 17,
          height: 17,
          marginTop: 1,
          borderRadius: 4,
          background: `${col}22`,
          color: col,
          fontSize: 11,
          border: `1px solid ${col}66`,
        }}
      >
        {props.ok ? "✓" : "!"}
      </span>
      <div>
        <div style={{ fontSize: 12.5, color: TEMA.texto, lineHeight: 1.4 }}>{props.texto}</div>
        <div style={{ fontSize: 11, color: TEMA.suave, lineHeight: 1.5, marginTop: 2 }}>
          {props.detalle}
        </div>
      </div>
    </div>
  );
}

/* Botón de descarga con el sufijo XLSX. */
export function BotonExcel(props: { children: ReactNode; onClick: () => void; principal?: boolean }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="flex w-full items-center justify-between rounded-md font-semibold focus-visible:outline focus-visible:outline-2"
      style={{
        gap: 10,
        padding: "10px 14px",
        fontSize: 12.5,
        color: props.principal ? "#12202C" : TEMA.texto,
        background: props.principal ? TEMA.amarillo : TEMA.panelAlto,
        border: `1px solid ${props.principal ? TEMA.amarillo : TEMA.linea}`,
      }}
    >
      <span>{props.children}</span>
      <span style={{ fontSize: 10, opacity: 0.75, letterSpacing: "0.06em" }}>XLSX</span>
    </button>
  );
}

export function Esqueleto(props: { alto?: number; ancho?: string }) {
  return (
    <div
      aria-hidden="true"
      className="rounded-lg motion-safe:animate-pulse"
      style={{ background: TEMA.panelAlto, height: props.alto ?? 96, width: props.ancho ?? "100%" }}
    />
  );
}

export function EstadoVacio(props: { mensaje: string; detalle?: string }) {
  return (
    <Panel className="p-8 text-center">
      <p className="text-lg font-semibold">{props.mensaje}</p>
      {props.detalle ? (
        <p className="mt-1 text-sm" style={{ color: TEMA.suave }}>
          {props.detalle}
        </p>
      ) : null}
    </Panel>
  );
}

export function EstadoError(props: { detalle: string; onReintentar: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-lg p-6 text-center"
      style={{ background: TEMA.panel, border: `1px solid ${TEMA.rojo}` }}
    >
      <p className="font-semibold" style={{ color: TEMA.rojo }}>
        No se pudieron cargar los datos.
      </p>
      <p className="mt-1 text-xs" style={{ color: TEMA.suave }}>
        {props.detalle}
      </p>
      <button
        type="button"
        onClick={props.onReintentar}
        className="mt-3 rounded-md font-semibold focus-visible:outline focus-visible:outline-2"
        style={{ background: TEMA.amarillo, color: "#12202C", padding: "12px 20px", fontSize: 14 }}
      >
        Reintentar
      </button>
    </div>
  );
}

/* Cabecera de tabla del contrato: uppercase 10 px, tracking .1em. */
export function Th(props: { children: ReactNode; derecha?: boolean }) {
  return (
    <th
      scope="col"
      className="uppercase font-semibold"
      style={{
        fontSize: 10,
        letterSpacing: "0.1em",
        color: TEMA.suave,
        textAlign: props.derecha ? "right" : "left",
        padding: "8px 12px",
        borderBottom: `1px solid ${TEMA.linea}`,
      }}
    >
      {props.children}
    </th>
  );
}
