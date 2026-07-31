# CuadreApp

Control de despacho de combustible en planta de clientes industriales de Lubryco S.A.S.

Antes de tocar cualquier cosa, leer en este orden:

1. `docs/PRODUCT_BIBLE.md` — visión, usuarios, casos de uso, reglas de negocio en lenguaje llano, arquitectura, roadmap, decisiones, glosario. Fuente de verdad de producto.
2. `docs/ESPEC_App_Cuadre_Lubryco.md` — especificación técnica: esquema de datos, reglas de validación R1–R12, cálculos, flujos de pantalla exactos. Fuente de verdad técnica.
3. `docs/mockups/` — mockups interactivos de referencia para la UI (conductor y dashboard), ya aprobados como guía visual.

Los dos primeros documentos no se duplican entre sí a propósito: el Product Bible explica el *por qué* y enlaza al *cómo* exacto en la especificación técnica. Si algo cambia, se actualiza en su documento correspondiente, no se copia al otro.

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
- **Hosting (DEC-005):** PWA/dashboard en **Vercel**; API propia en **Railway**; base de datos y autenticación en **Supabase**. Tres proveedores, responsabilidad separada, ninguno atado a otro.
- **Autenticación y autorización (DEC-004):** Supabase Auth resuelve identidad; la PWA presenta ese token a la API. Los roles y permisos son **RBAC propio** modelado en tablas del dominio (`roles`, `usuarios`, `dispositivos`) — nunca custom claims de Supabase ni roles nativos de Postgres como fuente de autorización.
- **Monorepo (DEC-006):** pnpm workspaces — `apps/pwa` (cliente, Vercel), `apps/api` (servidor, Railway), `packages/dominio` (reglas R1–R12 y cálculos, sin dependencias de entorno), `packages/tipos-bd` (tipos generados de Supabase), `supabase/` (migraciones, RLS, seed).
- **Reglas de dependencias (DEC-007):** solo `apps/* → packages/*`, nunca al revés; `packages/tipos-bd` es hoja y `packages/dominio` solo depende de ella; `apps/pwa` y `apps/api` jamás se importan entre sí — se comunican únicamente por HTTP. Grafo de paquetes siempre acíclico.
- **Plataforma del cliente (DEC-001, revisada):** la PWA es la plataforma del **MVP**, no una decisión permanente. Al cerrar el MVP se hace una evaluación técnica PWA vs. React Native + Expo. Todo lo anterior (dominio portable, API como única puerta) existe para que esa migración, si ocurre, tenga el menor impacto posible.

Detalle y razones completas en `docs/PRODUCT_BIBLE.md` §7 y §9 (DEC-001 a DEC-009).

## Estado actual

**Dominio R1–R12 cerrado, aprobado y congelado (31-jul-2026).** `@cuadreapp/dominio` con 77 pruebas y cobertura 100% de `validacion.ts`. En construcción: `apps/api` con `POST /api/v1/cargas` (thin, DEC-011). Pendientes de fases posteriores: autenticación, dashboard, PWA.

**Etapa 0 implementada, verificación pendiente.** El entorno de desarrollo no tiene Docker ni Postgres nativo para correr `supabase start` y ejecutar `supabase/verificacion_etapa0.sql` — revisado a mano, no corrido contra una base real. `usuarios` y `dispositivos` con esquema y RLS pero sin filas sembradas (requieren cuentas reales de Supabase Auth).

Nota sobre RLS y DEC-009: las políticas RLS de la Etapa 0 se escribieron antes de formalizar API First. Siguen siendo correctas — quedan como segunda línea de defensa y donde vive la regla de privacidad — pero el camino de acceso del cliente es la API, no consultas directas de la PWA a Supabase.
