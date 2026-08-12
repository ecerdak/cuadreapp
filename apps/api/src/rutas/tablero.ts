// Rutas /api/v1/tablero/* — el Dashboard de Cliente (Etapa P.2).
// Thin API (DEC-011): autenticar, autorizar con `tablero.leer`,
// resolver el ALCANCE de la sesión, invocar el repositorio y
// responder. Cero reglas de negocio: el estado y las banderas de una
// carga se leen tal como el dominio los decidió al registrarla.
//
// El aislamiento multiempresa es estructural, no una comprobación que
// alguien pueda olvidar: `alcanceDeSesion` es la ÚNICA fuente del
// cliente_id, y viene de la sesión resuelta contra el RBAC propio. La
// petición no tiene ningún parámetro con el que nombrar otro cliente.
// Lo único que el navegador puede pedir es una sede, y solo se acepta
// si es del cliente de la sesión y cabe dentro de su alcance.
//
// La COMPOSICIÓN del tablero (qué módulos, paneles y columnas) sale
// del registro de perfiles del dominio (DEC-016): la API la transporta,
// no la decide.

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { composicionTablero } from "@cuadreapp/dominio";
import type { EstadoCarga } from "@cuadreapp/dominio";
import type { AlcanceTablero, RepositorioTablero, VentanaTablero } from "../repositorio/tablero.js";
import { exigirPermiso, type PreManejador } from "../seguridad/autenticacion.js";
import type { AlmacenFotos } from "../seguridad/tipos.js";
import { inicioHaceDiasBogota, inicioHoyBogota } from "../tiempo.js";

const SEGUNDOS_FIRMA_LOGO = 24 * 3600;
const SEGUNDOS_FIRMA_FOTO = 3600;

const esquemaConsulta = z.object({
  sede_id: z.string().uuid().optional(),
  estado: z.enum(["ok", "advertencia", "inconsistente"]).optional(),
});

export interface DependenciasTablero {
  repositorio: RepositorioTablero;
  almacenFotos: AlmacenFotos;
  /** Bucket privado de logos (DEC-017). null: logo deshabilitado. */
  almacenLogos: AlmacenFotos | null;
  autenticar: PreManejador;
}

/** Ventana estándar del tablero: hoy, 14 días y 7 días, en Bogotá. */
export function ventanaTablero(ahora: Date): VentanaTablero {
  return {
    inicioHoy: inicioHoyBogota(ahora),
    desde14d: inicioHaceDiasBogota(ahora, 13),
    desde7d: inicioHaceDiasBogota(ahora, 6),
  };
}

export function registrarRutasTablero(app: FastifyInstance, deps: DependenciasTablero): void {
  const { repositorio } = deps;

  /** P0.1: con la contraseña TEMPORAL de la consola no se entra al
   *  tablero — primero se define una propia (/api/v1/auth/password).
   *  La autoridad es este 403, no la pantalla del Dashboard. */
  const exigirPasswordDefinitiva: PreManejador = async (solicitud, respuesta) => {
    if (solicitud.sesion?.debeCambiarPassword === true) {
      solicitud.observable.resultado = "password_temporal";
      return respuesta.status(403).send({ error: "PASSWORD_TEMPORAL" });
    }
  };

  const proteger = {
    preHandler: [deps.autenticar, exigirPermiso("tablero.leer"), exigirPasswordDefinitiva],
  };

  /** Alcance de la sesión, con la sede pedida ya validada.
   *  - Sesión CON sede fija: manda la suya; pedir otra es 403.
   *  - Sesión SIN sede: todas las de su cliente, o la que pida si es
   *    suya; una sede ajena es 403 (jamás 404: no se confirma que
   *    exista en otro cliente).
   *  Devuelve null cuando ya respondió — quien llama solo retorna. */
  async function alcanceDeSesion(
    solicitud: FastifyRequest,
    respuesta: FastifyReply,
  ): Promise<AlcanceTablero | null> {
    const sesion = solicitud.sesion!;
    if (sesion.clienteId === null) {
      // admin_lubryco / comercial_lubryco: sin empresa que mostrar.
      solicitud.observable.resultado = "sin_cliente_en_sesion";
      void respuesta.status(403).send({ error: "SIN_CLIENTE_EN_SESION" });
      return null;
    }

    const analisis = esquemaConsulta.safeParse(solicitud.query);
    if (!analisis.success) {
      solicitud.observable.resultado = "invalido";
      void respuesta.status(400).send({ error: "VALIDACION_ESTRUCTURAL" });
      return null;
    }
    const pedida = analisis.data.sede_id ?? null;

    if (sesion.sedeId !== null) {
      if (pedida !== null && pedida !== sesion.sedeId) {
        solicitud.observable.resultado = "sede_fuera_de_alcance";
        void respuesta.status(403).send({ error: "SEDE_FUERA_DE_ALCANCE" });
        return null;
      }
      return { clienteId: sesion.clienteId, sedeId: sesion.sedeId };
    }

    if (pedida !== null && !(await repositorio.sedePerteneceACliente(sesion.clienteId, pedida))) {
      solicitud.observable.resultado = "sede_fuera_de_alcance";
      void respuesta.status(403).send({ error: "SEDE_FUERA_DE_ALCANCE" });
      return null;
    }
    return { clienteId: sesion.clienteId, sedeId: pedida };
  }

  const estadoPedido = (solicitud: FastifyRequest): EstadoCarga | undefined =>
    esquemaConsulta.safeParse(solicitud.query).data?.estado;

  /* ============ Contexto: quién es la empresa ============ */

  app.get("/api/v1/tablero/contexto", proteger, async (solicitud, respuesta) => {
    const alcance = await alcanceDeSesion(solicitud, respuesta);
    if (!alcance) return;

    const datos = await repositorio.contexto(alcance);
    if (!datos) {
      solicitud.observable.resultado = "cliente_no_disponible";
      return respuesta.status(404).send({ error: "CLIENTE_NO_DISPONIBLE" });
    }

    const { logoClave, ...cliente } = datos.cliente;
    const logoUrl =
      logoClave && deps.almacenLogos
        ? await deps.almacenLogos.urlFirmada(logoClave, SEGUNDOS_FIRMA_LOGO)
        : null;

    const sesion = solicitud.sesion!;
    solicitud.observable.perfil = datos.perfil.codigo;
    solicitud.observable.resultado = "contexto";
    return respuesta.status(200).send({
      usuario: { nombre: sesion.nombre, rol: sesion.rol },
      permisos: sesion.permisos,
      cliente: { ...cliente, logoUrl },
      // La composición la declara el perfil en el dominio (DEC-016).
      perfil: { ...datos.perfil, ...composicionTablero(datos.perfil.codigo) },
      sedes: datos.sedes,
      sedeActual: alcance.sedeId,
      medidor: datos.medidor,
    });
  });

  /* ============ Hoy ============ */

  app.get("/api/v1/tablero/hoy", proteger, async (solicitud, respuesta) => {
    const alcance = await alcanceDeSesion(solicitud, respuesta);
    if (!alcance) return;
    solicitud.observable.resultado = "tablero_hoy";
    return repositorio.hoy(alcance, ventanaTablero(new Date()));
  });

  /* ============ Cargas ============ */

  app.get("/api/v1/tablero/cargas", proteger, async (solicitud, respuesta) => {
    const alcance = await alcanceDeSesion(solicitud, respuesta);
    if (!alcance) return;
    const ventana = ventanaTablero(new Date());
    solicitud.observable.resultado = "tablero_cargas";
    return repositorio.cargas(alcance, {
      estado: estadoPedido(solicitud),
      desde: ventana.desde14d,
    });
  });

  app.get("/api/v1/tablero/cargas/:id", proteger, async (solicitud, respuesta) => {
    const alcance = await alcanceDeSesion(solicitud, respuesta);
    if (!alcance) return;

    const id = (solicitud.params as { id: string }).id;
    if (!z.string().uuid().safeParse(id).success) {
      solicitud.observable.resultado = "invalido";
      return respuesta.status(400).send({ error: "VALIDACION_ESTRUCTURAL" });
    }

    const detalle = await repositorio.detalleCarga(alcance, id);
    if (!detalle) {
      // Una carga de otro cliente responde igual que una inexistente:
      // el 404 no confirma que exista en algún lado.
      solicitud.observable.resultado = "carga_no_encontrada";
      return respuesta.status(404).send({ error: "CARGA_NO_ENCONTRADA" });
    }

    const fotos = await Promise.all(
      detalle.fotos.map(async (foto) => ({
        momento: foto.momento,
        url: await deps.almacenFotos.urlFirmada(foto.ruta, SEGUNDOS_FIRMA_FOTO),
      })),
    );
    solicitud.observable.resultado = "tablero_detalle";
    return respuesta.status(200).send({ ...detalle, fotos });
  });

  /* ============ Equipos ============ */

  app.get("/api/v1/tablero/equipos", proteger, async (solicitud, respuesta) => {
    const alcance = await alcanceDeSesion(solicitud, respuesta);
    if (!alcance) return;
    solicitud.observable.resultado = "tablero_equipos";
    return { equipos: await repositorio.equipos(alcance, ventanaTablero(new Date())) };
  });

  /* ============ Suministro ============ */

  app.get("/api/v1/tablero/suministro", proteger, async (solicitud, respuesta) => {
    const alcance = await alcanceDeSesion(solicitud, respuesta);
    if (!alcance) return;
    solicitud.observable.resultado = "tablero_suministro";
    return repositorio.suministro(alcance, ventanaTablero(new Date()));
  });
}
