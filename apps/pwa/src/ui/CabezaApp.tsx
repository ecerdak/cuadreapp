// Cabecera de la app: Lubryco 26 px │ logotipo 28 px │ placa 9.5, la
// sede a la derecha y la barra de avance de 5 segmentos. Transcrita del
// mockup aprobado (CabezaApp).

import { C } from "../marca/tokens";
import { Logotipo, Placa } from "../marca/Logotipo";
import logoLubryco from "../marca/assets/lubryco.webp";

/* Avance por paso del flujo (equipo=1 … después=5; listo=5; resto sin barra). */
const AVANCE: Record<string, number> = {
  equipo: 1,
  conductor: 2,
  antes: 3,
  cargando: 4,
  despues: 5,
  listo: 5,
};

const TOTAL = 5;

export function CabezaApp(props: { paso?: string; sede?: string }) {
  const avance = props.paso ? (AVANCE[props.paso] ?? 0) : 0;
  return (
    <div style={{ borderBottom: `1px solid ${C.lineaSuave}` }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center" style={{ gap: 9 }}>
          <img src={logoLubryco} alt="Lubryco" style={{ height: 26, width: "auto" }} />
          <div style={{ width: 1, height: 22, background: C.linea }} />
          <Logotipo tam={28} />
          <Placa tam={9.5} />
        </div>
        {props.sede ? <span style={{ fontSize: 10, color: C.suave }}>{props.sede}</span> : null}
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
