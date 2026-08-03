// Pruebas de la consola administrativa: RBAC (solo admin_lubryco),
// CRUD de catálogos, PIN jamás devuelto, enrolamiento sin SQL,
// reenrolar/revocar, resumen y tablero del cliente (Sacyr).

import { beforeEach, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import {
  armarAplicacion,
  crearToken,
  sesionDispositivo,
  ID_DISPOSITIVO_USUARIO,
} from "../pruebas/apoyo.js";
import { ID_ADMIN, RepositorioAdminFalso, sesionAdmin } from "../pruebas/apoyo-admin.js";
import { inicioHoyBogota } from "./admin.js";

function armarAdmin() {
  const repositorioAdmin = new RepositorioAdminFalso();
  const armado = armarAplicacion({ repositorioAdmin, limites: false });
  armado.repositorioSeguridad.sesiones.set(ID_ADMIN, sesionAdmin());
  return { ...armado, repositorioAdmin };
}

let contexto: ReturnType<typeof armarAdmin>;
let token: string;

beforeEach(async () => {
  contexto = armarAdmin();
  token = await crearToken(ID_ADMIN);
});

const auth = () => ({ authorization: `Bearer ${token}` });

async function crearClienteSacyr() {
  const respuesta = await contexto.app.inject({
    method: "POST",
    url: "/api/v1/admin/clientes",
    headers: auth(),
    payload: { nombre: "Sacyr", nit: "900123456-7" },
  });
  return respuesta.json() as { id: string; nombre: string };
}

describe("RBAC de la consola", () => {
  it("sin token: 401; con sesión de dispositivo (sin permiso admin): 403", async () => {
    const sinToken = await contexto.app.inject({ method: "GET", url: "/api/v1/admin/resumen" });
    expect(sinToken.statusCode).toBe(401);

    const tokenDispositivo = await crearToken(ID_DISPOSITIVO_USUARIO);
    contexto.repositorioSeguridad.sesiones.set(ID_DISPOSITIVO_USUARIO, sesionDispositivo());
    const prohibido = await contexto.app.inject({
      method: "GET",
      url: "/api/v1/admin/resumen",
      headers: { authorization: `Bearer ${tokenDispositivo}` },
    });
    expect(prohibido.statusCode).toBe(403);
  });

  it("escritura exige admin.gestionar (admin.leer no basta)", async () => {
    contexto.repositorioSeguridad.sesiones.set(ID_ADMIN, {
      ...sesionAdmin(),
      permisos: ["admin.leer"],
    });
    const respuesta = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/clientes",
      headers: auth(),
      payload: { nombre: "Sacyr" },
    });
    expect(respuesta.statusCode).toBe(403);
  });
});

describe("clientes", () => {
  it("crea el cliente Sacyr y lo lista", async () => {
    const cliente = await crearClienteSacyr();
    expect(cliente.nombre).toBe("Sacyr");

    const lista = await contexto.app.inject({
      method: "GET",
      url: "/api/v1/admin/clientes?buscar=sac",
      headers: auth(),
    });
    expect(lista.json().clientes).toHaveLength(1);
  });

  it("edita y desactiva un cliente; 404 si no existe", async () => {
    const cliente = await crearClienteSacyr();
    const edicion = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/clientes/${cliente.id}`,
      headers: auth(),
      payload: { activo: false, nit: null },
    });
    expect(edicion.statusCode).toBe(200);
    expect(edicion.json()).toMatchObject({ activo: false, nit: null });

    const noExiste = await contexto.app.inject({
      method: "PATCH",
      url: "/api/v1/admin/clientes/99999999-0000-4000-8000-000000000000",
      headers: auth(),
      payload: { activo: true },
    });
    expect(noExiste.statusCode).toBe(404);
  });

  it("nombre duplicado responde 409, no 500", async () => {
    await crearClienteSacyr();
    const duplicado = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/clientes",
      headers: auth(),
      payload: { nombre: "Sacyr" },
    });
    expect(duplicado.statusCode).toBe(409);
  });
});

describe("sedes, equipos y operadores", () => {
  it("crea una sede con su dispensador en una sola operación", async () => {
    const cliente = await crearClienteSacyr();
    const respuesta = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/sedes",
      headers: auth(),
      payload: {
        cliente_id: cliente.id,
        nombre: "EDS Lubryco Buga",
        dispensador: { nombre: "Isla 1 · Fill-Rite 900", tot_instalacion_gal: 0 },
      },
    });
    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json().dispensadores).toHaveLength(1);
  });

  it("crea un carrotanque (placa como código) y lo edita", async () => {
    const cliente = await crearClienteSacyr();
    const creacion = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/equipos",
      headers: auth(),
      payload: {
        cliente_id: cliente.id,
        codigo_interno: "SMW-477",
        categoria: "Carrotanque",
        descripcion: "Carrotanque 1 · capacidad 2.000 gal",
      },
    });
    expect(creacion.statusCode).toBe(201);
    const equipo = creacion.json() as { id: string };

    const edicion = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/equipos/${equipo.id}`,
      headers: auth(),
      payload: { activo: false },
    });
    expect(edicion.json().activo).toBe(false);
  });

  it("crea la operadora con PIN bcrypt y JAMÁS devuelve el PIN ni su hash", async () => {
    const cliente = await crearClienteSacyr();
    const respuesta = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/operadores",
      headers: auth(),
      payload: { cliente_id: cliente.id, nombre: "Operadora EDS", codigo: "01", pin: "4321" },
    });
    expect(respuesta.statusCode).toBe(201);
    const cuerpo = respuesta.body;
    expect(cuerpo).not.toContain("4321");
    expect(cuerpo).not.toContain("pinHash");
    expect(cuerpo).not.toContain("pin_hash");

    // el hash sí quedó guardado y verifica el PIN real
    const guardado = contexto.repositorioAdmin.operadores[0]!;
    expect(bcrypt.compareSync("4321", guardado.pinHash)).toBe(true);
  });

  it("rotar el PIN reemplaza el hash; PIN no numérico se rechaza", async () => {
    const cliente = await crearClienteSacyr();
    await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/operadores",
      headers: auth(),
      payload: { cliente_id: cliente.id, nombre: "Operadora EDS", codigo: "01", pin: "4321" },
    });
    const anterior = contexto.repositorioAdmin.operadores[0]!.pinHash;

    const rotacion = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/operadores/${contexto.repositorioAdmin.operadores[0]!.id}`,
      headers: auth(),
      payload: { pin: "9876" },
    });
    expect(rotacion.statusCode).toBe(200);
    expect(contexto.repositorioAdmin.operadores[0]!.pinHash).not.toBe(anterior);

    const invalido = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/operadores",
      headers: auth(),
      payload: { cliente_id: cliente.id, nombre: "Otra", codigo: "02", pin: "abcd" },
    });
    expect(invalido.statusCode).toBe(400);
  });
});

describe("enrolamiento y dispositivos (adiós SQL manual)", () => {
  async function sedeDePrueba() {
    const cliente = await crearClienteSacyr();
    const sede = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/sedes",
      headers: auth(),
      payload: {
        cliente_id: cliente.id,
        nombre: "EDS Lubryco Buga",
        dispensador: { nombre: "Isla 1", tot_instalacion_gal: 0 },
      },
    });
    return sede.json() as { id: string };
  }

  it("genera un código de enrolamiento con expiración y lo lista como vigente", async () => {
    const sede = await sedeDePrueba();
    const creacion = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/codigos",
      headers: auth(),
      payload: { sede_id: sede.id, expira_dias: 7 },
    });
    expect(creacion.statusCode).toBe(201);
    expect(creacion.json().codigo).toMatch(/^EDS-[0-9A-F]{6}$/);

    const lista = await contexto.app.inject({
      method: "GET",
      url: "/api/v1/admin/codigos",
      headers: auth(),
    });
    expect(lista.json().codigos[0].estado).toBe("vigente");
  });

  it("desactivar un dispositivo revoca TAMBIÉN su usuario técnico", async () => {
    contexto.repositorioAdmin.dispositivos.push({
      id: "d1111111-0000-4000-8000-000000000000",
      usuarioId: "u1111111-0000-4000-8000-000000000000",
      sedeId: "s1",
      sedeNombre: "EDS",
      clienteNombre: "Sacyr",
      nombre: "Tablet isla 1",
      enroladoEn: "2026-08-03T08:00:00Z",
      ultimoVistoEn: null,
      activo: true,
    });
    const respuesta = await contexto.app.inject({
      method: "PATCH",
      url: "/api/v1/admin/dispositivos/d1111111-0000-4000-8000-000000000000",
      headers: auth(),
      payload: { activo: false },
    });
    expect(respuesta.json().activo).toBe(false);
    expect(contexto.repositorioAdmin.usuariosDesactivados).toContain(
      "u1111111-0000-4000-8000-000000000000",
    );
  });

  it("reenrolar revoca el dispositivo y entrega un código nuevo de la MISMA sede", async () => {
    const sede = await sedeDePrueba();
    contexto.repositorioAdmin.dispositivos.push({
      id: "d2222222-0000-4000-8000-000000000000",
      usuarioId: "u2",
      sedeId: sede.id,
      sedeNombre: "EDS Lubryco Buga",
      clienteNombre: "Sacyr",
      nombre: "Tablet isla 1",
      enroladoEn: "2026-08-03T08:00:00Z",
      ultimoVistoEn: null,
      activo: true,
    });
    const respuesta = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/dispositivos/d2222222-0000-4000-8000-000000000000/reenrolar",
      headers: auth(),
    });
    expect(respuesta.statusCode).toBe(201);
    const cuerpo = respuesta.json();
    expect(cuerpo.dispositivo.activo).toBe(false);
    expect(cuerpo.codigo.sedeId).toBe(sede.id);
    expect(cuerpo.codigo.codigo).toMatch(/^EDS-/);
  });
});

describe("resumen y tablero Sacyr", () => {
  const carga = (galones: number, estado = "ok") => ({
    id: `c-${galones}`,
    registradaEn: "2026-08-03T09:30:00Z",
    clienteNombre: "Sacyr",
    sedeNombre: "EDS Lubryco Buga",
    equipoCodigo: "SMW-477",
    operadorNombre: "Operadora EDS",
    galones,
    duracionS: 300,
    estado: estado as "ok" | "inconsistente",
    banderas: [],
    notas: null,
    fotos: [{ momento: "inicial", ruta: "cargas/x/inicial.webp" }],
  });

  it("el resumen trae indicadores y alertas de cargas que no cuadran", async () => {
    await crearClienteSacyr();
    contexto.repositorioAdmin.cargas.push(carga(500), carga(700, "inconsistente"));
    const respuesta = await contexto.app.inject({
      method: "GET",
      url: "/api/v1/admin/resumen",
      headers: auth(),
    });
    const resumen = respuesta.json();
    expect(resumen.clientesActivos).toBe(1);
    expect(resumen.cargasHoy).toBe(2);
    expect(resumen.galonesHoy).toBe(1200);
    expect(resumen.alertas).toHaveLength(1);
    expect(resumen.alertas[0].tipo).toBe("carga_no_cuadra");
  });

  it("el tablero del cliente entrega el día, por-equipo y evidencia con URL firmada", async () => {
    const cliente = await crearClienteSacyr();
    await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/equipos",
      headers: auth(),
      payload: { cliente_id: cliente.id, codigo_interno: "SMW-477", categoria: "Carrotanque" },
    });
    contexto.repositorioAdmin.cargas.push(carga(650));

    const respuesta = await contexto.app.inject({
      method: "GET",
      url: `/api/v1/admin/tablero/${cliente.id}`,
      headers: auth(),
    });
    const tablero = respuesta.json();
    expect(tablero.clienteNombre).toBe("Sacyr");
    expect(tablero.hoy).toMatchObject({ cargas: 1, galones: 650, duracionPromedioS: 300 });
    expect(tablero.hoy.operadores).toContain("Operadora EDS");
    expect(tablero.porEquipo[0]).toMatchObject({ equipoCodigo: "SMW-477", galones: 650 });
    // la evidencia sale con URL firmada temporal, nunca la ruta cruda del bucket
    expect(tablero.historial[0].fotos[0].url).toBe("https://firmada.prueba/cargas/x/inicial.webp");

    const noExiste = await contexto.app.inject({
      method: "GET",
      url: "/api/v1/admin/tablero/99999999-0000-4000-8000-000000000000",
      headers: auth(),
    });
    expect(noExiste.statusCode).toBe(404);
  });
});

describe("frontera de día operativo", () => {
  it("el inicio de HOY se calcula en America/Bogota (UTC-5), no en UTC", () => {
    // 03:00Z del 3-ago = 22:00 del 2-ago en Bogotá → el día operativo sigue siendo el 2.
    expect(inicioHoyBogota(new Date("2026-08-03T03:00:00Z"))).toBe("2026-08-02T00:00:00-05:00");
    expect(inicioHoyBogota(new Date("2026-08-03T12:00:00Z"))).toBe("2026-08-03T00:00:00-05:00");
  });
});
