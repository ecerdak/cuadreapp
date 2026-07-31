// Construcción de la aplicación Fastify con sus dependencias
// inyectadas. Separada del servidor para que las pruebas la levanten
// con un repositorio en memoria, sin red ni base de datos.

import fastify, { type FastifyInstance } from "fastify";
import { registrarRutaCargas } from "./rutas/cargas.js";
import type { RepositorioCargas } from "./repositorio/tipos.js";

export interface Dependencias {
  repositorio: RepositorioCargas;
}

export function construirAplicacion(dependencias: Dependencias): FastifyInstance {
  const app = fastify();

  app.get("/salud", async () => ({ ok: true }));

  registrarRutaCargas(app, dependencias.repositorio);

  return app;
}
