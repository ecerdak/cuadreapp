// Exportación a Excel, consciente del Perfil Operativo (P0.8).
//
// La forma de la hoja de cargas la decide la MISMA vista de evidencia
// que el perfil declara en el dominio (vistaEvidencia): un cliente que
// mide con tanda y totalizador exporta esas cuatro lecturas; uno que
// carga sobre inventario exporta llegada, cargados, total al salir y
// duración. Nada aquí decide por código de perfil ni por cliente.
//
// Datos: la vista de inventario sale COMPLETA de la lista de cargas
// (cero peticiones de detalle); la de medidor necesita las lecturas,
// que solo viajan en el detalle — se piden por lotes acotados, no
// todas a la vez. Las hojas de suministro (Entregas y Balance) solo
// existen si el perfil declara el módulo.
//
// Los galones van como número, no como texto, para que el cliente
// pueda sumar sin limpiar la hoja. SheetJS se carga bajo demanda.

import type { CargaResumen, ContextoTablero, DetalleCarga, FuenteDatosTablero } from "./puertos";
import { formatearDuracion } from "../componentes/numeros";
import { TEXTO_ESTADO } from "../tema";

type Alcance = "dia" | "mes";
type Celda = string | number;

/** Vista de medidor: identificación, las cuatro lecturas, el resultado
 *  y el veredicto — el orden en que un auditor las revisa. */
export function filaCargaMedidor(detalle: DetalleCarga): Record<string, Celda> {
  const { resumen } = detalle;
  return {
    Fecha: resumen.fecha,
    Hora: resumen.hora,
    Equipo: resumen.equipoCodigo,
    Descripción: resumen.equipoDescripcion,
    Conductor: resumen.conductorNombre,
    "Tanda inicial (gal)": detalle.lecturas?.tandaInicial ?? "",
    "Totalizador inicial": detalle.lecturas?.totInicial ?? "",
    "Tanda final (gal)": detalle.lecturas?.tandaFinal ?? "",
    "Totalizador final": detalle.lecturas?.totFinal ?? "",
    "Galones despachados": resumen.galones,
    "Contador del equipo": detalle.lecturaEquipo ?? "",
    "Tipo de contador": detalle.tipoLectura ?? "",
    Veredicto: TEXTO_ESTADO[resumen.estado],
    Banderas: resumen.banderas.join(", ") || "—",
    "Gal sin registrar": detalle.galNoRegistrados ?? "",
  };
}

const ANCHOS_MEDIDOR = [12, 7, 9, 26, 18, 15, 16, 14, 16, 16, 18, 15, 12, 22, 15];

/** Vista de inventario: las tres cifras del flujo (con cuánto llegó,
 *  cuánto se cargó, total al salir), la duración y el veredicto. Sale
 *  completa de la lista — sin pedir el detalle de cada carga. */
export function filaCargaInventario(carga: CargaResumen): Record<string, Celda> {
  return {
    Fecha: carga.fecha,
    Hora: carga.hora,
    Equipo: carga.equipoCodigo,
    Descripción: carga.equipoDescripcion,
    Operador: carga.conductorNombre,
    "Llegó con (gal)": carga.llegadaGal ?? "",
    "Galones cargados (gal)": carga.galones,
    "Total al salir (gal)": carga.inventarioFinalGal ?? "",
    Duración: formatearDuracion(carga.duracionSegundos),
    Veredicto: TEXTO_ESTADO[carga.estado],
    Banderas: carga.banderas.join(", ") || "—",
  };
}

const ANCHOS_INVENTARIO = [12, 7, 9, 26, 18, 15, 18, 17, 13, 12, 22];

/** Detalles por lotes acotados: la exportación de medidor necesita las
 *  lecturas de cada carga, pero jamás cientos de peticiones a la vez. */
export async function porLotes<T, R>(
  elementos: T[],
  tamano: number,
  operacion: (elemento: T) => Promise<R>,
): Promise<R[]> {
  const resultados: R[] = [];
  for (let inicio = 0; inicio < elementos.length; inicio += tamano) {
    const lote = elementos.slice(inicio, inicio + tamano);
    resultados.push(...(await Promise.all(lote.map(operacion))));
  }
  return resultados;
}

const CONCURRENCIA_DETALLES = 6;

export async function descargarExcel(
  fuente: FuenteDatosTablero,
  identidad: ContextoTablero,
  opciones: { alcance: Alcance; sedeId: string | null },
): Promise<void> {
  const { alcance, sedeId } = opciones;
  const XLSX = await import("xlsx");
  const anchos = <T extends object>(hoja: T, medidas: number[]): T => {
    (hoja as { "!cols"?: Array<{ wch: number }> })["!cols"] = medidas.map((w) => ({ wch: w }));
    return hoja;
  };

  // Identidad por datos (DEC-017/DEC-018): el archivo lleva al cliente
  // de la sesión, jamás un nombre hardcodeado.
  const [pagina, hoy] = await Promise.all([
    fuente.listarCargas({ estado: "todas", sedeId }),
    fuente.resumenHoy({ sedeId }),
  ]);
  const hoyFecha = hoy.cargasDeHoy[0]?.fecha ?? "";
  const seleccion =
    alcance === "dia" ? pagina.cargas.filter((carga) => carga.fecha === hoyFecha) : pagina.cargas;

  const vistaMedidor = identidad.perfil.vistaEvidencia === "medidor";
  const filas: Array<Record<string, Celda>> = vistaMedidor
    ? (await porLotes(seleccion, CONCURRENCIA_DETALLES, (carga) => fuente.detalleCarga(carga.id))).map(
        filaCargaMedidor,
      )
    : seleccion.map(filaCargaInventario);

  const conSuministro = identidad.perfil.modulos.includes("suministro");

  const sede = identidad.sedes.find((candidata) => candidata.id === sedeId);
  const libro = XLSX.utils.book_new();
  const encabezado = [
    ["CUADRE · Control de combustible en planta"],
    ["Cliente", identidad.cliente.nombre],
    [
      "Sede",
      sede ? [sede.nombre, sede.ciudad].filter(Boolean).join(", ") : "Todas las sedes del cliente",
    ],
    ["Perfil operativo", identidad.perfil.nombre],
    ...(identidad.medidor
      ? [["Medidor", `${identidad.medidor.modelo} · instalado ${identidad.medidor.instalado}`]]
      : []),
    ["Alcance", alcance === "dia" ? "Detalle del día" : "Detalle de los últimos 14 días"],
    ["Proveedor", "Lubryco S.A.S. — Buga, Valle del Cauca"],
    [],
    ["Nota", "Existencias estimadas por balance; margen ±2%."],
  ];
  XLSX.utils.book_append_sheet(libro, anchos(XLSX.utils.aoa_to_sheet(encabezado), [14, 62]), "Portada");

  XLSX.utils.book_append_sheet(
    libro,
    anchos(XLSX.utils.json_to_sheet(filas), vistaMedidor ? ANCHOS_MEDIDOR : ANCHOS_INVENTARIO),
    alcance === "dia" ? "Cargas del día" : "Detalle de cargas",
  );

  if (alcance === "mes") {
    XLSX.utils.book_append_sheet(
      libro,
      anchos(
        XLSX.utils.json_to_sheet(
          hoy.consumo14d.map((dia) => ({
            Fecha: dia.fecha,
            "Galones despachados": dia.galones,
            Observación: dia.parcial ? "Día parcial" : "",
          })),
        ),
        [14, 20, 26],
      ),
      "Consumo por día",
    );

    const equipos = await fuente.resumenEquipos({ sedeId });
    XLSX.utils.book_append_sheet(
      libro,
      anchos(
        XLSX.utils.json_to_sheet(
          equipos.equipos.map((equipo) => ({
            Equipo: equipo.codigo,
            Descripción: equipo.descripcion,
            Categoría: equipo.categoria,
            "Galones del período": equipo.galones7d,
            "Uso registrado": equipo.uso ?? "",
            Rendimiento:
              equipo.rendimiento !== null ? `${equipo.rendimiento} ${equipo.medida ?? ""}` : "",
            "Desvío %": equipo.desvioPct ?? "",
          })),
        ),
        [9, 26, 13, 19, 15, 14, 10],
      ),
      "Consumo por equipo",
    );

    // Entregas y balance existen solo si el perfil declara el módulo
    // de suministro: al resto no se le fabrican hojas vacías (P0.8).
    if (conSuministro) {
      const suministro = await fuente.resumenSuministro({ sedeId });
      XLSX.utils.book_append_sheet(
        libro,
        anchos(
          XLSX.utils.json_to_sheet(
            suministro.entregas.map((entrega) => ({
              Remisión: entrega.numeroRemision,
              Fecha: entrega.fecha,
              "Galones entregados": entrega.galones,
              Carrotanque: entrega.placaCarrotanque,
              "Recibido por": entrega.recibidoPor,
            })),
          ),
          [12, 14, 18, 14, 18],
        ),
        "Entregas Lubryco",
      );

      XLSX.utils.book_append_sheet(
        libro,
        anchos(
          XLSX.utils.aoa_to_sheet([
            ["Concepto", "Galones"],
            ["Entregado por Lubryco", suministro.balance.entregadoTotalGal],
            ["Despachado a equipos", -suministro.balance.despachadoTotalGal],
            ["Existencia estimada en tanque", suministro.balance.existenciaEstimadaGal ?? "—"],
            [],
            ["Autonomía estimada (días)", suministro.balance.autonomiaDias ?? "—"],
            ["Galones despachados sin equipo asignado", pagina.galSinRegistrarGal],
          ]),
          [40, 12],
        ),
        "Balance",
      );
    }
  }

  // Nombre de archivo derivado del cliente (sin espacios ni tildes).
  const rotulo = (identidad.cliente.nombreComercial ?? identidad.cliente.nombre)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const nombre =
    alcance === "dia" ? `Cuadre_${rotulo}_dia_${hoyFecha}.xlsx` : `Cuadre_${rotulo}_14_dias.xlsx`;
  XLSX.writeFile(libro, nombre);
}
