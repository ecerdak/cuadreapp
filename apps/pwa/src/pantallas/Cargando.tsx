// [5] CARGANDO (spec §8.1, pantalla 05 del contrato): el tiempo también
// es dato (R12). Cronómetro mono 62 px y la tarjeta de contexto —
// equipo, conductor y medidor al iniciar — para que el conductor nunca
// pierda de vista qué está cargando.

import { useEffect, useState } from "react";
import { BotonGrande, FilaResumen, Tarjeta, Titulo } from "../ui/basicos";
import { C } from "../marca/tokens";

const entero = (valor: number) => Math.round(valor).toLocaleString("es-CO");

export function Cargando(props: {
  iniciadaEn: string;
  equipoCodigo: string;
  equipoDescripcion: string;
  conductorNombre: string;
  totInicialGal: number | null;
  onTermine: () => void;
}) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const temporizador = setInterval(() => setAhora(Date.now()), 1_000);
    return () => clearInterval(temporizador);
  }, []);

  const segundos = Math.max(0, Math.floor((ahora - new Date(props.iniciadaEn).getTime()) / 1_000));
  const m = String(Math.floor(segundos / 60)).padStart(2, "0");
  const s = String(segundos % 60).padStart(2, "0");

  return (
    <>
      <Titulo>Cargando</Titulo>
      <div className="flex flex-col items-center px-4" style={{ paddingTop: 44 }}>
        <div className="font-mono font-bold" style={{ fontSize: 62, letterSpacing: "-0.02em" }}>
          {m}:{s}
        </div>
        <div style={{ fontSize: 12, color: C.suave, marginTop: 6 }}>Tiempo de carga</div>
        <Tarjeta className="mt-9 w-full">
          <FilaResumen rotulo="Equipo" valor={`${props.equipoCodigo} · ${props.equipoDescripcion}`} />
          <FilaResumen rotulo="Conductor" valor={props.conductorNombre} />
          {props.totInicialGal !== null ? (
            <FilaResumen rotulo="Medidor al iniciar" valor={`${entero(props.totInicialGal)} gal`} />
          ) : null}
        </Tarjeta>
      </div>
      <div className="px-4" style={{ paddingTop: 32 }}>
        <BotonGrande onClick={props.onTermine}>Terminé de cargar</BotonGrande>
      </div>
    </>
  );
}
