// [1] INICIO (spec §8.1): una sola decisión. Debajo, las cargas de hoy
// y el chip de sincronización siempre visible.

import { useSyncExternalStore } from "react";
import type { CargaLocal } from "../offline/bd";
import { obtenerEstadoSync, suscribirEstadoSync } from "../offline/estado-sync";
import { ETIQUETA_ESTADO } from "../ui/mensajes";
import { formatearGal } from "../ui/numeros";
import { BotonPrincipal, Pantalla } from "../ui/basicos";
import { InstalarApp } from "../instalacion/InstalarApp";

export function Inicio(props: {
  cargasHoy: CargaLocal[];
  pendientes: number;
  erroresDefinitivos: number;
  almacenEnRiesgo?: boolean;
  onEmpezar: () => void;
  onDiagnostico?: () => void;
}) {
  return (
    <Pantalla titulo="CuadreApp">
      <BotonPrincipal onClick={props.onEmpezar}>Cargar combustible</BotonPrincipal>

      <ChipSincronizacion pendientes={props.pendientes} errores={props.erroresDefinitivos} />

      <InstalarApp />

      {props.almacenEnRiesgo ? (
        <div className="rounded-xl border border-amber-600 bg-amber-950 p-3 text-sm text-amber-200">
          El navegador no garantiza conservar los datos de este dispositivo. No borres los datos del
          navegador: las cargas sin subir se perderían.
        </div>
      ) : null}

      <h2 className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#8AA0B6]">
        Tus cargas de hoy: {props.cargasHoy.length}
      </h2>
      <ul className="flex flex-col gap-2">
        {props.cargasHoy.map((carga) => {
          // El veredicto del servidor manda; el local se muestra mientras llega.
          const estado = carga.veredictoServidor?.estado ?? carga.estadoLocal;
          const etiqueta = ETIQUETA_ESTADO[estado];
          return (
            <li key={carga.id} className="flex items-center justify-between rounded-xl bg-[#121C25] p-3">
              <span className="font-bold">{carga.resumen.equipoCodigo}</span>
              <span className="tabular-nums">{formatearGal(carga.resumen.galones)} gal</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${etiqueta.clase}`}>
                {etiqueta.texto}
              </span>
              <span className="text-xs text-[#8AA0B6]">
                {carga.sincronizacion === "sincronizada" ? "✓ subida" : "en cola"}
              </span>
            </li>
          );
        })}
      </ul>

      {props.onDiagnostico ? (
        <button
          type="button"
          onClick={props.onDiagnostico}
          className="mt-4 text-center text-xs text-[#5B90C4] underline"
        >
          Diagnóstico del dispositivo
        </button>
      ) : null}
    </Pantalla>
  );
}

function ChipSincronizacion(props: { pendientes: number; errores: number }) {
  const estado = useSyncExternalStore(suscribirEstadoSync, obtenerEstadoSync);

  if (estado.sincronizando && estado.sincronizando.total > 0) {
    return (
      <div className="rounded-full bg-sky-900 px-4 py-2 text-center text-sm font-semibold text-sky-200">
        Sincronizando {estado.sincronizando.actual} de {estado.sincronizando.total}…
      </div>
    );
  }
  if (props.errores > 0) {
    return (
      <div className="rounded-full bg-red-900 px-4 py-2 text-center text-sm font-semibold text-red-200">
        {props.errores} registro(s) con error de sincronización — avisa al supervisor
      </div>
    );
  }
  if (props.pendientes > 0) {
    return (
      <div className="rounded-full bg-amber-900 px-4 py-2 text-center text-sm font-semibold text-amber-200">
        {estado.conectado
          ? `En cola: ${props.pendientes} — subiendo apenas se pueda`
          : `Sin conexión — ${props.pendientes} en cola; se subirán al volver la señal`}
      </div>
    );
  }
  if (!estado.conectado) {
    return (
      <div className="rounded-full bg-slate-700 px-4 py-2 text-center text-sm font-semibold text-slate-200">
        Trabajando offline — todo lo que registres queda guardado en el teléfono
      </div>
    );
  }
  return (
    <div className="rounded-full bg-emerald-900 px-4 py-2 text-center text-sm font-semibold text-emerald-200">
      Todo sincronizado
      {estado.ultimaSincronizacionEn
        ? ` · último envío ${new Date(estado.ultimaSincronizacionEn).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`
        : ""}
    </div>
  );
}
