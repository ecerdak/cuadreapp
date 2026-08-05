# Handoff a diseño — Production Kit de CuadreApp

**Este documento es autosuficiente.** Contiene todo lo necesario para diagramar el kit completo sin hacer una sola pregunta. Si algo aquí obliga a interpretar, es un defecto de este documento y hay que corregirlo aquí, no resolverlo en una página.

**Qué NO hay que decidir:** qué fotografía usar, qué ícono poner, qué layout aplicar, qué texto escribir, en qué orden producir. Todo está decidido y está enlazado.

---

## 1 · Filosofía

**El kit enseña a trabajar, no explica pantallas.**

Nadie piensa «estoy en la pantalla del PIN»; piensa «llegó un tractor». Toda la estructura sale de ahí: los manuales están organizados por **momentos del mundo real**, no por la arquitectura del producto.

Cinco principios que el diseño tiene que sostener:

1. **Se lee en una planta**, a pleno sol, con guantes, con ruido. No en un escritorio.
2. **La imagen va después de la acción.** Quien ejecuta lee el paso y confirma con la imagen.
3. **Solo imágenes reales.** Sin mockups, sin ilustraciones de dispositivos, sin dibujos de medidores. Un operador reconoce su planta o no reconoce nada.
4. **Lo incorrecto va primero** en toda comparativa. El lector reconoce su error antes de ver la solución.
5. **Un límite superado se resuelve partiendo la página, nunca comprimiéndola.** Reducir el cuerpo de texto para que quepa es exactamente lo que hace ilegible un manual de planta.

---

## 2 · Objetivo

Producir **115 páginas** repartidas en 7 manuales, 4 guías rápidas laminables, 7 checklists arrancables y 7 páginas de problemas — más 7 guiones de video ya cerrados.

**Criterio de terminado:** un operador que nunca ha usado la aplicación registra su primera carga solo, el mismo día que recibe el material.

---

## 3 · Audiencias

| Audiencia         | Manuales                        | Dónde se lee                          | Qué necesita                                            |
| ----------------- | ------------------------------- | ------------------------------------- | ------------------------------------------------------- |
| **Operador**      | 4 (Android/iPhone × 2 perfiles) | De pie, junto al surtidor             | Cuerpo grande, pasos cortos, imágenes que se reconozcan |
| **Supervisor**    | 2 (uno por perfil)              | Sentado, en una oficina               | Densidad mayor, tablas de decisión, evidencia ampliada  |
| **Administrador** | 1                               | Escritorio, con el teclado en la mano | Procesos completos que no se partan a la mitad          |

Los **perfiles operativos** son dos formas de operar, no dos clientes:

- **Medidor Doble** — planta con medidor Fill-Rite: el operador copia dos lecturas antes y dos después.
- **Carga sobre Inventario** — despacho a carrotanques: el operador escribe con cuánto llegó y cuánto se despachó; **la aplicación calcula el total, y esa es la idea central de todo ese perfil**.

---

## 4 · Estructura de la entrega

```
docs/training/
├── CLAUDE_DESIGN_HANDOFF.md   ← este documento
├── 00_Fuente/                 fuente de verdad — el texto sale de aquí
│   ├── catalogo-momentos.md       30 momentos: el eje de todo
│   ├── catalogo-pantallas.md      índice técnico pantalla → código
│   ├── biblioteca-callouts.md     66 callouts, escritos una vez
│   ├── biblioteca-errores.md      20 fichas de problema
│   ├── biblioteca-faq.md          41 preguntas
│   ├── inventario-fotografico.md  75 imágenes especificadas
│   └── inventario-zooms.md        51 zooms definitivos
├── 01_Operadores/  02_Supervisores/  03_Admin/     los 7 manuales
├── 06_Checklists/  07_Troubleshooting/            material arrancable
├── 08_Storyboards/                                7 guiones cerrados
├── 10_QuickGuides/                                4 guías laminables
├── 11_Academia/                                   propuesta documental
├── 12_Capturas/                ← LAS IMÁGENES REALES
│   ├── CATALOGO.md                 generado, no editar
│   ├── Operadores/  Supervisores/  Admin/
└── 13_Produccion/              ← LAS DECISIONES DE PRODUCCIÓN
    ├── orden-fotografica.md        qué fotografiar, con casillas
    ├── comparativas.md             9 comparativas especificadas
    ├── componentes.md              25 componentes gráficos
    ├── iconografia.md              37 íconos congelados
    ├── plantillas.md               12 plantillas de página
    └── matriz-reutilizacion.md     qué NO volver a producir
```

---

## 5 · Orden de producción

```
1. GUÍAS RÁPIDAS P0          QG-OP-MD, QG-SUP
   No dependen de nada. Máximo impacto por hora.

2. ZOOMS DISPONIBLES         28 de 51
   Recortes de capturas ya producidas. Sin costo de captura.

3. MANUALES P0               OP-AND-MD, SUP-MD
   Son los únicos con usuarios reales esperándolos.

4. ► VALIDAR CON UN OPERADOR REAL ◄
   El paso que decide todo. Ver §12.

5. VISITA A PLANTA           17 fotografías + planos de rodaje
   Agendar en el paso 1 aunque se ejecute aquí.

6. MANUALES P1               OP-IOS-MD, ADM
7. MANUALES P2               OP-AND-CI, OP-IOS-CI, SUP-CI
8. VIDEOS                    guiones ya cerrados
```

**El paso 4 no se salta.** Producir 115 páginas con un formato que nadie probó es apostar el kit completo a una corazonada.

---

## 6 · Capturas de pantalla

**30 de 52 ya están producidas** y son reales — no mockups. Están en `12_Capturas/`, con su catálogo generado en [`12_Capturas/CATALOGO.md`](12_Capturas/CATALOGO.md).

| Carpeta         | Producidas | Pendientes |
| --------------- | ---------- | ---------- |
| `Operadores/`   | 14         | 20         |
| `Supervisores/` | 5          | 1          |
| `Admin/`        | 11         | 0          |

**Regeneración:** `node scripts/capturar-pantallas.mjs`. Si el producto cambia, una corrida deja todas al día. **No retocar una captura a mano**: el retoque se pierde en la siguiente corrida.

**Especificaciones:** escritorio 2880×1800 (16:10), teléfono ×3 de densidad. Tema oscuro, es-CO, `America/Bogota`, sin animaciones a medio camino, página completa — el diseñador recorta.

**Las 22 pendientes** están bloqueadas por dos causas reales, explicadas una por una en el catálogo: pantallas de cámara (no se pueden simular sin falsear la imagen) y pantallas que requieren un entorno sembrado. No son un olvido.

---

## 7 · Fotografías

**17 fotografías de campo pendientes**, especificadas con casillas en [`13_Produccion/orden-fotografica.md`](13_Produccion/orden-fotografica.md).

**Las tres más valiosas del kit son `F-05`, `F-06` y `F-07`**: la comparativa de foto inservible frente a foto buena del medidor. El vidrio del Fill-Rite refleja la cubierta de la estación, y esa comparativa evita más registros perdidos que tres páginas de texto.

**Reglas no negociables:** luz natural sin flash · personas reales de la planta con autorización escrita · sin datos identificables · horizontal y vertical de cada escena clave · RAW + JPEG.

---

## 8 · Componentes, íconos y plantillas

| Documento                                          | Qué congela                            | Cantidad             |
| -------------------------------------------------- | -------------------------------------- | -------------------- |
| [`componentes.md`](13_Produccion/componentes.md)   | Qué significa cada pieza repetible     | 25 componentes       |
| [`iconografia.md`](13_Produccion/iconografia.md)   | Qué significa cada ícono y dónde va    | 37 íconos (17 en P0) |
| [`plantillas.md`](13_Produccion/plantillas.md)     | Qué tipo de página es y qué cabe       | 12 plantillas        |
| [`comparativas.md`](13_Produccion/comparativas.md) | Las 9 comparativas correcto/incorrecto | 9                    |

**Estos documentos no deciden colores, tipografías ni medidas: eso lo resuelve el Design System.** Deciden el _significado_, que es lo que no puede cambiar sin reescribir el kit.

**Si al diagramar hace falta un componente o un ícono que no está, se agrega al catálogo primero.** Inventarlo en una página es como nacen los kits que nadie puede mantener.

---

## 9 · Presupuestos por página

Límites, no metas:

| Plantilla                    | Imágenes      | Texto máximo    |
| ---------------------------- | ------------- | --------------- |
| `PL-01` Portada              | 1 a sangre    | 40 palabras     |
| `PL-02` Apertura de capítulo | 0–1           | 90              |
| `PL-03` Paso a paso          | 1 + 2 zooms   | 160             |
| `PL-04` Comparativa          | 2–3 (nunca 4) | 60              |
| `PL-06` Decisión             | 1 + 2 zooms   | 220             |
| `PL-07` Proceso              | hasta 4       | 400 (2 páginas) |
| `PL-09` Guía rápida          | 0–1           | 200             |

Y por componentes: capítulo de operador máximo 8 · decisión de supervisor 7 · proceso de administrador 10 · guía rápida 6 · checklist 3.

---

## 10 · Restricciones

**Nunca:**

- Mockups, wireframes, ilustraciones de dispositivos o dibujos de medidores.
- Retocar una captura a mano.
- Inventar un texto de interfaz. Todo lo que va entre comillas como «lo que el usuario ve» está copiado del código y verificado.
- Nombrar una pantalla en un título de capítulo.
- Introducir un ícono o un componente que no esté en su catálogo.
- Usar nombres de clientes reales. Los datos de demostración son neutros a propósito.
- Reducir el cuerpo de texto para que quepa una página.
- Cuatro imágenes en una comparativa, o más de cuatro llamados en una captura.

**Siempre:**

- La imagen después de la acción.
- Lo incorrecto antes de lo correcto.
- Los tres sellos (Cuadra / Revisar / No cuadra) juntos, nunca sueltos.
- Un ícono acompañado de una palabra.
- Guías rápidas a una sola cara, laminadas.

---

## 11 · Prioridades

| Prioridad | Piezas                                         | Por qué                                               |
| --------- | ---------------------------------------------- | ----------------------------------------------------- |
| **P0**    | `OP-AND-MD`, `SUP-MD`, `QG-OP-MD`, `QG-SUP`    | Hay una planta operando hoy con usuarios esperándolos |
| **P1**    | `OP-IOS-MD`, `ADM`, `QG-ADM`                   | Cierra el piloto actual                               |
| **P2**    | `OP-AND-CI`, `OP-IOS-CI`, `SUP-CI`, `QG-OP-CI` | El segundo perfil aún no tiene operadores             |

**Los cuatro manuales de operador comparten cerca del 70 % de su texto**, y de las 17 capturas de una plataforma, 13 sirven para los dos perfiles. **Producir los dos manuales de una plataforma juntos cuesta apenas más que producir uno**; producirlos con meses de diferencia cuesta el doble y produce capturas con datos distintos.

---

## 12 · Cómo se valida

Después de P0, antes de producir nada más:

1. Imprimir `OP-AND-MD` y `QG-OP-MD` **en papel**, la guía laminada.
2. Dárselos a un operador que **no haya sido capacitado**.
3. Pedirle que registre una carga siguiendo solo el material.
4. **No ayudarlo.** Anotar dónde se detiene.

**Cada punto donde se detenga es un defecto del kit, no del operador.** Si se detiene tres veces o más, el formato se corrige antes de diagramar las otras 99 páginas.

---

## 13 · Dónde está cada texto

**El texto no se escribe: se toma de la fuente.**

| Necesita                     | Está en                                              |
| ---------------------------- | ---------------------------------------------------- |
| El texto de un capítulo      | `01_Operadores/`, `02_Supervisores/`, `03_Admin/`    |
| El callout de una imagen     | `00_Fuente/biblioteca-callouts.md`, por ID `C-NN`    |
| Una pregunta frecuente       | `00_Fuente/biblioteca-faq.md`, por ID `P-NN`         |
| Una ficha de problema        | `00_Fuente/biblioteca-errores.md`, por ID `E-NN`     |
| Qué zoom recortar y de dónde | `00_Fuente/inventario-zooms.md`, por ID `Z-NN`       |
| Qué fotografía usar          | `00_Fuente/inventario-fotografico.md`, por ID `F-NN` |
| Qué captura usar             | `12_Capturas/CATALOGO.md`                            |
| Qué comparativa armar        | `13_Produccion/comparativas.md`, por ID `K-NN`       |

**Todos los identificadores están verificados por máquina**: `node scripts/verificar-training-kit.mjs` falla si una página referencia algo que no existe.

---

## 14 · Qué queda abierto

Tres cosas, todas señaladas:

1. **22 capturas** bloqueadas por cámara o por entorno sembrado — con el motivo exacto de cada una en el catálogo.
2. **17 fotografías de campo** que dependen de una visita a planta. Es lo único del kit que depende de un tercero.
3. **La Academia** es una propuesta documental. Nada está construido y nada de esto lo construye.

**Nada más queda abierto.** Si al diagramar aparece una decisión que este documento no resuelve, es un defecto suyo: corríjalo aquí para que el siguiente no la vuelva a encontrar.
