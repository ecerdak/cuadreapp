import { describe, expect, it } from "vitest";
import type { ContextoInventario, RegistroCargaInventario } from "./tipos";
import {
  calcularInventarioFinal,
  reglaRI1,
  reglaRI2,
  reglaRI3,
  reglaRI4,
  reglaRI5,
  reglaRI6,
  validarCargaInventario,
} from "./inventario";

/* ============================================================
   Caso base: el ejemplo aprobado del piloto Sacyr — el carrotanque
   llegó con 150.0 gal, Lubryco despachó 600.0, sale con 750.0.
   Cada prueba parte de aquí y cambia solo lo que su regla necesita.
   ============================================================ */

function registroBase(cambios: Partial<RegistroCargaInventario> = {}): RegistroCargaInventario {
  return {
    llegadaGal: 150.0,
    despachadosGal: 600.0,
    iniciadaEn: "2026-08-04T09:00:00-05:00",
    finalizadaEn: "2026-08-04T09:05:00-05:00",
    lat: 3.9,
    lng: -76.3,
    origen: "app",
    fotoInicial: true,
    fotoFinal: true,
    ...cambios,
  };
}

function contextoBase(
  cambios: {
    equipo?: Partial<ContextoInventario["equipo"]>;
    sede?: Partial<ContextoInventario["sede"]>;
  } = {},
): ContextoInventario {
  return {
    equipo: {
      capacidadTanqueGal: 1000.0,
      ultimaCargaFinalizadaEn: "2026-08-03T18:00:00-05:00",
      ...cambios.equipo,
    },
    sede: { lat: 3.9, lng: -76.3, radioGeocercaM: 150, ...cambios.sede },
  };
}

/* ============================================================
   Cálculo del perfil: inventario final = llegada + despachados.
   El operador jamás lo escribe.
   ============================================================ */

describe("calcularInventarioFinal — llegada + despachados", () => {
  it("calcula el ejemplo aprobado: 150.0 + 600.0 = 750.0", () => {
    expect(calcularInventarioFinal(150.0, 600.0)).toBe(750.0);
  });

  it("suma en décimas: 0.1 + 0.2 = 0.3 exacto, sin ruido flotante", () => {
    expect(calcularInventarioFinal(0.1, 0.2)).toBe(0.3);
  });

  it("llegada 0.0 es válida (carrotanque vacío): 0.0 + 600.0 = 600.0", () => {
    expect(calcularInventarioFinal(0.0, 600.0)).toBe(600.0);
  });

  it("conserva una decimal: 150.5 + 600.4 = 750.9", () => {
    expect(calcularInventarioFinal(150.5, 600.4)).toBe(750.9);
  });
});

/* ============================================================ RI1 */

describe("RI1 — hubo despacho real (SIN_DESPACHO)", () => {
  it("pasa con despacho positivo", () => {
    expect(reglaRI1(registroBase({ despachadosGal: 600.0 }))).toBeNull();
  });

  it("marca inconsistente con despacho 0.0 exacto (caso límite §13)", () => {
    const marca = reglaRI1(registroBase({ despachadosGal: 0.0 }));
    expect(marca).toEqual({ bandera: "SIN_DESPACHO", clase: "inconsistente" });
  });

  it("pasa con el despacho mínimo registrable (0.1 gal)", () => {
    expect(reglaRI1(registroBase({ despachadosGal: 0.1 }))).toBeNull();
  });
});

/* ============================================================ RI2 */

describe("RI2 — el inventario final no excede la capacidad (+15%) (EXCEDE_CAPACIDAD)", () => {
  it("pasa cuando llegada + despachados cabe en la capacidad", () => {
    expect(reglaRI2(registroBase(), contextoBase())).toBeNull();
  });

  it("pasa exactamente en el límite del 115% (caso límite)", () => {
    // capacidad 1000 → límite 1150.0; 150.0 + 1000.0 = 1150.0
    expect(reglaRI2(registroBase({ despachadosGal: 1000.0 }), contextoBase())).toBeNull();
  });

  it("marca advertencia una décima por encima del límite", () => {
    const marca = reglaRI2(registroBase({ despachadosGal: 1000.1 }), contextoBase());
    expect(marca).toEqual({ bandera: "EXCEDE_CAPACIDAD", clase: "advertencia" });
  });

  it("no se evalúa sin capacidad conocida", () => {
    const contexto = contextoBase({ equipo: { capacidadTanqueGal: null } });
    expect(reglaRI2(registroBase({ despachadosGal: 99999.0 }), contexto)).toBeNull();
  });
});

/* ============================================================ RI3 */

describe("RI3 — las dos fotos de cámara en vivo (FOTO_FALTANTE)", () => {
  it("pasa con ambas fotos", () => {
    expect(reglaRI3(registroBase())).toBeNull();
  });

  it("marca inconsistente y no deja cerrar sin foto inicial", () => {
    const marca = reglaRI3(registroBase({ fotoInicial: false }));
    expect(marca).toEqual({ bandera: "FOTO_FALTANTE", clase: "inconsistente", bloqueaCierre: true });
  });

  it("marca inconsistente sin foto final", () => {
    expect(reglaRI3(registroBase({ fotoFinal: false }))?.bandera).toBe("FOTO_FALTANTE");
  });

  it("papel_retro queda exento (precisión aprobada)", () => {
    expect(
      reglaRI3(registroBase({ origen: "papel_retro", fotoInicial: false, fotoFinal: false })),
    ).toBeNull();
  });

  it("las correcciones SÍ requieren fotos (precisión aprobada)", () => {
    expect(reglaRI3(registroBase({ origen: "correccion", fotoFinal: false }))?.bandera).toBe(
      "FOTO_FALTANTE",
    );
  });
});

/* ============================================================ RI4 */

describe("RI4 — geocerca (FUERA_DE_SEDE / SIN_GPS)", () => {
  it("pasa dentro de la geocerca", () => {
    expect(reglaRI4(registroBase(), contextoBase())).toBeNull();
  });

  it("marca advertencia fuera de la geocerca", () => {
    // ~1.1 km al norte de la sede con radio de 150 m
    const marca = reglaRI4(registroBase({ lat: 3.91, lng: -76.3 }), contextoBase());
    expect(marca).toEqual({ bandera: "FUERA_DE_SEDE", clase: "advertencia" });
  });

  it("emite SIN_GPS informativa sin coordenadas del dispositivo", () => {
    const marca = reglaRI4(registroBase({ lat: null, lng: null }), contextoBase());
    expect(marca).toEqual({ bandera: "SIN_GPS", clase: "info" });
  });

  it("emite SIN_GPS informativa si la sede no tiene geocerca configurada", () => {
    const contexto = contextoBase({ sede: { lat: null, lng: null } });
    expect(reglaRI4(registroBase(), contexto)).toEqual({ bandera: "SIN_GPS", clase: "info" });
  });
});

/* ============================================================ RI5 */

describe("RI5 — sin otra carga del mismo equipo en 3 minutos (POSIBLE_DUPLICADO)", () => {
  it("pasa cuando la última carga fue hace más de 3 minutos", () => {
    expect(reglaRI5(registroBase(), contextoBase())).toBeNull();
  });

  it("pasa exactamente a los 3 minutos (caso límite)", () => {
    const contexto = contextoBase({
      equipo: { ultimaCargaFinalizadaEn: "2026-08-04T08:57:00-05:00" },
    });
    expect(reglaRI5(registroBase(), contexto)).toBeNull();
  });

  it("marca advertencia dentro de la ventana de 3 minutos", () => {
    const contexto = contextoBase({
      equipo: { ultimaCargaFinalizadaEn: "2026-08-04T08:58:30-05:00" },
    });
    const marca = reglaRI5(registroBase(), contexto);
    expect(marca).toEqual({ bandera: "POSIBLE_DUPLICADO", clase: "advertencia" });
  });

  it("no se evalúa sin carga anterior del equipo", () => {
    const contexto = contextoBase({ equipo: { ultimaCargaFinalizadaEn: null } });
    expect(reglaRI5(registroBase(), contexto)).toBeNull();
  });
});

/* ============================================================ RI6 */

describe("RI6 — duración plausible entre 20 s y 60 min (TIEMPO_ATIPICO)", () => {
  it("pasa con una duración normal (5 min)", () => {
    expect(reglaRI6(registroBase())).toBeNull();
  });

  it("pasa exactamente en 20 s (caso límite inferior)", () => {
    expect(reglaRI6(registroBase({ finalizadaEn: "2026-08-04T09:00:20-05:00" }))).toBeNull();
  });

  it("pasa exactamente en 60 min (caso límite superior)", () => {
    expect(reglaRI6(registroBase({ finalizadaEn: "2026-08-04T10:00:00-05:00" }))).toBeNull();
  });

  it("marca advertencia por debajo de 20 s", () => {
    const marca = reglaRI6(registroBase({ finalizadaEn: "2026-08-04T09:00:19-05:00" }));
    expect(marca).toEqual({ bandera: "TIEMPO_ATIPICO", clase: "advertencia" });
  });

  it("marca advertencia por encima de 60 min", () => {
    expect(reglaRI6(registroBase({ finalizadaEn: "2026-08-04T10:00:01-05:00" }))?.bandera).toBe(
      "TIEMPO_ATIPICO",
    );
  });
});

/* ============================================================
   Composición del perfil
   ============================================================ */

describe("validarCargaInventario — composición del veredicto", () => {
  it("el caso base es ok, sin banderas, con inventario final 750.0", () => {
    const resultado = validarCargaInventario(registroBase(), contextoBase());
    expect(resultado.estado).toBe("ok");
    expect(resultado.banderas).toEqual([]);
    expect(resultado.inventarioFinalGal).toBe(750.0);
    expect(resultado.galNoRegistrados).toBeNull();
    expect(resultado.exigeNota).toBe(false);
    expect(resultado.bloqueaAvance).toBe(false);
    expect(resultado.bloqueaCierre).toBe(false);
  });

  it("SIN_GPS (info) no cambia el estado: sigue ok", () => {
    const resultado = validarCargaInventario(registroBase({ lat: null, lng: null }), contextoBase());
    expect(resultado.estado).toBe("ok");
    expect(resultado.banderas).toEqual(["SIN_GPS"]);
  });

  it("una advertencia clasifica como advertencia", () => {
    const resultado = validarCargaInventario(registroBase({ lat: 3.91 }), contextoBase());
    expect(resultado.estado).toBe("advertencia");
    expect(resultado.banderas).toEqual(["FUERA_DE_SEDE"]);
  });

  it("inconsistente gana sobre advertencia", () => {
    const resultado = validarCargaInventario(
      registroBase({ despachadosGal: 0.0, lat: 3.91 }),
      contextoBase(),
    );
    expect(resultado.estado).toBe("inconsistente");
    expect(resultado.banderas).toContain("SIN_DESPACHO");
    expect(resultado.banderas).toContain("FUERA_DE_SEDE");
  });

  it("sin fotos: inconsistente y bloquea el cierre", () => {
    const resultado = validarCargaInventario(registroBase({ fotoFinal: false }), contextoBase());
    expect(resultado.estado).toBe("inconsistente");
    expect(resultado.bloqueaCierre).toBe(true);
  });

  it("el inventario final se calcula aun cuando la carga queda marcada", () => {
    const resultado = validarCargaInventario(
      registroBase({ llegadaGal: 150.0, despachadosGal: 0.0 }),
      contextoBase(),
    );
    expect(resultado.inventarioFinalGal).toBe(150.0);
    expect(resultado.estado).toBe("inconsistente");
  });
});
