// Logo del cliente o sus iniciales — nunca una imagen rota (DEC-017).
// Componente puro reutilizado por la lista, la ficha y el encabezado.

import { useState } from "react";
import { TEMA } from "../../tema";

export function inicialesDe(nombre: string): string {
  return (
    nombre
      .split(/\s+/)
      .filter((palabra) => /^[a-záéíóúñ]/i.test(palabra))
      .slice(0, 2)
      .map((palabra) => palabra[0]!.toUpperCase())
      .join("") || "?"
  );
}

export function LogoCliente(props: { nombre: string; logoUrl: string | null; tamano?: number }) {
  const tamano = props.tamano ?? 34;
  const [fallo, setFallo] = useState(false);

  if (props.logoUrl && !fallo) {
    return (
      <img
        src={props.logoUrl}
        alt={`Logo de ${props.nombre}`}
        width={tamano}
        height={tamano}
        onError={() => setFallo(true)}
        className="rounded-md"
        style={{ objectFit: "contain", background: TEMA.panelAlto }}
      />
    );
  }
  return (
    <div
      aria-label={`Iniciales de ${props.nombre}`}
      className="flex items-center justify-center rounded-md font-semibold"
      style={{
        width: tamano,
        height: tamano,
        background: TEMA.panelAlto,
        border: `1px solid ${TEMA.linea}`,
        color: TEMA.suave,
        fontSize: tamano * 0.38,
      }}
    >
      {inicialesDe(props.nombre)}
    </div>
  );
}
