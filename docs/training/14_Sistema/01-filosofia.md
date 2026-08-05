# 01 · Filosofía

**Congelada.** Estos principios no se discuten al diagramar. Si uno de ellos hace imposible una página, se cambia la página, no el principio.

Cambiar un principio exige una decisión explícita del propietario del producto, igual que un cambio de arquitectura.

---

## Los doce principios

### `PR-01` · Se enseña el trabajo, nunca la interfaz

Nadie piensa «estoy en la pantalla del PIN»; piensa «llegó un tractor». Un documento organizado como el producto obliga a traducir del mundo de la persona al nuestro, y esa traducción es donde se pierde quien está aprendiendo.

**Consecuencia práctica:** ningún título de capítulo contiene la palabra «pantalla», «campo», «botón» o «menú». Si no se puede titular sin ellas, el capítulo está mal planteado.

### `PR-02` · Una idea por página

Una página enseña una cosa. Dos ideas en una página producen que se aprenda media de cada una.

**Consecuencia práctica:** cuando una página se desborda, se parte. **Nunca se comprime.** Reducir el cuerpo de texto para que quepa es exactamente lo que hace ilegible un manual que se lee a pleno sol y con guantes.

### `PR-03` · Se aprende haciendo, no leyendo

El material acompaña una acción real; no la sustituye. Un manual que se lee entero antes de tocar nada no se lee nunca.

**Consecuencia práctica:** todo curso de operador termina en una carga real acompañada. La lectura sin práctica no cuenta como capacitación.

### `PR-04` · Mostrar antes de explicar

La imagen carga el significado; el texto lo confirma. Cuando compiten, gana la imagen — así que la imagen tiene que ser correcta antes que bonita.

**Excepción deliberada, y es la única:** en una página de paso a paso, la imagen va **después** de los pasos. Quien está ejecutando lee la acción y confirma con la imagen. Al revés, mira la imagen y adivina la acción.

### `PR-05` · Solo imágenes reales

Sin renders, sin mockups, sin wireframes, sin ilustraciones de dispositivos, sin dibujos de medidores. **Un operador reconoce su planta o no reconoce nada.**

Una ilustración de un medidor genérico enseña a leer un medidor que no existe. El día que el operador esté frente al suyo, no lo va a reconocer.

### `PR-06` · El operador nunca interpreta

Toda instrucción tiene una sola lectura posible. Si una frase admite dos, está mal escrita.

**Consecuencia práctica:** cero condicionales ambiguos («si aplica», «según el caso», «normalmente»). Si hay dos caminos, se escriben los dos.

### `PR-07` · El supervisor decide, no navega

Un supervisor llega con una pregunta, no con ganas de recorrer pestañas. Su material se organiza por decisión: qué ve → qué significa → qué revisa → qué decide → a quién llama → qué no hace.

**Consecuencia práctica:** «qué no hacer» nunca se omite en una decisión de supervisor. En ese rol, el daño casi siempre viene de actuar de más, no de menos.

### `PR-08` · El administrador ejecuta procesos completos

Un administrador no crea entidades sueltas: ejecuta procesos que empiezan con una llamada comercial y terminan con un operador cargando combustible.

**Consecuencia práctica:** un proceso administrativo nunca se parte a la mitad de una página. Es el único tipo de página al que se le permiten dos hojas seguidas.

### `PR-09` · Lo incorrecto va primero

En toda comparativa, el error precede a la solución. En ese orden el lector reconoce su propio error antes de ver la corrección, y la corrección se le queda. Al revés, ve la solución, asiente y no aprende nada.

### `PR-10` · Se lee en una planta, no en un escritorio

A pleno sol, con guantes, con ruido, de pie, con prisa. Todo el sistema se juzga contra esa condición.

**Consecuencia práctica:** cuerpos de texto grandes, pasos cortos, contraste alto, páginas que se sostienen con una mano. Un documento que solo funciona en pantalla ya falló.

### `PR-11` · Una escasez deliberada

Si todo es urgente, nada lo es. El sistema se pone límites a propósito: unas 20 prohibiciones en todo el kit, máximo cuatro llamados por imagen, máximo tres columnas por tabla, dos colores por identidad de cliente.

**Los límites no son una sugerencia de estilo: son lo que hace que las excepciones se noten.**

### `PR-12` · Un texto, un lugar

Ningún texto se escribe dos veces. Todo lo que aparece en más de un documento vive en la fuente de verdad y se referencia por identificador.

**Consecuencia práctica:** al diagramar no se transcribe: se toma el texto de `00_Fuente/`. Un texto copiado a mano es un texto que quedará desactualizado.

---

## Cómo se aplican cuando entran en conflicto

Ocurre, y el orden de precedencia está fijado:

```
P-06 (no interpretar)   ─┐
P-05 (imágenes reales)   ├─► por encima de todo: si se rompen, el material miente
P-01 (enseñar el trabajo)─┘

P-02 (una idea)          ─┐
P-10 (se lee en planta)   ├─► por encima de la economía de páginas
P-11 (escasez)           ─┘

P-04 (mostrar antes)     ─┐
P-09 (incorrecto primero) ├─► por encima de la preferencia visual
P-03 (aprender haciendo) ─┘
```

**Regla de desempate:** ante duda entre dos principios, gana el que proteja a quien está aprendiendo, no el que produzca una página más elegante.

---

## La prueba de los principios

Un documento cumple la filosofía si supera estas tres preguntas:

1. **¿Un operador sin capacitación lo sigue solo?** Si necesita que alguien le explique una página, esa página falló.
2. **¿Cada frase tiene una sola lectura?** Si dos personas la interpretan distinto, está mal escrita.
3. **¿Las imágenes son lo que la persona va a ver?** Si son aproximaciones, el material enseña algo que no existe.

Las tres se verifican con personas reales, no con opinión. El método está en [`10-evaluacion.md`](10-evaluacion.md).
