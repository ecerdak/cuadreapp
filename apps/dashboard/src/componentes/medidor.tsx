// El Rodillo — elemento firma del producto — y el gráfico de consumo,
// transcritos del contrato visual: tambores claros con degradado para
// los enteros y tambor ROJO para la décima, igual que la carátula
// física del Fill-Rite 900.

import { TEMA } from "../tema";
import { formatearGal } from "./numeros";

export function Rodillo(props: { valor: number; enteros?: number; decima?: boolean; alto?: number }) {
  const enteros = props.enteros ?? 6;
  const alto = props.alto ?? 44;
  const ancho = Math.round(alto * 0.62);
  const fuente = Math.round(alto * 0.56);
  const digitos = String(Math.trunc(props.valor)).padStart(enteros, "0").split("");
  const decima = props.decima ? Math.round((props.valor % 1) * 10) % 10 : null;
  return (
    <span
      className="inline-flex items-stretch"
      style={{ gap: 2 }}
      role="img"
      aria-label={`Totalizador ${formatearGal(props.valor)} galones`}
    >
      {digitos.map((digito, indice) => (
        <span
          key={indice}
          aria-hidden="true"
          className="flex items-center justify-center font-mono font-bold"
          style={{
            width: ancho,
            height: alto,
            fontSize: fuente,
            color: "#101820",
            background: "linear-gradient(180deg,#F7F9FB 0%,#DFE6EC 45%,#FFFFFF 55%,#C9D3DC 100%)",
            borderRadius: 3,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.35)",
          }}
        >
          {digito}
        </span>
      ))}
      {decima !== null && (
        <span
          aria-hidden="true"
          className="flex items-center justify-center font-mono font-bold"
          style={{
            width: ancho,
            height: alto,
            fontSize: fuente,
            color: "#FFF3F1",
            background: "linear-gradient(180deg,#C0362B 0%,#9E2B22 45%,#D8483B 55%,#8C241C 100%)",
            borderRadius: 3,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.4)",
          }}
        >
          {decima}
        </span>
      )}
    </span>
  );
}

/* Barras de consumo: amarillas, el día parcial en azul translúcido,
   valor encima y día debajo en mono. */
export function GraficoConsumo(props: {
  dias: Array<{ fecha: string; galones: number; parcial?: boolean }>;
}) {
  const maximo = Math.max(...props.dias.map((dia) => dia.galones), 1);
  return (
    <div
      className="flex items-end"
      style={{ height: 132, gap: 6 }}
      role="img"
      aria-label={`Consumo diario de los últimos ${props.dias.length} días`}
    >
      {props.dias.map((dia) => (
        <div
          key={dia.fecha}
          className="flex flex-1 flex-col items-center justify-end"
          style={{ height: "100%" }}
          title={`${dia.fecha}: ${formatearGal(dia.galones)} gal`}
        >
          <span className="font-mono" style={{ fontSize: 10, color: TEMA.suave, marginBottom: 4 }}>
            {Math.round(dia.galones)}
          </span>
          <div
            style={{
              width: "100%",
              height: `${Math.round((dia.galones / maximo) * 96)}px`,
              background: dia.parcial ? TEMA.azul : TEMA.amarillo,
              opacity: dia.parcial ? 0.55 : 0.9,
              borderRadius: "2px 2px 0 0",
            }}
          />
          <span className="font-mono" style={{ fontSize: 10, color: TEMA.suave, marginTop: 6 }}>
            {dia.fecha.slice(8)}
          </span>
        </div>
      ))}
    </div>
  );
}
