# Training Design System de CuadreApp

**El sistema visual oficial de capacitación.** Equivalente al Design System del producto, aplicado exclusivamente a documentación y formación.

**Estado: congelado.** Claude Design diseña dentro de este sistema; nunca lo redefine. Cambiar una regla exige una decisión explícita del propietario del producto, igual que un cambio de arquitectura del producto.

**Alcance:** todo material de capacitación de CuadreApp, presente y futuro. Diseñado para extenderse a otros productos sin cambiar una regla — nada de lo que sigue depende de CuadreApp en particular.

---

## Qué decide este sistema y qué decide Claude Design

Esta separación es la razón de ser del documento y no admite ambigüedad:

| Este sistema decide                            | Claude Design decide                       |
| ---------------------------------------------- | ------------------------------------------ |
| Qué significa cada elemento                    | Cómo se ve                                 |
| En qué orden aparece cada bloque               | Dónde se ubica en la página y con qué aire |
| Cuándo existe un callout y de qué tipo         | Su tratamiento visual                      |
| Qué tipos de página hay y qué cabe en cada uno | La retícula, la tipografía, el color       |
| Qué se fotografía y bajo qué reglas            | El encuadre final y el tratamiento         |
| Cuántos conceptos caben en una página          | Cómo se jerarquizan visualmente            |

**Si aquí se fijaran colores o tipografías, el día que cambie el Design System del producto habría que rehacer 115 páginas.** El significado es lo que no puede cambiar sin reescribir el material.

---

## Los documentos del sistema

Este documento es la norma completa. Los siguientes desarrollan cada parte y **no contradicen nada de lo que está aquí**:

|     | Documento                                     | Qué norma                            |
| --- | --------------------------------------------- | ------------------------------------ |
| 01  | [`filosofía`](14_Sistema/01-filosofia.md)     | Los 12 principios congelados         |
| 02  | [`identidad`](14_Sistema/02-identidad.md)     | Los 12 elementos con su significado  |
| 03  | [`jerarquía`](14_Sistema/03-jerarquia.md)     | El orden de la información           |
| 04  | [`páginas`](14_Sistema/04-paginas.md)         | Los 13 tipos de página               |
| 05  | [`callouts`](14_Sistema/05-callouts.md)       | Las 6 categorías oficiales           |
| 06  | [`fotografía`](14_Sistema/06-fotografia.md)   | Reglas de imagen real                |
| 07  | [`capturas`](14_Sistema/07-capturas.md)       | Reglas de imagen generada            |
| 08  | [`iconografía`](14_Sistema/08-iconografia.md) | Las 7 categorías de ícono            |
| 09  | [`video`](14_Sistema/09-video.md)             | Reglas de narración, plano y montaje |
| 10  | [`evaluación`](14_Sistema/10-evaluacion.md)   | Cómo se mide que enseña              |
| 11  | [`calidad`](14_Sistema/11-calidad.md)         | Cuándo está terminado                |
| 12  | [`roadmap`](14_Sistema/12-roadmap.md)         | En qué orden se produce              |

**Para producir**, el inventario de qué existe y en qué estado está en [`CLAUDE_DESIGN_HANDOFF.md`](CLAUDE_DESIGN_HANDOFF.md). Ese documento dice **qué** producir; este dice **cómo debe ser**.

---

## 1 · Filosofía

Doce principios. Si uno hace imposible una página, se cambia la página.

|         | Principio                                                                                                             |
| ------- | --------------------------------------------------------------------------------------------------------------------- |
| `PR-01` | **Se enseña el trabajo, nunca la interfaz.** Ningún título contiene «pantalla», «campo», «botón» o «menú».            |
| `PR-02` | **Una idea por página.** Una página que se desborda se parte; nunca se comprime.                                      |
| `PR-03` | **Se aprende haciendo.** Todo curso de operador termina en una carga real acompañada.                                 |
| `PR-04` | **Mostrar antes de explicar.** Única excepción: en paso a paso, la imagen va después de los pasos.                    |
| `PR-05` | **Solo imágenes reales.** Sin renders, mockups, wireframes ni dibujos. Sin excepción por costo o plazo.               |
| `PR-06` | **El operador nunca interpreta.** Cero condicionales ambiguos. Si hay dos caminos, se escriben los dos.               |
| `PR-07` | **El supervisor decide, no navega.** «Qué no hacer» nunca se omite en una decisión.                                   |
| `PR-08` | **El administrador ejecuta procesos completos.** Un proceso no se parte a la mitad de una página.                     |
| `PR-09` | **Lo incorrecto va primero.** En toda comparativa, el error precede a la corrección.                                  |
| `PR-10` | **Se lee en una planta**, a pleno sol, con guantes, de pie, con ruido.                                                |
| `PR-11` | **Escasez deliberada.** ~20 prohibiciones en todo el material; máx. 4 llamados por imagen; máx. 3 columnas por tabla. |
| `PR-12` | **Un texto, un lugar.** Nada se escribe dos veces; se referencia por identificador.                                   |

**Precedencia ante conflicto:** `PR-06`, `PR-05` y `PR-01` por encima de todo — si se rompen, el material miente. Después `PR-02`, `PR-10` y `PR-11`. Después el resto.

**Desempate:** gana el principio que proteja a quien está aprendiendo, no el que produzca una página más elegante.

---

## 2 · Identidad de capacitación

Doce elementos. Cada uno con objetivo, cuándo, cuándo NO y prioridad — detalle en [`02-identidad.md`](14_Sistema/02-identidad.md).

| ID      | Elemento           | Existe cuando                                 | Prioridad |
| ------- | ------------------ | --------------------------------------------- | --------- |
| `EL-01` | Paso               | Hay que hacer algo con las manos              | **P0**    |
| `EL-02` | Resultado esperado | Hay que saber que se puede seguir             | **P0**    |
| `EL-03` | Advertencia        | La consecuencia es **recuperable**            | **P0**    |
| `EL-04` | Prohibición        | La consecuencia **no se deshace**             | **P0**    |
| `EL-05` | Error              | La persona **ya está** en ese estado          | **P0**    |
| `EL-06` | Comparativa        | Un error se ve casi igual al acierto          | **P0**    |
| `EL-07` | Zoom               | Hay algo que leer o tocar que no se distingue | P1        |
| `EL-08` | Checklist          | Hay que verificar, no enseñar                 | P1        |
| `EL-09` | Proceso            | Más de cinco pasos, o pasos en días distintos | P1        |
| `EL-10` | Nota               | Da contexto sin cambiar lo que se hace        | P1        |
| `EL-11` | Recomendación      | Hay un atajo que no se descubre solo          | P2        |
| `EL-12` | Dato importante    | El dato se necesita fuera de esta página      | P2        |

**Composiciones fijas** (no elementos nuevos): bloque de momento, bloque de decisión, tarjeta de estado, bloque de tres cifras, tabla de decisión, captura con llamados.

**Regla de extensión:** un elemento que falte se agrega a `02-identidad.md` **antes** de usarse. Inventarlo dentro de una página es como nacen los sistemas que nadie mantiene.

---

## 3 · Jerarquía de información

La regla que gobierna las cuatro jerarquías:

```
DÓNDE ESTOY → QUÉ HAGO → QUÉ NO HAGO → CÓMO SÉ QUE SALIÓ BIEN → QUÉ HAGO SI NO
```

**Capítulo de operador:** título · momento · objetivo · qué está ocurriendo · qué debe hacer · qué nunca debe hacer · qué verá en la aplicación · qué verá físicamente · resultado esperado · errores frecuentes.

**Decisión de supervisor:** título · momento · si ve esto · qué significa · qué revisar · qué decidir · a quién llamar · qué NO hacer.

**Proceso de administrador:** título · empieza cuando · termina cuando · antes de tocar la consola · los pasos · cómo sabe que salió bien · qué NO hacer.

**Guía rápida:** qué es · la idea que lo resume · los pasos · los tres sellos · si pasa esto · nunca.

**Cinco reglas transversales:** el título no nombra pantallas · el objetivo va antes que la acción · las prohibiciones van antes del éxito · los errores frecuentes cierran siempre · ningún bloque se salta por brevedad.

**Dentro de la página**, cuando dos elementos compiten: prohibición → paso → comparativa → zoom → resultado esperado → advertencia → nota. **Una nota nunca pesa más que un paso.**

---

## 4 · Tipos de página

Trece tipos. **No existe un decimocuarto sin agregarlo a [`04-paginas.md`](14_Sistema/04-paginas.md) primero.**

| ID     | Tipo                   | Conceptos máx. | Texto máx. | Usos |
| ------ | ---------------------- | -------------- | ---------- | ---- |
| `T-01` | Hero                   | 1              | 40         | 7    |
| `T-02` | Apertura de capítulo   | 1              | 90         | 28   |
| `T-03` | Paso a paso            | 2              | 160        | 34   |
| `T-04` | Comparativa            | 1              | 60         | 9    |
| `T-05` | Zoom                   | 1              | 35         | 51   |
| `T-06` | Decisión               | 3              | 220        | 14   |
| `T-07` | Proceso administrativo | 3              | 400        | 7    |
| `T-08` | Dashboard              | 2              | 120        | 4    |
| `T-09` | Checklist              | 0              | 120        | 7    |
| `T-10` | Troubleshooting        | 0              | 250        | 7    |
| `T-11` | Preguntas frecuentes   | 0              | 300        | 7    |
| `T-12` | Fin de proceso         | 1              | 80         | 7    |
| `T-13` | Guía rápida            | 2              | 200        | 4    |

**Un concepto** es algo que hay que entender y recordar. Un paso no es un concepto; «la tanda debe estar en cero» sí.

**`T-07` es el único que puede ocupar dos páginas seguidas.** `T-13` es el único que se juzga por lo que se le quitó.

---

## 5 · Sistema de callouts

Seis categorías. **No hay una séptima.**

| ID      | Categoría           | Existe cuando                                    |
| ------- | ------------------- | ------------------------------------------------ |
| `CO-01` | Consejo             | Hay una forma más rápida que no se descubre sola |
| `CO-02` | Advertencia         | La consecuencia es recuperable                   |
| `CO-03` | Error (prohibición) | La consecuencia no se deshace                    |
| `CO-04` | Dato importante     | El dato se necesita fuera de esta página         |
| `CO-05` | Validación          | Hay que comprobar algo antes de continuar        |
| `CO-06` | Acción requerida    | La acción ocurre **fuera** de la aplicación      |

**Árbol de decisión**, recorrido siempre de arriba abajo: ¿irreversible? → `CO-03`. ¿Tiene consecuencia? → `CO-02`. ¿Hay que comprobar? → `CO-05`. ¿Es fuera de la app? → `CO-06`. ¿Se necesita en otra página? → `CO-04`. Si no → `CO-01`.

**Cinco reglas de escritura:** verbo en imperativo primero · cero nombres de interfaz · una sola idea · máximo 15 palabras · la consecuencia, no la regla.

**Presupuesto:** paso a paso 4 · decisión 4 · proceso 5 · comparativa 1 · zoom **1, nunca 2** · guía rápida 5 · checklist, troubleshooting y preguntas **0**.

---

## 6 · Fotografía

**Solo imágenes reales.** Sin renders, mockups, wireframes, ilustraciones de dispositivos, dibujos de medidores ni bancos de imágenes. **No admite excepción por costo, plazo ni disponibilidad**: si una fotografía no se puede tomar, la página se produce con el hueco declarado.

**Contenido:** contexto antes que detalle · personas reales con autorización escrita · comparación correcto/incorrecto donde exista forma de equivocarse · las fotos «mal tomadas» se toman a propósito y tienen que parecer el error real · sin datos identificables · el estado de la escena es el estado real.

**Técnica:** luz natural sin flash (el flash sobre el vidrio del medidor produce el reflejo que enseñamos a evitar) · horizontal y vertical de cada escena clave · RAW + JPEG · tres tomas mínimo revisadas en el sitio · sin filtros ni corrección creativa de color.

**Jerarquía:** fotografía para lo que se ve con los ojos · captura para lo que se ve en el teléfono · ícono solo en índices y márgenes. **Un ícono nunca sustituye una fotografía.**

---

## 7 · Capturas

**No se toman: se generan.** `node scripts/capturar-pantallas.mjs`.

|     | Regla                                                                                |
| --- | ------------------------------------------------------------------------------------ |
| 1   | **Nunca se edita a mano.** El retoque se pierde en la siguiente corrida.             |
| 2   | **Siempre se regenera desde el producto** ante cualquier duda.                       |
| 3   | **Resolución consistente:** escritorio ×2, teléfono ×3.                              |
| 4   | **No se corta nada:** página completa, el diseñador recorta.                         |
| 5   | **No se ocultan estados.** Una captura «limpia» enseña una aplicación que no existe. |
| 6   | **Cero datos reales.** Demostración, con nombres neutros.                            |

**Condiciones fijas:** tema oscuro · es-CO · `America/Bogota` · animaciones desactivadas · fuentes cargadas · página completa.

**Si el producto cambia, se corre el arnés antes de tocar una página.** Diagramar sobre una captura vieja produce un manual que enseña una pantalla que ya no existe, y como se ve bien, nadie lo nota.

---

## 8 · Iconografía

Siete categorías. Un ícono pertenece a **una sola**; si encaja en dos, representa dos cosas.

| ID     | Categoría                   | Regla propia                                                 |
| ------ | --------------------------- | ------------------------------------------------------------ |
| `IC-A` | Estado y conectividad       | Los tres estados son normales; ninguno se dibuja como alarma |
| `IC-B` | Veredicto                   | **Los tres sellos se usan siempre juntos**                   |
| `IC-C` | Acción de la persona        | Una acción, un ícono; sin variantes por contexto             |
| `IC-D` | Persona                     | Los roles se distinguen por su trabajo, no por jerarquía     |
| `IC-E` | Mundo físico                | **Nunca reemplaza una fotografía**                           |
| `IC-F` | Estructura de la plataforma | Los cinco de la jerarquía se leen como familia               |
| `IC-G` | Navegación del documento    | Los únicos que pueden ir sin palabra, y solo en márgenes     |

**Cinco reglas de consistencia:** un concepto, un ícono · un ícono nunca va solo · los íconos de la aplicación no se rediseñan · ninguno nuevo sin entrada en el catálogo · un ícono ilustra, no enseña.

**Los P1 y P2 no se producen antes de la primera validación**: hasta ahí no se sabe cuáles sobran.

---

## 9 · Video

**El video enseña el camino normal. El manual resuelve los casos raros.**

**Narración:** tutear al operador, usted a los demás · nunca nombrar una pantalla · una idea por escena · cifras completas · cerrar con el tiempo real.

**Planos:** cámara fija salvo indicación · contexto antes que detalle · **el gesto físico se ve entero, sin cortes** · plano sobre el hombro para unir lo físico con lo digital · grabación real de pantalla.

**Velocidad:** ninguna escena baja de 8 s · las grabaciones de pantalla a velocidad normal · se acelera solo lo que no se aprende · **la escena de instalación nunca se acelera**.

**Transiciones:** corte seco dentro del mismo lugar · fundido a negro de 0,3 s al cambiar de lugar · cero transiciones decorativas · 0,4 s de silencio entre escenas, 0,8 s antes de una cifra o una prohibición.

**Textos:** quemados siempre · mayúsculas · **nunca repiten la narración** · uno por escena · subtítulos completos aparte.

**Errores:** el error real, no una caricatura · antes de la corrección · **nunca en una persona identificable** · **uno por video como máximo**.

**Duración:** operador y supervisor 3:00 (máx. 3:30) · administrador 3:20 (máx. 4:00) · contexto 2:00 (máx. 2:30).

**Formato:** operador vertical 9:16 · supervisor y administrador horizontal 16:9.

**El guion no se cambia en la mesa de montaje.** Se cambia en el storyboard primero.

---

## 10 · Evaluación

**Se evalúa el aprendizaje, no el diseño.**

**El principio:** cada punto donde una persona se detiene es un defecto del material, no de la persona.

**La prueba de campo** se hace después del primer artefacto de cada audiencia y antes de producir el resto. Personas no capacitadas · material impreso · en la planta · un observador que no ayuda · tarea real.

**Se mide:** tiempo hasta completar · **puntos de detención** (la métrica más importante) · errores · preguntas textuales · consultas al material · abandono.

**Aprueba** con tres personas distintas: la guía rápida, si completan sin abrir el manual; el manual de operador, si registran una carga sin ayuda y nadie se detiene más de dos veces; el de supervisor, si resuelven los tres casos y **ninguno concluye robo**; el de administrador, si incorporan un cliente sin preguntar; el video, si ejecutan la tarea sin volver a verlo.

**Si una sola persona se detiene tres veces o más, el formato se corrige antes de diagramar el resto.**

**No se evalúa:** si «se ve profesional» · con el equipo de Lubryco · por encuesta de satisfacción · contra el tiempo que costó producirlo.

---

## 11 · Criterios de calidad

Un manual está terminado cuando cumple los diez. **Uno que falle lo deja sin terminar.**

|        | Criterio                                                                          |
| ------ | --------------------------------------------------------------------------------- |
| `Q-01` | Lo sigue alguien sin capacitación previa                                          |
| `Q-02` | No requiere asistencia — cero preguntas al observador                             |
| `Q-03` | **Se puede seguir solo con las imágenes** — el criterio que más manuales reprueba |
| `Q-04` | Las imágenes son exactamente lo que la persona va a ver                           |
| `Q-05` | Cero ambigüedades — dos lectores describen lo mismo                               |
| `Q-06` | El supervisor decide sin material adicional y **no concluye robo**                |
| `Q-07` | Toda referencia resuelve — lo verifica una máquina                                |
| `Q-08` | Respeta los presupuestos de conceptos, texto, imágenes y callouts                 |
| `Q-09` | Los tiempos declarados salen del cronómetro, no de una estimación                 |
| `Q-10` | Funciona impreso, a pleno sol, con guantes, de pie                                |

**Tres estados y solo tres:** en producción · en validación · terminado. **No existe «casi terminado»**: un manual en validación que se distribuye porque hacía falta es un manual que nunca se va a validar.

**No son criterios de calidad:** que se vea profesional · que esté completo · que le guste al cliente · que haya costado mucho · que no tenga faltas de ortografía (eso es higiene).

---

## 12 · Roadmap

```
0. AGENDAR LA VISITA A PLANTA        ← primer día, aunque se ejecute en el paso 5
1. QG-OP-MD + QG-SUP-MD              ← una guía por perfil, no por plataforma
2. OP-AND-MD + SUP-MD
3. ►►► VALIDACIÓN CON USUARIOS REALES ◄◄◄
4. OP-IOS-MD + ADM + QG-ADM
5. VISITA A PLANTA                   ← fotografías y rodaje, una sola sesión
6. OP-AND-CI + OP-IOS-CI + SUP-CI + QG-OP-CI
7. VIDEOS
8. ACADEMIA
```

Justificación completa y las tres correcciones al orden inicialmente propuesto, en [`12-roadmap.md`](14_Sistema/12-roadmap.md).

---

## Las prohibiciones del sistema

Reunidas en un solo lugar. **Ninguna admite excepción sin decisión del propietario del producto.**

**Nunca:**

- Renders, mockups, wireframes, ilustraciones de dispositivos o dibujos de medidores.
- Retocar una captura a mano.
- Inventar un texto de interfaz. Lo que va entre comillas está copiado del código.
- Nombrar una pantalla en un título de capítulo.
- Introducir un elemento, callout, ícono o tipo de página que no esté en su catálogo.
- Usar nombres o datos de clientes reales.
- Reducir el cuerpo de texto para que quepa una página.
- Cuatro imágenes en una comparativa, o más de cuatro llamados en una captura.
- Dos callouts en un zoom.
- Distribuir un manual en validación.
- Cambiar un guion en la mesa de montaje.
- Producir íconos P1 y P2 antes de la primera validación.

**Siempre:**

- La imagen después de la acción, en paso a paso.
- Lo incorrecto antes de lo correcto.
- Los tres sellos juntos, nunca sueltos.
- Un ícono acompañado de una palabra, salvo en márgenes.
- Guías rápidas a una sola cara, laminadas.
- Regenerar las capturas antes de diagramar si el producto cambió.
- Declarar el hueco cuando una imagen no se puede producir.

---

## Regla final

**Claude Design diseña dentro de este sistema. Nunca lo redefine.**

Si al diagramar aparece una decisión que este documento no resuelve, **es un defecto de este documento**: se corrige aquí, con una nota de qué la motivó, para que el siguiente no la vuelva a encontrar.

Lo que no se hace nunca es resolverla dentro de una página. Así es como un sistema se convierte en 115 decisiones sueltas que nadie puede mantener.
