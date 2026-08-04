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
