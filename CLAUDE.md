# CuadreApp

Control de despacho de combustible en planta de clientes industriales de Lubryco S.A.S.

Antes de tocar cualquier cosa, leer en este orden:

1. `docs/PRODUCT_BIBLE.md` — visión, usuarios, casos de uso, reglas de negocio en lenguaje llano, arquitectura, roadmap, decisiones, glosario. Fuente de verdad de producto.
2. `docs/ESPEC_App_Cuadre_Lubryco.md` — especificación técnica: esquema de datos, reglas de validación R1–R12, cálculos, flujos de pantalla exactos. Fuente de verdad técnica.
3. `docs/mockups/` — mockups interactivos de referencia para la UI (conductor y dashboard), ya aprobados como guía visual.

Los dos primeros documentos no se duplican entre sí a propósito: el Product Bible explica el _por qué_ y enlaza al _cómo_ exacto en la especificación técnica. Si algo cambia, se actualiza en su documento correspondiente, no se copia al otro.

## Reglas de trabajo en este repositorio

- **Nunca generar código sin aprobación explícita del usuario.** Proponer y discutir primero, esperar luz verde antes de escribir una sola línea de implementación.
- **Al finalizar cada etapa del roadmap:**
  1. Actualizar este archivo si cambiaron convenciones o el estado del proyecto.
  2. Actualizar `docs/PRODUCT_BIBLE.md` — en particular las secciones Roadmap y Decisiones.
  3. Agregar la entrada correspondiente a `CHANGELOG.md`.
  4. Hacer commits pequeños y atómicos (no un commit gigante por etapa).

## Tests First (DEC-010)

Toda regla de negocio en `packages/dominio` sigue este ciclo, sin excepciones:

1. Escribir primero las pruebas.
2. Verificar que fallen.
3. Implementar la regla.
4. Verificar que todas las pruebas pasen.
5. Refactorizar si es necesario.
6. Actualizar documentación si cambió el comportamiento.

Además:

- Ninguna regla de negocio se considera terminada sin pruebas automatizadas.
- Cada regla R1–R12 tiene pruebas unitarias independientes.
- Los casos límite de la especificación técnica (§13) son obligatorios.
- Toda corrección futura comienza agregando una prueba que reproduzca el problema, antes de modificar el código.

## Precisiones de reglas de negocio

Las ambigüedades de R1–R12 detectadas en la Etapa 1 fueron resueltas por el propietario del producto y están registradas en `docs/PRODUCT_BIBLE.md` §6 («Precisiones aprobadas sobre las reglas»). **Donde difieran de la especificación técnica §7, las precisiones mandan.** Puntos clave: R8 valida contra tiempo calendario transcurrido (no límites fijos); R2 distingue `SALTO_TOTALIZADOR_NEGATIVO`; R4 separa `TOTALIZADOR_SIN_AVANCE` de `TOTALIZADOR_RETROCEDE`; R10 emite `SIN_GPS` informativa (clase `info`, no afecta el estado); `papel_retro` exento de fotos, correcciones no.

**Las reglas de negocio están congeladas desde el 31-jul-2026.** Cualquier modificación requiere: una nueva prueba, una actualización del Product Bible, y una nueva DEC si cambia el comportamiento. La API nunca las duplica ni las reinterpreta (DEC-011).

## Convenciones de código (para cuando se apruebe escribir código)

- Todo en español: nombres de tablas, columnas, variables de dominio, textos de UI.
- Zona horaria `America/Bogota`. Se guarda `timestamptz`, se muestra en hora local.
- Galones con una decimal en toda la cadena. `numeric`, nunca `float`, para volúmenes.
- Formato numérico colombiano en pantalla: punto de miles, coma decimal (`1.847,6`).
- Toda regla de validación (R1–R12) vive en un único módulo compartido (`packages/dominio`), importado tanto por la app como por la función de servidor. Una regla, un lugar.
- Tests obligatorios sobre R1–R12 con casos límite: rodillo a mitad de giro, tanda 0.0 exacta, totalizador que da la vuelta en 999999.

## Límite de integración externa

CuadreApp es un producto completamente independiente. No depende de ningún sistema externo (incluido "StationOS", que a efectos de este proyecto no existe). Cualquier integración futura es únicamente vía una API REST propia y versionada — nunca compartiendo tablas, código, autenticación ni repositorio. Detalle en `docs/PRODUCT_BIBLE.md` §7.

## Arquitectura (congelada — no proponer cambios estructurales sin decisión nueva del usuario)

- **API First (DEC-009):** toda funcionalidad de negocio se implementa primero en la API. La PWA nunca accede directamente a Supabase para operaciones de negocio — solamente consume la API. Supabase es infraestructura (Postgres, Auth, Storage). La API es la única autoridad para validaciones, reglas de negocio, escritura, auditoría y permisos. RLS queda como segunda línea de defensa, no como camino de acceso del cliente.
- **Versionado de la API (DEC-008):** todos los endpoints bajo `/api/v1/` desde el primer día. Versiones futuras conviven sin romper compatibilidad; una versión solo se retira cuando ningún cliente activo la consume.
- **Thin API (DEC-011):** la API es únicamente un orquestador: autenticación, autorización, validación estructural de entrada, invocar `packages/dominio`, persistencia, auditoría y respuesta HTTP. Nunca contiene, duplica ni reinterpreta reglas de negocio. Si una regla cambia, solo cambia en `packages/dominio`.
- **Observabilidad por defecto (DEC-012):** middleware único en la API — cada petición registra request_id, timestamp, cliente/sede/usuario, endpoint, duración, resultado, estado HTTP, errores, banderas del dominio y versiones de API y dominio. Nunca fotos, tokens ni datos sensibles. Toda respuesta lleva el `request_id` (cuerpo + encabezado `x-request-id`).
- **Security First (DEC-013):** ninguna funcionalidad nueva accede a la API sin autenticación (excepciones: `GET /salud` y los endpoints que _son_ la autenticación). Supabase Auth mediada por la API — la PWA nunca habla directo con Supabase Auth ni almacena credenciales. Autorización siempre en la API vía RBAC propio. Ninguna regla de negocio migra fuera de `packages/dominio`.
- **TokenStore y cliente HTTP único (DEC-014):** en la PWA todo acceso a tokens pasa por la abstracción `TokenStore` (access en memoria, refresh en almacenamiento local con rotación; SecureStore al migrar a React Native — sin tocar el resto del código) y todo acceso a la API pasa por un único cliente HTTP (tokens, renovación, reintentos, errores, observabilidad). Ningún componente React toca tokens.
- **Hosting (DEC-005):** PWA/dashboard en **Vercel**; API propia en **Railway**; base de datos y autenticación en **Supabase**. Tres proveedores, responsabilidad separada, ninguno atado a otro.
- **Autenticación y autorización (DEC-004):** Supabase Auth resuelve identidad; la PWA presenta ese token a la API. Los roles y permisos son **RBAC propio** modelado en tablas del dominio (`roles`, `usuarios`, `dispositivos`) — nunca custom claims de Supabase ni roles nativos de Postgres como fuente de autorización.
- **Monorepo (DEC-006 + DEC-015):** pnpm workspaces — `apps/pwa` (conductor, Vercel), `apps/dashboard` (tablero del cliente, Vercel, proyecto separado), `apps/api` (servidor, Railway), `packages/dominio` (reglas R1–R12, sin dependencias de entorno), `packages/tipos-bd` (tipos generados de Supabase), `supabase/` (migraciones, RLS, seed). PWA y Dashboard son productos separados con build, despliegue, router y configuración propios; comparten solo paquetes.
- **Reglas de dependencias (DEC-007):** solo `apps/* → packages/*`, nunca al revés; `packages/tipos-bd` es hoja y `packages/dominio` solo depende de ella; `apps/pwa` y `apps/api` jamás se importan entre sí — se comunican únicamente por HTTP. Grafo de paquetes siempre acíclico.
- **Plataforma del cliente (DEC-001, revisada):** la PWA es la plataforma del **MVP**, no una decisión permanente. Al cerrar el MVP se hace una evaluación técnica PWA vs. React Native + Expo. Todo lo anterior (dominio portable, API como única puerta) existe para que esa migración, si ocurre, tenga el menor impacto posible.

Detalle y razones completas en `docs/PRODUCT_BIBLE.md` §7 y §9 (DEC-001 a DEC-009).

## Estado actual

**Etapa P.3 (Accesos al Dashboard) desplegada + UX Hardening P0 implementado LOCAL** (12-ago-2026, DEC-021): el alta de usuarios del Dashboard vive en la consola (ficha del cliente → Dashboard → Accesos, sin SQL) y está en producción desde el 10-ago. El **Hardening P0** (12-ago) está commiteado en `main` local, **sin push ni deploy**: contraseña temporal de UN ingreso con ciclo completo (cambio obligatorio en el primer login, cambio voluntario, «olvidé mi contraseña» y `/restablecer`), entrega de credenciales copiable a WhatsApp sin pérdida silenciosa, estados de acceso honestos (revocado ≠ expirado; ninguna pantalla sin salida), `mensajeDeError()` conectado (frase humana + `request_id` copiable), bienvenida del cliente nuevo con transición automática a la primera carga (`tiene_cargas` en `/tablero/hoy`), Excel por Perfil Operativo (sin N+1 en inventario; medidor sin regresión) y confirmaciones en desactivar/regenerar. Evidencia: `docs/capturas/p0-ux-hardening/` (regenerable con `node scripts/capturar-p0.mjs`). **Antes de desplegar la API hay que aplicar `20260812090000_password_temporal`** y reparar en `schema_migrations` las migraciones del 5 y 10-ago aplicadas a mano (detalle en `docs/OPERACIONES.md` §8 y CHANGELOG).

**Etapa P.2 (Dashboard de Cliente multiempresa) implementada** (5-ago-2026, DEC-020): existe **un solo Dashboard para todas las empresas**, con una sola URL y un solo build — no hay subdominio, ruta, parámetro ni despliegue por cliente. El supervisor entra con su usuario y la API (`/api/v1/tablero/*`, permiso `tablero.leer`) responde identidad, Perfil Operativo, sedes autorizadas y permisos; toda consulta se parametriza con el `cliente_id` **de la sesión**, así que la petición no tiene por dónde nombrar otro cliente. El **Perfil Operativo declara la composición del tablero** (módulos, paneles, columnas y vista de evidencia) en el registro del dominio, y `apps/dashboard/src/perfiles/` sabe dibujar ese vocabulario: un cliente nuevo con un perfil existente no toca código, y un perfil nuevo se declara en un solo lugar. La evidencia de una carga la decide el **snapshot** de su perfil, no el perfil actual del cliente. `admin_lubryco` no entra al Dashboard: su vista de un cliente es la **vista previa** de la consola, con «Abrir Dashboard» y «Copiar enlace». Los datos simulados del Dashboard pasaron a `src/pruebas/` como fixtures. Pendiente de infraestructura: aplicar `20260805120000_tablero_cliente` (sin ella el tablero responde 403), correr `supabase/verificacion_tablero.sql`, dar de alta un supervisor real (`docs/OPERACIONES.md` §8) y configurar `VITE_API_URL` en el Dashboard y `VITE_DASHBOARD_URL` en la consola.

**Etapa P.1 (Generalización del cliente + identidad corporativa) implementada** (4-ago-2026, DEC-018): existe un único **Dashboard de Cliente**; la identidad (logo, color primario, color secundario, nombre comercial, razón social, NIT) y la configuración (Perfil Operativo) viven en la base y se administran desde la **ficha ERP** del cliente (`/clientes/:id` → Identidad · Configuración · Operación · Dashboard). La tematización está restringida por diseño: la base guarda SOLO dos colores y `tema-cliente.ts` deriva el resto (estados, bordes, sombras, gradientes y el texto legible por contraste WCAG) — nunca CSS libre, y el chrome de navegación sigue siendo identidad de CuadreApp. Jerarquía congelada Cliente → Sedes → Equipos → Operadores → Dispositivos, con `sede_id` opcional en equipos y operadores (null = todas las sedes). `pnpm sin-clientes` ahora también prohíbe patrones de lógica por cliente en todo el código.

**Etapa P (Perfiles Operativos + identidad de cliente) implementada** (4-ago-2026, DEC-016/DEC-017): cada cliente tiene exactamente un Perfil Operativo (`medidor_doble` — El Trébol; `carga_inventario` — «Carga sobre Inventario», Sacyr) con snapshot por carga; los códigos de perfil viven únicamente en los cuatro puntos de despacho (registro del dominio, POST /cargas de la API, selector de flujo de la PWA, vistas de evidencia del Dashboard) — la regla es de máquina: `pnpm sin-clientes` (parte de `pnpm verificar`) prohíbe nombres de cliente en el código. Logo del cliente en el bucket privado `logos-clientes` (clave en `clientes.logo_url`, URL firmada por la API, bytes cacheados offline en la PWA, fallback a iniciales); sedes con ciudad/dirección/referencia/activo administrables. Pendiente de infraestructura real: aplicar la migración `20260804090000` + `supabase/verificacion_perfiles.sql`, y el E2E de ambos perfiles (sin credenciales `E2E_*` la suite queda en skipped).

**Consola Admin operativa** (`apps/admin`, servicio Railway propio vía `railway.admin.json`): clientes (con perfil y logo), sedes, equipos, operadores, códigos de enrolamiento, dispositivos y tablero por cliente con selector (sin nombres hardcodeados). Bootstrap del primer admin: `docs/OPERACIONES.md` §7.

**Dashboard conectado a la API** (`apps/dashboard`, DEC-015 + DEC-020): sesión propia, datos reales y composición por perfil (`docs/DASHBOARD_ARQUITECTURA.md` v2). **Etapa H (Hardening) implementada — 502 pruebas en verde.** Gate local completo: `pnpm verificar` (lint + formato + fronteras DEC-007 + `sin-clientes` + typecheck + pruebas). E2E contra infraestructura real: `pnpm --filter @cuadreapp/api e2e` con las variables `E2E_*` (docs/OPERACIONES.md). CI en `.github/workflows/ci.yml`. Operación, despliegue y respaldos: `docs/OPERACIONES.md`.

**Etapa S (Seguridad e Identidad) implementada.** API con autenticación JWT + RBAC contra la base, endpoints de auth/enrolamiento/catálogo/fotos, y `POST /api/v1/cargas` protegido con alcance de sede. PWA con TokenStore (DEC-014), ClienteHttp único, enrolamiento de dispositivo, PIN offline (bcrypt) y sincronizador que sube fotos primero y borra blobs tras aceptación. Pendiente: verificación E2E contra Supabase real y despliegue; CSP estricta y rate limiting del login se configuran con el hosting. La PWA usa `@cuadreapp/dominio` para feedback inmediato pero nunca reescribe reglas; el veredicto del servidor es la autoridad.

**Etapa 0 implementada, verificación pendiente.** El entorno de desarrollo no tiene Docker ni Postgres nativo para correr `supabase start` y ejecutar `supabase/verificacion_etapa0.sql` — revisado a mano, no corrido contra una base real. `usuarios` y `dispositivos` con esquema y RLS pero sin filas sembradas (requieren cuentas reales de Supabase Auth).

Nota sobre RLS y DEC-009: las políticas RLS de la Etapa 0 se escribieron antes de formalizar API First. Siguen siendo correctas — quedan como segunda línea de defensa y donde vive la regla de privacidad — pero el camino de acceso del cliente es la API, no consultas directas de la PWA a Supabase.
