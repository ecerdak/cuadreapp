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

| Variable                    | Qué es                                                                       |
| --------------------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`              | Pooler de Postgres de Supabase (usar el **transaction pooler** para runtime) |
| `SUPABASE_URL`              | `https://<proyecto>.supabase.co`                                             |
| `SUPABASE_ANON_KEY`         | Clave anon (grants de GoTrue del lado del servidor)                          |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — **solo** vive en Railway, jamás en el cliente                 |
| `SUPABASE_JWT_SECRET`       | Secreto JWT del proyecto (verificación local de firma)                       |
| `BUCKET_FOTOS`              | Opcional, default `fotos-cargas`                                             |
| `PORT`                      | La inyecta Railway                                                           |

### PWA (Vercel)

| Variable       | Qué es                           |
| -------------- | -------------------------------- |
| `VITE_API_URL` | URL pública de la API en Railway |

Tras asignar el dominio real de la API, **fijar `connect-src` de la CSP** (`apps/pwa/vercel.json`) a ese dominio exacto en vez del comodín `https://*.up.railway.app`.

## 3. Puesta en marcha de un entorno (orden)

1. **Supabase:** crear proyecto → `supabase link` → `supabase db push` (aplica las 5 migraciones, incluido el bucket) → aplicar `seed.sql` si es entorno de prueba.
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

- **Local/CI (sin infraestructura):** `pnpm verificar` — lint, formato, fronteras DEC-007, typecheck y 154 pruebas.
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
