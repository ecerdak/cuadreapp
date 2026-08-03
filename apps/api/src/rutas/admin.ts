// Rutas /api/v1/admin/* — la consola administrativa de Lubryco.
// Thin API (DEC-011): autenticación, permiso admin.*, validación
// estructural, invocar el repositorio y responder. Cero reglas de
// negocio. El PIN llega una vez, se guarda como bcrypt y jamás vuelve.

import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { randomUUID, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { ConflictoUnicidad, type RepositorioAdmin } from "../repositorio/admin.js";
import { exigirPermiso, type PreManejador } from "../seguridad/autenticacion.js";
import type { AlmacenFotos } from "../seguridad/tipos.js";

/** Medianoche de HOY en America/Bogota (UTC-5 fija, sin DST). */
export function inicioHoyBogota(ahora: Date): string {
  const bogota = new Date(ahora.getTime() - 5 * 3_600_000);
  const fecha = bogota.toISOString().slice(0, 10);
  return `${fecha}T00:00:00-05:00`;
}

const generarCodigoEnrolamiento = (prefijo: string) =>
  `${prefijo}-${randomBytes(3).toString("hex").toUpperCase()}`;

/* ============ Esquemas de entrada (validación estructural) ============ */

const esquemaCliente = z.object({
  nombre: z.string().trim().min(2).max(120),
  nit: z.string().trim().min(3).max(30).nullish(),
});
const esquemaClienteCambios = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  nit: z.string().trim().min(3).max(30).nullable().optional(),
  activo: z.boolean().optional(),
});
const esquemaSede = z.object({
  cliente_id: z.string().uuid(),
  nombre: z.string().trim().min(2).max(120),
  lat: z.number().min(-90).max(90).nullish(),
  lng: z.number().min(-180).max(180).nullish(),
  radio_geocerca_m: z.number().int().min(10).max(5000).default(150),
  dispensador: z.object({
    nombre: z.string().trim().min(2).max(120),
    tot_instalacion_gal: z.number().min(0),
  }),
});
const esquemaEquipo = z.object({
  cliente_id: z.string().uuid(),
  codigo_interno: z.string().trim().min(1).max(30),
  descripcion: z.string().trim().max(300).nullish(),
  categoria: z.string().trim().max(60).nullish(),
  tipo_medidor: z.enum(["horometro", "odometro", "ninguno"]).default("ninguno"),
  capacidad_tanque_gal: z.number().min(1).max(20000).nullish(),
});
const esquemaEquipoCambios = z.object({
  codigo_interno: z.string().trim().min(1).max(30).optional(),
  descripcion: z.string().trim().max(300).nullable().optional(),
  categoria: z.string().trim().max(60).nullable().optional(),
  tipo_medidor: z.enum(["horometro", "odometro", "ninguno"]).optional(),
  capacidad_tanque_gal: z.number().min(1).max(20000).nullable().optional(),
  activo: z.boolean().optional(),
});
const esquemaOperador = z.object({
  cliente_id: z.string().uuid(),
  nombre: z.string().trim().min(2).max(120),
  codigo: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, "código numérico de 1 a 4 dígitos"),
  pin: z.string().regex(/^\d{4}$/, "PIN de 4 dígitos"),
});
const esquemaOperadorCambios = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  codigo: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/)
    .optional(),
  pin: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
  activo: z.boolean().optional(),
});
const esquemaCodigo = z.object({
  sede_id: z.string().uuid(),
  expira_dias: z.number().int().min(1).max(30).default(7),
});

export interface DependenciasAdmin {
  repositorio: RepositorioAdmin;
  almacenFotos: AlmacenFotos;
  autenticar: PreManejador;
}

export function registrarRutasAdmin(app: FastifyInstance, deps: DependenciasAdmin): void {
  const { repositorio } = deps;

  const lectura = { preHandler: [deps.autenticar, exigirPermiso("admin.leer")] };
  const escritura = { preHandler: [deps.autenticar, exigirPermiso("admin.gestionar")] };

  const validar = <T>(esquema: z.ZodType<T>, cuerpo: unknown, respuesta: FastifyReply): T | null => {
    const resultado = esquema.safeParse(cuerpo);
    if (!resultado.success) {
      void respuesta
        .status(400)
        .send({ error: "ENTRADA_INVALIDA", detalle: resultado.error.issues[0]?.message });
      return null;
    }
    return resultado.data;
  };

  const conConflicto = async <T>(
    respuesta: FastifyReply,
    operacion: () => Promise<T>,
  ): Promise<T | undefined> => {
    try {
      return await operacion();
    } catch (error) {
      if (error instanceof ConflictoUnicidad) {
        void respuesta
          .status(409)
          .send({ error: "CONFLICTO", detalle: "Ya existe un registro con ese código o nombre." });
        return undefined;
      }
      throw error;
    }
  };

  /* ============ Resumen y cargas ============ */

  app.get("/api/v1/admin/resumen", lectura, async () => {
    const ahora = new Date();
    return repositorio.resumen(inicioHoyBogota(ahora), ahora.toISOString());
  });

  app.get("/api/v1/admin/cargas", lectura, async (solicitud) => {
    const consulta = solicitud.query as { cliente_id?: string; limite?: string };
    const limite = Math.min(Math.max(Number(consulta.limite ?? 30) || 30, 1), 100);
    return {
      cargas: await repositorio.listarCargas({ clienteId: consulta.cliente_id, limite }),
    };
  });

  /* ============ Clientes y sedes ============ */

  app.get("/api/v1/admin/clientes", lectura, async (solicitud) => {
    const { buscar } = solicitud.query as { buscar?: string };
    return { clientes: await repositorio.listarClientes(buscar) };
  });

  app.post("/api/v1/admin/clientes", escritura, async (solicitud, respuesta) => {
    const datos = validar(esquemaCliente, solicitud.body, respuesta);
    if (!datos) return;
    const cliente = await conConflicto(respuesta, () =>
      repositorio.crearCliente({ nombre: datos.nombre, nit: datos.nit ?? null }),
    );
    if (cliente) return respuesta.status(201).send(cliente);
  });

  app.patch("/api/v1/admin/clientes/:id", escritura, async (solicitud, respuesta) => {
    const cambios = validar(esquemaClienteCambios, solicitud.body, respuesta);
    if (!cambios) return;
    const cliente = await conConflicto(respuesta, () =>
      repositorio.editarCliente((solicitud.params as { id: string }).id, cambios),
    );
    if (cliente === undefined) return;
    if (!cliente) return respuesta.status(404).send({ error: "NO_EXISTE" });
    return cliente;
  });

  app.get("/api/v1/admin/clientes/:id/sedes", lectura, async (solicitud) => {
    return { sedes: await repositorio.listarSedes((solicitud.params as { id: string }).id) };
  });

  app.post("/api/v1/admin/sedes", escritura, async (solicitud, respuesta) => {
    const datos = validar(esquemaSede, solicitud.body, respuesta);
    if (!datos) return;
    const sede = await conConflicto(respuesta, () =>
      repositorio.crearSede({
        clienteId: datos.cliente_id,
        nombre: datos.nombre,
        lat: datos.lat ?? null,
        lng: datos.lng ?? null,
        radioGeocercaM: datos.radio_geocerca_m ?? 150,
        dispensador: {
          nombre: datos.dispensador.nombre,
          totInstalacionGal: datos.dispensador.tot_instalacion_gal,
        },
      }),
    );
    if (sede) return respuesta.status(201).send(sede);
  });

  /* ============ Equipos ============ */

  app.get("/api/v1/admin/equipos", lectura, async (solicitud) => {
    const consulta = solicitud.query as { cliente_id?: string; buscar?: string };
    return {
      equipos: await repositorio.listarEquipos({
        clienteId: consulta.cliente_id,
        buscar: consulta.buscar,
      }),
    };
  });

  app.post("/api/v1/admin/equipos", escritura, async (solicitud, respuesta) => {
    const datos = validar(esquemaEquipo, solicitud.body, respuesta);
    if (!datos) return;
    const equipo = await conConflicto(respuesta, () =>
      repositorio.crearEquipo({
        clienteId: datos.cliente_id,
        codigoInterno: datos.codigo_interno,
        qrToken: randomUUID(),
        descripcion: datos.descripcion ?? null,
        categoria: datos.categoria ?? null,
        tipoMedidor: datos.tipo_medidor ?? "ninguno",
        capacidadTanqueGal: datos.capacidad_tanque_gal ?? null,
      }),
    );
    if (equipo) return respuesta.status(201).send(equipo);
  });

  app.patch("/api/v1/admin/equipos/:id", escritura, async (solicitud, respuesta) => {
    const cambios = validar(esquemaEquipoCambios, solicitud.body, respuesta);
    if (!cambios) return;
    const equipo = await conConflicto(respuesta, () =>
      repositorio.editarEquipo((solicitud.params as { id: string }).id, {
        codigoInterno: cambios.codigo_interno,
        ...("descripcion" in cambios ? { descripcion: cambios.descripcion ?? null } : {}),
        categoria: cambios.categoria ?? undefined,
        tipoMedidor: cambios.tipo_medidor,
        ...("capacidad_tanque_gal" in cambios
          ? { capacidadTanqueGal: cambios.capacidad_tanque_gal ?? null }
          : {}),
        activo: cambios.activo,
      }),
    );
    if (equipo === undefined) return;
    if (!equipo) return respuesta.status(404).send({ error: "NO_EXISTE" });
    return equipo;
  });

  /* ============ Operadores (≡ conductores) ============ */

  app.get("/api/v1/admin/operadores", lectura, async (solicitud) => {
    const consulta = solicitud.query as { cliente_id?: string; buscar?: string };
    return {
      operadores: await repositorio.listarOperadores({
        clienteId: consulta.cliente_id,
        buscar: consulta.buscar,
      }),
    };
  });

  app.post("/api/v1/admin/operadores", escritura, async (solicitud, respuesta) => {
    const datos = validar(esquemaOperador, solicitud.body, respuesta);
    if (!datos) return;
    const operador = await conConflicto(respuesta, () =>
      repositorio.crearOperador({
        clienteId: datos.cliente_id,
        nombre: datos.nombre,
        codigo: datos.codigo,
        pinHash: bcrypt.hashSync(datos.pin, 10),
      }),
    );
    if (operador) return respuesta.status(201).send(operador);
  });

  app.patch("/api/v1/admin/operadores/:id", escritura, async (solicitud, respuesta) => {
    const cambios = validar(esquemaOperadorCambios, solicitud.body, respuesta);
    if (!cambios) return;
    const operador = await conConflicto(respuesta, () =>
      repositorio.editarOperador((solicitud.params as { id: string }).id, {
        nombre: cambios.nombre,
        codigo: cambios.codigo,
        pinHash: cambios.pin ? bcrypt.hashSync(cambios.pin, 10) : undefined,
        activo: cambios.activo,
      }),
    );
    if (operador === undefined) return;
    if (!operador) return respuesta.status(404).send({ error: "NO_EXISTE" });
    return operador;
  });

  /* ============ Enrolamiento y dispositivos ============ */

  app.get("/api/v1/admin/codigos", lectura, async (solicitud) => {
    const { sede_id } = solicitud.query as { sede_id?: string };
    const ahora = Date.now();
    const codigos = (await repositorio.listarCodigos({ sedeId: sede_id })).map((codigo) => ({
      ...codigo,
      estado: codigo.usadoEn
        ? ("usado" as const)
        : new Date(codigo.expiraEn).getTime() < ahora
          ? ("expirado" as const)
          : ("vigente" as const),
    }));
    return { codigos };
  });

  app.post("/api/v1/admin/codigos", escritura, async (solicitud, respuesta) => {
    const datos = validar(esquemaCodigo, solicitud.body, respuesta);
    if (!datos) return;
    const expiraEn = new Date(Date.now() + (datos.expira_dias ?? 7) * 86_400_000).toISOString();
    const codigo = await conConflicto(respuesta, () =>
      repositorio.crearCodigo({
        sedeId: datos.sede_id,
        codigo: generarCodigoEnrolamiento("EDS"),
        expiraEn,
      }),
    );
    if (codigo) return respuesta.status(201).send(codigo);
  });

  app.get("/api/v1/admin/dispositivos", lectura, async () => {
    return { dispositivos: await repositorio.listarDispositivos() };
  });

  app.patch("/api/v1/admin/dispositivos/:id", escritura, async (solicitud, respuesta) => {
    const cuerpo = validar(z.object({ activo: z.literal(false) }), solicitud.body, respuesta);
    if (!cuerpo) return;
    const dispositivo = await repositorio.desactivarDispositivo((solicitud.params as { id: string }).id);
    if (!dispositivo) return respuesta.status(404).send({ error: "NO_EXISTE" });
    return dispositivo;
  });

  /** Reenrolar = revocar el dispositivo + emitir un código nuevo de su sede. */
  app.post("/api/v1/admin/dispositivos/:id/reenrolar", escritura, async (solicitud, respuesta) => {
    const dispositivo = await repositorio.desactivarDispositivo((solicitud.params as { id: string }).id);
    if (!dispositivo) return respuesta.status(404).send({ error: "NO_EXISTE" });
    const codigo = await repositorio.crearCodigo({
      sedeId: dispositivo.sedeId,
      codigo: generarCodigoEnrolamiento("EDS"),
      expiraEn: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    });
    return respuesta.status(201).send({ dispositivo, codigo });
  });

  /* ============ Tablero por cliente (Sacyr) ============ */

  app.get("/api/v1/admin/tablero/:clienteId", lectura, async (solicitud, respuesta) => {
    const ahora = new Date();
    const desde = new Date(ahora.getTime() - 14 * 86_400_000).toISOString();
    const tablero = await repositorio.tableroCliente(
      (solicitud.params as { clienteId: string }).clienteId,
      inicioHoyBogota(ahora),
      desde,
    );
    if (!tablero) return respuesta.status(404).send({ error: "NO_EXISTE" });

    // Evidencia: URLs firmadas temporales del bucket privado (1 hora).
    const historial = await Promise.all(
      tablero.historial.map(async (carga) => ({
        ...carga,
        fotos: await Promise.all(
          carga.fotos.map(async (foto) => ({
            momento: foto.momento,
            url: await deps.almacenFotos.urlFirmada(foto.ruta, 3600),
          })),
        ),
      })),
    );
    return { ...tablero, historial };
  });
}
