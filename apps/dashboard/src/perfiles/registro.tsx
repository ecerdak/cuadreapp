// EL REGISTRO DE VISTAS DEL DASHBOARD — cuarto punto de despacho por
// perfil (DEC-016). Es el único archivo del tablero donde un código de
// pieza se convierte en un componente.
//
// Cómo se lee: el perfil del cliente DECLARA (en `packages/dominio`)
// qué módulos, paneles y columnas componen su tablero; este archivo
// sabe dibujar cada pieza de ese vocabulario. Consecuencias buscadas:
//
//   · Un cliente nuevo con un perfil existente no toca una sola línea
//     de código: se crea en la consola y su tablero ya existe.
//   · Un perfil nuevo que reutiliza piezas existentes tampoco toca
//     este archivo: se declara en el dominio y se dibuja solo.
//   · Un perfil que necesite una pieza NUEVA agrega su componente y
//     una entrada acá. Nunca un `if` en una página, nunca una
//     comparación por cliente.
//
// Ninguna página del tablero conoce códigos de perfil: preguntan al
// registro. Por eso agregar perfiles no las modifica.

import { PERFILES } from "@cuadreapp/dominio";
import type { CodigoPerfil, ColumnaCarga, PanelHoy, VistaEvidencia } from "@cuadreapp/dominio";
import type { CargaResumen } from "../datos/puertos";
import { formatearGal } from "../componentes/numeros";
import { EvidenciaInventario, EvidenciaMedidor, type PropsEvidencia } from "./evidencia";
import {
  PanelCargasDelDia,
  PanelConsumo,
  PanelInventario,
  PanelTotalizador,
  type AnchoPanel,
  type PropsPanel,
} from "./paneles";

/* ============ Paneles de la pestaña Hoy ============ */

interface EntradaPanel {
  componente: (props: PropsPanel) => JSX.Element;
  /** Columnas que ocupa en la rejilla de 3 del diseño aprobado. */
  ancho: AnchoPanel;
}

const PANELES: Record<PanelHoy, EntradaPanel> = {
  totalizador: { componente: PanelTotalizador, ancho: 1 },
  inventario: { componente: PanelInventario, ancho: 1 },
  consumo: { componente: PanelConsumo, ancho: 2 },
  cargas_del_dia: { componente: PanelCargasDelDia, ancho: 3 },
};

export function panelDe(codigo: PanelHoy): EntradaPanel {
  const entrada = PANELES[codigo];
  if (!entrada) throw new Error(`Panel de tablero sin componente registrado: ${codigo}`);
  return entrada;
}

/* ============ Vistas de evidencia ============ */

const EVIDENCIAS: Record<VistaEvidencia, (props: PropsEvidencia) => JSX.Element | null> = {
  medidor: EvidenciaMedidor,
  inventario: EvidenciaInventario,
};

export function evidenciaDe(codigo: VistaEvidencia): (props: PropsEvidencia) => JSX.Element | null {
  const componente = EVIDENCIAS[codigo];
  if (!componente) throw new Error(`Vista de evidencia sin componente registrado: ${codigo}`);
  return componente;
}

/** Evidencia de UNA carga: se elige por el perfil con el que nació
 *  (snapshot), no por el perfil actual del cliente. Si mañana el
 *  cliente cambia de perfil, sus cargas viejas siguen viéndose con el
 *  vocabulario con que se capturaron (DEC-016). */
export function evidenciaDeCarga(
  perfilCodigo: CodigoPerfil,
): (props: PropsEvidencia) => JSX.Element | null {
  const perfil = PERFILES[perfilCodigo];
  if (!perfil) throw new Error(`Carga con Perfil Operativo desconocido: ${perfilCodigo}`);
  return evidenciaDe(perfil.vistaEvidencia);
}

/* ============ Columnas de cifras de la tabla de cargas ============ */

export interface DefinicionColumna {
  rotulo: string;
  /** Texto ya formateado; "—" cuando la carga no trae ese dato. */
  valor: (carga: CargaResumen) => string;
  /** La columna principal se resalta en la tabla. */
  principal?: boolean;
}

const COLUMNAS: Record<ColumnaCarga, DefinicionColumna> = {
  galones: {
    rotulo: "Galones",
    valor: (carga) => formatearGal(carga.galones),
    principal: true,
  },
  llegada: {
    rotulo: "Llegó con",
    valor: (carga) => (carga.llegadaGal === null ? "—" : formatearGal(carga.llegadaGal)),
  },
  total_salida: {
    rotulo: "Total al salir",
    valor: (carga) => (carga.inventarioFinalGal === null ? "—" : formatearGal(carga.inventarioFinalGal)),
    principal: true,
  },
  llenado: {
    rotulo: "Llenado",
    valor: (carga) => {
      if (carga.inventarioFinalGal === null || !carga.capacidadEquipoGal) return "—";
      const pct = Math.round((carga.inventarioFinalGal / carga.capacidadEquipoGal) * 1000) / 10;
      return `${pct.toLocaleString("es-CO")} %`;
    },
  },
};

export function columnaDe(codigo: ColumnaCarga): DefinicionColumna {
  const definicion = COLUMNAS[codigo];
  if (!definicion) throw new Error(`Columna de cargas sin definición registrada: ${codigo}`);
  return definicion;
}
