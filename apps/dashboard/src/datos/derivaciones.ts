// Presentación derivada de hechos que el dominio YA decidió.
//
// Nada de esto es una regla de negocio (DEC-011): el estado y las
// banderas de una carga llegan calculados por `packages/dominio` en el
// momento del registro; aquí solo se eligen las palabras que lee el
// supervisor y se traducen banderas a candados visuales. Vive en el
// frontend a propósito: la copia de producto no pertenece al servidor.
//
// Ninguna función de este archivo conoce clientes ni perfiles: recibe
// cifras y devuelve frases.

import type { Bandera } from "@cuadreapp/dominio";
import { formatearEntero, formatearGal } from "../componentes/numeros";
import type {
  Balance,
  CandadoDetalle,
  CargaResumen,
  EntregaResumen,
  EquipoResumen,
  Veredicto,
} from "./puertos";

/* ============ Candados: banderas → verificación visual ============ */

export function candadosDe(banderas: Bandera[]): CandadoDetalle[] {
  return [
    {
      nombre: "Tanda en 0,0",
      descripcion: "El conductor reseteó la tanda antes de cargar",
      cumple: !banderas.includes("TANDA_NO_RESETEADA"),
    },
    {
      nombre: "Continuidad del totalizador",
      descripcion: "El totalizador arrancó donde quedó la carga anterior",
      cumple: !banderas.some((bandera) => bandera.startsWith("SALTO_TOTALIZADOR")),
    },
    {
      nombre: "La tanda cuadra",
      descripcion: "La tanda final es igual a lo que subió el totalizador",
      cumple: !banderas.some((bandera) =>
        ["TANDA_NO_CUADRA", "TOTALIZADOR_RETROCEDE", "TOTALIZADOR_SIN_AVANCE"].includes(bandera),
      ),
    },
  ];
}

/* ============ Veredictos: el hecho antes que los datos ============ */

export function veredictoHoy(cargasDeHoy: CargaResumen[]): Veredicto {
  if (cargasDeHoy.length === 0) {
    return {
      tono: "ok",
      titulo: "Aún no hay cargas registradas hoy.",
      detalle: "Las cargas aparecen aquí apenas el dispositivo de planta sincroniza.",
    };
  }

  const problemas = cargasDeHoy.filter((carga) => carga.estado === "inconsistente");
  if (problemas.length === 0) {
    const revisar = cargasDeHoy.filter((carga) => carga.estado === "advertencia");
    if (revisar.length > 0) {
      return {
        tono: "atencion",
        titulo: `${revisar.length} de ${cargasDeHoy.length} cargas de hoy necesitan una mirada.`,
        detalle: "Ninguna está fuera de cuadre: ábrelas para ver qué quedó marcado.",
      };
    }
    return {
      tono: "ok",
      titulo: `Las ${cargasDeHoy.length} cargas de hoy cuadran.`,
      detalle: "Nada pendiente por revisar.",
    };
  }

  const conSalto = problemas.find((carga) => (carga.galNoRegistrados ?? 0) > 0);
  return {
    tono: "problema",
    titulo: `${problemas.length} de ${cargasDeHoy.length} cargas de hoy no cuadra.`,
    detalle: conSalto
      ? `El totalizador arrancó ${formatearGal(conSalto.galNoRegistrados!)} gal arriba en la carga de ${conSalto.equipoCodigo} (${conSalto.hora}): alguien cargó sin registrar. Revísala hoy, no al cierre de mes.`
      : "Revisa el detalle de la carga marcada.",
  };
}

export function veredictoCargas(hechos: { total: number; cuadran: number; dias: number }): Veredicto {
  if (hechos.total === 0) {
    return {
      tono: "ok",
      titulo: `Sin cargas registradas en los últimos ${hechos.dias} días.`,
      detalle: "En cuanto el dispositivo de planta registre la primera, aparece aquí.",
    };
  }
  const noCuadran = hechos.total - hechos.cuadran;
  if (noCuadran === 0) {
    return {
      tono: "ok",
      titulo: `Las ${hechos.total} cargas de los últimos ${hechos.dias} días cuadran.`,
    };
  }
  return {
    tono: noCuadran > 2 ? "problema" : "atencion",
    titulo: `${hechos.cuadran} de ${hechos.total} cargas cuadran.`,
    detalle: `${noCuadran} ${noCuadran === 1 ? "necesita" : "necesitan"} revisión: abre cada una para ver sus fotos y candados.`,
  };
}

export function veredictoEquipos(equipos: EquipoResumen[]): Veredicto {
  const conDesvio = equipos.filter((equipo) => equipo.desvioPct !== null);
  if (equipos.length === 0) {
    return {
      tono: "ok",
      titulo: "Aún no hay equipos con consumo registrado.",
      detalle: "Los equipos aparecen aquí con su primera carga.",
    };
  }
  const masDesviado = [...conDesvio].sort(
    (uno, otro) => Math.abs(otro.desvioPct ?? 0) - Math.abs(uno.desvioPct ?? 0),
  )[0];
  if (!masDesviado || Math.abs(masDesviado.desvioPct ?? 0) < 10) {
    return { tono: "ok", titulo: "Todos los equipos están dentro de su patrón de consumo." };
  }
  const desvio = masDesviado.desvioPct!;
  return {
    tono: "atencion",
    titulo: `${masDesviado.codigo} se salió de su patrón: ${desvio > 0 ? "+" : ""}${desvio.toLocaleString("es-CO")}% contra su histórico.`,
    detalle: "Puede ser fuga, trabajo más pesado o lecturas mal tomadas — vale una mirada.",
  };
}

export function veredictoSuministro(
  balance: Balance,
  ultimaEntrega: EntregaResumen | undefined,
): Veredicto {
  if (!ultimaEntrega) {
    return {
      tono: "ok",
      titulo: "Aún no hay entregas de Lubryco registradas.",
      detalle:
        "El balance del tanque y la autonomía se calculan a partir de la primera entrega registrada.",
    };
  }
  if (balance.autonomiaDias === null) {
    return {
      tono: "ok",
      titulo: `Última entrega: ${ultimaEntrega.numeroRemision} (${ultimaEntrega.fecha}).`,
      detalle: "Sin consumo suficiente todavía para estimar la autonomía.",
    };
  }
  return {
    tono: balance.autonomiaDias <= 7 ? "atencion" : "ok",
    titulo: `Última entrega: ${ultimaEntrega.numeroRemision} (${ultimaEntrega.fecha}). Autonomía: ${Math.floor(balance.autonomiaDias)} días.`,
    detalle: `Existencia estimada: ${formatearEntero(balance.existenciaEstimadaGal ?? 0)} gal. Se confirma con aforo del tanque.`,
  };
}

/* ============ Proyección de reabastecimiento ============ */

/** Fecha sugerida de próxima entrega: la autonomía menos 2 días de
 *  lead time y 2 de colchón. null sin autonomía calculable. */
export function proximaEntregaSugerida(balance: Balance, hoy: Date): string | null {
  if (balance.autonomiaDias === null) return null;
  const fecha = new Date(hoy.getTime());
  fecha.setDate(fecha.getDate() + Math.max(0, Math.floor(balance.autonomiaDias - 4)));
  return fecha.toISOString().slice(0, 10);
}

/** Pedido para rellenar ~7 días de consumo, redondeado a 50 gal. */
export function pedidoSugeridoGal(balance: Balance): number | null {
  if (balance.existenciaEstimadaGal === null) return null;
  return Math.max(
    0,
    Math.round((balance.consumoDiarioGal * 7 - balance.existenciaEstimadaGal) / 50) * 50,
  );
}
