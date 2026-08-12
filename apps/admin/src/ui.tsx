// Piezas compartidas de la consola, con los tokens del contrato visual
// (misma identidad del Dashboard). El estado nunca se comunica solo
// por color y el foco siempre es visible.

import { useState, type FormEvent, type ReactNode } from "react";
import { TEMA } from "./tema";

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

export function ChipActivo(props: { activo: boolean }) {
  const col = props.activo ? TEMA.verde : TEMA.suave;
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
      {props.activo ? "Activo" : "Inactivo"}
    </span>
  );
}

export function ChipEstado(props: { estado: "ok" | "advertencia" | "inconsistente" }) {
  const col =
    props.estado === "ok" ? TEMA.verde : props.estado === "advertencia" ? TEMA.ambar : TEMA.rojo;
  const texto =
    props.estado === "ok" ? "Cuadra" : props.estado === "advertencia" ? "Revisar" : "No cuadra";
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
      {texto}
    </span>
  );
}

export function Boton(props: {
  children: ReactNode;
  onClick?: () => void;
  tipo?: "button" | "submit";
  secundario?: boolean;
  deshabilitado?: boolean;
}) {
  return (
    <button
      type={props.tipo ?? "button"}
      onClick={props.onClick}
      disabled={props.deshabilitado}
      className="rounded-md font-semibold focus-visible:outline focus-visible:outline-2"
      style={{
        padding: "10px 16px",
        fontSize: 13,
        // Deshabilitado LEGIBLE: «Guardando…» es información, no puede
        // ser tinta invisible sobre el panel (P0.3).
        color: props.deshabilitado ? TEMA.suave : props.secundario ? TEMA.texto : "#12202C",
        background: props.deshabilitado
          ? TEMA.panelAlto
          : props.secundario
            ? TEMA.panelAlto
            : TEMA.amarillo,
        border: `1px solid ${props.secundario || props.deshabilitado ? TEMA.linea : TEMA.amarillo}`,
      }}
    >
      {props.children}
    </button>
  );
}

export function Campo(props: {
  rotulo: string;
  valor: string;
  onCambio: (valor: string) => void;
  tipo?: string;
  placeholder?: string;
  requerido?: boolean;
}) {
  return (
    <label className="block">
      <Eyebrow>{props.rotulo}</Eyebrow>
      <input
        type={props.tipo ?? "text"}
        value={props.valor}
        onChange={(evento) => props.onCambio(evento.target.value)}
        placeholder={props.placeholder}
        required={props.requerido}
        className="mt-1 w-full rounded-md px-3 py-2 focus-visible:outline focus-visible:outline-2"
        style={{
          background: TEMA.panelAlto,
          border: `1px solid ${TEMA.linea}`,
          fontSize: 14,
          color: TEMA.texto,
        }}
      />
    </label>
  );
}

export function Selector(props: {
  rotulo: string;
  valor: string;
  onCambio: (valor: string) => void;
  opciones: Array<{ valor: string; rotulo: string }>;
}) {
  return (
    <label className="block">
      <Eyebrow>{props.rotulo}</Eyebrow>
      <select
        value={props.valor}
        onChange={(evento) => props.onCambio(evento.target.value)}
        className="mt-1 w-full rounded-md px-3 py-2 focus-visible:outline focus-visible:outline-2"
        style={{
          background: TEMA.panelAlto,
          border: `1px solid ${TEMA.linea}`,
          fontSize: 14,
          color: TEMA.texto,
        }}
      >
        {props.opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Diálogo de formulario: crear/editar entidades del catálogo.
 *
 *  P0.3: UNA sola acción primaria por modal. El pie trae «Cancelar» y
 *  el botón de envío con la etiqueta que el modal declare — el
 *  contenido jamás agrega su propio botón primario (dos primarios en
 *  un modal fue exactamente el defecto del alta de accesos). `sinPie`
 *  es para diálogos informativos que traen sus propias acciones. */
export function Dialogo(props: {
  titulo: string;
  error?: string | null;
  onCerrar: () => void;
  onEnviar?: () => void;
  enviando?: boolean;
  /** Bloquea el envío (validación del modal), sin ocultar el botón. */
  deshabilitado?: boolean;
  /** Etiqueta de la acción primaria; «Guardar» si no se declara. */
  etiquetaEnviar?: string;
  etiquetaEnviando?: string;
  /** Rótulo del cierre; «Cancelar» solo cuando de verdad cancela. */
  etiquetaCerrar?: string;
  /** Sin pie: el contenido trae sus propias acciones. */
  sinPie?: boolean;
  children: ReactNode;
}) {
  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    // Reentrada bloqueada: ni doble clic ni Enter repetido envían dos
    // veces, y un envío deshabilitado tampoco entra por el teclado.
    if (props.enviando || props.deshabilitado) return;
    props.onEnviar?.();
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={props.titulo}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(4,8,12,.62)" }}
    >
      <form
        onSubmit={enviar}
        className="flex w-full max-w-md flex-col gap-3 rounded-lg p-5"
        style={{ background: TEMA.panel, border: `1px solid ${TEMA.linea}` }}
      >
        <div className="font-semibold" style={{ fontSize: 16 }}>
          {props.titulo}
        </div>
        {props.children}
        {props.error ? (
          <div style={{ fontSize: 12, color: TEMA.rojo }} role="alert">
            {props.error}
          </div>
        ) : null}
        {props.sinPie ? null : (
          <div className="mt-1 flex justify-end" style={{ gap: 8 }}>
            <Boton secundario onClick={props.onCerrar}>
              {props.etiquetaCerrar ?? "Cancelar"}
            </Boton>
            <Boton tipo="submit" deshabilitado={props.enviando || props.deshabilitado}>
              {props.enviando
                ? (props.etiquetaEnviando ?? "Guardando…")
                : (props.etiquetaEnviar ?? "Guardar")}
            </Boton>
          </div>
        )}
      </form>
    </div>
  );
}

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

export const celda = {
  padding: "10px 12px",
  borderBottom: `1px solid ${TEMA.lineaSuave}`,
  fontSize: 12.5,
} as const;

/** Barra de búsqueda + filtro por estado, común a los catálogos. */
export function BarraBusqueda(props: {
  buscar: string;
  onBuscar: (valor: string) => void;
  soloActivos: boolean;
  onSoloActivos: (valor: boolean) => void;
  accion?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between" style={{ gap: 10 }}>
      <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
        <input
          value={props.buscar}
          onChange={(evento) => props.onBuscar(evento.target.value)}
          placeholder="Buscar…"
          aria-label="Buscar"
          className="rounded-md px-3 py-2 focus-visible:outline focus-visible:outline-2"
          style={{
            background: TEMA.panel,
            border: `1px solid ${TEMA.linea}`,
            fontSize: 13,
            color: TEMA.texto,
            minWidth: 220,
          }}
        />
        <label className="flex items-center" style={{ gap: 6, fontSize: 12, color: TEMA.suave }}>
          <input
            type="checkbox"
            checked={props.soloActivos}
            onChange={(evento) => props.onSoloActivos(evento.target.checked)}
          />
          Solo activos
        </label>
      </div>
      {props.accion}
    </div>
  );
}

export function useFormulario<T extends Record<string, string>>(inicial: T) {
  const [valores, setValores] = useState<T>(inicial);
  const cambiar = (campo: keyof T) => (valor: string) => setValores((v) => ({ ...v, [campo]: valor }));
  return { valores, cambiar, reiniciar: () => setValores(inicial) };
}

export function Esqueleto(props: { alto?: number }) {
  return (
    <div
      aria-hidden="true"
      className="rounded-lg motion-safe:animate-pulse"
      style={{ background: TEMA.panelAlto, height: props.alto ?? 96, width: "100%" }}
    />
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
      <div className="mt-3">
        <Boton onClick={props.onReintentar}>Reintentar</Boton>
      </div>
    </div>
  );
}

export const horaCorta = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const gal = (valor: number): string =>
  valor.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
