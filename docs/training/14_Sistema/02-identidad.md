# Biblioteca de componentes gráficos

Un catálogo de **piezas repetibles**, no de decisiones visuales.

**Este documento no decide colores, tipografías ni medidas.** Dice qué componentes existen, para qué sirve cada uno, cuándo se usa y —tan importante— cuándo NO. El Design System oficial resuelve cómo se ven.

**Por qué esa separación:** si aquí se fijaran colores, el día que cambie el Design System habría que reescribir 115 páginas. Aquí se fija el _significado_; allá, la apariencia.

---

## Cómo se lee cada ficha

| Campo          | Qué dice                             |
| -------------- | ------------------------------------ |
| **Papel**      | Qué hace por el lector               |
| **Cuándo**     | La condición que lo dispara          |
| **Cuándo NO**  | El uso equivocado que hay que evitar |
| **Contenido**  | Qué cabe adentro                     |
| **Frecuencia** | Cuántas veces aparece en el kit      |

---

## Familia 1 · Avisos

### `CMP-01` · Nota

- **Papel:** información útil que no cambia lo que la persona hace.
- **Cuándo:** un dato que ayuda a entender, no a decidir.
- **Cuándo NO:** para nada que tenga consecuencia. Si tiene consecuencia, es advertencia o prohibición.
- **Contenido:** una o dos frases. Sin título.
- **Frecuencia:** ~40 apariciones.

### `CMP-02` · Consejo

- **Papel:** un atajo que solo conoce quien ya lleva tiempo.
- **Cuándo:** hay una forma más rápida y la persona no la va a descubrir sola.
- **Cuándo NO:** cuando el «consejo» es en realidad el procedimiento. Eso va en el paso.
- **Contenido:** una frase. Verbo en imperativo.
- **Frecuencia:** ~25.

### `CMP-03` · Advertencia

- **Papel:** algo puede salir mal y todavía se está a tiempo.
- **Cuándo:** una acción tiene una consecuencia recuperable.
- **Cuándo NO:** para prohibiciones. Una advertencia que dice «nunca» está mal clasificada.
- **Contenido:** título de una línea + una frase con la consecuencia.
- **Frecuencia:** ~30.

### `CMP-04` · Prohibición

- **Papel:** la consecuencia no se puede deshacer.
- **Cuándo:** perder datos, registrar dos veces, borrar el almacenamiento.
- **Cuándo NO:** por costumbre. **Si todo es prohibición, nada lo es** — el kit se permite unas 20 en total, y esa escasez es lo que las hace funcionar.
- **Contenido:** verbo en negativo, primera palabra «Nunca».
- **Frecuencia:** ~20. **Presupuesto cerrado.**

### `CMP-05` · Error

- **Papel:** describir un estado en el que la persona ya está.
- **Cuándo:** en las páginas de troubleshooting, encabezando cada caso.
- **Cuándo NO:** para prevenir. Prevenir es `CMP-03`.
- **Contenido:** la frase textual con que la persona reporta el problema, entre comillas.
- **Frecuencia:** ~20.

---

## Familia 2 · Estructura de un procedimiento

### `CMP-10` · Paso numerado

- **Papel:** una acción, una vez.
- **Contenido:** número + verbo en imperativo + máximo dos líneas.
- **Frecuencia:** ~180. **Es el componente más usado del kit.**

### `CMP-11` · Bloque de momento

- **Papel:** abrir un capítulo situando a la persona en el mundo real.
- **Cuándo:** al comienzo de cada capítulo de operador.
- **Contenido:** identificador del momento, frecuencia y duración.
- **Frecuencia:** 28 (cuatro manuales × siete capítulos).

### `CMP-12` · Bloque de decisión

- **Papel:** el equivalente del anterior para supervisores: «si ve esto…».
- **Frecuencia:** 14.

### `CMP-13` · Resultado esperado

- **Papel:** cerrar el capítulo diciendo cómo se ve el éxito.
- **Cuándo NO:** si no se puede describir en una frase observable, el capítulo está mal escrito.
- **Frecuencia:** 28.

### `CMP-14` · Timeline

- **Papel:** mostrar un proceso largo como una secuencia con sus tiempos.
- **Cuándo:** el proceso de incorporación de un cliente y el mapa de la jornada del operador.
- **Cuándo NO:** para procesos de menos de cinco pasos. Ahí basta con pasos numerados.
- **Frecuencia:** 9.

### `CMP-15` · Checklist

- **Papel:** verificar, no enseñar.
- **Cuándo:** al final de un capítulo y en las páginas arrancables.
- **Contenido:** casillas vacías, una línea cada una, sin explicaciones.
- **Frecuencia:** 7 páginas completas + bloques dentro de capítulos.

---

## Familia 3 · Imagen

### `CMP-20` · Captura con llamados

- **Papel:** la unidad visual básica del kit.
- **Contenido:** una captura + entre uno y cuatro llamados numerados.
- **Cuándo NO:** con más de cuatro llamados. Si hacen falta más, la página está intentando enseñar dos cosas.
- **Frecuencia:** ~60.

### `CMP-21` · Zoom

- **Papel:** ampliar la zona donde ocurre la acción.
- **Contenido:** recorte ampliado + un solo callout.
- **Cuándo NO:** para ampliar «porque se ve pequeño». Sin acción asociada, es ruido.
- **Frecuencia:** 51.

### `CMP-22` · Comparativa

- **Papel:** enfrentar incorrecto y correcto.
- **Contenido:** dos o tres imágenes + una frase.
- **Regla de orden:** **lo incorrecto va primero.**
- **Frecuencia:** 9.

### `CMP-23` · Fotografía a sangre

- **Papel:** abrir un manual o un capítulo con la planta real.
- **Cuándo NO:** en medio de un procedimiento. Interrumpe.
- **Frecuencia:** 11.

### `CMP-24` · Antes / Después

- **Papel:** mostrar el cambio de estado de una misma cosa.
- **Cuándo:** la carátula antes y después de una carga.
- **Frecuencia:** 6.

---

## Familia 4 · Datos

### `CMP-30` · Tabla de decisión

- **Papel:** «si pasa esto → haga esto».
- **Contenido:** dos o tres columnas. **Nunca más de tres.**
- **Frecuencia:** ~35.

### `CMP-31` · Bloque de tres cifras

- **Papel:** mostrar llegada + despacho + total, marcando cuál calcula el sistema.
- **Cuándo:** perfil Carga sobre Inventario, en todas sus audiencias.
- **Frecuencia:** 8. **Es el componente conceptualmente más importante de ese perfil.**

### `CMP-32` · Tarjeta de estado

- **Papel:** los tres sellos — Cuadra, Revisar, No cuadra.
- **Contenido:** el sello + qué significa + qué hacer.
- **Frecuencia:** 11.

### `CMP-33` · Tabla de tiempos

- **Papel:** cerrar cada manual con cuánto tarda cada cosa la primera vez y en rutina.
- **Frecuencia:** 7.

### `CMP-34` · Pregunta frecuente

- **Papel:** una duda real con su respuesta.
- **Contenido:** la pregunta como se dice, en negrita, y la respuesta debajo.
- **Frecuencia:** 41.

---

## Familia 5 · Página

### `CMP-40` · Portada

### `CMP-41` · Encabezado y pie corridos

### `CMP-42` · Apertura de capítulo

### `CMP-43` · Página arrancable

- **Papel:** checklists y guías rápidas, marcadas para arrancar y colgar.
- **Cuándo NO:** en medio de un capítulo — una página arrancable rompe la numeración si alguien la arranca de verdad, así que va al final.

---

## Presupuesto por página

Un límite deliberado, no una sugerencia:

| Tipo de página           | Máximo de componentes |
| ------------------------ | --------------------- |
| Capítulo de operador     | 8                     |
| Decisión de supervisor   | 7                     |
| Proceso de administrador | 10                    |
| Guía rápida              | 6                     |
| Checklist                | 3                     |

**Una página que necesita más componentes está intentando enseñar dos cosas.** La solución es partirla, no comprimirla.

---

## Resumen

| Familia    | Componentes        | Apariciones |
| ---------- | ------------------ | ----------- |
| Avisos     | 5                  | ~135        |
| Estructura | 6                  | ~270        |
| Imagen     | 5                  | ~130        |
| Datos      | 5                  | ~100        |
| Página     | 4                  | ~130        |
| **Total**  | **25 componentes** | **~765**    |

25 componentes cubren 115 páginas. **Si al diagramar aparece la necesidad de un componente nuevo, hay que agregarlo aquí primero** — no inventarlo en una página, que es como nacen los kits que nadie puede mantener.
