# Índice general de exportación

La orden de trabajo para Claude Design. Todo lo que sigue está especificado en la fuente; **nada está producido**.

---

## 1. Los siete manuales

| ID          | Manual                                      | Audiencia  | Perfil        | Páginas | Capturas         | Recortes | Callouts | Prioridad |
| ----------- | ------------------------------------------- | ---------- | ------------- | ------- | ---------------- | -------- | -------- | --------- |
| `OP-AND-MD` | Operadores Android · Medidor Doble          | Operador   | Medidor Doble | 14      | 13               | 2        | 20       | **P0**    |
| `OP-IOS-MD` | Operadores iPhone · Medidor Doble           | Operador   | Medidor Doble | 14      | 14               | 2        | 21       | **P1**    |
| `SUP-MD`    | Supervisores · Dashboard Medidor Doble      | Supervisor | Medidor Doble | 16      | 5                | 7        | 9        | **P0**    |
| `ADM`       | Administrador · Consola completa            | Lubryco    | Ambos         | 22      | 11               | 8        | 12       | **P1**    |
| `OP-AND-CI` | Operadores Android · Carga sobre Inventario | Operador   | Inventario    | 13      | 12               | 1        | 18       | **P2**    |
| `OP-IOS-CI` | Operadores iPhone · Carga sobre Inventario  | Operador   | Inventario    | 13      | 12               | 1        | 18       | **P2**    |
| `SUP-CI`    | Supervisores · Dashboard Inventario         | Supervisor | Inventario    | 13      | 5                | 3        | 8        | **P2**    |
|             | **Total**                                   |            |               | **105** | **47 distintas** | **24**   | **106**  |           |

### Por qué esas prioridades

- **P0 — El Trébol está operando hoy.** `OP-AND-MD` y `SUP-MD` son los únicos manuales que tienen usuarios reales esperándolos. Todo lo demás puede esperar.
- **P1 — Cierra el piloto actual.** `OP-IOS-MD` cubre los operadores con iPhone; `ADM` es lo que permite que Lubryco dé de alta clientes sin depender de nadie.
- **P2 — El segundo cliente.** Los tres manuales de Carga sobre Inventario no tienen usuarios todavía: el cliente del perfil está creado pero sin sedes ni operadores.

**Recomendación:** producir P0 completo y validarlo con un operador real **antes** de empezar P1. Si el formato falla, falla en dos manuales y no en siete.

---

## 2. Capturas por producir

**47 capturas distintas + 5 variantes = 52 archivos.**

| Contexto | Cantidad         | Dispositivo           | Manuales que las usan |
| -------- | ---------------- | --------------------- | --------------------- |
| `and-*`  | 15 + 2 variantes | Teléfono Android real | OP-AND-MD, OP-AND-CI  |
| `ios-*`  | 15 + 3 variantes | iPhone real           | OP-IOS-MD, OP-IOS-CI  |
| `dsh-*`  | 6                | Escritorio            | SUP-MD, SUP-CI        |
| `adm-*`  | 11               | Escritorio            | ADM                   |

Lista completa por manual en cada archivo, sección 3. Convención de nombres en [`../00_Fuente/catalogo-pantallas.md`](../00_Fuente/catalogo-pantallas.md).

### Reutilización

De las 15 capturas Android, **13 sirven para los dos manuales de ese sistema operativo**; solo `and-11_llegada` y `and-12_despacho` son exclusivas de inventario, y `and-08_antes` / `and-10_despues` de medidor doble. Lo mismo en iPhone. Producir los dos manuales de una plataforma juntos cuesta apenas más que producir uno.

---

## 3. Assets por producir

| Categoría                 | Cantidad       | Estado                                |
| ------------------------- | -------------- | ------------------------------------- |
| Marca                     | 7              | Ya existen en el repositorio — copiar |
| Capturas                  | 52             | Producir                              |
| Recortes                  | 24             | Derivar de las capturas               |
| Ilustraciones y diagramas | 8              | Diseñar                               |
| Iconografía               | 6              | Diseñar                               |
| Plantillas de página      | 7              | Diseñar                               |
| **Total**                 | **104 piezas** |                                       |

Detalle en [`../04_Assets/inventario-assets.md`](../04_Assets/inventario-assets.md).

---

## 4. Esfuerzo estimado para Claude Design

Estimación por bloques, asumiendo que el sistema de diseño de CuadreApp ya existe (colores, tipografías y componentes están definidos en el producto).

| Bloque                  | Alcance                                               | Esfuerzo          |
| ----------------------- | ----------------------------------------------------- | ----------------- |
| Plantillas de página    | 7 plantillas, base de los 105 páginas                 | 1 jornada         |
| Iconografía y diagramas | 6 iconos + 8 ilustraciones                            | 1,5 jornadas      |
| Producción de capturas  | 52 archivos, con preparación de datos de demostración | 1 jornada         |
| Recortes y anotación    | 24 recortes + 106 callouts anclados                   | 1 jornada         |
| Diagramación P0         | `OP-AND-MD` (14 p.) + `SUP-MD` (16 p.)                | 1,5 jornadas      |
| Diagramación P1         | `OP-IOS-MD` (14 p.) + `ADM` (22 p.)                   | 1,5 jornadas      |
| Diagramación P2         | `OP-AND-CI`, `OP-IOS-CI`, `SUP-CI` (39 p.)            | 1,5 jornadas      |
| Revisión y ajustes      | Los 7 manuales                                        | 1 jornada         |
| **Total**               | **105 páginas, 7 PDF**                                | **≈ 10 jornadas** |

**Con P0 solamente** (los dos manuales que tienen usuarios hoy): plantillas + iconografía + capturas Android y Dashboard + diagramación P0 ≈ **4 jornadas**.

Los videos son un esfuerzo aparte, con otra disciplina: 7 storyboards, entre 2 y 3,5 minutos cada uno. Estimar por separado con quien los grabe.

---

## 5. Bloqueantes conocidos

| #   | Bloqueante                                                       | Afecta                                                                    | Qué hace falta                                                                                                      |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | El escenario de demostración del Dashboard es solo Medidor Doble | `SUP-CI` — la captura `dsh-04_evidencia-inventario.png` no se puede tomar | Agregar una carga del perfil inventario a los datos simulados. **Toca código del producto**; esta etapa no lo hizo. |
| 2   | No hay cliente de demostración para la consola                   | `ADM` — las 11 capturas                                                   | Crear un cliente de prueba con logo, dos colores, dos sedes y equipos compartidos y exclusivos                      |
| 3   | El logotipo y las placas son componentes React, no imágenes      | Portadas de los 7 manuales                                                | Exportarlos como imagen o rehacerlos en el sistema de diseño                                                        |
| 4   | No hay iPhone del piloto confirmado                              | `OP-IOS-MD`, `OP-IOS-CI` — 15 capturas                                    | Definir el modelo para que la barra de estado sea consistente                                                       |

El bloqueante 1 es el único que exige tocar el producto. Los otros tres son de preparación.

---

## 6. Convenciones de entrega

- **Un PDF por manual**, nombrado con su ID: `OP-AND-MD.pdf`.
- **Capturas en resolución nativa**, sin escalar, en `04_Assets/capturas/{contexto}/`.
- **Los manuales de operador se imprimen en A5** (caben en el bolsillo de un overol); los de supervisor y admin, en A4 horizontal.
- **Las páginas arrancables** (reglas de oro, checklists) van siempre al final y con línea de corte.
- **Cada PDF lleva en su pie la versión del kit y la fecha**, para que se sepa contra qué versión del producto se escribió.

---

## 7. Cómo verificar antes de exportar

```bash
node scripts/verificar-training-kit.mjs
```

Si falla, el kit está desincronizado del producto y **exportar produciría manuales que enseñan pantallas que ya no existen**. Corregir primero el catálogo.
