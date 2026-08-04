// Punto de entrada real (Railway). Composición: configuración validada
// + pool de Postgres + repositorios + adaptadores de Supabase +
// aplicación, con readiness real y apagado ordenado.

import pg from "pg";
import { createRemoteJWKSet } from "jose";
import { cargarConfiguracion } from "./config.js";
import { registrar } from "./registro.js";
import { construirAplicacion } from "./aplicacion.js";
import { RepositorioCargasPostgres, RepositorioSeguridadPostgres } from "./repositorio/postgres.js";
import { RepositorioAdminPostgres } from "./repositorio/admin-postgres.js";
import { AlmacenFotosSupabase, ProveedorIdentidadSupabase } from "./seguridad/supabase.js";

let config;
try {
  config = cargarConfiguracion();
} catch (error) {
  registrar("error", "La API no puede arrancar", { detalle: String(error) });
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: config.DATABASE_URL });
const configSupabase = {
  url: config.SUPABASE_URL,
  claveAnon: config.SUPABASE_ANON_KEY,
  claveServiceRole: config.SUPABASE_SERVICE_ROLE_KEY,
};

const app = construirAplicacion({
  repositorio: new RepositorioCargasPostgres(pool),
  repositorioSeguridad: new RepositorioSeguridadPostgres(pool),
  repositorioAdmin: new RepositorioAdminPostgres(pool),
  proveedorIdentidad: new ProveedorIdentidadSupabase(configSupabase),
  almacenFotos: new AlmacenFotosSupabase(configSupabase, config.BUCKET_FOTOS),
  almacenLogos: new AlmacenFotosSupabase(configSupabase, config.BUCKET_LOGOS),
  secretoJwt: config.SUPABASE_JWT_SECRET,
  jwks: createRemoteJWKSet(new URL(`${config.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)),
  origenesCors: config.CORS_ORIGENES?.split(",").map((origen) => origen.trim()),
  verificarListo: async () => {
    try {
      await pool.query("select 1");
      return { baseDatos: true };
    } catch {
      return { baseDatos: false };
    }
  },
});

app
  .listen({ port: config.PORT, host: "0.0.0.0" })
  .then((direccion) => {
    registrar("info", "API de CuadreApp escuchando", { direccion });
  })
  .catch((error) => {
    registrar("error", "No se pudo iniciar la API", { detalle: String(error) });
    process.exit(1);
  });

// Apagado ordenado (Railway envía SIGTERM en cada despliegue): se dejan
// terminar las peticiones en vuelo y se cierra el pool.
for (const senal of ["SIGTERM", "SIGINT"] as const) {
  process.on(senal, () => {
    registrar("info", "Apagando la API", { senal });
    void app
      .close()
      .then(() => pool.end())
      .then(() => process.exit(0));
  });
}
