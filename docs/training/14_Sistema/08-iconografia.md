# 08 · Sistema de iconografía

**Este documento no elige íconos.** Define qué categorías existen, qué representa cada una y cómo se mantiene la consistencia.

El catálogo concreto —37 íconos con su identificador, uso y prioridad— vive en [`../13_Produccion/catalogo-iconos.md`](../13_Produccion/catalogo-iconos.md). El estilo lo resuelve Claude Design.

---

## Por qué se congela

Un material de 115 páginas diagramado sin catálogo termina con tres íconos distintos para «sincronizar», uno por cada página donde alguien lo necesitó. El lector no los reconoce como la misma cosa, y el material deja de tener lenguaje propio.

---

## Las siete categorías

Un ícono pertenece a una y solo una. **Si un ícono candidato encaja en dos, es que representa dos cosas y hay que partirlo o descartarlo.**

### `IC-A` · Estado y conectividad

- **Representa:** en qué situación está el dispositivo o el dato, no lo que la persona hace.
- **Regla propia:** los estados «sincronizado», «en cola» y «sin conexión» **son todos normales**. Ninguno se dibuja como alarma. El estado de alarma es uno solo y es distinto de los tres.
- **Riesgo si se rompe:** «en cola» se lee como error, el operador cree que perdió la carga y la registra otra vez.

### `IC-B` · Veredicto

- **Representa:** los tres sellos — Cuadra, Revisar, No cuadra.
- **Regla propia:** **se usan siempre los tres juntos, nunca uno solo.** El lector aprende el semáforo completo o no aprende ninguno.
- **Riesgo si se rompe:** un operador que solo ha visto «Cuadra» no sabe qué hacer el día que sale otro.

### `IC-C` · Acción de la persona

- **Representa:** algo que se hace con las manos: fotografiar, guardar, buscar, corregir.
- **Regla propia:** una acción, un ícono. No hay variantes «para que combine» con la página.
- **Riesgo si se rompe:** dos íconos para fotografiar y el lector busca la diferencia que no existe.

### `IC-D` · Persona

- **Representa:** los tres roles — operador, supervisor, administrador — y los terceros que aparecen (conductor del carrotanque).
- **Regla propia:** los roles se distinguen por su **trabajo**, no por jerarquía. Un ícono que sugiera que el supervisor está «por encima» del operador introduce una relación que el material no quiere enseñar.

### `IC-E` · Mundo físico

- **Representa:** lo que existe en la planta: surtidor, medidor, carrotanque, equipo, tanque, manguera, teléfono.
- **Regla propia:** **un ícono de esta categoría nunca reemplaza una fotografía.** Ilustra un índice o una tabla; en el momento de enseñar, va la foto real (`PR-05`).
- **Riesgo si se rompe:** el operador aprende a reconocer un pictograma y no su propio medidor.

### `IC-F` · Estructura de la plataforma

- **Representa:** la jerarquía Cliente → Sede → Equipo → Operador → Dispositivo, más perfil operativo y código de enrolamiento.
- **Regla propia:** **los cinco de la jerarquía deben leerse como una familia**, porque en la consola aparecen en cascada. Un ícono de sede que no se parezca al de cliente rompe la lectura del anidamiento.

### `IC-G` · Navegación del documento

- **Representa:** ayudas de lectura — hay video de esto, esta página se arranca, esto se descarga, esto tarda.
- **Regla propia:** son los únicos íconos que pueden aparecer sin palabra al lado, y solo en márgenes. Dentro del cuerpo, la regla general manda.

---

## Las cinco reglas de consistencia

1. **Un concepto, un ícono.** Si dos páginas necesitan «sincronizar», usan el mismo. Sin variantes por contexto.

2. **Un ícono nunca va solo.** Siempre acompaña a una palabra. El material se lee en una planta, a pleno sol, con guantes: **nadie descifra pictogramas** (`PR-10`). Única excepción: `IC-G` en márgenes.

3. **Los íconos de la aplicación no se rediseñan.** Si el producto ya dibuja algo, el material usa un recorte de la captura, no una versión propia. Un ícono «mejorado» enseña un símbolo que el operador no va a encontrar en su teléfono.

4. **Ningún ícono nuevo sin entrada en el catálogo.** Si al diagramar hace falta uno, se agrega al catálogo primero.

5. **Un ícono no sustituye una fotografía ni una captura.** Ilustra; no enseña. En el momento de enseñar va la imagen real.

---

## Prioridad

|        |                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------- |
| **P0** | Sin él no se puede diagramar la página. Concentrados en `IC-A`, `IC-B`, `IC-C`, `IC-D`, `IC-E`. |
| **P1** | Mejora una página que ya funciona.                                                              |
| **P2** | Decorativo o de una sola aparición. Puede no producirse nunca.                                  |

**Regla de arranque:** con los P0 se diagrama el 100 % de las páginas de prioridad P0 del material. Los P1 y P2 no bloquean nada, y no deben producirse antes de la primera validación con usuarios reales — hasta ahí no se sabe cuáles sobran.

---

## Qué hace fallar este sistema

Los tres modos de falla, en orden de probabilidad:

1. **Íconos que compiten con el texto.** Si el ícono es más visible que el paso, se mira el ícono y se salta la instrucción.
2. **Demasiados íconos por página.** Más de cuatro y dejan de ser señales; pasan a ser textura.
3. **Un ícono bonito para un concepto que no existía.** Es como se introducen conceptos que nadie pidió enseñar.
