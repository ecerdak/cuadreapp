-- ============================================================
-- CuadreApp — RLS (Etapa 0)
--
-- Principios (docs/PRODUCT_BIBLE.md §6/§7):
--  - Aislamiento por cliente_id en todas las tablas.
--  - Privacidad no negociable: comercial_lubryco nunca ve el detalle
--    por conductor/equipo. Se logra por AUSENCIA de política en las
--    tablas de detalle (RLS deniega por defecto si ninguna política
--    aplica), no por una regla explícita que alguien pueda relajar.
--  - "El servidor es la autoridad": no hay políticas de INSERT/UPDATE
--    para `cargas` ni `auditoria`. Esas tablas solo se escriben desde
--    la API propia (Railway) con la service role, que ignora RLS.
--    Las políticas de escritura de `entregas` se diseñan en la Etapa 3
--    junto con su API — no se adivinan aquí.
-- ============================================================

-- Sin GRANT explícito, Supabase no expone tablas nuevas a los roles de
-- la Data API (anon/authenticated) por defecto. RLS sigue siendo la
-- restricción real fila por fila.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Para que las tablas que se agreguen en migraciones futuras (Etapa 1+)
-- no repitan este mismo olvido de GRANT.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;

-- ============ Funciones de apoyo para las políticas ============
-- security definer: leen `usuarios` sin quedar atrapadas por el propio
-- RLS de esa tabla (se ejecutan con el dueño de la función, que sí
-- puede leerla). Es la única puerta de entrada del RBAC propio a RLS.

create or replace function mi_cliente_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select cliente_id from usuarios where id = auth.uid() and activo;
$$;

create or replace function mi_sede_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select sede_id from usuarios where id = auth.uid() and activo;
$$;

create or replace function mi_rol()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select r.codigo
  from usuarios u
  join roles r on r.id = u.rol_id
  where u.id = auth.uid() and u.activo;
$$;

-- ============ roles ============
-- Catálogo sin datos sensibles: legible por cualquier sesión autenticada.
alter table roles enable row level security;

create policy roles_select on roles
  for select
  to authenticated
  using (true);

-- ============ clientes ============
alter table clientes enable row level security;

create policy clientes_select on clientes
  for select
  to authenticated
  using (id = mi_cliente_id() or mi_rol() = 'comercial_lubryco');

-- ============ sedes ============
alter table sedes enable row level security;

create policy sedes_select on sedes
  for select
  to authenticated
  using (cliente_id = mi_cliente_id());

-- ============ usuarios ============
alter table usuarios enable row level security;

create policy usuarios_select on usuarios
  for select
  to authenticated
  using (id = auth.uid() or cliente_id = mi_cliente_id());

-- ============ dispositivos ============
alter table dispositivos enable row level security;

create policy dispositivos_select on dispositivos
  for select
  to authenticated
  using (
    usuario_id = auth.uid()
    or sede_id in (select id from sedes where cliente_id = mi_cliente_id())
  );

-- ============ tanques ============
alter table tanques enable row level security;

create policy tanques_select on tanques
  for select
  to authenticated
  using (sede_id in (select id from sedes where cliente_id = mi_cliente_id()));

-- ============ dispensadores ============
alter table dispensadores enable row level security;

create policy dispensadores_select on dispensadores
  for select
  to authenticated
  using (sede_id in (select id from sedes where cliente_id = mi_cliente_id()));

-- ============ equipos ============
-- Tabla de detalle del cliente: sin política para comercial_lubryco.
alter table equipos enable row level security;

create policy equipos_select on equipos
  for select
  to authenticated
  using (cliente_id = mi_cliente_id());

-- ============ conductores ============
-- Tabla de detalle del cliente: sin política para comercial_lubryco.
alter table conductores enable row level security;

create policy conductores_select on conductores
  for select
  to authenticated
  using (cliente_id = mi_cliente_id());

-- ============ cargas ============
-- El corazón de la regla de privacidad: sin política para
-- comercial_lubryco. Sin política de INSERT/UPDATE — solo la API
-- propia (service role) escribe aquí.
alter table cargas enable row level security;

create policy cargas_select on cargas
  for select
  to authenticated
  using (cliente_id = mi_cliente_id());

-- ============ fotos ============
alter table fotos enable row level security;

create policy fotos_select on fotos
  for select
  to authenticated
  using (carga_id in (select id from cargas where cliente_id = mi_cliente_id()));

-- ============ entregas ============
-- No es detalle operativo del cliente (es la propia entrega de
-- Lubryco): comercial_lubryco sí la ve, a diferencia de cargas/equipos.
alter table entregas enable row level security;

create policy entregas_select on entregas
  for select
  to authenticated
  using (cliente_id = mi_cliente_id() or mi_rol() = 'comercial_lubryco');

-- ============ lecturas_nivel ============
alter table lecturas_nivel enable row level security;

create policy lecturas_nivel_select on lecturas_nivel
  for select
  to authenticated
  using (
    tanque_id in (
      select id from tanques where sede_id in (select id from sedes where cliente_id = mi_cliente_id())
    )
  );

-- ============ auditoria ============
-- Limitación conocida: `auditoria` es polimórfica (tabla/registro_id),
-- no tiene cliente_id propio. Se aproxima el aislamiento por el
-- cliente del usuario que generó el registro, no por el cliente dueño
-- del registro auditado. Revisar si Etapas futuras lo requieren más
-- estricto.
alter table auditoria enable row level security;

create policy auditoria_select on auditoria
  for select
  to authenticated
  using (
    mi_rol() in ('supervisor', 'admin_cliente')
    and usuario_id in (select id from usuarios where cliente_id = mi_cliente_id())
  );

-- ============ alertas ============
alter table alertas enable row level security;

create policy alertas_select on alertas
  for select
  to authenticated
  using (
    (cliente_id = mi_cliente_id() and mi_rol() = any(visible_para))
    or (mi_rol() = 'comercial_lubryco' and 'comercial_lubryco' = any(visible_para))
  );
