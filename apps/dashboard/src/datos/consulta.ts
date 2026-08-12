// El patrón único de estados de datos del tablero: cargando → listo o
// error con reintento. El refresco (manual o polling) es silencioso:
// conserva los datos en pantalla mientras llegan los nuevos.

import { useCallback, useEffect, useRef, useState } from "react";

export type Consulta<T> =
  | { estado: "cargando" }
  /** `detalle` es el String(error) para clasificar; `causa` conserva el
   *  error real — mensajeDeError() lo traduce a frase + request_id.
   *  Sin la causa, toda pantalla mostraba «Error: HTTP_500» (P0.5). */
  | { estado: "error"; detalle: string; causa: unknown }
  | { estado: "listo"; datos: T; actualizadoEn: Date };

export interface UsoConsulta<T> {
  consulta: Consulta<T>;
  recargar: () => void;
}

export function useConsulta<T>(cargar: () => Promise<T>, dependencias: unknown[] = []): UsoConsulta<T> {
  const [consulta, setConsulta] = useState<Consulta<T>>({ estado: "cargando" });
  const [version, setVersion] = useState(0);
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  useEffect(() => {
    let activo = true;
    // Refresco silencioso: si ya hay datos, no volvemos a "cargando".
    setConsulta((actual) => (actual.estado === "listo" ? actual : { estado: "cargando" }));
    cargarRef
      .current()
      .then((datos) => {
        if (activo) setConsulta({ estado: "listo", datos, actualizadoEn: new Date() });
      })
      .catch((error: unknown) => {
        if (activo) setConsulta({ estado: "error", detalle: String(error), causa: error });
      });
    return () => {
      activo = false;
    };
    // Las dependencias las declara quien llama; `version` fuerza el recargar.
  }, [...dependencias, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { consulta, recargar };
}
