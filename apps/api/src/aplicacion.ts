// Construcción de la aplicación Fastify con sus dependencias
// inyectadas. Separada del servidor para que las pruebas la levanten
// con fakes (repositorios, proveedor de identidad, almacén de fotos),
// sin red ni base de datos.

import fastify, { type FastifyInstance } from "fastify";
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
}

export function construirAplicacion(dependencias: Dependencias): FastifyInstance {
  const app = fastify();

  registrarObservabilidad(app, dependencias.emitirEvento);

  // Único endpoint sin autenticación además de los de auth (DEC-013).
  app.get("/salud", async () => ({ ok: true }));

  const autenticar = crearAutenticacion({
    secretoJwt: dependencias.secretoJwt,
    repositorio: dependencias.repositorioSeguridad,
  });

  registrarRutasAuth(app, { proveedor: dependencias.proveedorIdentidad, autenticar });
  registrarRutaEnrolamiento(app, {
    proveedor: dependencias.proveedorIdentidad,
    repositorioSeguridad: dependencias.repositorioSeguridad,
  });
  registrarRutaCatalogo(app, { repositorioSeguridad: dependencias.repositorioSeguridad, autenticar });
  registrarRutaFotos(app, { almacen: dependencias.almacenFotos, autenticar });
  registrarRutaCargas(app, dependencias.repositorio, autenticar);

  return app;
}
