// Estado inicial del tablero (P0.6): el cliente que todavía no
// registra NINGUNA carga no merece paneles en cero y cuatro avisos
// repetidos — merece saber que su tablero está listo y qué va a pasar.
//
// La adaptación por perfil usa el VOCABULARIO que el perfil declara
// (sus paneles de Hoy), nunca su código ni el nombre del cliente. Y
// aquí no se menciona la consola de Lubryco: el supervisor no tiene
// nada que configurar.

import { Eyebrow, Panel } from "./basicos";
import type { ContextoTablero } from "../datos/puertos";
import { TEMA } from "../tema";

/** Qué registra el operador, contado con las palabras del perfil. */
function pasoDeRegistro(contexto: ContextoTablero): string {
  if (contexto.perfil.panelesHoy.includes("inventario")) {
    return "Registra cada carga: con cuánto llega el equipo, cuántos galones se le cargan y el total al salir, con sus fotos.";
  }
  if (contexto.perfil.panelesHoy.includes("totalizador")) {
    return "Registra cada carga con las lecturas del medidor — tanda y totalizador, antes y después — y sus fotos.";
  }
  return "Registra cada carga con sus cifras y sus fotos.";
}

export function BienvenidaTablero(props: { contexto: ContextoTablero; alActualizar: () => void }) {
  const pasos = [
    "El operador abre CuadreApp en el dispositivo de la planta.",
    pasoDeRegistro(props.contexto),
    "Este Dashboard se actualiza automáticamente: el veredicto del día, el consumo y la evidencia de cada carga.",
  ];

  return (
    <Panel className="mx-auto p-8" alto>
      <div className="mx-auto" style={{ maxWidth: 560 }}>
        <Eyebrow color={TEMA.verde}>Tu Dashboard está listo</Eyebrow>
        <p
          className="mt-2 font-semibold leading-snug"
          style={{ fontSize: 22, letterSpacing: "-0.01em" }}
        >
          Bienvenido a CuadreApp
        </p>
        <p style={{ fontSize: 12.5, color: TEMA.suave, marginTop: 8, lineHeight: 1.6 }}>
          Los indicadores aparecerán automáticamente cuando se registre la primera carga de combustible.
        </p>

        <ol className="mt-6 flex flex-col" style={{ gap: 14, padding: 0, margin: 0 }}>
          {pasos.map((paso, indice) => (
            <li key={indice} className="flex" style={{ gap: 12, listStyle: "none" }}>
              <span
                className="flex shrink-0 items-center justify-center rounded-full font-mono font-semibold"
                style={{
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  background: TEMA.panel,
                  border: `1px solid ${TEMA.linea}`,
                  color: TEMA.amarillo,
                }}
              >
                {indice + 1}
              </span>
              <span style={{ fontSize: 12.5, color: TEMA.texto, lineHeight: 1.6 }}>{paso}</span>
            </li>
          ))}
        </ol>

        <div
          className="mt-7 flex flex-wrap items-center justify-between pt-5"
          style={{ borderTop: `1px solid ${TEMA.lineaSuave}`, gap: 10 }}
        >
          <span style={{ fontSize: 11, color: TEMA.suave }}>
            Esta pantalla se actualiza sola cada minuto.
          </span>
          <button
            type="button"
            onClick={props.alActualizar}
            className="rounded-md font-semibold focus-visible:outline focus-visible:outline-2"
            style={{
              background: TEMA.panelAlto,
              border: `1px solid ${TEMA.linea}`,
              color: TEMA.texto,
              padding: "9px 14px",
              fontSize: 12.5,
            }}
          >
            Actualizar ahora
          </button>
        </div>
      </div>
    </Panel>
  );
}
