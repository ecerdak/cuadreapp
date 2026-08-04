// Cabecera de la app: Lubryco 26 px │ logotipo 28 px │ placa 9.5, la
// sede a la derecha y la barra de avance. Transcrita del mockup
// aprobado (CabezaApp). El avance se deriva de la definición del flujo
// (flujo/perfiles.ts, DEC-016) — por defecto, el flujo original.

import { C } from "../marca/tokens";
import { Logotipo, Placa } from "../marca/Logotipo";
import logoLubryco from "../marca/assets/lubryco.webp";
import { derivarAvance, FLUJO_MEDIDOR_DOBLE } from "../flujo/perfiles";

const AVANCE_POR_DEFECTO = derivarAvance(FLUJO_MEDIDOR_DOBLE);

export function CabezaApp(props: {
  paso?: string;
  sede?: string;
  avance?: { porPaso: Record<string, number>; total: number };
  /** Identidad del cliente (DEC-017): nombre y logo cacheado. Sin
   *  logo, iniciales del cliente — jamás una imagen rota. */
  cliente?: string;
  logoCliente?: string | null;
  /** Acento corporativo (#RRGGBB, DEC-018); null = paleta CuadreApp. */
  colorCliente?: string | null;
}) {
  const { porPaso, total: TOTAL } = props.avance ?? AVANCE_POR_DEFECTO;
  const avance = props.paso ? (porPaso[props.paso] ?? 0) : 0;
  const acento = /^#[0-9A-Fa-f]{6}$/.test(props.colorCliente ?? "") ? props.colorCliente! : C.lineaSuave;
  const iniciales = (props.cliente ?? "")
    .split(/\s+/)
    .filter((palabra) => /^[a-záéíóúñ]/i.test(palabra))
    .slice(0, 2)
    .map((palabra) => palabra[0]!.toUpperCase())
    .join("");
  return (
    <div style={{ borderBottom: `1px solid ${C.lineaSuave}` }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center" style={{ gap: 9 }}>
          <img src={logoLubryco} alt="Lubryco" style={{ height: 26, width: "auto" }} />
          <div style={{ width: 1, height: 22, background: C.linea }} />
          <Logotipo tam={28} />
          <Placa tam={9.5} />
        </div>
        <div className="flex items-center" style={{ gap: 7 }}>
          {props.logoCliente ? (
            <img
              src={props.logoCliente}
              alt={props.cliente ? `Logo de ${props.cliente}` : "Logo del cliente"}
              style={{ height: 20, width: "auto", maxWidth: 56, objectFit: "contain" }}
            />
          ) : props.cliente ? (
            <span
              aria-label={`Iniciales de ${props.cliente}`}
              className="flex items-center justify-center rounded font-semibold"
              style={{
                width: 20,
                height: 20,
                fontSize: 9,
                background: C.lineaSuave,
                border: `1px solid ${acento}`,
                color: C.suave,
              }}
            >
              {iniciales || "?"}
            </span>
          ) : null}
          {props.sede ? <span style={{ fontSize: 10, color: C.suave }}>{props.sede}</span> : null}
        </div>
      </div>
      {avance > 0 && (
        <div className="flex px-4 pb-3" style={{ gap: 4 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i < avance ? C.amarillo : C.lineaSuave,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
