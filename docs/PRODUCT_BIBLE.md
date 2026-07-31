# Product Bible — CuadreApp

**Versión:** 1.4 — 31 de julio de 2026
**Estado del proyecto:** Arquitectura congelada (DEC-001 a DEC-009) + metodología Tests First registrada (DEC-010). Etapa 0 implementada, verificación pendiente de un entorno con Postgres (ver [Roadmap](#8-roadmap)). Etapa 1 en progreso: dominio primero, pantallas solo tras aprobación.
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

- **Cliente:** el **MVP** es una sola PWA (React + TypeScript + Vite + Tailwind) con rutas para el flujo del conductor, el dashboard del cliente y la vista de Lubryco. La plataforma es una decisión de MVP, no permanente: al cerrar el MVP se hará una evaluación técnica para decidir si permanece como PWA o migra a React Native + Expo ([DEC-001](#decisiones)).
- **Hosting:** tres capas con responsabilidad separada y ninguna atada a la otra — PWA/dashboard en **Vercel**, API propia en **Railway**, base de datos y autenticación en **Supabase** ([DEC-005](#decisiones)).
- **Offline:** cola local en IndexedDB (Dexie) con fotos comprimidas; se sincroniza cuando la app está abierta y hay señal. No depende de Background Sync del navegador (no existe en iOS Safari).
- **Autenticación y autorización:** Supabase Auth resuelve identidad. Los roles y permisos son RBAC propio, modelado en tablas del dominio (`roles`, `usuarios`, `dispositivos`) — nunca en mecanismos específicos de Supabase (custom claims, roles nativos de Postgres) como única fuente de verdad ([DEC-004](#decisiones)). La PWA obtiene y renueva su sesión contra Supabase Auth (identidad es infraestructura) y presenta ese token a la API, que resuelve los permisos con el RBAC propio.
- **API First ([DEC-009](#decisiones)):** toda funcionalidad de negocio se implementa primero en la API propia (Railway), que es la única autoridad para validaciones, reglas de negocio, escritura, auditoría y permisos. La PWA nunca accede directamente a Supabase para operaciones de negocio — solamente consume la API, versionada bajo `/api/v1/` ([DEC-008](#decisiones)). Supabase es infraestructura (Postgres, Auth, Storage). RLS permanece activa como segunda línea de defensa en la capa de datos — la regla de privacidad del §6 sigue aplicada ahí, como exige la especificación técnica — pero no es el camino de acceso del cliente.
- **Una sola fuente para las reglas de validación:** las 12 reglas viven en un único paquete de código (`packages/dominio`), sin dependencias de entorno (ni de navegador, ni de un framework de servidor específico), importado tanto por la PWA como por la API. Una regla, un lugar — nunca se reescribe la misma regla en dos lenguajes distintos.
- **Multi-tenant desde el diseño:** todo aislado por `cliente_id` vía RLS, incluyendo la vista agregada de Lubryco (que nunca toca las tablas base de detalle).
- **Reglas de dependencias del monorepo ([DEC-007](#decisiones)):** las dependencias de código van únicamente de `apps/*` hacia `packages/*`, nunca al revés; `packages/tipos-bd` es una hoja y `packages/dominio` solo puede depender de ella; `apps/pwa` y `apps/api` jamás se importan entre sí — se comunican exclusivamente por HTTP contra el contrato REST.
- **Preparado para la evaluación post-MVP (PWA vs. React Native + Expo):** `packages/dominio` es TypeScript puro sin dependencias de navegador, y con API First la API es la única puerta a los datos — cualquiera de las dos plataformas la consume sin tocar el backend ([DEC-001](#decisiones), [DEC-005](#decisiones), [DEC-009](#decisiones)).

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
| **0** | Esquema Supabase + RLS + seed con equipos reales de El Trébol | **Implementada, verificación pendiente** — tablas, RLS y trigger escritos (`supabase/migrations/`); seed de *demostración* (no el inventario real, que sigue pendiente); el entorno de desarrollo no tenía Docker/Postgres disponible para correr `supabase/verificacion_etapa0.sql` | Un `insert` de carga desde SQL dispara triggers y actualiza `tot_actual_gal` — script listo en `supabase/verificacion_etapa0.sql`, revisado a mano, no ejecutado todavía |
| **1** | Flujo de conductor completo, offline, con R1–R12 validadas contra la API propia (Railway) | **En progreso** — orden estricto ([DEC-010](#decisiones)): `packages/dominio` con pruebas primero → revisión y aprobación → recién después la PWA | 10 cargas registradas en modo avión y sincronizadas al recuperar señal |
| **2** | Dashboard del cliente, 4 pestañas | Pendiente | Reproduce el diseño aprobado (`docs/mockups/`) con datos reales |
| **3** | Entregas de Lubryco + balance + alerta de reorden | Pendiente | La alerta salta con la autonomía calculada |
| **4** | Vista Lubryco multicliente | Pendiente | Rol `comercial_lubryco` activo sobre vistas agregadas. Sin integración a ningún sistema externo — CuadreApp es autónomo (ver [DEC-002](#decisiones)) |
| **5** | Aforo del tanque, OCR sugerido, verificación trimestral del medidor | Pendiente — depende de que lleguen las medidas del tanque | — |

## 9. Decisiones

Registro de decisiones de producto y arquitectura, con su razón y alternativas consideradas. Se agregan entradas nuevas, nunca se editan las viejas — si una decisión cambia, se registra una nueva entrada que reemplaza a la anterior y se referencian entre sí. Excepción única: el propietario del producto puede re-alcanzar una entrada existente de forma explícita; en ese caso la entrada se marca como "revisada" con su fecha (así ocurrió con DEC-001).

| ID | Fecha | Decisión | Estado | Razón | Alternativas consideradas |
|---|---|---|---|---|---|
| DEC-001 | 2026-07-31 | El **MVP** se desarrolla como **PWA** (React + TS + Vite + Tailwind). Al finalizar el MVP se realizará una evaluación técnica para decidir si la plataforma permanece como PWA o migra a React Native + Expo. Toda la arquitectura debe mantenerse preparada para soportar cualquiera de las dos alternativas con el menor impacto posible ([DEC-007](#decisiones) y [DEC-009](#decisiones) son lo que lo hace posible: dominio portable, API como única puerta a los datos). | **Aceptada — revisada 2026-07-31**: la plataforma es una decisión de MVP, no permanente | Para el piloto, cero fricción de instalación y cero costo de tienda pesan más que las ventajas nativas. Pero la decisión definitiva de plataforma necesita evidencia real de campo (parque de dispositivos de los conductores, comportamiento de cámara y offline en planta) que solo existirá al terminar el MVP. | React Native + Expo desde el inicio (descartada para el MVP: USD 99/año de cuenta Apple y fricción de distribución, sin evidencia de campo que lo justifique todavía; se reevalúa formalmente al cierre del MVP) |
| DEC-002 | 2026-07-31 | CuadreApp es completamente independiente de StationOS. A efectos del proyecto, StationOS no existe. Cualquier integración futura es únicamente vía API REST propia — nunca tablas, código, autenticación o repositorio compartidos. | **Aceptada** | Evitar acoplar el roadmap y la arquitectura de CuadreApp a un sistema externo indefinido. CuadreApp debe poder desarrollarse, desplegarse y operar sin ninguna dependencia externa. | Integración a nivel de base de datos o repositorio compartido con StationOS (descartada explícitamente) |
| DEC-003 | 2026-07-31 | Las reglas de validación (R1–R12) viven en un único paquete TypeScript (`packages/dominio`), importado por el cliente y por el servidor (la API propia, [DEC-005](#decisiones)) que es la única vía de escritura a `cargas`. | **Aceptada** — confirmada al congelar la arquitectura; reforzada y generalizada por [DEC-009](#decisiones) | Cumplir la regla del propio spec técnico ("una regla, un lugar") sin reescribir la lógica de negocio en SQL además de TypeScript. | Trigger `plpgsql` con las reglas reescritas en SQL (descartada por duplicación) |
| DEC-004 | 2026-07-31 | **Autenticación:** Supabase Auth. **Autorización:** RBAC propio en base de datos — tablas `roles`, `usuarios` (identidad + `cliente_id` + `sede_id` + rol) y `dispositivos` (enrolamiento por sede), ausentes en el esquema original de la especificación técnica §6. Los roles y permisos son un concepto del dominio del negocio, no del framework: nunca se usan custom claims de Supabase Auth ni roles nativos de Postgres como única fuente de autorización. | **Aceptada** | RLS necesita una fuente de roles legible y versionada en el propio esquema, no oculta en configuración de un proveedor — así el modelo de permisos se puede auditar, testear y portar de proveedor de Auth sin reescribir lógica de negocio. | Custom claims de Supabase Auth (JWT `app_metadata`) como única fuente de autorización (descartada — acopla la lógica de negocio al framework) |
| DEC-005 | 2026-07-31 | **Hosting:** PWA/dashboard en **Vercel**; API propia en **Railway**; base de datos y autenticación en **Supabase**. La arquitectura se mantiene preparada para que, si en el futuro se migra de PWA a React Native, un cliente Expo/EAS consuma la misma API sin cambios de backend. | **Aceptada** | Separar cliente, API y datos en tres proveedores de responsabilidad única evita que un cambio de cliente (PWA → React Native) obligue a rehacer el backend — la API en Railway es agnóstica de quién la consume. | Cloudflare Pages para el cliente (descartada a favor de Vercel); lógica de servidor como Edge Functions de Supabase en vez de una API propia (descartada para no atar la autoridad de escritura al proveedor de base de datos) |
| DEC-006 | 2026-07-31 | **Monorepo:** pnpm workspaces desde el inicio, con la estructura pensada para escalar (varias apps y paquetes reutilizables) desde la Etapa 0. | **Aceptada** | Con dos apps ya previstas (PWA en `apps/pwa`, API en `apps/api`) y paquetes compartidos (`packages/dominio`, `packages/tipos-bd`), vale la pena empezar con la estructura correcta y evitar una migración de tooling a mitad de proyecto. | npm workspaces (equivalente, sin ventaja clara); Turborepo (se puede añadir después si el grafo de builds lo justifica) |
| DEC-007 | 2026-07-31 | **Reglas de dependencias del monorepo:** (a) las dependencias de código van únicamente de `apps/*` hacia `packages/*`, nunca al revés; (b) el grafo entre paquetes es siempre acíclico — `packages/tipos-bd` es una hoja (no depende de nada del repo) y `packages/dominio` solo puede depender de `packages/tipos-bd`; (c) `apps/pwa` y `apps/api` jamás se importan entre sí: se comunican exclusivamente por HTTP contra el contrato REST; (d) un contrato compartido entre apps se modela en un paquete, nunca importando una app desde otra. | **Aceptada** | Previene dependencias circulares antes de que exista código que las cree, y mantiene las apps desplegables por separado (Vercel/Railway) sin acoplarlas en build time. | Disciplina informal de code review sin regla escrita (descartada — en la Etapa 1 se automatiza con un lint de fronteras en CI) |
| DEC-008 | 2026-07-31 | **Versionado de la API:** todos los endpoints viven bajo `/api/v1/` desde el primer día. Las versiones futuras (`/api/v2/`, …) convivirán con las anteriores sin romper compatibilidad: una versión solo se retira cuando ningún cliente activo la consume. | **Aceptada** | Una PWA se actualiza sola con cada deploy, pero un futuro cliente React Native instalado ([DEC-001](#decisiones)) no — la convivencia de versiones es lo que permite evolucionar la API sin romper clientes en campo. Introducir el versionado después sería en sí mismo un breaking change. | Sin versionado hasta que haga falta (descartada — el costo de ponerlo el día uno es un segmento de ruta; el de ponerlo después, una migración de todos los clientes) |
| DEC-009 | 2026-07-31 | **API First.** Toda funcionalidad del sistema se implementa primero en la API. La PWA nunca accede directamente a Supabase para operaciones de negocio: solamente consume la API. Supabase es infraestructura (Postgres, Auth, Storage). La API es la única autoridad para validaciones, reglas de negocio, escritura, auditoría y permisos. RLS permanece como segunda línea de defensa en la capa de datos (la regla de privacidad del §6 sigue aplicada ahí), no como el camino de acceso del cliente. | **Aceptada** | Un solo punto de autoridad hace el sistema auditable y testeable, y deja el backend intacto ante cualquier cambio de cliente (evaluación PWA vs. React Native de [DEC-001](#decisiones)). Generaliza [DEC-003](#decisiones): ya no es solo la escritura de `cargas`, es toda operación de negocio. | Lecturas directas del cliente a Supabase con RLS como único control (descartada — dispersa la autoridad entre dos capas y acopla el cliente al proveedor de datos) |
| DEC-010 | 2026-07-31 | **Tests First.** Toda regla de negocio en `packages/dominio` sigue el ciclo: (1) escribir primero las pruebas, (2) verificar que fallen, (3) implementar la regla, (4) verificar que todas pasen, (5) refactorizar si es necesario, (6) actualizar documentación si cambió el comportamiento. Ninguna regla de negocio se considera terminada sin pruebas automatizadas. Cada regla R1–R12 tiene pruebas unitarias independientes; los casos límite de la especificación técnica (§13) son obligatorios; toda corrección futura comienza agregando una prueba que reproduzca el problema antes de modificar el código. | **Aceptada** | El dominio es el corazón probatorio del producto: si las reglas fallan en silencio, el sistema pierde exactamente el valor que lo justifica. Las pruebas escritas antes de la implementación fijan el comportamiento esperado desde la especificación, no desde lo que el código terminó haciendo. | Tests después de implementar (descartada — deja los casos límite al azar de la memoria de quien implementa y valida el código contra sí mismo) |

## 10. Glosario

- **Autonomía (días):** cuántos días de operación quedan según la existencia estimada y el consumo diario promedio.
- **Bandera:** etiqueta que marca por qué una carga quedó en `advertencia` o `inconsistente` (ej. `SALTO_TOTALIZADOR`).
- **Candado aritmético:** cada una de las tres verificaciones que se derivan de los dos registros del medidor en una sola foto (R1–R3), sin necesidad de OCR ni hardware.
- **Carga:** un evento de despacho de combustible a un equipo, con sus lecturas antes/después, fotos y validaciones — inmutable una vez guardada.
- **Cuadre:** que el combustible despachado tenga dueño verificable el mismo día; también el nombre del producto.
- **Dispensador:** el punto físico (manguera + medidor) por donde se despacha combustible.
- **API propia:** el servicio de servidor (Node/TypeScript, desplegado en Railway) que expone los endpoints de escritura del sistema y tiene autoridad final sobre la validación — separado de Supabase, que solo provee base de datos, autenticación y storage.
- **Estado de una carga:** `ok` | `advertencia` | `inconsistente`, según qué banderas se dispararon.
- **Existencia estimada:** cuánto combustible debería quedar en el tanque, calculado por balance (entregado − despachado), no medido directamente — no hay aforo del tanque todavía.
- **Geocerca:** radio alrededor de una sede dentro del cual se espera que ocurra una carga.
- **Origen de una carga:** `app` (registro normal) | `papel_retro` (digitación tardía de un registro en papel) | `correccion` (nueva carga que corrige una anterior).
- **PWA (Progressive Web App):** aplicación web instalable desde el navegador, sin tienda de aplicaciones.
- **Punto de reorden:** la fecha en la que Lubryco debería programar la siguiente entrega para no dejar al cliente sin combustible.
- **RBAC (Role-Based Access Control):** control de acceso basado en roles. En CuadreApp es propio del dominio (tablas `roles`/`usuarios`), no un mecanismo del framework de autenticación.
- **Remisión:** el documento/registro de una entrega de combustible de Lubryco al cliente.
- **RLS (Row Level Security):** mecanismo de Postgres que restringe qué filas puede ver o modificar cada usuario según su rol — aquí es donde vive la regla de privacidad de Lubryco, no en la interfaz.
- **StationOS:** sistema mencionado en una versión anterior del roadmap. **No existe a efectos de este proyecto** — ver [DEC-002](#decisiones). Si en el futuro existe, se integra únicamente por API REST propia.
- **Tanda (batch):** el registro reseteable del medidor Fill-Rite, en decimales, que muestra los galones de la carga actual.
- **Tolerancia:** margen de error aceptado antes de marcar una bandera, para no confundir la imprecisión normal del medidor (~1%) con un problema real.
- **Totalizador:** el registro acumulado de vida del medidor Fill-Rite, en enteros, que nunca se resetea.
