// Punto de entrada real (Railway). Composición: pool de Postgres +
// repositorio + aplicación. PORT lo inyecta Railway; DATABASE_URL es
// el pooler de Supabase.

import pg from "pg";
import { construirAplicacion } from "./aplicacion.js";
import { RepositorioCargasPostgres } from "./repositorio/postgres.js";

const urlBaseDatos = process.env.DATABASE_URL;
if (!urlBaseDatos) {
  console.error("Falta la variable de entorno DATABASE_URL");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: urlBaseDatos });
const app = construirAplicacion({ repositorio: new RepositorioCargasPostgres(pool) });

const puerto = Number(process.env.PORT ?? 3000);

app
  .listen({ port: puerto, host: "0.0.0.0" })
  .then((direccion) => {
    console.log(`API de CuadreApp escuchando en ${direccion}`);
  })
  .catch((error) => {
    console.error("No se pudo iniciar la API:", error);
    process.exit(1);
  });
