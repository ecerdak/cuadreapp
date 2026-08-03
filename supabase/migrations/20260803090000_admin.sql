-- Módulo Admin (piloto Sacyr): rol y permisos de la consola
-- administrativa de Lubryco. CERO tablas nuevas — el esquema ya es
-- multicliente. La autorización vive en el RBAC propio (DEC-004) y la
-- API es la única puerta (DEC-009).

insert into roles (id, codigo, nombre, descripcion) values
  (6, 'admin_lubryco', 'Administrador Lubryco',
   'Consola administrativa multicliente: clientes, sedes, equipos, operadores, dispositivos y enrolamiento. Sin acceso a editar cargas (son evidencia).')
on conflict (id) do nothing;

insert into permisos (codigo, descripcion) values
  ('admin.leer',      'Leer la consola administrativa (resumen, catálogos, tableros)'),
  ('admin.gestionar', 'Crear y editar clientes, sedes, equipos, operadores, códigos y dispositivos')
on conflict (codigo) do nothing;

insert into rol_permisos (rol_id, permiso_codigo)
select r.id, p.codigo
from roles r
cross join permisos p
where r.codigo = 'admin_lubryco'
  and p.codigo in ('admin.leer', 'admin.gestionar')
on conflict do nothing;
