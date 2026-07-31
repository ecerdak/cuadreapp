// [5] CARGANDO (spec §8.1): el tiempo también es dato — la duración
// entra al registro y alimenta R12.

import { useEffect, useState } from "react";
import { BotonPrincipal, Pantalla } from "../ui/basicos";

export function Cargando(props: { iniciadaEn: string; onTermine: () => void }) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const temporizador = setInterval(() => setAhora(Date.now()), 1_000);
    return () => clearInterval(temporizador);
  }, []);

  const segundos = Math.max(0, Math.floor((ahora - new Date(props.iniciadaEn).getTime()) / 1_000));
  const reloj = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;

  return (
    <Pantalla titulo="Cargando combustible…">
      <div className="py-10 text-center text-7xl font-bold tabular-nums">{reloj}</div>
      <BotonPrincipal onClick={props.onTermine}>Terminé de cargar</BotonPrincipal>
    </Pantalla>
  );
}
