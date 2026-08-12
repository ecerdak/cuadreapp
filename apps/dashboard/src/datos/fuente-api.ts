// Adaptador real de FuenteDatosTablero: /api/v1/tablero/* detrás del
// cliente HTTP único (DEC-014). Traduce las respuestas de la API a los
// modelos de lectura de la pantalla y compone los veredictos con las
// derivaciones — cero reglas de negocio, cero condicionales por
// cliente y cero conocimiento de qué empresa está mirando.
//
// Reemplazar la fuente simulada por esta fue cambiar UNA línea en la
// composición: la promesa del documento de arquitectura, cobrada.

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
} from "./puertos";
import type { Balance, EquipoResumen, InventarioHoy } from "./puertos";
import {
  candadosDe,
  pedidoSugeridoGal,
  proximaEntregaSugerida,
  veredictoCargas,
  veredictoEquipos,
  veredictoHoy,
  veredictoSuministro,
} from "./derivaciones";
import { solicitar } from "./sesion";

const DIAS_VENTANA = 14;

export class ErrorApi extends Error {
  constructor(
    readonly codigo: string,
    readonly requestId?: string,
  ) {
    super(codigo);
  }
}

async function json<T>(respuesta: Response): Promise<T> {
  const cuerpo = (await respuesta.json().catch(() => ({}))) as {
    error?: string;
    request_id?: string;
  };
  if (!respuesta.ok) {
    throw new ErrorApi(cuerpo.error ?? `HTTP_${respuesta.status}`, cuerpo.request_id);
  }
  return cuerpo as T;
}

const consulta = (parametros: Record<string, string | undefined | null>) => {
  const definidos = Object.entries(parametros).filter(([, valor]) => valor);
  return definidos.length
    ? `?${definidos.map(([clave, valor]) => `${clave}=${encodeURIComponent(String(valor))}`).join("&")}`
    : "";
};

/* ---- formas crudas de la API (lo que viaja por el cable) ---- */

/** La descripción del equipo es opcional en la base; la pantalla
 *  siempre muestra algo legible. */
type CargaApi = Omit<CargaResumen, "equipoDescripcion"> & { equipoDescripcion: string | null };

interface HoyApi {
  tieneCargas?: boolean;
  cargasDeHoy: CargaApi[];
  consumo14d: Array<{ fecha: string; galones: number }>;
  totalizadorGal: number | null;
  galSinRegistrarGal: number;
  balance: Balance;
  inventarioHoy: Omit<InventarioHoy, "llenadoPct">;
}

interface CargasApi {
  cargas: CargaApi[];
  total: number;
  cuadran: number;
  sinFotoFinal: number;
  galSinRegistrarGal: number;
}

interface DetalleApi {
  carga: CargaApi;
  lecturas: DetalleCarga["lecturas"];
  inventario: DetalleCarga["inventario"];
  lecturaEquipo: number | null;
  tipoLectura: string | null;
  duracionSegundos: number;
  galNoRegistrados: number | null;
  notas: string | null;
  fotos: Array<{ momento: string; url: string | null }>;
}

interface EquipoApi {
  codigo: string;
  descripcion: string | null;
  categoria: string | null;
  tipoMedidor: string;
  capacidadTanqueGal: number | null;
  galonesPeriodoGal: number;
  usoPeriodo: number | null;
  rendimiento: number | null;
  medianaHistorica: number | null;
  ultimoInventarioGal: number | null;
}

interface SuministroApi {
  entregas: ResumenSuministro["entregas"];
  balance: Balance;
}

const aCarga = (carga: CargaApi): CargaResumen => ({
  ...carga,
  equipoDescripcion: carga.equipoDescripcion ?? carga.equipoCodigo,
});

const porcentaje = (parte: number, total: number | null): number | null =>
  total && total > 0 ? Math.round((parte / total) * 1000) / 10 : null;

function aEquipo(equipo: EquipoApi): EquipoResumen {
  const medida =
    equipo.tipoMedidor === "horometro"
      ? ("gal/h" as const)
      : equipo.tipoMedidor === "odometro"
        ? ("gal/km" as const)
        : null;
  const decimales = equipo.tipoMedidor === "horometro" ? 1 : 0;
  return {
    codigo: equipo.codigo,
    descripcion: equipo.descripcion ?? equipo.codigo,
    categoria: equipo.categoria ?? "—",
    galones7d: equipo.galonesPeriodoGal,
    uso:
      equipo.usoPeriodo === null || medida === null
        ? null
        : `${equipo.usoPeriodo.toLocaleString("es-CO", { minimumFractionDigits: decimales })} ${
            equipo.tipoMedidor === "horometro" ? "h" : "km"
          }`,
    medida,
    rendimiento: equipo.rendimiento,
    desvioPct:
      equipo.rendimiento !== null && equipo.medianaHistorica !== null && equipo.medianaHistorica > 0
        ? Math.round((equipo.rendimiento / equipo.medianaHistorica - 1) * 1000) / 10
        : null,
    capacidadTanqueGal: equipo.capacidadTanqueGal,
    ultimoInventarioGal: equipo.ultimoInventarioGal,
    llenadoPct:
      equipo.ultimoInventarioGal === null
        ? null
        : porcentaje(equipo.ultimoInventarioGal, equipo.capacidadTanqueGal),
  };
}

export class FuenteApi implements FuenteDatosTablero {
  /** `ahora` es inyectable para que las pruebas fijen el día. */
  constructor(private readonly ahora: () => Date = () => new Date()) {}

  async contexto(): Promise<ContextoTablero> {
    return json(await solicitar("/api/v1/tablero/contexto"));
  }

  async resumenHoy(alcance: AlcanceConsulta): Promise<ResumenHoy> {
    const datos = await json<HoyApi>(
      await solicitar(`/api/v1/tablero/hoy${consulta({ sede_id: alcance.sedeId })}`),
    );
    const cargasDeHoy = datos.cargasDeHoy.map(aCarga);
    const hoy = datos.consumo14d.at(-1)?.fecha;
    return {
      // Tolerante con una API que aún no mande el campo: ante la duda
      // se asume que HAY cargas — la bienvenida jamás debe taparle el
      // tablero a un cliente con historia.
      tieneCargas: datos.tieneCargas ?? true,
      veredicto: veredictoHoy(cargasDeHoy),
      totalizadorGal: datos.totalizadorGal,
      galSinRegistrarGal: datos.galSinRegistrarGal,
      balance: datos.balance,
      inventarioHoy: {
        ...datos.inventarioHoy,
        llenadoPct: porcentaje(datos.inventarioHoy.totalSalidaGal, datos.inventarioHoy.capacidadGal),
      },
      // El día en curso va parcial: el corte es la hora actual.
      consumo14d: datos.consumo14d.map((dia) => (dia.fecha === hoy ? { ...dia, parcial: true } : dia)),
      cargasDeHoy,
    };
  }

  async listarCargas(filtro: FiltroCargas): Promise<PaginaCargas> {
    const datos = await json<CargasApi>(
      await solicitar(
        `/api/v1/tablero/cargas${consulta({
          sede_id: filtro.sedeId,
          estado: filtro.estado && filtro.estado !== "todas" ? filtro.estado : undefined,
        })}`,
      ),
    );
    return {
      veredicto: veredictoCargas({
        total: datos.total,
        cuadran: datos.cuadran,
        dias: DIAS_VENTANA,
      }),
      total: datos.total,
      cuadran: datos.cuadran,
      galSinRegistrarGal: datos.galSinRegistrarGal,
      sinFotoFinal: datos.sinFotoFinal,
      cargas: datos.cargas.map(aCarga),
    };
  }

  async detalleCarga(id: string): Promise<DetalleCarga> {
    const datos = await json<DetalleApi>(await solicitar(`/api/v1/tablero/cargas/${id}`));
    const foto = (momento: string) =>
      datos.fotos.find((candidata) => candidata.momento === momento)?.url ?? null;
    return {
      resumen: aCarga(datos.carga),
      lecturas: datos.lecturas,
      inventario: datos.inventario,
      lecturaEquipo: datos.lecturaEquipo,
      tipoLectura: datos.tipoLectura,
      duracionSegundos: datos.duracionSegundos,
      candados: candadosDe(datos.carga.banderas),
      galNoRegistrados: datos.galNoRegistrados,
      notas: datos.notas,
      fotos: { inicial: foto("inicial"), final: foto("final") },
    };
  }

  async resumenEquipos(alcance: AlcanceConsulta): Promise<ResumenEquipos> {
    const datos = await json<{ equipos: EquipoApi[] }>(
      await solicitar(`/api/v1/tablero/equipos${consulta({ sede_id: alcance.sedeId })}`),
    );
    const equipos = datos.equipos.map(aEquipo);
    return { veredicto: veredictoEquipos(equipos), equipos };
  }

  async resumenSuministro(alcance: AlcanceConsulta): Promise<ResumenSuministro> {
    const datos = await json<SuministroApi>(
      await solicitar(`/api/v1/tablero/suministro${consulta({ sede_id: alcance.sedeId })}`),
    );
    return {
      veredicto: veredictoSuministro(datos.balance, datos.entregas[0]),
      entregas: datos.entregas,
      balance: datos.balance,
      proximaEntregaSugerida: proximaEntregaSugerida(datos.balance, this.ahora()),
      pedidoSugeridoGal: pedidoSugeridoGal(datos.balance),
    };
  }
}
