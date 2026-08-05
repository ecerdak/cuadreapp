// FIXTURE DE PRUEBAS — la empresa del escenario, ya resuelta.
//
// Equivale a lo que responde GET /api/v1/tablero/contexto para el
// cliente de demostración. Existe para montar pantallas completas sin
// red: en producción esto SIEMPRE viene de la base (DEC-017/DEC-018).

import { PERFILES } from "@cuadreapp/dominio";
import type { EstadoTablero } from "../datos/contexto";
import type { ContextoTablero } from "../datos/puertos";
import { CLIENTE_SIMULADO, MEDIDOR_SIMULADO } from "./escenario";

export const CONTEXTO_DEMO: ContextoTablero = {
  usuario: { nombre: "Supervisora de planta", rol: "supervisor" },
  permisos: ["tablero.leer"],
  cliente: {
    id: "cliente-simulado",
    nombre: CLIENTE_SIMULADO.nombre,
    nombreComercial: CLIENTE_SIMULADO.corto,
    colorPrimario: CLIENTE_SIMULADO.colorPrimario,
    colorSecundario: CLIENTE_SIMULADO.colorSecundario,
    logoUrl: null,
  },
  perfil: { ...PERFILES.medidor_doble },
  sedes: [{ id: "sede-simulada", nombre: CLIENTE_SIMULADO.sede, ciudad: null }],
  sedeActual: "sede-simulada",
  medidor: MEDIDOR_SIMULADO,
};

export function estadoDemo(sobre: Partial<ContextoTablero> = {}): EstadoTablero {
  return {
    contexto: { ...CONTEXTO_DEMO, ...sobre },
    sedeId: "sede-simulada",
    elegirSede: () => {},
    recargar: () => {},
  };
}
