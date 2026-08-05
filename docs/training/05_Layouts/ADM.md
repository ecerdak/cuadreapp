# Layout · ADM — Administrador · Consola completa

> Especificación de diagramación para Claude Design. **No es diseño**: dice qué va en cada página y con qué jerarquía, nunca colores, tipografías ni medidas exactas.
> Manual: [`../03_Admin/ADM.md`](../03_Admin/ADM.md) · Assets: [`../04_Assets/inventario-assets.md`](../04_Assets/inventario-assets.md)

**Páginas:** 22 · **Audiencia:** administrador · **Plataforma:** Escritorio · **Perfil:** Ambos

---

## Rejilla base

Formato horizontal, dos columnas asimétricas (2/3 captura, 1/3 texto). Es el manual más largo: la navegación importa tanto como el contenido.

- **Encabezado de sección persistente**: cada página lleva arriba en qué parte de la ficha está (Identidad / Configuración / Operación / Dashboard). Sin eso, 22 páginas se vuelven indistinguibles.
- Numeración de pasos visible en las páginas del alta de cliente (Paso 1 a Paso 6).
- Máximo **3 callouts** por página.

## Páginas

### Página 1 · Portada — plantilla `AS-TPL-01`

### Página 2 · La jerarquía — plantilla `AS-TPL-04`

Diagrama `AS-DIA-05` a página completa. Es el mapa mental de toda la consola.

### Páginas de pantalla — plantilla `AS-TPL-02` (horizontal)

1. Encabezado de sección
2. Eyebrow «Paso N» cuando corresponde
3. Captura ancha
4. Callouts a la derecha

### Páginas de decisión — plantilla `AS-TPL-04`

Las dos páginas críticas (elegir perfil, por qué solo dos colores) van sin captura o con recorte pequeño: el peso está en la tabla comparativa.

### Páginas de detalle — plantilla `AS-TPL-05`

Recorte ampliado + explicación + advertencia cuando aplica (totalizador de instalación, PIN que no se vuelve a ver).

### Página de vistas globales — plantilla `AS-TPL-03`

Tres miniaturas en fila con una línea de texto cada una.

### Última página · Alta en 10 minutos — plantilla `AS-TPL-06`

La secuencia completa con casillas, arrancable, para tenerla al lado mientras se da de alta un cliente.

## Jerarquía visual

| Nivel | Qué                         | Peso                  |
| ----- | --------------------------- | --------------------- |
| 1     | Encabezado de sección       | Constante, discreto   |
| 2     | Título de la página         | Máximo                |
| 3     | Captura o tabla de decisión | Alto                  |
| 4     | Advertencias irreversibles  | Alto, con `AS-ICO-06` |
| 5     | Callouts                    | Medio                 |
| 6     | Notas                       | Bajo                  |

## Reglas de composición

- Las **acciones irreversibles o difíciles de deshacer** (totalizador de instalación, PIN, revocar dispositivo) llevan siempre marca de advertencia.
- La secuencia del alta de cliente debe poder seguirse **sin leer el resto del manual**: la última página es autosuficiente.
- Los textos literales de la consola van entre comillas para que se reconozcan en pantalla.
