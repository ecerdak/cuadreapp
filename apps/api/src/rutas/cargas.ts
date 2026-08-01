// POST /api/v1/cargas — la única vía de escritura de cargas (DEC-009).
// Orquestación pura (DEC-011): validar forma, resolver contexto en la
// base, invocar el dominio, persistir y responder. Cero reglas de
// negocio propias.
//
// Principio del spec §7: NUNCA se bloquea un registro. Una carga
// inconsistente se persiste igual, con su estado y sus banderas — los
// campos bloquea_avance/bloquea_cierre de la respuesta son para que la
// UI actúe, no para que el servidor rechace.

import type { FastifyInstance } from "fastify";
import { validarCarga, type RegistroCarga } from "@cuadreapp/dominio";
import { esquemaCargaEntrante } from "../esquemas/carga.js";
import { exigirPermiso, type PreManejador } from "../seguridad/autenticacion.js";
import type { NuevaFoto, RepositorioCargas } from "../repositorio/tipos.js";

export function registrarRutaCargas(
  app: FastifyInstance,
  repositorio: RepositorioCargas,
  autenticar: PreManejador,
): void {
  app.post(
    "/api/v1/cargas",
    { preHandler: [autenticar, exigirPermiso("cargas.registrar")] },
    async (solicitud, respuesta) => {
      // 1. Validación estructural (forma y rangos; nada de negocio).
      const analisis = esquemaCargaEntrante.safeParse(solicitud.body);
      if (!analisis.success) {
        solicitud.observable.resultado = "invalido";
        return respuesta.status(400).send({
          error: "VALIDACION_ESTRUCTURAL",
          detalles: analisis.error.issues.map((problema) => ({
            campo: problema.path.join("."),
            mensaje: problema.message,
          })),
        });
      }
      const entrada = analisis.data;

      // 2. Idempotencia: la app genera el uuid; un reintento de la cola
      //    offline con el mismo id devuelve lo ya persistido (spec §10.4).
      const existente = await repositorio.buscarCargaPorId(entrada.id);
      if (existente) {
        solicitud.observable.resultado = "idempotente";
        return respuesta.status(200).send({
          id: existente.id,
          estado: existente.estado,
          banderas: existente.banderas,
          galones: existente.galones,
          gal_no_registrados: existente.galNoRegistrados,
          idempotente: true,
        });
      }

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

      // 4. La única decisión de negocio: el dominio.
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
      const veredicto = validarCarga(registro, contexto.validacion);

      // 5. Persistencia. dentro_geocerca se deriva del veredicto para la
      //    columna (SIN_GPS → desconocido), sin reinterpretar las reglas.
      const dentroGeocerca = veredicto.banderas.includes("SIN_GPS")
        ? null
        : !veredicto.banderas.includes("FUERA_DE_SEDE");

      const fotos: NuevaFoto[] = [];
      if (entrada.foto_inicial_path) {
        fotos.push({
          carga_id: entrada.id,
          momento: "inicial",
          storage_path: entrada.foto_inicial_path,
        });
      }
      if (entrada.foto_final_path) {
        fotos.push({ carga_id: entrada.id, momento: "final", storage_path: entrada.foto_final_path });
      }

      await repositorio.insertarCarga(
        {
          id: entrada.id,
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
          lectura_equipo: entrada.lectura_equipo ?? null,
          tipo_lectura: contexto.validacion.equipo.tipoMedidor, // copia al momento (spec §6)
          iniciada_en: entrada.iniciada_en,
          finalizada_en: entrada.finalizada_en,
          lat: entrada.lat ?? null,
          lng: entrada.lng ?? null,
          precision_gps_m: entrada.precision_gps_m ?? null,
          dentro_geocerca: dentroGeocerca,
          origen: entrada.origen,
          estado: veredicto.estado,
          banderas: veredicto.banderas,
          gal_no_registrados: veredicto.galNoRegistrados,
          notas: entrada.notas ?? null,
          device_id: entrada.device_id ?? null,
          version_app: entrada.version_app ?? null,
        },
        fotos,
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
    },
  );
}
