// El logotipo de CuadreApp: cuatro copias del mismo texto apiladas —
// sombra dura, halo blanco, contorno negro y relleno amarillo con
// filete — igual que el letrero físico de Lubryco. Valores exactos del
// contrato visual (tabla CAPAS del mockup aprobado).

import type { CSSProperties } from "react";
import { MARCA } from "./tokens";

const CAPAS: Record<
  number,
  { off: number; sombra: number; halo: number; contorno: number; filete: number }
> = {
  118: { off: 10, sombra: 20, halo: 16, contorno: 11, filete: 3 },
  54: { off: 5, sombra: 10, halo: 8, contorno: 5, filete: 1.5 },
  34: { off: 3, sombra: 6, halo: 4.5, contorno: 3, filete: 1 },
};

const capas = (t: number) =>
  CAPAS[t] ?? { off: t * 0.08, sombra: t * 0.17, halo: t * 0.13, contorno: t * 0.09, filete: t * 0.025 };

export function Logotipo(props: { tam?: number; texto?: string; halo?: boolean }) {
  const { tam = 34, texto = "Cuadre", halo = true } = props;
  const k = capas(tam);
  const base: CSSProperties = {
    fontFamily: MARCA.script,
    fontSize: tam,
    lineHeight: 1.35,
    whiteSpace: "nowrap",
    paintOrder: "stroke",
  };
  return (
    <span style={{ ...base, position: "relative", display: "inline-block" }} aria-label="Cuadre">
      <span
        aria-hidden="true"
        style={{
          ...base,
          position: "absolute",
          left: k.off,
          top: k.off,
          color: MARCA.negro,
          WebkitTextStroke: `${k.sombra}px ${MARCA.negro}`,
        }}
      >
        {texto}
      </span>
      {halo && (
        <span
          aria-hidden="true"
          style={{
            ...base,
            position: "absolute",
            left: 0,
            top: 0,
            color: MARCA.halo,
            WebkitTextStroke: `${k.halo}px ${MARCA.halo}`,
          }}
        >
          {texto}
        </span>
      )}
      <span
        aria-hidden="true"
        style={{
          ...base,
          position: "absolute",
          left: 0,
          top: 0,
          color: MARCA.negro,
          WebkitTextStroke: `${k.contorno}px ${MARCA.negro}`,
        }}
      >
        {texto}
      </span>
      <span
        style={{
          ...base,
          position: "relative",
          color: MARCA.amarillo,
          WebkitTextStroke: `${k.filete}px ${MARCA.negro}`,
        }}
      >
        {texto}
      </span>
    </span>
  );
}

/* Placa APP · Barlow Condensed 700 sobre el amarillo del logotipo */
export function Placa(props: { children?: string; tam?: number }) {
  const { children = "APP", tam = 12 } = props;
  return (
    <span
      style={{
        fontFamily: MARCA.condensada,
        fontWeight: 700,
        fontSize: tam,
        letterSpacing: "0.2em",
        color: MARCA.negro,
        background: MARCA.amarillo,
        padding: "5px 7px 4px",
        borderRadius: 3,
        lineHeight: 1,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}
