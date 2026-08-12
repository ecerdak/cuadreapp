// Construcción de la aplicación Fastify con sus dependencias
// inyectadas. Separada del servidor para que las pruebas la levanten
// con fakes (repositorios, proveedor de identidad, almacén de fotos),
// sin red ni base de datos.

import fastify, { type FastifyError, type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import limitador from "@fastify/rate-limit";
import { registrarRutaCargas } from "./rutas/cargas.js";
import { registrarRutasAuth } from "./rutas/auth.js";
import { registrarRutaEnrolamiento } from "./rutas/dispositivos.js";
import { registrarRutaCatalogo } from "./rutas/catalogo.js";
import { registrarRutaFotos } from "./rutas/fotos.js";
import { registrarRutasAdmin } from "./rutas/admin.js";
import { registrarRutasTablero } from "./rutas/tablero.js";
import { registrarObservabilidad, type EmisorEventos } from "./observabilidad.js";
import { crearAutenticacion } from "./seguridad/autenticacion.js";
import type { JWTVerifyGetKey } from "jose";
import type { AlmacenFotos, ProveedorIdentidad } from "./seguridad/tipos.js";
import type { RepositorioCargas, RepositorioSeguridad } from "./repositorio/tipos.js";
import type { RepositorioAdmin } from "./repositorio/admin.js";
import type { RepositorioTablero } from "./repositorio/tablero.js";

export interface Dependencias {
  repositorio: RepositorioCargas;
  repositorioSeguridad: RepositorioSeguridad;
  /** Consola administrativa (piloto Sacyr). Opcional: sin él, /admin no existe. */
  repositorioAdmin?: RepositorioAdmin;
  /** Dashboard de Cliente (Etapa P.2). Opcional: sin él, /tablero no existe. */
  repositorioTablero?: RepositorioTablero;
  proveedorIdentidad: ProveedorIdentidad;
  almacenFotos: AlmacenFotos;
  /** Bucket privado de logos de clientes (DEC-017). Sin él, el logo
   *  del catálogo/admin queda en null (fallback a iniciales). */
  almacenLogos?: AlmacenFotos;
  /** Secreto HS256 del proyecto de Supabase para verificar los JWT localmente. */
  secretoJwt: string;
  /** JWKS del proyecto: obligatorio con proyectos que firman ES256/RS256. */
  jwks?: JWTVerifyGetKey;
  /** DEC-012: destino de los eventos de observabilidad. Por defecto, stdout estructurado. */
  emitirEvento?: EmisorEventos;
  /** Readiness (Etapa H): estado de las dependencias externas. Sin verificador, /listo responde 200 básico. */
  verificarListo?: () => Promise<Record<string, boolean>>;
  /** Etapa H: apagable solo en pruebas que no ejercitan límites. */
  limites?: boolean;
  /** CORS (cierre de infraestructura): orígenes de navegador permitidos.
   *  Sin lista explícita, se permiten los dominios *.up.railway.app
   *  (los frontends del proyecto). Nunca "*": la API lleva Bearer. */
  origenesCors?: string[];
  /** P0.1: URL de la pantalla /restablecer del Dashboard, destino del
   *  enlace del correo de recuperación. Sin ella decide la Site URL de
   *  Supabase. */
  urlRestablecerPassword?: string;
}

export function construirAplicacion(dependencias: Dependencias): FastifyInstance {
  const app = fastify();

  // CORS: la PWA y el Dashboard viven en orígenes distintos al de la
  // API; sin esto, el navegador bloquea toda llamada (el preflight con
  // Authorization ni siquiera llegaba a una ruta). Allowlist explícita
  // o el patrón de los dominios del proyecto — jamás "*".
  const permitidos = dependencias.origenesCors;
  app.register(cors, {
    origin: (origen, listo) => {
      if (!origen) return listo(null, false); // sin Origin (curl/salud): sin headers CORS
      const ok = permitidos
        ? permitidos.includes(origen)
        : /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/.test(origen);
      listo(null, ok);
    },
    // PATCH/PUT/DELETE: la consola admin edita catálogos y administra
    // el logo del cliente (DEC-017) desde el navegador.
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization"],
    exposedHeaders: ["x-request-id"],
    maxAge: 86400,
  });

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
      jwks: dependencias.jwks,
    });

    registrarRutasAuth(rutas, {
      proveedor: dependencias.proveedorIdentidad,
      autenticar,
      repositorioSeguridad: dependencias.repositorioSeguridad,
      urlRestablecerPassword: dependencias.urlRestablecerPassword,
    });
    registrarRutaEnrolamiento(rutas, {
      proveedor: dependencias.proveedorIdentidad,
      repositorioSeguridad: dependencias.repositorioSeguridad,
    });
    registrarRutaCatalogo(rutas, {
      repositorioSeguridad: dependencias.repositorioSeguridad,
      almacenLogos: dependencias.almacenLogos ?? null,
      autenticar,
    });
    registrarRutaFotos(rutas, { almacen: dependencias.almacenFotos, autenticar });
    registrarRutaCargas(rutas, dependencias.repositorio, autenticar);
    if (dependencias.repositorioAdmin) {
      registrarRutasAdmin(rutas, {
        repositorio: dependencias.repositorioAdmin,
        almacenFotos: dependencias.almacenFotos,
        almacenLogos: dependencias.almacenLogos ?? null,
        proveedorIdentidad: dependencias.proveedorIdentidad,
        autenticar,
      });
    }
    if (dependencias.repositorioTablero) {
      registrarRutasTablero(rutas, {
        repositorio: dependencias.repositorioTablero,
        almacenFotos: dependencias.almacenFotos,
        almacenLogos: dependencias.almacenLogos ?? null,
        autenticar,
      });
    }
  });

  return app;
}
