# RC1 — Release Audit · CuadreApp

**Fecha:** 1 de agosto de 2026 · **Auditor:** rol CTO · **Alcance:** todo el producto (dominio, API, PWA, Dashboard, infraestructura, documentación, operación)
**Contexto verificable:** 169 pruebas en verde, gate completo (lint/formato/fronteras/typecheck/builds) limpio, 33 commits. Cada hallazgo de código de este documento fue **verificado contra el código fuente**, no estimado.

**Veredicto anticipado: NO-GO al piloto hoy. Puntuación 68/100.** No por calidad de lo construido — por tres brechas de completitud que este documento detalla, todas con camino conocido. La sección final enumera qué sube la nota por encima de 90.

---

## 1. Hallazgos críticos (bloquean el piloto)

| #   | Hallazgo                                                                                                                                                                                                                                                         | Evidencia                                                                 | Consecuencia en el piloto                                                                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | **El Dashboard solo muestra datos simulados.** No existe `FuenteApi`, ni endpoints de lectura `/api/v1/tablero/*`, ni login del supervisor — fue el alcance aprobado de la etapa, pero ahora es la brecha número uno                                             | `apps/dashboard/src/datos/` contiene solo `fuente-simulada.ts`            | El conductor captura, pero **el supervisor no puede ver nada real**. Sin el circuito capturar→ver-el-mismo-día, el piloto no demuestra la propuesta de valor del producto |
| C2  | **Nada ha tocado infraestructura real.** Sin proyecto Supabase, sin despliegues Railway/Vercel, E2E en `skipped`, backups sin activar                                                                                                                            | Etapa H: preparado y documentado, jamás ejecutado (`docs/OPERACIONES.md`) | Riesgo de sorpresas de integración el día de la instalación; imposible dar Go sin al menos un ciclo completo real                                                         |
| C3  | **Fotos rechazadas en iPhone.** La API solo acepta `content-type: image/webp`; Safari/iOS no exporta WebP desde canvas, así que `browser-image-compression` entrega JPEG/PNG → 415 → la cola marca `error_definitivo` y **la carga queda atascada para siempre** | `apps/api/src/rutas/fotos.ts:18` (parser solo webp)                       | Cualquier conductor con iPhone no puede sincronizar. Bug de corrección obligatoria en RC1                                                                                 |

## 2. Hallazgos importantes (corregir antes del piloto)

| #   | Hallazgo                                                                                                                                                                                                                                                                                                                   | Evidencia                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| I1  | **"Tus cargas de hoy" rota a las 7 p. m.:** el día se calcula con `toISOString()` (UTC); en Colombia (UTC-5) el "hoy" cambia a las 19:00 locales. Viola la convención del spec §13 (`America/Bogota`)                                                                                                                      | `apps/pwa/src/App.tsx:104`            |
| I2  | **La cola offline es purgable:** jamás se llama `navigator.storage.persist()`; bajo presión de almacenamiento el navegador puede borrar IndexedDB **con cargas y fotos no sincronizadas** — es la evidencia probatoria del producto                                                                                        | grep sin resultados en `apps/pwa/src` |
| I3  | **`bodyLimit` inconsistente:** la ruta de fotos declara 2 MB pero Fastify corta en 1 MiB por defecto → 413 confuso en fotos grandes (hoy improbable con 60–90 KB, pero es una mentira del contrato)                                                                                                                        | sin `bodyLimit` en `apps/api/src`     |
| I4  | **PWA sin íconos de instalación** (`icons: []`): en Android "agregar a inicio" muestra un ícono genérico; iOS necesita `apple-touch-icon`. Primera impresión del cliente                                                                                                                                                   | `apps/pwa/vite.config.ts:24`          |
| I5  | **Errores del cliente invisibles para soporte:** la PWA no reporta errores a ningún lado; un fallo en campo depende de que el conductor lo describa por teléfono                                                                                                                                                           | sin mecanismo en `apps/pwa`           |
| I6  | **Deriva de catálogo multi-dispositivo:** el contexto local del totalizador solo avanza con cargas propias; con 2+ dispositivos en la misma isla, el segundo verá saltos falsos de R2 en vivo (el servidor revalida bien, pero el conductor ve avisos confusos). Aceptable con UN dispositivo — el piloto debe fijarlo así |
| I7  | **Reloj del dispositivo sin contraste:** `iniciada_en`/`finalizada_en`/R11/R12 confían en la hora del celular; un reloj desconfigurado contamina timestamps (riesgo conocido desde Etapa H, sin mitigación aún)                                                                                                            |

## 3. Hallazgos menores

- PIN visible al digitarse (sin `type="password"`); el PIN "identifica, no protege", pero en pantalla compartida incomoda.
- Sin pantalla/manual de ayuda dentro de la PWA (¿qué hago si no cuadra?): el spec §8 define los mensajes, falta un "¿problemas?" con el teléfono del supervisor.
- `GET /api/v1/cargas/:id` no existe: la PWA no puede re-consultar el veredicto de una carga ya sincronizada (hoy usa el de la respuesta del POST — suficiente, pero limita soporte).
- El Dashboard no tiene `<html lang>` dinámico ni saltos de "skip to content"; contraste AA cumplido, navegación por teclado correcta.
- Textos: revisión ortotipográfica pendiente de un hablante en frío (mezcla "tanquear/cargar" en pantallas de la PWA).
- CSP con comodín `https://*.up.railway.app` hasta fijar el dominio real (ya anotado en OPERACIONES).
- Rate limit en memoria por instancia (irrelevante con 1 instancia; anotado desde Etapa H).

## 4. Riesgos

**Del piloto:** (a) el requisito físico del medidor (§2: altura/reflejo) sigue sin resolverse — **sin foto legible el producto pierde su valor probatorio completo**; (b) el inventario real de El Trébol (§12) sigue pendiente: equipos, conductores, lectura de instalación, coordenadas, y la pregunta de la segunda manguera; (c) adopción: si el primer día un conductor queda bloqueado (C3), vuelve al papel y no regresa.

**Operacionales:** un solo entorno (sin staging separado del piloto — aceptable si el piloto ES el staging, decisión explícita); códigos de enrolamiento generados por SQL (proceso manual con instrucciones, propenso a error de quien lo ejecute); backups sin activar hasta ejecutar el checklist.

**Para el cliente:** falsos positivos de reglas mal calibradas (R8 con la constante de 100 km/h derivada por nosotros, no validada con la operación real) pueden quemar la confianza del supervisor — el spec advierte exactamente esto; privacidad: RLS + API First protegen el detalle, pero el compromiso de privacidad hacia Lubryco debe comunicarse al Trébol explícitamente.

**Técnicos:** HS256 con secreto compartido (migrar a JWKS después); almacenamiento del navegador best-effort (I2 lo mitiga, no lo elimina — la evaluación PWA vs RN post-MVP existe por esto); dependencia de un solo desarrollador/agente en el conocimiento del sistema (mitigado por la documentación, que es fuerte).

**De soporte:** sin agregador de errores (I5), el `request_id` en pantalla es la única trazabilidad desde el cliente — suficiente solo si el proceso de soporte (quién contesta el teléfono, con acceso a los logs de Railway) queda definido antes del piloto.

## 5. Checklist Go / No-Go

**Bloqueantes (todos deben estar ✓ para Go):**

- [ ] C1: Dashboard conectado a datos reales (FuenteApi + endpoints de lectura + login supervisor)
- [ ] C3, I1, I2, I3, I4 corregidos y con prueba
- [ ] Infraestructura ejecutada: Supabase migrado + seed real, API en Railway (`/listo` verde), PWA y Dashboard en Vercel, CSP fijada al dominio real
- [ ] E2E real en verde + `verificacion_etapa0.sql` ejecutado
- [ ] Backups activados (plan Pro + export lógico programado)
- [ ] Prueba de campo interna: 10 cargas en modo avión desde un celular real, sincronizadas al recuperar señal (criterio de la Etapa 1, nunca ejecutado físicamente)
- [ ] Medidor bajado o con visera antirreflejo, foto legible verificada in situ
- [ ] Inventario real cargado (equipos, conductores, lectura de instalación, geocerca) y pregunta de la segunda manguera respondida
- [ ] Proceso de soporte definido (persona, teléfono, acceso a logs)

**No bloqueantes pero deseables:** I5, I6 documentado como restricción (un dispositivo), manual de una página por rol.

## 6. Plan del día de instalación (medio día en planta)

1. **Antes de ir:** checklist de infraestructura completo; códigos de enrolamiento generados; usuarios del supervisor creados; datos reales sembrados.
2. **En planta (2 h):** verificar foto legible del medidor a distintas horas de sol → enrolar EL dispositivo oficial → carga de prueba real completa (con combustible de verdad) → verla aparecer en el Dashboard del supervisor → borrar la carga de prueba con rastro (`origen='correccion'`).
3. **Capacitación (1.5 h):** conductores: los 7 pasos con el celular en la mano, una carga simulada cada uno; supervisor: las 4 pestañas + qué significa cada bandera + **el guion de R2: "un salto no es un robo, falta saber a qué equipo fue"**.
4. **Cierre:** dejar pegado en la isla el instructivo de una página; anotar la lectura del totalizador de arranque oficial del piloto.

## 7. Plan del primer día de operación

Supervisión remota activa toda la jornada (logs de Railway en vivo); el aliado interno (§12.7 — quien hoy transcribe planillas) acompaña la isla en la mañana; verificación al mediodía y al cierre: cargas en cola = 0, veredictos revisados por el supervisor, ninguna vuelta al papel; llamada de 15 min al final del día con el supervisor: fricciones, textos confusos, tiempos por carga.

## 8. Plan de contingencia

| Falla                                             | Respuesta                                                                                                                                         | Pérdida                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| API caída                                         | La PWA sigue capturando offline (por diseño); Railway reinicia; si >2 h, aviso al supervisor                                                      | Ninguna: cola local                            |
| Dispositivo dañado/perdido                        | Re-enrolar otro celular con código nuevo; desactivar el anterior (RBAC corta al instante)                                                         | Solo lo no sincronizado del dispositivo dañado |
| Base de datos corrupta                            | Runbook de recuperación (`OPERACIONES.md` §5, RTO < 4 h); las colas locales re-sincronizan por idempotencia                                       | ≤ RPO del backup                               |
| El sistema pierde credibilidad (falsos positivos) | Congelar alertas (son advertencias, no bloqueos, por diseño); recalibrar tolerancias con datos reales; el papel NUNCA se retira hasta la semana 2 | Confianza — el activo más caro                 |
| Vuelta masiva al papel                            | Registrar por `origen='papel_retro'` al final del día mientras se corrige la causa                                                                | Fricción temporal                              |

## 9. Criterios de éxito del piloto (2 semanas)

1. ≥ 90% de las cargas reales registradas por la app (contra el conteo físico de despachos).
2. Tiempo mediano por registro ≤ 60 s (objetivo del spec: 40 s).
3. Cero cargas perdidas por fallas de sincronización.
4. Todo salto de totalizador detectado el mismo día y con disposición del supervisor (revisado/explicado).
5. El supervisor consulta el Dashboard ≥ 5 días por semana sin que se le pida.
6. El balance entregado−despachado cierra contra las remisiones dentro del 2% (la tolerancia que el propio spec exige prometer).
7. Ningún conductor pide volver al papel en la semana 2.

## 10. Métricas de las dos primeras semanas

Por día: cargas registradas vs. despachos reales; distribución de estados (ok/advertencia/inconsistente); banderas por tipo (¿R8 genera falsos positivos? — vigilar la constante de 100 km/h); tiempo p50/p95 de registro (`finalizada_en − iniciada_en` + tiempo hasta sync); antigüedad máxima de la cola offline; reintentos de sincronización y errores 4xx/5xx por `request_id`; sesiones del Dashboard del supervisor; % de fotos legibles (muestreo manual diario); códigos/PIN fallidos.

## 11. Mejoras priorizadas para v1.1

1. **Conexión real del Dashboard** (si no entró como bloqueante de RC1 — es C1). 2. Reporte de errores del cliente (beacon a la API u agregador). 3. Recalibración de tolerancias R8/R6 con dos semanas de datos reales. 4. Corrección de cargas y cierre del día para el supervisor (UC-04/UC-05 — primera funcionalidad de escritura del Dashboard). 5. Export a Excel (pospuesto del mockup). 6. Escaneo QR del sticker. 7. Retención de fotos a 90 días + purga de resúmenes locales (jobs). 8. `GET /api/v1/cargas/:id`. 9. Recalculo histórico §10.7 (prerequisito para multi-dispositivo, junto con I6). 10. Entregas de Lubryco (Etapa 3 del roadmap). 11. JWKS asimétrico. 12. Manual/ayuda dentro de la app.

## 12. Puntuación de preparación

| Dimensión (peso)                                                                 | Nota  | Justificación                                         |
| -------------------------------------------------------------------------------- | ----- | ----------------------------------------------------- |
| Núcleo de negocio: dominio congelado, 100% cobertura, precisiones aprobadas (20) | 20/20 | Impecable y probado                                   |
| Captura del conductor: flujo, offline, idempotencia (15)                         | 12/15 | Sólido; I1, I2 y C3 lo tocan directo                  |
| Circuito completo capturar→ver (15)                                              | 4/15  | C1: el supervisor no ve datos reales                  |
| Seguridad e identidad (10)                                                       | 9/10  | Fuerte; HS256 y canal de códigos anotados             |
| Infraestructura ejecutada (15)                                                   | 5/15  | C2: preparado ≠ ejecutado                             |
| Calidad de ingeniería: pruebas, CI, fronteras, docs (10)                         | 10/10 | 169 pruebas, gates automáticos, documentación viva    |
| Operación y soporte: runbooks, contingencia, observabilidad (10)                 | 6/10  | Runbooks fuertes; I5 y proceso de soporte sin definir |
| Preparación del cliente: datos reales, medidor, capacitación (5)                 | 2/5   | §12 sigue abierto; requisito físico sin resolver      |

### **Total: 68/100 → NO-GO al piloto hoy.**

**Camino a >90 (en orden):** ① conectar el Dashboard a datos reales (C1, +9); ② ejecutar la infraestructura completa con E2E y backups (C2, +8); ③ corregir C3+I1+I2+I3+I4 con pruebas (+4); ④ prueba de campo interna de 10 cargas en modo avión (+3); ⑤ resolver medidor físico + inventario real + proceso de soporte (+3). Con eso: ~95/100 y Go.

Ninguno de estos pasos es investigación: todos tienen instrucciones escritas o son correcciones acotadas. La brecha es de ejecución, no de diseño.
