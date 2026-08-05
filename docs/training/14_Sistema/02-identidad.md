# 02 · Identidad de capacitación

Los doce elementos con los que se construye cualquier documento de CuadreApp.

**Este documento define significado, no apariencia.** No fija colores, tipografías ni medidas: eso pertenece a Claude Design y al Design System del producto. Fija qué es cada elemento, cuándo aparece y —tan importante— cuándo NO.

**Por qué esa separación:** si aquí se fijaran colores, el día que cambie el Design System habría que rehacer 115 páginas. El significado es lo que no puede cambiar sin reescribir el material.

---

## Prioridades

|        |                                                           |
| ------ | --------------------------------------------------------- |
| **P0** | Sin él no se puede diagramar ninguna página. 6 elementos. |
| **P1** | Necesario para un manual completo. 4 elementos.           |
| **P2** | Mejora una página que ya funciona. 2 elementos.           |

---

## `EL-01` · Paso

- **Objetivo:** una acción, ejecutada una vez, en un orden.
- **Cuándo:** siempre que la persona tenga que hacer algo con las manos.
- **Cuándo NO:** para describir lo que la aplicación hace sola. Eso no es un paso, es un resultado.
- **Contenido:** número + verbo en imperativo + máximo dos líneas.
- **Prioridad:** **P0** — es el elemento más usado del sistema (~180 apariciones).

## `EL-02` · Resultado esperado

- **Objetivo:** decir cómo se ve el éxito, para que la persona sepa que puede seguir.
- **Cuándo:** al cerrar todo capítulo de operador y todo proceso de administrador.
- **Cuándo NO:** si no se puede describir en una frase observable. Eso significa que el capítulo enseña dos cosas y hay que partirlo.
- **Contenido:** una frase, en presente, describiendo algo que se ve.
- **Prioridad:** **P0**

## `EL-03` · Advertencia

- **Objetivo:** avisar que algo puede salir mal, cuando todavía se está a tiempo.
- **Cuándo:** una acción tiene una consecuencia **recuperable**.
- **Cuándo NO:** para prohibiciones. Una advertencia que dice «nunca» está mal clasificada y hay que convertirla en `EL-04`.
- **Contenido:** título de una línea + una frase con la consecuencia concreta.
- **Prioridad:** **P0**

## `EL-04` · Prohibición

- **Objetivo:** marcar lo que no se puede deshacer.
- **Cuándo:** perder datos, registrar dos veces, borrar el almacenamiento, elegir un equipo distinto al real.
- **Cuándo NO:** por costumbre o por énfasis. **Presupuesto cerrado: unas 20 en todo el material.** Si todo es prohibición, nada lo es.
- **Contenido:** primera palabra «Nunca», verbo en negativo, una línea.
- **Prioridad:** **P0**

## `EL-05` · Error

- **Objetivo:** describir un estado en el que la persona **ya está**, con la frase que ella usaría.
- **Cuándo:** encabezando cada caso de las páginas de problemas.
- **Cuándo NO:** para prevenir algo que todavía no pasó. Eso es `EL-03`.
- **Contenido:** la frase textual con que se reporta el problema, entre comillas.
- **Prioridad:** **P0**

## `EL-06` · Comparativa

- **Objetivo:** enseñar un error en dos segundos enfrentando incorrecto y correcto.
- **Cuándo:** hay una forma de hacer algo que se ve casi igual a la correcta y no lo es.
- **Cuándo NO:** con más de tres imágenes. Cuatro dejan de compararse y pasan a ojearse.
- **Contenido:** 2 o 3 imágenes + un mensaje que dice qué hacer, no qué se ve. **Lo incorrecto va primero** (`PR-09`).
- **Prioridad:** **P0**

## `EL-07` · Zoom

- **Objetivo:** ampliar exactamente la zona donde ocurre la acción.
- **Cuándo:** hay algo que leer o que tocar y en la captura completa no se distingue.
- **Cuándo NO:** para ampliar «porque se ve pequeño». **Sin acción o lectura asociada, un zoom es ruido** y se rechaza.
- **Contenido:** recorte ampliado + un solo callout. Nunca dos.
- **Prioridad:** **P1**

## `EL-08` · Checklist

- **Objetivo:** verificar, no enseñar.
- **Cuándo:** al cerrar un capítulo y en las páginas arrancables.
- **Cuándo NO:** como resumen del contenido. Quien usa un checklist ya sabe hacer el trabajo; explicarle otra vez lo insulta y lo hace inútil.
- **Contenido:** casillas vacías, una línea cada una, **cero explicaciones**.
- **Prioridad:** **P1**

## `EL-09` · Proceso

- **Objetivo:** mostrar una secuencia larga con sus etapas y sus tiempos.
- **Cuándo:** más de cinco pasos, o pasos que ocurren en días distintos.
- **Cuándo NO:** para secuencias cortas. Ahí basta con pasos numerados, y un diagrama sobra.
- **Contenido:** etapas en orden, con duración y con quién interviene.
- **Prioridad:** **P1**

## `EL-10` · Nota

- **Objetivo:** dar contexto que ayuda a entender pero no cambia lo que se hace.
- **Cuándo:** un dato que responde un «¿por qué?» previsible.
- **Cuándo NO:** para nada que tenga consecuencia. **Si tiene consecuencia, es advertencia o prohibición**, y disfrazarla de nota es cómo se pierde un dato importante.
- **Contenido:** una o dos frases, sin título.
- **Prioridad:** **P1**

## `EL-11` · Recomendación

- **Objetivo:** un atajo que solo conoce quien ya lleva tiempo.
- **Cuándo:** existe una forma más rápida que la persona no va a descubrir sola.
- **Cuándo NO:** cuando la «recomendación» es en realidad el procedimiento. Eso es un paso, y ponerlo como opcional hace que se omita.
- **Contenido:** una frase, verbo en imperativo.
- **Prioridad:** P2

## `EL-12` · Dato importante

- **Objetivo:** fijar una cifra, un límite o una regla que hay que recordar.
- **Cuándo:** el dato se va a necesitar después, fuera del contexto donde aparece.
- **Cuándo NO:** más de uno por página. Dos datos «importantes» juntos no se recuerda ninguno.
- **Contenido:** el dato, y qué pasa si no se respeta.
- **Prioridad:** P2

---

## Elementos derivados

No son elementos propios: son composiciones fijas de los anteriores. **No se inventa una composición nueva sin agregarla aquí.**

| Composición               | Se arma con                   | Dónde                                         |
| ------------------------- | ----------------------------- | --------------------------------------------- |
| **Bloque de momento**     | Nota + dato de duración       | Apertura de capítulo de operador              |
| **Bloque de decisión**    | Error + nota + pasos          | Apertura de decisión de supervisor            |
| **Tarjeta de estado**     | Dato importante ×3            | Los tres sellos: Cuadra / Revisar / No cuadra |
| **Bloque de tres cifras** | Dato importante + prohibición | Perfil Carga sobre Inventario                 |
| **Tabla de decisión**     | Pasos en dos o tres columnas  | Todas las audiencias                          |
| **Captura con llamados**  | Zoom ×1–4 sobre una imagen    | Todas las audiencias                          |

**Los tres sellos van siempre juntos.** Nunca se documenta uno solo: el lector aprende el semáforo completo o no aprende ninguno.

---

## Presupuesto por página

Límites, no metas. Se cuentan elementos, no líneas:

| Tipo de página           | Máximo de elementos |
| ------------------------ | ------------------- |
| Capítulo de operador     | 8                   |
| Decisión de supervisor   | 7                   |
| Proceso de administrador | 10                  |
| Guía rápida              | 6                   |
| Checklist                | 3                   |

**Una página que necesita más está enseñando dos cosas** (`PR-02`). La solución es partirla.

---

## Regla de extensión

**Si al diagramar hace falta un elemento que no está aquí, se agrega a este documento primero.**

Inventarlo dentro de una página es como nacen los sistemas que nadie puede mantener: a los seis meses hay tres formas distintas de decir «cuidado» y el lector no reconoce ninguna como la misma cosa.

---

## Resumen

| Prioridad | Elementos                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| **P0**    | `EL-01` Paso · `EL-02` Resultado esperado · `EL-03` Advertencia · `EL-04` Prohibición · `EL-05` Error · `EL-06` Comparativa |
| **P1**    | `EL-07` Zoom · `EL-08` Checklist · `EL-09` Proceso · `EL-10` Nota                                                           |
| **P2**    | `EL-11` Recomendación · `EL-12` Dato importante                                                                             |

**Con los seis de P0 se puede diagramar una guía rápida completa y un capítulo de operador.** Los otros seis no bloquean nada.
