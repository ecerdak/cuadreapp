// Experiencia de instalación (FASE 2 del hardening PWA), vestida con
// el contrato visual:
//  - Android: botón real cuando el navegador entrega beforeinstallprompt;
//    instrucciones del menú ⋮ cuando no.
//  - iOS: guía breve Compartir → Añadir a pantalla de inicio (no existe
//    beforeinstallprompt en Safari).
//  - Instalada (standalone): no se muestra nada.
// Nunca bloquea seguir usando el navegador.

import { useEffect, useState } from "react";
import { detectarPlataforma, enModoApp } from "./instalacion";
import { APP, C } from "../marca/tokens";

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
}

export function InstalarApp() {
  const [evento, setEvento] = useState<EventoInstalacion | null>(null);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    const capturar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalacion);
    };
    window.addEventListener("beforeinstallprompt", capturar);
    return () => window.removeEventListener("beforeinstallprompt", capturar);
  }, []);

  if (oculto || enModoApp()) return null;
  const plataforma = detectarPlataforma(navigator.userAgent);
  if (plataforma === "otra") return null;

  return (
    <div
      className="rounded-lg px-3 py-3"
      style={{ background: APP.tarjeta, border: `1px solid ${C.lineaSuave}` }}
    >
      <div className="flex items-start justify-between" style={{ gap: 8 }}>
        <p className="font-semibold" style={{ fontSize: 13 }}>
          Instala CuadreApp en este teléfono
        </p>
        <button
          type="button"
          aria-label="Ocultar"
          onClick={() => setOculto(true)}
          className="px-1"
          style={{ color: C.suave }}
        >
          ✕
        </button>
      </div>
      {plataforma === "android" && evento ? (
        <button
          type="button"
          onClick={() => void evento.prompt()}
          className="mt-2 w-full rounded-lg font-semibold"
          style={{ background: C.amarillo, color: "#101A22", padding: "13px 16px", fontSize: 14 }}
        >
          Instalar CuadreApp
        </button>
      ) : plataforma === "android" ? (
        <p style={{ fontSize: 11.5, color: C.suave, lineHeight: 1.5, marginTop: 3 }}>
          Abre el menú{" "}
          <span className="font-semibold" style={{ color: C.texto }}>
            ⋮
          </span>{" "}
          de Chrome y toca{" "}
          <span className="font-semibold" style={{ color: C.texto }}>
            "Agregar a la pantalla principal"
          </span>
          .
        </p>
      ) : (
        <p style={{ fontSize: 11.5, color: C.suave, lineHeight: 1.5, marginTop: 3 }}>
          En Safari: toca{" "}
          <span className="font-semibold" style={{ color: C.texto }}>
            Compartir
          </span>{" "}
          (el cuadrado con la flecha) y luego{" "}
          <span className="font-semibold" style={{ color: C.texto }}>
            "Añadir a pantalla de inicio"
          </span>
          .
        </p>
      )}
    </div>
  );
}
