// Pruebas de fidelidad de las pantallas del conductor (contrato visual
// §5-§6): textos aprobados, orden del flujo, tamaños esenciales y
// presencia de componentes. Si una falla, se rompió el contrato visual.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ContextoValidacion } from "@cuadreapp/dominio";
import { Splash } from "./Splash";
import { Inicio } from "./Inicio";
import { Equipo } from "./Equipo";
import { Cargando } from "./Cargando";
import { AntesDeCargar } from "./AntesDeCargar";
import { Listo } from "./Listo";
import { CabezaApp } from "../ui/CabezaApp";
import { Aviso, BotonGrande, CampoNum, Confirmacion, Teclado, escribirTecla } from "../ui/basicos";
import { DespuesDeCargar } from "./DespuesDeCargar";
import type { CargaLocal } from "../offline/bd";

const CONTEXTO: ContextoValidacion = {
  dispensador: { totActualGal: 1847, toleranciaTandaGal: 1 },
  equipo: {
    tipoMedidor: "horometro",
    ultimaLectura: 1086.5,
    capacidadTanqueGal: 80,
    ultimaCargaFinalizadaEn: null,
  },
  sede: { lat: null, lng: null, radioGeocercaM: 150 },
};

describe("00 · Bienvenida", () => {
  const html = renderToStaticMarkup(<Splash onSeguir={() => {}} />);
  it("es el azul de la marca a sangre, con el eslogan aprobado", () => {
    expect(html).toContain("background:#4A7CAB");
    expect(html).toContain("CADA GALÓN CUADRA");
    expect(html).toContain("letter-spacing:0.3em");
  });
  it("lleva el endoso BY + logo de Lubryco a 70 px (decisión que manda sobre el PDF)", () => {
    expect(html).toContain(">BY</span>");
    expect(html).toContain("height:70px");
    expect(html).toContain('alt="Lubryco"');
  });
});

describe("Cabecera de la app", () => {
  it("lleva Lubryco a 26 px, logotipo, placa y la barra de 5 segmentos", () => {
    const html = renderToStaticMarkup(<CabezaApp paso="antes" sede="Planta Buga" />);
    expect(html).toContain("height:26px");
    expect(html).toContain(">Cuadre</span>");
    expect(html).toContain(">APP</span>");
    expect(html).toContain("Planta Buga");
    // 5 segmentos de 3 px: en "antes" van 3 en amarillo
    expect(html.match(/height:3px/g)).toHaveLength(5);
    expect(html.match(/background:#F5E01B/g)!.length).toBeGreaterThanOrEqual(3 + 1); // +1 placa
  });
  it("en el inicio no muestra barra de avance", () => {
    const html = renderToStaticMarkup(<CabezaApp paso="inicio" sede="Planta Buga" />);
    expect(html).not.toContain("height:3px");
  });
});

describe("01 · Inicio", () => {
  const html = renderToStaticMarkup(
    <Inicio
      cargasHoy={[]}
      pendientes={0}
      erroresDefinitivos={0}
      nombreConductor="Duván Bonilla"
      onEmpezar={() => {}}
    />,
  );
  it("una sola decisión: el botón amarillo con el subtexto aprobado", () => {
    expect(html).toContain("Cargar combustible");
    expect(html).toContain("Toma unos 40 segundos");
    expect(html).toContain("padding:30px 18px");
    expect(html).toContain("font-size:20px");
  });
  it("saluda por el nombre de pila y lista las cargas de hoy", () => {
    expect(html).toContain("Duván");
    expect(html).toContain("Cargas de hoy");
  });
});

describe("02 · Equipo", () => {
  it("usa el título aprobado", () => {
    const html = renderToStaticMarkup(<Equipo equipos={[]} onSeleccionar={() => {}} />);
    expect(html).toContain("¿Qué equipo vas a cargar?");
  });
});

describe("04 · Antes de cargar", () => {
  const html = renderToStaticMarkup(
    <AntesDeCargar
      contexto={CONTEXTO}
      tandaInicial="0,0"
      totInicial="1847"
      fotoInicial={null}
      onTandaInicial={() => {}}
      onTotInicial={() => {}}
      onFoto={() => {}}
      onEmpezarACargar={() => {}}
    />,
  );
  it("el microcopy y los rótulos de la carátula son los aprobados", () => {
    expect(html).toContain("Antes de cargar");
    expect(html).toContain("Una sola foto muestra los dos números");
    expect(html).toContain("Tanda de arriba");
    expect(html).toContain("Total gallons");
    expect(html).toContain("debe ser 0,0");
    expect(html).toContain("esperado 1.847");
  });
  it("la cámara lleva marco guía, obturador y el pie aprobado", () => {
    expect(html).toContain("Encuadra la carátula completa");
    expect(html).toContain("Solo cámara en vivo · queda con hora y ubicación");
    expect(html).toContain("0 0 0 9999px"); // máscara del marco guía
    expect(html).toContain("fillrite"); // guía de encuadre: asset original
  });
  it("sin foto, el botón queda en gris con el rótulo aprobado (R9)", () => {
    expect(html).toContain("Toma la foto para seguir");
    expect(html).toContain("background:#18242F"); // tono gris, no opacity
  });
});

describe("05 · Cargando", () => {
  const html = renderToStaticMarkup(
    <Cargando
      iniciadaEn={new Date().toISOString()}
      equipoCodigo="T-04"
      equipoDescripcion="Tractor Massey 4292"
      conductorNombre="Duván Bonilla"
      totInicialGal={1847}
      onTermine={() => {}}
    />,
  );
  it("cronómetro 62 px y la tarjeta de contexto completa", () => {
    expect(html).toContain("font-size:62px");
    expect(html).toContain("Tiempo de carga");
    expect(html).toContain("T-04 · Tractor Massey 4292");
    expect(html).toContain("Duván Bonilla");
    expect(html).toContain("Medidor al iniciar");
    expect(html).toContain("Terminé de cargar");
  });
});

describe("07 · Listo", () => {
  const carga = {
    id: "x",
    creadaEn: "2026-08-02T09:52:00-05:00",
    payload: {
      tot_inicial_gal: 1847,
      tot_final_gal: 1890,
      lectura_equipo: 1093,
      finalizada_en: "2026-08-02T09:52:00-05:00",
    },
    resumen: { equipoCodigo: "T-04", conductorNombre: "Duván Bonilla", galones: 42.5 },
    estadoLocal: "ok",
    banderasLocales: [],
    sincronizacion: "pendiente",
    veredictoServidor: null,
  } as unknown as CargaLocal;
  const html = renderToStaticMarkup(
    <Listo carga={carga} equipoDescripcion="Tractor Massey 4292" onOtraCarga={() => {}} />,
  );
  it("círculo de 62, cifra de 52 y la tarjeta de resumen", () => {
    expect(html).toContain("width:62px");
    expect(html).toContain("font-size:52px");
    expect(html).toContain("galones cargados");
    expect(html).toContain("1.847 → 1.890");
    expect(html).toContain("Registrar otra carga");
  });
  it("sin señal muestra el aviso ámbar aprobado", () => {
    expect(html).toContain("Guardado en el celular");
    expect(html).toContain("La carga se sube sola cuando vuelva la red");
  });
});

describe("piezas del contrato", () => {
  it("el teclado propio tiene las 12 teclas y ninguna letra", () => {
    const html = renderToStaticMarkup(<Teclado onTecla={() => {}} />);
    for (const tecla of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ",", "⌫"]) {
      expect(html).toContain(`>${tecla}</button>`);
    }
  });

  it("escribirTecla admite una sola coma y borra con ⌫", () => {
    expect(escribirTecla("42", ",")).toBe("42,");
    expect(escribirTecla("42,", ",")).toBe("42,");
    expect(escribirTecla("42,5", "⌫")).toBe("42,");
  });

  it("CampoNum es la carátula: mono 26 px y borde por estado", () => {
    const html = renderToStaticMarkup(
      <CampoNum rot="Tanda de arriba" valor="42,5" unidad="gal" tono="malo" />,
    );
    expect(html).toContain("font-size:26px");
    expect(html).toContain("#E2594C"); // borde rojo
  });

  it("Aviso usa el patrón col+16/4D con ✓ o !", () => {
    const ok = renderToStaticMarkup(<Aviso tono="ok" titulo="Cuadra" />);
    expect(ok).toContain("#3FAE7E16");
    expect(ok).toContain("#3FAE7E4D");
    expect(ok).toContain(">✓</span>");
    const malo = renderToStaticMarkup(<Aviso tono="malo" titulo="No cuadra" />);
    expect(malo).toContain(">!</span>");
  });

  it("BotonGrande primario es amarillo 18px/16 y el gris no usa opacity", () => {
    const primario = renderToStaticMarkup(<BotonGrande onClick={() => {}}>Sigue</BotonGrande>);
    expect(primario).toContain("background:#F5E01B");
    expect(primario).toContain("padding:18px 16px");
    const gris = renderToStaticMarkup(
      <BotonGrande onClick={() => {}} tono="gris">
        No
      </BotonGrande>,
    );
    expect(gris).toContain("background:#18242F");
    expect(gris).not.toContain("opacity");
  });
});

describe("navegación hacia atrás (contrato + seguridad)", () => {
  it("Antes de cargar muestra ← Atrás discreto antes del título", () => {
    const html = renderToStaticMarkup(
      <AntesDeCargar
        contexto={CONTEXTO}
        tandaInicial="0,0"
        totInicial="1847"
        fotoInicial={null}
        onTandaInicial={() => {}}
        onTotInicial={() => {}}
        onFoto={() => {}}
        onEmpezarACargar={() => {}}
        onAtras={() => {}}
      />,
    );
    expect(html).toContain("← Atrás");
    expect(html.indexOf("← Atrás")).toBeLessThan(html.indexOf("Antes de cargar"));
  });

  it("la lista de equipos muestra ← Atrás solo si se le entrega onAtras", () => {
    const con = renderToStaticMarkup(
      <Equipo equipos={[]} onSeleccionar={() => {}} onAtras={() => {}} />,
    );
    expect(con).toContain("← Atrás");
    const sin = renderToStaticMarkup(<Equipo equipos={[]} onSeleccionar={() => {}} />);
    expect(sin).not.toContain("← Atrás");
  });

  it("guardando: sin Atrás, botón gris con 'Guardando…' (bloqueo de retroceso y de doble toque)", () => {
    const html = renderToStaticMarkup(
      <DespuesDeCargar
        contexto={CONTEXTO}
        equipo={{
          id: "e1",
          codigo: "T-04",
          descripcion: "Tractor Massey 4292",
          tipoMedidor: "horometro",
          ultimaLecturaConocida: 1086.5,
          capacidadTanqueGal: 80,
        }}
        tandaInicial="0,0"
        totInicial="1847"
        iniciadaEn={new Date().toISOString()}
        tandaFinal="42,5"
        totFinal="1889,5"
        lecturaEquipo="1093,0"
        nota=""
        exigeNota={false}
        fotoFinal={{ bytes: new Uint8Array([1]).buffer, tipo: "image/webp" }}
        onTandaFinal={() => {}}
        onTotFinal={() => {}}
        onLecturaEquipo={() => {}}
        onNota={() => {}}
        onFoto={() => {}}
        onGuardar={() => {}}
        onAtras={() => {}}
        guardando
      />,
    );
    expect(html).not.toContain("← Atrás");
    expect(html).toContain("Guardando…");
    expect(html).toContain("background:#18242F"); // botón en gris, no opacity
  });

  it("Confirmacion: título, cuerpo en lenguaje llano y botones Cancelar/acción", () => {
    const html = renderToStaticMarkup(
      <Confirmacion
        titulo="¿Volver a la pantalla anterior?"
        cuerpo="Si vuelves, tendrás que tomar nuevamente la foto inicial."
        accion="Volver"
        onCancelar={() => {}}
        onConfirmar={() => {}}
      />,
    );
    expect(html).toContain("¿Volver a la pantalla anterior?");
    expect(html).toContain("tomar nuevamente la foto inicial");
    expect(html).toContain(">Volver</button>");
    expect(html).toContain(">Cancelar</button>");
    expect(html).toContain('role="alertdialog"');
  });

  it("Listo NO ofrece Atrás: solo 'Registrar otra carga' (test 16)", () => {
    const carga = {
      id: "x",
      creadaEn: "2026-08-02T09:52:00-05:00",
      payload: {
        tot_inicial_gal: 1847,
        tot_final_gal: 1890,
        lectura_equipo: null,
        finalizada_en: "2026-08-02T09:52:00-05:00",
      },
      resumen: { equipoCodigo: "T-04", conductorNombre: "Duván", galones: 42.5 },
      estadoLocal: "ok",
      banderasLocales: [],
      sincronizacion: "pendiente",
      veredictoServidor: null,
    } as unknown as CargaLocal;
    const html = renderToStaticMarkup(<Listo carga={carga} onOtraCarga={() => {}} />);
    expect(html).not.toContain("← Atrás");
    expect(html).toContain("Registrar otra carga");
  });
});
