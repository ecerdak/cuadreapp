// [Pestaña Hoy] Veredicto del día antes que los datos; existencia en
// rodillo, autonomía, consumo de 14 días y las cargas de hoy. Única
// pestaña con polling (60 s, pausado si la pestaña no está visible).

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useFuenteTablero } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import {
  ChipEstado,
  Esqueleto,
  EstadoError,
  EstadoVacio,
  TarjetaMetrica,
  VeredictoBanner,
} from "../componentes/basicos";
import { BarrasConsumo, Rodillo } from "../componentes/medidor";
import { formatearGal } from "../componentes/numeros";
import { TEMA } from "../tema";

export function Hoy() {
  const fuente = useFuenteTablero();
  const { consulta, recargar } = useConsulta(() => fuente.resumenHoy());

  useEffect(() => {
    const temporizador = setInterval(() => {
      if (document.visibilityState === "visible") recargar();
    }, 60_000);
    return () => clearInterval(temporizador);
  }, [recargar]);

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={84} />
        <div className="grid grid-cols-2 gap-4">
          <Esqueleto alto={96} />
          <Esqueleto alto={96} />
        </div>
        <Esqueleto alto={180} />
      </div>
    );
  }
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { datos } = consulta;
  return (
    <div className="flex flex-col gap-4">
      <VeredictoBanner veredicto={datos.veredicto} />

      <div className="flex items-center justify-between text-xs" style={{ color: TEMA.suave }}>
        <span>
          Actualizado{" "}
          {consulta.actualizadoEn.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <button
          type="button"
          onClick={recargar}
          className="rounded px-2 py-1 font-semibold focus-visible:outline"
          style={{ color: TEMA.azul }}
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TarjetaMetrica
          rotulo="Existencia estimada"
          contexto="Estimada por balance — no medida (sin aforo del tanque)"
        >
          {formatearGal(datos.existenciaEstimadaGal)} gal
        </TarjetaMetrica>
        <TarjetaMetrica rotulo="Autonomía restante" contexto="Al ritmo de los últimos 7 días">
          {Math.floor(datos.autonomiaDias)} días
        </TarjetaMetrica>
      </div>

      <section className="rounded-xl p-4" style={{ background: TEMA.panel }}>
        <h2
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: TEMA.suave }}
        >
          Totalizador del dispensador
        </h2>
        <Rodillo valor={datos.totalizadorGal} />
      </section>

      <section className="rounded-xl p-4" style={{ background: TEMA.panel }}>
        <h2
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: TEMA.suave }}
        >
          Consumo por día · últimos 14 días
        </h2>
        <BarrasConsumo dias={datos.consumo14d} />
      </section>

      <section>
        <h2
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: TEMA.suave }}
        >
          Cargas del día
        </h2>
        {datos.cargasDeHoy.length === 0 ? (
          <EstadoVacio
            mensaje="Aún no hay cargas hoy"
            detalle="Las cargas del conductor aparecen aquí apenas sincronizan."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {datos.cargasDeHoy.map((carga) => (
              <li key={carga.id}>
                <Link
                  to={`/cargas/${carga.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl p-3 focus-visible:outline focus-visible:outline-2"
                  style={{ background: TEMA.panel }}
                >
                  <span className="tabular-nums" style={{ color: TEMA.suave }}>
                    {carga.hora}
                  </span>
                  <span className="font-bold">{carga.equipoCodigo}</span>
                  <span className="flex-1 truncate text-sm" style={{ color: TEMA.suave }}>
                    {carga.conductorNombre}
                  </span>
                  <span className="font-bold tabular-nums">{formatearGal(carga.galones)} gal</span>
                  <ChipEstado estado={carga.estado} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
