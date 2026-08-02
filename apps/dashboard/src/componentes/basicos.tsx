// Básicos del design system del tablero. Regla de la casa: el estado
// nunca se comunica solo por color (siempre hay texto), el foco es
// visible, y los esqueletos respetan prefers-reduced-motion.

import type { ReactNode } from "react";
import type { EstadoCarga } from "@cuadreapp/dominio";
import { COLOR_ESTADO, COLOR_TONO, TEMA, TEXTO_ESTADO } from "../tema";
import type { Veredicto } from "../datos/puertos";

/** La frase de arriba de cada pestaña: el veredicto antes que los datos (spec §8.2). */
export function VeredictoBanner(props: { veredicto: Veredicto }) {
  const color = COLOR_TONO[props.veredicto.tono];
  return (
    <section
      aria-live="polite"
      className="rounded-xl p-4"
      style={{ background: TEMA.panel, borderLeft: `4px solid ${color}` }}
    >
      <p className="text-lg font-bold" style={{ color }}>
        {props.veredicto.titulo}
      </p>
      {props.veredicto.detalle ? (
        <p className="mt-1 text-sm" style={{ color: TEMA.suave }}>
          {props.veredicto.detalle}
        </p>
      ) : null}
    </section>
  );
}

export function ChipEstado(props: { estado: EstadoCarga }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-black"
      style={{ background: COLOR_ESTADO[props.estado] }}
    >
      {TEXTO_ESTADO[props.estado]}
    </span>
  );
}

export function TarjetaMetrica(props: { rotulo: string; contexto?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: TEMA.panel }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: TEMA.suave }}>
        {props.rotulo}
      </p>
      <div className="mt-1 text-3xl font-bold tabular-nums">{props.children}</div>
      {props.contexto ? (
        <p className="mt-1 text-xs" style={{ color: TEMA.suave }}>
          {props.contexto}
        </p>
      ) : null}
    </div>
  );
}

export function Esqueleto(props: { alto?: number; ancho?: string }) {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl motion-safe:animate-pulse"
      style={{ background: TEMA.panel2, height: props.alto ?? 96, width: props.ancho ?? "100%" }}
    />
  );
}

export function EstadoVacio(props: { mensaje: string; detalle?: string }) {
  return (
    <div className="rounded-xl p-8 text-center" style={{ background: TEMA.panel }}>
      <p className="text-lg font-semibold">{props.mensaje}</p>
      {props.detalle ? (
        <p className="mt-1 text-sm" style={{ color: TEMA.suave }}>
          {props.detalle}
        </p>
      ) : null}
    </div>
  );
}

export function EstadoError(props: { detalle: string; onReintentar: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-xl p-6 text-center"
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
        className="mt-3 rounded-lg px-4 py-2 font-bold text-black focus-visible:outline focus-visible:outline-2"
        style={{ background: TEMA.amarillo }}
      >
        Reintentar
      </button>
    </div>
  );
}
