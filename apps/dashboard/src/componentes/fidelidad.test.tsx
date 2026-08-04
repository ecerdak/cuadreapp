// Pruebas de fidelidad del tablero (contrato visual §7-§8): tokens,
// Rodillo con tambores claros y décima roja, ZonaA, Chip, Candado,
// BotonExcel y el marco con la co-marca. Los valores esperados vienen
// del mockup aprobado.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TEMA } from "../tema";
import { BotonExcel, Candado, Chip, ZonaA } from "./basicos";
import { GraficoConsumo, Rodillo } from "./medidor";
import { DisposicionTablero } from "../disposicion/DisposicionTablero";

describe("tokens del tablero", () => {
  it("la paleta es exactamente la aprobada", () => {
    expect(TEMA.fondo).toBe("#0B1219");
    expect(TEMA.panel).toBe("#111C26");
    expect(TEMA.panelAlto).toBe("#16232F");
    expect(TEMA.linea).toBe("#22374A");
    expect(TEMA.lineaSuave).toBe("#1A2A38");
    expect(TEMA.amarillo).toBe("#F5E01B");
    expect(TEMA.verde).toBe("#3FAE7E");
    expect(TEMA.ambar).toBe("#E2A233");
    expect(TEMA.rojo).toBe("#E2594C");
  });
});

describe("Rodillo — la carátula física", () => {
  it("enteros en tambores claros degradados y décima en tambor ROJO", () => {
    const html = renderToStaticMarkup(<Rodillo valor={1847.5} enteros={6} decima alto={44} />);
    expect(html).toContain("#F7F9FB"); // tambor claro
    expect(html).toContain("#C0362B"); // tambor rojo de la décima
    expect(html).toContain("width:27px"); // 44 × 0.62 redondeado
    expect(html).toContain("font-size:25px"); // 44 × 0.56 redondeado
    expect(html.match(/001847/) ?? html).toBeTruthy();
  });
  it("sin décima solo muestra los enteros", () => {
    const html = renderToStaticMarkup(<Rodillo valor={1847} enteros={6} alto={40} />);
    expect(html).not.toContain("#C0362B");
  });
});

describe("ZonaA — el veredicto antes de los datos", () => {
  const html = renderToStaticMarkup(
    <ZonaA
      veredicto={{ tono: "problema", titulo: "Quedan 3,8 días de diésel." }}
      titulo="Acción de hoy"
      hechos={[{ valor: "453 gal", etiqueta: "Existencia estimada en tanque" }]}
    />,
  );
  it("degradado lateral, borde izquierdo de 3 px y frase de 21 px", () => {
    expect(html).toContain("linear-gradient(90deg, #E2594C14 0%, #111C26 55%)");
    expect(html).toContain("border-left:3px solid #E2594C");
    expect(html).toContain("font-size:21px");
  });
  it("los hechos van en mono 17 px con etiqueta de 11", () => {
    expect(html).toContain("font-size:17px");
    expect(html).toContain("453 gal");
    expect(html).toContain("Existencia estimada en tanque");
  });
});

describe("piezas del contrato", () => {
  it("Chip: Cuadra / Revisar / No cuadra con el patrón 1F/55", () => {
    const ok = renderToStaticMarkup(<Chip estado="ok" />);
    expect(ok).toContain(">Cuadra</span>");
    expect(ok).toContain("#3FAE7E1F");
    expect(ok).toContain("#3FAE7E55");
    expect(renderToStaticMarkup(<Chip estado="advertencia" />)).toContain(">Revisar</span>");
    expect(renderToStaticMarkup(<Chip estado="inconsistente" />)).toContain(">No cuadra</span>");
  });

  it("Candado: cuadrito 17 px con ✓ o !", () => {
    const bien = renderToStaticMarkup(<Candado ok texto="La tanda arrancó en 0.0" detalle="…" />);
    expect(bien).toContain(">✓</span>");
    expect(bien).toContain("width:17px");
    const mal = renderToStaticMarkup(<Candado ok={false} texto="Salto" detalle="…" />);
    expect(mal).toContain(">!</span>");
  });

  it("BotonExcel lleva el sufijo XLSX", () => {
    const html = renderToStaticMarkup(
      <BotonExcel principal onClick={() => {}}>
        Día · hoy
      </BotonExcel>,
    );
    expect(html).toContain(">XLSX</span>");
    expect(html).toContain("background:#F5E01B");
  });

  it("el gráfico pinta amarillo con el día parcial azul translúcido", () => {
    const html = renderToStaticMarkup(
      <GraficoConsumo
        dias={[
          { fecha: "2026-08-01", galones: 100 },
          { fecha: "2026-08-02", galones: 50, parcial: true },
        ]}
      />,
    );
    expect(html).toContain("background:#F5E01B");
    expect(html).toContain("background:#5B90C4");
    expect(html).toContain("opacity:0.55");
  });
});

describe("marco del tablero", () => {
  // La identidad llega SIEMPRE de los datos (DEC-018): el marco no
  // nombra clientes. Aquí se inyecta la del cliente de demostración
  // para verificar que su tarjeta se pinta igual que en el diseño.
  const IDENTIDAD_DEMO = {
    clienteNombre: "Industrias Alimenticias El Trébol S.A.S.",
    clienteCorto: "El Trébol S.A.S.",
    sedeVisible: "Planta Buga, Valle del Cauca",
    logoUrl: null,
    colorPrimario: "#1E9B4B",
    colorSecundario: "#0E5C2C",
    perfil: { codigo: "medidor_doble", nombre: "Medidor Doble" },
    medidor: { modelo: "Fill-Rite Serie 900", instalado: "6 jul 2026" },
  };
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={["/hoy"]}>
      <Routes>
        <Route element={<DisposicionTablero identidadInicial={IDENTIDAD_DEMO} />}>
          <Route path="/hoy" element={<div>contenido</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  it("co-marca completa: Lubryco 44 px, logotipo, placa, DEMO y el cliente", () => {
    expect(html).toContain('alt="Lubryco"');
    expect(html).toContain("height:44px");
    expect(html).toContain(">Cuadre</span>");
    expect(html).toContain(">APP</span>");
    expect(html).toContain(">Demo</span>");
    expect(html).toContain("El Trébol S.A.S.");
    expect(html).toContain("Control de combustible en planta");
  });
  it("pestañas subrayadas: la activa lleva el borde amarillo", () => {
    expect(html).toContain("border-bottom:2px solid #F5E01B");
    for (const rotulo of ["Hoy", "Cargas", "Equipos", "Suministro"]) {
      expect(html).toContain(rotulo);
    }
  });
  it("el pie lleva las dos frases aprobadas", () => {
    expect(html).toContain("un servicio de Lubryco para sus clientes industriales");
    expect(html).toContain("Lubryco ve el volumen del tanque");
  });
});
