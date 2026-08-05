# Layout · OP-IOS-MD — Operadores iPhone · Medidor Doble

> Especificación de diagramación para Claude Design. **No es diseño**: dice qué va en cada página y con qué jerarquía, nunca colores, tipografías ni medidas exactas.
> Manual: [`../01_Operadores/OP-IOS-MD.md`](../01_Operadores/OP-IOS-MD.md) · Assets: [`../04_Assets/inventario-assets.md`](../04_Assets/inventario-assets.md)

**Páginas:** 14 · **Audiencia:** operador · **Plataforma:** iPhone · **Perfil:** Medidor Doble

---

## Rejilla base

Formato vertical, pensado para **imprimirse en A5 y leerse en el celular**. Un solo tema por página: el operador nunca tiene que decidir dónde mirar.

- Una columna. Dos columnas SOLO en las páginas de pantallas emparejadas (equipo, operador).
- La captura ocupa entre el 50 % y el 65 % de la altura útil. Es el elemento principal, no una ilustración de apoyo.
- Máximo **4 callouts** por página. Si hacen falta más, la página se parte.
- Tipografía de cuerpo grande: se lee con guantes y a pleno sol.

## Páginas

### Página 1 · Portada — plantilla `AS-TPL-01`

1. Franja de marca: logo Lubryco · separador · logotipo «Cuadre» · placa «APP»
2. Título grande
3. Subtítulo con plataforma y perfil
4. Captura del splash, a sangre, al 40 % de opacidad detrás del bloque de texto
5. Pie: una frase de promesa

### Páginas de instalación y enrolamiento — plantilla `AS-TPL-02`

1. Título
2. Pasos numerados (3 o 4), cada uno en una línea, tipografía grande
3. Captura a la derecha o debajo, con los callouts anclados
4. Recuadro de advertencia al pie, fondo ámbar

### Páginas de paso (una pantalla) — plantilla `AS-TPL-02`

1. Eyebrow: «Paso N de 5»
2. Título de acción, en imperativo
3. Captura grande, centrada
4. Callouts anclados con línea fina al elemento exacto
5. Franja inferior: qué pasa al tocar el botón principal

### Páginas de dos pantallas — plantilla `AS-TPL-03`

1. Título común arriba
2. Dos capturas lado a lado, mismo tamaño, con numeral 1 y 2
3. Máximo 2 callouts por captura
4. Flecha de continuidad entre ambas

### Página de avisos — plantilla `AS-TPL-05`

1. Título tranquilizador (no alarmante)
2. Recorte del área del aviso, ampliado
3. Tabla de tres filas: aviso · qué significa · qué hacer
4. Frase de cierre en negrita: los avisos no detienen el registro

### Página de problemas — plantilla `AS-TPL-07`

1. Título
2. Bloques de problema → qué hacer → qué NO hacer (con `AS-ICO-06` en el último)
3. Captura del Diagnóstico, pequeña, en la columna lateral

### Última página · Reglas de oro — plantilla `AS-TPL-06`

1. Título
2. Lista numerada, tipografía muy grande, sin capturas
3. Línea punteada de corte: está pensada para arrancarse y pegarse en la pared
4. Pie con el teléfono del supervisor (campo a completar por el cliente)

## Jerarquía visual

| Nivel | Qué                                | Peso                  |
| ----- | ---------------------------------- | --------------------- |
| 1     | La captura                         | Máximo                |
| 2     | Callouts de prioridad alta         | Alto, con `AS-ICO-05` |
| 3     | Título de la página                | Alto                  |
| 4     | Texto de pasos                     | Medio                 |
| 5     | Callouts de prioridad media y baja | Bajo                  |
| 6     | Notas al pie                       | Mínimo                |

## Reglas de composición

- **Nunca** una página sin captura, salvo el mapa de pasos y las reglas de oro.
- **Nunca** un callout que no apunte a un elemento visible en esa captura.
- Los textos literales de la app van entre comillas y con la tipografía del producto, para que se reconozcan.
- El número de paso de la página debe coincidir con la barra de avance visible en la captura.
