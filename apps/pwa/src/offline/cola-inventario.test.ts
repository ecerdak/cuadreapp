// La cola offline con el perfil «Carga sobre Inventario» (DEC-016):
// el payload sin dispensador no toca el espejo del totalizador, el
// equipo sí avanza su última carga, y el resumen conserva
// llegada/despachados/total para el recibo offline (150+600=750).

import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { validarCargaInventario } from "@cuadreapp/dominio";
import { crearBd, type PayloadCargaInventario } from "./bd";
import { encolarCarga, obtenerContextoInventario } from "./cola";
import type { EquipoCatalogo, SedeCatalogo } from "../datos/catalogo";

const EQUIPO: EquipoCatalogo = {
  id: "22111111-1111-4111-8111-111111111111",
  codigo: "SMW-477",
  descripcion: "Carrotanque 1",
  tipoMedidor: "ninguno",
  ultimaLecturaConocida: null,
  capacidadTanqueGal: 1000.0,
};
const SEDE: SedeCatalogo = {
  nombre: "Frente de Obra",
  ciudad: null,
  lat: null,
  lng: null,
  radioGeocercaM: 150,
};

function payloadInventario(): PayloadCargaInventario {
  return {
    id: crypto.randomUUID(),
    equipo_id: EQUIPO.id,
    conductor_id: "31111111-1111-4111-8111-111111111111",
    llegada_gal: 150.0,
    despachados_gal: 600.0,
    iniciada_en: "2026-08-04T09:00:00-05:00",
    finalizada_en: "2026-08-04T09:05:00-05:00",
    lat: null,
    lng: null,
    precision_gps_m: null,
    origen: "app",
    foto_inicial_path: "x/inicial.webp",
    foto_final_path: "x/final.webp",
    notas: null,
    device_id: null,
    version_app: null,
  };
}

describe("cola offline — perfil carga_inventario", () => {
  it("encola con resumen 150/600/750 y NO crea espejo de dispensador", async () => {
    const bd = crearBd(`prueba-inv-${crypto.randomUUID()}`);
    const payload = payloadInventario();
    const contexto = await obtenerContextoInventario(bd, EQUIPO, SEDE);
    const veredicto = validarCargaInventario(
      {
        llegadaGal: 150.0,
        despachadosGal: 600.0,
        iniciadaEn: payload.iniciada_en,
        finalizadaEn: payload.finalizada_en,
        lat: null,
        lng: null,
        origen: "app",
        fotoInicial: true,
        fotoFinal: true,
      },
      contexto,
    );

    await encolarCarga(bd, {
      payload,
      veredicto,
      resumen: {
        equipoCodigo: EQUIPO.codigo,
        conductorNombre: "Operadora EDS",
        galones: 600.0,
        llegadaGal: 150.0,
        inventarioFinalGal: veredicto.inventarioFinalGal,
      },
      fotos: { inicial: null, final: null },
    });

    const guardada = (await bd.cargas.get(payload.id))!;
    expect(guardada.resumen.galones).toBe(600.0);
    expect(guardada.resumen.llegadaGal).toBe(150.0);
    expect(guardada.resumen.inventarioFinalGal).toBe(750.0);
    expect(guardada.estadoLocal).toBe("ok");

    // Sin dispensador en el payload: cero espejos de totalizador.
    const espejos = await bd.contexto.toArray();
    expect(espejos.some((e) => e.clave.startsWith("dispensador:"))).toBe(false);
    // El equipo sí registra su última carga (para RI5 offline).
    const equipo = await bd.contexto.get(`equipo:${EQUIPO.id}`);
    expect(equipo?.ultimaCargaFinalizadaEn).toBe(payload.finalizada_en);
    bd.close();
  });

  it("la siguiente carga del mismo equipo ve la anterior (POSIBLE_DUPLICADO offline)", async () => {
    const bd = crearBd(`prueba-inv-${crypto.randomUUID()}`);
    const payload = payloadInventario();
    await encolarCarga(bd, {
      payload,
      veredicto: validarCargaInventario(
        {
          llegadaGal: 150.0,
          despachadosGal: 600.0,
          iniciadaEn: payload.iniciada_en,
          finalizadaEn: payload.finalizada_en,
          lat: null,
          lng: null,
          origen: "app",
          fotoInicial: true,
          fotoFinal: true,
        },
        await obtenerContextoInventario(bd, EQUIPO, SEDE),
      ),
      resumen: { equipoCodigo: EQUIPO.codigo, conductorNombre: "Operadora", galones: 600.0 },
      fotos: { inicial: null, final: null },
    });

    const contexto = await obtenerContextoInventario(bd, EQUIPO, SEDE);
    expect(contexto.equipo.ultimaCargaFinalizadaEn).toBe(payload.finalizada_en);

    const veredicto = validarCargaInventario(
      {
        llegadaGal: 0.0,
        despachadosGal: 100.0,
        // 1 minuto después de la anterior: dentro de la ventana de 3 min
        iniciadaEn: "2026-08-04T09:06:00-05:00",
        finalizadaEn: "2026-08-04T09:10:00-05:00",
        lat: null,
        lng: null,
        origen: "app",
        fotoInicial: true,
        fotoFinal: true,
      },
      contexto,
    );
    expect(veredicto.banderas).toContain("POSIBLE_DUPLICADO");
    bd.close();
  });
});
