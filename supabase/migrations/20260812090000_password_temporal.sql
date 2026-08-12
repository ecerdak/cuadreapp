-- P.3 · UX Hardening P0 — ciclo de contraseña del Dashboard (P0.1).
--
-- `debe_cambiar_password`: true mientras la persona use la contraseña
-- TEMPORAL que generó la consola (alta de acceso o «Nueva contraseña»).
-- Con el flag activo, /api/v1/tablero/* responde 403 PASSWORD_TEMPORAL
-- y el Dashboard obliga a definir una contraseña propia en el primer
-- ingreso. Se limpia únicamente cuando la persona define la suya
-- (POST /api/v1/auth/password o el restablecimiento por correo).
--
-- Idempotente: puede re-ejecutarse sin efecto.

alter table usuarios
  add column if not exists debe_cambiar_password boolean not null default false;

comment on column usuarios.debe_cambiar_password is
  'true = la contraseña vigente es la temporal generada por la consola; el Dashboard fuerza definir una propia antes de entrar (P0.1). Solo gobierna roles del Dashboard.';

-- Accesos del Dashboard ya creados que NUNCA han entrado: su contraseña
-- vigente sigue siendo la temporal, así que deben definir una al entrar.
-- Quien ya entró alguna vez no se fuerza retroactivamente (el cambio
-- voluntario queda disponible dentro del Dashboard).
update usuarios u
   set debe_cambiar_password = true
  from roles r
 where r.id = u.rol_id
   and r.codigo in ('supervisor', 'admin_cliente')
   and u.ultimo_acceso_en is null
   and not u.debe_cambiar_password;
