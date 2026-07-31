# Product Bible — CuadreApp

**Versión:** 1.0 — 31 de julio de 2026
**Estado del proyecto:** Pre-Etapa 0 (sin código escrito todavía)
**Propietario del producto:** Lubryco S.A.S. — Buga, Valle del Cauca
**Cliente piloto:** Industrias Alimenticias El Trébol S.A.S. (Panela Trébol)

## Cómo se relaciona este documento con la especificación técnica

Este proyecto tiene **dos documentos de fuente de verdad, no uno**:

- **Este Product Bible** — el *por qué*, el *para quién*, las reglas de negocio en lenguaje llano, las decisiones tomadas y por qué, y el estado del roadmap. Es lo primero que se lee para entender el producto.
- **`docs/ESPEC_App_Cuadre_Lubryco.md`** — el *cómo* exacto: esquema SQL, fórmulas de validación, flujos de pantalla pixel a pixel. Es la referencia técnica precisa.

Cuando algo se explica en ambos, este documento da el resumen y **enlaza** al detalle técnico exacto en vez de duplicarlo — duplicar es lo que hace que un documento se desactualice sin que nadie lo note.

`docs/mockups/` contiene los mockups interactivos de referencia para la UI (conductor y dashboard), ya aprobados como guía visual.

---

## 1. Visión

Que en cualquier planta industrial donde Lubryco entrega diésel, **cada galón que sale del tanque tenga dueño** — equipo, conductor, hora — sin que nadie tenga que digitar una planilla ni perseguir un número que no cuadra al cierre de mes.

A mediano plazo, CuadreApp deja de ser "una app que Lubryco regala" y se convierte en la infraestructura de datos que le permite a Lubryco operar como proveedor de **inventario administrado por proveedor** (vendor-managed inventory): saber, sin llamar a nadie, cuánto combustible le queda a cada cliente y cuándo despachar la siguiente entrega.

CuadreApp es un producto autónomo. No depende de ningún otro sistema de Lubryco para funcionar — ni hoy ni en el futuro (ver [Decisión DEC-002](#decisiones)).

## 2. Objetivo

**Objetivo de producto (v0.1 — demo):** que un conductor registre una carga completa en menos de 40 segundos, sin teclado alfabético, funcionando sin señal, y que el sistema detecte el mismo día cualquier salto o inconsistencia — no al cierre de mes.

**Objetivo de negocio (Lubryco):** obtener consumo real y confiable por cliente para generar alertas de reorden automáticas, sin acceder al detalle operativo interno del cliente (ver regla de privacidad en [Reglas del negocio](#6-reglas-del-negocio)).

**No es un objetivo de este producto:** digitalizar la planilla de papel tal cual es, ni ser un sistema de facturación, ni integrar GPS de flota, ni hacer OCR automático en esta etapa.

## 3. Problema que resuelve

El cliente tiene un tanque de diésel y un dispensador con medidor mecánico. Más de 20 equipos se abastecen ahí. Hoy el conductor anota la lectura en una planilla de papel: escribe mal, escribe poco, o no escribe. Alguien transcribe después, y el número transcrito no cuadra con la realidad — y cuando se nota, ya pasó un mes y no hay forma de reconstruir qué pasó.

El problema de fondo no es de formato (papel vs. digital), es de **trazabilidad y verificación el mismo día**. El diseño completo del producto gira alrededor de un hecho físico aprovechable: el medidor Fill-Rite 900 tiene dos registros en la misma carátula (tanda reseteable + totalizador de vida) que, capturados en una sola foto, permiten verificar la aritmética sin OCR ni hardware adicional. Detalle completo en `docs/ESPEC_App_Cuadre_Lubryco.md` §2.

## 4. Usuarios

| Rol | Quién | Contexto de uso |
|---|---|---|
| `conductor` | Operarios de campo del cliente (tractoristas, camioneros, etc.) | Celular en una mano, a veces con guantes, sol directo, cero paciencia para pantallas complicadas. Usa la app varias veces al día, siempre el mismo flujo de 7 pasos. No inicia sesión — el dispositivo ya está enrolado, solo se identifica con código + PIN. |
| `supervisor` | Jefe de campo / almacén del cliente | Dashboard web, uso diario. Es quien corrige registros y cierra el día. Necesita ver el veredicto ("¿qué pasa hoy?") antes que la tabla de datos cruda. |
| `admin_cliente` | Gerencia del cliente (El Trébol) | Todo lo del supervisor + gestión de equipos y conductores autorizados. Uso esporádico, más administrativo. |
| `conductor_lubryco` | Conductor del carrotanque de Lubryco | Registra la entrega en sitio cuando abastece el tanque del cliente: galones, foto del medidor del carrotanque, firma de quien recibe. Mismo perfil de uso de campo que `conductor`. |
| `comercial_lubryco` | Equipo comercial de Lubryco | Vista agregada multicliente: volumen, autonomía, alertas de reorden. **Nunca** ve detalle por conductor ni por equipo de ningún cliente — esa es la línea de privacidad que sostiene la confianza del cliente en el producto. |

## 5. Casos de uso

| ID | Actor | Caso de uso | Resultado esperado |
|---|---|---|---|
| UC-01 | conductor | Registrar una carga de combustible completa | Carga guardada localmente de inmediato (con o sin señal), validada en el dispositivo, sincronizada cuando hay red. |
| UC-02 | conductor | Consultar sus cargas del día | Ve cuántas registró y cuáles quedan pendientes de subir. |
| UC-03 | supervisor | Revisar el veredicto del día | Ve en una frase qué está pasando (existencia, autonomía, cuántas cargas no cuadran) antes de ver ninguna tabla. |
| UC-04 | supervisor | Corregir un registro | Inserta una carga nueva de corrección con motivo obligatorio; el registro original nunca se borra ni se edita. |
| UC-05 | supervisor | Cerrar el día | Marca el día como revisado. |
| UC-06 | supervisor | Consultar eficiencia por equipo | Ve gal/hora o gal/km por equipo y su desvío contra su propio histórico. |
| UC-07 | supervisor | Consultar suministro y pedir a Lubryco | Ve el balance entregado vs. despachado y puede iniciar un pedido. |
| UC-08 | admin_cliente | Gestionar equipos | Alta/baja de equipos, tipo de medidor (horómetro/odómetro), capacidad de tanque propio. |
| UC-09 | admin_cliente | Gestionar conductores autorizados | Alta/baja de conductores y su código + PIN. |
| UC-10 | conductor_lubryco | Registrar una entrega (remisión) | Galones entregados, foto del medidor del carrotanque, firma de quien recibe — queda como evidencia del suministro. |
| UC-11 | comercial_lubryco | Consultar consumo agregado multicliente | Ve volumen y autonomía por cliente, nunca el detalle operativo. |
| UC-12 | comercial_lubryco | Recibir alerta de reorden | Semáforo por cliente con fecha sugerida de próxima entrega. |
| UC-13 | Sistema (automático) | Detectar salto de totalizador | Genera alerta `SALTO_TOTALIZADOR` sin bloquear el registro ni acusar de robo. |
| UC-14 | Sistema (automático) | Sincronizar la cola offline | Al recuperar señal, sube fotos y registros pendientes; el servidor revalida y tiene la última palabra. |
| UC-15 *(futuro, fuera de alcance actual)* | Sistema externo | Consumir datos agregados de CuadreApp | Únicamente vía una API REST propia y versionada de CuadreApp — ver [Decisión DEC-002](#decisiones). |

## 6. Reglas del negocio

Principios rectores (el porqué detrás de las 12 reglas técnicas):

- **Nunca se bloquea un registro.** Todo se guarda y se marca. Un registro rechazado es un conductor que vuelve al papel — eso es exactamente lo que estamos evitando.
- **El servidor es la autoridad final**, no el dispositivo. El cliente valida para dar feedback inmediato, pero el servidor revalida con el dato real y decide.
- **Una carga es inmutable.** No hay `UPDATE` de lecturas. Una corrección es una carga nueva con motivo, no una edición — sin esto el sistema pierde valor probatorio.
- **La cámara en vivo es obligatoria; nunca galería.** Con galería, en dos semanas se reciclan fotos viejas.
- **Offline es el supuesto por defecto, no la excepción.** El primer día sin señal no puede mandar a nadie de vuelta al papel.
- **El medidor tiene ~1% de error de fábrica.** Ninguna alerta debe tratar una variación menor al 2% como robo — la tolerancia se define entre 1.5–2%.
- **Privacidad no negociable:** Lubryco ve volumen agregado y días de autonomía. El detalle por conductor y por equipo es del cliente y solo del cliente, aplicado en RLS (permisos a nivel de fila en la base de datos), no en la interfaz — si estuviera solo en la UI, sería trivial de saltar.
- **El PIN identifica, no protege.** La defensa contra fraude son los tres candados aritméticos y las fotos, no el PIN.
- **Un salto de totalizador no es necesariamente un robo.** El totalizador ya contó esos galones — lo que falta es saber a qué equipo fueron. La UI debe comunicarlo así para no quemar la confianza del supervisor en el sistema con una acusación falsa.

Las doce reglas de validación (R1–R12) con su fórmula exacta y tolerancia viven en `docs/ESPEC_App_Cuadre_Lubryco.md` §7. Resumen:

| Regla | Qué verifica | Bloquea el registro |
|---|---|---|
| R1 | La tanda arrancó en 0.0 (se reseteó el medidor) | No |
| R2 | El totalizador inicial coincide con el final de la carga anterior | No |
| R3 | La tanda final coincide con lo que subió el totalizador (±1 gal) | No |
| R4 | El totalizador nunca retrocede | No, pero marca inconsistente |
| R5 | Hubo despacho real (tanda final > 0) | No, pero marca inconsistente |
| R6 | Los galones no exceden ~115% de la capacidad del tanque del equipo | No |
| R7 | El contador del equipo (horómetro/odómetro) no retrocede | No |
| R8 | El salto del contador del equipo es plausible en el tiempo transcurrido | No |
| R9 | Existen las dos fotos, tomadas con cámara en vivo | **Sí** |
| R10 | El GPS está dentro de la geocerca de la sede | No |
| R11 | No hay otra carga del mismo equipo en los últimos 3 minutos | No |
| R12 | La duración de la carga es plausible (20 s – 60 min) | No |

## 7. Arquitectura

Resumen orientado a producto — el detalle de esquema SQL vive en `docs/ESPEC_App_Cuadre_Lubryco.md` §4 y §6.

- **Cliente:** una sola PWA (React + TypeScript + Vite + Tailwind) con rutas para el flujo del conductor, el dashboard del cliente y la vista de Lubryco. Un solo despliegue. Elegida sobre React Native + Expo por el modelo de distribución (instalable desde un link, sin tienda, sin cuenta de developer, actualización instantánea) — ver [Decisión DEC-001](#decisiones).
- **Offline:** cola local en IndexedDB (Dexie) con fotos comprimidas; se sincroniza cuando la app está abierta y hay señal. No depende de Background Sync del navegador (no existe en iOS Safari).
- **Backend:** Supabase (Postgres + Auth + Storage + RLS).
- **Autoridad de escritura:** toda inserción de `cargas` pasa por una única función de servidor que revalida las 12 reglas contra el dato real de la base — el cliente nunca escribe directo. Así el servidor es la autoridad de verdad, no solo una frase en el documento.
- **Una sola fuente para las reglas de validación:** las 12 reglas viven en un único paquete de código (`packages/dominio`), sin dependencias de entorno, importado tanto por el cliente como por la función de servidor. Una regla, un lugar — nunca se reescribe la misma regla en dos lenguajes distintos.
- **Multi-tenant desde el diseño:** todo aislado por `cliente_id` vía RLS, incluyendo la vista agregada de Lubryco (que nunca toca las tablas base de detalle).

### Límite de integración externa (independencia de StationOS)

CuadreApp **no depende de ningún sistema externo** para funcionar, incluyendo StationOS — a efectos de este proyecto, StationOS no existe. Si en el futuro surge una necesidad real de integración:

- La única superficie de integración es una **API REST propia de CuadreApp**, versionada (`/api/v1/...`).
- **No se comparten tablas de base de datos**, ni directa ni indirectamente (sin vistas cross-database, sin réplicas).
- **No se comparte código** entre CuadreApp y el sistema externo.
- **No se comparte autenticación ni sesión** — cualquier consumidor externo se autentica con sus propias credenciales (API key u OAuth2) contra la API de CuadreApp.
- **No se comparte repositorio.**

Esto es un principio de arquitectura, no un detalle de implementación pendiente — cualquier propuesta futura de integración que rompa alguno de estos cuatro puntos debe rechazarse o volver a esta decisión para revisarla explícitamente.

## 8. Roadmap

| Etapa | Alcance | Estado | Criterio de terminado |
|---|---|---|---|
| **0** | Esquema Supabase + RLS + seed con equipos reales de El Trébol | **Pendiente de inicio** — hay decisiones abiertas que la bloquean, ver [Decisiones](#decisiones) | Un `insert` de carga desde SQL dispara triggers y actualiza `tot_actual_gal` |
| **1** | Flujo de conductor completo, offline, con R1–R12 | Pendiente | 10 cargas registradas en modo avión y sincronizadas al recuperar señal |
| **2** | Dashboard del cliente, 4 pestañas | Pendiente | Reproduce el diseño aprobado (`docs/mockups/`) con datos reales |
| **3** | Entregas de Lubryco + balance + alerta de reorden | Pendiente | La alerta salta con la autonomía calculada |
| **4** | Vista Lubryco multicliente | Pendiente | Rol `comercial_lubryco` activo sobre vistas agregadas. Sin integración a ningún sistema externo — CuadreApp es autónomo (ver [DEC-002](#decisiones)) |
| **5** | Aforo del tanque, OCR sugerido, verificación trimestral del medidor | Pendiente — depende de que lleguen las medidas del tanque | — |

## 9. Decisiones

Registro de decisiones de producto y arquitectura, con su razón y alternativas consideradas. Se agregan entradas nuevas, nunca se editan las viejas — si una decisión cambia, se registra una nueva entrada que reemplaza a la anterior y se referencian entre sí.

| ID | Fecha | Decisión | Estado | Razón | Alternativas consideradas |
|---|---|---|---|---|---|
| DEC-001 | 2026-07-31 | Cliente móvil: PWA (React + TS + Vite + Tailwind) | **Aceptada** | El modelo de negocio es regalar la app a múltiples clientes industriales — cero fricción de instalación y cero costo de tienda pesan más que las ventajas nativas de cámara/push/storage, ninguna de las cuales es un requisito bloqueante hoy. | React Native + Expo (mejor cámara con overlay nativo, push maduro en iOS, storage sin riesgo de purga — pero con USD 99/año de cuenta Apple obligatoria y fricción de distribución que choca con el modelo de regalo multicliente) |
| DEC-002 | 2026-07-31 | CuadreApp es completamente independiente de StationOS. A efectos del proyecto, StationOS no existe. Cualquier integración futura es únicamente vía API REST propia — nunca tablas, código, autenticación o repositorio compartidos. | **Aceptada** | Evitar acoplar el roadmap y la arquitectura de CuadreApp a un sistema externo indefinido. CuadreApp debe poder desarrollarse, desplegarse y operar sin ninguna dependencia externa. | Integración a nivel de base de datos o repositorio compartido con StationOS (descartada explícitamente) |
| DEC-003 | 2026-07-31 | Las reglas de validación (R1–R12) viven en un único paquete TypeScript (`packages/dominio`), importado por el cliente y por una función de servidor que es la única vía de escritura a `cargas`. | Propuesta — pendiente de confirmación al iniciar Etapa 0 | Cumplir la regla del propio spec técnico ("una regla, un lugar") sin reescribir la lógica de negocio en SQL además de TypeScript. | Trigger `plpgsql` con las reglas reescritas en SQL (descartada por duplicación) |
| DEC-004 | 2026-07-31 | Agregar al esquema una tabla `usuarios` (rol + cliente_id) y una tabla `dispositivos` (enrolamiento por sede), ausentes en el esquema original de la especificación técnica §6. | **Abierta** — pendiente de aprobación explícita | Sin esto no hay forma de implementar RLS por rol para `supervisor`, `admin_cliente`, `conductor_lubryco` y `comercial_lubryco`, ni de definir qué identidad de Supabase Auth usa un dispositivo enrolado. | — |
| DEC-005 | 2026-07-31 | Hosting: Cloudflare Pages vs. Vercel | **Abierta** — pendiente de decisión | El propio spec técnico deja ambas opciones abiertas (§4). | — |
| DEC-006 | 2026-07-31 | Gestor de monorepo: pnpm workspaces, sin Turborepo por ahora | Propuesta — pendiente de confirmación | Una app y dos paquetes no justifican todavía la caché de build de Turborepo; se puede agregar después si el monorepo crece. | npm workspaces (equivalente, sin ventaja clara); Turborepo (prematuro a este tamaño) |

## 10. Glosario

- **Autonomía (días):** cuántos días de operación quedan según la existencia estimada y el consumo diario promedio.
- **Bandera:** etiqueta que marca por qué una carga quedó en `advertencia` o `inconsistente` (ej. `SALTO_TOTALIZADOR`).
- **Candado aritmético:** cada una de las tres verificaciones que se derivan de los dos registros del medidor en una sola foto (R1–R3), sin necesidad de OCR ni hardware.
- **Carga:** un evento de despacho de combustible a un equipo, con sus lecturas antes/después, fotos y validaciones — inmutable una vez guardada.
- **Cuadre:** que el combustible despachado tenga dueño verificable el mismo día; también el nombre del producto.
- **Dispensador:** el punto físico (manguera + medidor) por donde se despacha combustible.
- **Edge Function:** función de servidor (en este proyecto, sobre Supabase/Deno) que corre lejos del cliente y tiene autoridad final sobre la escritura.
- **Estado de una carga:** `ok` | `advertencia` | `inconsistente`, según qué banderas se dispararon.
- **Existencia estimada:** cuánto combustible debería quedar en el tanque, calculado por balance (entregado − despachado), no medido directamente — no hay aforo del tanque todavía.
- **Geocerca:** radio alrededor de una sede dentro del cual se espera que ocurra una carga.
- **Origen de una carga:** `app` (registro normal) | `papel_retro` (digitación tardía de un registro en papel) | `correccion` (nueva carga que corrige una anterior).
- **PWA (Progressive Web App):** aplicación web instalable desde el navegador, sin tienda de aplicaciones.
- **Punto de reorden:** la fecha en la que Lubryco debería programar la siguiente entrega para no dejar al cliente sin combustible.
- **Remisión:** el documento/registro de una entrega de combustible de Lubryco al cliente.
- **RLS (Row Level Security):** mecanismo de Postgres que restringe qué filas puede ver o modificar cada usuario según su rol — aquí es donde vive la regla de privacidad de Lubryco, no en la interfaz.
- **StationOS:** sistema mencionado en una versión anterior del roadmap. **No existe a efectos de este proyecto** — ver [DEC-002](#decisiones). Si en el futuro existe, se integra únicamente por API REST propia.
- **Tanda (batch):** el registro reseteable del medidor Fill-Rite, en decimales, que muestra los galones de la carga actual.
- **Tolerancia:** margen de error aceptado antes de marcar una bandera, para no confundir la imprecisión normal del medidor (~1%) con un problema real.
- **Totalizador:** el registro acumulado de vida del medidor Fill-Rite, en enteros, que nunca se resetea.
