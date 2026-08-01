-- ============================================================
-- CuadreApp — Etapa S: Seguridad e Identidad (DEC-013)
--
-- Catálogo RBAC propio (DEC-004: los permisos son dominio del negocio,
-- viven en la base, auditables) y códigos de enrolamiento de
-- dispositivos. Ninguna de estas tablas es accesible por RLS a los
-- roles de la Data API: solo la API (service role) las lee — RLS
-- habilitado sin políticas = denegado por defecto.
-- ============================================================

-- ============ Permisos (RBAC propio) ============
create table permisos (
  codigo      text primary key,          -- 'cargas.registrar'
  descripcion text not null
);

create table rol_permisos (
  rol_id          smallint not null references roles(id),
  permiso_codigo  text not null references permisos(codigo),
  primary key (rol_id, permiso_codigo)
);

insert into permisos (codigo, descripcion) values
  ('cargas.registrar',  'Registrar una carga de combustible'),
  ('cargas.subir_foto', 'Subir la evidencia fotográfica de una carga'),
  ('catalogo.leer',     'Leer el catálogo de su sede (equipos, conductores, dispensadores)');

-- dispositivo: el flujo del conductor completo.
-- supervisor / admin_cliente: por ahora solo catálogo; sus permisos de
-- dashboard llegan con esa etapa.
insert into rol_permisos (rol_id, permiso_codigo)
select r.id, p.codigo
from roles r
cross join permisos p
where (r.codigo = 'dispositivo')
   or (r.codigo in ('supervisor', 'admin_cliente') and p.codigo = 'catalogo.leer');

-- ============ Códigos de enrolamiento ============
-- Un código de un solo uso, atado a una sede, canjeable por la
-- identidad de un dispositivo. Para el piloto se generan por SQL
-- (decisión aprobada en la propuesta de la Etapa S); el dashboard será
-- su dueño después.
create table codigos_enrolamiento (
  id              uuid primary key default gen_random_uuid(),
  sede_id         uuid not null references sedes(id),
  codigo          text not null unique,
  expira_en       timestamptz not null,
  usado_en        timestamptz,
  dispositivo_id  uuid references dispositivos(id),
  creado_en       timestamptz not null default now()
);

-- ============ RLS: denegado por defecto ============
alter table permisos enable row level security;
alter table rol_permisos enable row level security;
alter table codigos_enrolamiento enable row level security;
