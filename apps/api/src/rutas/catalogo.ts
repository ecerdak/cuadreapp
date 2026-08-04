// Catálogo inicial de la sede (Etapa S): identidad del cliente
// (DEC-017), perfil operativo (DEC-016), sede, equipos, conductores y
// dispensadores, con el alcance de la sesión — nunca el que pida el
// cliente. Los conductores incluyen pin_hash para la verificación
// offline en el dispositivo (el PIN identifica, no protege — spec §5).
//
// El logo viaja como URL firmada temporal (24 h): la clave del objeto
// jamás sale al cliente; la PWA descarga los bytes y los cachea para
// operar offline. Sin logo (o sin almacén configurado) va null — el
// cliente muestra el fallback de iniciales, nunca una imagen rota.

import type { FastifyInstance } from "fastify";
import type { RepositorioSeguridad } from "../repositorio/tipos.js";
import type { AlmacenFotos } from "../seguridad/tipos.js";
import { exigirPermiso, type PreManejador } from "../seguridad/autenticacion.js";

const SEGUNDOS_FIRMA_LOGO = 24 * 3600;

export function registrarRutaCatalogo(
  app: FastifyInstance,
  dependencias: {
    repositorioSeguridad: RepositorioSeguridad;
    almacenLogos: AlmacenFotos | null;
    autenticar: PreManejador;
  },
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

      const { logo_clave, ...cliente } = catalogo.cliente;
      const logoUrl =
        logo_clave && dependencias.almacenLogos
          ? await dependencias.almacenLogos.urlFirmada(logo_clave, SEGUNDOS_FIRMA_LOGO)
          : null;

      solicitud.observable.resultado = "catalogo";
      solicitud.observable.perfil = catalogo.perfil.codigo;
      return respuesta.status(200).send({
        ...catalogo,
        cliente: { ...cliente, logo_url: logoUrl },
      });
    },
  );
}
