import { describe, expect, it } from "vitest";
import type { ContextoValidacion, RegistroCarga } from "./tipos";
import {
  deltaTotalizador,
  reglaR1,
  reglaR2,
  reglaR3,
  reglaR4,
  reglaR5,
  reglaR6,
  reglaR7,
  reglaR8,
  reglaR9,
  reglaR10,
  reglaR11,
  reglaR12,
  validarCarga,
} from "./validacion";

/* ============================================================
   Caso base: una carga perfectamente normal, con los números del
   mockup (T-04, 42.5 gal, totalizador en 1847). Cada prueba parte
   de aquí y cambia solo lo que su regla necesita.
   ============================================================ */

function registroBase(cambios: Partial<RegistroCarga> = {}): RegistroCarga {
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

function contextoBase(cambios: {
  dispensador?: Partial<ContextoValidacion["dispensador"]>;
  equipo?: Partial<ContextoValidacion["equipo"]>;
  sede?: Partial<ContextoValidacion["sede"]>;
} = {}): ContextoValidacion {
  return {
    dispensador: { totActualGal: 1847.0, toleranciaTandaGal: 1.0, ...cambios.dispensador },
    equipo: {
      tipoMedidor: "horometro",
      ultimaLectura: 1086.5,
      capacidadTanqueGal: 80.0,
      ultimaCargaFinalizadaEn: "2026-07-31T06:00:00-05:00",
      ...cambios.equipo,
    },
    sede: { lat: 3.9, lng: -76.3, radioGeocercaM: 150, ...cambios.sede },
  };
}

/* ============================================================ R1 */

describe("R1 — tanda inicial en 0.0 (TANDA_NO_RESETEADA)", () => {
  it("pasa con tanda inicial 0.0 exacta (caso límite obligatorio §13)", () => {
    expect(reglaR1(registroBase({ tandaInicialGal: 0.0 }))).toBeNull();
  });

  it("marca advertencia y exige nota con tanda inicial 0.1", () => {
    const marca = reglaR1(registroBase({ tandaInicialGal: 0.1 }));
    expect(marca).toMatchObject({
      bandera: "TANDA_NO_RESETEADA",
      clase: "advertencia",
      exigeNota: true,
    });
  });

  it("marca con tanda inicial claramente sin resetear (3.0)", () => {
    expect(reglaR1(registroBase({ tandaInicialGal: 3.0 }))?.bandera).toBe("TANDA_NO_RESETEADA");
  });
});

/* ============================================================ R2 */

describe("R2 — totalizador inicial vs. último conocido (SALTO_TOTALIZADOR)", () => {
  it("pasa cuando el totalizador inicial coincide con tot_actual", () => {
    expect(reglaR2(registroBase(), contextoBase())).toBeNull();
  });

  it("pasa aunque los valores vengan con representación flotante distinta (1847.0 vs 1847)", () => {
    expect(reglaR2(registroBase({ totInicialGal: 1847 }), contextoBase({ dispensador: { totActualGal: 1847.0 } }))).toBeNull();
  });

  it("marca inconsistente con salto de +18 gal y calcula gal_no_registrados", () => {
    const marca = reglaR2(registroBase({ totInicialGal: 1865.0, totFinalGal: 1907.5 }), contextoBase());
    expect(marca).toMatchObject({
      bandera: "SALTO_TOTALIZADOR",
      clase: "inconsistente",
      galNoRegistrados: 18.0,
    });
  });

  it("marca también cuando el inicial viene por DEBAJO del último conocido (gal_no_registrados negativo)", () => {
    const marca = reglaR2(registroBase({ totInicialGal: 1846.0 }), contextoBase());
    expect(marca).toMatchObject({ bandera: "SALTO_TOTALIZADOR", galNoRegistrados: -1.0 });
  });
});

/* ============================================================ deltaTotalizador (vuelta en 999999) */

describe("deltaTotalizador — la vuelta del totalizador en 999999 (caso límite obligatorio §13)", () => {
  it("delta normal cuando el totalizador avanza", () => {
    expect(deltaTotalizador(1847.0, 1889.5)).toEqual({ delta: 42.5, dioVuelta: false, retrocede: false });
  });

  it("detecta la vuelta: 999980.0 → 22.5 es un avance de 42.5", () => {
    expect(deltaTotalizador(999980.0, 22.5)).toEqual({ delta: 42.5, dioVuelta: true, retrocede: false });
  });

  it("un retroceso grande NO se confunde con una vuelta (1847 → 1800)", () => {
    expect(deltaTotalizador(1847.0, 1800.0).retrocede).toBe(true);
  });

  it("un totalizador que no se movió se trata como retroceso (condición literal tot_final > tot_inicial)", () => {
    expect(deltaTotalizador(1847.0, 1847.0).retrocede).toBe(true);
  });
});

/* ============================================================ R3 */

describe("R3 — la tanda cuadra con el totalizador (TANDA_NO_CUADRA)", () => {
  it("pasa cuando cuadra exacto", () => {
    expect(reglaR3(registroBase(), contextoBase())).toBeNull();
  });

  it("pasa con diferencia exactamente igual a la tolerancia (1.0 gal)", () => {
    // tanda 42.5, totalizador subió 41.5 → diferencia 1.0
    expect(reglaR3(registroBase({ totFinalGal: 1888.5 }), contextoBase())).toBeNull();
  });

  it("marca inconsistente con diferencia 1.1 (apenas fuera de tolerancia)", () => {
    const marca = reglaR3(registroBase({ totFinalGal: 1888.4 }), contextoBase());
    expect(marca).toMatchObject({ bandera: "TANDA_NO_CUADRA", clase: "inconsistente" });
  });

  it("rodillo a mitad de giro: el totalizador lee enteros, media cifra queda dentro de la tolerancia (caso límite obligatorio §13)", () => {
    // tanda 42.5 con décimas; el totalizador de enteros subió 42 → diferencia 0.5
    expect(reglaR3(registroBase({ totInicialGal: 1847, totFinalGal: 1889 }), contextoBase())).toBeNull();
  });

  it("no se deja engañar por la aritmética flotante (0.1 + 0.2)", () => {
    // tanda 0.3, totalizador 1000.2 → 1000.5: delta flotante sería 0.30000000000000027
    expect(
      reglaR3(
        registroBase({ tandaFinalGal: 0.3, totInicialGal: 1000.2, totFinalGal: 1000.5 }),
        contextoBase({ dispensador: { totActualGal: 1000.2 } }),
      ),
    ).toBeNull();
  });

  it("respeta la tolerancia configurada del dispensador (0.5 en vez de 1.0)", () => {
    // tanda 42.5, delta del totalizador 43.1 → diferencia 0.6 > tolerancia 0.5
    const marca = reglaR3(
      registroBase({ totFinalGal: 1890.1 }),
      contextoBase({ dispensador: { toleranciaTandaGal: 0.5 } }),
    );
    expect(marca).toMatchObject({ bandera: "TANDA_NO_CUADRA" });
  });

  it("cuadra a través de la vuelta del totalizador (999980.0 → 22.5, tanda 42.5)", () => {
    expect(
      reglaR3(
        registroBase({ totInicialGal: 999980.0, totFinalGal: 22.5 }),
        contextoBase({ dispensador: { totActualGal: 999980.0 } }),
      ),
    ).toBeNull();
  });

  it("marca el descuadre también a través de la vuelta (delta real 42.5, tanda tipeada 38.0)", () => {
    const marca = reglaR3(
      registroBase({ tandaFinalGal: 38.0, totInicialGal: 999980.0, totFinalGal: 22.5 }),
      contextoBase({ dispensador: { totActualGal: 999980.0 } }),
    );
    expect(marca).toMatchObject({ bandera: "TANDA_NO_CUADRA" });
  });

  it("no evalúa nada si el totalizador retrocede (eso es asunto de R4)", () => {
    expect(reglaR3(registroBase({ totFinalGal: 1800.0 }), contextoBase())).toBeNull();
  });
});

/* ============================================================ R4 */

describe("R4 — el totalizador no retrocede (TOTALIZADOR_RETROCEDE)", () => {
  it("pasa cuando el totalizador avanza", () => {
    expect(reglaR4(registroBase())).toBeNull();
  });

  it("marca inconsistente y bloquea avance cuando retrocede (1847 → 1800)", () => {
    const marca = reglaR4(registroBase({ totFinalGal: 1800.0 }));
    expect(marca).toMatchObject({
      bandera: "TOTALIZADOR_RETROCEDE",
      clase: "inconsistente",
      bloqueaAvance: true,
    });
  });

  it("marca cuando el totalizador no se movió (condición literal tot_final > tot_inicial)", () => {
    expect(reglaR4(registroBase({ totFinalGal: 1847.0 }))?.bandera).toBe("TOTALIZADOR_RETROCEDE");
  });

  it("NO marca en una vuelta plausible del totalizador (999980.0 → 22.5)", () => {
    expect(reglaR4(registroBase({ totInicialGal: 999980.0, totFinalGal: 22.5 }))).toBeNull();
  });
});

/* ============================================================ R5 */

describe("R5 — hubo despacho real (SIN_DESPACHO)", () => {
  it("pasa con tanda final positiva", () => {
    expect(reglaR5(registroBase())).toBeNull();
  });

  it("marca inconsistente con tanda final 0.0", () => {
    const marca = reglaR5(registroBase({ tandaFinalGal: 0.0 }));
    expect(marca).toMatchObject({ bandera: "SIN_DESPACHO", clase: "inconsistente" });
  });
});

/* ============================================================ R6 */

describe("R6 — plausibilidad contra la capacidad del tanque del equipo (EXCEDE_CAPACIDAD)", () => {
  it("pasa con galones muy por debajo de la capacidad", () => {
    expect(reglaR6(registroBase(), contextoBase())).toBeNull();
  });

  it("pasa exactamente en el límite (capacidad 80 × 1.15 = 92.0)", () => {
    expect(reglaR6(registroBase({ tandaFinalGal: 92.0, totFinalGal: 1939.0 }), contextoBase())).toBeNull();
  });

  it("marca advertencia apenas se pasa del límite (92.1)", () => {
    const marca = reglaR6(registroBase({ tandaFinalGal: 92.1, totFinalGal: 1939.1 }), contextoBase());
    expect(marca).toMatchObject({ bandera: "EXCEDE_CAPACIDAD", clase: "advertencia" });
  });

  it("no aplica si el equipo no tiene capacidad conocida", () => {
    expect(
      reglaR6(registroBase({ tandaFinalGal: 500.0 }), contextoBase({ equipo: { capacidadTanqueGal: null } })),
    ).toBeNull();
  });
});

/* ============================================================ R7 */

describe("R7 — el contador del equipo no retrocede (CONTADOR_RETROCEDE)", () => {
  it("pasa cuando el contador avanza", () => {
    expect(reglaR7(registroBase(), contextoBase())).toBeNull();
  });

  it("pasa cuando el contador está exactamente igual (>=)", () => {
    expect(reglaR7(registroBase({ lecturaEquipo: 1086.5 }), contextoBase())).toBeNull();
  });

  it("marca advertencia cuando retrocede", () => {
    const marca = reglaR7(registroBase({ lecturaEquipo: 1080.0 }), contextoBase());
    expect(marca).toMatchObject({ bandera: "CONTADOR_RETROCEDE", clase: "advertencia" });
  });

  it("no aplica sin última lectura conocida (primer registro del equipo)", () => {
    expect(reglaR7(registroBase(), contextoBase({ equipo: { ultimaLectura: null } }))).toBeNull();
  });

  it("no aplica si no se capturó lectura", () => {
    expect(reglaR7(registroBase({ lecturaEquipo: null }), contextoBase())).toBeNull();
  });

  it("no aplica a equipos sin medidor", () => {
    expect(reglaR7(registroBase(), contextoBase({ equipo: { tipoMedidor: "ninguno" } }))).toBeNull();
  });
});

/* ============================================================ R8 */

describe("R8 — salto plausible del contador (SALTO_CONTADOR)", () => {
  it("pasa con un salto normal de horómetro (6.5 h)", () => {
    expect(reglaR8(registroBase(), contextoBase())).toBeNull();
  });

  it("pasa con el salto máximo exacto de horómetro (24.0 h)", () => {
    expect(reglaR8(registroBase({ lecturaEquipo: 1110.5 }), contextoBase())).toBeNull();
  });

  it("marca advertencia apenas se pasa (24.1 h)", () => {
    const marca = reglaR8(registroBase({ lecturaEquipo: 1110.6 }), contextoBase());
    expect(marca).toMatchObject({ bandera: "SALTO_CONTADOR", clase: "advertencia" });
  });

  it("odómetro: pasa con 800.0 km exactos", () => {
    const contexto = contextoBase({ equipo: { tipoMedidor: "odometro", ultimaLectura: 45000.0 } });
    expect(reglaR8(registroBase({ lecturaEquipo: 45800.0 }), contexto)).toBeNull();
  });

  it("odómetro: marca con 800.1 km", () => {
    const contexto = contextoBase({ equipo: { tipoMedidor: "odometro", ultimaLectura: 45000.0 } });
    expect(reglaR8(registroBase({ lecturaEquipo: 45800.1 }), contexto)?.bandera).toBe("SALTO_CONTADOR");
  });

  it("no aplica si el contador retrocedió (eso es asunto de R7)", () => {
    expect(reglaR8(registroBase({ lecturaEquipo: 1080.0 }), contextoBase())).toBeNull();
  });

  it("no aplica a equipos sin medidor", () => {
    expect(reglaR8(registroBase(), contextoBase({ equipo: { tipoMedidor: "ninguno" } }))).toBeNull();
  });
});

/* ============================================================ R9 */

describe("R9 — las dos fotos de cámara en vivo (FOTO_FALTANTE)", () => {
  it("pasa con ambas fotos", () => {
    expect(reglaR9(registroBase())).toBeNull();
  });

  it("marca y bloquea el cierre si falta la foto inicial", () => {
    const marca = reglaR9(registroBase({ fotoInicial: false }));
    expect(marca).toMatchObject({ bandera: "FOTO_FALTANTE", clase: "inconsistente", bloqueaCierre: true });
  });

  it("marca si falta la foto final", () => {
    expect(reglaR9(registroBase({ fotoFinal: false }))?.bandera).toBe("FOTO_FALTANTE");
  });

  it("marca si faltan ambas", () => {
    expect(reglaR9(registroBase({ fotoInicial: false, fotoFinal: false }))?.bandera).toBe("FOTO_FALTANTE");
  });

  it("no aplica a registros retroactivos de papel (origen papel_retro, sin fotos por definición)", () => {
    expect(reglaR9(registroBase({ origen: "papel_retro", fotoInicial: false, fotoFinal: false }))).toBeNull();
  });
});

/* ============================================================ R10 */

describe("R10 — GPS dentro de la geocerca (FUERA_DE_SEDE)", () => {
  it("pasa en el centro exacto de la sede", () => {
    expect(reglaR10(registroBase(), contextoBase())).toBeNull();
  });

  it("marca advertencia a ~1.1 km de la sede", () => {
    const marca = reglaR10(registroBase({ lat: 3.91 }), contextoBase());
    expect(marca).toMatchObject({ bandera: "FUERA_DE_SEDE", clase: "advertencia" });
  });

  it("no aplica sin GPS (puede no haber señal)", () => {
    expect(reglaR10(registroBase({ lat: null, lng: null }), contextoBase())).toBeNull();
  });

  it("no aplica si la sede no tiene coordenadas configuradas", () => {
    expect(reglaR10(registroBase(), contextoBase({ sede: { lat: null, lng: null } }))).toBeNull();
  });
});

/* ============================================================ R11 */

describe("R11 — sin otra carga del mismo equipo en 3 minutos (POSIBLE_DUPLICADO)", () => {
  it("pasa con la última carga horas atrás", () => {
    expect(reglaR11(registroBase(), contextoBase())).toBeNull();
  });

  it("marca advertencia si la última carga terminó hace 2 minutos", () => {
    const contexto = contextoBase({ equipo: { ultimaCargaFinalizadaEn: "2026-07-31T08:58:00-05:00" } });
    const marca = reglaR11(registroBase(), contexto);
    expect(marca).toMatchObject({ bandera: "POSIBLE_DUPLICADO", clase: "advertencia" });
  });

  it("pasa con exactamente 3 minutos de separación", () => {
    const contexto = contextoBase({ equipo: { ultimaCargaFinalizadaEn: "2026-07-31T08:57:00-05:00" } });
    expect(reglaR11(registroBase(), contexto)).toBeNull();
  });

  it("no aplica si el equipo no tiene cargas previas", () => {
    expect(reglaR11(registroBase(), contextoBase({ equipo: { ultimaCargaFinalizadaEn: null } }))).toBeNull();
  });
});

/* ============================================================ R12 */

describe("R12 — duración plausible de la carga (TIEMPO_ATIPICO)", () => {
  it("pasa con una carga de 5 minutos", () => {
    expect(reglaR12(registroBase())).toBeNull();
  });

  it("pasa con exactamente 20 segundos", () => {
    expect(reglaR12(registroBase({ finalizadaEn: "2026-07-31T09:00:20-05:00" }))).toBeNull();
  });

  it("marca advertencia con 19 segundos", () => {
    const marca = reglaR12(registroBase({ finalizadaEn: "2026-07-31T09:00:19-05:00" }));
    expect(marca).toMatchObject({ bandera: "TIEMPO_ATIPICO", clase: "advertencia" });
  });

  it("pasa con exactamente 60 minutos", () => {
    expect(reglaR12(registroBase({ finalizadaEn: "2026-07-31T10:00:00-05:00" }))).toBeNull();
  });

  it("marca con 61 minutos", () => {
    expect(reglaR12(registroBase({ finalizadaEn: "2026-07-31T10:01:00-05:00" }))?.bandera).toBe("TIEMPO_ATIPICO");
  });
});

/* ============================================================ validarCarga */

describe("validarCarga — orquestación y estado resultante (§7)", () => {
  it("una carga limpia queda en 'ok' sin banderas", () => {
    const resultado = validarCarga(registroBase(), contextoBase());
    expect(resultado).toMatchObject({
      estado: "ok",
      banderas: [],
      galNoRegistrados: null,
      exigeNota: false,
      bloqueaAvance: false,
      bloqueaCierre: false,
    });
  });

  it("solo advertencias → estado 'advertencia' (R1 exige nota)", () => {
    // Tanda sin resetear (0.5). La tanda final 42.0 vs delta 42.5 queda
    // dentro de la tolerancia de R3, así que la única bandera es R1.
    const resultado = validarCarga(registroBase({ tandaInicialGal: 0.5, tandaFinalGal: 42.0 }), contextoBase());
    expect(resultado.estado).toBe("advertencia");
    expect(resultado.banderas).toEqual(["TANDA_NO_RESETEADA"]);
    expect(resultado.exigeNota).toBe(true);
  });

  it("cualquier bandera inconsistente → estado 'inconsistente'", () => {
    const resultado = validarCarga(registroBase({ tandaFinalGal: 0.0, totFinalGal: 1847.5 }), contextoBase());
    expect(resultado.estado).toBe("inconsistente");
    expect(resultado.banderas).toContain("SIN_DESPACHO");
  });

  it("escenario del spec §8.4: el medidor arrancó 18 gal más arriba", () => {
    const resultado = validarCarga(
      registroBase({ totInicialGal: 1865.0, totFinalGal: 1907.5 }),
      contextoBase(),
    );
    expect(resultado.estado).toBe("inconsistente");
    expect(resultado.banderas).toEqual(["SALTO_TOTALIZADOR"]); // R3 sí cuadra: el delta es 42.5
    expect(resultado.galNoRegistrados).toBe(18.0);
  });

  it("fotos faltantes bloquean el cierre", () => {
    const resultado = validarCarga(registroBase({ fotoFinal: false }), contextoBase());
    expect(resultado.bloqueaCierre).toBe(true);
    expect(resultado.estado).toBe("inconsistente");
  });

  it("totalizador que retrocede bloquea el avance y no dispara R3 encima", () => {
    const resultado = validarCarga(registroBase({ totFinalGal: 1800.0 }), contextoBase());
    expect(resultado.bloqueaAvance).toBe(true);
    expect(resultado.banderas).toContain("TOTALIZADOR_RETROCEDE");
    expect(resultado.banderas).not.toContain("TANDA_NO_CUADRA");
  });

  it("acumula varias advertencias sin volverse inconsistente", () => {
    const resultado = validarCarga(
      registroBase({
        lecturaEquipo: 1080.0, // R7
        finalizadaEn: "2026-07-31T10:01:00-05:00", // R12
      }),
      contextoBase(),
    );
    expect(resultado.estado).toBe("advertencia");
    expect(resultado.banderas).toEqual(["CONTADOR_RETROCEDE", "TIEMPO_ATIPICO"]);
  });

  it("las banderas salen en el orden de las reglas (R1..R12)", () => {
    const resultado = validarCarga(
      registroBase({
        tandaInicialGal: 0.5, // R1
        totInicialGal: 1865.0, // R2
        totFinalGal: 1907.5,
        lecturaEquipo: 1080.0, // R7
      }),
      contextoBase(),
    );
    expect(resultado.banderas).toEqual(["TANDA_NO_RESETEADA", "SALTO_TOTALIZADOR", "CONTADOR_RETROCEDE"]);
  });

  it("una vuelta completa del totalizador en 999999 pasa limpia de punta a punta (caso límite obligatorio §13)", () => {
    const resultado = validarCarga(
      registroBase({ totInicialGal: 999980.0, totFinalGal: 22.5 }),
      contextoBase({ dispensador: { totActualGal: 999980.0 } }),
    );
    expect(resultado.estado).toBe("ok");
    expect(resultado.banderas).toEqual([]);
  });
});
