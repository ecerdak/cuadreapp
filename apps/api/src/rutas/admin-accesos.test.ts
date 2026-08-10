// Accesos al Dashboard de Cliente (Etapa P.2).
//
// La regla que sostiene todo lo demás: un acceso es una PERSONA con
// correo y contraseña en `usuarios`; un operador de campo es una fila
// de `conductores` con código+PIN. Crear uno no crea el otro, y ni el
// cuerpo de la petición ni el navegador pueden nombrar el cliente: sale
// del parámetro de ruta, comprobado contra el alcance del administrador.

import { beforeEach, describe, expect, it } from "vitest";
import { armarAplicacion, crearToken } from "../pruebas/apoyo.js";
import { RepositorioAdminFalso, sesionAdmin } from "../pruebas/apoyo-admin.js";
import type { SesionAutenticada } from "../seguridad/tipos.js";

const CLIENTE_A = "11111111-1111-4111-8111-111111111111";
const CLIENTE_B = "22222222-2222-4222-8222-222222222222";
const SEDE_A = "33333333-3333-4333-8333-333333333333";

const ID_ADMIN_GLOBAL = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ID_ADMIN_DE_A = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ID_SUPERVISOR = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const ID_DISPOSITIVO = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

/** admin_lubryco: sin cliente en su sesión → administra cualquiera. */
const sesionAdminGlobal = (): SesionAutenticada => ({
  ...sesionAdmin(),
  usuarioId: ID_ADMIN_GLOBAL,
  clienteId: null,
});
/** Administrador atado a un cliente: solo administra el suyo. */
const sesionAdminDeA = (): SesionAutenticada => ({
  ...sesionAdmin(),
  usuarioId: ID_ADMIN_DE_A,
  clienteId: CLIENTE_A,
});
/** Un usuario del Dashboard: lee su tablero, no administra nada. */
const sesionSupervisor = (): SesionAutenticada => ({
  usuarioId: ID_SUPERVISOR,
  nombre: "Supervisora",
  rol: "supervisor",
  clienteId: CLIENTE_A,
  sedeId: null,
  permisos: ["tablero.leer", "catalogo.leer"],
  perfil: "carga_inventario",
});
/** Un dispositivo enrolado (la PWA): jamás administra ni lee tablero. */
const sesionDispositivoPwa = (): SesionAutenticada => ({
  usuarioId: ID_DISPOSITIVO,
  nombre: "Dispositivo",
  rol: "dispositivo",
  clienteId: CLIENTE_A,
  sedeId: SEDE_A,
  permisos: ["cargas.registrar", "cargas.subir_foto", "catalogo.leer"],
  perfil: "carga_inventario",
});

describe("Accesos al Dashboard — administración por cliente", () => {
  let contexto: ReturnType<typeof armarAplicacion> & { repositorioAdmin: RepositorioAdminFalso };
  let repositorioAdmin: RepositorioAdminFalso;
  let proveedor: ReturnType<typeof armarAplicacion>["proveedorIdentidad"];
  const tokens = new Map<string, string>();

  beforeEach(async () => {
    repositorioAdmin = new RepositorioAdminFalso();
    const armado = armarAplicacion({ repositorioAdmin, limites: false });
    contexto = { ...armado, repositorioAdmin };
    proveedor = armado.proveedorIdentidad;
    armado.repositorioSeguridad.sesiones.set(ID_ADMIN_GLOBAL, sesionAdminGlobal());
    armado.repositorioSeguridad.sesiones.set(ID_ADMIN_DE_A, sesionAdminDeA());
    armado.repositorioSeguridad.sesiones.set(ID_SUPERVISOR, sesionSupervisor());
    armado.repositorioSeguridad.sesiones.set(ID_DISPOSITIVO, sesionDispositivoPwa());
    for (const id of [ID_ADMIN_GLOBAL, ID_ADMIN_DE_A, ID_SUPERVISOR, ID_DISPOSITIVO]) {
      tokens.set(id, await crearToken(id));
    }
  });

  const auth = (quien: string) => ({ authorization: `Bearer ${tokens.get(quien)!}` });

  const crear = async (cliente: string, cuerpo: Record<string, unknown>, quien = ID_ADMIN_GLOBAL) =>
    await contexto.app.inject({
      method: "POST",
      url: `/api/v1/admin/clientes/${cliente}/accesos`,
      headers: auth(quien),
      payload: cuerpo,
    });

  const listar = async (cliente: string, quien = ID_ADMIN_GLOBAL) =>
    await contexto.app.inject({
      method: "GET",
      url: `/api/v1/admin/clientes/${cliente}/accesos`,
      headers: auth(quien),
    });

  const nuevo = (email: string, nombre = "Gerente General") => ({ nombre, email });

  /* ============ Alta ============ */

  it("crea el acceso, devuelve la contraseña temporal UNA vez y no la persiste", async () => {
    const r = await crear(CLIENTE_A, nuevo("gerencia@empresa.test"));
    expect(r.statusCode).toBe(201);
    const cuerpo = r.json();
    expect(cuerpo.nombre).toBe("Gerente General");
    expect(cuerpo.email).toBe("gerencia@empresa.test");
    expect(cuerpo.rol).toBe("supervisor"); // rol por defecto del Dashboard
    expect(cuerpo.activo).toBe(true);
    expect(cuerpo.ultimoAccesoEn).toBeNull();
    expect(typeof cuerpo.password_temporal).toBe("string");
    expect(cuerpo.password_temporal.length).toBeGreaterThan(9);

    // La contraseña no vuelve nunca más: el listado no la conoce.
    const lista = await listar(CLIENTE_A);
    expect(lista.json().accesos[0].password_temporal).toBeUndefined();
  });

  it("crear un acceso NO crea un operador de campo (dominios separados)", async () => {
    await crear(CLIENTE_A, nuevo("gerencia@empresa.test"));
    expect(repositorioAdmin.operadores).toHaveLength(0);
    expect(repositorioAdmin.accesos).toHaveLength(1);
  });

  it("acepta el rol admin_cliente y rechaza cualquier otro", async () => {
    const ok = await crear(CLIENTE_A, { ...nuevo("jefa@empresa.test"), rol: "admin_cliente" });
    expect(ok.statusCode).toBe(201);
    expect(ok.json().rol).toBe("admin_cliente");

    const malo = await crear(CLIENTE_A, { ...nuevo("otro@empresa.test"), rol: "admin_lubryco" });
    expect(malo.statusCode).toBe(400);
  });

  it("un correo ya usado responde 409 CORREO_EN_USO, no un error genérico", async () => {
    await crear(CLIENTE_A, nuevo("repetido@empresa.test"));
    const r = await crear(CLIENTE_B, nuevo("repetido@empresa.test"));
    expect(r.statusCode).toBe(409);
    expect(r.json().error).toBe("CORREO_EN_USO");
  });

  it("varios accesos con el MISMO rol son identidades independientes", async () => {
    const a = await crear(CLIENTE_A, nuevo("general@empresa.test", "Gerente General"));
    const b = await crear(CLIENTE_A, nuevo("operaciones@empresa.test", "Gerente Operaciones"));
    const c = await crear(CLIENTE_A, nuevo("mecanica@empresa.test", "Gerente Mecánica"));
    const ids = [a, b, c].map((r) => r.json().usuarioId);
    expect(new Set(ids).size).toBe(3);
    expect([a, b, c].every((r) => r.json().rol === "supervisor")).toBe(true);
    // …y contraseñas distintas: nadie comparte credencial.
    const claves = [a, b, c].map((r) => r.json().password_temporal);
    expect(new Set(claves).size).toBe(3);
  });

  it("revocar uno NO revoca a los demás", async () => {
    const a = await crear(CLIENTE_A, nuevo("general@empresa.test"));
    await crear(CLIENTE_A, nuevo("operaciones@empresa.test"));
    const r = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/clientes/${CLIENTE_A}/accesos/${a.json().usuarioId}`,
      headers: auth(ID_ADMIN_GLOBAL),
      payload: { activo: false },
    });
    expect(r.statusCode).toBe(200);
    expect(r.json().activo).toBe(false);

    const lista = await listar(CLIENTE_A);
    const activos = lista.json().accesos.filter((a: { activo: boolean }) => a.activo);
    expect(activos).toHaveLength(1);
    expect(activos[0].email).toBe("operaciones@empresa.test");
  });

  /* ============ Aislamiento entre empresas ============ */

  it("el listado solo trae los accesos del cliente de la ruta", async () => {
    await crear(CLIENTE_A, nuevo("a@empresa.test"));
    await crear(CLIENTE_B, nuevo("b@otra.test"));
    const deA = await listar(CLIENTE_A);
    expect(deA.json().accesos).toHaveLength(1);
    expect(deA.json().accesos[0].email).toBe("a@empresa.test");
    const deB = await listar(CLIENTE_B);
    expect(deB.json().accesos).toHaveLength(1);
    expect(deB.json().accesos[0].email).toBe("b@otra.test");
  });

  it("un administrador atado a un cliente no administra otro: 403", async () => {
    const r = await crear(CLIENTE_B, nuevo("intruso@otra.test"), ID_ADMIN_DE_A);
    expect(r.statusCode).toBe(403);
    expect(r.json().error).toBe("FUERA_DE_ALCANCE");
    expect(repositorioAdmin.accesos).toHaveLength(0);
  });

  it("editar un acceso de otro cliente responde 404, igual que uno inexistente", async () => {
    const a = await crear(CLIENTE_A, nuevo("a@empresa.test"));
    const r = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/clientes/${CLIENTE_B}/accesos/${a.json().usuarioId}`,
      headers: auth(ID_ADMIN_GLOBAL),
      payload: { activo: false },
    });
    expect(r.statusCode).toBe(404);
    // …y el acceso real sigue intacto
    expect(repositorioAdmin.accesos[0]!.activo).toBe(true);
  });

  it("un cliente_id en el CUERPO no cambia nada: manda la ruta", async () => {
    const r = await crear(CLIENTE_A, {
      ...nuevo("a@empresa.test"),
      cliente_id: CLIENTE_B,
      clienteId: CLIENTE_B,
    });
    expect(r.statusCode).toBe(201);
    expect(repositorioAdmin.clienteDe.get(r.json().usuarioId)).toBe(CLIENTE_A);
  });

  /* ============ Quién puede administrar ============ */

  it("admin_lubryco administra accesos de cualquier cliente", async () => {
    expect((await crear(CLIENTE_A, nuevo("a@empresa.test"))).statusCode).toBe(201);
    expect((await crear(CLIENTE_B, nuevo("b@otra.test"))).statusCode).toBe(201);
  });

  it("un usuario del Dashboard no administra accesos: 403 SIN_PERMISO", async () => {
    const r = await crear(CLIENTE_A, nuevo("x@empresa.test"), ID_SUPERVISOR);
    expect(r.statusCode).toBe(403);
    expect(r.json().error).toBe("SIN_PERMISO");
  });

  it("un dispositivo de la PWA no administra accesos ni obtiene tablero", async () => {
    const r = await crear(CLIENTE_A, nuevo("x@empresa.test"), ID_DISPOSITIVO);
    expect(r.statusCode).toBe(403);
    expect(sesionDispositivoPwa().permisos).not.toContain("tablero.leer");
    expect(sesionDispositivoPwa().permisos).not.toContain("admin.gestionar");
  });

  it("sin token: 401", async () => {
    const r = await contexto.app.inject({
      method: "GET",
      url: `/api/v1/admin/clientes/${CLIENTE_A}/accesos`,
    });
    expect(r.statusCode).toBe(401);
  });

  /* ============ Contraseña ============ */

  it("restablecer contraseña devuelve una nueva y cambia la identidad de Auth", async () => {
    const a = await crear(CLIENTE_A, nuevo("a@empresa.test"));
    const anterior = a.json().password_temporal;
    const r = await contexto.app.inject({
      method: "POST",
      url: `/api/v1/admin/clientes/${CLIENTE_A}/accesos/${a.json().usuarioId}/password`,
      headers: auth(ID_ADMIN_GLOBAL),
    });
    expect(r.statusCode).toBe(200);
    expect(r.json().password_temporal).not.toBe(anterior);
    expect(proveedor.personas[0]!.password).toBe(r.json().password_temporal);
  });

  it("no se puede restablecer la contraseña de un acceso de otro cliente", async () => {
    const a = await crear(CLIENTE_A, nuevo("a@empresa.test"));
    const antes = proveedor.personas[0]!.password;
    const r = await contexto.app.inject({
      method: "POST",
      url: `/api/v1/admin/clientes/${CLIENTE_B}/accesos/${a.json().usuarioId}/password`,
      headers: auth(ID_ADMIN_GLOBAL),
    });
    expect(r.statusCode).toBe(404);
    expect(proveedor.personas[0]!.password).toBe(antes); // la identidad no se tocó
  });

  /* ============ Edición ============ */

  it("edita nombre, rol y sede; la sede null significa todas las del cliente", async () => {
    const a = await crear(CLIENTE_A, nuevo("a@empresa.test"));
    const r = await contexto.app.inject({
      method: "PATCH",
      url: `/api/v1/admin/clientes/${CLIENTE_A}/accesos/${a.json().usuarioId}`,
      headers: auth(ID_ADMIN_GLOBAL),
      payload: { nombre: "Gerente de Mecánica", rol: "admin_cliente", sede_id: null },
    });
    expect(r.statusCode).toBe(200);
    expect(r.json().nombre).toBe("Gerente de Mecánica");
    expect(r.json().rol).toBe("admin_cliente");
    expect(r.json().sedeId).toBeNull();
  });

  it("un correo inválido se rechaza antes de tocar Auth", async () => {
    const r = await crear(CLIENTE_A, { nombre: "X", email: "no-es-correo" });
    expect(r.statusCode).toBe(400);
    expect(proveedor.personas).toHaveLength(0);
  });
});
