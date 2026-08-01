// Cámara en vivo, NUNCA galería (regla no negociable, spec §8.1):
// capture="environment" fuerza la cámara trasera en el celular. En un
// navegador de escritorio abre el selector de archivos — limitación
// conocida de desarrollo, en campo esto corre en un celular.

import { useRef, useState } from "react";
import { comprimirFoto } from "./comprimir";

export function CamaraEnVivo(props: {
  etiqueta: string;
  hayFoto: boolean;
  onFoto: (foto: { bytes: ArrayBuffer; tipo: string }) => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);

  return (
    <div>
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (evento) => {
          const archivo = evento.target.files?.[0];
          evento.target.value = ""; // permitir re-tomar
          if (!archivo) return;
          setProcesando(true);
          try {
            props.onFoto(await comprimirFoto(archivo));
          } finally {
            setProcesando(false);
          }
        }}
      />
      <button
        type="button"
        onClick={() => entrada.current?.click()}
        disabled={procesando}
        className={`w-full rounded-xl border-2 p-4 text-lg font-semibold ${
          props.hayFoto
            ? "border-emerald-600 bg-emerald-950 text-emerald-200"
            : "border-dashed border-[#5B90C4] bg-[#121C25] text-[#5B90C4]"
        }`}
      >
        {procesando
          ? "Procesando…"
          : props.hayFoto
            ? `✓ ${props.etiqueta} tomada — re-tomar`
            : `📷 ${props.etiqueta}`}
      </button>
    </div>
  );
}
