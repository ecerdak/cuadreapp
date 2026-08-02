// Componentes que evocan el medidor físico y la evidencia: el rodillo
// del totalizador, las barras de consumo (CSS puro), los candados
// aritméticos y el par de fotos.

import { TEMA } from "../tema";
import { formatearGal } from "./numeros";
import type { CandadoDetalle } from "../datos/puertos";

export function Rodillo(props: { valor: number; enteros?: number }) {
  const enteros = props.enteros ?? 6;
  const digitos = String(Math.trunc(props.valor)).padStart(enteros, "0").split("");
  const decima = Math.round((props.valor % 1) * 10);
  return (
    <span
      className="inline-flex items-stretch gap-0.5"
      role="img"
      aria-label={`Totalizador ${formatearGal(props.valor)} galones`}
    >
      {digitos.map((digito, indice) => (
        <span
          key={indice}
          aria-hidden="true"
          className="flex h-11 w-7 items-center justify-center rounded font-mono text-2xl font-bold"
          style={{ background: "#0c1218", border: `1px solid ${TEMA.linea}` }}
        >
          {digito}
        </span>
      ))}
      <span
        aria-hidden="true"
        className="flex h-11 w-7 items-center justify-center rounded font-mono text-2xl font-bold text-black"
        style={{ background: TEMA.amarillo }}
      >
        {decima}
      </span>
    </span>
  );
}

export function BarrasConsumo(props: { dias: Array<{ fecha: string; galones: number }> }) {
  const maximo = Math.max(...props.dias.map((dia) => dia.galones), 1);
  return (
    <div
      className="flex h-28 items-end gap-1"
      role="img"
      aria-label={`Consumo diario de los últimos ${props.dias.length} días`}
    >
      {props.dias.map((dia) => (
        <div
          key={dia.fecha}
          className="flex flex-1 flex-col items-center gap-1"
          title={`${dia.fecha}: ${formatearGal(dia.galones)} gal`}
        >
          <div
            className="w-full rounded-t"
            style={{
              height: `${Math.max(3, (dia.galones / maximo) * 100)}%`,
              background: dia.galones > 0 ? TEMA.azul : TEMA.linea,
            }}
          />
          <span className="text-[9px] tabular-nums" style={{ color: TEMA.suave }}>
            {dia.fecha.slice(8)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Candados(props: { candados: CandadoDetalle[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {props.candados.map((candado) => (
        <li
          key={candado.nombre}
          className="flex items-start gap-3 rounded-lg p-3"
          style={{ background: TEMA.panel2 }}
        >
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black"
            style={{ background: candado.cumple ? TEMA.verde : TEMA.rojo }}
          >
            {candado.cumple ? "✓" : "✗"}
          </span>
          <div>
            <p className="font-semibold">
              {candado.nombre} — {candado.cumple ? "cumple" : "no cumple"}
            </p>
            <p className="text-xs" style={{ color: TEMA.suave }}>
              {candado.descripcion}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ParFotos(props: { inicial: string | null; final: string | null }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {(
        [
          ["Antes de cargar", props.inicial],
          ["Después de cargar", props.final],
        ] as const
      ).map(([rotulo, url]) => (
        <figure key={rotulo} className="rounded-xl p-2" style={{ background: TEMA.panel2 }}>
          {url ? (
            <img
              src={url}
              alt={`Foto del medidor — ${rotulo.toLowerCase()}`}
              className="w-full rounded-lg"
            />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm" style={{ color: TEMA.suave }}>
              Sin foto
            </div>
          )}
          <figcaption className="mt-1 text-center text-xs font-semibold" style={{ color: TEMA.suave }}>
            {rotulo}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
