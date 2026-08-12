// Piezas compartidas de las pantallas de acceso (login, contraseña,
// recuperación): la misma tarjeta con la marca, los mismos campos y el
// mismo botón. Una sola forma de verse para toda la puerta del
// producto — P0.1 agregó pantallas y ninguna inventa su propio estilo.

import { TEMA } from "../tema";
import { Logotipo, Placa } from "../marca/Logotipo";
import logoLubryco from "../marca/assets/lubryco.webp";

export function TarjetaAcceso(props: {
  children: React.ReactNode;
  onSubmit?: (evento: React.FormEvent) => void;
  /** Línea bajo la marca; por defecto la del producto. */
  bajada?: string;
}) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center px-6"
      style={{ background: TEMA.fondo, color: TEMA.texto }}
    >
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          props.onSubmit?.(evento);
        }}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg p-6"
        style={{ background: TEMA.panel, border: `1px solid ${TEMA.lineaSuave}` }}
      >
        <div className="flex flex-col items-center" style={{ gap: 10, marginBottom: 6 }}>
          <img src={logoLubryco} alt="Lubryco" style={{ height: 44, width: "auto" }} />
          <div className="flex items-center" style={{ gap: 9 }}>
            <Logotipo tam={34} />
            <Placa />
          </div>
          <div style={{ fontSize: 11, color: TEMA.suave, textAlign: "center" }}>
            {props.bajada ?? "Control de combustible en planta"}
          </div>
        </div>
        {props.children}
      </form>
    </div>
  );
}

export function CampoAcceso(props: {
  rotulo: string;
  tipo: string;
  valor: string;
  onCambio: (valor: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col" style={{ gap: 5 }}>
      <span style={{ fontSize: 11, color: TEMA.suave }}>{props.rotulo}</span>
      <input
        type={props.tipo}
        required
        autoComplete={props.autoComplete}
        value={props.valor}
        onChange={(evento) => props.onCambio(evento.target.value)}
        className="rounded-md focus-visible:outline focus-visible:outline-2"
        style={{
          background: TEMA.panelAlto,
          border: `1px solid ${TEMA.linea}`,
          color: TEMA.texto,
          fontSize: 14,
          padding: "11px 12px",
        }}
      />
    </label>
  );
}

export function BotonAcceso(props: { etiqueta: string; ocupado?: boolean; etiquetaOcupado?: string }) {
  return (
    <button
      type="submit"
      disabled={props.ocupado}
      className="rounded-md font-semibold focus-visible:outline focus-visible:outline-2"
      style={{
        background: TEMA.amarillo,
        color: "#12202C",
        padding: "12px 20px",
        fontSize: 14,
        opacity: props.ocupado ? 0.6 : 1,
      }}
    >
      {props.ocupado ? (props.etiquetaOcupado ?? "Guardando…") : props.etiqueta}
    </button>
  );
}

export function AvisoAcceso(props: { children: React.ReactNode; tono?: "error" | "ok" | "info" }) {
  const color = props.tono === "ok" ? TEMA.verde : props.tono === "info" ? TEMA.suave : TEMA.rojo;
  return (
    <div
      role={props.tono === "error" || !props.tono ? "alert" : "status"}
      style={{ fontSize: 12, color, lineHeight: 1.5 }}
    >
      {props.children}
    </div>
  );
}
