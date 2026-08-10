-- ============================================================
-- CuadreApp — Etapa P.2 (cierre): accesos al Dashboard de Cliente.
--
-- IDEMPOTENTE: puede correrse más de una vez sin efecto adicional.
--
-- CERO tablas nuevas. La separación de identidades ya existe en el
-- esquema desde la Etapa 0 y no se toca:
--
--   conductores  → operadores de campo. Se identifican con código+PIN
--                  DENTRO de la app, contra el catálogo del
--                  dispositivo. NO son usuarios de Auth y no tienen
--                  ni pueden tener sesión propia.
--   usuarios     → personas con sesión (id = auth.users.id). Aquí
--                  viven admin_lubryco, comercial_lubryco y los
--                  usuarios del Dashboard de cada empresa.
--
-- Un usuario del Dashboard NO es un operador y un operador NO se
-- convierte en usuario del Dashboard: son dos tablas, dos ciclos de
-- vida y dos mecanismos de autenticación distintos. Una misma persona
-- puede existir en ambas sin que las filas se relacionen.
--
-- Lo único que faltaba para administrarlos desde la consola son dos
-- columnas de presentación y auditoría en `usuarios`:
--
--   1. `email`            — copia del correo de Auth para poder
--                           listarlos y buscarlos sin una llamada al
--                           proveedor de identidad por fila. La API es
--                           la única que crea estos usuarios, así que
--                           es la única que puede desincronizarla.
--   2. `ultimo_acceso_en` — sello del último login exitoso. Es lo que
--                           permite revocar con criterio y responder
--                           «¿esta cuenta se usa?». Lo escribe la API
--                           en /api/v1/auth/login, jamás el cliente.
--
-- Lo que deliberadamente NO cambia: RLS ni roles. `supervisor` y
-- `admin_cliente` ya existen (Etapa 0) y ya reciben `tablero.leer` en
-- 20260805120000_tablero_cliente. Esta migración no otorga permisos.
-- ============================================================

alter table usuarios add column if not exists email            text;
alter table usuarios add column if not exists ultimo_acceso_en timestamptz;

comment on column usuarios.email is
  'Correo de la identidad de Auth, copiado por la API al crear el usuario. Solo presentación y búsqueda en la consola: la autoridad sigue siendo auth.users.';
comment on column usuarios.ultimo_acceso_en is
  'Último login exitoso, sellado por la API. null = la cuenta nunca se ha usado.';

-- Dos personas no pueden compartir correo: Auth ya lo impone, y aquí
-- queda la misma garantía para la copia local. Las filas sin correo
-- (dispositivos, usuarios previos a esta migración) no participan.
create unique index if not exists usuarios_email_unico_idx
  on usuarios (lower(email))
  where email is not null;

-- La consola lista los accesos de UN cliente: esa es la consulta.
create index if not exists usuarios_cliente_rol_idx
  on usuarios (cliente_id, rol_id)
  where cliente_id is not null;
