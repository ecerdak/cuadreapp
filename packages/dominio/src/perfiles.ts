// Registro de Perfiles Operativos — el ÚNICO punto de despacho del
// dominio (DEC-016). Envuelve los validadores por perfil; jamás los
// modifica. Los códigos de perfil solo pueden aparecer aquí, en los
// otros tres puntos de despacho (API, PWA, Dashboard), en seeds y en
// pruebas — nunca en condicionales dispersos.

import type {
  CodigoPerfil,
  ComposicionTablero,
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

/** Definición completa de un perfil: su identidad, lo que exige de la
 *  configuración y lo que compone en el tablero del cliente. */
export interface DefinicionPerfil extends ComposicionTablero {
  codigo: CodigoPerfil;
  nombre: string;
  /** Captura contra un dispensador con medidor (tanda/totalizador) —
   *  la consola lo usa para exigir dispensador y totalizador inicial
   *  en la sede, y el tablero para el panel del totalizador. */
  requiereMedidor: boolean;
}

/** Catálogo del dominio: código congelado + nombre visible + metadatos
 *  estructurales de cada perfil. Espejo probado de la fila
 *  administrativa en la base.
 *
 *  Aquí también vive la COMPOSICIÓN del tablero del cliente (DEC-016,
 *  cuarto punto de despacho). El Dashboard pregunta por ella y dibuja;
 *  jamás decide por su cuenta ni compara clientes. Agregar un cliente
 *  no toca este archivo: agregar un PERFIL sí, y solo este. */
export const PERFILES: Record<CodigoPerfil, DefinicionPerfil> = {
  medidor_doble: {
    codigo: "medidor_doble",
    nombre: "Medidor Doble",
    requiereMedidor: true,
    // El tanque es del cliente: hay totalizador que leer y balance de
    // suministro que cuadrar contra las entregas de Lubryco.
    modulos: ["hoy", "cargas", "equipos", "suministro"],
    panelesHoy: ["totalizador", "consumo", "cargas_del_dia"],
    columnasCargas: ["galones"],
    vistaEvidencia: "medidor",
  },
  carga_inventario: {
    codigo: "carga_inventario",
    nombre: "Carga sobre Inventario",
    requiereMedidor: false,
    // Sin tanque del cliente no hay totalizador ni balance de
    // suministro: el inventario vive en los equipos que se cargan.
    modulos: ["hoy", "cargas", "equipos"],
    panelesHoy: ["inventario", "consumo", "cargas_del_dia"],
    columnasCargas: ["llegada", "galones", "total_salida", "llenado"],
    vistaEvidencia: "inventario",
  },
};

export function esCodigoPerfil(valor: string): valor is CodigoPerfil {
  return (CODIGOS_PERFIL as readonly string[]).includes(valor);
}

/** Composición del tablero para un perfil. Lanza con un código
 *  desconocido: preferimos fallar temprano y ruidoso a pintar un
 *  tablero vacío que el supervisor no sabría interpretar. */
export function composicionTablero(codigo: CodigoPerfil): ComposicionTablero {
  const perfil = PERFILES[codigo];
  if (!perfil) throw new Error(`Perfil Operativo desconocido: ${codigo}`);
  return {
    modulos: perfil.modulos,
    panelesHoy: perfil.panelesHoy,
    columnasCargas: perfil.columnasCargas,
    vistaEvidencia: perfil.vistaEvidencia,
  };
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
