// El catálogo decide el flujo (DEC-016) y trae la identidad del
// cliente (DEC-017). Estas pruebas fijan la conversión remoto→local:
// perfil, compatibilidad con cachés viejos y el dispensador que solo
// exigen los perfiles con medidor.

import { describe, expect, it } from "vitest";
import type { CatalogoRemoto } from "./contratos";
import { catalogoLocalDesdeRemoto } from "./catalogo";

function remotoBase(cambios: Partial<CatalogoRemoto> = {}): CatalogoRemoto {
  return {
    cliente: {
      id: "cl1",
      nombre: "Sacyr S.A.",
      nombre_comercial: "Sacyr",
      color_primario: "#1B4F9C",
      color_secundario: "#0C2A55",
      logo_url: "https://firmada/logo.png",
    },
    perfil: { codigo: "carga_inventario", nombre: "Carga sobre Inventario" },
    sede: {
      id: "s1",
      nombre: "Frente de Obra",
      ciudad: "Cali, Valle del Cauca",
      lat: null,
      lng: null,
      radio_geocerca_m: 150,
    },
    dispensadores: [],
    equipos: [],
    conductores: [],
    ...cambios,
  };
}

describe("catalogoLocalDesdeRemoto — perfil e identidad", () => {
  it("un cliente carga_inventario opera SIN dispensador (la sede Sacyr no tiene)", () => {
    const local = catalogoLocalDesdeRemoto(remotoBase());
    expect(local).not.toBeNull();
    expect(local!.perfil).toBe("carga_inventario");
    expect(local!.dispensador).toBeNull();
    expect(local!.cliente).toEqual({
      nombre: "Sacyr",
      logoUrl: "https://firmada/logo.png",
      colorPrimario: "#1B4F9C",
    });
    expect(local!.sede.ciudad).toBe("Cali, Valle del Cauca");
  });

  it("un catálogo cacheado ANTES de la Etapa P (sin perfil ni cliente) sigue siendo medidor_doble", () => {
    const viejo = remotoBase({
      cliente: undefined,
      perfil: undefined,
      sede: { id: "s1", nombre: "Planta Buga", lat: null, lng: null, radio_geocerca_m: 150 },
      dispensadores: [{ id: "d1", nombre: "Isla 1", tot_actual_gal: 1847.0, tolerancia_tanda_gal: 1.0 }],
    });
    const local = catalogoLocalDesdeRemoto(viejo);
    expect(local).not.toBeNull();
    expect(local!.perfil).toBe("medidor_doble");
    expect(local!.cliente).toBeNull();
    expect(local!.dispensador?.id).toBe("d1");
    expect(local!.sede.ciudad).toBeNull();
  });

  it("un perfil CON medidor sin dispensador sigue sin poder operar (regla previa intacta)", () => {
    const sinDispensador = remotoBase({
      perfil: { codigo: "medidor_doble", nombre: "Medidor Doble" },
      dispensadores: [],
    });
    expect(catalogoLocalDesdeRemoto(sinDispensador)).toBeNull();
  });

  it("un código de perfil desconocido cae al flujo original (red de seguridad)", () => {
    const raro = remotoBase({
      perfil: { codigo: "perfil_futuro", nombre: "X" },
      dispensadores: [{ id: "d1", nombre: "Isla 1", tot_actual_gal: 100.0, tolerancia_tanda_gal: 1.0 }],
    });
    expect(catalogoLocalDesdeRemoto(raro)!.perfil).toBe("medidor_doble");
  });
});

describe("identidad corporativa en la PWA (DEC-018)", () => {
  it("prefiere el nombre comercial sobre la razón social", () => {
    const local = catalogoLocalDesdeRemoto(remotoBase());
    expect(local!.cliente?.nombre).toBe("Sacyr"); // comercial, no "Sacyr S.A."
  });

  it("sin nombre comercial usa la razón social", () => {
    const local = catalogoLocalDesdeRemoto(
      remotoBase({
        cliente: { id: "cl1", nombre: "Constructora Andina S.A.S.", logo_url: null },
      }),
    );
    expect(local!.cliente?.nombre).toBe("Constructora Andina S.A.S.");
    expect(local!.cliente?.colorPrimario).toBeNull(); // acento CuadreApp
  });
});
