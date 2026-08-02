// Enrolamiento del dispositivo (Etapa S): se hace UNA vez por celular,
// con un código de un solo uso que entrega el supervisor. Después de
// esto, el conductor nunca ve una pantalla de login (spec §5). Es del
// supervisor, no del conductor: la única entrada de texto legítima.

import { useState } from "react";
import { Aviso, BotonGrande, Eyebrow, Titulo } from "../ui/basicos";
import { APP, C } from "../marca/tokens";
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

  const listo = codigo.trim().length >= 6 && !enviando;

  return (
    <>
      <Titulo sub="Este celular se enrola una sola vez a la estación. Pídele el código de enrolamiento al supervisor.">
        Enrolar este dispositivo
      </Titulo>
      <div className="flex flex-col px-4 pt-4" style={{ gap: 8 }}>
        <InstalarApp />
        <label
          className="block rounded-lg px-3 py-3"
          style={{ background: APP.tarjeta, border: `1px solid ${C.linea}` }}
        >
          <Eyebrow>Código de enrolamiento</Eyebrow>
          <input
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value)}
            autoCapitalize="characters"
            className="mt-1 w-full bg-transparent font-mono font-bold tracking-widest"
            style={{ fontSize: 22, color: C.texto, border: "none", outline: "none" }}
          />
        </label>
        <label
          className="block rounded-lg px-3 py-3"
          style={{ background: APP.tarjeta, border: `1px solid ${C.lineaSuave}` }}
        >
          <Eyebrow>Nombre del dispositivo (opcional)</Eyebrow>
          <input
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            placeholder="Tablet almacén"
            className="mt-1 w-full bg-transparent"
            style={{ fontSize: 14, color: C.texto, border: "none", outline: "none" }}
          />
        </label>
        {error ? <Aviso tono="malo" titulo={error} /> : null}
      </div>
      <div className="px-4 pt-4">
        <BotonGrande
          onClick={() => {
            if (listo) void confirmar();
          }}
          tono={listo ? "primario" : "gris"}
        >
          {enviando ? "Enrolando…" : "Enrolar"}
        </BotonGrande>
      </div>
    </>
  );
}
