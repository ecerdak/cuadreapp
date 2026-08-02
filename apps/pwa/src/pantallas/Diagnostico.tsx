// Diagnóstico para el supervisor (FASE 4 del hardening): estado real
// del dispositivo en una pantalla. Sin datos sensibles: nada de tokens,
// nada de contenido de cargas — solo salud operacional.

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { BdLocal } from "../offline/bd";
import { obtenerEstadoSync, suscribirEstadoSync } from "../offline/estado-sync";
import { almacenamientoEsPersistente } from "../seguridad/persistencia";
import { enModoApp } from "../instalacion/instalacion";
import { VERSION_APP } from "../config";
import { BotonPrincipal, Pantalla } from "../ui/basicos";

function Fila(props: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#121C25] p-3 text-sm">
      <span className="text-[#8AA0B6]">{props.rotulo}</span>
      <span className="text-right font-semibold">{props.valor}</span>
    </div>
  );
}

export function Diagnostico(props: { bd: BdLocal; onVolver: () => void }) {
  const { bd } = props;
  const estado = useSyncExternalStore(suscribirEstadoSync, obtenerEstadoSync);
  const [almacen, setAlmacen] = useState<string>("consultando…");
  const [persistente, setPersistente] = useState<string>("consultando…");

  const pendientes =
    useLiveQuery(() => bd.cargas.where("sincronizacion").equals("pendiente").count()) ?? 0;
  const errores =
    useLiveQuery(() => bd.cargas.where("sincronizacion").equals("error_definitivo").count()) ?? 0;
  const fotosPendientes = useLiveQuery(() => bd.fotos.count()) ?? 0;
  const hayBorrador = useLiveQuery(async () => (await bd.borradores.count()) > 0) ?? false;

  useEffect(() => {
    void navigator.storage
      ?.estimate?.()
      .then((estimacion) => {
        const usado = ((estimacion.usage ?? 0) / 1024 / 1024).toFixed(1);
        const cuota = ((estimacion.quota ?? 0) / 1024 / 1024).toFixed(0);
        setAlmacen(`${usado} MB de ~${cuota} MB`);
      })
      .catch(() => setAlmacen("no disponible"));
    void almacenamientoEsPersistente().then((valor) =>
      setPersistente(valor === null ? "no soportado" : valor ? "sí" : "NO — riesgo de purga"),
    );
  }, []);

  return (
    <Pantalla titulo="Diagnóstico">
      <div className="flex flex-col gap-2">
        <Fila rotulo="Versión instalada" valor={VERSION_APP} />
        <Fila rotulo="Modo" valor={enModoApp() ? "app instalada" : "navegador"} />
        <Fila rotulo="Conectividad" valor={estado.conectado ? "con conexión" : "sin conexión"} />
        <Fila rotulo="Almacenamiento usado" valor={almacen} />
        <Fila rotulo="Almacenamiento protegido" valor={persistente} />
        <Fila rotulo="Cargas pendientes de subir" valor={String(pendientes)} />
        <Fila rotulo="Fotografías pendientes" valor={String(fotosPendientes)} />
        <Fila rotulo="Registros con error" valor={String(errores)} />
        <Fila rotulo="Captura en curso guardada" valor={hayBorrador ? "sí" : "no"} />
        <Fila
          rotulo="Última sincronización"
          valor={
            estado.ultimaSincronizacionEn
              ? new Date(estado.ultimaSincronizacionEn).toLocaleString("es-CO")
              : "nunca"
          }
        />
        <Fila rotulo="Último error" valor={estado.ultimoError ?? "ninguno"} />
      </div>
      <BotonPrincipal onClick={props.onVolver}>Volver</BotonPrincipal>
    </Pantalla>
  );
}
