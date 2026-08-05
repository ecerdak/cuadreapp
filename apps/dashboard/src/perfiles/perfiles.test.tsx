// El tablero se compone desde el Perfil Operativo (DEC-016) y se viste
// con la identidad del cliente (DEC-018) — ambas cosas por DATOS.
//
// Lo que estas pruebas defienden es la promesa comercial de la Etapa
// P.2: crear un cliente en la consola y que su tablero exista sin
// escribir código. Por eso se ejercita con DOS perfiles y DOS
// identidades distintas contra los MISMOS componentes.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { PERFILES } from "@cuadreapp/dominio";
import type { CargaResumen, ContextoTablero, DetalleCarga } from "../datos/puertos";
import { columnaDe, evidenciaDeCarga, panelDe } from "./registro";
import { PanelInventario, PanelTotalizador } from "./paneles";
import type { ResumenHoy } from "../datos/puertos";

/* ---- dos empresas cualesquiera, creadas solo con datos ---- */

const CONTEXTO_MEDIDOR: ContextoTablero = {
  usuario: { nombre: "Supervisora", rol: "supervisor" },
  permisos: ["tablero.leer"],
  cliente: {
    id: "cli-1",
    nombre: "Empresa Uno S.A.S.",
    nombreComercial: "Uno",
    colorPrimario: "#1E9B4B",
    colorSecundario: "#0E5C2C",
    logoUrl: null,
  },
  perfil: { ...PERFILES.medidor_doble },
  sedes: [{ id: "sede-1", nombre: "Planta Norte", ciudad: "Buga" }],
  sedeActual: "sede-1",
  medidor: { modelo: "Fill-Rite Serie 900", instalado: "2026-07-06" },
};

const CONTEXTO_INVENTARIO: ContextoTablero = {
  ...CONTEXTO_MEDIDOR,
  cliente: {
    id: "cli-2",
    nombre: "Empresa Dos S.A.",
    nombreComercial: "Dos",
    colorPrimario: "#B4322B",
    colorSecundario: "#5C1512",
    logoUrl: null,
  },
  perfil: { ...PERFILES.carga_inventario },
  medidor: null,
};

const CARGA_MEDIDOR: CargaResumen = {
  id: "c1",
  fecha: "2026-08-05",
  hora: "06:12",
  equipoCodigo: "T-04",
  equipoDescripcion: "Tractor",
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

const CARGA_INVENTARIO: CargaResumen = {
  ...CARGA_MEDIDOR,
  id: "c2",
  equipoCodigo: "SMW-477",
  equipoDescripcion: "Carrotanque 1",
  conductorNombre: "Operadora EDS",
  galones: 600,
  perfilCodigo: "carga_inventario",
  llegadaGal: 150,
  inventarioFinalGal: 750,
  capacidadEquipoGal: 1000,
};

const HOY_BASE: ResumenHoy = {
  veredicto: { tono: "ok", titulo: "Todo cuadra." },
  totalizadorGal: 1889.5,
  galSinRegistrarGal: 0,
  balance: {
    entregadoTotalGal: 1550,
    despachadoTotalGal: 900,
    consumoDiarioGal: 120,
    existenciaEstimadaGal: 650,
    autonomiaDias: 5.4,
  },
  inventarioHoy: {
    recibidoGal: 150,
    despachadoGal: 600,
    totalSalidaGal: 750,
    capacidadGal: 1000,
    llenadoPct: 75,
  },
  consumo14d: [{ fecha: "2026-08-05", galones: 42.5, parcial: true }],
  cargasDeHoy: [CARGA_MEDIDOR],
};

describe("el perfil declara la composición y el tablero la obedece", () => {
  it("cada panel declarado tiene componente y ancho registrado", () => {
    for (const perfil of Object.values(PERFILES)) {
      for (const codigo of perfil.panelesHoy) {
        const entrada = panelDe(codigo);
        expect(entrada.componente).toBeTypeOf("function");
        expect([1, 2, 3]).toContain(entrada.ancho);
      }
    }
  });

  it("cada columna declarada tiene rótulo y formateador registrado", () => {
    for (const perfil of Object.values(PERFILES)) {
      for (const codigo of perfil.columnasCargas) {
        expect(columnaDe(codigo).rotulo.length).toBeGreaterThan(0);
      }
    }
  });

  it("una pieza sin componente falla ruidosamente, no en silencio", () => {
    expect(() => panelDe("pieza_inventada" as never)).toThrow(/sin componente/i);
    expect(() => columnaDe("columna_inventada" as never)).toThrow(/sin definición/i);
  });

  it("los paneles de Hoy caben en la rejilla de 3 columnas del diseño aprobado", () => {
    for (const perfil of Object.values(PERFILES)) {
      const anchoPrimeraFila = perfil.panelesHoy
        .map((codigo) => panelDe(codigo).ancho)
        .filter((ancho) => ancho < 3)
        .reduce((suma, ancho) => suma + ancho, 0);
      expect(anchoPrimeraFila).toBeLessThanOrEqual(3);
    }
  });
});

describe("paneles de Hoy — cada perfil ve lo suyo", () => {
  it("Medidor Doble muestra el totalizador con su rodillo y el desglose", () => {
    const html = renderToStaticMarkup(<PanelTotalizador datos={HOY_BASE} contexto={CONTEXTO_MEDIDOR} />);
    expect(html).toContain("Totalizador del medidor");
    expect(html).toContain("instaló el dispensador el 2026-07-06");
    expect(html).toContain("Entregado por Lubryco");
    expect(html).toContain("Despachado a equipos");
  });

  it("el totalizador se abstiene cuando el alcance abarca varias sedes", () => {
    const html = renderToStaticMarkup(
      <PanelTotalizador
        datos={{ ...HOY_BASE, totalizadorGal: null }}
        contexto={{
          ...CONTEXTO_MEDIDOR,
          sedes: [
            { id: "s1", nombre: "Planta Norte", ciudad: null },
            { id: "s2", nombre: "Planta Sur", ciudad: null },
          ],
        }}
      />,
    );
    expect(html).toContain("Elige una sede");
    expect(html).not.toContain("Galones acumulados desde");
  });

  it("Carga sobre Inventario muestra inicial, recibidos, final, capacidad y llenado", () => {
    const html = renderToStaticMarkup(
      <PanelInventario datos={HOY_BASE} contexto={CONTEXTO_INVENTARIO} />,
    );
    expect(html).toContain("Inventario del día");
    expect(html).toContain("150,0");
    expect(html).toContain("Galones recibidos de Lubryco");
    expect(html).toContain("750,0");
    expect(html).toContain("Inventario final");
    expect(html).toContain("1.000 gal");
    expect(html).toContain("75 %");
    // El vocabulario del otro perfil no aparece.
    expect(html).not.toContain("Totalizador");
  });

  it("sin movimiento del día, el panel de inventario lo dice en vez de mostrar ceros", () => {
    const html = renderToStaticMarkup(
      <PanelInventario
        datos={{
          ...HOY_BASE,
          inventarioHoy: {
            recibidoGal: 0,
            despachadoGal: 0,
            totalSalidaGal: 0,
            capacidadGal: null,
            llenadoPct: null,
          },
        }}
        contexto={CONTEXTO_INVENTARIO}
      />,
    );
    expect(html).toContain("Aún no hay cargas hoy");
  });
});

describe("columnas de la tabla de cargas por perfil", () => {
  it("Medidor Doble: una sola columna de galones", () => {
    const columnas = PERFILES.medidor_doble.columnasCargas.map(columnaDe);
    expect(columnas.map((columna) => columna.rotulo)).toEqual(["Galones"]);
    expect(columnas[0]!.valor(CARGA_MEDIDOR)).toBe("42,5");
  });

  it("Carga sobre Inventario: llegada, despachado, total al salir y llenado", () => {
    const columnas = PERFILES.carga_inventario.columnasCargas.map(columnaDe);
    expect(columnas.map((columna) => columna.rotulo)).toEqual([
      "Llegó con",
      "Galones",
      "Total al salir",
      "Llenado",
    ]);
    expect(columnas.map((columna) => columna.valor(CARGA_INVENTARIO))).toEqual([
      "150,0",
      "600,0",
      "750,0",
      "75 %",
    ]);
  });

  it("una carga de otro perfil deja las celdas que no le aplican en «—»", () => {
    const columnas = PERFILES.carga_inventario.columnasCargas.map(columnaDe);
    expect(columnas.map((columna) => columna.valor(CARGA_MEDIDOR))).toEqual(["—", "42,5", "—", "—"]);
  });
});

describe("evidencia por SNAPSHOT de la carga, no por el perfil del cliente", () => {
  const detalle = (resumen: CargaResumen, extra: Partial<DetalleCarga> = {}): DetalleCarga => ({
    resumen,
    lecturas: { tandaInicial: 0, totInicial: 1847, tandaFinal: 42.5, totFinal: 1889.5 },
    inventario: null,
    lecturaEquipo: 1093,
    tipoLectura: "horometro",
    duracionSegundos: 312,
    candados: [],
    galNoRegistrados: null,
    notas: "Sin novedades.",
    fotos: { inicial: "data:antes", final: "data:despues" },
    ...extra,
  });

  it("una carga de medidor se ve con tanda y totalizador", () => {
    const Evidencia = evidenciaDeCarga(CARGA_MEDIDOR.perfilCodigo);
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Evidencia datos={detalle(CARGA_MEDIDOR)} />
      </MemoryRouter>,
    );
    expect(html).toContain("Tanda");
    expect(html).toContain("Totalizador");
    expect(html).toContain("Verificación automática");
  });

  it("una carga de inventario se ve con llegó/despachado/total, y 150 + 600 = 750", () => {
    const Evidencia = evidenciaDeCarga(CARGA_INVENTARIO.perfilCodigo);
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Evidencia
          datos={detalle(CARGA_INVENTARIO, {
            lecturas: null,
            inventario: { llegadaGal: 150, despachadosGal: 600, totalSalidaGal: 750 },
          })}
        />
      </MemoryRouter>,
    );
    expect(html).toContain("Llegó con");
    expect(html).toContain("150,0");
    expect(html).toContain("Despachado por Lubryco");
    expect(html).toContain("600,0");
    expect(html).toContain("Total al salir");
    expect(html).toContain("750,0");
    expect(html).toContain("El total lo calcula el sistema");
    expect(html).toContain("5 min 12 s");
    expect(html).toContain("Operadora EDS");
    // Nada del vocabulario del otro perfil:
    expect(html).not.toContain("Tanda");
    expect(html).not.toContain("Totalizador");
  });

  it("una carga vieja conserva SU vista aunque el cliente ya use otro perfil", () => {
    // El contexto del cliente dice carga_inventario; la carga nació con
    // medidor. Manda el snapshot.
    expect(CONTEXTO_INVENTARIO.perfil.vistaEvidencia).toBe("inventario");
    const Evidencia = evidenciaDeCarga(CARGA_MEDIDOR.perfilCodigo);
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Evidencia datos={detalle(CARGA_MEDIDOR)} />
      </MemoryRouter>,
    );
    expect(html).toContain("Totalizador");
    expect(html).not.toContain("Llegó con");
  });

  it("un perfil desconocido en una carga falla ruidosamente", () => {
    expect(() => evidenciaDeCarga("perfil_borrado" as never)).toThrow(/desconocido/i);
  });
});
