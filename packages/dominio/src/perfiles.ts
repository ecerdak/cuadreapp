// Registro de Perfiles Operativos — el ÚNICO punto de despacho del
// dominio (DEC-016). Envuelve los validadores por perfil; jamás los
// modifica. Los códigos de perfil solo pueden aparecer aquí, en los
// otros tres puntos de despacho (API, PWA, Dashboard), en seeds y en
// pruebas — nunca en condicionales dispersos.

import type {
  CodigoPerfil,
  ContextoInventario,
  ContextoValidacion,
  RegistroCarga,
  RegistroCargaInventario,
  ResultadoInventario,
  ResultadoValidacion,
} from "./tipos";
import { CODIGOS_PERFIL } from "./tipos";
import { validarCarga } from "./validacion";
import { validarCargaInventario } from "./inventario";

export interface EntradaMedidorDoble {
  perfil: "medidor_doble";
  registro: RegistroCarga;
  contexto: ContextoValidacion;
}

export interface EntradaCargaInventario {
  perfil: "carga_inventario";
  registro: RegistroCargaInventario;
  contexto: ContextoInventario;
}

export type EntradaPorPerfil = EntradaMedidorDoble | EntradaCargaInventario;

/** Catálogo del dominio: código congelado + nombre visible de cada
 *  perfil. Espejo probado de la fila administrativa en la base. */
export const PERFILES: Record<CodigoPerfil, { codigo: CodigoPerfil; nombre: string }> = {
  medidor_doble: { codigo: "medidor_doble", nombre: "Medidor Doble" },
  carga_inventario: { codigo: "carga_inventario", nombre: "Carga sobre Inventario" },
};

export function esCodigoPerfil(valor: string): valor is CodigoPerfil {
  return (CODIGOS_PERFIL as readonly string[]).includes(valor);
}

/** Despacha la validación al perfil correspondiente. Para
 *  medidor_doble es EXACTAMENTE validarCarga (prueba dorada);
 *  para carga_inventario, validarCargaInventario. */
export function validarSegunPerfil(entrada: EntradaMedidorDoble): ResultadoValidacion;
export function validarSegunPerfil(entrada: EntradaCargaInventario): ResultadoInventario;
export function validarSegunPerfil(entrada: EntradaPorPerfil): ResultadoValidacion | ResultadoInventario;
export function validarSegunPerfil(
  entrada: EntradaPorPerfil,
): ResultadoValidacion | ResultadoInventario {
  switch (entrada.perfil) {
    case "medidor_doble":
      return validarCarga(entrada.registro, entrada.contexto);
    case "carga_inventario":
      return validarCargaInventario(entrada.registro, entrada.contexto);
  }
}
