// Subida de evidencia fotográfica (Etapa S, decisión aprobada: a
// través de la API, nunca directo a Storage). Las fotos suben ANTES
// que el registro (spec §10.3), así que no se exige que la carga
// exista: la ruta en Storage la decide la API con el alcance de la
// sesión — el cliente no elige dónde escribe. El bucket es privado.

import type { FastifyInstance } from "fastify";
import type { AlmacenFotos } from "../seguridad/tipos.js";
import { exigirPermiso, type PreManejador } from "../seguridad/autenticacion.js";

const BYTES_MAXIMOS = 2 * 1024 * 1024; // 2 MB: una foto comprimida pesa 60-90 KB
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function registrarRutaFotos(
  app: FastifyInstance,
  dependencias: { almacen: AlmacenFotos; autenticar: PreManejador },
): void {
  app.addContentTypeParser("image/webp", { parseAs: "buffer" }, (_solicitud, cuerpo, listo) =>
    listo(null, cuerpo),
  );

  app.post(
    "/api/v1/cargas/:cargaId/fotos/:momento",
    { preHandler: [dependencias.autenticar, exigirPermiso("cargas.subir_foto")] },
    async (solicitud, respuesta) => {
      const { cargaId, momento } = solicitud.params as { cargaId: string; momento: string };
      if (!UUID.test(cargaId) || (momento !== "inicial" && momento !== "final")) {
        solicitud.observable.resultado = "invalido";
        return respuesta.status(400).send({ error: "VALIDACION_ESTRUCTURAL" });
      }

      const bytes = solicitud.body;
      if (!Buffer.isBuffer(bytes) || bytes.length === 0 || bytes.length > BYTES_MAXIMOS) {
        solicitud.observable.resultado = "invalido";
        return respuesta.status(400).send({ error: "FOTO_INVALIDA", detalle: "se espera image/webp de hasta 2 MB" });
      }

      const sesion = solicitud.sesion!;
      if (sesion.clienteId === null) {
        solicitud.observable.resultado = "sin_alcance_de_sede";
        return respuesta.status(403).send({ error: "SIN_ALCANCE_DE_SEDE" });
      }

      // La API decide la ruta: aislada por cliente, nunca elegida por el cliente HTTP.
      const ruta = `${sesion.clienteId}/cargas/${cargaId}/${momento}.webp`;
      await dependencias.almacen.guardar(ruta, new Uint8Array(bytes), "image/webp");

      solicitud.observable.resultado = "foto_guardada";
      return respuesta.status(201).send({ storage_path: ruta });
    },
  );
}
