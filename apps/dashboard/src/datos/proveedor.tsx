// Inyección de la fuente de datos (DEC del documento de arquitectura):
// los componentes solo conocen useFuenteTablero(). Reemplazar los datos
// simulados por la API real será cambiar la fuente aquí — cero cambios
// en componentes.

import { createContext, useContext, type ReactNode } from "react";
import type { FuenteDatosTablero } from "./puertos";

const ContextoFuente = createContext<FuenteDatosTablero | null>(null);

export function ProveedorDatosTablero(props: { fuente: FuenteDatosTablero; children: ReactNode }) {
  return <ContextoFuente.Provider value={props.fuente}>{props.children}</ContextoFuente.Provider>;
}

export function useFuenteTablero(): FuenteDatosTablero {
  const fuente = useContext(ContextoFuente);
  if (!fuente) throw new Error("Falta ProveedorDatosTablero en la raíz del tablero");
  return fuente;
}
