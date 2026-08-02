// Subida de evidencia fotográfica (Etapa S, decisión aprobada: a
// través de la API, nunca directo a Storage). Las fotos suben ANTES
// que el registro (spec §10.3), así que no se exige que la carga
// exista: la ruta en Storage la decide la API con el alcance de la
// sesión — el cliente no elige dónde escribe. El bucket es privado.
//
// RC1-A1: además de webp se aceptan jpeg y png — Safari/iOS no exporta
// WebP desde canvas y browser-image-compression degrada al formato que
// el dispositivo sí soporta. La extensión del objeto sigue al tipo real.

import type { FastifyInstance } from "fastify";
import type { AlmacenFotos } from "../seguridad/tipos.js";
import { exigirPermiso, type PreManejador } from "../seguridad/autenticacion.js";

// RC1-A4: el bodyLimit de la ruta honra el mismo contrato (Fastify por
// defecto corta en 1 MiB, por debajo de lo que este endpoint promete).
const BYTES_MAXIMOS = 2 * 1024 * 1024; // 2 MiB: una foto comprimida pesa 60-90 KB
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EXTENSION_POR_TIPO: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export function registrarRutaFotos(
  app: FastifyInstance,
  dependencias: { almacen: AlmacenFotos; autenticar: PreManejador },
): void {
  for (const tipo of Object.keys(EXTENSION_POR_TIPO)) {
    app.addContentTypeParser(tipo, { parseAs: "buffer" }, (_solicitud, cuerpo, listo) =>
      listo(null, cuerpo),
    );
  }

  app.post(
    "/api/v1/cargas/:cargaId/fotos/:momento",
    {
      preHandler: [dependencias.autenticar, exigirPermiso("cargas.subir_foto")],
      bodyLimit: BYTES_MAXIMOS,
    },
    async (solicitud, respuesta) => {
      const { cargaId, momento } = solicitud.params as { cargaId: string; momento: string };
      if (!UUID.test(cargaId) || (momento !== "inicial" && momento !== "final")) {
        solicitud.observable.resultado = "invalido";
        return respuesta.status(400).send({ error: "VALIDACION_ESTRUCTURAL" });
      }

      const tipo = String(solicitud.headers["content-type"] ?? "");
      const extension = EXTENSION_POR_TIPO[tipo];
      const bytes = solicitud.body;
      if (!extension || !Buffer.isBuffer(bytes) || bytes.length === 0) {
        solicitud.observable.resultado = "invalido";
        return respuesta
          .status(400)
          .send({ error: "FOTO_INVALIDA", detalle: "se espera webp, jpeg o png de hasta 2 MB" });
      }

      const sesion = solicitud.sesion!;
      if (sesion.clienteId === null) {
        solicitud.observable.resultado = "sin_alcance_de_sede";
        return respuesta.status(403).send({ error: "SIN_ALCANCE_DE_SEDE" });
      }

      // La API decide la ruta: aislada por cliente, nunca elegida por el cliente HTTP.
      const ruta = `${sesion.clienteId}/cargas/${cargaId}/${momento}.${extension}`;
      await dependencias.almacen.guardar(ruta, new Uint8Array(bytes), tipo);

      solicitud.observable.resultado = "foto_guardada";
      return respuesta.status(201).send({ storage_path: ruta });
    },
  );
}
