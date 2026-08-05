# Índice general de producción

La orden de trabajo. Todo lo que sigue está especificado en la fuente; **nada está producido**.

---

## 1. Los siete cursos

| ID          | Curso                                 | Audiencia  | Perfil        | Organizado por | Páginas | Prioridad |
| ----------- | ------------------------------------- | ---------- | ------------- | -------------- | ------- | --------- |
| `OP-AND-MD` | Cargar combustible · Android          | Operador   | Medidor Doble | 7 momentos     | 16      | **P0**    |
| `SUP-MD`    | Controlar el combustible de su planta | Supervisor | Medidor Doble | 7 decisiones   | 18      | **P0**    |
| `OP-IOS-MD` | Cargar combustible · iPhone           | Operador   | Medidor Doble | 7 momentos     | 16      | **P1**    |
| `ADM`       | Poner un cliente a operar             | Lubryco    | Ambos         | 7 procesos     | 22      | **P1**    |
| `OP-AND-CI` | Registrar un carrotanque · Android    | Operador   | Inventario    | 7 momentos     | 14      | **P2**    |
| `OP-IOS-CI` | Registrar un carrotanque · iPhone     | Operador   | Inventario    | 7 momentos     | 14      | **P2**    |
| `SUP-CI`    | Controlar lo que Lubryco entrega      | Supervisor | Inventario    | 7 decisiones   | 15      | **P2**    |
|             | **Total**                             |            |               |                | **115** |           |

### Por qué esas prioridades

- **P0 — hay una planta operando hoy.** `OP-AND-MD` y `SUP-MD` son los únicos cursos con usuarios reales esperándolos.
- **P1 — cierra el piloto.** `OP-IOS-MD` cubre los operadores con iPhone; `ADM` es lo que permite dar de alta clientes sin depender de nadie.
- **P2 — el segundo perfil.** Los tres cursos de Carga sobre Inventario no tienen usuarios todavía.

**Recomendación:** producir P0 completo y validarlo con un operador real **antes** de empezar P1. Si el formato falla, falla en dos cursos y no en siete.

---

## 2. Guías rápidas — producir con P0

**Una página cada una. Laminadas. Son lo que la gente va a mirar durante meses**, mucho más que el curso completo.

| Guía       | Audiencia                  | Dónde vive         | Prioridad |
| ---------- | -------------------------- | ------------------ | --------- |
| `QG-OP-MD` | Operador, Medidor Doble    | Junto al surtidor  | **P0**    |
| `QG-SUP`   | Supervisor, ambos perfiles | Escritorio         | **P0**    |
| `QG-ADM`   | Administrador Lubryco      | Escritorio         | **P1**    |
| `QG-OP-CI` | Operador, Inventario       | Caseta de despacho | **P2**    |

**No dependen de fotografía.** Se pueden diagramar hoy mismo, sin esperar la visita a planta. Es el entregable más rápido de todo el kit y el de mayor impacto por hora invertida.

---

## 3. Imágenes por producir

Detalle completo en [`../00_Fuente/inventario-fotografico.md`](../00_Fuente/inventario-fotografico.md).

| Familia                            | Cantidad | Existe      | Producir | Depende de              |
| ---------------------------------- | -------- | ----------- | -------- | ----------------------- |
| Fotografía de campo, Medidor Doble | 10       | 2 parciales | 8        | **Visita a planta**     |
| Fotografía de campo, Inventario    | 6        | 0           | 6        | **Visita a estación**   |
| Fotografía de contexto             | 3        | 0           | 3        | **Visita**              |
| Capturas de pantalla               | 52       | 0           | 52       | Nada — se producen hoy  |
| Marca                              | 4        | 4           | —        | 2 requieren exportación |
| **Total**                          | **75**   | **6**       | **69**   |                         |

**Las tres fotografías más valiosas del kit son `F-05`, `F-06` y `F-07`**: la comparativa de foto inservible frente a foto buena del medidor. Evitan más registros perdidos que tres páginas de texto.

---

## 4. Zooms

51 zooms especificados en [`../00_Fuente/inventario-zooms.md`](../00_Fuente/inventario-zooms.md).

| Origen                     | Cantidad | Costo de producción                    |
| -------------------------- | -------- | -------------------------------------- |
| Recorte de captura         | 46       | **Ninguno** — salen de las 52 capturas |
| Recorte de fotografía real | 5        | Ninguno — salen de la misma sesión     |

**Un zoom existe solo si hay una acción o una lectura asociada.** Ampliar algo «para que se vea mejor» sin nada que hacer con ello es ruido, y el inventario lo rechaza.

---

## 5. Videos

Siete storyboards completos en [`../08_Storyboards/`](../08_Storyboards/), cada uno con narración, planos, animaciones y textos en pantalla.

| Video       | Duración | Formato         | Prioridad |
| ----------- | -------- | --------------- | --------- |
| `OP-AND-MD` | 3:05     | Vertical 9:16   | **P0**    |
| `SUP-MD`    | 3:10     | Horizontal 16:9 | **P0**    |
| `OP-IOS-MD` | 3:15     | Vertical 9:16   | **P1**    |
| `ADM`       | 3:20     | Horizontal 16:9 | **P1**    |
| `OP-AND-CI` | 2:50     | Vertical 9:16   | **P2**    |
| `OP-IOS-CI` | 3:00     | Vertical 9:16   | **P2**    |
| `SUP-CI`    | 2:55     | Horizontal 16:9 | **P2**    |

**Los planos de campo se graban en la misma visita que las fotografías.** Es una sola coordinación con el cliente, no dos, y esa es la razón de agendarla antes que cualquier otra cosa.

---

## 6. Secuencia recomendada

```
1.  AGENDAR LA VISITA A PLANTA        ← lo único que depende de un tercero
2.  Guías rápidas P0                  ← no dependen de nada, impacto inmediato
3.  Capturas de pantalla (52)         ← se producen desde el escritorio
4.  Zooms (51)                        ← recortes de lo anterior
5.  Cursos P0 diagramados
6.  VALIDAR CON UN OPERADOR REAL      ← antes de producir nada más
7.  Visita: fotografía + rodaje
8.  Cursos P1 y P2, videos
```

El paso 6 es el que decide si el resto vale la pena producir como está. Saltárselo es apostar 115 páginas a un formato que nadie probó.

---

## 7. Lo que NO se produce en esta etapa

- PDFs, imágenes, capturas exportadas.
- Cualquier cambio en el producto.
- La Academia CuadreApp — es una [propuesta documental](../11_Academia/README.md), no un compromiso.
