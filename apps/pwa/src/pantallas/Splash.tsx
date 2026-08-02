// [00] BIENVENIDA: la marca aparece una vez y se quita del camino.
// Azul de Lubryco a sangre, logotipo 54, eslogan, y el endoso BY +
// Lubryco a 70 px (decisión aprobada: manda sobre el PDF de marca).
// Avanza al tocar, o sola a los 2 s (el temporizador vive en App).

import { MARCA } from "../marca/tokens";
import { Logotipo } from "../marca/Logotipo";
import logoLubryco from "../marca/assets/lubryco.webp";

export function Splash(props: { onSeguir: () => void }) {
  return (
    <div
      onClick={props.onSeguir}
      className="flex min-h-dvh w-full flex-col items-center"
      style={{ background: MARCA.azul, cursor: "pointer", paddingBottom: 38 }}
    >
      <div className="flex flex-1 flex-col items-center justify-center" style={{ paddingBottom: 54 }}>
        <Logotipo tam={54} />
        <div
          style={{
            fontFamily: MARCA.condensada,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.3em",
            paddingLeft: "0.3em",
            color: MARCA.negro,
            marginTop: 20,
          }}
        >
          CADA GALÓN CUADRA
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span
          style={{
            fontFamily: MARCA.ui,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.18em",
            paddingLeft: "0.18em",
            color: "#EAF2F8",
          }}
        >
          BY
        </span>
        <img src={logoLubryco} alt="Lubryco" style={{ height: 70, width: "auto", marginTop: 10 }} />
      </div>
    </div>
  );
}
