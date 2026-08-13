# Layout · SUP-CI — Supervisores · Dashboard Carga sobre Inventario

> **Presupuesto de páginas reemplazado (v2, 13-ago-2026):** la arquitectura de páginas de este layout queda como referencia de bloques, pero el total ya no manda — el objetivo vigente es el de `CLAUDE_DESIGN_HANDOFF_V2.md`: **máximo 3 páginas** por manual (operadores: +1 página exclusiva de instalación por plataforma). Mucha imagen, poco texto, una tarea por bloque.

> Especificación de diagramación para Claude Design. **No es diseño**: dice qué va en cada página y con qué jerarquía, nunca colores, tipografías ni medidas exactas.
> Manual: [`../02_Supervisores/SUP-CI.md`](../02_Supervisores/SUP-CI.md) · Assets: [`../04_Assets/inventario-assets.md`](../04_Assets/inventario-assets.md)

**Páginas:** 13 · **Audiencia:** supervisor · **Plataforma:** Escritorio · **Perfil:** Carga sobre Inventario

---

## Rejilla base

Formato horizontal (se lee en el mismo computador donde se usa el tablero), dos columnas asimétricas: 2/3 para la captura, 1/3 para la explicación.

- La captura del Dashboard es ancha: recortarla pierde contexto. Se usa completa en las páginas de pantalla y recortada solo en las de detalle.
- Máximo **3 callouts** por página: esta audiencia lee texto corrido sin problema.
- Se permiten tablas densas; es el formato natural para un supervisor.

## Páginas

### Página 1 · Portada — plantilla `AS-TPL-01`

1. Franja de marca
2. Título y subtítulo con el perfil
3. Captura de «Hoy» a sangre, difuminada
4. Promesa: la rutina de cinco minutos

### Página de concepto — plantilla `AS-TPL-04`

1. Título
2. Diagrama (`AS-DIA-03` / `AS-DIA-04`), centrado, sin captura
3. Texto explicativo en dos columnas

### Páginas de pantalla — plantilla `AS-TPL-02` (horizontal)

1. Eyebrow con el nombre de la pestaña
2. Título
3. Captura ancha, completa
4. Callouts a la derecha, con línea de anclaje

### Páginas de detalle — plantilla `AS-TPL-05`

1. Título
2. Recorte ampliado del área relevante, a la izquierda
3. Explicación a la derecha, con tabla si aplica
4. Recuadro destacado cuando hay un riesgo de interpretación (páginas de salto y de existencia estimada)

### Página de banderas — plantilla `AS-TPL-04`

Tabla a página completa: bandera · qué dice el tablero · qué hacer. Sin captura.

### Última página · Rutina — plantilla `AS-TPL-06`

Checklist de mañana y de semana, con casillas, arrancable.

## Jerarquía visual

| Nivel | Qué                                   | Peso   |
| ----- | ------------------------------------- | ------ |
| 1     | Título de la página                   | Máximo |
| 2     | La captura o el recorte               | Alto   |
| 3     | Recuadros de riesgo de interpretación | Alto   |
| 4     | Tablas                                | Medio  |
| 5     | Callouts                              | Medio  |
| 6     | Notas                                 | Bajo   |

## Reglas de composición

- Las páginas que previenen una **mala interpretación** (un salto no es un robo; la existencia es estimada) llevan recuadro destacado y no comparten página con otro tema.
- Los chips de estado del papel deben usar exactamente los colores del producto (`AS-ICO-01` a `AS-ICO-03`).
- El chip «Demo» de las capturas no se retoca: es honesto que se vea.
