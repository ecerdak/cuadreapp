// Exportación a Excel, portada del diseño aprobado (descargarExcel del
// mockup): las columnas salen en el orden en que un auditor las revisa —
// identificación, las cuatro lecturas del medidor, el resultado, y al
// final el veredicto con su bandera. Los galones van como número, no
// como texto, para que el cliente pueda sumar sin limpiar la hoja.
// SheetJS se carga bajo demanda: no pesa en el arranque del tablero.

import type { DetalleCarga, FuenteDatosTablero } from "./puertos";
import { TEXTO_ESTADO } from "../tema";
import { CLIENTE, MEDIDOR } from "./contexto-cliente";

type Alcance = "dia" | "mes";

function filaCarga(detalle: DetalleCarga) {
  const { resumen } = detalle;
  return {
    Fecha: resumen.fecha,
    Hora: resumen.hora,
    Equipo: resumen.equipoCodigo,
    Descripción: resumen.equipoDescripcion,
    Conductor: resumen.conductorNombre,
    // Perfil Medidor Doble; una carga de otro perfil deja las celdas vacías.
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

export async function descargarExcel(fuente: FuenteDatosTablero, alcance: Alcance): Promise<void> {
  const XLSX = await import("xlsx");
  const anchos = <T extends object>(hoja: T, medidas: number[]): T => {
    (hoja as { "!cols"?: Array<{ wch: number }> })["!cols"] = medidas.map((w) => ({ wch: w }));
    return hoja;
  };

  const [pagina, hoy] = await Promise.all([
    fuente.listarCargas({ estado: "todas" }),
    fuente.resumenHoy(),
  ]);
  const hoyFecha = hoy.cargasDeHoy[0]?.fecha ?? "";
  const seleccion =
    alcance === "dia" ? pagina.cargas.filter((carga) => carga.fecha === hoyFecha) : pagina.cargas;
  const detalles = await Promise.all(seleccion.map((carga) => fuente.detalleCarga(carga.id)));

  const libro = XLSX.utils.book_new();
  const encabezado = [
    ["CUADRE · Control de combustible en planta"],
    ["Cliente", CLIENTE.nombre],
    ["Sede", CLIENTE.sede],
    ["Medidor", `${MEDIDOR.modelo} · instalado ${MEDIDOR.instalado}`],
    ["Alcance", alcance === "dia" ? "Detalle del día" : "Detalle de los últimos 14 días"],
    ["Proveedor", "Lubryco S.A.S. — Buga, Valle del Cauca"],
    [],
    ["Nota", "DEMOSTRACIÓN: datos simulados. Existencias estimadas por balance; margen ±2%."],
  ];
  XLSX.utils.book_append_sheet(libro, anchos(XLSX.utils.aoa_to_sheet(encabezado), [14, 62]), "Portada");

  XLSX.utils.book_append_sheet(
    libro,
    anchos(
      XLSX.utils.json_to_sheet(detalles.map(filaCarga)),
      [12, 7, 9, 26, 18, 15, 16, 14, 16, 16, 18, 15, 12, 22, 15],
    ),
    alcance === "dia" ? "Cargas del día" : "Detalle de cargas",
  );

  if (alcance === "mes") {
    const [equipos, suministro] = await Promise.all([
      fuente.resumenEquipos(),
      fuente.resumenSuministro(),
    ]);

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
          ["Entregado por Lubryco", suministro.entregadoTotalGal],
          ["Despachado a equipos", -suministro.despachadoTotalGal],
          ["Existencia estimada en tanque", suministro.existenciaEstimadaGal],
          [],
          ["Autonomía estimada (días)", suministro.autonomiaDias],
          ["Galones despachados sin equipo asignado", pagina.galSinRegistrarGal],
        ]),
        [40, 12],
      ),
      "Balance",
    );
  }

  const nombre =
    alcance === "dia" ? `Cuadre_El_Trebol_dia_${hoyFecha}.xlsx` : "Cuadre_El_Trebol_14_dias.xlsx";
  XLSX.writeFile(libro, nombre);
}
