# ROADMAP RC1 → GO · CuadreApp

**Versión:** 1.0 — 1 de agosto de 2026 · **Estado:** plan oficial aprobado por el propietario del producto
**Punto de partida:** 68/100 (NO-GO, `docs/RC1_RELEASE_AUDIT.md`) · **Meta:** >90/100 para autorizar el piloto
**Regla de la fase:** cero funcionalidades nuevas. Solo correcciones, integración ya aprobada, ejecución de infraestructura y preparación del cliente.

**Cómo se re-puntúa:** al cerrar cada fase se actualiza la puntuación del audit con la ganancia indicada. La proyección al completar A–E es ~95/100. El Go lo da el propietario del producto con la puntuación >90 **y** la Fase E lista para instalación.

| Fase                          | Ganancia | Puntuación proyectada | Ejecuta                                            |
| ----------------------------- | -------- | --------------------- | -------------------------------------------------- |
| A — Correcciones críticas     | +4       | 72                    | Claude                                             |
| B — Infraestructura real      | +8       | 80                    | Propietario (cuentas) + Claude (guía/verificación) |
| C — Integración del Dashboard | +9       | 89                    | Claude                                             |
| D — Piloto interno            | +3       | 92                    | Propietario (dispositivos) + Claude (verificación) |
| E — Preparación del cliente   | +3       | 95                    | Propietario (negocio) + Claude (materiales)        |

---

## Fase A — Correcciones críticas del producto

**Dependencias:** ninguna — arranca de inmediato. · **Esfuerzo total:** ~1 día.

| Tarea                 | Detalle                                                                                                                                                                                                         | Esfuerzo | Criterio de terminado                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| A1 · C3 fotos iPhone  | La API acepta `image/jpeg` y `image/png` además de `image/webp` (parsers + validación + extensión del objeto según tipo real). La PWA no cambia: `browser-image-compression` ya degrada solo                    | 2–3 h    | Prueba: subir JPEG → 201 con `storage_path` `.jpg`; suite API en verde                           |
| A2 · I1 fecha local   | "Tus cargas de hoy" usa `America/Bogota` (helper con `Intl.DateTimeFormat`), nunca `toISOString()` para fechas de negocio                                                                                       | 1–2 h    | Prueba del helper con hora 20:00 local (que en UTC ya es mañana)                                 |
| A3 · I2 cola purgable | `navigator.storage.persist()` al enrolar; si el navegador lo niega, aviso persistente en Inicio ("protege este dispositivo: no borres datos del navegador")                                                     | 1–2 h    | Solicitud verificable en el flujo de enrolamiento; aviso presente cuando `persisted() === false` |
| A4 · I3 bodyLimit     | `bodyLimit` de la ruta de fotos alineado al contrato (2 MiB)                                                                                                                                                    | 1 h      | Prueba: cuerpo de 1.5 MiB → 201; >2 MiB → 413                                                    |
| A5 · I4 íconos        | Ícono de marca en SVG (cuadrado azul, C amarilla — el favicon del mockup) + PNGs 192/512 y `apple-touch-icon` generados en el repo (`@resvg/resvg-js` como devDep de tooling, no de runtime); manifest completo | 2–3 h    | Lighthouse/manifest sin advertencia de íconos; A2HS muestra el ícono de marca                    |

**Criterio de fase:** las 5 correcciones con prueba, gate completo (`pnpm verificar`) en verde, commits atómicos. **+4 → 72/100.**

## Fase B — Infraestructura real

**Dependencias:** cuentas de Supabase (plan Pro presupuestado en el spec §4), Railway y Vercel a nombre de Lubryco; tarjeta para el plan Pro. Sin eso, esta fase no puede empezar — es el único bloqueo externo del camino técnico. · **Esfuerzo:** 0.5–1 día con accesos. Todo tiene instrucciones en `docs/OPERACIONES.md`.

| Tarea                             | Detalle                                                                                                                    | Criterio de terminado                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| B1 · Proyecto Supabase definitivo | Crear, `supabase link`, `db push` (5 migraciones, incluye bucket)                                                          | Las 5 migraciones aplicadas sin error                                                     |
| B2 · Seed + verificación Etapa 0  | `seed.sql` + ejecutar `verificacion_etapa0.sql`                                                                            | El trigger avanza `tot_actual_gal` — el criterio de la Etapa 0, verificado al fin en real |
| B3 · Configurar Auth              | **Desactivar sign-ups públicos** (solo la API crea identidades), providers mínimos, expiración de tokens según DEC-013/014 | Un signup directo contra GoTrue es rechazado                                              |
| B4 · Storage                      | Verificar bucket privado creado por migración; probar que un GET anónimo falla                                             | Objeto ilegible sin service role                                                          |
| B5 · API en Railway               | Variables del §2 de OPERACIONES, desplegar, healthcheck                                                                    | `/salud` y `/listo` en verde desde internet                                               |
| B6 · PWA y Dashboard en Vercel    | Dos proyectos (roots `apps/pwa` y `apps/dashboard`), `VITE_API_URL`, **CSP fijada al dominio real**                        | Ambas apps servidas con sus headers correctos (verificar con curl)                        |
| B7 · E2E completa                 | `pnpm --filter @cuadreapp/api e2e` con credenciales reales                                                                 | Los 5 casos E2E en verde (no skipped)                                                     |
| B8 · Backups                      | Backups diarios activos + export lógico semanal programado + **una restauración de prueba ejecutada**                      | Un backup restaurado en proyecto desechable — un backup no probado no es un backup        |
| B9 · Observabilidad               | Un request de humo trazado de punta a punta: `x-request-id` de la respuesta encontrado en los logs de Railway              | El request_id de un pantallazo localiza su evento                                         |
| B10 · Códigos de enrolamiento     | Generar por SQL los códigos del piloto interno                                                                             | Código canjeable una sola vez, verificado                                                 |

**Criterio de fase:** checklist B1–B10 completo. **+8 → 80/100.**

## Fase C — Integración del Dashboard (solo con B validada)

**Dependencias:** Fase B completa. · **Esfuerzo:** 1.5–2 días. · **Restricción dura del propietario del producto:** no se modifican los componentes del Dashboard — la validación final incluye demostrarlo con `git diff`.

| Tarea                                 | Detalle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Esfuerzo | Criterio de terminado                                                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| C1 · `packages/cliente-http`          | Extraer `ClienteHttp` + `TokenStore` + tipos de tokens desde `apps/pwa` al paquete común (el momento que DEC-015 definió: llegó el segundo consumidor). Sin cambios de comportamiento; las pruebas se mueven con el código                                                                                                                                                                                                                                                                                                         | 3–4 h    | PWA y Dashboard consumen el paquete; suite completa en verde; fronteras DEC-007 en verde                                          |
| C2 · Endpoints de lectura             | `GET /api/v1/tablero/hoy · /cargas · /cargas/:id · /equipos · /suministro`, espejando **exactamente** el contrato de `puertos.ts` (fue diseñado para esto). Thin (DEC-011): consultas de lectura + los cálculos del §9 del spec (existencia, autonomía, gal/h) que son cálculos, no reglas — viven en `packages/dominio/calculos.ts`, no en la API. Permiso nuevo `tablero.leer` (migración: filas en `permisos`/`rol_permisos` para supervisor/admin_cliente). Fotos del detalle: URLs firmadas de corta vida emitidas por la API | 5–6 h    | Pruebas HTTP por endpoint con fakes; RBAC probado (dispositivo sin `tablero.leer` → 403)                                          |
| C3 · Login del supervisor             | Pantalla de entrada del Dashboard (email + contraseña → `/api/v1/auth/login`), sesión con el paquete C1, pantalla de sesión expirada. Es parte de la integración aprobada (DEC-013 no permite leer sin autenticar), no una funcionalidad nueva                                                                                                                                                                                                                                                                                     | 3–4 h    | Supervisor real entra; el banner de demostración desaparece con fuente real                                                       |
| C4 · `FuenteApi`                      | Implementa `FuenteDatosTablero` sobre `ClienteHttp`; se selecciona en `main.tsx` por configuración (`VITE_FUENTE=api`); la simulada sigue disponible para demos                                                                                                                                                                                                                                                                                                                                                                    | 2–3 h    | Pruebas de mapeo respuesta→modelos de lectura                                                                                     |
| C5 · Validación sin tocar componentes | Las 4 pestañas + detalle funcionando con datos reales del piloto interno                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 1–2 h    | **`git diff` vacío en `src/paginas/` y `src/componentes/`** — la promesa de la arquitectura de adaptadores, cumplida y demostrada |

**Criterio de fase:** supervisor con login real viendo cargas reales; contrato del puerto intacto. **+9 → 89/100.**

## Fase D — Piloto interno (nosotros, antes que el cliente)

**Dependencias:** Fases A y C. · **Esfuerzo:** medio día con dispositivos físicos (mínimo un Android; idealmente también un iPhone para validar A1 en real).

| Tarea                         | Criterio de terminado                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1 · Las 10 cargas offline    | 10 cargas en modo avión desde celular real, sincronizadas al recuperar señal — **el criterio de la Etapa 1 del spec, ejecutado físicamente por primera vez** |
| D2 · Dashboard en tiempo real | Cada carga aparece en `/hoy` del supervisor en ≤60 s tras sincronizar (el polling)                                                                           |
| D3 · Recuperación de errores  | Matar la API a mitad de cola → backoff visible → recuperación automática al volver; cerrar la app a mitad de cola → reabrir → la cola continúa               |
| D4 · Flujo completo de fotos  | Blobs subidos al bucket, borrados del dispositivo tras aceptación, visibles en el detalle vía URL firmada; verificado también desde iPhone                   |
| D5 · Coherencia de veredictos | Provocar un salto real de totalizador y una tanda sin resetear: el veredicto del servidor coincide con el local y se ve correcto en el Dashboard             |

**Criterio de fase:** D1–D5 documentados con evidencia (capturas + request_ids). **+3 → 92/100 → zona de Go técnico.**

## Fase E — Preparación del cliente (en paralelo con B–D; la instalación exige D)

**Dependencias:** El Trébol. Es la lista del §12 del spec, abierta desde el día uno. · **Esfuerzo:** 1–2 semanas calendario (ritmo del cliente), ~1 día de trabajo propio.

| Tarea                          | Detalle                                                                                                                                                    | Criterio de terminado                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| E1 · Inventario real           | Equipos (código, tipo de medidor, capacidad), conductores autorizados, lectura de instalación del dispensador, **respuesta a la segunda manguera (§12.4)** | Cargado en producción reemplazando el seed                          |
| E2 · Geocerca                  | Coordenadas de la estación                                                                                                                                 | En `sedes`, R10 activa                                              |
| E3 · Medidor físico            | Bajar el medidor o instalar visera antirreflejo (§2)                                                                                                       | Foto legible verificada in situ a distintas horas de sol            |
| E4 · Materiales y capacitación | Instructivo de una página por rol; sesión con conductores (una carga simulada cada uno) y supervisor (pestañas + guion de R2: "un salto no es un robo")    | Cada conductor completó una carga guiada                            |
| E5 · Soporte                   | Persona, teléfono, acceso a logs de Railway, guía de lectura de `request_id`                                                                               | Documento de soporte + prueba de trazabilidad hecha por esa persona |
| E6 · Instalación               | Ejecutar el plan del día de instalación (`RC1_RELEASE_AUDIT.md` §6)                                                                                        | Carga de prueba real visible en el Dashboard, anulada con rastro    |

**Criterio de fase:** E1–E5 completos antes de agendar E6. **+3 → 95/100.**

---

## Secuencia y dependencias (resumen)

```
A (correcciones) ──────────────┐
B (infraestructura) ← cuentas ─┼─→ C (integración Dashboard) ─→ D (piloto interno) ─→ GO (>90)
E (cliente) ── en paralelo ────┴──────────────── E6 instalación requiere D + Go ─────┘
```

Ruta crítica: **B** — es la única fase bloqueada por algo externo al repo (cuentas y plan Pro). A puede empezar hoy; E puede empezar hoy del lado del negocio.
