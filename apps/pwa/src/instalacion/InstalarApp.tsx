// Experiencia de instalación (FASE 2 del hardening PWA):
//  - Android: botón real cuando el navegador entrega beforeinstallprompt;
//    instrucciones del menú ⋮ cuando no.
//  - iOS: guía breve Compartir → Añadir a pantalla de inicio (no existe
//    beforeinstallprompt en Safari).
//  - Instalada (standalone): no se muestra nada.
// Nunca bloquea seguir usando el navegador.

import { useEffect, useState } from "react";
import { detectarPlataforma, enModoApp } from "./instalacion";

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
    <div className="rounded-xl border border-[#22374A] bg-[#111C26] p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-[#E7EEF6]">Instala CuadreApp en este teléfono</p>
        <button
          type="button"
          aria-label="Ocultar"
          onClick={() => setOculto(true)}
          className="px-1 text-[#8AA0B6]"
        >
          ✕
        </button>
      </div>
      {plataforma === "android" && evento ? (
        <button
          type="button"
          onClick={() => void evento.prompt()}
          className="mt-2 w-full rounded-lg bg-[#F5E01B] p-3 font-bold text-black"
        >
          Instalar CuadreApp
        </button>
      ) : plataforma === "android" ? (
        <p className="mt-1 text-[#8AA0B6]">
          Abre el menú <span className="font-bold">⋮</span> de Chrome y toca{" "}
          <span className="font-bold">"Agregar a la pantalla principal"</span>.
        </p>
      ) : (
        <p className="mt-1 text-[#8AA0B6]">
          En Safari: toca <span className="font-bold">Compartir</span> (el cuadrado con la flecha) y
          luego <span className="font-bold">"Añadir a pantalla de inicio"</span>.
        </p>
      )}
    </div>
  );
}
