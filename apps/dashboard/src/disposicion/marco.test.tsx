// El marco es el mismo producto para todos: lo único que cambia es la
// identidad del cliente (DEC-018). Estas pruebas montan el MISMO
// componente con dos empresas distintas y verifican que:
//
//   · el logo, el nombre y los colores cambian solos;
//   · las pestañas salen del perfil, no de una lista fija;
//   · el chrome de CuadreApp (co-marca, subrayado amarillo, pie) NO se
//     tiñe con el color del cliente.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PERFILES } from "@cuadreapp/dominio";
import { ProveedorContextoFijo, type EstadoTablero } from "../datos/contexto";
import type { ContextoTablero } from "../datos/puertos";
import { DisposicionTablero } from "./DisposicionTablero";
import { TEMA } from "../tema";

const EMPRESA_UNA: ContextoTablero = {
  usuario: { nombre: "Supervisora", rol: "supervisor" },
  permisos: ["tablero.leer"],
  cliente: {
    id: "cli-1",
    nombre: "Empresa Uno S.A.S.",
    nombreComercial: "Uno",
    colorPrimario: "#1E9B4B",
    colorSecundario: "#0E5C2C",
    logoUrl: "https://firmada/uno.webp",
  },
  perfil: { ...PERFILES.medidor_doble },
  sedes: [{ id: "s1", nombre: "Planta Norte", ciudad: "Buga" }],
  sedeActual: "s1",
  medidor: { modelo: "Fill-Rite Serie 900", instalado: "2026-07-06" },
};

const EMPRESA_OTRA: ContextoTablero = {
  ...EMPRESA_UNA,
  cliente: {
    id: "cli-2",
    nombre: "Compañía Dos S.A.",
    nombreComercial: null, // sin nombre comercial manda la razón social
    colorPrimario: "#B4322B",
    colorSecundario: "#5C1512",
    logoUrl: null, // sin logo: iniciales, nunca una imagen rota
  },
  perfil: { ...PERFILES.carga_inventario },
  sedes: [{ id: "s9", nombre: "EDS Buga", ciudad: "Buga" }],
  sedeActual: "s9",
  medidor: null,
};

function marco(contexto: ContextoTablero, sobre: Partial<EstadoTablero> = {}): string {
  const estado: EstadoTablero = {
    contexto,
    sedeId: contexto.sedeActual,
    elegirSede: () => {},
    recargar: () => {},
    ...sobre,
  };
  return renderToStaticMarkup(
    <ProveedorContextoFijo valor={estado}>
      <MemoryRouter initialEntries={["/hoy"]}>
        <Routes>
          <Route element={<DisposicionTablero />}>
            <Route path="/hoy" element={<div>contenido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ProveedorContextoFijo>,
  );
}

describe("branding automático por cliente autenticado", () => {
  it("empresa con logo y nombre comercial: los usa tal cual", () => {
    const html = marco(EMPRESA_UNA);
    expect(html).toContain("https://firmada/uno.webp");
    expect(html).toContain("Uno");
    expect(html).toContain("Planta Norte, Buga");
    expect(html).toContain("Empresa Uno S.A.S.");
  });

  it("empresa sin logo ni nombre comercial: iniciales y razón social", () => {
    const html = marco(EMPRESA_OTRA);
    expect(html).toContain("Iniciales de Compañía Dos S.A.");
    expect(html).toContain(">CD</span>");
    expect(html).not.toContain('<img src="https://firmada');
  });

  it("los colores corporativos llegan como variables derivadas, no como CSS libre", () => {
    const uno = marco(EMPRESA_UNA);
    const otra = marco(EMPRESA_OTRA);
    expect(uno).toContain("--cliente-primario:#1E9B4B");
    expect(otra).toContain("--cliente-primario:#B4322B");
    // El Design System deriva el resto: hover, borde, sombra, contraste.
    expect(uno).toContain("--cliente-primario-hover");
    expect(uno).toContain("--cliente-primario-texto");
  });

  it("el chrome de CuadreApp NO se tiñe: la co-marca y el subrayado son del producto", () => {
    for (const html of [marco(EMPRESA_UNA), marco(EMPRESA_OTRA)]) {
      expect(html).toContain('alt="Lubryco"');
      expect(html).toContain(">Cuadre</span>");
      expect(html).toContain(`border-bottom:2px solid ${TEMA.amarillo}`);
      expect(html).toContain("un servicio de Lubryco para sus clientes industriales");
    }
  });
});

describe("las pestañas las declara el Perfil Operativo", () => {
  it("Medidor Doble ofrece las cuatro secciones", () => {
    const html = marco(EMPRESA_UNA);
    for (const rotulo of ["Hoy", "Cargas", "Equipos", "Suministro"]) {
      expect(html).toContain(`>${rotulo}</a>`);
    }
  });

  it("Carga sobre Inventario no ofrece Suministro: ese cliente no tiene tanque", () => {
    const html = marco(EMPRESA_OTRA);
    for (const rotulo of ["Hoy", "Cargas", "Equipos"]) {
      expect(html).toContain(`>${rotulo}</a>`);
    }
    expect(html).not.toContain(">Suministro</a>");
  });

  it("el perfil se nombra en la línea de contexto, junto a la razón social", () => {
    expect(marco(EMPRESA_UNA)).toContain("Empresa Uno S.A.S. · Medidor Doble");
    expect(marco(EMPRESA_OTRA)).toContain("Compañía Dos S.A. · Carga sobre Inventario");
  });

  it("solo los perfiles con medidor muestran la línea del medidor", () => {
    expect(marco(EMPRESA_UNA)).toContain("Medidor Fill-Rite Serie 900");
    expect(marco(EMPRESA_OTRA)).not.toContain("Medidor Fill-Rite");
  });
});

describe("selector de sede según el alcance de la sesión", () => {
  it("una sesión con sede fija no puede cambiarla", () => {
    const html = marco({
      ...EMPRESA_UNA,
      sedeActual: "s1",
      sedes: [
        { id: "s1", nombre: "Planta Norte", ciudad: null },
        { id: "s2", nombre: "Planta Sur", ciudad: null },
      ],
    });
    expect(html).not.toContain("<select");
  });

  it("una sesión sin sede fija y con varias sedes puede filtrar", () => {
    const html = marco(
      {
        ...EMPRESA_UNA,
        sedeActual: null,
        sedes: [
          { id: "s1", nombre: "Planta Norte", ciudad: null },
          { id: "s2", nombre: "Planta Sur", ciudad: null },
        ],
      },
      { sedeId: null },
    );
    expect(html).toContain("<select");
    expect(html).toContain("Todas las sedes");
    expect(html).toContain("Planta Sur");
    // Con varias sedes, la tarjeta resume en lugar de mentir con una.
    expect(html).toContain("2 sedes");
  });

  it("con una sola sede no hay nada que elegir", () => {
    expect(marco({ ...EMPRESA_UNA, sedeActual: null }, { sedeId: null })).not.toContain("<select");
  });
});
