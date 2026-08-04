// Adaptador de datos simulados: la ÚNICA implementación de
// FuenteDatosTablero en esta fase. Proyecta el escenario determinista a
// los modelos de lectura, con latencia simulada (para que esqueletos y
// estados de carga sean reales) y un conmutador de fallos para
// ejercitar EstadoError sin tocar código.

import type {
  CandadoDetalle,
  CargaResumen,
  DetalleCarga,
  FiltroCargas,
  FuenteDatosTablero,
  IdentidadTablero,
  PaginaCargas,
  ResumenEquipos,
  ResumenHoy,
  ResumenSuministro,
  Veredicto,
} from "./puertos";
import { CLIENTE, MEDIDOR } from "./contexto-cliente";
import logoTrebol from "../marca/assets/trebol.webp";
import {
  balanceSimulado,
  CARGAS_SIMULADAS,
  consumoPorDia14,
  ENTREGAS_SIMULADAS,
  EQUIPOS_SIMULADOS,
  galSinRegistrar,
  HOY_SIMULADO,
  TOTALIZADOR_FINAL_GAL,
  type CargaSimulada,
} from "../simulacion/escenario";
import fotoInicialFillRite from "../marca/assets/fillrite-antes.webp";
import fotoFinalFillRite from "../marca/assets/fillrite-despues.webp";

export interface OpcionesFuenteSimulada {
  latenciaMs?: [number, number];
  simularError?: boolean;
}

// Evidencia simulada: las fotos reales del Fill-Rite 900 del paquete de
// diseño original (assets importados, no imágenes improvisadas).

function aResumen(carga: CargaSimulada): CargaResumen {
  return {
    id: carga.id,
    fecha: carga.fecha,
    hora: carga.hora,
    equipoCodigo: carga.equipoCodigo,
    equipoDescripcion: carga.equipoDescripcion,
    conductorNombre: carga.conductorNombre,
    galones: carga.galones,
    estado: carga.estado,
    banderas: carga.banderas,
  };
}

// Los candados son presentación de banderas ya decididas por el dominio
// — derivación visual, jamás re-evaluación de reglas (DEC-011).
function candadosDe(carga: CargaSimulada): CandadoDetalle[] {
  return [
    {
      nombre: "Tanda en 0,0",
      descripcion: "El conductor reseteó la tanda antes de cargar",
      cumple: !carga.banderas.includes("TANDA_NO_RESETEADA"),
    },
    {
      nombre: "Continuidad del totalizador",
      descripcion: "El totalizador arrancó donde quedó la carga anterior",
      cumple: !carga.banderas.some((bandera) => bandera.startsWith("SALTO_TOTALIZADOR")),
    },
    {
      nombre: "La tanda cuadra",
      descripcion: "La tanda final es igual a lo que subió el totalizador",
      cumple: !carga.banderas.some((bandera) =>
        ["TANDA_NO_CUADRA", "TOTALIZADOR_RETROCEDE", "TOTALIZADOR_SIN_AVANCE"].includes(bandera),
      ),
    },
  ];
}

export class FuenteSimulada implements FuenteDatosTablero {
  constructor(private readonly opciones: OpcionesFuenteSimulada = {}) {}

  private async responder<T>(datos: () => T): Promise<T> {
    const [minimo, maximo] = this.opciones.latenciaMs ?? [300, 800];
    if (maximo > 0) {
      await new Promise((listo) => setTimeout(listo, minimo + Math.random() * (maximo - minimo)));
    }
    if (this.opciones.simularError) {
      throw new Error("Fallo simulado de la fuente de datos (?simular-error)");
    }
    return datos();
  }

  identidad(): Promise<IdentidadTablero> {
    // El escenario simulado ES El Trébol: su identidad viaja como dato
    // (DEC-017) — mismos valores del contexto de presentación previo,
    // así el diseño aprobado queda visualmente intacto.
    return this.responder(() => ({
      clienteNombre: CLIENTE.nombre,
      clienteCorto: CLIENTE.corto,
      sedeVisible: CLIENTE.sede,
      logoUrl: logoTrebol,
      colorPrimario: CLIENTE.colorPrimario,
      colorSecundario: CLIENTE.colorSecundario,
      perfil: { codigo: "medidor_doble", nombre: "Medidor Doble" },
      medidor: { modelo: MEDIDOR.modelo, instalado: MEDIDOR.instalado },
    }));
  }

  resumenHoy(): Promise<ResumenHoy> {
    return this.responder(() => {
      const deHoy = CARGAS_SIMULADAS.filter((carga) => carga.fecha === HOY_SIMULADO);
      const problema = deHoy.find((carga) => carga.estado === "inconsistente");
      const balance = balanceSimulado();

      const veredicto: Veredicto = problema
        ? {
            tono: "problema",
            titulo: `${deHoy.filter((c) => c.estado === "inconsistente").length} de ${deHoy.length} cargas de hoy no cuadra.`,
            detalle: problema.galNoRegistrados
              ? `El totalizador arrancó ${problema.galNoRegistrados.toFixed(1)} gal arriba en la carga de ${problema.equipoCodigo} (${problema.hora}): alguien cargó sin registrar. Revísala hoy, no al cierre de mes.`
              : "Revisa el detalle de la carga marcada.",
          }
        : {
            tono: "ok",
            titulo: `Las ${deHoy.length} cargas de hoy cuadran.`,
            detalle: "Nada pendiente por revisar.",
          };

      return {
        veredicto,
        existenciaEstimadaGal: balance.existenciaEstimadaGal,
        autonomiaDias: balance.autonomiaDias,
        totalizadorGal: TOTALIZADOR_FINAL_GAL,
        entregadoTotalGal: balance.entregadoTotalGal,
        despachadoTotalGal: balance.despachadoTotalGal,
        consumoDiarioGal: balance.consumoDiarioGal,
        galSinRegistrarGal: galSinRegistrar(),
        consumo14d: consumoPorDia14(),
        cargasDeHoy: deHoy.map(aResumen).reverse(),
      };
    });
  }

  listarCargas(filtro: FiltroCargas): Promise<PaginaCargas> {
    return this.responder(() => {
      const todas = [...CARGAS_SIMULADAS].reverse();
      const cuadran = todas.filter((carga) => carga.estado === "ok").length;
      const filtradas =
        !filtro.estado || filtro.estado === "todas"
          ? todas
          : todas.filter((carga) => carga.estado === filtro.estado);

      const noCuadran = todas.length - cuadran;
      const sinFotoFinal = todas.filter((carga) => carga.banderas.includes("FOTO_FALTANTE")).length;
      return {
        veredicto:
          noCuadran === 0
            ? { tono: "ok", titulo: `Las ${todas.length} cargas de los últimos 14 días cuadran.` }
            : {
                tono: noCuadran > 2 ? "problema" : "atencion",
                titulo: `${cuadran} de ${todas.length} cargas cuadran.`,
                detalle: `${noCuadran} necesitan revisión: abre cada una para ver sus fotos y candados.`,
              },
        total: todas.length,
        cuadran,
        galSinRegistrarGal: galSinRegistrar(),
        sinFotoFinal,
        cargas: filtradas.map(aResumen),
      };
    });
  }

  detalleCarga(id: string): Promise<DetalleCarga> {
    return this.responder(() => {
      const carga = CARGAS_SIMULADAS.find((candidata) => candidata.id === id);
      if (!carga) throw new Error(`No existe la carga ${id}`);
      return {
        resumen: aResumen(carga),
        lecturas: {
          tandaInicial: carga.tandaInicial,
          totInicial: carga.totInicial,
          tandaFinal: carga.tandaFinal,
          totFinal: carga.totFinal,
        },
        inventario: null, // el escenario simulado es medidor_doble
        lecturaEquipo: carga.lecturaEquipo,
        tipoLectura: EQUIPOS_SIMULADOS.find((equipo) => equipo.codigo === carga.equipoCodigo)!
          .tipoMedidor,
        duracionSegundos: carga.duracionSegundos,
        candados: candadosDe(carga),
        galNoRegistrados: carga.galNoRegistrados,
        notas: carga.notas,
        fotos: {
          inicial: fotoInicialFillRite,
          final: fotoFinalFillRite,
        },
      };
    });
  }

  resumenEquipos(): Promise<ResumenEquipos> {
    return this.responder(() => {
      const hace7 = CARGAS_SIMULADAS.filter((carga) => {
        const limite = new Date(`${HOY_SIMULADO}T00:00:00-05:00`);
        limite.setDate(limite.getDate() - 6);
        return carga.fecha >= limite.toISOString().slice(0, 10);
      });

      const equipos = EQUIPOS_SIMULADOS.map((equipo) => {
        const cargas = CARGAS_SIMULADAS.filter((carga) => carga.equipoCodigo === equipo.codigo);
        const galones7d = hace7
          .filter((carga) => carga.equipoCodigo === equipo.codigo)
          .reduce((suma, carga) => suma + carga.galones, 0);
        const galonesTotal = cargas.reduce((suma, carga) => suma + carga.galones, 0);
        const deltaTotal = cargas.reduce((suma, carga) => suma + carga.deltaLectura, 0);
        const rendimiento = deltaTotal > 0 ? galonesTotal / deltaTotal : null;
        const desvioPct =
          rendimiento !== null ? (rendimiento / equipo.medianaHistorica - 1) * 100 : null;
        const usoValor = Math.round(deltaTotal * 10) / 10;
        return {
          codigo: equipo.codigo,
          descripcion: equipo.descripcion,
          categoria: equipo.categoria,
          galones7d: Math.round(galones7d * 10) / 10,
          uso:
            deltaTotal > 0
              ? `${usoValor.toLocaleString("es-CO", { minimumFractionDigits: equipo.tipoMedidor === "horometro" ? 1 : 0 })} ${equipo.tipoMedidor === "horometro" ? "h" : "km"}`
              : null,
          medida: equipo.tipoMedidor === "horometro" ? ("gal/h" as const) : ("gal/km" as const),
          rendimiento: rendimiento !== null ? Math.round(rendimiento * 100) / 100 : null,
          desvioPct: desvioPct !== null ? Math.round(desvioPct * 10) / 10 : null,
        };
      });

      const desviado = [...equipos].sort(
        (a, b) => Math.abs(b.desvioPct ?? 0) - Math.abs(a.desvioPct ?? 0),
      )[0];
      const veredicto: Veredicto =
        desviado && Math.abs(desviado.desvioPct ?? 0) >= 10
          ? {
              tono: "atencion",
              titulo: `${desviado.codigo} se salió de su patrón: ${(desviado.desvioPct ?? 0) > 0 ? "+" : ""}${desviado.desvioPct}% contra su histórico.`,
              detalle: "Puede ser fuga, trabajo más pesado o lecturas mal tomadas — vale una mirada.",
            }
          : { tono: "ok", titulo: "Todos los equipos están dentro de su patrón de consumo." };

      return { veredicto, equipos };
    });
  }

  resumenSuministro(): Promise<ResumenSuministro> {
    return this.responder(() => {
      const balance = balanceSimulado();
      const ultima = ENTREGAS_SIMULADAS[ENTREGAS_SIMULADAS.length - 1]!;
      return {
        veredicto: {
          tono: balance.autonomiaDias <= 7 ? "atencion" : "ok",
          titulo: `Última entrega: ${ultima.numeroRemision} (${ultima.fecha}). Autonomía: ${Math.floor(balance.autonomiaDias)} días.`,
          detalle: `Próxima entrega sugerida: ${balance.proximaEntregaSugerida} (autonomía menos 2 días de lead time y 2 de colchón).`,
        },
        entregas: [...ENTREGAS_SIMULADAS].reverse(),
        entregadoTotalGal: balance.entregadoTotalGal,
        despachadoTotalGal: balance.despachadoTotalGal,
        existenciaEstimadaGal: balance.existenciaEstimadaGal,
        autonomiaDias: balance.autonomiaDias,
        proximaEntregaSugerida: balance.proximaEntregaSugerida,
        // Pedido sugerido: rellenar hasta ~7 días de consumo, redondeado a 50.
        pedidoSugeridoGal: Math.max(
          0,
          Math.round((balance.consumoDiarioGal * 7 - balance.existenciaEstimadaGal) / 50) * 50,
        ),
      };
    });
  }
}
