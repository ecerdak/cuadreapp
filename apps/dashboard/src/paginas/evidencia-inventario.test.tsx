// La vista de evidencia del perfil «Carga sobre Inventario» (DEC-016)
// y la identidad por datos (DEC-017). El diseño de El Trébol lo
// custodian las pruebas de fidelidad existentes; aquí se fija que el
// dashboard hereda identidad de la fuente y pinta 150 + 600 = 750.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import type { DetalleCarga } from "../datos/puertos";
import { FuenteSimulada } from "../datos/fuente-simulada";
import { EvidenciaInventario } from "./Cargas";
import { DisposicionTablero } from "../disposicion/DisposicionTablero";

const DETALLE_INVENTARIO: DetalleCarga = {
  resumen: {
    id: "c-inv-1",
    fecha: "2026-08-04",
    hora: "09:05",
    equipoCodigo: "SMW-477",
    equipoDescripcion: "Carrotanque 1",
    conductorNombre: "Operadora EDS",
    galones: 600.0,
    estado: "ok",
    banderas: [],
  },
  lecturas: null,
  inventario: { llegadaGal: 150.0, despachadosGal: 600.0, totalSalidaGal: 750.0 },
  lecturaEquipo: null,
  tipoLectura: null,
  duracionSegundos: 312,
  candados: [],
  galNoRegistrados: null,
  notas: "Sin novedades.",
  fotos: { inicial: "data:imagen-llegada", final: "data:imagen-salida" },
};

describe("EvidenciaInventario — el registro Sacyr completo", () => {
  it("muestra Llegó con 150, Despachado 600 y Total al salir 750 (calculado)", () => {
    const html = renderToStaticMarkup(<EvidenciaInventario datos={DETALLE_INVENTARIO} />);
    expect(html).toContain("Llegó con");
    expect(html).toContain("150,0");
    expect(html).toContain("Despachado por Lubryco");
    expect(html).toContain("600,0");
    expect(html).toContain("Total al salir");
    expect(html).toContain("750,0");
    expect(html).toContain("El total lo calcula el sistema");
  });

  it("muestra operadora, equipo, fecha/hora, duración, estado, fotos y observaciones", () => {
    const html = renderToStaticMarkup(<EvidenciaInventario datos={DETALLE_INVENTARIO} />);
    expect(html).toContain("Operadora EDS");
    expect(html).toContain("SMW-477");
    expect(html).toContain("2026-08-04 09:05");
    expect(html).toContain("5 min 12 s");
    expect(html).toContain("data:imagen-llegada");
    expect(html).toContain("data:imagen-salida");
    expect(html).toContain("Sin novedades.");
    // Nada del vocabulario del otro perfil:
    expect(html).not.toContain("Tanda");
    expect(html).not.toContain("Totalizador");
  });
});

describe("identidad del tablero por datos (DEC-017)", () => {
  it("la fuente simulada entrega la identidad de El Trébol — mismos valores del diseño aprobado", async () => {
    const fuente = new FuenteSimulada({ latenciaMs: [0, 0] });
    const identidad = await fuente.identidad();
    expect(identidad.clienteNombre).toBe("Industrias Alimenticias El Trébol S.A.S.");
    expect(identidad.sedeVisible).toBe("Planta Buga, Valle del Cauca");
    expect(identidad.perfil.codigo).toBe("medidor_doble");
    expect(identidad.logoUrl).toBeTruthy();
    expect(identidad.medidor?.modelo).toBe("Fill-Rite Serie 900");
  });

  it("el detalle simulado de El Trébol sigue siendo medidor doble (inventario null)", async () => {
    const fuente = new FuenteSimulada({ latenciaMs: [0, 0] });
    const pagina = await fuente.listarCargas({ estado: "todas" });
    const detalle = await fuente.detalleCarga(pagina.cargas[0]!.id);
    expect(detalle.inventario).toBeNull();
    expect(detalle.lecturas).not.toBeNull();
  });
});

describe("identidad corporativa en el Dashboard (DEC-018)", () => {
  it("la fuente entrega los colores del cliente como dato", async () => {
    const fuente = new FuenteSimulada({ latenciaMs: [0, 0] });
    const identidad = await fuente.identidad();
    expect(identidad.colorPrimario).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(identidad.colorSecundario).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("el marco no nombra clientes: sin fuente arranca con identidad neutra", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <DisposicionTablero />
      </MemoryRouter>,
    );
    // Sin datos no hay tarjeta de cliente ni línea de medidor.
    expect(html).not.toContain("Iniciales de");
    expect(html).toContain("datos simulados de");
    expect(html).toContain("Control de combustible en planta");
  });
});
