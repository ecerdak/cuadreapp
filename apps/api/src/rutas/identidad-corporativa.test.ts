// Identidad corporativa por cliente y jerarquía multi-sede (DEC-018):
// la base guarda SOLO los dos colores (validados como #RRGGBB), y
// equipos/operadores pueden ser exclusivos de una sede o compartidos
// entre todas (sede_id null). El catálogo del dispositivo entrega la
// identidad completa y filtra por SU sede.

import { beforeEach, describe, expect, it } from "vitest";
import { armarAplicacion, crearToken } from "../pruebas/apoyo.js";
import { ID_ADMIN, RepositorioAdminFalso, sesionAdmin } from "../pruebas/apoyo-admin.js";

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

const crearCliente = (payload: Record<string, unknown>) =>
  contexto.app.inject({
    method: "POST",
    url: "/api/v1/admin/clientes",
    headers: auth(),
    payload,
  });

const crearSede = (clienteId: string, nombre: string) =>
  contexto.app.inject({
    method: "POST",
    url: "/api/v1/admin/sedes",
    headers: auth(),
    payload: { cliente_id: clienteId, nombre },
  });

describe("identidad corporativa del cliente (DEC-018)", () => {
  it("crea un cliente con nombre comercial, razón social, NIT y sus dos colores", async () => {
    const respuesta = await crearCliente({
      nombre: "Constructora Andina S.A.S.",
      nombre_comercial: "Andina",
      color_primario: "#C0392B",
      color_secundario: "#7B241C",
      nit: "900555111-2",
      perfil_codigo: "carga_inventario",
    });
    expect(respuesta.statusCode).toBe(201);
    const cliente = respuesta.json();
    expect(cliente.nombre).toBe("Constructora Andina S.A.S."); // razón social
    expect(cliente.nombreComercial).toBe("Andina");
    expect(cliente.colorPrimario).toBe("#C0392B");
    expect(cliente.colorSecundario).toBe("#7B241C");
    expect(cliente.perfilCodigo).toBe("carga_inventario");
  });

  it("un cliente sin colores queda en null: la UI usa la paleta CuadreApp", async () => {
    const cliente = (await crearCliente({ nombre: "Cliente Sin Marca" })).json();
    expect(cliente.colorPrimario).toBeNull();
    expect(cliente.colorSecundario).toBeNull();
    expect(cliente.nombreComercial).toBeNull();
  });

  it("rechaza colores que no sean #RRGGBB — nunca CSS libre en la base", async () => {
    for (const invalido of ["rojo", "#FFF", "rgb(255,0,0)", "#GGGGGG", "url(x)"]) {
      const respuesta = await crearCliente({
        nombre: `Cliente ${invalido}`,
        color_primario: invalido,
      });
      expect(respuesta.statusCode).toBe(400);
      expect(respuesta.json().error).toBe("ENTRADA_INVALIDA");
    }
  });

  it("PATCH actualiza la identidad y permite borrar un color (null)", async () => {
    const { id } = (await crearCliente({ nombre: "Cliente Rebrand", color_primario: "#1E9B4B" })).json();

    const cambio = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/clientes/${id}`,
      headers: auth(),
      payload: { nombre_comercial: "Nueva Marca", color_primario: "#1B4F9C" },
    });
    expect(cambio.json().nombreComercial).toBe("Nueva Marca");
    expect(cambio.json().colorPrimario).toBe("#1B4F9C");

    const borrado = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/clientes/${id}`,
      headers: auth(),
      payload: { color_primario: null },
    });
    expect(borrado.json().colorPrimario).toBeNull();
  });
});

describe("jerarquía multi-sede: equipos y operadores (DEC-018)", () => {
  it("un equipo puede ser exclusivo de una sede o compartido (sede_id null)", async () => {
    const { id: clienteId } = (await crearCliente({ nombre: "Cliente Multisede" })).json();
    const sede = (await crearSede(clienteId, "Planta Norte")).json();

    const exclusivo = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/equipos",
      headers: auth(),
      payload: { cliente_id: clienteId, sede_id: sede.id, codigo_interno: "T-01" },
    });
    expect(exclusivo.statusCode).toBe(201);
    expect(exclusivo.json().sedeId).toBe(sede.id);
    expect(exclusivo.json().sedeNombre).toBe("Planta Norte");

    const compartido = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/equipos",
      headers: auth(),
      payload: { cliente_id: clienteId, codigo_interno: "T-02" },
    });
    expect(compartido.statusCode).toBe(201);
    expect(compartido.json().sedeId).toBeNull(); // disponible en todas las sedes
  });

  it("un operador puede reasignarse de sede, y volverse compartido con null", async () => {
    const { id: clienteId } = (await crearCliente({ nombre: "Cliente Operadores" })).json();
    const sedeA = (await crearSede(clienteId, "Sede A")).json();
    const sedeB = (await crearSede(clienteId, "Sede B")).json();

    const operador = (
      await contexto.app.inject({
        method: "POST",
        url: "/api/v1/admin/operadores",
        headers: auth(),
        payload: {
          cliente_id: clienteId,
          sede_id: sedeA.id,
          nombre: "Operadora Uno",
          codigo: "11",
          pin: "1234",
        },
      })
    ).json();
    expect(operador.sedeId).toBe(sedeA.id);

    const movido = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/operadores/${operador.id}`,
      headers: auth(),
      payload: { sede_id: sedeB.id },
    });
    expect(movido.json().sedeId).toBe(sedeB.id);
    expect(movido.json().sedeNombre).toBe("Sede B");

    const compartido = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/operadores/${operador.id}`,
      headers: auth(),
      payload: { sede_id: null },
    });
    expect(compartido.json().sedeId).toBeNull();
    expect(compartido.json().sedeNombre).toBeNull();
  });

  it("el PIN sigue sin volver jamás, aunque cambie la sede", async () => {
    const { id: clienteId } = (await crearCliente({ nombre: "Cliente PIN" })).json();
    const operador = (
      await contexto.app.inject({
        method: "POST",
        url: "/api/v1/admin/operadores",
        headers: auth(),
        payload: { cliente_id: clienteId, nombre: "Operador", codigo: "22", pin: "9876" },
      })
    ).json();
    expect(JSON.stringify(operador)).not.toContain("9876");
    expect(operador.pinHash).toBeUndefined();
  });
});
