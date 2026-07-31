-- ============================================================
-- CuadreApp — Seed de DEMOSTRACIÓN (Etapa 0)
--
-- Estos NO son los datos reales de El Trébol. El inventario real
-- (equipos, conductores, lectura de instalación del dispensador,
-- coordenadas de la sede) sigue pendiente — ver
-- docs/PRODUCT_BIBLE.md §12 y "Qué falta pedirle a El Trébol" en
-- docs/ESPEC_App_Cuadre_Lubryco.md. Este seed solo tiene la MISMA
-- FORMA que los datos reales, para poder probar el esquema y el
-- trigger de la Etapa 0 sin esperar esa información.
--
-- No se siembran `usuarios` ni `dispositivos`: requieren una cuenta
-- real de Supabase Auth detrás (login de dashboard, enrolamiento de
-- dispositivo), que se implementan en las Etapas 1 y 2.
-- ============================================================

insert into clientes (nombre, nit, activo) values
  ('Industrias Alimenticias El Trébol S.A.S.', null, true);

insert into sedes (cliente_id, nombre, radio_geocerca_m)
select id, 'Planta Buga', 150
from clientes
where nombre = 'Industrias Alimenticias El Trébol S.A.S.';

-- tanques: deliberadamente vacía (sin aforo todavía, Etapa 5).

insert into dispensadores (sede_id, tanque_id, nombre, tot_instalacion_gal, fecha_instalacion, tot_actual_gal)
select s.id, null, 'Isla 1', 1200.0, date '2026-01-15', 1200.0
from sedes s
join clientes c on c.id = s.cliente_id
where c.nombre = 'Industrias Alimenticias El Trébol S.A.S.' and s.nombre = 'Planta Buga';

insert into equipos (cliente_id, codigo_interno, qr_token, descripcion, categoria, tipo_medidor, capacidad_tanque_gal)
select c.id, v.codigo_interno, v.qr_token, v.descripcion, v.categoria, v.tipo_medidor, v.capacidad_tanque_gal
from clientes c
cross join (values
  ('T-01',  'QR-T-01',  'Tractor Massey Ferguson 4275', 'tractor',   'horometro', 80.0),
  ('T-04',  'QR-T-04',  'Tractor Massey Ferguson 4292', 'tractor',   'horometro', 80.0),
  ('AL-01', 'QR-AL-01', 'Alzadora de caña',              'alzadora',  'horometro', 100.0),
  ('C-01',  'QR-C-01',  'Camión Kenworth',               'camion',    'odometro',  150.0),
  ('P-01',  'QR-P-01',  'Pickup Toyota Hilux',           'pickup',    'odometro',  60.0)
) as v(codigo_interno, qr_token, descripcion, categoria, tipo_medidor, capacidad_tanque_gal)
where c.nombre = 'Industrias Alimenticias El Trébol S.A.S.';

-- PIN de demostración para los tres: 0000 (identifica, no protege —
-- ver docs/PRODUCT_BIBLE.md §6). Nunca usar PINes de prueba como este
-- con datos de conductores reales.
insert into conductores (cliente_id, nombre, codigo, pin_hash)
select c.id, v.nombre, v.codigo, crypt('0000', gen_salt('bf'))
from clientes c
cross join (values
  ('Duván Bonilla',        '07'),
  ('Jhon Cortés',          '03'),
  ('María Fernanda Ríos',  '11')
) as v(nombre, codigo)
where c.nombre = 'Industrias Alimenticias El Trébol S.A.S.';
