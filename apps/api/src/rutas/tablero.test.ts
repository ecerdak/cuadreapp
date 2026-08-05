// Pruebas del Dashboard de Cliente en la API (Etapa P.2).
//
// El eje de estas pruebas no es «responde 200»: es que la empresa la
// decide SIEMPRE la sesión. Por eso el fake tiene dos clientes con
// datos propios y varias pruebas verifican que la información del
// segundo no aparece jamás, por ninguna vía — ni por parámetro, ni
// por sede, ni por id de carga.

import { describe, expect, it } from "vitest";
import { armarAplicacion, crearToken, ID_CLIENTE, SECRETO_PRUEBA } from "../pruebas/apoyo.js";
import { sesionAdmin, ID_ADMIN } from "../pruebas/apoyo-admin.js";
import {
  cargaFalsa,
  ID_CARGA_A,
  ID_CARGA_B,
  ID_CLIENTE_A,
  ID_CLIENTE_B,
  ID_SEDE_A1,
  ID_SEDE_A2,
  ID_SEDE_B1,
  ID_SUPERVISOR,
  RepositorioTableroFalso,
  sesionSupervisor,
} from "../pruebas/apoyo-tablero.js";
import { ventanaTablero } from "./tablero.js";

const ID_SUPERVISOR_B = "50b11111-2222-4333-8444-555566667777";
const ID_OTRO_USUARIO = "50c11111-2222-4333-8444-555566667777";

function armar(sobreSesion: Parameters<typeof sesionSupervisor>[0] = {}) {
  const repositorioTablero = new RepositorioTableroFalso();
  const contexto = armarAplicacion({ repositorioTablero });
  contexto.repositorioSeguridad.sesiones.set(ID_SUPERVISOR, sesionSupervisor(sobreSesion));
  // Un supervisor del OTRO cliente, para las pruebas de aislamiento.
  contexto.repositorioSeguridad.sesiones.set(
    ID_SUPERVISOR_B,
    sesionSupervisor({
      usuarioId: ID_SUPERVISOR_B,
      clienteId: ID_CLIENTE_B,
      perfil: "carga_inventario",
    }),
  );
  contexto.repositorioSeguridad.sesiones.set(ID_ADMIN, sesionAdmin());
  return { ...contexto, repositorioTablero };
}

const auth = async (usuarioId = ID_SUPERVISOR) => ({
  authorization: `Bearer ${await crearToken(usuarioId)}`,
});

describe("GET /api/v1/tablero/contexto — el login resuelve la empresa", () => {
  it("responde identidad, perfil con su composición, sedes y permisos", async () => {
    const { app, repositorioTablero } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/contexto",
      headers: await auth(),
    });

    expect(respuesta.statusCode).toBe(200);
    const cuerpo = respuesta.json();
    expect(cuerpo.cliente.id).toBe(ID_CLIENTE_A);
    expect(cuerpo.cliente.nombre).toBe("Cliente A");
    expect(cuerpo.cliente.colorPrimario).toBe("#1E9B4B");
    // La clave del objeto jamás sale: viaja como URL firmada (DEC-017).
    expect(cuerpo.cliente.logoClave).toBeUndefined();
    expect(cuerpo.cliente.logoUrl).toContain("firmada.prueba");
    // La composición la declara el perfil en el dominio (DEC-016).
    expect(cuerpo.perfil.codigo).toBe("medidor_doble");
    expect(cuerpo.perfil.modulos).toEqual(["hoy", "cargas", "equipos", "suministro"]);
    expect(cuerpo.perfil.panelesHoy).toContain("totalizador");
    expect(cuerpo.perfil.vistaEvidencia).toBe("medidor");
    expect(cuerpo.sedes.map((s: { id: string }) => s.id)).toEqual([ID_SEDE_A1, ID_SEDE_A2]);
    expect(cuerpo.sedeActual).toBeNull();
    expect(cuerpo.permisos).toContain("tablero.leer");
    expect(cuerpo.usuario.rol).toBe("supervisor");
    expect(repositorioTablero.alcancesRecibidos[0]).toEqual({
      clienteId: ID_CLIENTE_A,
      sedeId: null,
    });
  });

  it("otro cliente recibe SU identidad y SU composición — mismo endpoint, cero código por cliente", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/contexto",
      headers: await auth(ID_SUPERVISOR_B),
    });

    const cuerpo = respuesta.json();
    expect(cuerpo.cliente.id).toBe(ID_CLIENTE_B);
    expect(cuerpo.perfil.codigo).toBe("carga_inventario");
    // Sin tanque del cliente no hay Suministro ni totalizador.
    expect(cuerpo.perfil.modulos).toEqual(["hoy", "cargas", "equipos"]);
    expect(cuerpo.perfil.panelesHoy).toContain("inventario");
    expect(cuerpo.perfil.vistaEvidencia).toBe("inventario");
    expect(cuerpo.medidor).toBeNull();
  });

  it("una sesión con sede fija solo ve su sede", async () => {
    const { app } = armar({ sedeId: ID_SEDE_A2 });
    const cuerpo = (
      await app.inject({
        method: "GET",
        url: "/api/v1/tablero/contexto",
        headers: await auth(),
      })
    ).json();
    expect(cuerpo.sedes.map((s: { id: string }) => s.id)).toEqual([ID_SEDE_A2]);
    expect(cuerpo.sedeActual).toBe(ID_SEDE_A2);
  });

  it("un cliente desactivado deja de tener tablero", async () => {
    const { app, repositorioTablero } = armar();
    repositorioTablero.inactivos.add(ID_CLIENTE_A);
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/contexto",
      headers: await auth(),
    });
    expect(respuesta.statusCode).toBe(404);
    expect(respuesta.json().error).toBe("CLIENTE_NO_DISPONIBLE");
  });
});

describe("seguridad del tablero — tokens, permisos y alcance", () => {
  it("sin token: 401", async () => {
    const { app } = armar();
    const respuesta = await app.inject({ method: "GET", url: "/api/v1/tablero/hoy" });
    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.json().error).toBe("NO_AUTENTICADO");
  });

  it("token firmado con otro secreto: 401 TOKEN_INVALIDO", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/hoy",
      headers: { authorization: `Bearer ${await crearToken(ID_SUPERVISOR, `${SECRETO_PRUEBA}-otro`)}` },
    });
    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.json().error).toBe("TOKEN_INVALIDO");
  });

  it("token válido de un usuario que ya no existe: 401 SESION_INACTIVA", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/hoy",
      headers: await auth(ID_OTRO_USUARIO),
    });
    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.json().error).toBe("SESION_INACTIVA");
  });

  it("un dispositivo enrolado no entra al tablero: 403 SIN_PERMISO", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/hoy",
      // El usuario dispositivo del apoyo base no tiene tablero.leer.
      headers: { authorization: `Bearer ${await crearToken("99991111-2222-4333-8444-555566667777")}` },
    });
    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json()).toMatchObject({ error: "SIN_PERMISO", permiso: "tablero.leer" });
  });

  it("un admin_lubryco no tiene tablero: su vista del cliente es la consola", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/hoy",
      headers: await auth(ID_ADMIN),
    });
    // Sin tablero.leer el RBAC corta antes de mirar el cliente.
    expect(respuesta.statusCode).toBe(403);
  });

  it("una sesión con permiso pero sin cliente: 403 SIN_CLIENTE_EN_SESION", async () => {
    const { app } = armar({ clienteId: null, perfil: null });
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/hoy",
      headers: await auth(),
    });
    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json().error).toBe("SIN_CLIENTE_EN_SESION");
  });

  it("toda respuesta lleva request_id (DEC-012)", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/contexto",
      headers: await auth(),
    });
    expect(respuesta.headers["x-request-id"]).toBeTruthy();
    expect(respuesta.json().request_id).toBe(respuesta.headers["x-request-id"]);
  });
});

describe("aislamiento multiempresa — la empresa la decide la sesión", () => {
  it("pedir una sede de OTRO cliente: 403, y el repositorio nunca se consulta con ella", async () => {
    const { app, repositorioTablero } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: `/api/v1/tablero/hoy?sede_id=${ID_SEDE_B1}`,
      headers: await auth(),
    });
    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json().error).toBe("SEDE_FUERA_DE_ALCANCE");
    expect(repositorioTablero.alcancesRecibidos.some((alcance) => alcance.sedeId === ID_SEDE_B1)).toBe(
      false,
    );
  });

  it("una sesión con sede fija no puede pedir otra sede de su propio cliente", async () => {
    const { app } = armar({ sedeId: ID_SEDE_A1 });
    const respuesta = await app.inject({
      method: "GET",
      url: `/api/v1/tablero/hoy?sede_id=${ID_SEDE_A2}`,
      headers: await auth(),
    });
    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.json().error).toBe("SEDE_FUERA_DE_ALCANCE");
  });

  it("una sede propia sí filtra la consulta", async () => {
    const { app, repositorioTablero } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: `/api/v1/tablero/hoy?sede_id=${ID_SEDE_A2}`,
      headers: await auth(),
    });
    expect(respuesta.statusCode).toBe(200);
    expect(repositorioTablero.alcancesRecibidos).toContainEqual({
      clienteId: ID_CLIENTE_A,
      sedeId: ID_SEDE_A2,
    });
  });

  it("la carga de otro cliente responde 404, igual que una inexistente", async () => {
    const { app, repositorioTablero } = armar();
    repositorioTablero.sembrarCarga(ID_CLIENTE_B, cargaFalsa({ id: ID_CARGA_B }));

    const ajena = await app.inject({
      method: "GET",
      url: `/api/v1/tablero/cargas/${ID_CARGA_B}`,
      headers: await auth(),
    });
    const inexistente = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/cargas/99999999-2222-4333-8444-555566667777",
      headers: await auth(),
    });

    expect(ajena.statusCode).toBe(404);
    expect(inexistente.statusCode).toBe(404);
    expect(ajena.json().error).toBe(inexistente.json().error);
  });

  it("las cargas listadas son solo las del cliente de la sesión", async () => {
    const { app, repositorioTablero } = armar();
    repositorioTablero.sembrarCarga(ID_CLIENTE_A, cargaFalsa({ id: ID_CARGA_A }));
    repositorioTablero.sembrarCarga(
      ID_CLIENTE_B,
      cargaFalsa({ id: ID_CARGA_B, equipoCodigo: "SMW-477" }),
    );

    const cuerpo = (
      await app.inject({
        method: "GET",
        url: "/api/v1/tablero/cargas",
        headers: await auth(),
      })
    ).json();

    expect(cuerpo.cargas).toHaveLength(1);
    expect(cuerpo.cargas[0].id).toBe(ID_CARGA_A);
    expect(JSON.stringify(cuerpo)).not.toContain("SMW-477");
  });

  it("un identificador de cliente en la petición no cambia nada", async () => {
    const { app, repositorioTablero } = armar();
    await app.inject({
      method: "GET",
      url: `/api/v1/tablero/hoy?cliente_id=${ID_CLIENTE_B}`,
      headers: await auth(),
    });
    expect(repositorioTablero.alcancesRecibidos.every((a) => a.clienteId === ID_CLIENTE_A)).toBe(true);
  });
});

describe("lecturas del tablero", () => {
  it("hoy entrega cargas del día, consumo, totalizador y balance", async () => {
    const { app, repositorioTablero } = armar();
    repositorioTablero.sembrarCarga(ID_CLIENTE_A, cargaFalsa());
    const cuerpo = (
      await app.inject({ method: "GET", url: "/api/v1/tablero/hoy", headers: await auth() })
    ).json();

    expect(cuerpo.cargasDeHoy).toHaveLength(1);
    expect(cuerpo.totalizadorGal).toBe(1889.5);
    expect(cuerpo.galSinRegistrarGal).toBe(18);
    // Sin entregas registradas la existencia se declara desconocida.
    expect(cuerpo.balance.existenciaEstimadaGal).toBeNull();
    expect(cuerpo.balance.autonomiaDias).toBeNull();
  });

  it("cargas filtra por estado y conserva los totales de la ventana", async () => {
    const { app, repositorioTablero } = armar();
    repositorioTablero.sembrarCarga(ID_CLIENTE_A, cargaFalsa({ id: ID_CARGA_A }));
    repositorioTablero.sembrarCarga(
      ID_CLIENTE_A,
      cargaFalsa({
        id: "ca022222-2222-4333-8444-555566667777",
        estado: "inconsistente",
        banderas: ["SALTO_TOTALIZADOR"],
      }),
    );

    const cuerpo = (
      await app.inject({
        method: "GET",
        url: "/api/v1/tablero/cargas?estado=inconsistente",
        headers: await auth(),
      })
    ).json();

    expect(cuerpo.cargas).toHaveLength(1);
    expect(cuerpo.cargas[0].estado).toBe("inconsistente");
    expect(cuerpo.total).toBe(2);
    expect(cuerpo.cuadran).toBe(1);
  });

  it("un estado inventado se rechaza en la validación estructural", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/cargas?estado=inventado",
      headers: await auth(),
    });
    expect(respuesta.statusCode).toBe(400);
  });

  it("el detalle entrega las fotos como URL firmada, nunca la ruta del bucket", async () => {
    const { app, repositorioTablero } = armar();
    repositorioTablero.sembrarCarga(ID_CLIENTE_A, cargaFalsa({ id: ID_CARGA_A }));
    const cuerpo = (
      await app.inject({
        method: "GET",
        url: `/api/v1/tablero/cargas/${ID_CARGA_A}`,
        headers: await auth(),
      })
    ).json();

    expect(cuerpo.carga.id).toBe(ID_CARGA_A);
    expect(cuerpo.lecturas.totFinal).toBe(1889.5);
    expect(cuerpo.fotos[0].url).toContain("firmada.prueba");
    expect(JSON.stringify(cuerpo.fotos)).not.toContain("ruta");
  });

  it("un id de carga que no es un uuid se rechaza sin tocar el repositorio", async () => {
    const { app } = armar();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/cargas/no-es-uuid",
      headers: await auth(),
    });
    expect(respuesta.statusCode).toBe(400);
  });

  it("equipos y suministro responden con la forma del contrato", async () => {
    const { app } = armar();
    const equipos = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/equipos",
      headers: await auth(),
    });
    const suministro = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/suministro",
      headers: await auth(),
    });

    expect(equipos.statusCode).toBe(200);
    expect(equipos.json().equipos).toEqual([]);
    expect(suministro.statusCode).toBe(200);
    // Sin escritor de entregas todavía (Etapa 3): lista vacía honesta.
    expect(suministro.json().entregas).toEqual([]);
    expect(suministro.json().balance.existenciaEstimadaGal).toBeNull();
  });

  it("el evento de observabilidad lleva cliente, perfil y resultado (DEC-012)", async () => {
    const { app, eventos } = armar();
    await app.inject({ method: "GET", url: "/api/v1/tablero/contexto", headers: await auth() });
    const evento = eventos.at(-1)!;
    expect(evento.cliente_id).toBe(ID_CLIENTE_A);
    expect(evento.perfil).toBe("medidor_doble");
    expect(evento.resultado).toBe("contexto");
  });
});

describe("ventana de tiempo del tablero", () => {
  it("abre en medianoche de Bogotá: hoy, 14 días y 7 días", () => {
    // 03:00 UTC del 6-ago sigue siendo 5-ago en Bogotá (UTC-5).
    const ventana = ventanaTablero(new Date("2026-08-06T03:00:00Z"));
    expect(ventana.inicioHoy).toBe("2026-08-05T00:00:00-05:00");
    expect(ventana.desde14d).toBe("2026-07-23T00:00:00-05:00");
    expect(ventana.desde7d).toBe("2026-07-30T00:00:00-05:00");
  });
});

describe("sin repositorio de tablero, las rutas no existen", () => {
  it("responde 404 de Fastify (la API sigue sirviendo lo demás)", async () => {
    const { app } = armarAplicacion();
    const respuesta = await app.inject({
      method: "GET",
      url: "/api/v1/tablero/contexto",
      headers: { authorization: `Bearer ${await crearToken(ID_CLIENTE)}` },
    });
    expect(respuesta.statusCode).toBe(404);
  });
});
