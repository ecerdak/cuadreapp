// Pruebas de identidad del cliente en la consola (DEC-016/DEC-017):
// catálogo de perfiles, perfil por cliente, logo (subir/reemplazar/
// eliminar/validar) y sedes completas — incluida la sede sin
// dispensador para perfiles sin medidor.

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

// PNG real mínimo (números mágicos válidos).
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(64, 1),
]);
const WEBP = Buffer.concat([
  Buffer.from("RIFF"),
  Buffer.from([64, 0, 0, 0]),
  Buffer.from("WEBP"),
  Buffer.alloc(64, 1),
]);

async function crearCliente(payload: Record<string, unknown>) {
  const respuesta = await contexto.app.inject({
    method: "POST",
    url: "/api/v1/admin/clientes",
    headers: auth(),
    payload,
  });
  return respuesta;
}

describe("perfiles operativos en la consola", () => {
  it("GET /admin/perfiles entrega el catálogo para el selector", async () => {
    const respuesta = await contexto.app.inject({
      method: "GET",
      url: "/api/v1/admin/perfiles",
      headers: auth(),
    });
    expect(respuesta.statusCode).toBe(200);
    const codigos = respuesta.json().perfiles.map((p: { codigo: string }) => p.codigo);
    expect(codigos).toContain("medidor_doble");
    expect(codigos).toContain("carga_inventario");
  });

  it("crea un cliente con perfil explícito y lo expone en la lista", async () => {
    const creado = await crearCliente({
      nombre: "Constructora Piloto",
      perfil_codigo: "carga_inventario",
    });
    expect(creado.statusCode).toBe(201);
    expect(creado.json().perfilCodigo).toBe("carga_inventario");
    expect(creado.json().logoUrl).toBeNull();

    const lista = await contexto.app.inject({
      method: "GET",
      url: "/api/v1/admin/clientes",
      headers: auth(),
    });
    expect(lista.json().clientes[0].perfilCodigo).toBe("carga_inventario");
  });

  it("sin perfil explícito, el cliente nace medidor_doble (compatibilidad)", async () => {
    const creado = await crearCliente({ nombre: "Cliente Clásico" });
    expect(creado.json().perfilCodigo).toBe("medidor_doble");
  });

  it("un código de perfil desconocido es 400 estructural", async () => {
    const creado = await crearCliente({ nombre: "Cliente X", perfil_codigo: "inventado" });
    expect(creado.statusCode).toBe(400);
  });

  it("PATCH cambia el perfil; la historia no se toca (snapshot por carga)", async () => {
    const { id } = (await crearCliente({ nombre: "Cliente Migrante" })).json();
    const cambio = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/clientes/${id}`,
      headers: auth(),
      payload: { perfil_codigo: "carga_inventario" },
    });
    expect(cambio.statusCode).toBe(200);
    expect(cambio.json().perfilCodigo).toBe("carga_inventario");
  });
});

describe("logo del cliente (DEC-017)", () => {
  it("sube un PNG real, guarda la clave y responde con URL firmada", async () => {
    const { id } = (await crearCliente({ nombre: "Con Logo" })).json();
    const respuesta = await contexto.app.inject({
      method: "PUT",
      url: `/api/v1/admin/clientes/${id}/logo`,
      headers: { ...auth(), "content-type": "image/png" },
      payload: PNG,
    });
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json().logoUrl).toBe(`https://firmada.prueba/clientes/${id}/logo.png`);
    expect(respuesta.json().logoClave).toBeUndefined(); // la clave jamás sale
    expect(contexto.almacenLogos.guardadas[0]?.ruta).toBe(`clientes/${id}/logo.png`);
  });

  it("reemplazar con otra extensión borra el objeto anterior del bucket", async () => {
    const { id } = (await crearCliente({ nombre: "Rebrand" })).json();
    await contexto.app.inject({
      method: "PUT",
      url: `/api/v1/admin/clientes/${id}/logo`,
      headers: { ...auth(), "content-type": "image/png" },
      payload: PNG,
    });
    const reemplazo = await contexto.app.inject({
      method: "PUT",
      url: `/api/v1/admin/clientes/${id}/logo`,
      headers: { ...auth(), "content-type": "image/webp" },
      payload: WEBP,
    });
    expect(reemplazo.statusCode).toBe(200);
    expect(reemplazo.json().logoUrl).toContain("logo.webp");
    expect(contexto.almacenLogos.eliminadas).toContain(`clientes/${id}/logo.png`);
  });

  it("eliminar el logo limpia la clave y borra el objeto (la UI cae a iniciales)", async () => {
    const { id } = (await crearCliente({ nombre: "Sin Logo Ya" })).json();
    await contexto.app.inject({
      method: "PUT",
      url: `/api/v1/admin/clientes/${id}/logo`,
      headers: { ...auth(), "content-type": "image/png" },
      payload: PNG,
    });
    const borrado = await contexto.app.inject({
      method: "DELETE",
      url: `/api/v1/admin/clientes/${id}/logo`,
      headers: auth(),
    });
    expect(borrado.statusCode).toBe(200);
    expect(borrado.json().logoUrl).toBeNull();
    expect(contexto.almacenLogos.eliminadas).toContain(`clientes/${id}/logo.png`);
  });

  it("rechaza un archivo cuyo contenido no es la imagen que declara (números mágicos)", async () => {
    const { id } = (await crearCliente({ nombre: "Archivo Falso" })).json();
    const respuesta = await contexto.app.inject({
      method: "PUT",
      url: `/api/v1/admin/clientes/${id}/logo`,
      headers: { ...auth(), "content-type": "image/png" },
      payload: Buffer.from("<svg>no soy un png</svg>"),
    });
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.json().error).toBe("LOGO_INVALIDO");
    expect(contexto.almacenLogos.guardadas).toHaveLength(0);
  });

  it("rechaza un logo por encima del límite de 1 MB (DEC-017)", async () => {
    const { id } = (await crearCliente({ nombre: "Logo Gigante" })).json();
    const pesado = Buffer.concat([PNG, Buffer.alloc(1024 * 1024, 2)]);
    const respuesta = await contexto.app.inject({
      method: "PUT",
      url: `/api/v1/admin/clientes/${id}/logo`,
      headers: { ...auth(), "content-type": "image/png" },
      payload: pesado,
    });
    expect(respuesta.statusCode).toBe(413);
    expect(contexto.almacenLogos.guardadas).toHaveLength(0);
  });
});

describe("sedes con identidad y por perfil", () => {
  it("crea la sede con ciudad/dirección/referencia y dispensador (perfil con medidor)", async () => {
    const { id } = (await crearCliente({ nombre: "El Trébol Demo" })).json();
    const respuesta = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/sedes",
      headers: auth(),
      payload: {
        cliente_id: id,
        nombre: "Planta Buga",
        ciudad: "Buga, Valle del Cauca",
        dispensador: { nombre: "Isla 1", tot_instalacion_gal: 1200.0 },
      },
    });
    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json().ciudad).toBe("Buga, Valle del Cauca");
    expect(respuesta.json().dispensadores).toHaveLength(1);
  });

  it("crea la sede SIN dispensador (perfil carga_inventario no lo requiere)", async () => {
    const { id } = (
      await crearCliente({
        nombre: "Constructora",
        perfil_codigo: "carga_inventario",
      })
    ).json();
    const respuesta = await contexto.app.inject({
      method: "POST",
      url: "/api/v1/admin/sedes",
      headers: auth(),
      payload: { cliente_id: id, nombre: "Frente de Obra" },
    });
    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.json().dispensadores).toHaveLength(0);
  });

  it("edita y desactiva una sede (PATCH)", async () => {
    const { id } = (await crearCliente({ nombre: "Con Sedes" })).json();
    const sede = (
      await contexto.app.inject({
        method: "POST",
        url: "/api/v1/admin/sedes",
        headers: auth(),
        payload: { cliente_id: id, nombre: "Sede Uno" },
      })
    ).json();
    const cambio = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/sedes/${sede.id}`,
      headers: auth(),
      payload: { ciudad: "Cali, Valle del Cauca", referencia: "Bodega 3", activo: false },
    });
    expect(cambio.statusCode).toBe(200);
    expect(cambio.json().ciudad).toBe("Cali, Valle del Cauca");
    expect(cambio.json().referencia).toBe("Bodega 3");
    expect(cambio.json().activo).toBe(false);
  });

  it("cliente con múltiples sedes: el conteo del cliente las refleja", async () => {
    const { id } = (await crearCliente({ nombre: "Multisede" })).json();
    for (const nombre of ["Sede A", "Sede B"]) {
      await contexto.app.inject({
        method: "POST",
        url: "/api/v1/admin/sedes",
        headers: auth(),
        payload: { cliente_id: id, nombre },
      });
    }
    const sedes = await contexto.app.inject({
      method: "GET",
      url: `/api/v1/admin/clientes/${id}/sedes`,
      headers: auth(),
    });
    expect(sedes.json().sedes).toHaveLength(2);
    const lista = await contexto.app.inject({
      method: "GET",
      url: "/api/v1/admin/clientes",
      headers: auth(),
    });
    expect(lista.json().clientes.find((c: { id: string }) => c.id === id).sedes).toBe(2);
  });
});
