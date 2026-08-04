// Piezas de interfaz del contrato visual (docs/design/
// CUADREAPP_VISUAL_CONTRACT.md §5), transcritas del mockup aprobado.
// Cero lógica de negocio: la validación la dicta el dominio y estas
// piezas solo la visten.

import type { ReactNode } from "react";
import { APP, C } from "../marca/tokens";

/* Encabezado de pantalla: 21 px semibold + sub opcional. */
export function Titulo(props: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="px-4 pt-5">
      <h2 className="font-semibold leading-snug" style={{ fontSize: 21, letterSpacing: "-0.01em" }}>
        {props.children}
      </h2>
      {props.sub ? (
        <p style={{ fontSize: 12.5, color: C.suave, marginTop: 6, lineHeight: 1.5 }}>{props.sub}</p>
      ) : null}
    </div>
  );
}

/* Etiqueta en mayúsculas, 9.5 px, tracking .12em. */
export function Eyebrow(props: { children: ReactNode; color?: string }) {
  return (
    <span
      className="uppercase font-semibold"
      style={{ fontSize: 9.5, letterSpacing: "0.12em", color: props.color ?? C.suave }}
    >
      {props.children}
    </span>
  );
}

/* Acción principal. El estado no disponible es tono "gris", no opacity. */
export function BotonGrande(props: {
  children: ReactNode;
  onClick: () => void;
  tono?: "primario" | "gris";
  chico?: boolean;
}) {
  const tono = props.tono ?? "primario";
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="w-full rounded-xl font-semibold"
      style={{
        background: tono === "primario" ? C.amarillo : APP.tarjeta2,
        color: tono === "primario" ? "#101A22" : C.texto,
        padding: props.chico ? "13px 16px" : "18px 16px",
        fontSize: props.chico ? 14 : 16,
        border: tono === "primario" ? "none" : `1px solid ${C.linea}`,
      }}
    >
      {props.children}
    </button>
  );
}

/* Bloque de validación: ok verde, alerta ámbar, malo rojo. El tono
   "info" (azul) viste los estados informativos que el mockup no tenía
   (actualización lista, SIN_GPS) con el mismo patrón. */
export type TonoAviso = "ok" | "alerta" | "malo" | "info";

export function Aviso(props: { tono: TonoAviso; titulo: ReactNode; cuerpo?: ReactNode }) {
  const col =
    props.tono === "ok"
      ? C.verde
      : props.tono === "alerta"
        ? C.ambar
        : props.tono === "malo"
          ? C.rojo
          : C.azul;
  return (
    <div
      className="rounded-lg px-3 py-3"
      style={{ background: `${col}16`, border: `1px solid ${col}4D` }}
    >
      <div className="flex" style={{ gap: 9 }}>
        <span
          className="flex shrink-0 items-center justify-center font-bold"
          style={{
            width: 18,
            height: 18,
            marginTop: 1,
            borderRadius: 5,
            background: col,
            color: "#0B1219",
            fontSize: 12,
          }}
        >
          {props.tono === "ok" ? "✓" : "!"}
        </span>
        <div>
          <div className="font-semibold" style={{ fontSize: 13, color: col }}>
            {props.titulo}
          </div>
          {props.cuerpo ? (
            <div style={{ fontSize: 11.5, color: C.suave, lineHeight: 1.5, marginTop: 3 }}>
              {props.cuerpo}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* Campo numérico grande, estilo carátula. Se edita con el Teclado. */
export function CampoNum(props: {
  rot: string;
  valor: string;
  unidad?: string;
  activo?: boolean;
  onClick?: () => void;
  tono?: "alerta" | "malo" | null;
  ayuda?: string;
}) {
  const borde =
    props.tono === "malo"
      ? C.rojo
      : props.tono === "alerta"
        ? C.ambar
        : props.activo
          ? C.amarillo
          : C.linea;
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="w-full rounded-lg px-3 py-3 text-left"
      style={{ background: APP.tarjeta, border: `1px solid ${borde}` }}
    >
      <div className="flex items-baseline justify-between">
        <Eyebrow>{props.rot}</Eyebrow>
        {props.ayuda ? <span style={{ fontSize: 10, color: C.suave }}>{props.ayuda}</span> : null}
      </div>
      <div className="mt-1 flex items-baseline" style={{ gap: 6 }}>
        <span
          className="font-mono font-bold"
          style={{ fontSize: 26, color: props.valor ? C.texto : C.linea }}
        >
          {props.valor || "—"}
        </span>
        {props.unidad ? <span style={{ fontSize: 11, color: C.suave }}>{props.unidad}</span> : null}
      </div>
    </button>
  );
}

/* Teclado numérico propio: ninguna pantalla del conductor pide letras. */
const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"] as const;

export function Teclado(props: { onTecla: (tecla: string) => void }) {
  return (
    <div className="grid grid-cols-3 px-4" style={{ gap: 7 }}>
      {TECLAS.map((tecla) => (
        <button
          key={tecla}
          type="button"
          onClick={() => props.onTecla(tecla)}
          className="rounded-lg font-mono font-semibold"
          style={{
            padding: "13px 0",
            fontSize: 19,
            background: APP.tarjeta2,
            color: tecla === "⌫" ? C.suave : C.texto,
            border: `1px solid ${C.lineaSuave}`,
          }}
          aria-label={tecla === "⌫" ? "Borrar" : tecla === "," ? "Coma decimal" : tecla}
        >
          {tecla}
        </button>
      ))}
    </div>
  );
}

/* Escritura de un valor numérico con el Teclado: una coma, máximo 8. */
export function escribirTecla(actual: string, tecla: string): string {
  if (tecla === "⌫") return actual.slice(0, -1);
  if (tecla === ",") return actual.includes(",") ? actual : `${actual},`;
  return (actual + tecla).slice(0, 8);
}

/* Control de retroceso del wizard: discreto, alineado a la izquierda,
   debajo de la cabecera y antes del título. Área táctil generosa. */
export function BotonAtras(props: { onClick: () => void }) {
  return (
    <div className="px-4 pt-3">
      <button
        type="button"
        onClick={props.onClick}
        aria-label="Volver al paso anterior"
        style={{ fontSize: 12.5, color: C.azul, padding: "8px 12px 8px 0" }}
      >
        ← Atrás
      </button>
    </div>
  );
}

/* Confirmación modal del wizard: se usa cuando volver invalida
   información. Cancelar siempre disponible; la acción confirma. */
export function Confirmacion(props: {
  titulo: string;
  cuerpo: string;
  accion: string;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={props.titulo}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(4,8,12,.62)" }}
    >
      <div
        className="w-full max-w-sm rounded-xl px-4 py-4"
        style={{ background: APP.tarjeta, border: `1px solid ${C.linea}` }}
      >
        <div className="font-semibold" style={{ fontSize: 16 }}>
          {props.titulo}
        </div>
        <p style={{ fontSize: 12.5, color: C.suave, lineHeight: 1.5, marginTop: 6 }}>{props.cuerpo}</p>
        <div className="mt-4 flex flex-col" style={{ gap: 8 }}>
          <BotonGrande chico onClick={props.onConfirmar}>
            {props.accion}
          </BotonGrande>
          <BotonGrande chico tono="gris" onClick={props.onCancelar}>
            Cancelar
          </BotonGrande>
        </div>
      </div>
    </div>
  );
}

/* Tarjeta genérica de la app (fondo tarjeta, borde suave). */
export function Tarjeta(props: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl px-4 py-4 ${props.className ?? ""}`}
      style={{ background: APP.tarjeta, border: `1px solid ${C.lineaSuave}` }}
    >
      {props.children}
    </div>
  );
}

/* Fila rótulo-valor de las tarjetas de resumen (Cargando, Listo). */
export function FilaResumen(props: { rotulo: string; valor: ReactNode; destacado?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span style={{ fontSize: 11.5, color: C.suave }}>{props.rotulo}</span>
      <span
        className={`font-mono ${props.destacado ? "font-bold" : ""}`}
        style={{ fontSize: props.destacado ? 14 : 12.5 }}
      >
        {props.valor}
      </span>
    </div>
  );
}
