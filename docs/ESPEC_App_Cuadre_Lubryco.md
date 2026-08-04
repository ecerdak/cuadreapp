# Especificación técnica — App "Cuadre"

### Control de despacho de combustible en planta del cliente

**Cliente piloto:** Industrias Alimenticias El Trébol S.A.S. (Panela Trébol)
**Propietario del producto:** Lubryco S.A.S. — Buga, Valle del Cauca
**Versión:** 1.0 — 29 de julio de 2026
**Destinatario de este documento:** Claude Code (implementación)

---

## 1. Qué problema resuelve

El cliente tiene un tanque de diésel en planta y un dispensador con medidor mecánico **Fill-Rite Serie 900**. Más de 20 equipos (tractores, alzadora, camiones, pickups, motobombas) se abastecen ahí. Hoy el conductor anota la lectura del cuenta-galones en una planilla de papel: escribe mal, escribe poco, o no escribe. Alguien después tiene que transcribir, y el número transcrito no cuadra con la realidad.

El objetivo **no** es digitalizar la planilla. Es que el combustible cuadre: que cada galón que sale del tanque tenga dueño (equipo + conductor + hora), y que cualquier hueco se detecte el mismo día, no al cierre de mes.

Lubryco entrega la app gratis a sus clientes industriales. A cambio obtiene consumo real por cliente y punto de reorden automático.

---

## 2. El medidor: por qué el diseño gira alrededor de él

El Fill-Rite Serie 900 tiene **dos registros en la misma carátula**:

| Registro                        | Ubicación               | Comportamiento                                                 |
| ------------------------------- | ----------------------- | -------------------------------------------------------------- |
| **Tanda** (batch)               | Arriba, dígitos grandes | 4 enteros + décimas. Se resetea a cero con la perilla lateral. |
| **Totalizador** (TOTAL GALLONS) | Abajo, banda estrecha   | 6 dígitos enteros. Acumulado de vida. **No se resetea.**       |

Una sola foto captura ambos. De ahí salen tres candados aritméticos que se verifican solos, sin OCR y sin hardware:

1. **La tanda inicial debe estar en 0.0** → prueba de que el conductor reseteó antes de cargar.
2. **El totalizador inicial de esta carga debe ser igual al totalizador final de la carga anterior en ese dispensador** → si hay salto, alguien cargó sin registrar.
3. **La tanda final debe ser igual a (totalizador final − totalizador inicial)**, con tolerancia ±1 gal → el totalizador solo lee enteros y la tanda lee décimas.

Falsificar los tres al mismo tiempo, con foto, exige bombear combustible de verdad.

**Nota de precisión:** la carátula dice _"not to be used to measure liquid for resale"_. Es un medidor de proceso, exactitud del orden del 1%. Ninguna alerta debe tratar una diferencia menor al 2% como un robo.

> **Requisito físico previo, fuera de software:** el medidor está montado a la altura del techo y su vidrio refleja la cubierta. Antes de desplegar, bajarlo a altura del pecho o instalarle visera antirreflejo. Si el reflejo tapa un dígito, la evidencia fotográfica no sirve.

---

## 3. Alcance

### En el demo (v0.1 — lo que se le muestra al cliente)

- Registro de carga completo en el celular: identificar equipo, PIN de conductor, foto + lectura inicial, foto + lectura final.
- Los tres candados aritméticos, evaluados en el dispositivo, con aviso inmediato al conductor.
- Registro de horómetro u odómetro según tipo de equipo.
- Dashboard web del cliente: veredicto del día, cargas, equipos, suministro.
- Registro de entregas de Lubryco (remisiones) y balance entregado vs. despachado.
- Funcionamiento sin señal, con cola de sincronización.

### Explícitamente fuera del demo

- Aforo del tanque y tabla de conversión centímetros → galones. El tanque es cilíndrico horizontal elevado y aún no se tienen sus medidas. El balance del demo se hace **contra las remisiones de Lubryco, no contra el nivel del tanque**. Las tablas `tanques` y `lecturas_nivel` se crean vacías para no migrar después.
- OCR automático de la lectura.
- Integración con GPS de flota.
- Facturación.

---

## 4. Stack

| Capa                 | Elección                                         | Por qué                                                                                                        |
| -------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| App                  | **PWA**: React 18 + TypeScript + Vite + Tailwind | Instalable desde el navegador, sin tienda de apps, sin costo de publicación. Una sola base para Android e iOS. |
| Service worker       | `vite-plugin-pwa` (Workbox)                      | Precache del shell, app usable sin red.                                                                        |
| Cola offline         | **Dexie** (IndexedDB)                            | Cargas y fotos se guardan localmente y se suben cuando vuelve la señal.                                        |
| Compresión de imagen | `browser-image-compression`                      | Borde largo 1024 px, WebP calidad 0.7 → 60–90 KB por foto. Suficiente para leer un display de rodillos.        |
| Backend              | **Supabase** (Postgres + Auth + Storage + RLS)   | Capa gratuita: 500 MB de base, 1 GB de storage. Postgres real, sin reescribir cuando crezca.                   |
| Escaneo QR           | `html5-qrcode` o `BarcodeDetector` nativo        | Identificación del equipo sin teclear.                                                                         |
| Dashboard            | Misma app React, ruta `/tablero`                 | Un solo despliegue.                                                                                            |
| Hosting              | Cloudflare Pages o Vercel                        | Gratis, HTTPS incluido (la cámara exige HTTPS).                                                                |

**Presupuesto de storage:** ~6 cargas/día × 2 fotos × 80 KB ≈ 1 MB/día ≈ 30 MB/mes por cliente. El plan gratuito aguanta el piloto y varios clientes más. Política de retención: foto completa 90 días, después reducir a 320 px y conservar la lectura. Definirlo desde el arranque.

**Honestidad sobre "costo cero":** la infraestructura es gratis al comienzo, el mantenimiento no. Si esto va a ser el ancla de retención de Lubryco, presupuestar USD 20–25/mes de infraestructura antes que quedar amarrado a los límites de una capa gratuita justo cuando el producto empiece a funcionar.

---

## 5. Roles

| Rol                 | Quién                               | Puede                                                                                                             |
| ------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `conductor`         | Operarios de El Trébol              | Registrar cargas. Ver solo las propias, del día. No edita nada.                                                   |
| `supervisor`        | Jefe de campo / almacén del cliente | Todo el dashboard de su sede. Corregir registros dejando rastro. Cerrar el día.                                   |
| `admin_cliente`     | Gerencia de El Trébol               | Lo del supervisor + gestión de equipos y conductores.                                                             |
| `conductor_lubryco` | Conductor del carrotanque           | Registrar la entrega en sitio: galones, foto del medidor del carrotanque, firma de quien recibe.                  |
| `comercial_lubryco` | Esteban / equipo Lubryco            | Vista agregada multicliente: volumen, autonomía, alertas de reorden. **Sin** detalle por conductor ni por equipo. |

### Privacidad — regla no negociable

Lubryco ve **volumen agregado y días de autonomía**. El detalle por conductor y por equipo es del cliente y solo del cliente. Implementarlo en RLS, no en la UI. Si El Trébol sospecha que Lubryco le está mirando la operación interna, el regalo se vuelve un problema comercial.

### Autenticación

- **Dispositivo:** se enrola una vez contra una sede y guarda una sesión persistente de Supabase. El conductor nunca ve una pantalla de login.
- **Conductor:** código + **PIN de 4 dígitos**. Identifica, no protege.
- La defensa contra fraude son los tres candados y las fotos, no el PIN. No diseñar como si el PIN fuera seguridad.

---

## 6. Modelo de datos

```sql
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
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null references clientes(id),
  nombre        text not null,              -- 'Planta Buga'
  lat           numeric(9,6),
  lng           numeric(9,6),
  radio_geocerca_m int not null default 150,
  zona_horaria  text not null default 'America/Bogota'
);

-- Creada vacía. El aforo llega después.
create table tanques (
  id            uuid primary key default gen_random_uuid(),
  sede_id       uuid not null references sedes(id),
  nombre        text not null,
  combustible   text not null default 'DIESEL',
  capacidad_gal numeric(10,1),
  forma         text,                        -- 'cilindrico_horizontal'
  diametro_cm   numeric(6,1),
  largo_cm      numeric(6,1),
  tipo_casquete text,                        -- 'plano' | 'abombado'
  tabla_aforo   jsonb                        -- [{cm, gal}, ...]
);

create table dispensadores (
  id                 uuid primary key default gen_random_uuid(),
  sede_id            uuid not null references sedes(id),
  tanque_id          uuid references tanques(id),
  nombre             text not null,          -- 'Isla 1'
  marca_medidor      text default 'Fill-Rite Serie 900',
  serie_medidor      text,
  tot_instalacion_gal numeric(10,1) not null,  -- lectura al instalar
  fecha_instalacion  date not null,
  tot_actual_gal     numeric(10,1) not null,    -- denormalizado: última lectura final aceptada
  tolerancia_tanda_gal numeric(4,2) not null default 1.0,
  activo             boolean not null default true
);

-- ============ Equipos y personas ============
create table equipos (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references clientes(id),
  codigo_interno  text not null,             -- 'T-04'
  qr_token        text not null unique,      -- lo que codifica el sticker
  descripcion     text,                      -- 'Tractor Massey 4292'
  categoria       text,                      -- tractor|alzadora|camion|pickup|motobomba|planta
  tipo_medidor    text not null,             -- 'horometro' | 'odometro' | 'ninguno'
  ultima_lectura  numeric(10,1),             -- último horómetro/odómetro aceptado
  capacidad_tanque_gal numeric(6,1),         -- para la regla de plausibilidad
  activo          boolean not null default true,
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
  tanda_inicial_gal numeric(6,1) not null,   -- debe ser 0.0
  tot_inicial_gal   numeric(10,1) not null,
  tanda_final_gal   numeric(6,1) not null,
  tot_final_gal     numeric(10,1) not null,
  galones           numeric(6,1) not null,   -- = tanda_final, valor operativo

  -- Contador del equipo
  lectura_equipo    numeric(10,1),
  tipo_lectura       text,                    -- copia de equipos.tipo_medidor al momento

  -- Sello
  iniciada_en       timestamptz not null,
  finalizada_en     timestamptz not null,
  registrada_en     timestamptz not null default now(),  -- llegada al servidor
  lat               numeric(9,6),
  lng               numeric(9,6),
  precision_gps_m   numeric(6,1),
  dentro_geocerca   boolean,
  origen            text not null default 'app',  -- app | papel_retro | correccion

  -- Resultado de validación
  estado            text not null,           -- 'ok' | 'advertencia' | 'inconsistente'
  banderas          jsonb not null default '[]'::jsonb,  -- ['SALTO_TOTALIZADOR', ...]
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
  momento      text not null,                -- 'inicial' | 'final'
  storage_path text not null,
  ancho        int, alto int, bytes int,
  tomada_en    timestamptz,                  -- EXIF o reloj del dispositivo
  ocr_sugerido jsonb,                        -- {tanda, totalizador, confianza} — nunca es el dato oficial
  unique (carga_id, momento)
);

-- ============ Suministro de Lubryco ============
create table entregas (
  id                 uuid primary key default gen_random_uuid(),
  cliente_id         uuid not null references clientes(id),
  sede_id            uuid not null references sedes(id),
  tanque_id          uuid references tanques(id),
  numero_remision    text not null,
  fecha              date not null,
  galones            numeric(8,1) not null,
  producto           text not null default 'DIESEL',
  placa_carrotanque  text,
  medidor_carro_inicial numeric(10,1),
  medidor_carro_final   numeric(10,1),
  foto_medidor_path  text,
  recibido_por       text,
  firma_path         text,
  registrada_por     uuid,                   -- conductor_lubryco
  creado_en          timestamptz not null default now(),
  unique (cliente_id, numero_remision)
);

-- Creada vacía hasta que exista tabla de aforo.
create table lecturas_nivel (
  id           uuid primary key default gen_random_uuid(),
  tanque_id    uuid not null references tanques(id),
  medido_en    timestamptz not null,
  altura_cm    numeric(6,1),
  agua_fondo_cm numeric(6,1),
  gal_calculados numeric(10,1),
  medido_por   uuid,
  foto_path    text
);

-- ============ Rastro y avisos ============
create table auditoria (
  id            bigserial primary key,
  tabla         text not null,
  registro_id   uuid not null,
  accion        text not null,               -- 'update' | 'anulacion'
  valor_anterior jsonb not null,
  valor_nuevo   jsonb not null,
  motivo        text not null,               -- obligatorio
  usuario_id    uuid not null,
  creado_en     timestamptz not null default now()
);

create table alertas (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid not null references clientes(id),
  tipo         text not null,                -- REORDEN | SALTO_TOTALIZADOR | DESVIO_EQUIPO | SIN_FOTO
  severidad    text not null,                -- info | media | alta
  titulo       text not null,
  detalle      jsonb,
  visible_para text[] not null,              -- ['supervisor'] | ['comercial_lubryco'] ...
  resuelta_en  timestamptz,
  creado_en    timestamptz not null default now()
);
```

### Reglas de integridad

- **`cargas` es inmutable.** Nada de `UPDATE` de lecturas. Una corrección se hace insertando una carga nueva con `origen='correccion'` y anulando la anterior mediante `auditoria`. El original siempre queda visible. Sin esto el sistema pierde valor probatorio.
- `dispensadores.tot_actual_gal` se actualiza por trigger al aceptar una carga, y solo si `tot_final_gal` es mayor.
- RLS en todas las tablas por `cliente_id`. El rol `comercial_lubryco` accede únicamente a vistas agregadas (§9), nunca a `cargas` directamente.

### Addendum 4-ago-2026 — Perfiles Operativos (DEC-016) e identidad del cliente (DEC-017)

Cambios de esquema aplicados por `supabase/migrations/20260804090000_perfiles_operativos.sql` (idempotente):

- Nueva tabla `perfiles_operativos (codigo pk, nombre, descripcion, activo)`; seed: `medidor_doble` («Medidor Doble») y `carga_inventario` («Carga sobre Inventario»). RLS habilitado sin políticas (solo la API la lee, con service role).
- `clientes.perfil_codigo text not null default 'medidor_doble'` con FK al catálogo. `clientes.logo_url` **se reutiliza** para guardar la clave del objeto del logo en el bucket privado `logos-clientes` (nunca una URL ni base64); la API resuelve URL firmada temporal.
- `cargas.perfil_codigo` (snapshot del perfil al capturar; backfill `medidor_doble` para la historia), `cargas.llegada_gal numeric(6,1)` y `cargas.inventario_final_gal numeric(7,1)` **generada siempre como** `llegada_gal + galones` — la escribe la base, jamás la aplicación.
- `dispensador_id`, `tanda_inicial_gal`, `tot_inicial_gal`, `tanda_final_gal` y `tot_final_gal` pasan a nullable, protegidas por `check cargas_forma_por_perfil`: para `medidor_doble` las cinco son obligatorias y `llegada_gal` es nula; para `carga_inventario`, exactamente al revés. La integridad de El Trébol queda igual o más estricta que antes.
- `sedes` gana `activo boolean not null default true`, `ciudad`, `direccion` y `referencia` (identidad visible: «Planta Buga, Valle del Cauca»).
- `cargas.galones` conserva una única semántica en todo perfil: **galones despachados por Lubryco** (en `medidor_doble` sigue siendo `= tanda_final_gal`).
- El trigger de `tot_actual_gal` no cambia: con `dispensador_id` nulo su `UPDATE` no matchea filas.

### Addendum P.1 4-ago-2026 — Identidad corporativa y jerarquía multi-sede (DEC-018)

Cambios de `supabase/migrations/20260805090000_identidad_cliente.sql` (idempotente):

- `clientes` gana `nombre_comercial` («El Trébol S.A.S.» frente a la razón social en `nombre`), `color_primario` y `color_secundario` (`#RRGGBB`, CHECK de formato). La base almacena SOLO esos dos colores: todo lo demás (hover, sombras, estados, contrastes) lo deriva el Design System — nunca CSS libre.
- `equipos.sede_id` y `conductores.sede_id`, **opcionales** (FK a `sedes`, null = disponible en todas las sedes del cliente). Jerarquía congelada: Cliente → Sedes → Equipos → Operadores → Dispositivos; multi-sede es supuesto universal. El catálogo del dispositivo filtra por su sede: entrega los equipos/operadores de esa sede más los compartidos (null).
- Cero cambios en `cargas`, perfiles, trigger y RLS.

---

## 7. Reglas de validación

Se evalúan **en el dispositivo, antes de guardar**, y se vuelven a evaluar en el servidor (el cliente miente, el servidor decide).

Principio rector: **nunca se bloquea un registro.** Todo se guarda y se marca. Un registro rechazado vuelve al papel, y el papel es el problema que estamos resolviendo.

| #   | Regla                                                                                   | Si falla                                                                                  | Bandera                 |
| --- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------- |
| R1  | `tanda_inicial_gal == 0.0`                                                              | advertencia, exige nota                                                                   | `TANDA_NO_RESETEADA`    |
| R2  | `tot_inicial_gal == dispensadores.tot_actual_gal`                                       | **inconsistente**; calcular `gal_no_registrados = tot_inicial − tot_actual`; crear alerta | `SALTO_TOTALIZADOR`     |
| R3  | `abs(tanda_final − (tot_final − tot_inicial)) <= tolerancia` (1.0 gal)                  | inconsistente                                                                             | `TANDA_NO_CUADRA`       |
| R4  | `tot_final_gal > tot_inicial_gal`                                                       | inconsistente, no deja avanzar                                                            | `TOTALIZADOR_RETROCEDE` |
| R5  | `tanda_final_gal > 0`                                                                   | inconsistente                                                                             | `SIN_DESPACHO`          |
| R6  | Si el equipo tiene tanque conocido: `galones <= capacidad_tanque_gal * 1.15`            | advertencia                                                                               | `EXCEDE_CAPACIDAD`      |
| R7  | `lectura_equipo >= equipos.ultima_lectura`                                              | advertencia                                                                               | `CONTADOR_RETROCEDE`    |
| R8  | Salto de horómetro plausible: ≤ 24 h desde la última carga (odómetro: ≤ 800 km)         | advertencia                                                                               | `SALTO_CONTADOR`        |
| R9  | Las dos fotos existen y vienen de cámara en vivo (`capture="environment"`, sin galería) | **no deja cerrar**                                                                        | `FOTO_FALTANTE`         |
| R10 | GPS dentro de la geocerca de la sede                                                    | advertencia (puede no haber señal)                                                        | `FUERA_DE_SEDE`         |
| R11 | No existe otra carga del mismo equipo en los últimos 3 minutos                          | advertencia                                                                               | `POSIBLE_DUPLICADO`     |
| R12 | `finalizada_en − iniciada_en` entre 20 s y 60 min                                       | advertencia                                                                               | `TIEMPO_ATIPICO`        |

**Estado resultante:** `inconsistente` si hay alguna bandera de esa clase; `advertencia` si solo hay advertencias; `ok` si no hay ninguna.

**R2 merece una nota de producto:** un salto de totalizador no significa que falte combustible. El totalizador ya contó esos galones, así que el balance del tanque sigue siendo correcto. Lo que falta es **saber a qué equipo fueron**. La UI debe decirlo así, porque si acusa de robo cuando fue un olvido, el supervisor pierde la confianza en el sistema.

### Reglas del perfil «Carga sobre Inventario» (addendum 4-ago-2026, DEC-016)

Las R1–R12 de arriba aplican al perfil `medidor_doble` y están congeladas. El perfil `carga_inventario` valida con su propio conjunto — mismo principio rector (nunca se bloquea un registro), mismo vocabulario de banderas donde la semántica es idéntica:

| #   | Regla                                                                                 | Si falla                      | Bandera                     |
| --- | ------------------------------------------------------------------------------------- | ----------------------------- | --------------------------- |
| RI1 | `despachados_gal > 0`                                                                 | inconsistente                 | `SIN_DESPACHO`              |
| RI2 | Si capacidad conocida: `llegada_gal + despachados_gal <= capacidad_tanque_gal * 1.15` | advertencia                   | `EXCEDE_CAPACIDAD`          |
| RI3 | Las dos fotos de cámara en vivo (exento `papel_retro`; las correcciones sí)           | inconsistente, no deja cerrar | `FOTO_FALTANTE`             |
| RI4 | GPS dentro de la geocerca; sin coordenadas o sin geocerca → informativa               | advertencia / info            | `FUERA_DE_SEDE` / `SIN_GPS` |
| RI5 | No existe otra carga del mismo equipo en los últimos 3 minutos                        | advertencia                   | `POSIBLE_DUPLICADO`         |
| RI6 | `finalizada_en − iniciada_en` entre 20 s y 60 min                                     | advertencia                   | `TIEMPO_ATIPICO`            |

Cálculo del perfil: `inventario_final = llegada + despachados` (una decimal, aritmética en décimas) — lo calcula el dominio para el feedback en pantalla y lo garantiza la base con la columna generada. `llegada_gal >= 0` es validación estructural de la API (llegar con 0 es válido). Estado resultante: igual que la regla general de arriba.

Flujo de pantalla del perfil (variante del §8.1): Inicio → Equipo → Operador → **Llegada** (foto inicial + «Galones con los que llegó») → Cargando → **Despacho** (foto final + «Galones despachados por Lubryco» + total al salir solo lectura) → Listo. No existen tanda ni totalizador en este perfil.

### OCR (opcional, después del demo)

Si se usa la API de Claude para pre-llenar las lecturas: el resultado va a `fotos.ocr_sugerido` y se muestra como **sugerencia que el conductor confirma o corrige**. Nunca es el dato oficial. Razón concreta: en la foto de referencia el último rodillo del totalizador está a mitad de giro, mostrando media cifra de dos dígitos. Ese es exactamente el caso donde el reconocimiento falla y el humano no.

---

## 8. Flujos de pantalla

### 8.1 Conductor (celular, una mano, guantes, sol directo)

Objetivo: menos de 40 segundos y cero teclado alfabético.

```
[1] INICIO
    Botón único, ancho completo: "Cargar combustible"
    Debajo: "Tus cargas de hoy: 3"  +  chip de estado de sincronización

[2] EQUIPO
    Cámara QR abierta de entrada. Escanea el sticker del equipo.
    Alterna a lista con búsqueda por código si el sticker está ilegible.
    Confirma: "T-04 · Tractor Massey 4292"

[3] CONDUCTOR
    Teclado numérico. Código + PIN. Recuerda el último del dispositivo.

[4] ANTES DE CARGAR
    Instrucción en una línea: "Deja la tanda en 0.0 y toma la foto."
    Cámara con marco guía rectangular sobre la carátula.
    Teclado numérico: TANDA (debe ser 0.0)  ·  TOTALIZADOR
    Valida R1 en vivo. El totalizador viene pre-llenado con el último
    valor conocido del dispensador; si el conductor lo cambia, se marca R2
    y aparece: "El medidor arrancó 18 gal más arriba de lo esperado.
    ¿Alguien cargó sin registrar? Puedes seguir; queda anotado."

[5] CARGANDO
    Pantalla de espera con cronómetro. Botón "Terminé de cargar".

[6] DESPUÉS DE CARGAR
    Cámara con el mismo marco guía.
    Teclado numérico: TANDA  ·  TOTALIZADOR
    R3 se evalúa al instante:
      ✓ "Cuadra: 42.5 galones."
      ✗ "La tanda dice 42.5 pero el totalizador subió 38. Revisa el número."
    Luego: horómetro u odómetro según el equipo (R7, R8).

[7] LISTO
    Resumen grande: 42.5 gal · T-04 · Jhon Cortés · 09:14
    Chip de estado: "Guardado" / "En cola, se sube cuando haya señal".
    Regresa a [1].
```

Detalles no negociables:

- **Solo cámara en vivo.** Nunca `input` de galería. Con galería, en dos semanas están reciclando fotos viejas.
- **Offline por defecto.** La red es la excepción, no el supuesto. Cola en IndexedDB, subida en segundo plano, indicador visible del pendiente. Si la app depende de conexión, el primer día sin señal vuelven al papel y no se recuperan.
- Botones grandes, contraste alto, cero animación decorativa.

### 8.2 Supervisor del cliente (dashboard web)

Cuatro pestañas. Cada una abre con el **veredicto del sistema antes que los datos** — una frase que diga qué está pasando y qué hacer.

| Pestaña        | Veredicto de arriba                                               | Contenido                                                                                      |
| -------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Hoy**        | Existencia estimada, días de autonomía, cuántas cargas no cuadran | Totalizador actual en dígitos de rodillo, consumo de los últimos 14 días, cargas del día       |
| **Cargas**     | Cuántas cuadran de cuántas, y qué falta                           | Tabla con estado, click abre detalle con las dos fotos, las cuatro lecturas y las banderas     |
| **Equipos**    | Qué equipo se salió de su patrón de gal/hora                      | Tabla con galones, horas/km, gal/h, desvío contra su propio histórico y contra equipos gemelos |
| **Suministro** | Cuándo fue la última entrega y cuándo se necesita la próxima      | Remisiones de Lubryco, balance entregado − despachado, botón "Pedir a Lubryco"                 |

### 8.3 Lubryco (vista interna, se alimenta del mismo dato)

Una tabla de clientes con: consumo promedio diario, existencia estimada, días de autonomía, fecha sugerida de próxima entrega, y semáforo de reorden. Es lo que convierte esto de un regalo simpático en **inventario administrado por proveedor**.

---

## 9. Cálculos

```
despachado_total      = dispensadores.tot_actual_gal − tot_instalacion_gal
entregado_total       = Σ entregas.galones (desde la instalación)
existencia_estimada   = entregado_total − despachado_total + existencia_inicial

consumo_diario        = despachado en los últimos 7 días / 7
autonomia_dias        = existencia_estimada / consumo_diario
fecha_reorden         = hoy + (autonomia_dias − dias_lead_time − dias_colchon)
                        con dias_lead_time = 2 y dias_colchon = 2

-- Eficiencia por equipo
gal_por_hora  = Σ galones / Δ horómetro     (equipos con horómetro)
gal_por_km    = Σ galones / Δ odómetro      (vehículos con odómetro)
desvio_pct    = (gal_por_hora_actual / mediana_historica_del_equipo − 1) * 100
```

`existencia_estimada` es **estimada**, no medida: sin aforo del tanque arrastra el error del medidor (~1%) y cualquier existencia inicial no contabilizada. La UI debe rotularla como estimada. Cuando lleguen las medidas del tanque, la tabla de aforo la convierte en medida y este cálculo pasa a ser el contraste.

**Definir la tolerancia de varianza en 1.5–2%.** Si se le promete al cliente que va a cuadrar exacto, en dos semanas están persiguiendo fantasmas y culpando a Lubryco.

---

## 10. Sincronización offline

```
1. El registro se arma completo en memoria y se valida localmente.
2. Se guarda en Dexie: cargas_pendientes + blobs de fotos.
3. Un worker intenta subir: fotos a Storage primero, luego el registro con las rutas.
4. Idempotencia: la app genera el uuid de la carga. Reintento = mismo id, upsert.
5. Backoff exponencial, tope 5 minutos. El indicador muestra siempre el pendiente.
6. Al aceptar el servidor, se borra el blob local (conservando el resumen 7 días
   para que el conductor pueda ver lo que registró).
7. El servidor revalida R1–R12 con su propio tot_actual_gal. Si el orden de
   llegada cambió el resultado, se recalcula estado y banderas en el servidor.
   El servidor es la autoridad.
```

---

## 11. Etapas de implementación

| Etapa | Alcance                                                             | Criterio de terminado                                                        |
| ----- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **0** | Esquema Supabase + RLS + seed con los equipos reales de El Trébol   | Un `insert` de carga desde SQL dispara triggers y actualiza `tot_actual_gal` |
| **1** | Flujo de conductor completo, offline, con R1–R12                    | 10 cargas registradas en modo avión y sincronizadas al recuperar señal       |
| **2** | Dashboard del cliente, 4 pestañas                                   | Reproduce el diseño aprobado con datos reales                                |
| **3** | Entregas de Lubryco + balance + alerta de reorden                   | La alerta salta con la autonomía calculada                                   |
| **4** | Vista Lubryco multicliente                                          | Se integra a StationOS                                                       |
| **5** | Aforo del tanque, OCR sugerido, verificación trimestral del medidor | Cuando lleguen las medidas del tanque                                        |

---

## 12. Qué falta pedirle a El Trébol

1. Inventario de equipos: código interno, descripción, categoría, horómetro u odómetro, capacidad del tanque propio.
2. Nombres de conductores autorizados.
3. Lectura del totalizador y fecha del día de instalación del dispensador (para el punto cero del balance).
4. ¿La segunda manguera que aparece en la foto es un segundo punto de despacho o es la succión? Define si hay uno o dos dispensadores.
5. Cargas por día en zafra vs. temporada baja (dimensiona storage y ritmo de sincronización).
6. Coordenadas de la estación para la geocerca.
7. Quién transcribe hoy las planillas. Ese es el aliado interno: el sistema le borra el trabajo manual y va a ser quien obligue a los conductores a usarlo.
8. Medidas del tanque cuando se puedan tomar: diámetro, largo, extremos planos o abombados.

---

## 13. Convenciones de código

- Todo en español: nombres de tablas, columnas, variables de dominio, textos de UI.
- Zona horaria `America/Bogota`. Se guarda `timestamptz`, se muestra local.
- Galones con **una decimal** en toda la cadena. Nunca `float` para volúmenes: `numeric`.
- Formato numérico colombiano en pantalla: punto de miles, coma decimal (`1.847,6`).
- Toda regla de validación vive en **un solo módulo compartido** (`src/dominio/validacion.ts`), importado por la app y por la Edge Function. Una regla, un lugar.
- Tests obligatorios sobre R1–R12 con casos límite: rodillo a mitad de giro, tanda 0.0 exacta, totalizador que da la vuelta en 999999.
