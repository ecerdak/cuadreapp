// El adaptador contra /api/v1/tablero/*: traducción a los modelos de
// pantalla, composición de veredictos y manejo de fallas.
//
// Se prueba con DOS empresas de perfiles distintos servidas por el
// mismo código, porque esa es la afirmación de la etapa: un solo
// Dashboard, sin ramas por cliente.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { FuenteApi, ErrorApi } from "./fuente-api";
import { clasificarFalla } from "./contexto";

const solicitar = vi.fn();
vi.mock("./sesion", () => ({
  solicitar: (...argumentos: unknown[]) => solicitar(...argumentos),
  SesionVencida: class SesionVencida extends Error {},
}));

const respuesta = (cuerpo: unknown, ok = true) =>
  ({ ok, json: async () => cuerpo }) as unknown as Response;

const SIN_SEDE = { sedeId: null };
const fuente = new FuenteApi(() => new Date("2026-08-05T12:00:00-05:00"));

beforeEach(() => solicitar.mockReset());

const CONTEXTO_API = {
  usuario: { nombre: "Supervisora", rol: "supervisor" },
  permisos: ["tablero.leer"],
  cliente: {
    id: "cli-1",
    nombre: "Empresa Uno S.A.S.",
    nombreComercial: "Uno",
    colorPrimario: "#1E9B4B",
    colorSecundario: "#0E5C2C",
    logoUrl: "https://firmada/logo.webp",
  },
  perfil: {
    codigo: "medidor_doble",
    nombre: "Medidor Doble",
    modulos: ["hoy", "cargas", "equipos", "suministro"],
    panelesHoy: ["totalizador", "consumo", "cargas_del_dia"],
    columnasCargas: ["galones"],
    vistaEvidencia: "medidor",
  },
  sedes: [{ id: "s1", nombre: "Planta Norte", ciudad: "Buga" }],
  sedeActual: null,
  medidor: { modelo: "Fill-Rite Serie 900", instalado: "2026-07-06" },
};

const CARGA_API = {
  id: "c1",
  fecha: "2026-08-05",
  hora: "06:12",
  equipoCodigo: "T-04",
  equipoDescripcion: null,
  conductorNombre: "Duván Bonilla",
  galones: 42.5,
  estado: "ok",
  banderas: [],
  perfilCodigo: "medidor_doble",
  llegadaGal: null,
  inventarioFinalGal: null,
  capacidadEquipoGal: 80,
  galNoRegistrados: null,
};

const BALANCE_VACIO = {
  entregadoTotalGal: 0,
  despachadoTotalGal: 120,
  consumoDiarioGal: 17.1,
  existenciaEstimadaGal: null,
  autonomiaDias: null,
};

describe("contexto — la empresa llega entera desde la API", () => {
  it("no manda ningún identificador de cliente en la petición", async () => {
    solicitar.mockResolvedValue(respuesta(CONTEXTO_API));
    const contexto = await fuente.contexto();

    expect(solicitar).toHaveBeenCalledWith("/api/v1/tablero/contexto");
    expect(contexto.cliente.nombreComercial).toBe("Uno");
    expect(contexto.perfil.modulos).toContain("suministro");
  });

  it("otra empresa con otro perfil llega por el mismo camino", async () => {
    solicitar.mockResolvedValue(
      respuesta({
        ...CONTEXTO_API,
        cliente: { ...CONTEXTO_API.cliente, id: "cli-2", nombreComercial: "Dos" },
        perfil: {
          codigo: "carga_inventario",
          nombre: "Carga sobre Inventario",
          modulos: ["hoy", "cargas", "equipos"],
          panelesHoy: ["inventario", "consumo", "cargas_del_dia"],
          columnasCargas: ["llegada", "galones", "total_salida", "llenado"],
          vistaEvidencia: "inventario",
        },
        medidor: null,
      }),
    );
    const contexto = await fuente.contexto();
    expect(contexto.perfil.modulos).not.toContain("suministro");
    expect(contexto.perfil.vistaEvidencia).toBe("inventario");
  });
});

describe("hoy — hechos de la API, veredicto del tablero", () => {
  it("marca el día en curso como parcial y compone el veredicto de problema", async () => {
    solicitar.mockResolvedValue(
      respuesta({
        cargasDeHoy: [
          { ...CARGA_API, estado: "inconsistente", galNoRegistrados: 18, hora: "06:41" },
          CARGA_API,
        ],
        consumo14d: [
          { fecha: "2026-08-04", galones: 100 },
          { fecha: "2026-08-05", galones: 42.5 },
        ],
        totalizadorGal: 1889.5,
        galSinRegistrarGal: 18,
        balance: BALANCE_VACIO,
        inventarioHoy: {
          recibidoGal: 0,
          despachadoGal: 0,
          totalSalidaGal: 0,
          capacidadGal: null,
        },
      }),
    );

    const resumen = await fuente.resumenHoy(SIN_SEDE);

    expect(resumen.veredicto.tono).toBe("problema");
    expect(resumen.veredicto.titulo).toContain("1 de 2");
    expect(resumen.veredicto.detalle).toContain("18,0 gal arriba");
    expect(resumen.veredicto.detalle).toContain("T-04");
    expect(resumen.consumo14d.at(-1)!.parcial).toBe(true);
    expect(resumen.consumo14d[0]!.parcial).toBeUndefined();
    // Sin descripción en la base, la pantalla muestra el código.
    expect(resumen.cargasDeHoy[0]!.equipoDescripcion).toBe("T-04");
  });

  it("un día sin cargas no es un error: es un estado con su propia frase", async () => {
    solicitar.mockResolvedValue(
      respuesta({
        cargasDeHoy: [],
        consumo14d: [],
        totalizadorGal: null,
        galSinRegistrarGal: 0,
        balance: BALANCE_VACIO,
        inventarioHoy: { recibidoGal: 0, despachadoGal: 0, totalSalidaGal: 0, capacidadGal: null },
      }),
    );
    const resumen = await fuente.resumenHoy(SIN_SEDE);
    expect(resumen.veredicto.tono).toBe("ok");
    expect(resumen.veredicto.titulo).toContain("Aún no hay cargas");
  });

  it("calcula el % de llenado del inventario del día", async () => {
    solicitar.mockResolvedValue(
      respuesta({
        cargasDeHoy: [],
        consumo14d: [],
        totalizadorGal: null,
        galSinRegistrarGal: 0,
        balance: BALANCE_VACIO,
        inventarioHoy: {
          recibidoGal: 150,
          despachadoGal: 600,
          totalSalidaGal: 750,
          capacidadGal: 1000,
        },
      }),
    );
    const resumen = await fuente.resumenHoy(SIN_SEDE);
    expect(resumen.inventarioHoy.llenadoPct).toBe(75);
  });

  it("propaga la sede elegida como filtro", async () => {
    solicitar.mockResolvedValue(
      respuesta({
        cargasDeHoy: [],
        consumo14d: [],
        totalizadorGal: null,
        galSinRegistrarGal: 0,
        balance: BALANCE_VACIO,
        inventarioHoy: { recibidoGal: 0, despachadoGal: 0, totalSalidaGal: 0, capacidadGal: null },
      }),
    );
    await fuente.resumenHoy({ sedeId: "s1" });
    expect(solicitar).toHaveBeenCalledWith("/api/v1/tablero/hoy?sede_id=s1");
  });

  it("tieneCargas viaja tal cual, y ante una API sin el campo se asume que HAY (P0.6)", async () => {
    const base = {
      cargasDeHoy: [],
      consumo14d: [],
      totalizadorGal: null,
      galSinRegistrarGal: 0,
      balance: BALANCE_VACIO,
      inventarioHoy: { recibidoGal: 0, despachadoGal: 0, totalSalidaGal: 0, capacidadGal: null },
    };
    solicitar.mockResolvedValueOnce(respuesta({ ...base, tieneCargas: false }));
    expect((await fuente.resumenHoy(SIN_SEDE)).tieneCargas).toBe(false);

    // Sin el campo (API vieja), la bienvenida jamás tapa un tablero con
    // historia: se asume true.
    solicitar.mockResolvedValueOnce(respuesta(base));
    expect((await fuente.resumenHoy(SIN_SEDE)).tieneCargas).toBe(true);
  });
});

describe("cargas y evidencia", () => {
  it("el filtro «todas» no viaja como estado", async () => {
    solicitar.mockResolvedValue(
      respuesta({ cargas: [], total: 0, cuadran: 0, sinFotoFinal: 0, galSinRegistrarGal: 0 }),
    );
    await fuente.listarCargas({ estado: "todas", sedeId: null });
    expect(solicitar).toHaveBeenCalledWith("/api/v1/tablero/cargas");
  });

  it("el detalle arma los candados desde las banderas y separa las fotos por momento", async () => {
    solicitar.mockResolvedValue(
      respuesta({
        carga: { ...CARGA_API, estado: "inconsistente", banderas: ["SALTO_TOTALIZADOR"] },
        lecturas: { tandaInicial: 0, totInicial: 1847, tandaFinal: 42.5, totFinal: 1889.5 },
        inventario: null,
        lecturaEquipo: 1093,
        tipoLectura: "horometro",
        duracionSegundos: 312,
        galNoRegistrados: 18,
        notas: null,
        fotos: [
          { momento: "final", url: "https://firmada/final.webp" },
          { momento: "inicial", url: "https://firmada/inicial.webp" },
        ],
      }),
    );

    const detalle = await fuente.detalleCarga("c1");

    expect(detalle.candados).toHaveLength(3);
    expect(detalle.candados.find((c) => c.nombre.includes("Continuidad"))!.cumple).toBe(false);
    expect(detalle.fotos.inicial).toContain("inicial.webp");
    expect(detalle.fotos.final).toContain("final.webp");
  });
});

describe("equipos — desvío contra la mediana histórica", () => {
  it("deriva medida, uso formateado y desvío", async () => {
    solicitar.mockResolvedValue(
      respuesta({
        equipos: [
          {
            codigo: "T-04",
            descripcion: "Tractor",
            categoria: "Tractor",
            tipoMedidor: "horometro",
            capacidadTanqueGal: 80,
            galonesPeriodoGal: 84,
            usoPeriodo: 12,
            rendimiento: 7,
            medianaHistorica: 6.4,
            ultimoInventarioGal: null,
          },
          {
            codigo: "SMW-477",
            descripcion: "Carrotanque",
            categoria: null,
            tipoMedidor: "ninguno",
            capacidadTanqueGal: 1000,
            galonesPeriodoGal: 600,
            usoPeriodo: null,
            rendimiento: null,
            medianaHistorica: null,
            ultimoInventarioGal: 750,
          },
        ],
      }),
    );

    const { equipos, veredicto } = await fuente.resumenEquipos(SIN_SEDE);

    expect(equipos[0]!.medida).toBe("gal/h");
    expect(equipos[0]!.uso).toBe("12,0 h");
    expect(equipos[0]!.desvioPct).toBeCloseTo(9.4, 1);
    // Sin contador no hay rendimiento; sí llenado del tanque.
    expect(equipos[1]!.medida).toBeNull();
    expect(equipos[1]!.uso).toBeNull();
    expect(equipos[1]!.llenadoPct).toBe(75);
    expect(veredicto.tono).toBe("ok"); // 9,4 % todavía está en patrón
  });
});

describe("suministro — sin entregas, sin cifras inventadas", () => {
  it("dice que aún no hay entregas y no proyecta pedido", async () => {
    solicitar.mockResolvedValue(respuesta({ entregas: [], balance: BALANCE_VACIO }));
    const resumen = await fuente.resumenSuministro(SIN_SEDE);

    expect(resumen.veredicto.titulo).toContain("Aún no hay entregas");
    expect(resumen.balance.existenciaEstimadaGal).toBeNull();
    expect(resumen.proximaEntregaSugerida).toBeNull();
    expect(resumen.pedidoSugeridoGal).toBeNull();
  });

  it("con entregas calcula autonomía, próxima entrega y pedido sugerido", async () => {
    solicitar.mockResolvedValue(
      respuesta({
        entregas: [
          {
            numeroRemision: "R-4523",
            fecha: "2026-07-28",
            galones: 650,
            placaCarrotanque: "WLK-427",
            recibidoPor: "Aníbal Rengifo",
          },
        ],
        balance: {
          entregadoTotalGal: 1550,
          despachadoTotalGal: 900,
          consumoDiarioGal: 100,
          existenciaEstimadaGal: 650,
          autonomiaDias: 6.5,
        },
      }),
    );

    const resumen = await fuente.resumenSuministro(SIN_SEDE);

    expect(resumen.veredicto.tono).toBe("atencion"); // 6,5 días ≤ 7
    expect(resumen.veredicto.titulo).toContain("R-4523");
    expect(resumen.proximaEntregaSugerida).toBe("2026-08-07"); // 5-ago + (6,5 − 4)
    expect(resumen.pedidoSugeridoGal).toBe(50); // (100×7 − 650) a múltiplo de 50
  });
});

describe("fallas de la API", () => {
  it("un error trae su código y el request_id para soporte", async () => {
    solicitar.mockResolvedValue(
      respuesta({ error: "SEDE_FUERA_DE_ALCANCE", request_id: "req-1" }, false),
    );
    const falla = await fuente.resumenHoy(SIN_SEDE).catch((error: unknown) => error);
    expect(falla).toBeInstanceOf(ErrorApi);
    expect((falla as ErrorApi).codigo).toBe("SEDE_FUERA_DE_ALCANCE");
    expect((falla as ErrorApi).requestId).toBe("req-1");
  });

  it("cada falla de acceso lleva a su propia pantalla", () => {
    expect(clasificarFalla("Error: SESION_VENCIDA")).toBe("sesion_vencida");
    expect(clasificarFalla("ErrorApi: SIN_CLIENTE_EN_SESION")).toBe("sin_empresa");
    expect(clasificarFalla("ErrorApi: SIN_PERMISO")).toBe("sin_permiso");
    expect(clasificarFalla("TypeError: Failed to fetch")).toBe("otra");
  });
});
