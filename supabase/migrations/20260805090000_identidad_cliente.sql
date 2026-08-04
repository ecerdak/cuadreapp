-- ============================================================
-- CuadreApp — Etapa P.1: identidad corporativa por cliente y
-- jerarquía multi-sede (DEC-018).
--
-- IDEMPOTENTE: puede correrse más de una vez sin efecto adicional.
--
-- Identidad (DEC-018.b): la base almacena SOLO el logo (Etapa P) y
-- los dos colores corporativos. Hover, sombras, estados, badges,
-- bordes, fondos, gradientes y contrastes se derivan del Design
-- System — nunca CSS libre. Solo cambia la identidad; la
-- experiencia sigue siendo CuadreApp.
--
-- Jerarquía (DEC-018.d — decisión PERMANENTE de arquitectura, no un
-- requerimiento del piloto): Cliente → Sedes → Equipos → Operadores
-- → Dispositivos, con multi-sede como supuesto universal. Equipos y
-- Operadores ganan sede_id OPCIONAL:
--   · null      = disponible en TODAS las sedes del cliente
--   · con valor = exclusivo de esa sede
-- Esto permite operadores compartidos entre sedes u exclusivos, y lo
-- mismo para equipos. El catálogo del dispositivo (enrolado a una
-- sede) entrega los de su sede más los compartidos.
-- ============================================================

-- ============ Identidad corporativa ============
alter table clientes add column if not exists nombre_comercial text;
alter table clientes add column if not exists color_primario   text;
alter table clientes add column if not exists color_secundario text;

alter table clientes drop constraint if exists clientes_color_primario_hex;
alter table clientes add constraint clientes_color_primario_hex
  check (color_primario is null or color_primario ~ '^#[0-9A-Fa-f]{6}$');

alter table clientes drop constraint if exists clientes_color_secundario_hex;
alter table clientes add constraint clientes_color_secundario_hex
  check (color_secundario is null or color_secundario ~ '^#[0-9A-Fa-f]{6}$');

comment on column clientes.nombre_comercial is
  'Nombre visible corto («El Trébol S.A.S.»). La razón social vive en nombre.';
comment on column clientes.color_primario is
  'Identidad corporativa (DEC-018): #RRGGBB. La UI deriva todo lo demás del Design System.';
comment on column clientes.color_secundario is
  'Identidad corporativa (DEC-018): #RRGGBB. Acento secundario.';

-- ============ Jerarquía multi-sede ============
alter table equipos     add column if not exists sede_id uuid references sedes(id);
alter table conductores add column if not exists sede_id uuid references sedes(id);

comment on column equipos.sede_id is
  'DEC-018: null = disponible en todas las sedes del cliente; con valor = exclusivo de esa sede.';
comment on column conductores.sede_id is
  'DEC-018: null = opera en todas las sedes del cliente; con valor = exclusivo de esa sede.';
