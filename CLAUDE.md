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

## Convenciones de código (para cuando se apruebe escribir código)

- Todo en español: nombres de tablas, columnas, variables de dominio, textos de UI.
- Zona horaria `America/Bogota`. Se guarda `timestamptz`, se muestra en hora local.
- Galones con una decimal en toda la cadena. `numeric`, nunca `float`, para volúmenes.
- Formato numérico colombiano en pantalla: punto de miles, coma decimal (`1.847,6`).
- Toda regla de validación (R1–R12) vive en un único módulo compartido (`packages/dominio`), importado tanto por la app como por la función de servidor. Una regla, un lugar.
- Tests obligatorios sobre R1–R12 con casos límite: rodillo a mitad de giro, tanda 0.0 exacta, totalizador que da la vuelta en 999999.

## Límite de integración externa

CuadreApp es un producto completamente independiente. No depende de ningún sistema externo (incluido "StationOS", que a efectos de este proyecto no existe). Cualquier integración futura es únicamente vía una API REST propia y versionada — nunca compartiendo tablas, código, autenticación ni repositorio. Detalle en `docs/PRODUCT_BIBLE.md` §7.

## Estado actual

**Pre-Etapa 0.** Product Bible construido. Quedan decisiones abiertas antes de poder empezar el esquema de Supabase — ver la tabla de Decisiones en `docs/PRODUCT_BIBLE.md` (DEC-004 modelo de usuarios/roles, DEC-005 hosting, DEC-006 gestor de monorepo).
