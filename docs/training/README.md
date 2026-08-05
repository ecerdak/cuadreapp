# Training Experience de CuadreApp — v2.0

Esto **no es un conjunto de manuales**. Es el sistema que los genera, los mantiene sincronizados con el producto, y —desde la v2.0— los organiza por **cómo se trabaja**, no por cómo está construida la aplicación.

---

## Qué cambió en la v2.0, y por qué

La v1.0 tenía un problema que no se veía hasta ponerla frente a un operador: estaba organizada por pantallas. Cada manual recorría el producto en el orden en que el producto existe.

**Nadie trabaja en ese orden.** Un operador no piensa «estoy en la pantalla del PIN»; piensa «llegó un tractor». Un supervisor no piensa «voy a la pestaña de cargas»; piensa «¿hay algo que deba atender hoy?». Un manual organizado por pantallas obliga a la persona a traducir de su mundo al nuestro, y esa traducción es exactamente donde se pierde alguien que está aprendiendo.

| v1.0                               | v2.0                                      |
| ---------------------------------- | ----------------------------------------- |
| Organizado por pantallas           | Organizado por **momentos reales**        |
| «Pantalla de captura inicial»      | «Antes de abrir la manguera»              |
| Explica la interfaz                | Enseña a trabajar                         |
| Callouts que describen la pantalla | Callouts que dicen **qué hacer**          |
| Capturas de pantalla               | Capturas **+ fotografías reales + zooms** |
| Un manual por audiencia            | Manual **+ guía rápida laminable**        |

**El catálogo de pantallas no desapareció, cambió de papel.** Dejó de ser el índice del curso y pasó a ser el índice técnico que garantiza la sincronía con el código. Nadie aprende leyéndolo; el verificador lo usa para detectar cuándo una pantalla cambió.

---

## Cómo está construido

```
docs/training/
├── README.md              ← este archivo
├── 00_Fuente/             ← LA FUENTE DE VERDAD (editar aquí primero)
│   ├── catalogo-momentos.md       ← EL EJE: 30 momentos del mundo real
│   ├── catalogo-pantallas.md         índice técnico: pantalla → archivo de código
│   ├── biblioteca-callouts.md        66 callouts, en lenguaje de operador
│   ├── biblioteca-errores.md         problemas indexados por la frase con que se reportan
│   ├── biblioteca-faq.md             preguntas como se preguntan de verdad
│   ├── inventario-fotografico.md     75 imágenes: qué fotografiar y cómo
│   └── inventario-zooms.md           51 zooms: qué ampliar y por qué
├── 01_Operadores/         4 cursos (Android/iPhone × 2 perfiles), por momentos
├── 02_Supervisores/       2 cursos, por decisiones
├── 03_Admin/              1 curso, por procesos completos
├── 04_Assets/             inventario de todo lo gráfico
├── 05_Layouts/            cómo se diagrama cada página
├── 06_Checklists/         checklists imprimibles
├── 07_Troubleshooting/    indexado por lo que la persona dice
├── 08_Storyboards/        guiones de video: planos, narración, textos en pantalla
├── 09_Exports/            índice general de producción
├── 10_QuickGuides/        ← NUEVO: una página, laminable
└── 11_Academia/           ← NUEVO: propuesta documental de 5 cursos
```

---

## La cadena de la fuente de verdad

```
MOMENTO (mundo real)  ──usa──▶  PANTALLA  ──apunta a──▶  ARCHIVO DE CÓDIGO
   lo que enseñamos             índice técnico          sincronía verificable
```

**El momento es lo que se enseña. La pantalla es lo que se verifica.** Los dos catálogos existen porque cumplen funciones distintas, y confundirlos fue el error de la v1.0.

---

## Las cinco reglas del kit

1. **Ningún texto se inventa.** Todo lo que un manual pone entre comillas como «lo que el usuario ve» está copiado literal del código, y el catálogo dice de qué archivo salió.
2. **Un momento nunca se nombra con una pantalla.** Si no se puede nombrar sin decir «pantalla», «campo» o «botón», es una pantalla disfrazada de momento.
3. **Un callout dice qué hacer, no qué es.** Verbo en imperativo primero, cero nombres de interfaz, máximo 15 palabras.
4. **Solo imágenes reales.** Sin mockups, sin ilustraciones de dispositivos, sin dibujos de medidores. Un operador reconoce su planta o no reconoce nada.
5. **Una captura, un nombre.** Dos manuales que muestran la misma pantalla comparten la captura.

---

## Cómo actualizar cuando el producto cambia

**Cambió un texto de una pantalla** (el caso más común):

1. Abrir `00_Fuente/catalogo-pantallas.md`, buscar la pantalla por su archivo de código.
2. Corregir el texto literal.
3. Correr `node scripts/verificar-training-kit.mjs` — dice qué manuales usan esa pantalla.
4. Revisar solo esos. **Tiempo típico: 5 minutos.**

**Cambió la forma de trabajar** (menos frecuente, más profundo):

1. Abrir `00_Fuente/catalogo-momentos.md` y corregir o agregar el momento.
2. Revisar los cursos que lo cubren.
3. Revisar la guía rápida de esa audiencia: es lo que la gente mira todos los días.

**Se agregó un perfil operativo:** un bloque de momentos nuevo, dos cursos de operador, uno de supervisor, una guía rápida. La estructura ya lo soporta — así se agregó Carga sobre Inventario.

---

## Estado

|                   |                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Contenido escrito | **Completo** — 7 cursos, 4 guías rápidas, 7 checklists, 7 troubleshooting, 7 storyboards   |
| Fuente de verdad  | **Completa** — 30 momentos, 32 pantallas, 66 callouts, 41 preguntas, 20 fichas de problema |
| Fotografías       | **6 de 75** — falta una visita a planta                                                    |
| Diagramación      | **No empezada**                                                                            |
| Videos            | **Guionizados, no grabados**                                                               |
| Academia          | **Propuesta documental** — nada construido                                                 |

**El cuello de botella es la visita a planta.** Es lo único del kit que depende de un tercero y lo único que no se puede hacer desde un escritorio. Debe agendarse primero aunque se ejecute al final.
