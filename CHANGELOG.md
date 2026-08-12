# Changelog

Registro de cambios relevantes por etapa del roadmap de CuadreApp.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [Sin publicar]

### Agregado
- `docs/PRODUCT_BIBLE.md`: visión, objetivo, problema, usuarios, casos de uso, reglas de negocio, arquitectura, roadmap, decisiones y glosario del producto.
- `CLAUDE.md`: convenciones de trabajo y ritual de cierre de etapa.

### Decidido
- CuadreApp es completamente independiente de StationOS. Cualquier integración futura será únicamente vía API REST propia, sin compartir tablas, código, autenticación ni repositorio. (DEC-002)
- Cliente móvil construido como PWA (React + TypeScript + Vite + Tailwind), no React Native + Expo, para esta etapa del proyecto. (DEC-001)
- Autenticación con Supabase Auth; autorización con RBAC propio en base de datos (`roles`/`usuarios`/`dispositivos`), nunca en mecanismos específicos del framework. (DEC-004)
- Hosting en tres capas: PWA/dashboard en Vercel, API propia en Railway, base de datos y autenticación en Supabase; arquitectura preparada para un futuro cliente Expo/EAS. (DEC-005)
- Monorepo con pnpm workspaces desde el inicio, estructura pensada para escalar. (DEC-006)

## [Etapa 0] — Esquema Supabase, RLS y trigger

### Agregado
- Estructura del monorepo (pnpm workspaces): `apps/pwa`, `apps/api`, `packages/dominio`, `packages/tipos-bd` (placeholders hasta la Etapa 1) y `supabase/` inicializado.
- `supabase/migrations/`: esquema inicial completo (§6 de la especificación técnica, más `roles`/`usuarios`/`dispositivos` de DEC-004), RLS por `cliente_id` y por rol en todas las tablas, y el trigger que actualiza `dispensadores.tot_actual_gal` al aceptar una carga.
- `supabase/seed.sql`: datos de demostración (cliente, sede, dispensador, equipos, conductores) con la misma forma que el inventario real pendiente de El Trébol.
- `supabase/verificacion_etapa0.sql`: script manual que prueba el criterio de terminado de la etapa (insert de carga → trigger actualiza `tot_actual_gal`).

### Pendiente
- Ejecutar `supabase/verificacion_etapa0.sql` contra una base de datos real: este entorno de desarrollo no tenía Docker ni Postgres nativo disponibles para correr `supabase start`. El script fue revisado a mano pero no ejecutado.
- Sembrar `usuarios` y `dispositivos`: requiere cuentas reales de Supabase Auth (login de dashboard y enrolamiento de dispositivo), que llegan en las Etapas 1 y 2.
- Inventario real de El Trébol (equipos, conductores, lectura de instalación del dispensador, coordenadas de sede) — ver `docs/PRODUCT_BIBLE.md` §12.

## [Pre-Etapa 1] — Arquitectura congelada

### Decidido
- DEC-001 revisada por el propietario del producto: la PWA es la plataforma del **MVP**, no una decisión permanente. Al finalizar el MVP se hará una evaluación técnica PWA vs. React Native + Expo; la arquitectura debe soportar ambas alternativas con el menor impacto posible.
- DEC-003 cerrada como Aceptada (reglas R1–R12 en `packages/dominio`, compartidas entre cliente y API) — reforzada y generalizada por DEC-009.
- DEC-007: reglas de dependencias del monorepo — solo `apps/* → packages/*`; `packages/tipos-bd` como hoja; grafo de paquetes acíclico; cero imports entre `apps/pwa` y `apps/api` (comunicación solo por HTTP).
- DEC-008: versionado de la API bajo `/api/v1/` desde el primer día; las versiones futuras convivirán sin romper compatibilidad.
- DEC-009: **API First** — toda funcionalidad de negocio se implementa primero en la API; la PWA nunca accede directamente a Supabase para operaciones de negocio; Supabase es infraestructura; la API es la única autoridad para validaciones, reglas de negocio, escritura, auditoría y permisos.
- DEC-010: **Tests First** — toda regla de negocio en `packages/dominio` se escribe con pruebas primero (rojo → implementación → verde → refactor → documentación); cada regla R1–R12 con pruebas unitarias independientes; casos límite de la especificación obligatorios; toda corrección futura empieza con una prueba que reproduzca el problema.

Con este registro la arquitectura queda congelada. Cualquier cambio estructural posterior requiere una decisión nueva en `docs/PRODUCT_BIBLE.md` §9.

## [Etapa 1 — Dominio] — R1–R12 aprobadas y congeladas

### Agregado
- `@cuadreapp/dominio`: las 12 reglas de validación como funciones puras independientes más `validarCarga`, con ciclo Tests First completo (rojo → verde), 77 pruebas y cobertura 100% de `validacion.ts`. Casos límite obligatorios del §13 cubiertos.
- Catálogo de banderas ampliado a 15: se agregan `SALTO_TOTALIZADOR_NEGATIVO`, `TOTALIZADOR_SIN_AVANCE` y `SIN_GPS` (clase `info`, no afecta el estado).

### Decidido
- Precisiones aprobadas sobre R2, R4, R8, R9, R10, R11 y la vuelta del totalizador — registradas en `docs/PRODUCT_BIBLE.md` §6; donde difieran de la especificación técnica §7, las precisiones mandan.
- **Reglas de negocio congeladas** (31-jul-2026): cualquier modificación futura requiere una nueva prueba, actualización del Product Bible, y una nueva DEC si cambia el comportamiento.
- DEC-011: **Thin API** — la API es solo un orquestador (autenticación, autorización, validación estructural, invocar dominio, persistencia, auditoría, respuesta HTTP); nunca contiene, duplica ni reinterpreta reglas de negocio.

## [Etapa 1 — API] — POST /api/v1/cargas aprobada

### Agregado
- `apps/api`: Fastify + zod + pg con composición inyectable; `POST /api/v1/cargas` (validación estructural, idempotencia por uuid del cliente, contexto y tenant resueltos en la base, única invocación a `validarCarga`, persistencia transaccional carga + fotos); 13 pruebas HTTP con repositorio en memoria.
- Observabilidad por defecto vía middleware: request_id en toda respuesta, evento estructurado por petición con duración, resultado, banderas del dominio y versiones de API/dominio.

### Decidido
- DEC-012: **Observabilidad por defecto** — trazabilidad completa por middleware, sin fotos/tokens/datos sensibles; `request_id` en cada respuesta.

## [Etapa 1 — PWA] — Flujo del conductor aprobado

### Agregado
- `apps/pwa`: los 7 pasos del flujo del conductor con UI guiada exclusivamente por el resultado del dominio; cola offline en Dexie con contexto local encadenado (cargas consecutivas en modo avión no marcan saltos falsos); sincronizador con backoff exponencial (tope 5 min) y recuperación automática al volver la señal; cliente del `POST /api/v1/cargas` idempotente. 13 pruebas con fake-indexeddb.

## [Etapa S — Seguridad e Identidad]

### Decidido
- DEC-013: **Security First** — ninguna funcionalidad nueva accede a la API sin autenticación; Supabase Auth mediada por la API; la PWA nunca almacena credenciales (solo tokens); autorización siempre vía RBAC propio en la API; `POST /api/v1/cargas` queda protegido.
- DEC-014: **TokenStore** — abstracción única de tokens en la PWA (access en memoria, refresh local con rotación; limitación del navegador documentada; SecureStore al migrar a React Native sin tocar el resto del código) + un único cliente HTTP para todo acceso a la API. Ningún componente React toca tokens.

### Agregado
- Migración `20260731110000_seguridad.sql`: catálogo RBAC en base (`permisos`, `rol_permisos`) y `codigos_enrolamiento` de un solo uso, con RLS denegado por defecto.
- API: middleware de autenticación (verificación local de firma JWT) y de autorización RBAC resuelto contra la base; endpoints `auth/login`, `auth/refresh`, `auth/logout`, `me`, `dispositivos/enrolar`, `catalogo` y `cargas/:id/fotos/:momento`; `POST /api/v1/cargas` protegido con verificación de alcance de sede; observabilidad ahora con `usuario_id`. Proveedor de identidad (GoTrue) y almacén de fotos (Storage) detrás de interfaces inyectables. 39 pruebas en la API.
- PWA: `TokenStore` con access solo en memoria y refresh local; `ClienteHttp` único (renovación single-flight con margen de 60 s, un solo reintento ante 401, clasificación de errores); `ServicioSesion` (enrolar, recuperación al abrir, catálogo cacheado, cierre que preserva la cola); verificación offline del PIN contra `pin_hash` (bcrypt); el sincronizador sube las fotos primero, confirma las rutas que decide la API y borra los blobs tras la aceptación (spec §10.3/§10.6); pantallas de enrolamiento y sesión vencida. 29 pruebas en la PWA.

### Pendiente
- Verificación de punta a punta contra un proyecto real de Supabase (Auth, Storage y Postgres) y despliegue a Railway/Vercel: este entorno no tiene Docker ni infraestructura activa.

## [Etapa H — Hardening de Producción]

### Agregado
- Calidad automatizada: ESLint 9 + Prettier en todo el monorepo; dependency-cruiser convierte DEC-007 en chequeo de máquina; pipeline de CI (lint, formato, fronteras, typecheck, pruebas, build); script `pnpm verificar`.
- Hardening de la API: variables de entorno tipadas/validadas (zod, fallo de arranque con nombre exacto), rate limiting por IP en login/refresh/enrolar (10/min), headers de seguridad (helmet), `/salud` (liveness) y `/listo` (readiness con verificación de base), logging estructurado del ciclo de vida, manejador de errores sin fuga de detalle, apagado ordenado ante SIGTERM. 9 pruebas nuevas.
- Migración del bucket privado `fotos-cargas` (2 MB, solo webp, sin acceso de Data API).
- Suite E2E condicionada a credenciales reales (`pnpm --filter @cuadreapp/api e2e`): trigger de la Etapa 0 con repositorios reales, catálogo, identidad de dispositivo en GoTrue y escritura al bucket. Sin credenciales queda en skipped, nunca en falso verde.
- Configuración de despliegue: `railway.json` (healthcheck `/listo`) y `apps/pwa/vercel.json` (CSP estricta + headers + SPA).
- `docs/OPERACIONES.md`: topología, variables, puesta en marcha, verificación, respaldos (RPO/RTO) y recuperación.

### Pendiente
- Ejecutar sobre infraestructura viva: despliegues de prueba, E2E real, backups activos y fijar el `connect-src` de la CSP al dominio real de la API. Es el primer paso del piloto (ver Production Readiness Report).

## [Dashboard — Frontend] (en curso)

### Decidido
- DEC-015: **PWA y Dashboard son aplicaciones separadas** — `apps/dashboard` con build, despliegue, router, ciclo de vida y configuración propios; comparten únicamente paquetes del monorepo (dominio, tipos-bd, futuro ui, y cliente HTTP/contratos cuando se extraigan a paquete). Reemplaza la ruta `/tablero` dentro de la PWA del spec §4.

### Agregado
- `docs/DASHBOARD_ARQUITECTURA.md` (v1.1): arquitectura aprobada del Dashboard — módulos, rutas, design system, capa de datos por puertos y adaptadores con `FuenteSimulada`, patrón `Consulta<T>`, responsive y accesibilidad.
- `apps/dashboard`: aplicación completa con datos simulados — 4 pestañas (Hoy, Cargas, Equipos, Suministro) + detalle de carga con fotos, lecturas y candados; design system con los tokens del mockup (Rodillo, VeredictoBanner, ChipEstado, BarrasConsumo, Candados); esqueletos, estados vacíos y de error con reintento (`?simular-error`); filtros en la URL; responsive móvil/escritorio; escenario determinista cuya aritmética cierra y cuyos veredictos calcula `@cuadreapp/dominio`. 15 pruebas de coherencia. Regla de fronteras generalizada: ninguna app importa a otra app; build del Dashboard en CI.

## [RC1 — Release Candidate] (en curso)

### Agregado
- `docs/RC1_RELEASE_AUDIT.md`: auditoría de liberación con hallazgos verificados en código (3 críticos, 7 importantes), riesgos por categoría, checklist Go/No-Go, planes de instalación/primer día/contingencia, criterios de éxito y métricas del piloto, y mejoras priorizadas para v1.1. Veredicto: **NO-GO, 68/100**, con camino explícito a >90.
- `docs/ROADMAP_RC1_TO_GO.md`: plan oficial aprobado para pasar de 68 a >90 — cinco fases con tareas, dependencias, esfuerzo y criterio de terminado: A correcciones críticas (+4), B infraestructura real (+8, única fase bloqueada por cuentas externas), C integración del Dashboard sin tocar componentes (+9), D piloto interno con las 10 cargas offline (+3), E preparación del cliente (+3).

### Fase A completada (correcciones críticas)
- A1: la API acepta jpeg/png además de webp (Safari/iOS no exporta WebP); extensión del objeto según tipo real; bucket actualizado por migración.
- A2: el "hoy" del negocio usa `America/Bogota`, nunca UTC (el bug rotaba el día a las 7 p. m.).
- A3: `navigator.storage.persist()` al enrolar + aviso cuando el navegador lo niega — la cola offline es la evidencia probatoria.
- A4: `bodyLimit` de fotos alineado al contrato de 2 MiB.
- A5: íconos de instalación (192/512/maskable/apple-touch + favicon SVG) generados desde la marca del mockup.
- 17 pruebas nuevas, todas rojo→verde. Puntuación RC1: **68 → 72/100**.

### Fase B — cierre de infraestructura real (2-ago-2026)
- E2E de producción ejecutado de punta a punta con evidencia (14/14): sign-ups cerrados, enrolamiento real contra GoTrue, RBAC desde la base, catálogo con seed, fotos verificadas EN Storage, carga con veredicto del dominio, idempotencia, y el trigger de `tot_actual_gal` avanzando en producción (el criterio de la Etapa 0, por fin verificado en real). Limpieza total: cero rastro del E2E.
- Tres bugs de producción encontrados y corregidos en el acto: (1) sin CORS, el navegador bloqueaba toda llamada PWA→API — allowlist con `@fastify/cors`, jamás `*`; (2) la PWA compilada apuntaba a localhost — `VITE_API_URL` fijada en Railway; (3) **toda petición autenticada fallaba con 401**: el proyecto firma ES256/JWKS (default de proyectos nuevos de Supabase) y la API solo verificaba HS256 — el middleware ahora decide por el header del token. 6 pruebas nuevas (192 en el monorepo).
- Pendiente de la Fase B: B10 — backups activos y una restauración de prueba (acción del propietario en el dashboard de Supabase).

## [Etapa P — Perfiles Operativos e identidad de cliente] (en curso)

### Decidido
- DEC-016: **Perfiles Operativos** — cada cliente tiene exactamente un perfil (`clientes.perfil_codigo`); cada carga guarda el suyo como snapshot y la historia nunca se reinterpreta. Un perfil es código versionado y probado más una fila administrativa que la consola solo asigna. Códigos de perfil únicamente en cuatro puntos de despacho; prohibido condicionar por cliente en cualquier capa. Perfiles iniciales: `medidor_doble` (El Trébol) y `carga_inventario` («Carga sobre Inventario», Sacyr — nombre visible aprobado, código congelado).
- DEC-017: **Identidad visual por cliente** — logo como archivo real en el bucket privado `logos-clientes` (la clave del objeto en `clientes.logo_url`, nunca base64 ni URLs públicas permanentes), URL firmada temporal resuelta por la API, fallback a iniciales, formatos PNG/JPEG/WebP con límite 1 MB (SVG excluido hasta tener sanitización segura). La identidad viaja por datos en catálogo/sesión.

### Agregado
- Documentación de la etapa: reglas RI del perfil «Carga sobre Inventario» en Product Bible §6 y ESPEC §7 (addendum), cambios de esquema en ESPEC §6 (addendum), etapa P en el roadmap, DEC-016/DEC-017 en §9, glosario actualizado.
- BD (migración idempotente `20260804090000`): catálogo `perfiles_operativos` con seed, `clientes.perfil_codigo`, snapshot `cargas.perfil_codigo`, `llegada_gal` + `inventario_final_gal` **generada** (la base garantiza llegada + despachados), CHECK de forma por perfil que endurece la integridad de El Trébol, `sedes.activo/ciudad/direccion/referencia`, bucket privado `logos-clientes` (1 MB, png/jpeg/webp, SVG excluido). `supabase/verificacion_perfiles.sql` con la evidencia 150 + 600 = 750 y el CHECK rechazando formas inválidas. Cero cambios en el trigger, `fotos` y el RLS de `cargas`.
- Dominio (Tests First, 44 pruebas nuevas — 123 en total): reglas RI1–RI6 del perfil nuevo, `calcularInventarioFinal`, registro `PERFILES`/`validarSegunPerfil` (único punto de despacho del dominio) y la PRUEBA DORADA que garantiza que despachar `medidor_doble` por el registro es exactamente `validarCarga`. R1–R12 sin cambio de comportamiento (helpers compartidos extraídos a `nucleo.ts`, refactor puro).
- API: `POST /api/v1/cargas` despacha por el perfil de la SESIÓN (esquema, contexto, dominio y columnas por perfil; responde `inventario_final_gal`); catálogo con cliente (logo como URL firmada, jamás la clave), perfil y sede visible; `GET /admin/perfiles`; clientes con perfil y logo (subir/reemplazar/eliminar, números mágicos, 413 sobre 1 MB); sedes con identidad, PATCH y sede sin dispensador para perfiles sin medidor; evento de observabilidad con `perfil`; CORS gana PATCH/PUT/DELETE. 97 pruebas.
- Consola Admin: selector de Perfil Operativo con la advertencia aprobada al cambiar el perfil de un cliente con historia; logo con vista previa/reemplazo/eliminación/estados/validación y fallback a iniciales; sedes completas (ciudad, dirección, referencia, activar/desactivar); el dispensador y su totalizador inicial solo cuando el perfil requiere medidor (`PERFILES.requiereMedidor`); la pestaña Sacyr se convierte en **Tablero** genérico por cliente con selector y columnas Llegó con / Despachado / Total al salir cuando la historia las trae.
- PWA: refactor neutral primero (secuencia del wizard como dato, tipo de paso único, derivaciones probadas equivalentes) y luego el flujo «Carga sobre Inventario»: pantallas Llegada y Despacho (total al salir calculado, solo lectura), payload por perfil, cola offline sin espejo de dispensador, recibo Llegó/Despachado/Total, logo del cliente cacheado como bytes para operar offline y sede visible nombre + ciudad. 128 pruebas — las suites de navegación/fidelidad/borrador sin cambiar expectativas.
- Dashboard: contrato con `identidad()` (cliente, sede, logo, perfil, medidor) e `inventario` por carga; `EvidenciaInventario` (Llegó con / Despachado por Lubryco / Total al salir, fotos, duración, observaciones); el marco toma la identidad de la fuente con fallback a la de demostración — el diseño aprobado de El Trébol visualmente intacto; Excel con nombre de archivo derivado del cliente. 31 pruebas.
- Gate: `pnpm sin-clientes` (nuevo paso de `pnpm verificar`) — prohibición de nombres de cliente en el código convertida en chequeo de máquina, con lista explícita de lugares donde el nombre es dato de demostración.

### Pendiente
- Sobre infraestructura real (acciones con credenciales del propietario): aplicar la migración de la Etapa P, correr `supabase/verificacion_perfiles.sql`, E2E de ambos perfiles, crear el cliente Sacyr con su perfil/sede/logo desde la consola y enrolar su dispositivo.
- Indicadores diarios del Dashboard por perfil (volumen total de salida, carrotanques atendidos): llegan con la conexión del Dashboard a la API (Fase C), que es cuando el tablero deja los datos simulados.

## [Etapa P.1 — Generalización del cliente + identidad corporativa] (en curso)

### Decidido

- DEC-018: **Identidad corporativa por cliente y Dashboard de Cliente único** — identidad y comportamiento provienen solo de la base; tematización restringida a `color_primario`/`color_secundario` con todo lo demás derivado del Design System (nunca CSS libre); ficha del cliente en tres bloques (Identidad / Configuración / Operación) + Dashboard, con navegación de ERP; el Perfil Operativo pasa de identidad a Configuración; jerarquía congelada Cliente → Sedes → Equipos → Operadores → Dispositivos con `sede_id` opcional en equipos y operadores (null = todas las sedes — permite compartidos y exclusivos; decisión permanente, no un requerimiento del piloto); el guard `pnpm sin-clientes` se amplía a patrones de lógica por cliente, con fixtures/demo/comentarios/documentación permitidos.

### Agregado

- BD (migración idempotente `20260805090000`): `clientes.nombre_comercial`, `color_primario` y `color_secundario` con CHECK `#RRGGBB`; `equipos.sede_id` y `conductores.sede_id` opcionales (null = todas las sedes del cliente).
- API: CRUD de clientes con identidad completa (colores validados como hex — nunca CSS libre en la base); equipos y operadores con sede opcional; el catálogo del dispositivo entrega la identidad del cliente y filtra equipos/operadores por SU sede más los compartidos. 7 pruebas nuevas (104 en la API).
- Consola: **ficha ERP del cliente** en `/clientes/:id` con Identidad (logo, colores con selector, vista previa y advertencia de contraste, datos legales), Configuración (Perfil Operativo — reclasificado desde Identidad — y base de reglas futuras), Operación (Sedes → Equipos → Operadores → Dispositivos con alcance del cliente y asignación de sede) y su Dashboard de Cliente. La lista de clientes queda como índice del ERP; desaparecen la ruta `/sacyr` y la pestaña global Tablero.
- `TemaCliente` (consola y Dashboard): deriva de los dos colores TODAS las variables de la UI —hover, activo, superficie, borde, sombra, gradiente y el color de texto legible por contraste WCAG—. Un color inválido cae a la paleta CuadreApp en vez de inyectarse; el subrayado de navegación sigue siendo identidad de CuadreApp (solo cambia la identidad del cliente, no la experiencia). 10 pruebas por app.
- Dashboard: marco con identidad NEUTRA (cero nombres de cliente en el código); la tarjeta del cliente aparece solo cuando hay identidad; `contexto-cliente.ts` queda declarado como datos de demostración con sus colores. 41 pruebas.
- PWA: el catálogo trae nombre comercial y color primario; la cabecera usa el acento del cliente en su chip de identidad. 130 pruebas.
- Guard ampliado (`pnpm sin-clientes`): además de nombres de cliente, ahora detecta **patrones de lógica por cliente** en TODO el código (comparaciones sobre `cliente.nombre`, `switch(cliente)`, constantes tipo `CLIENTE_PILOTO`), sin excepciones de ruta. Verificado que falla el build ante cada patrón.

### Pendiente

- Sobre infraestructura real: aplicar la migración `20260805090000` y configurar la identidad de los clientes reales desde la consola.
- Unificación de `tema-cliente.ts` (hoy duplicado en consola y Dashboard) en el paquete de UI compartida previsto por DEC-015, cuando el Dashboard se conecte a la API (Fase C).

## [Etapa P.2 — Dashboard de Cliente multiempresa] (5-ago-2026)

### Decidido

- DEC-020: **la empresa la decide la sesión, no la URL** — un único Dashboard para todos los clientes, sin subdominio, ruta, parámetro ni despliegue por cliente; aislamiento estructural (toda consulta se parametriza con el `cliente_id` de la sesión; la petición no tiene dónde nombrar otro cliente); el Perfil Operativo declara la composición del tablero y la evidencia de una carga la decide el snapshot de SU perfil; permiso `tablero.leer` solo para `supervisor` y `admin_cliente` — `admin_lubryco` queda fuera a propósito y su vista es la previa de la consola; cifras sin línea base se declaran desconocidas en vez de inventarse.

### Agregado

- Dominio: el registro de perfiles declara la **composición del tablero** — módulos, paneles de Hoy, columnas de cifras y vista de evidencia — con vocabulario congelado en `tipos.ts` y `composicionTablero()`. 5 pruebas nuevas (127).
- BD (migración idempotente `20260805120000`, **sin aplicar**): permiso `tablero.leer` otorgado a `supervisor` y `admin_cliente`; índices de lectura por `(cliente_id, sede_id, finalizada_en)`, entregas por cliente/fecha y cargas con contador. Cero tablas y cero columnas nuevas: el esquema ya era multiempresa desde la Etapa 0. `supabase/verificacion_tablero.sql` prueba el aislamiento creando un segundo cliente con datos propios.
- API: `/api/v1/tablero/*` — contexto, hoy, cargas, detalle, equipos y suministro. El alcance sale siempre de la sesión; una sede ajena responde 403 y una carga ajena responde el mismo 404 que una inexistente. La composición del tablero se transporta desde el dominio, no se decide en la API. Agregados de reporte (consumo por día en zona horaria de Bogotá, mediana histórica de rendimiento por equipo con `lag`/`percentile_cont`, balance) en un repositorio de lectura propio. 26 pruebas nuevas (130 en la API).
- Dashboard: login propio con TokenStore y renovación (DEC-014); `FuenteApi` contra la API real; contexto de empresa resuelto una vez y consumido por todo el tablero; **registro de vistas por perfil** (`src/perfiles/`) como cuarto punto de despacho de DEC-016; selector de sede cuando la sesión no fija una; panel de inventario del día con capacidad y % de llenado; tabla de equipos que muestra desvío o llenado según lo que el equipo mida; cuatro pantallas de acceso denegado con su propia explicación. 41 pruebas nuevas (82).
- Consola: la pestaña Dashboard de la ficha pasa a **vista previa administrativa** con «Abrir Dashboard» y «Copiar enlace» hacia el Dashboard oficial (`VITE_DASHBOARD_URL`). 4 pruebas nuevas (26), una de ellas afirma que el enlace no lleva identificador de cliente.
- `docs/OPERACIONES.md` §8: alta de un supervisor en el Dashboard (incluida la elección deliberada de `sede_id` null para ver todas las sedes) y variables de entorno de los tres frontends.

### Cambiado

- El Dashboard deja de depender de datos simulados: el escenario determinista y su fuente se mueven a `src/pruebas/` como fixtures que cumplen el mismo contrato (si el contrato cambia, dejan de compilar). Desaparecen `datos/contexto-cliente.ts` y el chip «Demo» del marco.
- El guard `pnpm sin-clientes` pierde sus tres excepciones de producción: ya no hay ningún archivo de producción que necesite nombrar a un cliente.
- `docs/DASHBOARD_ARQUITECTURA.md` v2.0: la fase de datos simulados cumplió su promesa —conectar la API real fue una línea en `main.tsx`— y el documento pasa a describir el Dashboard multiempresa.

### Corregido

- **CSP bloqueaba las imágenes firmadas de Storage.** El Dashboard y la consola muestran el logo del cliente y la evidencia fotográfica como URLs firmadas de Supabase (DEC-017), pero la política declaraba `img-src 'self' data: blob:`: en producción el navegador las bloqueaba en silencio. Defecto **preexistente en la consola** desde la Etapa P, que la Etapa P.2 hereda al Dashboard. Ahora `img-src` admite `https://*.supabase.co` y hay pruebas que leen la política de los archivos reales (`servidor.mjs` y `vercel.json`) y verifican además que ambas configuraciones sean idénticas — en desarrollo no hay CSP, así que ninguna prueba de UI lo habría notado.

### Pendiente

- Sobre infraestructura real: aplicar `20260805120000_tablero_cliente` (sin ella el login funciona y el tablero responde 403), correr `supabase/verificacion_tablero.sql`, dar de alta un supervisor real y hacer el humo post-despliegue.
- `VITE_API_URL` en el servicio del Dashboard y `VITE_DASHBOARD_URL` en el de la consola: hasta ahora el Dashboard no necesitaba variables (fase simulada).
- La pestaña Suministro queda con su estado vacío hasta la Etapa 3: no existe todavía quién registre entregas, y sin ellas la existencia estimada y la autonomía se muestran «—».

## [Post-despliegue P.1] — Dirección registrada y corrección del E2E

### Decidido

- DEC-019 (**solo documental, sin implementación**): la siguiente evolución natural de la plataforma es introducir **Organización** por encima de Cliente (`organizaciones` + `clientes.organizacion_id` nullable), quedando la jerarquía Organización → Cliente → Sedes → Equipos → Operadores → Dispositivos. Compatibilidad obligatoria: el tenant y el RBAC siguen siendo el cliente, la identidad corporativa y el Perfil Operativo siguen perteneciendo al cliente, y todo es aditivo (cero cambios en `cargas`, en el dominio y en el contrato `/api/v1`). No se implementa nada hasta que exista un grupo empresarial real y una decisión explícita.

### Corregido

- **El E2E contaminaba producción**: no tenía limpieza, así que cada corrida dejaba una carga fantasma contra el dispensador real de El Trébol y adelantaba `tot_actual_gal` (lo que habría hecho que la siguiente carga real disparara un `SALTO_TOTALIZADOR` falso). Ahora la limpieza es obligatoria, corre siempre —incluso si la prueba falla— y si falla deja el E2E en rojo. El dato de producción fue restituido: 4 cargas reales, totalizador 1255,0, cero residuo.
- **Consulta del E2E no correlacionada**: el producto cartesiano `from dispensadores d, equipos e, conductores c` con `limit 1` elegía un dispensador de cualquier cliente y volvía la prueba intermitente en cuanto hubo más de uno en la base. Ahora los joins exigen el mismo cliente.

### Desplegado (4-ago-2026)

- Migraciones aplicadas sobre `cuadreapp-prod`: `20260803090000` (módulo Admin — **nunca se había aplicado**), `20260804090000` (perfiles operativos) y `20260805090000` (identidad corporativa). Idempotencia verificada re-ejecutando el SQL y comparando esquema y datos: idénticos.
- Cuatro servicios de Railway desplegados desde el commit `7de8fda`, todos en SUCCESS: API (`/salud` y `/listo` con base conectada), PWA, Dashboard y Admin.
- Verificación de producción en verde: 150 + 600 = 750 en la columna generada, CHECK por perfil rechazando formas inválidas, CHECK de color rechazando CSS libre, E2E 4/4 en tres corridas consecutivas y cero regresiones en El Trébol.

## [Etapa T1 — Training Kit v1.0] — Sistema de manuales sincronizado

### Agregado

- `docs/training/`: sistema que genera y mantiene los manuales, no una carpeta de manuales sueltos. Fuente de verdad en `00_Fuente/` (catálogo de pantallas con su archivo de código, biblioteca de callouts, de errores y de preguntas), siete manuales que solo referencian por ID, y material de apoyo (layouts, checklists, troubleshooting, storyboards, índice de exportación).
- `scripts/verificar-training-kit.mjs`: hace comprobable la promesa de sincronía — cada pantalla del catálogo apunta a un archivo de código que existe, cada referencia de un manual existe en el catálogo, y cada manual trae sus secciones y sus archivos de apoyo. **No está enganchado a `pnpm verificar`**: el kit es documentación y no debe romper el build del producto.

## [Etapa T2 — Training Experience v2.0] — De explicar pantallas a enseñar a trabajar

### Cambiado

- **El eje del kit dejó de ser la pantalla y pasó a ser el momento.** Nuevo `00_Fuente/catalogo-momentos.md` con 30 momentos del mundo real (`M-MD-*`, `M-CI-*`, `M-OP-E*`, `S-*`, `A-*`). El catálogo de pantallas no desapareció: cambió de papel, de índice del curso a índice técnico que garantiza la sincronía con el código. La razón es que nadie piensa «estoy en la pantalla del PIN»: piensa «llegó el carrotanque», y esa traducción forzada era donde se perdía quien estaba aprendiendo.
- **Los siete manuales reorganizados por proceso.** Operadores en capítulos que siguen la jornada, cada uno con sus ocho elementos obligatorios (objetivo, qué está ocurriendo, qué debe hacer, qué nunca debe hacer, qué verá en la aplicación, qué verá físicamente, resultado esperado, errores frecuentes). Supervisores por decisión (si ve esto → qué significa → qué revisar → qué decidir → a quién llamar → qué no hacer). Administrador por procesos completos, de la llamada comercial a la primera carga registrada.
- **Los 66 callouts reescritos en lenguaje de operador**: verbo en imperativo primero, cero nombres de interfaz, una idea por callout, máximo 15 palabras, y la consecuencia en vez de la regla.
- **Errores y preguntas frecuentes indexados por la frase con que se reportan**, no por la causa técnica: «se me borró todo», no «fallo de persistencia del almacenamiento local». Las preguntas pasaron de `F-*` a `P-*` porque `F-` ya identificaba fotografías.
- `scripts/verificar-training-kit.mjs` ahora verifica el eje nuevo: que cada momento del catálogo lo cubra al menos un curso (un momento huérfano es una parte del trabajo que no le estamos enseñando a nadie), que cada capítulo traiga los elementos obligatorios de su forma, y que callouts, fotografías, zooms, preguntas y fichas de problema existan en su biblioteca.

### Agregado

- `00_Fuente/inventario-fotografico.md`: 75 imágenes especificadas, 6 existentes y 69 por producir, con la regla de que **solo se usan imágenes reales** — sin mockups ni ilustraciones de dispositivos, porque un operador reconoce su planta o no reconoce nada. Las tres piezas más valiosas del kit son la comparativa de foto inservible frente a foto buena del medidor.
- `00_Fuente/inventario-zooms.md`: 51 zooms, 46 de ellos recortes de capturas ya inventariadas y por tanto sin costo adicional. Un zoom existe solo si hay una acción o una lectura asociada.
- `10_QuickGuides/`: cuatro guías de una página, laminables, que no resumen el manual sino que lo reemplazan una vez que la persona ya sabe. **No dependen de fotografía**, así que son el entregable más rápido y el de mayor impacto por hora invertida.
- `11_Academia/README.md`: propuesta **solo documental** de cinco cursos construidos sobre el contenido que ya existe. Deja explícitas las tres decisiones que hay que tomar antes de escribir una línea de código (dentro o fuera del producto, obligatorios o no, certificados con vigencia o no).
- Los siete storyboards ganaron objetivo, momentos que cubren, planos de rodaje y textos en pantalla. Los planos de campo se graban en la misma visita que las fotografías: una sola coordinación con el cliente, no dos.

### Pendiente

- **Visita a planta.** Es lo único del kit que depende de un tercero y lo único que no se puede hacer desde un escritorio: 17 fotografías de campo y todos los planos de rodaje. Debe agendarse primero aunque se ejecute al final.
- Diagramación, 52 capturas de pantalla y grabación de los siete videos.
- Validar el formato con un operador real antes de producir más allá de P0. Saltárselo es apostar 115 páginas a un formato que nadie probó.

## [Etapa T3 — Production Kit] — Los activos, no solo el contenido

### Agregado

- **`scripts/capturar-pantallas.mjs`: arnés de captura determinista.** Produce las capturas **reales** del producto —no mockups— levantando la app y respondiendo la API con datos de demostración interceptados desde el navegador. **Cero cambios en el producto**: la consola que sale en la imagen es la real, y lo único simulado es la respuesta HTTP, igual que el Dashboard usa su fuente simulada. La PWA se recorre como máquina de estados, tocando los mismos botones que toca un operador. **30 de 52 capturas producidas** (14 de operador, 5 de supervisor, 11 de administrador). Playwright no entra al `package.json`: es tooling de documentación y se resuelve del caché de npx, así que ni el lockfile ni el CI del producto se enteran.
- **`docs/training/12_Capturas/`** con las imágenes y un `CATALOGO.md` generado del manifiesto —nombre, pantalla, resolución, aspecto, dispositivo, momento y manuales— para que la documentación no pueda desviarse de lo que realmente se capturó.
- **`docs/training/13_Produccion/`**: orden fotográfica con casillas (80 piezas clasificadas en existente / pendiente / opcional), 9 comparativas correcto-incorrecto con objetivo e imágenes, 25 componentes gráficos, 37 íconos congelados y 12 plantillas de página con presupuesto de imágenes y de texto, más la matriz de reutilización.
- **`docs/training/CLAUDE_DESIGN_HANDOFF.md`**: el paquete autosuficiente para diagramar sin hacer preguntas — filosofía, audiencias, estructura, orden de producción, restricciones, prioridades y dónde está cada texto.
- **`scripts/capturas/storyboards.mjs`**: los siete storyboards se generan de una sola fuente, con objetivo, narración, plano, movimiento de cámara, duración, animaciones, textos en pantalla, pausas y transiciones por escena. Se generan porque los cuatro videos de operador son el mismo guion con dos variables: escritos a mano, el día que cambie una escena se corrigen tres y se olvida el cuarto.
- La Academia pasa de cinco cursos enunciados a **33 lecciones con duración, objetivo, material complementario y evaluaciones sugeridas**, en tres niveles con requisitos previos entre ellos. Sigue siendo **solo documental**.

### Cambiado

- El inventario de zooms se rehízo como definitivo: origen, zona, objetivo, mensaje y manuales donde aparece, sin duplicados. **28 de los 51 ya se pueden recortar** porque su captura de origen está producida.
- `scripts/verificar-training-kit.mjs` verifica ahora también comparativas, componentes, iconografía y plantillas, y que ninguna captura prometida como producida falte en disco.

### Corregido

- **`03_Admin/ADM.md` referenciaba `adm-08_usuarios.png`, una captura de una pantalla que no existe.** El alta del supervisor no se hace desde la consola. Lo detectó el manifiesto de capturas al enfrentarse con el catálogo de pantallas.
- Cinco fotografías (`F-26`, `F-27`, `F-43`, `F-44`, `F-45`) se referenciaban en storyboards y en la orden fotográfica sin estar en el inventario. Lo detectó el verificador extendido.

### Pendiente

- **Visita a planta**: 17 fotografías de campo y todos los planos de rodaje. Único punto del kit que depende de un tercero.
- 22 capturas bloqueadas por cámara física o por entorno sembrado, cada una con su motivo en el catálogo.
- Diagramación y grabación. **Validar el formato con un operador real antes de producir más allá de P0.**

## [Etapa T4 — Training Design System] — La norma, no el material

### Agregado

- **`docs/training/TRAINING_DESIGN_SYSTEM.md`**: el sistema visual oficial de capacitación, congelado. Equivalente al Design System del producto pero aplicado a documentación y formación, y diseñado para extenderse a otros productos sin cambiar una regla. **Claude Design diseña dentro de él; nunca lo redefine.**
- **`docs/training/14_Sistema/`** con los doce documentos de la norma: filosofía (12 principios con orden de precedencia ante conflicto), identidad (12 elementos con objetivo, cuándo, cuándo NO y prioridad), jerarquía de información por audiencia, catálogo de 13 tipos de página con máximo de conceptos, 6 categorías de callout con árbol de decisión, y las normativas de fotografía, capturas, iconografía, video, evaluación, calidad y roadmap.
- **Sistema de evaluación del aprendizaje**: se mide que el material enseñe, no que se vea bien. La métrica principal son los puntos de detención, y el principio es que **cada punto donde alguien se detiene es un defecto del material, no de la persona**. Incluye los tres umbrales de falla y las tres señales de evaluación continua después de publicar.
- **Diez criterios de terminado** (`Q-01` a `Q-10`) y tres estados posibles de un manual. **No existe «casi terminado»**: un manual en validación que se distribuye porque hacía falta es un manual que nunca se va a validar.
- **`13_Produccion/catalogo-iconos.md`**: los 37 íconos concretos, separados de la norma que los gobierna.

### Cambiado

- **`componentes.md`, `plantillas.md` e `iconografia.md` eran normativos, no inventarios.** Se movieron a `14_Sistema/` como `02-identidad.md`, `04-paginas.md` y `08-iconografia.md`, y se reescribieron. `13_Produccion/` queda solo con inventarios: qué existe y en qué estado.
- **`CLAUDE_DESIGN_HANDOFF.md` deja de ser autosuficiente y pasa a ser el inventario de producción.** El solapamiento entre dos documentos que decían ser la autoridad era un defecto: ahora uno dice cómo debe ser cada cosa y el otro qué existe, y no se solapan.
- El orden de producción propuesto se corrigió en tres puntos, justificados en `14_Sistema/12-roadmap.md`: las guías rápidas de Android y iPhone **son el mismo artefacto** (la guía no tiene contenido de plataforma; lo único que difiere es la instalación, que no pertenece a una tarjeta colgada junto al surtidor); **faltaba la validación con usuarios reales** entre el primer artefacto y el resto; y faltaban la guía del supervisor, la visita a planta y los cuatro artefactos del perfil de inventario.
- `scripts/verificar-training-kit.mjs` verifica ahora que ningún documento cite un principio, un elemento, un tipo de página, una categoría de callout, una categoría de ícono o un criterio de calidad que el sistema no defina.

### Corregido

- **Dos colisiones de espacio de nombres** detectadas por el verificador al escribirse: los principios usaban `P-`, ya ocupado por las preguntas frecuentes, y los elementos de identidad usaban `E-`, ya ocupado por las fichas de problema. Renombrados a `PR-` y `EL-`. Sin el verificador, una referencia a `P-09` habría resuelto a la pregunta equivocada en silencio.

### Pendiente

- **Ninguna decisión de sistema.** Si al diagramar aparece una que el sistema no resuelve, es un defecto del sistema y se corrige ahí, no dentro de una página.
- Sigue pendiente todo lo de T3: visita a planta, 22 capturas bloqueadas, diagramación y grabación.

## [Etapa P.3 — Accesos al Dashboard] (10-ago-2026)

Documentada retroactivamente el 12-ago-2026: los cuatro commits del 10-ago
(`771cb78`..`71d7213`) se desplegaron sin su entrada de CHANGELOG.

### Agregado

- BD (migración `20260810070000_accesos_dashboard`, aplicada a producción el 10-ago **sin registrar** en `schema_migrations` — reparar con `supabase migration repair`): `usuarios.email` y `usuarios.ultimo_acceso_en`.
- API: administración de accesos al Dashboard por cliente (`/api/v1/admin/clientes/:id/accesos` — listar, crear con contraseña temporal, editar/activar/desactivar, regenerar contraseña) mediada contra Supabase Auth; el login sella `ultimo_acceso_en` sin poder tumbarlo.
- Consola: pestaña **Accesos** en la ficha del cliente — una cuenta por persona, último acceso visible, activar/desactivar y nueva contraseña.
- `docs/OPERACIONES.md` §8: el alta de usuarios del Dashboard deja de necesitar SQL.

## [P.3 UX Hardening P0] (12-ago-2026) — DESPLEGADO a producción

Cierre de los hallazgos P0 del Executive UX Audit del flujo comercial
(12-ago-2026). **Desplegado el 12-ago-2026** (`b9c919f`): la migración
`20260812090000_password_temporal` se aplicó y verificó ANTES del push;
API, Admin y Dashboard corren `b9c919f` desde GitHub; verificación
automática en verde (salud 20/20, contratos de auth nuevos, bundles
servidos con el código P0). **Pendiente de smoke humano** (alta real de
un acceso, ciclo de contraseña completo, revocación y aislamiento con
cuentas reales).

### Agregado

- **Ciclo de contraseña del Dashboard (P0.1):** la contraseña temporal de la consola es de UN ingreso — `usuarios.debe_cambiar_password` (migración `20260812090000`, sin aplicar), el login informa el flag, `/tablero/*` responde 403 `PASSWORD_TEMPORAL` hasta definir una propia, y el Dashboard fuerza «Crea tu contraseña» sin volver a pedir la temporal (viaja solo en memoria). Cambio voluntario con la actual (`POST /auth/password`, verificada por el MISMO camino del login), «¿Olvidaste tu contraseña?» sin oráculo de cuentas (`POST /auth/recuperar`) y `/restablecer` que consume la sesión del enlace del correo (`POST /auth/password-restablecer`, exige `amr: recovery`). Ninguna pantalla del ciclo es un callejón: el ingreso forzado ofrece cerrar sesión y el cambio voluntario ofrece volver sin cambiar.
- **Entrega de credenciales (P0.2):** diálogo con URL del Dashboard, usuario y contraseña temporal; «Copiar credenciales» arma el texto completo para WhatsApp/correo; éxito y fallo del portapapeles se anuncian; con fallo el diálogo NO se cierra; cerrar sin copiar pide segunda intención. La política es una transición pura con pruebas.
- **Estados de acceso (P0.4):** el login responde 403 `ACCESO_DESACTIVADO` al usuario revocado (la barrera sigue siendo el middleware en cada petición); el cliente distingue revocado de expirado (`SESION_INACTIVA` ya no dispara renovaciones ni bucles), la expiración en pestaña montada vuelve al login con su motivo, y SinPermiso/SinEmpresa tienen identidad, explicación y cierre de sesión.
- **Bienvenida del cliente nuevo (P0.6):** `/tablero/hoy` informa `tiene_cargas` (historia, no día); sin ninguna carga el tablero se presenta («Tu Dashboard está listo» + proceso en tres pasos con el vocabulario del perfil) y la primera carga sincronizada lo reemplaza por el tablero normal vía el polling existente.
- **Excel por Perfil Operativo (P0.8):** la vista de exportación la decide `perfil.vistaEvidencia`; inventario exporta llegó con / galones cargados / total al salir / duración / veredicto **desde la lista** (la API manda `duracion_segundos`; desaparece el N+1 de un detalle por carga), medidor conserva sus 15 columnas exactas (regresión fijada por prueba) con detalles por lotes de 6, y las hojas de Entregas/Balance existen solo si el perfil declara el módulo de suministro.
- **Confirmaciones en Accesos (P0.9):** desactivar y regenerar contraseña dicen su consecuencia antes de ejecutar y muestran su error; activar no confirma a propósito.
- Evidencia visual: `scripts/capturar-p0.mjs` produce las 15 capturas del cierre en `docs/capturas/p0-ux-hardening/` (apps locales reales, API interceptada).

### Corregido

- **Errores humanos (P0.5):** `mensajeDeError()` era inalcanzable (la consulta stringificaba el error) — las pantallas mostraban `Error: HTTP_500` y `TypeError: Failed to fetch`. Ahora toda pantalla traduce a frase humana con `Soporte: <request_id>` copiable, y la exportación a Excel avisa cuando falla en vez de rechazar la promesa en silencio.
- «Volver al tablero» tras el cambio de contraseña era decorativo (submit sin manejador + `setTimeout`): el botón ES la navegación.
- `PanelConsumo` con quincena en cero lo dice con palabras; Equipos deja de mandar al cliente a «la consola» de Lubryco; `PASSWORD_ACTUAL_INCORRECTA` pasó de 401 a 403 (el 401 cerraba la sesión de quien se equivocaba de contraseña).

### Verificado sin cambios (P0.7)

- Suministro ya estaba correctamente condicionado: el dominio lo declara solo para perfiles con medidor (invariante probado), la pestaña sale de `perfil.modulos`, la ruta redirige si el perfil no lo declara, y `pnpm sin-clientes` garantiza por máquina que nada decide por nombre de cliente.

### Desplegado (12-ago-2026)

- Historial de migraciones reparado (`20260805120000`, `20260810070000` → applied) y `20260812090000_password_temporal` aplicada y verificada contra el esquema real (columna boolean NOT NULL default false; backfill correcto: cero filas — aún no existían roles del Dashboard).
- Supabase Auth: `site_url` corregida (estaba en `http://localhost:3000`) y `https://…/restablecer` autorizada como Redirect URL; `URL_RESTABLECER_PASSWORD` fijada en la API (la API vieja la toleró: Zod descarta claves desconocidas).
- Push `71d7213..b9c919f`; Railway desplegó API, Admin y Dashboard desde GitHub (SUCCESS). La PWA quedó SKIPPED **correctamente** (este push no tocó `apps/pwa`); sigue sirviendo el artefacto CLI del 10-ago, verificado con los seis fixes del flujo del operador presentes en el bundle.

### Pendiente

- **Smoke humano**: crear el primer acceso real desde la consola, ciclo completo de contraseña (temporal → propia → recuperación), revocación en vivo y aislamiento multiempresa con dos cuentas reales.
- **Trazabilidad Git de la PWA**: el servicio tiene watch path `/apps/pwa/**` y Railway evalúa el diff del ÚLTIMO commit del push — un push cuyo commit cabeza no toca la PWA queda SKIPPED aunque el rango sí la toque (así se perdió el deploy Git del 10-ago). Reconciliar desde el dashboard de Railway: servicio PWA → Settings → quitar/ajustar el watch path → Deploy.
