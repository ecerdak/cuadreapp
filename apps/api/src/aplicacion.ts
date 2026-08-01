// Construcción de la aplicación Fastify con sus dependencias
// inyectadas. Separada del servidor para que las pruebas la levanten
// con fakes (repositorios, proveedor de identidad, almacén de fotos),
// sin red ni base de datos.

import fastify, { type FastifyError, type FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import limitador from "@fastify/rate-limit";
import { registrarRutaCargas } from "./rutas/cargas.js";
import { registrarRutasAuth } from "./rutas/auth.js";
import { registrarRutaEnrolamiento } from "./rutas/dispositivos.js";
import { registrarRutaCatalogo } from "./rutas/catalogo.js";
import { registrarRutaFotos } from "./rutas/fotos.js";
import { registrarObservabilidad, type EmisorEventos } from "./observabilidad.js";
import { crearAutenticacion } from "./seguridad/autenticacion.js";
import type { AlmacenFotos, ProveedorIdentidad } from "./seguridad/tipos.js";
import type { RepositorioCargas, RepositorioSeguridad } from "./repositorio/tipos.js";

export interface Dependencias {
  repositorio: RepositorioCargas;
  repositorioSeguridad: RepositorioSeguridad;
  proveedorIdentidad: ProveedorIdentidad;
  almacenFotos: AlmacenFotos;
  /** Secreto HS256 del proyecto de Supabase para verificar los JWT localmente. */
  secretoJwt: string;
  /** DEC-012: destino de los eventos de observabilidad. Por defecto, stdout estructurado. */
  emitirEvento?: EmisorEventos;
  /** Readiness (Etapa H): estado de las dependencias externas. Sin verificador, /listo responde 200 básico. */
  verificarListo?: () => Promise<Record<string, boolean>>;
  /** Etapa H: apagable solo en pruebas que no ejercitan límites. */
  limites?: boolean;
}

export function construirAplicacion(dependencias: Dependencias): FastifyInstance {
  const app = fastify();

  // Headers de seguridad (Etapa H). La API sirve JSON: sin CSP propia
  // (la CSP de la PWA vive en su hosting), sí todo lo demás de helmet.
  app.register(helmet, { contentSecurityPolicy: false });

  // Rate limiting (Etapa H): global desactivado; cada endpoint de
  // autenticación declara su límite — son la superficie de fuerza bruta.
  if (dependencias.limites !== false) {
    app.register(limitador, { global: false });
  }

  registrarObservabilidad(app, dependencias.emitirEvento);

  // Errores no controlados: trazados por la observabilidad, jamás se
  // filtra stack ni detalle interno al cliente (Etapa H).
  app.setErrorHandler((error: FastifyError, solicitud, respuesta) => {
    solicitud.observable.error = error.message;
    solicitud.observable.resultado = "error_interno";
    // 4xx generados por Fastify (p. ej. rate limit) conservan su código.
    const codigo = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
    return respuesta
      .status(codigo)
      .send(
        codigo === 500 ? { error: "ERROR_INTERNO" } : { error: error.code ?? "SOLICITUD_RECHAZADA" },
      );
  });

  // Liveness: el proceso responde. Sin dependencias externas.
  app.get("/salud", async () => ({ ok: true }));

  // Readiness: el proceso puede atender de verdad (base de datos, etc.).
  app.get("/listo", async (solicitud, respuesta) => {
    if (!dependencias.verificarListo) return respuesta.status(200).send({ listo: true });
    const estado = await dependencias.verificarListo();
    const listo = Object.values(estado).every(Boolean);
    solicitud.observable.resultado = listo ? "listo" : "no_listo";
    return respuesta.status(listo ? 200 : 503).send({ listo, dependencias: estado });
  });

  // Las rutas de la API viven en un scope hijo que se carga DESPUÉS de
  // los plugins: así el onRoute del rate-limiter sí las ve (Fastify
  // difiere la carga de plugins hasta ready).
  app.register(async (rutas) => {
    const autenticar = crearAutenticacion({
      secretoJwt: dependencias.secretoJwt,
      repositorio: dependencias.repositorioSeguridad,
    });

    registrarRutasAuth(rutas, { proveedor: dependencias.proveedorIdentidad, autenticar });
    registrarRutaEnrolamiento(rutas, {
      proveedor: dependencias.proveedorIdentidad,
      repositorioSeguridad: dependencias.repositorioSeguridad,
    });
    registrarRutaCatalogo(rutas, {
      repositorioSeguridad: dependencias.repositorioSeguridad,
      autenticar,
    });
    registrarRutaFotos(rutas, { almacen: dependencias.almacenFotos, autenticar });
    registrarRutaCargas(rutas, dependencias.repositorio, autenticar);
  });

  return app;
}
