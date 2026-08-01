// Catálogo inicial de la sede (Etapa S): equipos, conductores,
// dispensadores y sede, con el alcance de la sesión — nunca el que
// pida el cliente. Los conductores incluyen pin_hash para la
// verificación offline en el dispositivo (el PIN identifica, no
// protege — spec §5).

import type { FastifyInstance } from "fastify";
import type { RepositorioSeguridad } from "../repositorio/tipos.js";
import { exigirPermiso, type PreManejador } from "../seguridad/autenticacion.js";

export function registrarRutaCatalogo(
  app: FastifyInstance,
  dependencias: { repositorioSeguridad: RepositorioSeguridad; autenticar: PreManejador },
): void {
  app.get(
    "/api/v1/catalogo",
    { preHandler: [dependencias.autenticar, exigirPermiso("catalogo.leer")] },
    async (solicitud, respuesta) => {
      const sesion = solicitud.sesion!;
      if (sesion.clienteId === null) {
        // comercial_lubryco no tiene catálogo de sede: su vista es agregada.
        solicitud.observable.resultado = "sin_alcance_de_sede";
        return respuesta.status(403).send({ error: "SIN_ALCANCE_DE_SEDE" });
      }

      const catalogo = await dependencias.repositorioSeguridad.obtenerCatalogo(
        sesion.clienteId,
        sesion.sedeId,
      );
      if (!catalogo) {
        solicitud.observable.resultado = "catalogo_no_encontrado";
        return respuesta.status(404).send({ error: "CATALOGO_NO_ENCONTRADO" });
      }

      solicitud.observable.resultado = "catalogo";
      return respuesta.status(200).send(catalogo);
    },
  );
}
