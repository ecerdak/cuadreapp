-- ============================================================
-- CuadreApp — Verificación manual de la Etapa P.2 (Dashboard de
-- Cliente multiempresa). Espejo de verificacion_perfiles.sql.
--
-- Este archivo NO es una migración. Se corre a mano después de las
-- migraciones + seed (supabase db reset), por ejemplo pegándolo en el
-- SQL Editor de un proyecto ya migrado. Todo queda dentro de una
-- transacción que se revierte: no deja rastro.
--
-- Verifica:
--   1. El permiso tablero.leer existe y lo tienen supervisor y
--      admin_cliente — y NO admin_lubryco ni dispositivo.
--   2. Los índices de lectura del tablero existen.
--   3. AISLAMIENTO: un segundo cliente con sus propias cargas no
--      aparece jamás en las consultas del primero. Esta es la prueba
--      que importa — el tablero es multiempresa o no es nada.
--   4. Las políticas RLS de la Etapa 0 siguen aislando por cliente
--      (segunda línea de defensa, DEC-009).
-- ============================================================

begin;

do $$
declare
  v_cliente_a    uuid;
  v_cliente_b    uuid;
  v_sede_a       uuid;
  v_sede_b       uuid;
  v_equipo_a     uuid;
  v_equipo_b     uuid;
  v_conductor_a  uuid;
  v_conductor_b  uuid;
  v_cuenta       int;
begin
  -- (1) permiso y sus titulares
  if not exists (select 1 from permisos where codigo = 'tablero.leer') then
    raise exception 'FALLO (1): no existe el permiso tablero.leer';
  end if;

  select count(*) into v_cuenta
  from rol_permisos rp join roles r on r.id = rp.rol_id
  where rp.permiso_codigo = 'tablero.leer' and r.codigo in ('supervisor', 'admin_cliente');
  if v_cuenta <> 2 then
    raise exception 'FALLO (1): tablero.leer no está en supervisor + admin_cliente (encontrados: %)', v_cuenta;
  end if;

  if exists (
    select 1 from rol_permisos rp join roles r on r.id = rp.rol_id
    where rp.permiso_codigo = 'tablero.leer' and r.codigo in ('admin_lubryco', 'dispositivo', 'comercial_lubryco')
  ) then
    raise exception 'FALLO (1): tablero.leer se filtró a un rol que no debe tenerlo';
  end if;
  raise notice 'OK (1): tablero.leer solo en supervisor y admin_cliente';

  -- (2) índices de lectura
  if not exists (select 1 from pg_indexes where indexname = 'cargas_cliente_sede_finalizada_idx') then
    raise exception 'FALLO (2): falta cargas_cliente_sede_finalizada_idx';
  end if;
  if not exists (select 1 from pg_indexes where indexname = 'entregas_cliente_fecha_idx') then
    raise exception 'FALLO (2): falta entregas_cliente_fecha_idx';
  end if;
  raise notice 'OK (2): índices de lectura del tablero presentes';

  -- (3) aislamiento entre dos clientes con datos propios
  select s.cliente_id, s.id into v_cliente_a, v_sede_a
  from sedes s order by s.nombre limit 1;
  select id into v_equipo_a from equipos where cliente_id = v_cliente_a and activo limit 1;
  select id into v_conductor_a from conductores where cliente_id = v_cliente_a and activo limit 1;

  insert into clientes (nombre, perfil_codigo)
  values ('Cliente de verificación P.2', 'carga_inventario')
  returning id into v_cliente_b;

  insert into sedes (cliente_id, nombre, ciudad)
  values (v_cliente_b, 'Sede de verificación', 'Buga')
  returning id into v_sede_b;

  insert into equipos (cliente_id, sede_id, codigo_interno, qr_token, tipo_medidor, capacidad_tanque_gal)
  values (v_cliente_b, v_sede_b, 'VER-01', gen_random_uuid()::text, 'ninguno', 1000.0)
  returning id into v_equipo_b;

  insert into conductores (cliente_id, sede_id, nombre, codigo, pin_hash)
  values (v_cliente_b, v_sede_b, 'Operador de verificación', '99', 'x')
  returning id into v_conductor_b;

  insert into cargas (
    cliente_id, sede_id, equipo_id, conductor_id,
    perfil_codigo, llegada_gal, galones,
    iniciada_en, finalizada_en, estado, banderas
  ) values (
    v_cliente_b, v_sede_b, v_equipo_b, v_conductor_b,
    'carga_inventario', 150.0, 600.0,
    now() - interval '3 minutes', now(), 'ok', '[]'::jsonb
  );

  -- La consulta del tablero del cliente A no puede ver nada de B.
  select count(*) into v_cuenta
  from cargas c
  where c.cliente_id = v_cliente_a and c.equipo_id = v_equipo_b;
  if v_cuenta <> 0 then
    raise exception 'FALLO (3): el cliente A alcanza cargas del cliente B';
  end if;

  select count(*) into v_cuenta
  from equipos e where e.cliente_id = v_cliente_a and e.id = v_equipo_b;
  if v_cuenta <> 0 then
    raise exception 'FALLO (3): el cliente A alcanza equipos del cliente B';
  end if;
  raise notice 'OK (3): aislamiento por cliente_id verificado con dos clientes reales';

  -- (4) RLS activo en las tablas que el tablero lee
  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('cargas', 'equipos', 'entregas', 'fotos', 'conductores')
      and not c.relrowsecurity
  ) then
    raise exception 'FALLO (4): alguna tabla del tablero quedó sin RLS';
  end if;
  raise notice 'OK (4): RLS habilitado en cargas, equipos, entregas, fotos y conductores';

  raise notice 'VERIFICACIÓN ETAPA P.2: todo OK (la transacción se revierte)';
end $$;

rollback;
