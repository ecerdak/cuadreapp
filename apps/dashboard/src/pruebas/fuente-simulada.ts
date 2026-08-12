// FIXTURE DE PRUEBAS — no entra al build de producción.
//
// Implementación de FuenteDatosTablero sobre el escenario determinista.
// Desde la Etapa P.2 el Dashboard consume exclusivamente la API; este
// adaptador sobrevive porque las pruebas de fidelidad del contrato
// visual necesitan datos ricos y estables (un salto de totalizador, una
// advertencia, una carga sin GPS) sin levantar servidor ni base.
//
// Que siga cumpliendo el MISMO contrato que FuenteApi es lo que hace
// útiles esas pruebas: si el contrato cambia, este archivo deja de
// compilar y las pruebas lo dicen antes que un despliegue.

import type {
  AlcanceConsulta,
  CargaResumen,
  ContextoTablero,
  DetalleCarga,
  FiltroCargas,
  FuenteDatosTablero,
  PaginaCargas,
  ResumenEquipos,
  ResumenHoy,
  ResumenSuministro,
} from "../datos/puertos";
import {
  candadosDe,
  pedidoSugeridoGal,
  proximaEntregaSugerida,
  veredictoCargas,
  veredictoEquipos,
  veredictoHoy,
  veredictoSuministro,
} from "../datos/derivaciones";
import logoTrebol from "../marca/assets/trebol.webp";
import {
  balanceSimulado,
  CARGAS_SIMULADAS,
  CLIENTE_SIMULADO,
  consumoPorDia14,
  ENTREGAS_SIMULADAS,
  EQUIPOS_SIMULADOS,
  galSinRegistrar,
  HOY_SIMULADO,
  MEDIDOR_SIMULADO,
  TOTALIZADOR_FINAL_GAL,
  type CargaSimulada,
} from "./escenario";
import fotoInicialFillRite from "../marca/assets/fillrite-antes.webp";
import fotoFinalFillRite from "../marca/assets/fillrite-despues.webp";

export interface OpcionesFuenteSimulada {
  latenciaMs?: [number, number];
  simularError?: boolean;
}

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
    perfilCodigo: "medidor_doble",
    llegadaGal: null,
    inventarioFinalGal: null,
    capacidadEquipoGal:
      EQUIPOS_SIMULADOS.find((equipo) => equipo.codigo === carga.equipoCodigo)?.capacidadTanqueGal ??
      null,
    galNoRegistrados: carga.galNoRegistrados,
  };
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

  contexto(): Promise<ContextoTablero> {
    return this.responder(() => ({
      usuario: { nombre: "Supervisora de planta", rol: "supervisor" },
      permisos: ["tablero.leer"],
      cliente: {
        id: "cliente-simulado",
        nombre: CLIENTE_SIMULADO.nombre,
        nombreComercial: CLIENTE_SIMULADO.corto,
        colorPrimario: CLIENTE_SIMULADO.colorPrimario,
        colorSecundario: CLIENTE_SIMULADO.colorSecundario,
        logoUrl: logoTrebol,
      },
      perfil: {
        codigo: "medidor_doble" as const,
        nombre: "Medidor Doble",
        modulos: ["hoy", "cargas", "equipos", "suministro"] as const,
        panelesHoy: ["totalizador", "consumo", "cargas_del_dia"] as const,
        columnasCargas: ["galones"] as const,
        vistaEvidencia: "medidor" as const,
      },
      sedes: [{ id: "sede-simulada", nombre: CLIENTE_SIMULADO.sede, ciudad: null }],
      sedeActual: "sede-simulada",
      medidor: { modelo: MEDIDOR_SIMULADO.modelo, instalado: MEDIDOR_SIMULADO.instalado },
    }));
  }

  resumenHoy(_alcance: AlcanceConsulta): Promise<ResumenHoy> {
    return this.responder(() => {
      const cargasDeHoy = CARGAS_SIMULADAS.filter((carga) => carga.fecha === HOY_SIMULADO)
        .map(aResumen)
        .reverse();
      const simulado = balanceSimulado();
      return {
        tieneCargas: CARGAS_SIMULADAS.length > 0,
        veredicto: veredictoHoy(cargasDeHoy),
        totalizadorGal: TOTALIZADOR_FINAL_GAL,
        galSinRegistrarGal: galSinRegistrar(),
        balance: simulado,
        inventarioHoy: {
          recibidoGal: 0,
          despachadoGal: 0,
          totalSalidaGal: 0,
          capacidadGal: null,
          llenadoPct: null,
        },
        consumo14d: consumoPorDia14(),
        cargasDeHoy,
      };
    });
  }

  listarCargas(filtro: FiltroCargas): Promise<PaginaCargas> {
    return this.responder(() => {
      const todas = [...CARGAS_SIMULADAS].reverse().map(aResumen);
      const cuadran = todas.filter((carga) => carga.estado === "ok").length;
      const filtradas =
        !filtro.estado || filtro.estado === "todas"
          ? todas
          : todas.filter((carga) => carga.estado === filtro.estado);

      return {
        veredicto: veredictoCargas({ total: todas.length, cuadran, dias: 14 }),
        total: todas.length,
        cuadran,
        galSinRegistrarGal: galSinRegistrar(),
        sinFotoFinal: todas.filter((carga) => carga.banderas.includes("FOTO_FALTANTE")).length,
        cargas: filtradas,
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
        inventario: null,
        lecturaEquipo: carga.lecturaEquipo,
        tipoLectura: EQUIPOS_SIMULADOS.find((equipo) => equipo.codigo === carga.equipoCodigo)!
          .tipoMedidor,
        duracionSegundos: carga.duracionSegundos,
        candados: candadosDe(carga.banderas),
        galNoRegistrados: carga.galNoRegistrados,
        notas: carga.notas,
        fotos: { inicial: fotoInicialFillRite, final: fotoFinalFillRite },
      };
    });
  }

  resumenEquipos(_alcance: AlcanceConsulta): Promise<ResumenEquipos> {
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
          capacidadTanqueGal: equipo.capacidadTanqueGal,
          ultimoInventarioGal: null,
          llenadoPct: null,
        };
      });

      return { veredicto: veredictoEquipos(equipos), equipos };
    });
  }

  resumenSuministro(_alcance: AlcanceConsulta): Promise<ResumenSuministro> {
    return this.responder(() => {
      const balance = balanceSimulado();
      const entregas = [...ENTREGAS_SIMULADAS].reverse();
      return {
        veredicto: veredictoSuministro(balance, entregas[0]),
        entregas,
        balance,
        proximaEntregaSugerida: proximaEntregaSugerida(
          balance,
          new Date(`${HOY_SIMULADO}T12:00:00-05:00`),
        ),
        pedidoSugeridoGal: pedidoSugeridoGal(balance),
      };
    });
  }
}
