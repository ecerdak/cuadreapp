// POST /api/v1/cargas — la única vía de escritura de cargas (DEC-009).
// Orquestación pura (DEC-011): validar forma, resolver contexto en la
// base, invocar el dominio, persistir y responder. Cero reglas de
// negocio.
//
// PUNTO DE DESPACHO POR PERFIL (DEC-016): el perfil sale de la SESIÓN
// (el cliente del dispositivo, resuelto en la base) — jamás del cuerpo
// de la petición. Cada perfil tiene su esquema estructural, su
// resolución de contexto, su invocación al registro del dominio y su
// mapeo de columnas. Este archivo es uno de los cuatro lugares del
// sistema autorizados a nombrar códigos de perfil.
//
// Principio del spec §7: NUNCA se bloquea un registro. Una carga
// inconsistente se persiste igual, con su estado y sus banderas — los
// campos bloquea_avance/bloquea_cierre de la respuesta son para que la
// UI actúe, no para que el servidor rechace.

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  validarSegunPerfil,
  type CodigoPerfil,
  type RegistroCarga,
  type RegistroCargaInventario,
  type ResultadoValidacion,
} from "@cuadreapp/dominio";
import { esquemaCargaEntrante, esquemaCargaInventarioEntrante } from "../esquemas/carga.js";
import { exigirPermiso, type PreManejador } from "../seguridad/autenticacion.js";
import type { CargaPersistida, NuevaFoto, RepositorioCargas } from "../repositorio/tipos.js";

function responderInvalido(
  solicitud: FastifyRequest,
  respuesta: FastifyReply,
  problemas: Array<{ path: (string | number)[]; message: string }>,
) {
  solicitud.observable.resultado = "invalido";
  return respuesta.status(400).send({
    error: "VALIDACION_ESTRUCTURAL",
    detalles: problemas.map((problema) => ({
      campo: problema.path.join("."),
      mensaje: problema.message,
    })),
  });
}

function responderIdempotente(
  solicitud: FastifyRequest,
  respuesta: FastifyReply,
  existente: CargaPersistida,
) {
  solicitud.observable.resultado = "idempotente";
  return respuesta.status(200).send({
    id: existente.id,
    estado: existente.estado,
    banderas: existente.banderas,
    galones: existente.galones,
    gal_no_registrados: existente.galNoRegistrados,
    ...(existente.inventarioFinalGal !== null
      ? { llegada_gal: existente.llegadaGal, inventario_final_gal: existente.inventarioFinalGal }
      : {}),
    idempotente: true,
  });
}

/** dentro_geocerca se deriva del veredicto para la columna
 *  (SIN_GPS → desconocido), sin reinterpretar las reglas. */
function derivarDentroGeocerca(veredicto: ResultadoValidacion): boolean | null {
  return veredicto.banderas.includes("SIN_GPS") ? null : !veredicto.banderas.includes("FUERA_DE_SEDE");
}

function armarFotos(
  id: string,
  entrada: { foto_inicial_path?: string | null; foto_final_path?: string | null },
): NuevaFoto[] {
  const fotos: NuevaFoto[] = [];
  if (entrada.foto_inicial_path) {
    fotos.push({ carga_id: id, momento: "inicial", storage_path: entrada.foto_inicial_path });
  }
  if (entrada.foto_final_path) {
    fotos.push({ carga_id: id, momento: "final", storage_path: entrada.foto_final_path });
  }
  return fotos;
}

export function registrarRutaCargas(
  app: FastifyInstance,
  repositorio: RepositorioCargas,
  autenticar: PreManejador,
): void {
  app.post(
    "/api/v1/cargas",
    { preHandler: [autenticar, exigirPermiso("cargas.registrar")] },
    async (solicitud, respuesta) => {
      // El perfil de la sesión decide el contrato completo. Los
      // dispositivos siempre tienen cliente; el default cubre sesiones
      // creadas antes de la Etapa P (compatibilidad hacia atrás).
      const sesion = solicitud.sesion!;
      const perfil: CodigoPerfil = sesion.perfil ?? "medidor_doble";
      solicitud.observable.perfil = perfil;

      if (perfil === "carga_inventario") {
        return manejarCargaInventario(solicitud, respuesta);
      }
      return manejarCargaMedidorDoble(solicitud, respuesta);
    },
  );

  /* ============ Perfil medidor_doble (El Trébol) — flujo original ============ */

  async function manejarCargaMedidorDoble(solicitud: FastifyRequest, respuesta: FastifyReply) {
    // 1. Validación estructural (forma y rangos; nada de negocio).
    const analisis = esquemaCargaEntrante.safeParse(solicitud.body);
    if (!analisis.success) return responderInvalido(solicitud, respuesta, analisis.error.issues);
    const entrada = analisis.data;

    // 2. Idempotencia: la app genera el uuid; un reintento de la cola
    //    offline con el mismo id devuelve lo ya persistido (spec §10.4).
    const existente = await repositorio.buscarCargaPorId(entrada.id);
    if (existente) return responderIdempotente(solicitud, respuesta, existente);

    // 3. Contexto desde la base. cliente_id y sede_id se derivan del
    //    dispensador — el tenant nunca viene del cliente.
    const contexto = await repositorio.obtenerContextoRegistro({
      dispensadorId: entrada.dispensador_id,
      equipoId: entrada.equipo_id,
      conductorId: entrada.conductor_id,
    });
    if (contexto === null) {
      solicitud.observable.resultado = "referencia_no_encontrada";
      return respuesta.status(404).send({
        error: "REFERENCIA_NO_ENCONTRADA",
        detalle: "dispensador, equipo o conductor inexistente, inactivo o de otro cliente",
      });
    }

    // Alcance de la sesión (DEC-013): un dispositivo solo registra en
    // su sede; un usuario de cliente, solo en su cliente. El tenant lo
    // decide la sesión, jamás el cuerpo de la petición.
    const sesion = solicitud.sesion!;
    if (
      (sesion.sedeId !== null && contexto.sedeId !== sesion.sedeId) ||
      (sesion.clienteId !== null && contexto.clienteId !== sesion.clienteId)
    ) {
      solicitud.observable.resultado = "fuera_de_alcance";
      return respuesta.status(403).send({ error: "FUERA_DE_ALCANCE" });
    }

    // 4. La única decisión de negocio: el registro de perfiles del dominio.
    const registro: RegistroCarga = {
      tandaInicialGal: entrada.tanda_inicial_gal,
      totInicialGal: entrada.tot_inicial_gal,
      tandaFinalGal: entrada.tanda_final_gal,
      totFinalGal: entrada.tot_final_gal,
      lecturaEquipo: entrada.lectura_equipo ?? null,
      iniciadaEn: entrada.iniciada_en,
      finalizadaEn: entrada.finalizada_en,
      lat: entrada.lat ?? null,
      lng: entrada.lng ?? null,
      origen: entrada.origen,
      fotoInicial: Boolean(entrada.foto_inicial_path),
      fotoFinal: Boolean(entrada.foto_final_path),
    };
    const veredicto = validarSegunPerfil({
      perfil: "medidor_doble",
      registro,
      contexto: contexto.validacion,
    });

    // 5. Persistencia.
    await repositorio.insertarCarga(
      {
        id: entrada.id,
        perfil_codigo: "medidor_doble",
        cliente_id: contexto.clienteId,
        sede_id: contexto.sedeId,
        dispensador_id: entrada.dispensador_id,
        equipo_id: entrada.equipo_id,
        conductor_id: entrada.conductor_id,
        tanda_inicial_gal: entrada.tanda_inicial_gal,
        tot_inicial_gal: entrada.tot_inicial_gal,
        tanda_final_gal: entrada.tanda_final_gal,
        tot_final_gal: entrada.tot_final_gal,
        galones: entrada.tanda_final_gal, // spec §6: galones = tanda_final, valor operativo
        llegada_gal: null,
        lectura_equipo: entrada.lectura_equipo ?? null,
        tipo_lectura: contexto.validacion.equipo.tipoMedidor, // copia al momento (spec §6)
        iniciada_en: entrada.iniciada_en,
        finalizada_en: entrada.finalizada_en,
        lat: entrada.lat ?? null,
        lng: entrada.lng ?? null,
        precision_gps_m: entrada.precision_gps_m ?? null,
        dentro_geocerca: derivarDentroGeocerca(veredicto),
        origen: entrada.origen,
        estado: veredicto.estado,
        banderas: veredicto.banderas,
        gal_no_registrados: veredicto.galNoRegistrados,
        notas: entrada.notas ?? null,
        device_id: entrada.device_id ?? null,
        version_app: entrada.version_app ?? null,
      },
      armarFotos(entrada.id, entrada),
    );

    // 6. Contexto para el evento de observabilidad (DEC-012) y respuesta:
    //    el veredicto del servidor, que es la autoridad.
    solicitud.observable.resultado = "registrada";
    solicitud.observable.clienteId = contexto.clienteId;
    solicitud.observable.sedeId = contexto.sedeId;
    solicitud.observable.banderas = veredicto.banderas;

    return respuesta.status(201).send({
      id: entrada.id,
      estado: veredicto.estado,
      banderas: veredicto.banderas,
      galones: entrada.tanda_final_gal,
      gal_no_registrados: veredicto.galNoRegistrados,
      exige_nota: veredicto.exigeNota,
      bloquea_avance: veredicto.bloqueaAvance,
      bloquea_cierre: veredicto.bloqueaCierre,
    });
  }

  /* ============ Perfil carga_inventario (Sacyr) ============ */

  async function manejarCargaInventario(solicitud: FastifyRequest, respuesta: FastifyReply) {
    // 1. Validación estructural del contrato del perfil.
    const analisis = esquemaCargaInventarioEntrante.safeParse(solicitud.body);
    if (!analisis.success) return responderInvalido(solicitud, respuesta, analisis.error.issues);
    const entrada = analisis.data;

    // 2. Idempotencia (idéntica al otro perfil).
    const existente = await repositorio.buscarCargaPorId(entrada.id);
    if (existente) return responderIdempotente(solicitud, respuesta, existente);

    // 3. Contexto: sin dispensador, la sede es la de la sesión del
    //    dispositivo. El tenant sigue sin venir del cuerpo.
    const sesion = solicitud.sesion!;
    if (sesion.sedeId === null || sesion.clienteId === null) {
      solicitud.observable.resultado = "sin_alcance_de_sede";
      return respuesta.status(403).send({ error: "SIN_ALCANCE_DE_SEDE" });
    }
    const contexto = await repositorio.obtenerContextoInventario({
      sedeId: sesion.sedeId,
      equipoId: entrada.equipo_id,
      conductorId: entrada.conductor_id,
    });
    if (contexto === null) {
      solicitud.observable.resultado = "referencia_no_encontrada";
      return respuesta.status(404).send({
        error: "REFERENCIA_NO_ENCONTRADA",
        detalle: "equipo o conductor inexistente, inactivo o de otro cliente",
      });
    }
    if (contexto.clienteId !== sesion.clienteId) {
      solicitud.observable.resultado = "fuera_de_alcance";
      return respuesta.status(403).send({ error: "FUERA_DE_ALCANCE" });
    }

    // 4. La única decisión de negocio: el registro de perfiles del dominio.
    const registro: RegistroCargaInventario = {
      llegadaGal: entrada.llegada_gal,
      despachadosGal: entrada.despachados_gal,
      iniciadaEn: entrada.iniciada_en,
      finalizadaEn: entrada.finalizada_en,
      lat: entrada.lat ?? null,
      lng: entrada.lng ?? null,
      origen: entrada.origen,
      fotoInicial: Boolean(entrada.foto_inicial_path),
      fotoFinal: Boolean(entrada.foto_final_path),
    };
    const veredicto = validarSegunPerfil({
      perfil: "carga_inventario",
      registro,
      contexto: contexto.validacion,
    });

    // 5. Persistencia. inventario_final_gal NO se inserta: es columna
    //    generada — la base garantiza llegada + despachados.
    await repositorio.insertarCarga(
      {
        id: entrada.id,
        perfil_codigo: "carga_inventario",
        cliente_id: contexto.clienteId,
        sede_id: contexto.sedeId,
        dispensador_id: null,
        equipo_id: entrada.equipo_id,
        conductor_id: entrada.conductor_id,
        tanda_inicial_gal: null,
        tot_inicial_gal: null,
        tanda_final_gal: null,
        tot_final_gal: null,
        galones: entrada.despachados_gal, // galones despachados por Lubryco (DEC-016)
        llegada_gal: entrada.llegada_gal,
        lectura_equipo: null,
        tipo_lectura: null,
        iniciada_en: entrada.iniciada_en,
        finalizada_en: entrada.finalizada_en,
        lat: entrada.lat ?? null,
        lng: entrada.lng ?? null,
        precision_gps_m: entrada.precision_gps_m ?? null,
        dentro_geocerca: derivarDentroGeocerca(veredicto),
        origen: entrada.origen,
        estado: veredicto.estado,
        banderas: veredicto.banderas,
        gal_no_registrados: null,
        notas: entrada.notas ?? null,
        device_id: entrada.device_id ?? null,
        version_app: entrada.version_app ?? null,
      },
      armarFotos(entrada.id, entrada),
    );

    solicitud.observable.resultado = "registrada";
    solicitud.observable.clienteId = contexto.clienteId;
    solicitud.observable.sedeId = contexto.sedeId;
    solicitud.observable.banderas = veredicto.banderas;

    return respuesta.status(201).send({
      id: entrada.id,
      estado: veredicto.estado,
      banderas: veredicto.banderas,
      galones: entrada.despachados_gal,
      llegada_gal: entrada.llegada_gal,
      inventario_final_gal: veredicto.inventarioFinalGal,
      gal_no_registrados: null,
      exige_nota: veredicto.exigeNota,
      bloquea_avance: veredicto.bloqueaAvance,
      bloquea_cierre: veredicto.bloqueaCierre,
    });
  }
}
