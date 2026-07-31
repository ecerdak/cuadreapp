-- ============================================================
-- CuadreApp — Esquema inicial (Etapa 0)
--
-- Ver docs/ESPEC_App_Cuadre_Lubryco.md §6 (esquema original) y
-- docs/PRODUCT_BIBLE.md §7/§9 (DEC-004: RBAC propio en base de datos).
--
-- Convenciones (docs/ESPEC_App_Cuadre_Lubryco.md §13): nombres en
-- español, timestamptz en America/Bogota, numeric para todo volumen
-- (nunca float), una decimal para galones.
-- ============================================================

create extension if not exists pgcrypto;

-- ============ RBAC propio (DEC-004) ============
-- El rol es un concepto del dominio del negocio: vive en esta tabla,
-- no en custom claims de Supabase Auth ni en roles nativos de Postgres.
create table roles (
  id          smallint primary key,
  codigo      text not null unique,
  nombre      text not null,
  descripcion text
);

comment on table roles is 'Roles del dominio de negocio (DEC-004). codigo referenciado por RLS.';

insert into roles (id, codigo, nombre, descripcion) values
  (1, 'supervisor',        'Supervisor',            'Jefe de campo/almacén del cliente. Corrige registros y cierra el día.'),
  (2, 'admin_cliente',     'Administrador cliente',  'Gerencia del cliente. Gestiona equipos y conductores.'),
  (3, 'conductor_lubryco', 'Conductor Lubryco',      'Registra entregas (remisiones) del carrotanque en sitio.'),
  (4, 'comercial_lubryco', 'Comercial Lubryco',      'Vista agregada multicliente. Nunca ve detalle por conductor ni por equipo.'),
  (5, 'dispositivo',       'Dispositivo enrolado',   'Identidad técnica de un dispositivo de planta enrolado a una sede. El conductor se identifica dentro de la app con código+PIN, no con esta identidad.');

-- ============ Organización ============
create table clientes (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  nit           text,
  logo_url      text,
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);

create table sedes (
  id                uuid primary key default gen_random_uuid(),
  cliente_id        uuid not null references clientes(id),
  nombre            text not null,              -- 'Planta Buga'
  lat               numeric(9,6),
  lng               numeric(9,6),
  radio_geocerca_m  int not null default 150,
  zona_horaria      text not null default 'America/Bogota'
);

-- ============ Usuarios y dispositivos (DEC-004) ============
-- Identidad respaldada por Supabase Auth (auth.users). El alcance
-- (cliente_id/sede_id) y el rol son RBAC propio, consultados por RLS.
-- `conductor` NO tiene fila aquí: se identifica con código+PIN dentro
-- de la app (tabla `conductores`), no con una sesión de Supabase Auth.
create table usuarios (
  id          uuid primary key references auth.users(id) on delete cascade,
  cliente_id  uuid references clientes(id),   -- null para comercial_lubryco (alcance multicliente)
  sede_id     uuid references sedes(id),
  rol_id      smallint not null references roles(id),
  nombre      text not null,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);

-- Un dispositivo enrolado es la identidad técnica (rol 'dispositivo')
-- que respalda la sesión persistente del celular de planta — ver
-- docs/ESPEC_App_Cuadre_Lubryco.md §5 "Autenticación". El mecanismo de
-- enrolamiento (edge/API) se implementa en la Etapa 1; esta tabla solo
-- deja el registro de qué dispositivo quedó enrolado a qué sede.
create table dispositivos (
  id              uuid primary key default gen_random_uuid(),
  sede_id         uuid not null references sedes(id),
  usuario_id      uuid not null references usuarios(id),
  nombre          text,                          -- 'Tablet almacén', etc. — identifica el equipo físico
  enrolado_en     timestamptz,
  ultimo_visto_en timestamptz,
  activo          boolean not null default true
);

-- Creada vacía. El aforo llega después (Etapa 5).
create table tanques (
  id            uuid primary key default gen_random_uuid(),
  sede_id       uuid not null references sedes(id),
  nombre        text not null,
  combustible   text not null default 'DIESEL',
  capacidad_gal numeric(10,1),
  forma         text,                        -- 'cilindrico_horizontal'
  diametro_cm   numeric(6,1),
  largo_cm      numeric(6,1),
  tipo_casquete  text,                        -- 'plano' | 'abombado'
  tabla_aforo   jsonb                        -- [{cm, gal}, ...]
);

create table dispensadores (
  id                    uuid primary key default gen_random_uuid(),
  sede_id               uuid not null references sedes(id),
  tanque_id             uuid references tanques(id),
  nombre                text not null,          -- 'Isla 1'
  marca_medidor         text default 'Fill-Rite Serie 900',
  serie_medidor         text,
  tot_instalacion_gal   numeric(10,1) not null,  -- lectura al instalar
  fecha_instalacion     date not null,
  tot_actual_gal        numeric(10,1) not null,  -- denormalizado: última lectura final aceptada
  tolerancia_tanda_gal  numeric(4,2) not null default 1.0,
  activo                boolean not null default true
);

-- ============ Equipos y personas ============
create table equipos (
  id                    uuid primary key default gen_random_uuid(),
  cliente_id            uuid not null references clientes(id),
  codigo_interno        text not null,             -- 'T-04'
  qr_token              text not null unique,      -- lo que codifica el sticker
  descripcion           text,                      -- 'Tractor Massey 4292'
  categoria             text,                      -- tractor|alzadora|camion|pickup|motobomba|planta
  tipo_medidor          text not null check (tipo_medidor in ('horometro', 'odometro', 'ninguno')),
  ultima_lectura        numeric(10,1),             -- último horómetro/odómetro aceptado
  capacidad_tanque_gal  numeric(6,1),              -- para la regla de plausibilidad (R6)
  activo                boolean not null default true,
  unique (cliente_id, codigo_interno)
);

create table conductores (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null references clientes(id),
  nombre        text not null,
  codigo        text not null,
  pin_hash      text not null,
  activo        boolean not null default true,
  unique (cliente_id, codigo)
);

-- ============ El corazón ============
create table cargas (
  id                uuid primary key default gen_random_uuid(),
  cliente_id        uuid not null references clientes(id),
  sede_id           uuid not null references sedes(id),
  dispensador_id    uuid not null references dispensadores(id),
  equipo_id         uuid not null references equipos(id),
  conductor_id      uuid not null references conductores(id),

  -- Lecturas tipeadas por el conductor
  tanda_inicial_gal numeric(6,1) not null,   -- debe ser 0.0 (R1)
  tot_inicial_gal   numeric(10,1) not null,
  tanda_final_gal   numeric(6,1) not null,
  tot_final_gal     numeric(10,1) not null,
  galones           numeric(6,1) not null,   -- = tanda_final, valor operativo

  -- Contador del equipo
  lectura_equipo    numeric(10,1),
  tipo_lectura      text,                    -- copia de equipos.tipo_medidor al momento

  -- Sello
  iniciada_en       timestamptz not null,
  finalizada_en     timestamptz not null,
  registrada_en     timestamptz not null default now(),  -- llegada al servidor
  lat               numeric(9,6),
  lng               numeric(9,6),
  precision_gps_m   numeric(6,1),
  dentro_geocerca   boolean,
  origen            text not null default 'app' check (origen in ('app', 'papel_retro', 'correccion')),

  -- Resultado de validación
  estado             text not null check (estado in ('ok', 'advertencia', 'inconsistente')),
  banderas           jsonb not null default '[]'::jsonb,  -- ['SALTO_TOTALIZADOR', ...]
  gal_no_registrados numeric(6,1),           -- tamaño del salto, si hubo

  notas             text,
  device_id         text,
  version_app       text
);

create index on cargas (cliente_id, finalizada_en desc);
create index on cargas (dispensador_id, tot_final_gal desc);
create index on cargas (equipo_id, finalizada_en desc);

create table fotos (
  id           uuid primary key default gen_random_uuid(),
  carga_id     uuid not null references cargas(id) on delete cascade,
  momento      text not null check (momento in ('inicial', 'final')),
  storage_path text not null,
  ancho        int,
  alto         int,
  bytes        int,
  tomada_en    timestamptz,                  -- EXIF o reloj del dispositivo
  ocr_sugerido jsonb,                        -- {tanda, totalizador, confianza} — nunca es el dato oficial
  unique (carga_id, momento)
);

-- ============ Suministro de Lubryco ============
create table entregas (
  id                     uuid primary key default gen_random_uuid(),
  cliente_id             uuid not null references clientes(id),
  sede_id                uuid not null references sedes(id),
  tanque_id              uuid references tanques(id),
  numero_remision        text not null,
  fecha                  date not null,
  galones                numeric(8,1) not null,
  producto               text not null default 'DIESEL',
  placa_carrotanque      text,
  medidor_carro_inicial  numeric(10,1),
  medidor_carro_final    numeric(10,1),
  foto_medidor_path      text,
  recibido_por           text,
  firma_path             text,
  registrado_por         uuid references usuarios(id),  -- conductor_lubryco
  creado_en              timestamptz not null default now(),
  unique (cliente_id, numero_remision)
);

-- Creada vacía hasta que exista tabla de aforo (Etapa 5).
create table lecturas_nivel (
  id              uuid primary key default gen_random_uuid(),
  tanque_id       uuid not null references tanques(id),
  medido_en       timestamptz not null,
  altura_cm       numeric(6,1),
  agua_fondo_cm   numeric(6,1),
  gal_calculados  numeric(10,1),
  medido_por      uuid references usuarios(id),
  foto_path       text
);

-- ============ Rastro y avisos ============
create table auditoria (
  id             bigserial primary key,
  tabla          text not null,
  registro_id    uuid not null,
  accion         text not null check (accion in ('update', 'anulacion')),
  valor_anterior jsonb not null,
  valor_nuevo    jsonb not null,
  motivo         text not null,               -- obligatorio
  usuario_id     uuid not null references usuarios(id),
  creado_en      timestamptz not null default now()
);

create table alertas (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid not null references clientes(id),
  tipo         text not null,                -- REORDEN | SALTO_TOTALIZADOR | DESVIO_EQUIPO | SIN_FOTO
  severidad    text not null check (severidad in ('info', 'media', 'alta')),
  titulo       text not null,
  detalle      jsonb,
  visible_para text[] not null,              -- ['supervisor'] | ['comercial_lubryco'] ...
  resuelta_en  timestamptz,
  creado_en    timestamptz not null default now()
);
