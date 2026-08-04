import { describe, expect, it } from "vitest";
import type { ContextoValidacion, RegistroCarga } from "./tipos";
import { esCodigoPerfil, PERFILES, validarSegunPerfil } from "./perfiles";
import { validarCarga } from "./validacion";

/* ============================================================
   El registro de perfiles es el ÚNICO punto de despacho del dominio
   (DEC-016). Estas pruebas fijan dos garantías:

   1. PRUEBA DORADA: despachar medidor_doble por el registro es
      EXACTAMENTE equivalente a llamar validarCarga directo — el
      registro envuelve, jamás modifica, las reglas congeladas.
   2. El despacho de carga_inventario devuelve el resultado del
      perfil con su inventario final calculado.
   ============================================================ */

function registroMedidor(cambios: Partial<RegistroCarga> = {}): RegistroCarga {
  return {
    tandaInicialGal: 0.0,
    totInicialGal: 1847.0,
    tandaFinalGal: 42.5,
    totFinalGal: 1889.5,
    lecturaEquipo: 1093.0,
    iniciadaEn: "2026-07-31T09:00:00-05:00",
    finalizadaEn: "2026-07-31T09:05:00-05:00",
    lat: 3.9,
    lng: -76.3,
    origen: "app",
    fotoInicial: true,
    fotoFinal: true,
    ...cambios,
  };
}

const contextoMedidor: ContextoValidacion = {
  dispensador: { totActualGal: 1847.0, toleranciaTandaGal: 1.0 },
  equipo: {
    tipoMedidor: "horometro",
    ultimaLectura: 1086.5,
    capacidadTanqueGal: 80.0,
    ultimaCargaFinalizadaEn: "2026-07-30T18:00:00-05:00",
  },
  sede: { lat: 3.9, lng: -76.3, radioGeocercaM: 150 },
};

describe("PRUEBA DORADA — el registro no altera las reglas congeladas", () => {
  const casos: Array<[string, RegistroCarga]> = [
    ["carga perfecta", registroMedidor()],
    ["salto de totalizador", registroMedidor({ totInicialGal: 1900.0, totFinalGal: 1942.5 })],
    ["tanda no reseteada + sin fotos", registroMedidor({ tandaInicialGal: 3.2, fotoFinal: false })],
    ["totalizador retrocede", registroMedidor({ totFinalGal: 1500.0 })],
    [
      "vuelta del totalizador en 999999",
      registroMedidor({ totInicialGal: 999980.0, totFinalGal: 22.5 }),
    ],
    ["sin gps y papel_retro", registroMedidor({ lat: null, lng: null, origen: "papel_retro" })],
  ];

  it.each(casos)("equivalencia exacta: %s", (_nombre, registro) => {
    const directo = validarCarga(registro, contextoMedidor);
    const porRegistro = validarSegunPerfil({
      perfil: "medidor_doble",
      registro,
      contexto: contextoMedidor,
    });
    expect(porRegistro).toEqual(directo);
  });
});

describe("despacho del perfil carga_inventario", () => {
  it("devuelve el veredicto del perfil con el inventario final calculado", () => {
    const resultado = validarSegunPerfil({
      perfil: "carga_inventario",
      registro: {
        llegadaGal: 150.0,
        despachadosGal: 600.0,
        iniciadaEn: "2026-08-04T09:00:00-05:00",
        finalizadaEn: "2026-08-04T09:05:00-05:00",
        lat: null,
        lng: null,
        origen: "app",
        fotoInicial: true,
        fotoFinal: true,
      },
      contexto: {
        equipo: { capacidadTanqueGal: null, ultimaCargaFinalizadaEn: null },
        sede: { lat: null, lng: null, radioGeocercaM: 150 },
      },
    });
    expect(resultado.inventarioFinalGal).toBe(750.0);
    expect(resultado.estado).toBe("ok");
    expect(resultado.banderas).toEqual(["SIN_GPS"]);
  });
});

describe("catálogo de perfiles del dominio", () => {
  it("expone exactamente los dos perfiles aprobados con su nombre visible", () => {
    expect(Object.keys(PERFILES).sort()).toEqual(["carga_inventario", "medidor_doble"]);
    expect(PERFILES.medidor_doble.nombre).toBe("Medidor Doble");
    expect(PERFILES.carga_inventario.nombre).toBe("Carga sobre Inventario");
  });

  it("declara qué perfil requiere medidor (dispensador con totalizador)", () => {
    expect(PERFILES.medidor_doble.requiereMedidor).toBe(true);
    expect(PERFILES.carga_inventario.requiereMedidor).toBe(false);
  });

  it("esCodigoPerfil acepta los códigos congelados y rechaza lo demás", () => {
    expect(esCodigoPerfil("medidor_doble")).toBe(true);
    expect(esCodigoPerfil("carga_inventario")).toBe(true);
    expect(esCodigoPerfil("Sacyr")).toBe(false);
    expect(esCodigoPerfil("")).toBe(false);
  });
});
