-- ============================================================
-- CuadreApp — Etapa P: Perfiles Operativos (DEC-016) e identidad
-- del cliente (DEC-017).
--
-- IDEMPOTENTE: puede correrse más de una vez sin efecto adicional.
--
-- Auditoría previa del esquema — qué se REUTILIZA (no se crea):
--   - clientes.logo_url: existía sin uso. Desde DEC-017 guarda la
--     CLAVE del objeto del logo en el bucket privado logos-clientes
--     (nunca una URL ni base64); la API firma URLs temporales.
--   - fotos (momento 'inicial'/'final', unique por carga): sirve tal
--     cual al perfil carga_inventario. Cero cambios.
--   - equipos.capacidad_tanque_gal: la usa la regla RI2.
--   - trigger actualizar_tot_actual_gal: con dispensador_id nulo su
--     UPDATE no matchea filas. Cero cambios.
--   - RLS de cargas/fotos: filtra por cliente_id; no ve columnas
--     nuevas. Cero cambios.
-- Qué se AGREGA: perfiles_operativos (+seed), clientes.perfil_codigo,
--   cargas.perfil_codigo / llegada_gal / inventario_final_gal
--   (generada), nullables + CHECK de forma por perfil,
--   sedes.activo/ciudad/direccion/referencia, bucket logos-clientes.
-- ============================================================

-- ============ Catálogo de perfiles ============
create table if not exists perfiles_operativos (
  codigo      text primary key,
  nombre      text not null,
  descripcion text,
  activo      boolean not null default true
);

comment on table perfiles_operativos is
  'Catálogo administrativo de Perfiles Operativos (DEC-016). La fila NO activa comportamiento: un perfil es código versionado y probado (dominio, API, PWA, dashboard); la consola solo lo asigna. El codigo está congelado; el nombre visible es editable.';

insert into perfiles_operativos (codigo, nombre, descripcion) values
  ('medidor_doble', 'Medidor Doble',
   'Flujo original (El Trébol): tanda + totalizador del Fill-Rite, reglas R1–R12.'),
  ('carga_inventario', 'Carga sobre Inventario',
   'Piloto Sacyr: galones con los que llegó el carrotanque + galones despachados por Lubryco; el inventario final lo calcula el sistema.')
on conflict (codigo) do nothing;

-- Solo la API (service role) lee el catálogo: RLS activo sin
-- políticas ni GRANT — invisible para la Data API (convención Etapa 0).
alter table perfiles_operativos enable row level security;

-- ============ Perfil por cliente ============
alter table clientes
  add column if not exists perfil_codigo text not null default 'medidor_doble';

do $$ begin
  alter table clientes
    add constraint clientes_perfil_fk
    foreign key (perfil_codigo) references perfiles_operativos (codigo);
exception when duplicate_object then null; end $$;

comment on column clientes.perfil_codigo is
  'Perfil Operativo del cliente (DEC-016). Exactamente uno; los dispositivos lo heredan vía catálogo al sincronizar.';

comment on column clientes.logo_url is
  'Clave del objeto del logo en el bucket privado logos-clientes (DEC-017). NO es una URL: la API entrega URLs firmadas temporales.';

-- ============ Snapshot y campos de perfil en cargas ============
alter table cargas
  add column if not exists perfil_codigo text not null default 'medidor_doble';

do $$ begin
  alter table cargas
    add constraint cargas_perfil_fk
    foreign key (perfil_codigo) references perfiles_operativos (codigo);
exception when duplicate_object then null; end $$;

alter table cargas add column if not exists llegada_gal numeric(6,1);

alter table cargas
  add column if not exists inventario_final_gal numeric(7,1)
  generated always as (llegada_gal + galones) stored;

-- Las columnas del medidor pasan a ser propias del perfil
-- medidor_doble (nullable + CHECK, no NOT NULL global).
alter table cargas alter column dispensador_id    drop not null;
alter table cargas alter column tanda_inicial_gal drop not null;
alter table cargas alter column tot_inicial_gal   drop not null;
alter table cargas alter column tanda_final_gal   drop not null;
alter table cargas alter column tot_final_gal     drop not null;

-- Forma exacta por perfil: para medidor_doble reproduce (y endurece)
-- los NOT NULL previos; para carga_inventario exige exactamente la
-- forma inversa. Las filas históricas (todas medidor_doble completas)
-- pasan la validación del ADD CONSTRAINT.
alter table cargas drop constraint if exists cargas_forma_por_perfil;
alter table cargas add constraint cargas_forma_por_perfil check (
  (perfil_codigo = 'medidor_doble'
    and dispensador_id    is not null
    and tanda_inicial_gal is not null
    and tot_inicial_gal   is not null
    and tanda_final_gal   is not null
    and tot_final_gal     is not null
    and llegada_gal       is null)
  or
  (perfil_codigo = 'carga_inventario'
    and llegada_gal       is not null
    and llegada_gal       >= 0
    and dispensador_id    is null
    and tanda_inicial_gal is null
    and tot_inicial_gal   is null
    and tanda_final_gal   is null
    and tot_final_gal     is null)
);

comment on column cargas.perfil_codigo is
  'Snapshot del perfil del cliente al momento de capturar. La historia nunca se reinterpreta (DEC-016).';
comment on column cargas.galones is
  'Galones despachados por Lubryco — misma semántica en todo perfil (DEC-016). En medidor_doble = tanda_final_gal.';
comment on column cargas.llegada_gal is
  'Solo carga_inventario: galones con los que llegó el carrotanque.';
comment on column cargas.inventario_final_gal is
  'Solo carga_inventario: llegada + despachados. La calcula la base (columna generada); jamás la escribe la aplicación ni el operador.';

-- ============ Identidad de la sede ============
alter table sedes add column if not exists activo     boolean not null default true;
alter table sedes add column if not exists ciudad     text;
alter table sedes add column if not exists direccion  text;
alter table sedes add column if not exists referencia text;

comment on column sedes.ciudad is
  'Ciudad/municipio para la identidad visible: «Planta Buga, Valle del Cauca» = nombre + ciudad.';
comment on column sedes.referencia is
  'Descripción o referencia operativa de la sede (texto libre del admin).';

-- ============ Bucket privado de logos (DEC-017) ============
-- Mismo principio que fotos-cargas: nadie lee sin pasar por la API
-- (URL firmada temporal); solo la service role escribe — sin
-- políticas de storage.objects para la Data API. Límite 1 MB.
-- SVG excluido hasta contar con sanitización segura (DEC-017).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos-clientes', 'logos-clientes', false, 1048576,
        array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
