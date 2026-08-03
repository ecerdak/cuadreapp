// Inyección de la fuente de datos (patrón del Dashboard): las
// pantallas consumen el contexto; las pruebas inyectan un fake.

import { createContext, useContext, type ReactNode } from "react";
import type { FuenteAdmin } from "./puertos";

const Contexto = createContext<FuenteAdmin | null>(null);

export function ProveedorAdmin(props: { fuente: FuenteAdmin; children: ReactNode }) {
  return <Contexto.Provider value={props.fuente}>{props.children}</Contexto.Provider>;
}

export function useFuenteAdmin(): FuenteAdmin {
  const fuente = useContext(Contexto);
  if (!fuente) throw new Error("ProveedorAdmin ausente");
  return fuente;
}
