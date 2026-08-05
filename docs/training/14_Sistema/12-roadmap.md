# 12 · Roadmap de producción

**El orden importa tanto como el contenido.** Producir en el orden equivocado no se nota hasta que hay 115 páginas hechas sobre un formato que nadie probó.

---

## El orden propuesto y sus tres problemas

El orden que llegó a esta etapa era:

```
1. Quick Guide Android Medidor Doble
2. Quick Guide iPhone Medidor Doble
3. Manual Operador Android
4. Manual Operador iPhone
5. Manual Supervisor
6. Manual Administrador
7. Videos
8. Academia
```

**La intuición central es correcta:** empezar por lo más pequeño y más usado, terminar por lo que depende de todo lo demás. Eso se conserva. Pero tiene tres problemas concretos:

### Problema 1 · Los puntos 1 y 2 son el mismo artefacto

La guía rápida de operador **no tiene contenido específico de plataforma**. Los seis pasos, los tres sellos, los tres problemas y las prohibiciones son idénticos en Android y en iPhone. Lo único que difiere es cómo se instala la aplicación — y la instalación **no pertenece a una tarjeta que vive colgada junto al surtidor**: se hace una vez en la vida del teléfono y está en el capítulo 1 del manual.

**Dos tarjetas laminadas para el mismo trabajo son dos inventarios que mantener y dos textos que van a divergir.** Una sola guía por perfil, no por plataforma.

### Problema 2 · No hay validación hasta que ya es tarde

El orden propuesto produce cuatro artefactos de operador antes de que nadie compruebe si el formato funciona. Si falla, fallan los cuatro.

**La validación tiene que ocurrir después del primer artefacto completo de una audiencia y antes de producir el resto.** Es el único punto del roadmap donde un error todavía es barato.

### Problema 3 · Faltan tres cosas del inventario

- **La guía rápida del supervisor.** El supervisor es quien decide si el piloto continúa; dejarlo sin material hasta el quinto lugar es un riesgo de adopción, no de documentación.
- **La visita a planta.** Es lo único del material que depende de un tercero y bloquea 17 fotografías y todos los planos de rodaje.
- **El set completo del perfil Carga sobre Inventario:** cuatro artefactos que el orden propuesto no menciona.

---

## Roadmap definitivo

```
0.  AGENDAR LA VISITA A PLANTA
    Se agenda el primer día aunque se ejecute en el paso 5.

1.  QG-OP-MD  +  QG-SUP
    Una guía por perfil, no por plataforma.

2.  OP-AND-MD  +  SUP-MD

3.  ►►► VALIDACIÓN CON USUARIOS REALES ◄◄◄
    Tres operadores y un supervisor. En la planta. Impreso.

4.  OP-IOS-MD  +  ADM  +  QG-ADM

5.  VISITA A PLANTA
    17 fotografías y todos los planos de rodaje, en una sola sesión.

6.  OP-AND-CI  +  OP-IOS-CI  +  SUP-CI  +  QG-OP-CI

7.  VIDEOS
    Guiones ya cerrados. Se montan con el material del paso 5.

8.  ACADEMIA
    Depende de los videos. Sigue siendo una decisión abierta de producto.
```

---

## Por qué cada paso va donde va

### Paso 0 · Agendar la visita

**Es lo único que no depende de nosotros.** Agendada tarde, se pospone; pospuesta una vez, se pospone siempre, y el material sale con huecos «provisionales» que se vuelven definitivos.

Agendarla el primer día cuesta una llamada. Descubrir en el paso 5 que el cliente no puede recibir en tres semanas cuesta tres semanas.

### Paso 1 · Las dos guías rápidas

**Es lo que la gente va a mirar durante meses**, mucho más que el manual completo. Y **no dependen de fotografía**: se diagraman hoy, con las capturas ya producidas.

Es el entregable de mayor impacto por hora invertida de todo el proyecto, y por eso va primero.

`QG-SUP` entra aquí y no en el quinto lugar porque el supervisor es quien evalúa si esto funciona. Un supervisor con una tarjeta en el escritorio desde la primera semana es un aliado; sin ella, es alguien esperando a que le expliquen.

### Paso 2 · Los dos manuales P0

Son los únicos con **usuarios reales esperándolos**. `OP-AND-MD` y `SUP-MD` cubren la planta que opera hoy.

Van juntos, y no el de operador primero, porque la validación del paso 3 necesita las dos audiencias: un material de operador que funciona y un supervisor que no sabe interpretar lo que ve produce el mismo problema que no tener material.

### Paso 3 · La validación

**El paso que no se salta.** Tres operadores y un supervisor que no hayan sido capacitados, en la planta, con el material impreso y la guía laminada.

Cada punto donde se detengan es un defecto del material. Si alguno se detiene tres veces o más, **el formato se corrige antes de diagramar las otras 99 páginas**.

El método completo está en [`10-evaluacion.md`](10-evaluacion.md).

### Paso 4 · Los P1

`OP-IOS-MD` **no es un manual nuevo: es una derivación.** Comparte cerca del 90 % del texto con `OP-AND-MD` y 13 de sus 17 capturas. Producirlo inmediatamente después, con el formato fresco y ya validado, cuesta una fracción; producirlo meses más tarde obliga a reconstruir criterios y produce dos manuales que no se parecen.

`ADM` entra aquí porque es lo que permite a Lubryco dar de alta clientes sin depender de nadie — pero su audiencia es interna, y una audiencia interna puede operar unas semanas con el handoff y la consola.

### Paso 5 · La visita

Se ejecuta aquí y no antes por una razón práctica: **para entonces ya se sabe exactamente qué falta**. Ir a la planta antes de haber diagramado nada produce fotografías que después no encajan.

Fotografías y planos de rodaje **en la misma sesión**. Una sola coordinación con el cliente.

### Paso 6 · El set de inventario

Va último de los manuales porque **no tiene usuarios todavía**: el perfil existe, pero sin operadores dados de alta. Producirlo antes es producir para nadie.

Los cuatro van juntos por la misma razón que en el paso 4: comparten texto y capturas, y separarlos los desincroniza.

### Paso 7 · Videos

Los guiones están cerrados escena por escena. Se montan con el material del paso 5, y no antes porque **sin los planos de campo no hay video que montar**.

### Paso 8 · Academia

Depende de los videos. Y antes de construir nada hay **tres decisiones de producto pendientes**: si vive dentro o fuera del producto, si los cursos son obligatorios, y si hay certificados con vigencia. Las tres se deciden antes de escribir una línea de código, no después.

---

## Lo que sí se puede paralelizar

Tres cosas no compiten por las mismas manos:

| En paralelo con | Se puede hacer                                                                        |
| --------------- | ------------------------------------------------------------------------------------- |
| Pasos 1–2       | Recortar los 28 zooms cuya captura ya existe                                          |
| Pasos 1–4       | Producir los 17 íconos de prioridad P0                                                |
| Paso 4          | Preparar la logística de la visita: permisos, autorizaciones de imagen, lista impresa |

**Los íconos P1 y P2 no se producen antes de la validación**: hasta ahí no se sabe cuáles sobran.

---

## Esfuerzo estimado

| Paso                           | Estimado        |
| ------------------------------ | --------------- |
| 1 · Dos guías rápidas          | 8–10 h          |
| 2 · Dos manuales P0 (34 pág)   | 20–26 h         |
| 3 · Validación                 | 1 día en planta |
| 4 · P1 (38 pág) + guía         | 20–24 h         |
| 5 · Visita                     | 1 día           |
| 6 · Set de inventario (43 pág) | 20–24 h         |
| 7 · Videos                     | ~5 días         |
| **Diagramación total**         | **≈ 75–90 h**   |

---

## Riesgo si se altera el orden

| Si se salta…                        | Lo que ocurre                                                           |
| ----------------------------------- | ----------------------------------------------------------------------- |
| El paso 0                           | La visita se pospone indefinidamente y el material sale sin fotografías |
| El paso 3                           | 115 páginas sobre un formato que nadie probó                            |
| La unión de 2 con SUP-MD            | El supervisor no sabe leer lo que el operador registra bien             |
| La unión de OP-AND-MD con OP-IOS-MD | Dos manuales del mismo trabajo que no se parecen                        |
| El orden 7 → 8                      | Una Academia sin videos, es decir, una lista de enlaces a PDFs          |
