-- ============================================================
-- CuadreApp — Verificación manual de la Etapa P (Perfiles
-- Operativos, DEC-016). Espejo de verificacion_etapa0.sql.
--
-- Este archivo NO es una migración. Se corre a mano después de las
-- migraciones + seed (supabase db reset), por ejemplo pegándolo en el
-- SQL Editor de un proyecto ya migrado. Todo queda dentro de una
-- transacción que se revierte: no deja rastro.
--
-- Verifica:
--   1. El catálogo tiene los dos perfiles sembrados.
--   2. Una carga carga_inventario con llegada 150.0 y galones 600.0
--      produce inventario_final_gal = 750.0 (columna generada).
--   3. El CHECK cargas_forma_por_perfil rechaza formas inválidas.
--   4. El trigger de tot_actual_gal no toca dispensadores en cargas
--      sin dispensador.
--   5. La historia existente quedó con perfil medidor_doble.
-- ============================================================

begin;

do $$
declare
  v_cliente_id   uuid;
  v_sede_id      uuid;
  v_equipo_id    uuid;
  v_conductor_id uuid;
  v_carga_id     uuid;
  v_inventario   numeric(7,1);
  v_tot_antes    numeric(10,1);
  v_tot_despues  numeric(10,1);
  v_rechazada    boolean := false;
begin
  -- (1) catálogo
  if (select count(*) from perfiles_operativos
      where codigo in ('medidor_doble', 'carga_inventario')) <> 2 then
    raise exception 'FALLO (1): faltan perfiles en el catálogo';
  end if;
  raise notice 'OK (1): catálogo con medidor_doble y carga_inventario';

  select s.cliente_id, s.id into v_cliente_id, v_sede_id
  from sedes s where s.nombre = 'Planta Buga';
  select id into v_equipo_id from equipos where codigo_interno = 'T-04';
  select id into v_conductor_id from conductores where codigo = '07';
  select tot_actual_gal into v_tot_antes
  from dispensadores where nombre = 'Isla 1';

  -- (2) el ejemplo aprobado: llegó con 150, se despacharon 600 → 750
  insert into cargas (
    cliente_id, sede_id, equipo_id, conductor_id,
    perfil_codigo, llegada_gal, galones,
    iniciada_en, finalizada_en, estado, banderas
  ) values (
    v_cliente_id, v_sede_id, v_equipo_id, v_conductor_id,
    'carga_inventario', 150.0, 600.0,
    now() - interval '3 minutes', now(), 'ok', '[]'::jsonb
  ) returning id, inventario_final_gal into v_carga_id, v_inventario;

  if v_inventario <> 750.0 then
    raise exception 'FALLO (2): inventario_final_gal = %, se esperaba 750.0', v_inventario;
  end if;
  raise notice 'OK (2): 150.0 + 600.0 = % (columna generada)', v_inventario;

  -- (3a) una carga_inventario CON tanda debe ser rechazada
  begin
    insert into cargas (
      cliente_id, sede_id, equipo_id, conductor_id,
      perfil_codigo, llegada_gal, galones, tanda_final_gal,
      iniciada_en, finalizada_en, estado, banderas
    ) values (
      v_cliente_id, v_sede_id, v_equipo_id, v_conductor_id,
      'carga_inventario', 10.0, 20.0, 20.0,
      now(), now(), 'ok', '[]'::jsonb
    );
  exception when check_violation then
    v_rechazada := true;
  end;
  if not v_rechazada then
    raise exception 'FALLO (3a): el CHECK aceptó carga_inventario con tanda';
  end if;
  raise notice 'OK (3a): CHECK rechaza carga_inventario con campos de medidor';

  -- (3b) una medidor_doble SIN totalizadores debe ser rechazada
  v_rechazada := false;
  begin
    insert into cargas (
      cliente_id, sede_id, equipo_id, conductor_id,
      perfil_codigo, galones,
      iniciada_en, finalizada_en, estado, banderas
    ) values (
      v_cliente_id, v_sede_id, v_equipo_id, v_conductor_id,
      'medidor_doble', 20.0,
      now(), now(), 'ok', '[]'::jsonb
    );
  exception when check_violation then
    v_rechazada := true;
  end;
  if not v_rechazada then
    raise exception 'FALLO (3b): el CHECK aceptó medidor_doble incompleta';
  end if;
  raise notice 'OK (3b): CHECK rechaza medidor_doble sin lecturas';

  -- (4) el trigger no tocó el dispensador (la carga no tiene ninguno)
  select tot_actual_gal into v_tot_despues
  from dispensadores where nombre = 'Isla 1';
  if v_tot_despues <> v_tot_antes then
    raise exception 'FALLO (4): el trigger modificó tot_actual_gal (% → %)',
      v_tot_antes, v_tot_despues;
  end if;
  raise notice 'OK (4): trigger intacto — tot_actual_gal sigue en %', v_tot_antes;

  -- (5) historia backfilled
  if exists (select 1 from cargas where perfil_codigo is null) then
    raise exception 'FALLO (5): hay cargas sin perfil_codigo';
  end if;
  raise notice 'OK (5): toda carga tiene perfil_codigo';

  raise notice 'VERIFICACIÓN ETAPA P: todo OK (la transacción se revierte)';
end $$;

rollback;
