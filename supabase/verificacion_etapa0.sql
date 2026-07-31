-- ============================================================
-- CuadreApp — Verificación manual del criterio de terminado de la
-- Etapa 0 (docs/PRODUCT_BIBLE.md §8):
--   "Un insert de carga desde SQL dispara triggers y actualiza
--   tot_actual_gal"
--
-- Este archivo NO es una migración: no se ejecuta automáticamente con
-- `supabase db reset` ni `supabase db push`. Se corre a mano, después
-- de que ya existan las migraciones + el seed, por ejemplo:
--
--   supabase start                 (requiere Docker)
--   supabase db reset               (aplica migraciones + seed.sql)
--   psql "$(supabase status -o env | grep DB_URL | cut -d= -f2)" \
--     -f supabase/verificacion_etapa0.sql
--
-- o pegando el contenido en el SQL Editor de un proyecto de Supabase
-- ya migrado.
--
-- Nota de honestidad: en este entorno de desarrollo no había ni
-- Docker ni un Postgres nativo disponibles para correr
-- `supabase start`, así que este script se escribió y se revisó a
-- mano con cuidado, pero NO se ejecutó. Correrlo es la verificación
-- real que falta antes de dar la Etapa 0 por completamente probada.
-- ============================================================

do $$
declare
  v_dispensador_id uuid;
  v_equipo_id      uuid;
  v_conductor_id   uuid;
  v_sede_id        uuid;
  v_cliente_id     uuid;
  v_tot_antes      numeric(10,1);
  v_tot_despues    numeric(10,1);
begin
  select d.id, d.sede_id, s.cliente_id, d.tot_actual_gal
    into v_dispensador_id, v_sede_id, v_cliente_id, v_tot_antes
  from dispensadores d
  join sedes s on s.id = d.sede_id
  where d.nombre = 'Isla 1';

  select id into v_equipo_id from equipos where codigo_interno = 'T-04';
  select id into v_conductor_id from conductores where codigo = '07';

  raise notice 'tot_actual_gal ANTES del insert: %', v_tot_antes;

  insert into cargas (
    cliente_id, sede_id, dispensador_id, equipo_id, conductor_id,
    tanda_inicial_gal, tot_inicial_gal, tanda_final_gal, tot_final_gal, galones,
    iniciada_en, finalizada_en, estado, banderas
  ) values (
    v_cliente_id, v_sede_id, v_dispensador_id, v_equipo_id, v_conductor_id,
    0.0, v_tot_antes, 42.5, v_tot_antes + 42.5, 42.5,
    now() - interval '3 minutes', now(), 'ok', '[]'::jsonb
  );

  select tot_actual_gal into v_tot_despues from dispensadores where id = v_dispensador_id;

  raise notice 'tot_actual_gal DESPUÉS del insert: %', v_tot_despues;

  assert v_tot_despues = v_tot_antes + 42.5,
    'FALLA: el trigger no actualizo tot_actual_gal como se esperaba';

  raise notice 'OK: el trigger actualizo tot_actual_gal correctamente (% -> %)', v_tot_antes, v_tot_despues;
end $$;
