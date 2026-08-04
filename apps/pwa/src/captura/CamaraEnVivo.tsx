// Cámara en vivo, NUNCA galería (regla no negociable, spec §8.1):
// capture="environment" fuerza la cámara trasera. El visor replica el
// diseño aprobado: la carátula del Fill-Rite como guía de encuadre con
// el marco amarillo, obturador blanco, y la foto real del conductor en
// el mismo marco (verde) al capturar. En escritorio el input abre el
// selector de archivos — limitación conocida de desarrollo.

import { useEffect, useMemo, useRef, useState } from "react";
import { comprimirFoto } from "./comprimir";
import { C } from "../marca/tokens";
import guiaFillRite from "../marca/assets/fillrite-antes.webp";

export function CamaraEnVivo(props: {
  etiqueta: string;
  instruccion?: string;
  foto: { bytes: ArrayBuffer; tipo: string } | null;
  onFoto: (foto: { bytes: ArrayBuffer; tipo: string }) => void;
  /** Imagen de guía de encuadre. Por defecto, la carátula Fill-Rite
   *  (flujo original); null = visor neutro sin marco (otros perfiles). */
  guia?: string | null;
}) {
  const guia = props.guia === undefined ? guiaFillRite : props.guia;
  const entrada = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const tomada = props.foto !== null;

  // La foto tomada se muestra dentro del mismo marco.
  const urlFoto = useMemo(
    () =>
      props.foto ? URL.createObjectURL(new Blob([props.foto.bytes], { type: props.foto.tipo })) : null,
    [props.foto],
  );
  useEffect(() => {
    return () => {
      if (urlFoto) URL.revokeObjectURL(urlFoto);
    };
  }, [urlFoto]);

  return (
    <div className="px-4">
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-label={props.etiqueta}
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
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ height: 244, background: "#05090D", border: `1px solid ${C.linea}` }}
      >
        {urlFoto || guia ? (
          <img
            src={urlFoto ?? guia!}
            alt={tomada ? props.etiqueta : "Guía de encuadre"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: tomada ? "none" : "brightness(0.82) saturate(0.9)",
            }}
          />
        ) : null}
        {/* marco guía (solo cuando hay imagen de guía o foto tomada) */}
        {urlFoto || guia ? (
          <div
            className="absolute"
            style={{
              left: "12%",
              right: "12%",
              top: "26%",
              height: "40%",
              border: `2px solid ${tomada ? C.verde : C.amarillo}`,
              borderRadius: 6,
              boxShadow: "0 0 0 9999px rgba(4,8,12,.42)",
            }}
          />
        ) : null}
        <div className="absolute left-0 right-0 flex justify-center" style={{ top: 12 }}>
          <span
            className="rounded-full px-3 py-1 font-semibold"
            style={{
              fontSize: 10.5,
              background: "rgba(6,12,18,.78)",
              color: tomada ? C.verde : C.amarillo,
            }}
          >
            {procesando
              ? "Procesando…"
              : tomada
                ? "Foto tomada — toca para re-tomar"
                : (props.instruccion ?? "Encuadra la carátula completa")}
          </span>
        </div>
        {/* obturador: dispara la cámara del sistema */}
        <button
          type="button"
          disabled={procesando}
          onClick={() => entrada.current?.click()}
          className="absolute left-1/2 flex items-center justify-center"
          style={
            tomada
              ? {
                  inset: 0,
                  transform: "none",
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  border: "none",
                }
              : {
                  bottom: 14,
                  transform: "translateX(-50%)",
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  background: "#F4F7FA",
                  border: "4px solid rgba(255,255,255,.35)",
                }
          }
          aria-label={tomada ? `${props.etiqueta} — re-tomar` : props.etiqueta}
        >
          {!tomada && (
            <span style={{ width: 40, height: 40, borderRadius: 20, background: "#DCE4EB" }} />
          )}
        </button>
      </div>
      <div style={{ fontSize: 10.5, color: C.suave, marginTop: 7, textAlign: "center" }}>
        Solo cámara en vivo · queda con hora y ubicación
      </div>
    </div>
  );
}
