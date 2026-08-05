# 07 · Sistema de capturas

**Las capturas no se toman: se generan.**

Es la diferencia estructural entre este material y un manual normal. Una captura tomada a mano se hace una vez y queda desactualizada al primer cambio de botón; una captura generada se rehace con un comando cada vez que el producto cambia.

El arnés es `scripts/capturar-pantallas.mjs`. El inventario, [`../12_Capturas/CATALOGO.md`](../12_Capturas/CATALOGO.md), se genera del mismo manifiesto — no puede desviarse de lo que realmente se capturó.

---

## Las seis reglas

1. **Nunca se edita una captura a mano.** El retoque se pierde en la siguiente corrida, y peor: produce una imagen que no corresponde a ninguna versión del producto. Si algo se ve mal, se arregla el producto o se arregla el manifiesto.

2. **Siempre se regenera desde el producto.** Ante cualquier duda sobre si una captura está al día, se vuelve a correr el arnés. Es más barato que comprobarlo mirando.

3. **Resolución consistente.** Escritorio ×2, teléfono ×3. Una captura al 300 % tiene que seguir siendo nítida en papel: el zoom es el recurso más usado del material y sale de aquí.

4. **No se corta nada importante.** Se captura la página completa y **el diseñador recorta**, nunca al revés. Un recorte hecho en la captura no se puede deshacer sin volver a generar.

5. **No se ocultan estados.** Si la pantalla muestra un aviso, una advertencia o un estado incómodo, se captura con él. **Una captura «limpia» enseña una aplicación que el operador no va a encontrar.** Cuando el estado sobra para esa página, se declara en las notas del catálogo y el diseñador decide si recorta.

6. **Cero información irrelevante y cero información real.** Los datos son de demostración, neutros, y nunca de un cliente real. Una captura de un manual es un documento que circula.

---

## Condiciones de captura

Fijas, porque una captura con condiciones distintas no se puede poner al lado de las demás:

|                     |                                                                       |
| ------------------- | --------------------------------------------------------------------- |
| **Tema**            | Oscuro, el mismo que ve el usuario                                    |
| **Idioma y región** | es-CO, zona horaria `America/Bogota`                                  |
| **Animaciones**     | Desactivadas — ninguna captura a medio camino de una transición       |
| **Fuentes**         | Se espera a que carguen: capturar antes produce la métrica equivocada |
| **Alcance**         | Página completa                                                       |
| **Datos**           | De demostración, con nombres neutros                                  |

---

## Qué se puede generar y qué no

El arnés no falsea nada que importe. Hay dos fronteras, y las dos son deliberadas:

**Se genera:** cualquier pantalla a la que se llegue con la red interceptada. La aplicación es la real; lo único simulado es la respuesta HTTP.

**No se genera — se toma en planta:** las pantallas de cámara. Una cámara simulada mostraría un patrón de prueba, y **una imagen de prueba dentro del manual que enseña a fotografiar un medidor es peor que un hueco declarado**.

**No se genera — requiere entorno sembrado:** las pantallas que dependen de estado acumulado en un teléfono real.

**El catálogo declara el motivo de cada captura pendiente, una por una.** Un pendiente sin motivo escrito se trata como un olvido.

---

## Regla de sincronía

**Si el producto cambia, se corre el arnés antes de tocar una página.** No al revés.

Diagramar sobre una captura vieja produce un manual que enseña una pantalla que ya no existe — y como la captura se ve bien, nadie lo nota hasta que un operador la busca en su teléfono.

El verificador comprueba que ninguna captura prometida como producida falte en disco, y que cada pantalla del catálogo siga apuntando a un archivo de código que existe.

---

## Qué hace fallar este sistema

1. **Alguien retoca una captura** «solo esta vez» y a partir de ahí nadie confía en la regeneración.
2. **Se diagrama con capturas de hace tres meses** porque regenerar «va a mover cosas».
3. **Se limpia un estado incómodo** y el manual deja de parecerse a la aplicación.
