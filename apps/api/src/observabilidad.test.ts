import { describe, expect, it } from "vitest";
import { construirAplicacion } from "./aplicacion.js";
import type { EventoSolicitud } from "./observabilidad.js";
import type { ContextoRegistro, RepositorioCargas } from "./repositorio/tipos.js";

const CONTEXTO: ContextoRegistro = {
  clienteId: "dddd1111-2222-4333-8444-555566667777",
  sedeId: "eeee1111-2222-4333-8444-555566667777",
  validacion: {
    dispensador: { totActualGal: 1847.0, toleranciaTandaGal: 1.0 },
    equipo: {
      tipoMedidor: "horometro",
      ultimaLectura: 1086.5,
      capacidadTanqueGal: 80.0,
      ultimaCargaFinalizadaEn: "2026-07-30T18:00:00-05:00",
    },
    sede: { lat: 3.9, lng: -76.3, radioGeocercaM: 150 },
  },
};

const repositorioMinimo: RepositorioCargas = {
  buscarCargaPorId: async () => null,
  obtenerContextoRegistro: async () => CONTEXTO,
  insertarCarga: async () => undefined,
};

function armar() {
  const eventos: EventoSolicitud[] = [];
  const app = construirAplicacion({
    repositorio: repositorioMinimo,
    emitirEvento: (evento) => eventos.push(evento),
  });
  return { app, eventos };
}

const cuerpoValido = {
  id: "3f8e9a10-1111-4222-8333-444455556666",
  dispensador_id: "aaaa1111-2222-4333-8444-555566667777",
  equipo_id: "bbbb1111-2222-4333-8444-555566667777",
  conductor_id: "cccc1111-2222-4333-8444-555566667777",
  tanda_inicial_gal: 0.0,
  tot_inicial_gal: 1847.0,
  tanda_final_gal: 42.5,
  tot_final_gal: 1889.5,
  lectura_equipo: 1093.0,
  iniciada_en: "2026-07-31T09:00:00-05:00",
  finalizada_en: "2026-07-31T09:05:00-05:00",
  lat: 3.9,
  lng: -76.3,
  origen: "app",
  foto_inicial_path: "fotos/i.webp",
  foto_final_path: "fotos/f.webp",
};

describe("Observabilidad por defecto (DEC-012)", () => {
  it("toda respuesta incluye el request_id en el cuerpo y en el encabezado, y coinciden", async () => {
    const { app } = armar();
    const respuesta = await app.inject({ method: "GET", url: "/salud" });
    const idEncabezado = respuesta.headers["x-request-id"];
    expect(idEncabezado).toMatch(/^[0-9a-f-]{36}$/);
    expect(respuesta.json().request_id).toBe(idEncabezado);
  });

  it("cada petición emite exactamente un evento con la lista cerrada de campos", async () => {
    const { app, eventos } = armar();
    await app.inject({ method: "GET", url: "/salud" });

    expect(eventos).toHaveLength(1);
    const evento = eventos[0]!;
    expect(Object.keys(evento).sort()).toEqual(
      [
        "request_id", "timestamp", "endpoint", "estado_http", "duracion_ms",
        "resultado", "errores", "cliente_id", "sede_id", "usuario_id",
        "banderas", "version_api", "version_dominio",
      ].sort(),
    );
    expect(evento.endpoint).toBe("GET /salud");
    expect(evento.estado_http).toBe(200);
    expect(evento.duracion_ms).toBeGreaterThanOrEqual(0);
    expect(evento.version_api).toMatch(/^\d+\.\d+\.\d+$/);
    expect(evento.version_dominio).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("una carga registrada aporta cliente, sede y banderas al evento", async () => {
    const { app, eventos } = armar();
    await app.inject({ method: "POST", url: "/api/v1/cargas", payload: cuerpoValido });

    const evento = eventos[0]!;
    expect(evento.resultado).toBe("registrada");
    expect(evento.estado_http).toBe(201);
    expect(evento.cliente_id).toBe(CONTEXTO.clienteId);
    expect(evento.sede_id).toBe(CONTEXTO.sedeId);
    expect(evento.banderas).toEqual([]);
  });

  it("una petición estructuralmente inválida queda trazada como 'invalido'", async () => {
    const { app, eventos } = armar();
    await app.inject({ method: "POST", url: "/api/v1/cargas", payload: {} });

    expect(eventos[0]!.resultado).toBe("invalido");
    expect(eventos[0]!.estado_http).toBe(400);
  });

  it("el evento jamás contiene el cuerpo de la petición (ni fotos, ni lecturas)", async () => {
    const { app, eventos } = armar();
    await app.inject({ method: "POST", url: "/api/v1/cargas", payload: cuerpoValido });

    const serializado = JSON.stringify(eventos[0]);
    expect(serializado).not.toContain("foto");
    expect(serializado).not.toContain("42.5");
    expect(serializado).not.toContain(cuerpoValido.conductor_id);
  });

  it("la respuesta del endpoint de cargas también lleva request_id", async () => {
    const { app } = armar();
    const respuesta = await app.inject({ method: "POST", url: "/api/v1/cargas", payload: cuerpoValido });
    expect(respuesta.json().request_id).toBe(respuesta.headers["x-request-id"]);
  });
});
