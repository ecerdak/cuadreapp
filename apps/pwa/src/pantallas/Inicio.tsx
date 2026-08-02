// [1] INICIO (spec §8.1): una sola decisión. Debajo, las cargas de hoy
// y el chip de sincronización siempre visible.

import type { CargaLocal } from "../offline/bd";
import { ETIQUETA_ESTADO } from "../ui/mensajes";
import { formatearGal } from "../ui/numeros";
import { BotonPrincipal, Pantalla } from "../ui/basicos";

export function Inicio(props: {
  cargasHoy: CargaLocal[];
  pendientes: number;
  erroresDefinitivos: number;
  almacenEnRiesgo?: boolean;
  onEmpezar: () => void;
}) {
  return (
    <Pantalla titulo="CuadreApp">
      <BotonPrincipal onClick={props.onEmpezar}>Cargar combustible</BotonPrincipal>

      <ChipSincronizacion pendientes={props.pendientes} errores={props.erroresDefinitivos} />

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
    </Pantalla>
  );
}

function ChipSincronizacion(props: { pendientes: number; errores: number }) {
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
        En cola: {props.pendientes} — se sube cuando haya señal
      </div>
    );
  }
  return (
    <div className="rounded-full bg-emerald-900 px-4 py-2 text-center text-sm font-semibold text-emerald-200">
      Todo sincronizado
    </div>
  );
}
