-- ============================================================
-- CuadreApp — Etapa P.2: Dashboard de Cliente multiempresa.
--
-- IDEMPOTENTE: puede correrse más de una vez sin efecto adicional.
--
-- CERO tablas nuevas y CERO columnas nuevas: el esquema ya es
-- multiempresa desde la Etapa 0 y la identidad corporativa ya vive en
-- `clientes` (DEC-017/DEC-018). Lo único que faltaba para que un
-- supervisor entre a su tablero es el permiso del RBAC propio
-- (DEC-004) y los índices de las consultas de lectura.
--
-- Qué agrega:
--   1. Permiso `tablero.leer`, otorgado SOLO a supervisor y
--      admin_cliente. admin_lubryco NO lo recibe: su vista del cliente
--      es el preview de la consola (/api/v1/admin/tablero/:clienteId),
--      y su sesión no tiene cliente_id con el cual resolver empresa.
--   2. Índices para las lecturas del tablero (día, 14 días, por sede).
--
-- Lo que deliberadamente NO cambia: RLS. El camino de acceso del
-- Dashboard es la API (DEC-009), que consulta con service role; las
-- políticas de la Etapa 0 siguen siendo la segunda línea de defensa y
-- ya aíslan por cliente_id (`cargas_select`, `equipos_select`,
-- `entregas_select`, `fotos_select`). El aislamiento efectivo del
-- tablero lo impone la API: toda consulta se parametriza con el
-- cliente_id DE LA SESIÓN, jamás con uno que mande el navegador.
-- ============================================================

-- ============ Permiso del tablero (RBAC propio, DEC-004) ============
insert into permisos (codigo, descripcion) values
  ('tablero.leer', 'Leer el Dashboard de su cliente (hoy, cargas, equipos, suministro)')
on conflict (codigo) do nothing;

insert into rol_permisos (rol_id, permiso_codigo)
select r.id, 'tablero.leer'
from roles r
where r.codigo in ('supervisor', 'admin_cliente')
on conflict do nothing;

comment on table rol_permisos is
  'RBAC propio (DEC-004). tablero.leer: supervisor y admin_cliente. admin_lubryco queda fuera a propósito — su sesión no tiene cliente_id y su vista del cliente es el preview de la consola.';

-- ============ Índices de lectura del tablero ============
-- El tablero consulta SIEMPRE por (cliente, [sede], ventana de
-- tiempo). El índice existente es (cliente_id, finalizada_en desc);
-- con multi-sede (DEC-018) la sede entra en la llave.
create index if not exists cargas_cliente_sede_finalizada_idx
  on cargas (cliente_id, sede_id, finalizada_en desc);

-- Pestaña Suministro: entregas del cliente por fecha.
create index if not exists entregas_cliente_fecha_idx
  on entregas (cliente_id, fecha desc);

-- Pestaña Equipos: rendimiento por equipo dentro de la ventana.
create index if not exists cargas_equipo_finalizada_lectura_idx
  on cargas (equipo_id, finalizada_en)
  where lectura_equipo is not null;
