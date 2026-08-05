# Operaciones — CuadreApp

Runbook de despliegue, verificación, respaldo y recuperación. Complementa el Product Bible (qué es el producto) con el **cómo se opera**.

## 1. Topología (DEC-005)

| Pieza                              | Proveedor | Configuración en el repo                                                                     |
| ---------------------------------- | --------- | -------------------------------------------------------------------------------------------- |
| PWA (conductor, y luego dashboard) | Vercel    | `apps/pwa/vercel.json` (CSP + headers + SPA) — root del proyecto: `apps/pwa`, framework Vite |
| API                                | Railway   | `railway.json` (build pnpm, start, healthcheck `/listo`)                                     |
| Postgres + Auth + Storage          | Supabase  | `supabase/migrations/`, `supabase/seed.sql`                                                  |

## 2. Variables de entorno

### API (Railway) — validadas al arrancar (`apps/api/src/config.ts`); la API se niega a arrancar si falta alguna

| Variable                    | Qué es                                                                                                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`              | Pooler de Postgres de Supabase (usar el **transaction pooler** para runtime)                                                                                                  |
| `SUPABASE_URL`              | `https://<proyecto>.supabase.co`                                                                                                                                              |
| `SUPABASE_ANON_KEY`         | Clave anon (grants de GoTrue del lado del servidor)                                                                                                                           |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — **solo** vive en Railway, jamás en el cliente                                                                                                                  |
| `SUPABASE_JWT_SECRET`       | Secreto legado HS256. **Los proyectos nuevos firman ES256**: la API verifica automáticamente contra el JWKS del proyecto (`/auth/v1/.well-known/jwks.json`), sin config extra |
| `BUCKET_FOTOS`              | Opcional, default `fotos-cargas`                                                                                                                                              |
| `CORS_ORIGENES`             | Opcional: lista separada por comas de orígenes de navegador permitidos; sin ella se permiten los `*.up.railway.app`. Fijarla a los dominios definitivos al salir del piloto   |
| `PORT`                      | La inyecta Railway                                                                                                                                                            |

### Frontends (build-time, Vite los incrusta)

| Variable             | Aplica a              | Qué es                                                                                 |
| -------------------- | --------------------- | -------------------------------------------------------------------------------------- |
| `VITE_API_URL`       | PWA, Dashboard, Admin | URL pública de la API en Railway                                                       |
| `VITE_DASHBOARD_URL` | Admin                 | URL del Dashboard de Cliente, para «Abrir Dashboard» y «Copiar enlace» de la ficha ERP |

Tras asignar el dominio real de la API, **fijar `connect-src` de la CSP** (`apps/pwa/vercel.json`) a ese dominio exacto en vez del comodín `https://*.up.railway.app`.

### 2a. URLs de producción (cierre del 2-ago-2026)

| Servicio  | URL                                                           |
| --------- | ------------------------------------------------------------- |
| API       | https://cuadreappapi-production.up.railway.app                |
| Dashboard | https://cuadreappdashboard-production.up.railway.app          |
| PWA       | https://cuadreapppwa-production.up.railway.app                |
| Supabase  | proyecto `cuadreapp-prod` (`ktuyhorglxrvkrzjmdgo`, sa-east-1) |

### 2b. Frontends servidos desde Railway (estado actual del despliegue)

El despliegue real del 2-ago-2026 colocó los TRES servicios en Railway (decisión operativa del propietario; DEC-005 preveía los frontends en Vercel — pendiente de ratificar o revertir al cerrar RC1). Para servir estáticos en Railway, cada frontend trae su servidor Node propio (`apps/*/servidor.mjs`) con SPA fallback y los mismos headers de seguridad de sus `vercel.json`.

**Configuración de cada servicio en Railway (una sola vez):**

| Servicio               | Settings → Config-as-code file   | Variables                                                       |
| ---------------------- | -------------------------------- | --------------------------------------------------------------- |
| `@cuadreapp/api`       | `railway.json` (raíz, ya activo) | las del §2                                                      |
| `@cuadreapp/dashboard` | `railway.dashboard.json`         | `VITE_API_URL=https://<dominio-público-de-la-api>` (¡en build!) |
| `@cuadreapp/pwa`       | `railway.pwa.json`               | `VITE_API_URL=https://<dominio-público-de-la-api>` (¡en build!) |
| `@cuadreapp/admin`     | `railway.admin.json`             | `VITE_API_URL` + `VITE_DASHBOARD_URL`                           |

- Root Directory de los tres servicios: la raíz del repo (el build necesita el workspace completo de pnpm).
- Si algún servicio tiene un Custom Start Command puesto a mano en la UI, **bórralo**: manda el archivo de config.
- Healthcheck de los frontends: `/salud` (lo sirve el propio servidor estático).
- Tras cambiar `VITE_API_URL` hay que **redesplegar** la PWA: Vite lo incrusta en el build.

## 3. Puesta en marcha de un entorno (orden)

1. **Supabase:** crear proyecto → `supabase link` → `supabase db push` (aplica las migraciones de `supabase/migrations/`, incluidos el bucket de logos y el permiso `tablero.leer`) → aplicar `seed.sql` si es entorno de prueba.
2. **Códigos de enrolamiento** (hasta que el dashboard los genere):
   ```sql
   insert into codigos_enrolamiento (sede_id, codigo, expira_en)
   select id, 'TREBOL-' || substr(md5(random()::text), 1, 8), now() + interval '7 days'
   from sedes where nombre = 'Planta Buga';
   ```
3. **Railway:** conectar el repo → variables del §2 → desplegar. El healthcheck `/listo` no pasa hasta que la base responde.
4. **Vercel:** proyecto con root `apps/pwa` → `VITE_API_URL` → desplegar.
5. **Usuarios humanos** (piloto): crearlos en Supabase Auth (dashboard) e insertar su fila en `usuarios` con el rol correspondiente.

## 4. Verificación

- **Local/CI (sin infraestructura):** `pnpm verificar` — lint, formato, fronteras DEC-007, guard `sin-clientes`, typecheck y 502 pruebas.
- **E2E (infraestructura real):**
  ```bash
  E2E_DATABASE_URL=postgres://... \
  E2E_SUPABASE_URL=https://... E2E_SUPABASE_ANON_KEY=... E2E_SUPABASE_SERVICE_ROLE_KEY=... \
  pnpm --filter @cuadreapp/api e2e
  ```
  Cubre: trigger de `tot_actual_gal` con los repositorios reales (criterio de la Etapa 0), catálogo, identidad de dispositivo en GoTrue (creación + rotación + cierre) y escritura al bucket. Sin credenciales queda en `skipped`, nunca en falso verde.
- **Humo post-despliegue:** `GET /salud` (proceso vivo) → `GET /listo` (base alcanzable) → enrolar un dispositivo con un código de prueba → una carga de punta a punta desde el celular.

## 5. Respaldos y recuperación

**Qué proteger, en orden de importancia:** (1) Postgres — las cargas son el valor probatorio del producto; (2) el bucket `fotos-cargas` — la evidencia; (3) la configuración (variables de entorno; el esquema ya está versionado en git).

| Mecanismo                   | Config                                                                                                                          | RPO     | Nota                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| Backups diarios de Supabase | Incluidos en plan Pro (presupuestado en la especificación §4: USD 20–25/mes antes del piloto)                                   | 24 h    | Restauración desde el dashboard de Supabase                            |
| PITR (point-in-time)        | Opcional Supabase                                                                                                               | minutos | Activarlo si el piloto crece a varios clientes                         |
| Export lógico semanal       | `pg_dump --no-owner "$DATABASE_URL" > respaldo-$(date +%F).sql` (cron externo o GitHub Action programada)                       | 7 d     | Copia FUERA del proveedor — protege contra pérdida de cuenta           |
| Fotos                       | El bucket no tiene versionado; las fotos son inmutables (nunca se sobreescriben salvo reintento idempoténtico del mismo objeto) | —       | El blob además vive en el dispositivo hasta la aceptación del servidor |

**Recuperación (RTO objetivo < 4 h para el piloto):**

1. Base corrupta/perdida → restaurar backup de Supabase (o `psql < respaldo.sql` en proyecto nuevo) → `supabase db push` para verificar migraciones al día → apuntar `DATABASE_URL` de Railway → `/listo` en verde.
2. Proyecto Supabase completo perdido → proyecto nuevo + migraciones + último export lógico + recrear usuarios de Auth (los dispositivos se re-enrolan con códigos nuevos; **las colas locales de los celulares conservan las cargas no sincronizadas** y las suben al re-enrolar — por diseño, spec §10).
3. API caída → Railway redespliega el último build (`restartPolicy` ya configurado); la PWA sigue capturando offline mientras tanto — la caída de la API **no detiene la operación en planta**.

## 6. Observabilidad en producción

- Cada petición emite un evento JSON a stdout (DEC-012) con `request_id`, duración, resultado, banderas y versiones — Railway los agrega y permite consultarlos; un pantallazo del `request_id` que muestra la PWA basta para encontrar la traza.
- `/listo` en el healthcheck de Railway hace visible una base caída como despliegue no-listo, no como errores silenciosos.
- Pendiente deliberado (registrado en la revisión de arquitectura): agregador de errores tipo Sentry y métricas agregadas — para el piloto, los eventos estructurados en Railway cubren la necesidad.

## 7. Consola Admin — arranque del primer usuario (bootstrap único)

La consola (`apps/admin`, servicio Railway propio con `railway.admin.json` y
`VITE_API_URL` apuntando a la API) usa login email+contraseña de la API. El
PRIMER administrador se crea una sola vez, porque aún no existe nadie que
pueda crearlo desde la consola:

1. Supabase → Authentication → Add user: email y contraseña del admin
   (o vía API admin de GoTrue con la service role).
2. Insertar su fila en `usuarios` con `rol_id = 6` (admin_lubryco),
   `cliente_id = null`, `sede_id = null`, `activo = true`, y el `id` del
   usuario de Auth recién creado.
3. Verificar: login en la consola → pestaña Resumen responde.

Desde ahí, TODO lo demás (clientes, sedes, equipos, operadores, códigos de
enrolamiento, revocaciones) se hace en la consola — el SQL manual queda
retirado de la operación. Los usuarios admin adicionales siguen siendo un
paso de infraestructura hasta que exista la pantalla de usuarios (fuera del
alcance del piloto).

## 8. Dar de alta a un supervisor en el Dashboard de Cliente

El Dashboard es **uno solo para todas las empresas**
(https://cuadreappdashboard-production.up.railway.app): no hay URL,
subdominio ni despliegue por cliente. Quien inicia sesión determina qué
empresa se carga. Alta de un supervisor (mismo paso manual que el admin,
hasta que exista la pantalla de usuarios):

1. Consola Admin: crear el cliente con su identidad, perfil, sedes,
   equipos, operadores y dispositivos.
2. Supabase → Authentication → Add user: email y contraseña del supervisor.
3. Insertar su fila en `usuarios`:
   - `rol_id = 1` (supervisor) o `2` (admin_cliente),
   - `cliente_id` = el del cliente,
   - `sede_id` = la sede si debe ver solo una; **`null` para que vea todas
     las sedes de su cliente** (el tablero le ofrece el selector),
   - `activo = true`.
4. Compartir el enlace único (la ficha del cliente en la consola tiene
   «Copiar enlace» en su pestaña Dashboard).

Requisito de infraestructura: la migración `20260805120000_tablero_cliente`
debe estar aplicada — es la que otorga `tablero.leer` a supervisor y
admin_cliente. Sin ella, el login funciona y el tablero responde 403.

Un `admin_lubryco` **no** entra al Dashboard (su sesión no tiene
`cliente_id`): su vista de un cliente es la pestaña Dashboard de la ficha
en la consola.
