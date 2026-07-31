import type { ReactNode } from "react";

export function Pantalla(props: { titulo: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-4">
      <h1 className="text-xl font-bold text-[#8AA0B6]">{props.titulo}</h1>
      {props.children}
    </div>
  );
}

export function BotonPrincipal(props: {
  children: ReactNode;
  onClick: () => void;
  deshabilitado?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.deshabilitado}
      className="w-full rounded-xl bg-[#F5E01B] p-5 text-xl font-bold text-black disabled:opacity-40"
    >
      {props.children}
    </button>
  );
}

export function CampoNumerico(props: {
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  ayuda?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold uppercase tracking-wide text-[#8AA0B6]">
        {props.etiqueta}
      </span>
      <input
        inputMode="decimal"
        value={props.valor}
        onChange={(evento) => props.onCambio(evento.target.value)}
        className="w-full rounded-xl border border-[#22374A] bg-[#121C25] p-4 text-2xl font-bold tabular-nums"
      />
      {props.ayuda ? <span className="mt-1 block text-sm text-[#8AA0B6]">{props.ayuda}</span> : null}
    </label>
  );
}

export function Aviso(props: { tipo: "info" | "advertencia" | "inconsistente"; children: ReactNode }) {
  const clases = {
    info: "border-sky-700 bg-sky-950 text-sky-200",
    advertencia: "border-amber-600 bg-amber-950 text-amber-200",
    inconsistente: "border-red-700 bg-red-950 text-red-200",
  }[props.tipo];
  return <div className={`rounded-xl border p-3 text-sm ${clases}`}>{props.children}</div>;
}
