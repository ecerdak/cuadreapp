# 11 · Criterios de calidad

**Cuándo un manual está terminado.**

No «cuando se ve bien» ni «cuando ya no hay tiempo». Un manual está terminado cuando cumple los criterios de esta lista, y no antes.

---

## Los criterios de terminado

Se verifican en este orden. **Uno solo que falle deja el manual sin terminar**, por avanzado que esté todo lo demás.

### `Q-01` · Lo sigue alguien sin capacitación previa

Tres personas que nunca han usado el producto completan la tarea con el material en la mano.

**Cómo se comprueba:** prueba de campo ([`10-evaluacion.md`](10-evaluacion.md)).

### `Q-02` · No requiere asistencia

Nadie tuvo que explicar una página. Cero preguntas dirigidas al observador.

**Cómo se comprueba:** el registro de preguntas de la prueba. Toda pregunta hecha es una página que faltó.

### `Q-03` · Se puede seguir solo con las imágenes

Una persona que no lee bien —o que lee en su segunda lengua— completa la tarea siguiendo únicamente imágenes y números de paso.

**Cómo se comprueba:** se tapa el cuerpo de texto y se repite la tarea. **Este criterio es el que más manuales reprueba**, y es el que más importa en una planta.

### `Q-04` · Las imágenes son exactamente lo que la persona va a ver

Ninguna aproximación, ninguna versión anterior, ningún render.

**Cómo se comprueba:** el arnés regenerado el mismo día, y las fotografías tomadas en la planta del cliente.

### `Q-05` · Cero ambigüedades

Ninguna frase admite dos lecturas (`PR-06`). Cero condicionales vagos: «si aplica», «según el caso», «normalmente».

**Cómo se comprueba:** dos personas leen la misma instrucción por separado y describen qué harían. Si describen cosas distintas, la frase se reescribe.

### `Q-06` · El supervisor decide sin material adicional

Un supervisor resuelve los tres casos —descuadre, foto faltante, salto de totalizador— sin consultar nada más, y **ninguno concluye robo en el tercero**.

**Cómo se comprueba:** los tres casos de la prueba de campo. Este criterio es el único cuyo fallo tiene consecuencias sobre una persona: un supervisor mal capacitado acusa a alguien con la evidencia equivocada.

### `Q-07` · Toda referencia resuelve

Cada callout, fotografía, zoom, captura, pregunta, ficha de problema, ícono y comparativa que el manual menciona existe en su inventario.

**Cómo se comprueba:** `node scripts/verificar-training-kit.mjs`. Es el único criterio que verifica una máquina, y por eso es el que nunca se salta.

### `Q-08` · Respeta los presupuestos

Ninguna página supera su máximo de conceptos, de texto, de imágenes, de callouts ni de elementos.

**Cómo se comprueba:** revisión contra [`04-paginas.md`](04-paginas.md) y [`02-identidad.md`](02-identidad.md). Una página desbordada se parte, nunca se comprime (`PR-02`).

### `Q-09` · Los tiempos declarados son reales

La tabla de cierre dice cuánto tarda cada cosa la primera vez y en rutina, y esos números salen de la prueba de campo, no de una estimación.

**Cómo se comprueba:** se comparan con los cronómetros de la prueba. **Un tiempo optimista destruye la confianza en todo el resto del manual** en la primera carga.

### `Q-10` · Funciona en las condiciones reales

Impreso, a pleno sol, con guantes, de pie, con ruido (`PR-10`).

**Cómo se comprueba:** la prueba se hace en la planta, no en una sala de reuniones.

---

## Criterios adicionales por tipo

### Guía rápida

- ☐ Una sola cara de una hoja carta
- ☐ Laminada
- ☐ Se completa la tarea **sin abrir el manual**
- ☐ Los pasos ocupan la mitad superior

### Video

- ☐ Después de verlo una vez, la tarea se ejecuta sin volver a verlo
- ☐ Cada escena funciona como imagen fija
- ☐ Se entiende sin audio
- ☐ No supera el máximo de duración de su audiencia

### Checklist

- ☐ Cero conceptos nuevos
- ☐ Cero imágenes
- ☐ Se usa de pie, con una mano

---

## Lo que NO es un criterio de calidad

Explícito, para que no se cuele en una revisión:

- **Que se vea profesional.** No predice si alguien aprende.
- **Que esté completo.** Un manual que cubre todo y no se sigue vale menos que uno parcial que sí.
- **Que le guste al cliente.** El cliente no es quien lo va a usar en la planta.
- **Que se haya tardado mucho.** Es la falacia que hace que un material caro y malo se publique igual.
- **Que no tenga errores de ortografía.** Es necesario, pero es higiene, no calidad.

---

## Estado de un manual

Tres estados, y solo tres:

| Estado            | Significa                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| **En producción** | Se está diagramando. No se entrega a nadie.                                                     |
| **En validación** | Diagramado, pendiente de prueba de campo. **Se entrega solo a los participantes de la prueba.** |
| **Terminado**     | Los diez criterios cumplidos. Se distribuye.                                                    |

**No existe «casi terminado».** Un manual en validación que se distribuye porque hacía falta es un manual que nunca se va a validar: una vez repartido, nadie lo recoge para corregirlo.

---

## Checklist de cierre

Antes de declarar terminado cualquier manual:

☐ `Q-01` Tres personas sin capacitación lo siguieron
☐ `Q-02` Cero preguntas al observador
☐ `Q-03` Se sigue con el texto tapado
☐ `Q-04` Imágenes regeneradas el mismo día
☐ `Q-05` Dos lectores describen lo mismo
☐ `Q-06` El supervisor no concluye robo
☐ `Q-07` El verificador pasa en verde
☐ `Q-08` Ningún presupuesto excedido
☐ `Q-09` Los tiempos salen del cronómetro
☐ `Q-10` Probado en la planta, impreso
