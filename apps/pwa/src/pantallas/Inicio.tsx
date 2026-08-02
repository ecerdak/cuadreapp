// [1] INICIO (spec §8.1, pantalla 01 del contrato): una sola decisión.
// Saludo, botón grande amarillo con subtexto, y "Cargas de hoy" con el
// chip de sincronización siempre visible en la línea del eyebrow.

import { useSyncExternalStore } from "react";
import type { CargaLocal } from "../offline/bd";
import { obtenerEstadoSync, suscribirEstadoSync } from "../offline/estado-sync";
import { COLOR_ESTADO, TEXTO_ESTADO } from "../ui/mensajes";
import { formatearGal } from "../ui/numeros";
import { Eyebrow, Titulo } from "../ui/basicos";
import { APP, C } from "../marca/tokens";
import { InstalarApp } from "../instalacion/InstalarApp";

function horaDe(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function saludo(): string {
  const hora = new Date().getHours();
  return hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
}

export function Inicio(props: {
  cargasHoy: CargaLocal[];
  pendientes: number;
  erroresDefinitivos: number;
  nombreConductor?: string | null;
  almacenEnRiesgo?: boolean;
  onEmpezar: () => void;
  onDiagnostico?: () => void;
}) {
  return (
    <>
      <Titulo>
        {saludo()}
        {props.nombreConductor ? `, ${props.nombreConductor.split(" ")[0]}` : ""}
      </Titulo>

      <div className="px-4 pt-5">
        <button
          type="button"
          onClick={props.onEmpezar}
          className="w-full rounded-2xl font-semibold"
          style={{
            background: C.amarillo,
            color: "#101A22",
            padding: "30px 18px",
            fontSize: 20,
            textAlign: "left",
          }}
        >
          Cargar combustible
          <span className="block font-normal" style={{ fontSize: 12, opacity: 0.72, marginTop: 5 }}>
            Toma unos 40 segundos
          </span>
        </button>
      </div>

      <div className="px-4 pt-6">
        <div className="flex items-baseline justify-between">
          <Eyebrow>Cargas de hoy</Eyebrow>
          <ChipSincronizacion pendientes={props.pendientes} errores={props.erroresDefinitivos} />
        </div>
        <div className="mt-3 flex flex-col" style={{ gap: 7 }}>
          {props.cargasHoy.map((carga) => {
            // El veredicto del servidor manda; el local se muestra mientras llega.
            const estado = carga.veredictoServidor?.estado ?? carga.estadoLocal;
            return (
              <div
                key={carga.id}
                className="flex items-center justify-between rounded-lg px-3 py-3"
                style={{
                  background: APP.tarjeta,
                  border: `1px solid ${C.lineaSuave}`,
                  borderLeft: `2px solid ${COLOR_ESTADO[estado]}`,
                }}
              >
                <div className="flex items-baseline" style={{ gap: 10 }}>
                  <span className="font-mono" style={{ fontSize: 12, color: C.suave }}>
                    {horaDe(carga.creadaEn)}
                  </span>
                  <span className="font-mono font-semibold" style={{ fontSize: 13 }}>
                    {carga.resumen.equipoCodigo}
                  </span>
                  {carga.sincronizacion !== "sincronizada" ? (
                    <span style={{ fontSize: 10, color: C.suave }}>en cola</span>
                  ) : null}
                </div>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <span className="font-mono font-semibold" style={{ fontSize: 14 }}>
                    {formatearGal(carga.resumen.galones)} gal
                  </span>
                  <span
                    className="rounded-full px-2 py-1 font-semibold uppercase"
                    style={{
                      fontSize: 9.5,
                      letterSpacing: "0.08em",
                      color: COLOR_ESTADO[estado],
                      background: `${COLOR_ESTADO[estado]}1F`,
                      border: `1px solid ${COLOR_ESTADO[estado]}55`,
                    }}
                  >
                    {TEXTO_ESTADO[estado]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col px-4 pt-4" style={{ gap: 8 }}>
        <InstalarApp />
        {props.almacenEnRiesgo ? (
          <div
            className="rounded-lg px-3 py-3"
            style={{ background: `${C.ambar}16`, border: `1px solid ${C.ambar}4D` }}
          >
            <div className="font-semibold" style={{ fontSize: 13, color: C.ambar }}>
              El navegador no garantiza conservar los datos
            </div>
            <div style={{ fontSize: 11.5, color: C.suave, lineHeight: 1.5, marginTop: 3 }}>
              No borres los datos del navegador: las cargas sin subir se perderían.
            </div>
          </div>
        ) : null}
      </div>

      {props.onDiagnostico ? (
        <div className="px-4 pt-4 text-center">
          <button type="button" onClick={props.onDiagnostico} style={{ fontSize: 12.5, color: C.azul }}>
            Diagnóstico del dispositivo
          </button>
        </div>
      ) : null}
    </>
  );
}

/* Chip del estado de sincronización (siempre visible): el formato del
   contrato — píldora 9.5 px — con los estados del hardening validado. */
function ChipSincronizacion(props: { pendientes: number; errores: number }) {
  const estado = useSyncExternalStore(suscribirEstadoSync, obtenerEstadoSync, obtenerEstadoSync);

  const chip = (color: string, texto: string) => (
    <span
      className="rounded-full px-2 py-1 font-semibold"
      style={{ fontSize: 9.5, color, background: `${color}1C` }}
    >
      {texto}
    </span>
  );

  if (estado.sincronizando && estado.sincronizando.total > 0) {
    return chip(
      C.azul,
      `Sincronizando ${estado.sincronizando.actual} de ${estado.sincronizando.total}…`,
    );
  }
  if (props.errores > 0) {
    return chip(C.rojo, `${props.errores} con error — avisa al supervisor`);
  }
  if (props.pendientes > 0) {
    return chip(
      C.ambar,
      estado.conectado
        ? `En cola: ${props.pendientes} — subiendo`
        : `Sin conexión — ${props.pendientes} en cola`,
    );
  }
  if (!estado.conectado) {
    return chip(C.suave, "Trabajando offline");
  }
  return chip(
    C.verde,
    `Todo sincronizado${
      estado.ultimaSincronizacionEn
        ? ` · ${new Date(estado.ultimaSincronizacionEn).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`
        : ""
    }`,
  );
}
