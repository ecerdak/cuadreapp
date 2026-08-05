# Academia CuadreApp

**Propuesta documental. No hay nada construido y ninguna etapa del kit lo construye.**

Existe para que, cuando alguien decida hacerla, no tenga que volver a diseñarla: el contenido ya está escrito, los guiones ya están cerrados, y lo que falta es producción y una plataforma.

---

## Qué problema resuelve

Hoy la capacitación es un acompañamiento presencial de Lubryco en cada planta. Funciona con dos clientes. Con veinte, no.

Los tres síntomas de una capacitación que no escala:

1. **La calidad depende de quién fue.** Dos operadores de dos plantas reciben cursos distintos.
2. **La rotación deshace el trabajo.** Entra alguien nuevo y hay que volver a viajar, o aprende de un compañero — que a su vez aprendió mal.
3. **No hay forma de saber quién sabe.** Cuando una carga sale mal, no se distingue un descuido de una persona que nunca fue capacitada.

Los tres se resuelven con lo mismo: lecciones cortas, iguales para todos, y un registro de quién las completó.

---

## Los tres niveles

```
BÁSICO         →  Cursos 1 y 2   ·  operadores        ·  20 min
INTERMEDIO     →  Curso 3        ·  supervisores      ·  35 min
ADMINISTRADOR  →  Curso 4        ·  Lubryco           ·  45 min
TRANSVERSAL    →  Curso 5        ·  gerencia y comercial  ·  12 min
```

**Nadie hace más de un nivel salvo el equipo de Lubryco.** Un operador no necesita el curso de supervisor, y ponérselo delante hace que abandone el suyo.

---

# NIVEL BÁSICO

## Curso 1 · Cargar combustible _(perfil Medidor Doble)_

|                      |                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Para quién**       | Operador de planta con medidor                                                              |
| **Duración**         | 20 min · video 3:05 + práctica acompañada                                                   |
| **Fuente**           | [`OP-AND-MD`](../01_Operadores/OP-AND-MD.md) / [`OP-IOS-MD`](../01_Operadores/OP-IOS-MD.md) |
| **Requisito previo** | Ninguno                                                                                     |
| **Aprueba cuando**   | Registra una carga completa sin ayuda                                                       |

### Lecciones

| #   | Lección                        | Momento        | Dura      | Objetivo                                           |
| --- | ------------------------------ | -------------- | --------- | -------------------------------------------------- |
| 1.1 | Antes de salir a trabajar      | `M-MD-00`      | 3 min     | Que el teléfono esté listo antes del primer equipo |
| 1.2 | Llega un equipo a cargar       | `M-MD-01`      | 2 min     | Que los galones queden al equipo correcto          |
| 1.3 | **Antes de abrir la manguera** | `M-MD-02`      | **6 min** | Que la tanda quede en cero y la foto se lea        |
| 1.4 | Está saliendo el combustible   | `M-MD-03`      | 1 min     | Que no toque «terminé» antes de tiempo             |
| 1.5 | Se cerró la manguera           | `M-MD-04`      | 4 min     | Que cierre la carga con los dos números            |
| 1.6 | La carga quedó registrada      | `M-MD-05`      | 2 min     | Que sepa qué hacer con cada sello                  |
| 1.7 | Si algo pasa                   | `M-OP-E1`–`E4` | 2 min     | Que avise en vez de improvisar                     |

**La lección 1.3 pesa el doble que las demás en la evaluación.** Es donde se producen los errores que después nadie puede reconstruir.

### Material complementario

Guía rápida `QG-OP-MD` (laminada, junto al surtidor) · checklist arrancable · comparativas `K-01`, `K-03`, `K-04`.

### Evaluación sugerida

- **3 preguntas de reconocimiento:** dada una fotografía del medidor, ¿esta foto sirve? (usa `K-01`)
- **1 pregunta de orden:** ordenar los seis pasos de una carga
- **1 pregunta de criterio:** salió «No cuadra», ¿qué hace? _(la respuesta correcta es avisar, no rehacer)_
- **Práctica obligatoria:** una carga real acompañada

---

## Curso 2 · Registrar un carrotanque _(perfil Carga sobre Inventario)_

|                      |                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Para quién**       | Operador de estación de despacho                                                            |
| **Duración**         | 18 min · video 2:50 + práctica                                                              |
| **Fuente**           | [`OP-AND-CI`](../01_Operadores/OP-AND-CI.md) / [`OP-IOS-CI`](../01_Operadores/OP-IOS-CI.md) |
| **Requisito previo** | Ninguno                                                                                     |
| **Aprueba cuando**   | Registra una carga completa **y explica por qué no escribe el total**                       |

### Lecciones

| #   | Lección                      | Momento        | Dura      | Objetivo                             |
| --- | ---------------------------- | -------------- | --------- | ------------------------------------ |
| 2.1 | Antes de salir a trabajar    | `M-CI-00`      | 3 min     | Teléfono listo                       |
| 2.2 | Llegó el carrotanque         | `M-CI-01`      | 2 min     | Identificar el vehículo por su placa |
| 2.3 | **Con cuánto llegó**         | `M-CI-02`      | **5 min** | Que no confunda llegada con despacho |
| 2.4 | Está saliendo el combustible | `M-CI-03`      | 1 min     | Vigilar sin tocar el teléfono        |
| 2.5 | **Cuánto despachó Lubryco**  | `M-CI-04`      | **4 min** | Que vea el total calcularse solo     |
| 2.6 | Quedó registrada             | `M-CI-05`      | 2 min     | Los tres sellos                      |
| 2.7 | Si algo pasa                 | `M-OP-E1`–`E4` | 1 min     | Avisar en vez de improvisar          |

**El curso entero gira alrededor de una sola idea:** el operador escribe dos números y la aplicación calcula el tercero. Las lecciones 2.3 y 2.5 son las dos caras de esa idea.

### Material complementario

Guía rápida `QG-OP-CI` · checklist · comparativas `K-02`, `K-05` · zoom `Z-24`.

### Evaluación sugerida

- **Pregunta eliminatoria:** «¿el total lo escribe usted?» — quien responde que sí, repite la lección 2.5
- **1 caso:** el vehículo llegó con 150 y se le echaron 600. ¿Qué escribe en cada campo?
- **1 pregunta de criterio:** llegó vacío, ¿qué escribe? _(0,0, no dejarlo en blanco)_
- **Práctica obligatoria**

---

# NIVEL INTERMEDIO

## Curso 3 · Controlar el combustible de su planta

|                      |                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Para quién**       | Supervisor del cliente                                                                                                      |
| **Duración**         | 35 min                                                                                                                      |
| **Fuente**           | [`SUP-MD`](../02_Supervisores/SUP-MD.md) / [`SUP-CI`](../02_Supervisores/SUP-CI.md)                                         |
| **Requisito previo** | Haber visto el curso del perfil de su planta (1 o 2) — **para saber qué se le pide al operador antes de juzgar su trabajo** |
| **Aprueba cuando**   | Resuelve tres casos: descuadre por digitación, foto faltante y salto de totalizador                                         |

### Lecciones

| #   | Lección                       | Momento | Dura      | Objetivo                                              |
| --- | ----------------------------- | ------- | --------- | ----------------------------------------------------- |
| 3.1 | Qué demuestra esto y qué no   | —       | 4 min     | Que no prometa a gerencia algo que el sistema no mide |
| 3.2 | ¿Hay algo que atender hoy?    | `S-01`  | 3 min     | Que en verde cierre el día en un minuto               |
| 3.3 | Una carga no cuadra           | `S-02`  | 6 min     | Que abra las fotos antes que los números              |
| 3.4 | Falta una fotografía          | `S-03`  | 3 min     | Que llame el mismo día                                |
| 3.5 | Un equipo consume de más      | `S-04`  | 4 min     | Taller antes que conversación                         |
| 3.6 | ¿Cuándo pido combustible?     | `S-05`  | 3 min     | Que no confunda estimación con medición               |
| 3.7 | **Me preguntan si hubo robo** | `S-06`  | **9 min** | **Que no acuse a nadie con la evidencia equivocada**  |
| 3.8 | Contabilidad pide los datos   | `S-07`  | 3 min     | Exportar sin transcribir                              |

**La lección 3.7 es obligatoria y no se puede saltar.** Un supervisor que no la entiende va a acusar a alguien de robo con la evidencia equivocada, y ese es el peor daño que esta herramienta puede causar.

### Material complementario

Guía rápida `QG-SUP` · comparativas `K-08`, `K-09` · zooms `Z-64` a `Z-67`.

### Evaluación sugerida

- **Caso 1:** las fotos muestran 1.250 y el operador escribió 1.520. ¿Qué es y qué hace?
- **Caso 2:** el totalizador arrancó 40 galones arriba. ¿Qué pregunta primero?
- **Caso 3:** un equipo subió 30 % su consumo. ¿A quién llama?
- **Pregunta de criterio:** ¿cuándo escala a su jefatura? _(solo con las tres casillas marcadas)_

---

# NIVEL ADMINISTRADOR

## Curso 4 · Poner un cliente a operar

|                      |                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------ |
| **Para quién**       | Equipo interno de Lubryco                                                                  |
| **Duración**         | 45 min                                                                                     |
| **Fuente**           | [`ADM`](../03_Admin/ADM.md)                                                                |
| **Requisito previo** | Cursos 1, 2 y 3 — **quien configura la plataforma tiene que haber visto lo que configura** |
| **Aprueba cuando**   | Incorpora un cliente completo en el ambiente de práctica                                   |

### Lecciones

| #   | Lección                                | Momento | Dura       | Objetivo                                             |
| --- | -------------------------------------- | ------- | ---------- | ---------------------------------------------------- |
| 4.1 | Las tres decisiones que no se deshacen | —       | 5 min      | Perfil, totalizador y PIN                            |
| 4.2 | **Incorporar un cliente nuevo**        | `A-01`  | **15 min** | El proceso central, de la llamada a la primera carga |
| 4.3 | Sumar una sede                         | `A-02`  | 4 min      | Crecer sin migrar                                    |
| 4.4 | Entra un operador nuevo                | `A-03`  | 4 min      | Alta y enrolamiento                                  |
| 4.5 | Se perdió un teléfono                  | `A-04`  | 4 min      | Revocar de inmediato                                 |
| 4.6 | Cambió la imagen del cliente           | `A-05`  | 3 min      | Identidad sin tocar datos legales                    |
| 4.7 | **Cambió la forma de operar**          | `A-06`  | 6 min      | Que la historia nunca se reinterpreta                |
| 4.8 | Revisión semanal                       | `A-07`  | 4 min      | Ver el problema antes de que llamen                  |

**Requisito para tener acceso a la consola de producción.** Es el único curso con esa condición, y se justifica: aquí una equivocación afecta a un cliente entero.

### Material complementario

Guía rápida `QG-ADM` · ambiente de práctica con datos de demostración.

### Evaluación sugerida

- **Práctica completa:** incorporar un cliente ficticio de principio a fin
- **Caso:** el cliente pide cinco colores. ¿Qué responde? _(la respuesta correcta explica la garantía de legibilidad, no pide una excepción)_
- **Caso:** le dictan el totalizador por teléfono. ¿Qué hace? _(pedir una fotografía)_
- **Pregunta de criterio:** el cliente quiere cambiar de perfil un lunes de operación alta. ¿Qué propone?

---

# TRANSVERSAL

## Curso 5 · Para qué sirve esto

|                      |                                                     |
| -------------------- | --------------------------------------------------- |
| **Para quién**       | Gerencia del cliente y equipo comercial de Lubryco  |
| **Duración**         | 12 min                                              |
| **Fuente**           | Secciones de contexto de los manuales de supervisor |
| **Requisito previo** | Ninguno                                             |
| **Evaluación**       | Ninguna. Es un curso de contexto.                   |

### Lecciones

| #   | Lección                    | Dura  | Objetivo                                      |
| --- | -------------------------- | ----- | --------------------------------------------- |
| 5.1 | Qué demuestra el registro  | 4 min | Evidencia con hora, lugar, vehículo y persona |
| 5.2 | **Qué NO demuestra**       | 4 min | No es un aforo de tanque                      |
| 5.3 | Qué cambia en la operación | 4 min | Cinco minutos al día en vez de una mañana     |

**Es el curso más corto y el que evita más conversaciones difíciles.** Una gerencia que cree que esto mide el nivel del tanque va a exigir algo que el sistema no promete, y el supervisor va a quedar en el medio.

---

## Orden recomendado

```
Operador nuevo        →  su curso (1 o 2) el primer día · práctica el mismo día
Supervisor nuevo      →  curso del perfil de su planta, después el 3
Gerencia del cliente  →  curso 5 en la reunión de arranque
Lubryco, alguien nuevo →  1 → 2 → 3 → 4, en dos sesiones
```

**Regla:** nadie llega al curso 4 sin haber visto los tres anteriores. Configurar lo que uno no ha visto funcionar es como se cometen los errores caros.

---

## Cómo se conecta con lo que ya existe

```
docs/training/                    →  Academia
───────────────────────────────────────────────────────
01–03 (manuales)                  →  contenido de las lecciones
08_Storyboards                    →  guiones de los videos (cerrados)
06_Checklists · 10_QuickGuides    →  material descargable
13_Produccion/comparativas.md     →  reactivos de evaluación
00_Fuente/biblioteca-faq          →  sección de dudas de cada curso
00_Fuente/catalogo-momentos       →  estructura de las lecciones
```

**No hay contenido nuevo que escribir.** La Academia es una forma de entregar lo que ya está redactado.

---

## Qué haría falta para construirla

| Pieza                          | Estado          | Depende de                      |
| ------------------------------ | --------------- | ------------------------------- |
| Contenido de los 5 cursos      | **Listo**       | —                               |
| Estructura de 32 lecciones     | **Listo**       | —                               |
| Guiones de video               | **Cerrados**    | —                               |
| Evaluaciones                   | **Propuestas**  | Validación con un operador real |
| Producción de video            | Pendiente       | Visita a planta                 |
| Fotografías                    | Pendiente       | Visita a planta                 |
| Plataforma                     | **No decidida** | Decisión de producto            |
| Registro de quién completó qué | **No decidido** | Decisión de producto            |
| Certificados                   | **No decidido** | Decisión de producto            |

---

## Lo que esta propuesta deliberadamente NO decide

- **Si la Academia es parte de CuadreApp o un producto aparte.** Adentro significa autenticación, permisos y una app más que mantener. Afuera significa un proveedor externo y datos de personas en un tercero. Las dos tienen costo y ninguna es obviamente mejor.
- **Si los cursos son obligatorios para operar.** Es una decisión comercial con el cliente, no técnica.
- **Si hay certificados con vigencia.** Tiene sentido para auditorías, pero implica un proceso de renovación que hoy nadie está en capacidad de sostener.

**Las tres tienen que decidirse antes de escribir la primera línea de código, no después.**

---

## Resumen

| Nivel         | Cursos | Lecciones | Duración total |
| ------------- | ------ | --------- | -------------- |
| Básico        | 2      | 14        | 38 min         |
| Intermedio    | 1      | 8         | 35 min         |
| Administrador | 1      | 8         | 45 min         |
| Transversal   | 1      | 3         | 12 min         |
| **Total**     | **5**  | **33**    | **2 h 10 min** |
