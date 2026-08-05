# 05 · Sistema de callouts

**Este documento no escribe callouts. Define cuándo existe cada tipo.**

Los 66 callouts concretos viven en [`../00_Fuente/biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md) y se referencian por identificador. Aquí se fija la taxonomía: cuáles hay, qué dispara cada uno y qué pasa si se clasifica mal.

---

## Por qué existe una taxonomía cerrada

Sin ella, a los seis meses hay tres formas distintas de decir «cuidado» y el lector no reconoce ninguna como la misma cosa. Peor: la clasificación errónea tiene consecuencia real —una prohibición disfrazada de nota se salta, y algo irreversible ocurre.

**Seis categorías. No hay una séptima.**

---

## `CO-01` · Consejo

- **Existe cuando:** hay una forma más rápida o más cómoda de hacer algo, y la persona no la va a descubrir sola.
- **No existe cuando:** el «consejo» es en realidad el procedimiento. Marcarlo como opcional garantiza que se omita.
- **Si se clasifica mal:** un paso obligatorio se lee como sugerencia y se salta.
- **Tono:** verbo en imperativo, una frase.

## `CO-02` · Advertencia

- **Existe cuando:** una acción tiene una consecuencia **recuperable**, y todavía se está a tiempo de evitarla.
- **No existe cuando:** la consecuencia es irreversible. Eso es `CO-03`.
- **Si se clasifica mal:** o se subestima algo grave, o se inflan las advertencias hasta que dejan de leerse.
- **Tono:** qué puede pasar, no qué está prohibido.

## `CO-03` · Error _(prohibición)_

- **Existe cuando:** la consecuencia **no se puede deshacer**: perder datos, registrar dos veces, borrar el almacenamiento, cargarle combustible al equipo equivocado.
- **No existe cuando:** solo se quiere dar énfasis. **Presupuesto cerrado: unas 20 en todo el material** (`PR-11`).
- **Si se clasifica mal:** si sobran, dejan de verse; si faltan, algo irreversible ocurre sin aviso.
- **Tono:** primera palabra «Nunca».

## `CO-04` · Dato importante

- **Existe cuando:** una cifra, un límite o una regla se va a necesitar **fuera del contexto donde aparece**.
- **No existe cuando:** el dato solo sirve en esa página. Ahí es una nota.
- **Regla de escasez:** **uno por página como máximo.** Dos datos «importantes» juntos y no se recuerda ninguno.
- **Tono:** el dato y qué pasa si no se respeta.

## `CO-05` · Validación

- **Existe cuando:** hay que comprobar algo antes de continuar, y seguir sin comprobarlo produce un trabajo mal hecho que se descubre tarde.
- **No existe cuando:** la comprobación la hace el sistema. Eso es un resultado esperado, no una validación de la persona.
- **Si se clasifica mal:** se pierde el único punto donde el error todavía era barato de corregir.
- **Tono:** pregunta cerrada o casilla. «¿El código de la pantalla es el mismo del sticker?»

## `CO-06` · Acción requerida

- **Existe cuando:** la persona tiene que hacer algo **fuera de la aplicación**: llamar a alguien, avisar, pedir un código, coordinar una revisión.
- **No existe cuando:** la acción está dentro del flujo. Eso es un paso.
- **Si se clasifica mal:** la acción externa se lee como parte del flujo y no se ejecuta — es cómo un descuadre se queda sin reportar.
- **Tono:** verbo + destinatario + plazo. «Avísele al supervisor hoy.»

---

## Cómo se decide entre categorías

```
¿La consecuencia es irreversible?            → sí → CO-03 Error
                                              │
                                              no
                                              ↓
¿Hay una consecuencia si se ignora?          → sí → CO-02 Advertencia
                                              │
                                              no
                                              ↓
¿Hay que comprobar algo antes de seguir?     → sí → CO-05 Validación
                                              │
                                              no
                                              ↓
¿La acción ocurre fuera de la aplicación?    → sí → CO-06 Acción requerida
                                              │
                                              no
                                              ↓
¿El dato se necesita en otra página?         → sí → CO-04 Dato importante
                                              │
                                              no
                                              ↓
                                                    CO-01 Consejo
```

**El árbol se recorre de arriba abajo, siempre.** Empezar por abajo es cómo una prohibición termina siendo un consejo.

---

## Reglas de escritura

Valen para los 66 callouts existentes y para cualquiera futuro:

1. **Verbo en imperativo primero.** «Ponga la tanda en cero», no «la tanda debe estar en cero».
2. **Cero nombres de interfaz.** Quien lee el callout está mirando la pantalla.
3. **Una sola idea.** Si necesita un «y además», son dos callouts.
4. **Máximo 15 palabras.**
5. **La consecuencia, no la regla.** «Si no, no se sabe cuánto fue de esta máquina» enseña; «es obligatorio» no.

---

## Presupuesto por página

| Tipo de página                          | Callouts máximo | De ellos, `CO-03` |
| --------------------------------------- | --------------- | ----------------- |
| Paso a paso                             | 4               | 2                 |
| Decisión                                | 4               | 2                 |
| Proceso administrativo                  | 5               | 2                 |
| Comparativa                             | 1               | 0                 |
| Zoom                                    | 1               | 0                 |
| Guía rápida                             | 5               | 3                 |
| Checklist · Troubleshooting · Preguntas | 0               | 0                 |

**Un zoom lleva un callout. Nunca dos** — si hacen falta dos, son dos zooms o el zoom está mal recortado.

---

## Regla de extensión

Un callout nuevo se agrega a [`../00_Fuente/biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md) con su categoría, **antes** de usarse en una página. El verificador falla si una página referencia un callout que no está en la biblioteca.

**Una categoría nueva exige modificar este documento y justificar por qué el árbol de decisión no la cubría.** En la práctica, casi siempre resulta que sí la cubría.
