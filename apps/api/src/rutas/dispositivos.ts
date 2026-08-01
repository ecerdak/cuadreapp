// Enrolamiento de dispositivo (spec §5): el celular de planta se
// enrola UNA vez con un código de un solo uso atado a una sede, y el
// conductor nunca vuelve a ver una pantalla de login. El código es la
// credencial de este endpoint — por eso no exige token.

import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { ProveedorIdentidad } from "../seguridad/tipos.js";
import type { RepositorioSeguridad } from "../repositorio/tipos.js";

const esquemaEnrolar = z
  .object({
    codigo: z.string().min(6).max(64),
    nombre_dispositivo: z.string().max(120).nullable().optional(),
  })
  .strict();

export function registrarRutaEnrolamiento(
  app: FastifyInstance,
  dependencias: { proveedor: ProveedorIdentidad; repositorioSeguridad: RepositorioSeguridad },
): void {
  app.post("/api/v1/dispositivos/enrolar", async (solicitud, respuesta) => {
    const analisis = esquemaEnrolar.safeParse(solicitud.body);
    if (!analisis.success) {
      solicitud.observable.resultado = "invalido";
      return respuesta.status(400).send({ error: "VALIDACION_ESTRUCTURAL" });
    }

    const codigo = await dependencias.repositorioSeguridad.validarCodigoEnrolamiento(
      analisis.data.codigo,
      new Date(),
    );
    if (!codigo) {
      solicitud.observable.resultado = "codigo_invalido";
      return respuesta
        .status(401)
        .send({ error: "CODIGO_INVALIDO", detalle: "inexistente, vencido o ya usado" });
    }

    const identidad = await dependencias.proveedor.crearIdentidadDispositivo();
    if (!identidad) {
      solicitud.observable.resultado = "error_proveedor_identidad";
      return respuesta.status(502).send({ error: "PROVEEDOR_IDENTIDAD_NO_DISPONIBLE" });
    }

    await dependencias.repositorioSeguridad.registrarDispositivoEnrolado({
      usuarioId: identidad.usuarioId,
      codigoId: codigo.id,
      sedeId: codigo.sedeId,
      clienteId: codigo.clienteId,
      nombre: analisis.data.nombre_dispositivo ?? null,
    });

    solicitud.observable.resultado = "dispositivo_enrolado";
    solicitud.observable.clienteId = codigo.clienteId;
    solicitud.observable.sedeId = codigo.sedeId;
    return respuesta.status(201).send(identidad.tokens);
  });
}
