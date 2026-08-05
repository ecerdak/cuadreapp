# Controlar el combustible de su planta

## Curso para supervisores · operación con medidor Fill-Rite

> `SUP-MD` · Momentos: [`catalogo-momentos.md`](../00_Fuente/catalogo-momentos.md) · Callouts: [`biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md) · Zooms: [`inventario-zooms.md`](../00_Fuente/inventario-zooms.md)
> Layout: [`../05_Layouts/SUP-MD.md`](../05_Layouts/SUP-MD.md) · Quick Guide: [`../10_QuickGuides/QG-SUP.md`](../10_QuickGuides/QG-SUP.md) · Video: [`../08_Storyboards/SUP-MD.md`](../08_Storyboards/SUP-MD.md)

---

## Para quién es esto

Para quien responde por el combustible de la planta.

**Al terminar este curso usted podrá:** saber en cinco minutos si el combustible del día cuadró, decidir qué hacer con lo que no, y —tan importante como lo anterior— **saber cuándo NO hay motivo para alarmarse**.

**Tiempo:** 25 minutos.

---

## Esto no es una aplicación: es una herramienta de gestión

Este curso no le enseña pestañas. Le enseña **decisiones**. Cada capítulo arranca con una situación real que usted va a vivir y termina con qué hacer.

```
¿HAY ALGO QUE ATENDER HOY?        →  Decisión 1
UNA CARGA NO CUADRA               →  Decisión 2
FALTA UNA FOTOGRAFÍA              →  Decisión 3
UN EQUIPO CONSUME DE MÁS          →  Decisión 4
¿CUÁNDO PIDO MÁS COMBUSTIBLE?     →  Decisión 5
ME PREGUNTAN SI HUBO ROBO         →  Decisión 6
CONTABILIDAD PIDE LOS DATOS       →  Decisión 7
```

---

# Decisión 1 · ¿Hay algo que deba atender hoy?

> Momento `S-01` · Cada mañana · 1 minuto

### Si ve esto

Una frase arriba de todo, en verde, ámbar o rojo.
· Captura `dsh-01_hoy.png` · Zoom `Z-60`

### Qué significa

| Color     | Significa                                         |
| --------- | ------------------------------------------------- |
| **Verde** | Las cargas de hoy cuadran. No hay nada pendiente. |
| **Ámbar** | Hay algo anotado que conviene mirar.              |
| **Rojo**  | Al menos una carga no cuadró.                     |

### Qué debe revisar

Si está en verde: **nada más**. Cerró el día en un minuto, y eso es exactamente lo que debe pasar la mayoría de los días.
Si no: la lista de cargas de hoy, más abajo en la misma pantalla.
· Zooms `Z-61`, `Z-62`

### Qué decisión tomar

Verde → siga con su día. Ámbar o rojo → abra las cargas marcadas (Decisión 2).

### A quién llamar

A nadie todavía.

### Qué NO hacer

- **No** revise todas las cargas una por una si el veredicto está en verde. La herramienta ya las revisó.
- **No** deje pasar un rojo «para mañana»: los operadores olvidan los detalles de una carga en horas.

---

# Decisión 2 · Una carga no cuadra

> Momento `S-02` · Cuando aparece · 3 minutos por carga

### Si ve esto

Una carga con sello **«No cuadra»** o **«Revisar»**.
· Capturas `dsh-02_cargas.png`, `dsh-03_evidencia-medidor.png` · Zooms `Z-63`, `Z-64`, `Z-65`

### Qué significa

La aritmética no cerró. **No significa que falte combustible.** Las tres causas, en el orden en que ocurren de verdad:

1. Un dígito mal copiado por el operador.
2. Alguien cargó sin registrar en la aplicación.
3. Todo lo demás.

### Qué debe revisar

1. **Las dos fotografías.** Están tomadas en el momento, con hora y lugar. Compare lo que se ve en la carátula con lo que el operador escribió.
2. **Las tres verificaciones automáticas:**

| Verificación                | Qué comprueba                                              | Si falla                                                |
| --------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| Tanda en 0,0                | Que el conteo arrancó limpio                               | El operador no reseteó; hay una nota explicando por qué |
| Continuidad del totalizador | Que arrancó donde quedó la carga anterior                  | Hubo una carga sin registrar entre las dos              |
| La tanda cuadra             | Que lo despachado coincide con lo que subió el totalizador | Un número mal copiado, o el registro no corresponde     |

### Qué decisión tomar

| Lo que encuentra                                    | Decisión                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| Las fotos muestran números distintos a los escritos | Error de digitación. Pídale al operador que confirme y registre la corrección. |
| Las fotos coinciden pero el totalizador saltó       | Hubo una carga sin registrar. Vaya a la Decisión 6.                            |
| Falta una foto                                      | Vaya a la Decisión 3.                                                          |
| Las fotos no se leen                                | Problema físico del medidor. Vaya a la Decisión 6, último bloque.              |

### A quién llamar

Al operador que registró la carga, **el mismo día**. Su nombre está en la evidencia.

### Qué NO hacer

- **No** asuma robo. Es la conclusión menos probable y la más costosa si se equivoca.
- **No** intente editar la carga: no se puede, y es a propósito. Una corrección es un registro nuevo con su motivo, y el original queda visible.
- **No** acumule cargas marcadas para revisarlas al cierre de mes.

---

# Decisión 3 · Falta una fotografía

> Momento `S-03` · Cuando aparece · **el mismo día**

### Si ve esto

En la evidencia, un recuadro ámbar donde debería estar una foto.
· Captura `dsh-03_evidencia-medidor.png` · Zoom `Z-64`

### Qué significa

El operador cerró el registro sin capturar el medidor. La aplicación lo permite —marcándolo— porque bloquearlo mandaría al operador de vuelta al papel.

### Qué debe revisar

Cuántas cargas de ese operador tienen el mismo problema. Si es una, fue un descuido. Si son varias, es que algo se lo impide: el vidrio refleja, el medidor está muy alto, o el teléfono no enfoca.

### Qué decisión tomar

Hable con el operador **hoy**, mientras recuerda esa carga. Si el problema se repite, es un problema físico y hay que resolverlo, no insistirle a la persona.

### A quién llamar

Al operador. Si se repite en varios, al administrador de Lubryco.

### Qué NO hacer

- **No** lo deje para el cierre de mes: la foto no se puede recuperar después.
- **No** sancione por una foto faltante sin antes verificar que la carátula se puede fotografiar de verdad.

---

# Decisión 4 · Un equipo está consumiendo de más

> Momento `S-04` · Revisión semanal · 5 minutos

### Si ve esto

Una fila resaltada con un desvío alto.
· Captura `dsh-05_equipos.png` · Zoom `Z-68`

### Qué significa

Ese equipo se está saliendo de **su propio patrón histórico**. No se compara contra otros equipos: se compara contra sí mismo.

### Qué debe revisar

Las causas, en el orden en que realmente ocurren:

1. **Inyectores o filtros** — la causa más común de un consumo que sube de golpe.
2. **Motor encendido durante las esperas** — hábito de operación, no mecánica.
3. **Cambio de labor** — un tractor que pasó a un trabajo más pesado consume más, y es normal.
4. Y solo después de descartar las tres anteriores, cualquier otra cosa.

### Qué decisión tomar

Programe una revisión mecánica antes que una conversación incómoda. En la práctica, la mayoría de los desvíos se resuelven en el taller.

### A quién llamar

Al responsable de mantenimiento.

### Qué NO hacer

- **No** acuse a un operador con el desvío como única prueba. Un desvío es una señal, no una evidencia.
- **No** compare equipos entre sí: una alzadora y una camioneta no son comparables.

---

# Decisión 5 · ¿Cuándo pido más combustible?

> Momento `S-05` · Revisión semanal · 2 minutos

### Si ve esto

Los días de autonomía restante.
· Captura `dsh-06_suministro.png` · Zooms `Z-69`, `Z-70`

### Qué significa

Cuántos días de operación quedan al ritmo de consumo de los últimos días.

### Qué debe revisar

El balance: entregado por Lubryco menos despachado a equipos.

### Qué decisión tomar

| Autonomía        | Decisión                          |
| ---------------- | --------------------------------- |
| Más de 7 días    | Nada                              |
| Entre 4 y 7 días | Avise a Lubryco para que programe |
| Menos de 4 días  | Llame a Lubryco hoy               |

### A quién llamar

A su contacto comercial en Lubryco.

### Qué NO hacer

- **No** trate esta cifra como una medición del tanque. **Es una estimación por balance**, con un margen esperado de ±2 %. No hay aforo del tanque todavía.
- **No** espere a quedar en cero: el despacho tarda.

---

# Decisión 6 · Me preguntan si hubo robo

> Momento `S-06` · Cuando ocurre · **el capítulo más importante de este curso**

### Si ve esto

Un mensaje que dice que el medidor arrancó más arriba de lo esperado.
· Captura `dsh-03_evidencia-medidor.png` · Zoom `Z-66`

### Qué significa

**El medidor ya contó esos galones.** El balance del tanque sigue siendo correcto: el combustible salió y quedó registrado en el totalizador. Lo que falta es saber **a qué equipo fue**.

Un salto de totalizador es, casi siempre, una carga que alguien hizo sin abrir la aplicación.

### Qué debe revisar

1. ¿Quién estuvo en la planta ese día y en ese horario?
2. ¿Hubo alguna carga de emergencia, un equipo de un contratista, una prueba del surtidor?
3. ¿El tamaño del salto se parece a una carga normal? Si son 40 galones, es una carga. Si son 400, es otra cosa.

### Qué decisión tomar

**Pregunte primero quién cargó sin la aplicación ese día.** Nueve de cada diez veces esa es la respuesta completa, y la conversación es de proceso, no de disciplina.

### A quién llamar

Primero al operador del turno. Después, si no hay explicación, a su jefatura — con la evidencia impresa, no con una sospecha.

### Qué NO hacer

- **No** presente un salto de totalizador como prueba de robo. No lo es.
- **No** acuse antes de haber mirado las dos fotografías de las cargas de ese día.
- **No** use la palabra «robo» con su equipo hasta tener algo más que un número.

### Antes de escalar, tres preguntas

☐ ¿Miré las dos fotos de la carga?
☐ ¿Pregunté quién cargó sin la aplicación ese día?
☐ ¿Tengo algo más que el desvío o el salto como evidencia?

**Si alguna quedó sin marcar, todavía no hay caso.**

---

# Decisión 7 · Contabilidad me pide los datos

> Momento `S-07` · Mensual · 2 minutos

### Si ve esto

El botón de descarga en la pantalla de cargas.
· Captura `dsh-02_cargas.png`

### Qué significa

Un archivo de Excel con cinco hojas: cargas, consumo por día, consumo por equipo, entregas y balance.

### Qué debe revisar

Que el período sea el correcto: hay una descarga del día y otra de los últimos 14 días.

### Qué decisión tomar

Descargue y envíe. Los galones van como número, no como texto: se pueden sumar sin limpiar la hoja.

### Qué NO hacer

- **No** transcriba cifras a mano a otro archivo. Es donde se introducen los errores.

---

# Su rutina

Versión imprimible en [`../06_Checklists/SUP-MD.md`](../06_Checklists/SUP-MD.md).

**Cada mañana · 5 minutos**
☐ Leí la frase de arriba ☐ Si hay marcadas, abrí sus fotos ☐ Revisé las tres verificaciones ☐ Si falta una foto, hablé con el operador hoy

**Cada semana**
☐ Revisé desvíos por equipo ☐ Revisé la autonomía ☐ Descargué el archivo si toca

---

# Preguntas frecuentes

De [`biblioteca-faq.md`](../00_Fuente/biblioteca-faq.md): `P-40` a `P-47`.
`P-41` («¿"No cuadra" significa que alguien robó?») va **primera y destacada**: determina si usted usará bien esta herramienta.

---

# Cuánto tarda cada cosa

| Decisión                  | La primera vez | En rutina       |
| ------------------------- | -------------- | --------------- |
| ¿Hay algo que atender?    | 3 min          | 1 min           |
| Una carga no cuadra       | 5 min          | 3 min           |
| Falta una fotografía      | 2 min          | 1 min           |
| Un equipo consume de más  | 4 min          | 2 min (semanal) |
| ¿Cuándo pido combustible? | 3 min          | 1 min (semanal) |
| **Rutina diaria**         | —              | **≈ 5 min**     |
