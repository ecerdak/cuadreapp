// Pruebas E2E contra infraestructura REAL (Etapa H). No corren en CI
// normal ni en local sin credenciales: se activan solo con variables
// de entorno explícitas (ver docs/OPERACIONES.md).
//
//   E2E_DATABASE_URL      → bloque de base de datos (Postgres de Supabase
//                           con las migraciones y el seed aplicados)
//   + E2E_SUPABASE_URL, E2E_SUPABASE_ANON_KEY, E2E_SUPABASE_SERVICE_ROLE_KEY
//                         → bloque de identidad (GoTrue) y Storage
//
// Ejecutar: pnpm --filter @cuadreapp/api e2e
//
// LIMPIEZA OBLIGATORIA: este archivo corre contra la base REAL de
// producción. Toda fila que inserte debe borrarse al terminar y todo
// contador que mueva debe restituirse — una carga de prueba que
// sobreviva contamina la evidencia del cliente y, peor, deja el
// totalizador adelantado: la siguiente carga real dispararía un
// SALTO_TOTALIZADOR falso. El registro de limpieza vive en
// `aLimpiar` y se ejecuta siempre en el afterAll.

import { afterAll, describe, expect, it } from "vitest";
import pg from "pg";
import { RepositorioCargasPostgres, RepositorioSeguridadPostgres } from "../repositorio/postgres.js";
import { AlmacenFotosSupabase, ProveedorIdentidadSupabase } from "../seguridad/supabase.js";
import { validarCarga } from "@cuadreapp/dominio";

const URL_BD = process.env.E2E_DATABASE_URL;
const SUPABASE = {
  url: process.env.E2E_SUPABASE_URL,
  claveAnon: process.env.E2E_SUPABASE_ANON_KEY,
  claveServiceRole: process.env.E2E_SUPABASE_SERVICE_ROLE_KEY,
};
const haySupabase = Boolean(SUPABASE.url && SUPABASE.claveAnon && SUPABASE.claveServiceRole);

const pool = URL_BD ? new pg.Pool({ connectionString: URL_BD }) : null;

/** Acciones de limpieza que dejan la base como estaba. Se ejecutan
 *  todas, incluso si alguna falla (no se aborta la limpieza a medias). */
const aLimpiar: Array<() => Promise<void>> = [];

afterAll(async () => {
  for (const limpiar of aLimpiar.reverse()) {
    try {
      await limpiar();
    } catch (error) {
      console.error("E2E: fallo limpiando", error);
      process.exitCode = 1; // un E2E que ensucia producción NO es verde
    }
  }
  await pool?.end();
});

describe.runIf(Boolean(URL_BD))("E2E base de datos real (migraciones + seed aplicados)", () => {
  it("el criterio de la Etapa 0: insertar una carga avanza tot_actual_gal por trigger", async () => {
    const repo = new RepositorioCargasPostgres(pool!);

    // Correlacionada a propósito: dispensador, equipo y conductor DEBEN
    // ser del mismo cliente, que es justo lo que exige
    // obtenerContextoRegistro. Un producto cartesiano aquí elegiría un
    // dispensador de otro cliente en cuanto exista más de uno en la
    // base y la prueba fallaría de forma intermitente.
    const referencias = await pool!.query(
      `select d.id as dispensador_id, d.tot_actual_gal, e.id as equipo_id, c.id as conductor_id
       from dispensadores d
       join sedes s        on s.id = d.sede_id
       join equipos e      on e.cliente_id = s.cliente_id and e.codigo_interno = 'T-04' and e.activo
       join conductores c  on c.cliente_id = s.cliente_id and c.codigo = '07' and c.activo
       where d.activo
       order by d.nombre
       limit 1`,
    );
    expect(referencias.rows).toHaveLength(1);
    const fila = referencias.rows[0];
    const totAntes = Number(fila.tot_actual_gal);
    const id = crypto.randomUUID();

    // Registrada ANTES de insertar: si la prueba falla a mitad, la
    // limpieza corre igual.
    aLimpiar.push(async () => {
      await pool!.query(`delete from cargas where id = $1`, [id]);
      await pool!.query(`update dispensadores set tot_actual_gal = $2 where id = $1`, [
        fila.dispensador_id,
        totAntes,
      ]);
    });

    const contexto = await repo.obtenerContextoRegistro({
      dispensadorId: fila.dispensador_id,
      equipoId: fila.equipo_id,
      conductorId: fila.conductor_id,
    });
    expect(contexto).not.toBeNull();

    const veredicto = validarCarga(
      {
        tandaInicialGal: 0.0,
        totInicialGal: totAntes,
        tandaFinalGal: 10.5,
        totFinalGal: totAntes + 10.5,
        lecturaEquipo: null,
        iniciadaEn: new Date(Date.now() - 120_000).toISOString(),
        finalizadaEn: new Date().toISOString(),
        lat: null,
        lng: null,
        origen: "app",
        fotoInicial: true,
        fotoFinal: true,
      },
      contexto!.validacion,
    );

    await repo.insertarCarga(
      {
        id,
        perfil_codigo: "medidor_doble",
        llegada_gal: null,
        cliente_id: contexto!.clienteId,
        sede_id: contexto!.sedeId,
        dispensador_id: fila.dispensador_id,
        equipo_id: fila.equipo_id,
        conductor_id: fila.conductor_id,
        tanda_inicial_gal: 0.0,
        tot_inicial_gal: totAntes,
        tanda_final_gal: 10.5,
        tot_final_gal: totAntes + 10.5,
        galones: 10.5,
        lectura_equipo: null,
        tipo_lectura: "horometro",
        iniciada_en: new Date(Date.now() - 120_000).toISOString(),
        finalizada_en: new Date().toISOString(),
        lat: null,
        lng: null,
        precision_gps_m: null,
        dentro_geocerca: null,
        origen: "app",
        estado: veredicto.estado,
        banderas: veredicto.banderas,
        gal_no_registrados: veredicto.galNoRegistrados,
        notas: "carga E2E",
        device_id: "e2e",
        version_app: "e2e",
      },
      [{ carga_id: id, momento: "inicial", storage_path: `e2e/${id}/inicial.webp` }],
    );

    const despues = await pool!.query(`select tot_actual_gal from dispensadores where id = $1`, [
      fila.dispensador_id,
    ]);
    expect(Number(despues.rows[0].tot_actual_gal)).toBeCloseTo(totAntes + 10.5, 1);

    // Idempotencia del contrato: la carga existe y es recuperable.
    const persistida = await repo.buscarCargaPorId(id);
    expect(persistida?.galones).toBeCloseTo(10.5, 1);
  });

  it("el catálogo real sale con la forma que espera la PWA", async () => {
    const repoSeguridad = new RepositorioSeguridadPostgres(pool!);
    const cliente = await pool!.query(`select id from clientes limit 1`);
    const catalogo = await repoSeguridad.obtenerCatalogo(cliente.rows[0].id, null);
    expect(catalogo).not.toBeNull();
    expect(catalogo!.equipos.length).toBeGreaterThan(0);
    expect(catalogo!.conductores[0]).toHaveProperty("pin_hash");
  });
});

describe.runIf(haySupabase)("E2E identidad (GoTrue) y Storage reales", () => {
  const config = {
    url: SUPABASE.url!,
    claveAnon: SUPABASE.claveAnon!,
    claveServiceRole: SUPABASE.claveServiceRole!,
  };

  it("crea una identidad de dispositivo, la refresca y la cierra", async () => {
    const proveedor = new ProveedorIdentidadSupabase(config);
    const identidad = await proveedor.crearIdentidadDispositivo();
    expect(identidad).not.toBeNull();

    const renovados = await proveedor.refrescarSesion(identidad!.tokens.refresh_token);
    expect(renovados).not.toBeNull();
    expect(renovados!.access_token).not.toBe(identidad!.tokens.access_token);

    await proveedor.cerrarSesion(renovados!.access_token);
  });

  it("guarda un objeto en el bucket privado de fotos", async () => {
    const almacen = new AlmacenFotosSupabase(config, process.env.E2E_BUCKET_FOTOS ?? "fotos-cargas");
    await expect(
      almacen.guardar(`e2e/humo-${crypto.randomUUID()}.webp`, new Uint8Array([1, 2, 3]), "image/webp"),
    ).resolves.toBeUndefined();
  });
});

// Si no hay credenciales, la suite queda explícitamente en "skipped":
// jamás se confunde un entorno sin infraestructura con un E2E verde.
describe.runIf(!URL_BD)("E2E sin entorno", () => {
  it.skip("configura E2E_DATABASE_URL (y opcionalmente E2E_SUPABASE_*) para correr el E2E real", () => {});
});
