// Punto de entrada real (Railway). Composición: pool de Postgres +
// repositorios + proveedor de identidad y almacén de fotos de Supabase
// + aplicación.

import pg from "pg";
import { construirAplicacion } from "./aplicacion.js";
import { RepositorioCargasPostgres, RepositorioSeguridadPostgres } from "./repositorio/postgres.js";
import { AlmacenFotosSupabase, ProveedorIdentidadSupabase } from "./seguridad/supabase.js";

const requeridas = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
] as const;

const faltantes = requeridas.filter((nombre) => !process.env[nombre]);
if (faltantes.length > 0) {
  console.error(`Faltan variables de entorno: ${faltantes.join(", ")}`);
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const configSupabase = {
  url: process.env.SUPABASE_URL!,
  claveAnon: process.env.SUPABASE_ANON_KEY!,
  claveServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};

const app = construirAplicacion({
  repositorio: new RepositorioCargasPostgres(pool),
  repositorioSeguridad: new RepositorioSeguridadPostgres(pool),
  proveedorIdentidad: new ProveedorIdentidadSupabase(configSupabase),
  almacenFotos: new AlmacenFotosSupabase(configSupabase, process.env.BUCKET_FOTOS ?? "fotos-cargas"),
  secretoJwt: process.env.SUPABASE_JWT_SECRET!,
});

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
