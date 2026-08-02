// Enrolamiento del dispositivo (Etapa S): se hace UNA vez por celular,
// con un código de un solo uso que entrega el supervisor. Después de
// esto, el conductor nunca ve una pantalla de login (spec §5).

import { useState } from "react";
import { Aviso, BotonPrincipal, Pantalla } from "../ui/basicos";
import { InstalarApp } from "../instalacion/InstalarApp";

export function Enrolar(props: {
  onEnrolar: (
    codigo: string,
    nombreDispositivo: string | null,
  ) => Promise<{ ok: boolean; detalle?: string }>;
}) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    setEnviando(true);
    setError(null);
    const resultado = await props.onEnrolar(codigo.trim(), nombre.trim() === "" ? null : nombre.trim());
    setEnviando(false);
    if (!resultado.ok) setError(resultado.detalle ?? "No se pudo enrolar.");
  }

  return (
    <Pantalla titulo="Enrolar este dispositivo">
      <InstalarApp />
      <p className="text-[#8AA0B6]">
        Este celular se enrola una sola vez a la estación. Pídele el código de enrolamiento al
        supervisor.
      </p>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold uppercase tracking-wide text-[#8AA0B6]">
          Código de enrolamiento
        </span>
        <input
          value={codigo}
          onChange={(evento) => setCodigo(evento.target.value)}
          autoCapitalize="characters"
          className="w-full rounded-xl border border-[#22374A] bg-[#121C25] p-4 text-xl font-bold tracking-widest"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold uppercase tracking-wide text-[#8AA0B6]">
          Nombre del dispositivo (opcional)
        </span>
        <input
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          placeholder="Tablet almacén"
          className="w-full rounded-xl border border-[#22374A] bg-[#121C25] p-3"
        />
      </label>
      {error ? <Aviso tipo="inconsistente">{error}</Aviso> : null}
      <BotonPrincipal
        onClick={() => void confirmar()}
        deshabilitado={codigo.trim().length < 6 || enviando}
      >
        {enviando ? "Enrolando…" : "Enrolar"}
      </BotonPrincipal>
    </Pantalla>
  );
}
