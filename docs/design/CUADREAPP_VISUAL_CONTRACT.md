# CuadreApp — Contrato visual congelado

**Fuente:** exclusivamente `cuadre_app_conductor.jsx` y `cuadre_dashboard_trebol.jsx`
(v5 aprobada, `cuadreapp_diseno_original.zip`). Este documento **no define nada
nuevo**: transcribe. Ante discrepancia, mandan los JSX. Los valores que el JSX no
fija con precisión van marcados **NO DETERMINADO** y se conserva el comportamiento
observable del mockup.

**Separación de producto:** CuadreApp es un producto de Lubryco para clientes
industriales. NO es StationOS: cero branding, componentes, navegación, términos o
reglas visuales de StationOS.

---

## 1. Tokens

### Marca (`MARCA`, idéntica en ambos archivos)

| Token | Valor |
|---|---|
| amarillo | `#F5E01B` |
| azul | `#4A7CAB` |
| negro | `#0B0B0B` |
| halo | `#FFFFFF` |
| script | `'Yellowtail', cursive` |
| ui | `'Barlow', system-ui, -apple-system, sans-serif` |
| condensada | `'Barlow Condensed', 'Barlow', sans-serif` |

### Interfaz (`C`)

| Token | Valor | Uso |
|---|---|---|
| fondo | `#0B1219` | fondo de página |
| panel | `#111C26` | tarjetas, barra superior |
| panelAlto | `#16232F` | filas destacadas, panel de detalle (solo dashboard) |
| linea | `#22374A` | bordes de tabla, separadores |
| lineaSuave | `#1A2A38` | bordes de tarjeta, filas |
| texto | `#E7EEF6` | texto principal |
| suave | `#8AA0B6` | texto secundario |
| tenue | `#5C748A` | declarado, sin uso activo |
| amarillo | = MARCA.amarillo | acción, pestaña activa, barras |
| azul | `#5B90C4` | día parcial, enlaces secundarios móvil |
| verde | `#3FAE7E` | Cuadra |
| ambar | `#E2A233` | Revisar |
| rojo | `#E2594C` | No cuadra |
| trebol | `#1E9B4B` | declarado, sin uso activo |

### Solo app móvil (`APP`)

| Token | Valor | Uso |
|---|---|---|
| fondo | `#070D13` | fondo de la app |
| tarjeta | `#121C25` | tarjetas |
| tarjeta2 | `#18242F` | teclado, botones secundarios |

### Semáforo

`ok`→verde·"Cuadra" · `advertencia`→ámbar·"Revisar" · `inconsistente`→rojo·"No cuadra".
Relleno: `color + "16"` (avisos app) o `"1F"` (chips); borde: `color + "4D"` / `"55"`.
Otros usos puntuales del JSX: tarjeta equipo reconocido borde `verde+"66"`, círculo
final `verde+"22"`/borde `+"66"`, candado `col+"22"`/borde `+"66"`, fila desviada
`rojo+"0F"`, chip "Todo sincronizado" `verde+"1C"`, ZonaA degradado `col+"14"`.

## 2. Tipografía

- Interfaz: Barlow 400/500/600/700. Logotipo: Yellowtail 400. Eslogan/placas:
  Barlow Condensed 600/700 mayúsculas. Cifras/horas/códigos: **monoespaciada del
  sistema** (`font-mono`) — toda cifra numérica del producto, sin excepción.
- Carga original por Google Fonts `<link>`; en producto real: **autoalojadas**
  (la app arranca sin señal — LEEME). NO DETERMINADO el hinting/subset exacto:
  se usa subset latin oficial de Google Fonts.

Escala observada (px): 9.5–10 eyebrow (`letter-spacing .12–.14em`) · 10.5–11 pies y
notas · 11.5–12.5 secundario/celdas · 13–14 destacado/botones · 16–17 títulos de
tarjeta y cifras ZonaA · 19 título de barra · 21 frase ZonaA y título de pantalla
móvil · 26 valor CampoNum · 34 código de equipo · 40–44 rodillo · 52–62 cifra final
y cronómetro.

## 3. Logotipo (4 capas)

`Logotipo({tam=34, texto="Cuadre", halo=true})` — cuatro copias del texto,
`paint-order: stroke`, `line-height 1.35`, `white-space nowrap`:
1. sombra: desplazada `off`, stroke `sombra` negro
2. halo: stroke `halo` blanco (opcional)
3. contorno: stroke `contorno` negro
4. relleno: amarillo con filete `filete` negro

| tam | off | sombra | halo | contorno | filete |
|---|---|---|---|---|---|
| 118 | 10 | 20 | 16 | 11 | 3 |
| 54 | 5 | 10 | 8 | 5 | 1.5 |
| 34 | 3 | 6 | 4.5 | 3 | 1 |
| otro | 8 % | 17 % | 13 % | 9 % | 2.5 % |

**Placa** `APP`: Barlow Condensed 700 · 12 px (9.5 en barra móvil) · `.2em` ·
negro sobre amarillo · `padding 5px 7px 4px` · radio 3 · `line-height 1`.

**Favicon/ícono:** canvas cuadrado `#4A7CAB`, esquinas 22 % del lado, "C" Yellowtail
52/64 amarilla con contorno negro 4 px, sin halo, baseline 0.76·lado.

### Tamaños de logo aprobados

| Ubicación | Alto |
|---|---|
| Barra dashboard: Lubryco | **44 px** |
| Barra dashboard: logotipo script | 34 px + Placa 12 |
| Barra de la app móvil: Lubryco | **26 px** (mínimo de marca) |
| Barra de la app móvil: logotipo script | 28 px + Placa 9.5 |
| Bienvenida: logotipo script | 54 px |
| Bienvenida: Lubryco | **70 px** (decisión posterior; manda sobre el PDF de 40) |
| Chip cliente: Trébol | 48×48, radio 6 |

## 4. Geometría

- **Radios:** 3 placa/rodillo · 4–5 chips DEMO/candados · 6 logo cliente y marco guía ·
  8 tarjetas/avisos (`rounded-lg`) · 10–12 tarjetas móviles y campos (`rounded-xl`),
  botón de Inicio `rounded-2xl` · 27 obturador (54 px) · 31 círculo final (62 px) ·
  999 chips de estado.
- **Espaciado:** gaps 2/4/6/7/8/9/10/12/14/16/18/20/28; `p-5` (20) relleno de panel;
  móvil `px-4` (16) lateral constante; `pt-5` bajo título.
- **Ancho máximo:** 1180 px (dashboard). La app móvil ocupa el ancho del dispositivo
  (la carcasa de 372×760 es solo del demo).
- **Bordes:** 1 px en todo; `lineaSuave` tarjetas, `linea` tablas; ZonaA
  `border-left 3px` del tono; cargas de hoy `border-left 2px` del estado.
- **Sombras:** ninguna en el producto (las 2-3 del mockup pertenecen a la carcasa
  demo y al rodillo/cámara: rodillo `inset 0 0 0 1px rgba(0,0,0,.35)`, marco guía
  `0 0 0 9999px rgba(4,8,12,.42)`).
- **Iconografía:** sin librería. Solo `✓`, `!`, `⌫`.

## 5. Componentes de la app del conductor

- **CabezaApp:** borde inferior `lineaSuave`; fila `px-4 py-3`: Lubryco 26 │
  separador 1×22 `linea` │ Logotipo 28 │ Placa 9.5 — derecha sede 10 px suave.
  Barra de avance: 5 segmentos flex, alto 3, radio 2, gap 4, `px-4 pb-3`;
  amarillo hasta `avance`, resto `lineaSuave`. Avance: Equipo 1 · Conductor 2 ·
  Antes 3 · Cargando 4 · Después 5 · Listo 5 · Inicio sin barra.
- **Titulo:** `px-4 pt-5`; h2 21 px semibold `-0.01em`; sub 12.5 suave `lh 1.5 mt 6`.
- **BotonGrande:** full, `rounded-xl`, semibold; primario amarillo texto `#101A22`
  `18px 16px`/16; `chico` `13px 16px`/14; `gris` fondo `tarjeta2` texto claro borde
  `linea` (estado no disponible, sin opacity).
- **Aviso(tono, titulo, cuerpo):** `rounded-lg px-3 py-3`, fondo `col+16`, borde
  `col+4D`; cuadrito 18×18 radio 5 fondo col, `✓` (ok) / `!` (alerta/malo) 12 px
  `#0B1219`; título 13 semibold col; cuerpo 11.5 suave `lh 1.5 mt 3`; gap 9.
- **Camara:** contenedor `px-4`; visor `rounded-xl` alto 244 fondo `#05090D` borde
  `linea`; imagen `object-cover`, sin tomar `brightness(.82) saturate(.9)`;
  marco guía `left/right 12 % top 26 % height 40 %`, borde 2 px amarillo→verde al
  tomar, radio 6, sombra máscara `.42`; píldora superior centrada 10.5 px semibold
  fondo `rgba(6,12,18,.78)`, texto amarillo (instrucción) / verde ("Foto tomada");
  obturador inferior centrado 54 px blanco `#F4F7FA` borde 4 px blanco .35, interior
  40 px `#DCE4EB`; pie 10.5 suave centrado "Solo cámara en vivo · queda con hora y
  ubicación".
- **CampoNum(rot, valor, unidad, activo, tono, ayuda):** botón full `rounded-lg
  px-3 py-3` fondo `tarjeta`; borde: rojo (malo) / ámbar (alerta) / amarillo
  (activo) / `linea`; rot uppercase 9.5 `.12em` suave — ayuda 10 suave a la derecha;
  valor mono bold 26 (o `—` en color `linea`) + unidad 11 suave, gap 6.
- **Teclado:** grid 3 col gap 7 `px-4`; teclas `1-9 , 0 ⌫`; `13px 0`, 19 px mono
  semibold, fondo `tarjeta2`, borde `lineaSuave`, radio lg; `⌫` en suave.
- **Splash:** fondo `MARCA.azul` a sangre, `padding-bottom 38`; centro (con
  `padding-bottom 54` para centrado óptico): Logotipo 54 + eslogan
  `CADA GALÓN CUADRA` condensada 700 13 `.3em` (+`padding-left .3em`) negro `mt 20`;
  pie: `BY` Barlow 600 11 `.18em` `#EAF2F8` + Lubryco 70 px `mt 10`. Avanza al
  toque o sola a los 2 s.
- **Chip de sincronización (Inicio):** píldora 9.5 semibold `px-2 py-1`; verde
  `+1C` "Todo sincronizado". Estados adicionales del hardening usan el mismo
  formato con su color del semáforo (NO DETERMINADO en el JSX; conducta conservada
  de la app validada).

## 6. Flujo visual del conductor (orden congelado)

00 Bienvenida → 01 Inicio → 02 Equipo (identificación + confirmación "Equipo
reconocido") → 03 Conductor (tarjeta + 4 puntos PIN + teclado) → 04 Antes de cargar
(cámara + tanda/totalizador + teclado) → 05 Cargando (cronómetro 62 + tarjeta
contexto) → 06 Después de cargar (cámara + tanda/total/horómetro + teclado) →
07 Listo (círculo ✓ + cifra 52 + tarjeta 5 filas + botón reiniciar).

Microcopy congelado (títulos, subs, botones, avisos): el del JSX, transcrito en la
auditoría §2. Reglas: una decisión por pantalla; el conductor no escribe letras;
los errores no acusan; validación en vivo con los textos del dominio.

## 7. Componentes del dashboard

- **Eyebrow:** uppercase 10 `.14em`, color param (def. suave).
- **Panel:** `rounded-lg`, fondo panel/panelAlto, borde `lineaSuave`.
- **Chip:** píldora uppercase 10 `.08em` `3px 8px`, color estado, fondo `+1F`,
  borde `+55`.
- **ZonaA(tono, titulo, frase, hechos, derecha):** `rounded-lg mb-5`; fondo
  `linear-gradient(90deg, col14 0%, panel 55%)`; borde `lineaSuave` + izq 3 px col;
  interior `p-5` flex col→row md; izquierda `max-width 620`: Eyebrow col, frase 21
  semibold `mt-2`, hechos `mt-4` wrap gap `18px 28px` (valor mono semibold 17 +
  etiqueta 11 suave `mt 2`); derecha `shrink-0`. Tonos: alto=rojo, medio=ámbar,
  bajo=verde.
- **Rodillo(valor, enteros=6, decima, alto=44):** ancho dígito = `round(alto*.62)`,
  fuente `round(alto*.56)` mono bold, gap 2, radio 3; enteros: texto `#101820`,
  degradado `#F7F9FB 0% → #DFE6EC 45% → #FFFFFF 55% → #C9D3DC 100%`, inset 1px
  negro .35; décima: texto `#FFF3F1`, degradado `#C0362B → #9E2B22 45% → #D8483B
  55% → #8C241C`, inset .4.
- **Candado(ok, texto, detalle):** cuadrito 17×17 radio 4 `col+22` borde `col+66`,
  `✓`/`!` 11 bold; texto 12.5 `lh 1.4`; detalle 11 suave `lh 1.5 mt 2`; gap 10.
- **BotonExcel:** fila full `rounded-md` semibold gap 10 `10px 14px` 12.5;
  principal amarillo texto `#12202C`; secundario `panelAlto` borde `linea`;
  sufijo "XLSX" 10 px opacity .75 `.06em`.
- **Gráfico de consumo:** contenedor alto 132 flex items-end gap 6; barra
  `height = round(g/max*96)`, amarilla opacity .9 (parcial: azul .55), radio
  `2px 2px 0 0`; valor encima 10 mono suave `mb 4`; día debajo 10 mono suave `mt 6`.
- **Tablas:** `border-collapse`, th uppercase 10 `.1em` suave `8px 10-12px` borde
  inferior `linea`; td `10-11px 10-12px` borde inferior `lineaSuave`; códigos mono
  semibold 13; texto 12 suave; números a la derecha mono; fila activa `panelAlto`;
  fila desviada ≥15 % fondo `rojo+0F`; `min-width` 520–620 con `overflow-x-auto`.
- **Botones de acción ZonaA:** amarillo `12px 20px` 14 semibold radio md, texto
  `#12202C`.

## 8. Layouts del dashboard

- **Header:** borde inferior `linea`, fondo panel; interior `max-w 1180 px-5 py-4`
  flex wrap between gap 16: [Lubryco 44 │ sep 1×40 │ (Logotipo 34 + Placa) sobre
  subtítulo 10.5 `.04em` suave `mt 3`] — [chip DEMO · tarjeta cliente `panelAlto`
  borde `linea` radio md gap 10 `6px 12px 6px 6px`: Trébol 48 radio 6 + nombre 13
  semibold + sede 10.5 suave].
- **Pestañas:** misma franja del header, `max-w 1180 px-5` flex gap 4
  `overflow-x-auto`; botón 13 semibold `11px 16px`; activa texto claro +
  `border-bottom 2px` amarillo; inactiva suave.
- **Contexto:** `main max-w 1180 px-5 py-6`; línea `mb-5` between wrap gap 8:
  cliente+fecha+corte 12 suave — medidor+instalación 11 suave.
- **Hoy:** ZonaA · grid `lg:grid-cols-3 gap-4` (totalizador 1 col: rodillo 40,
  texto 12 `lh 1.6`, desglose con `border-top lineaSuave mt-4 pt-4`, cifras mono
  semibold 15 + etiqueta 11 · gráfico `lg:col-span-2`) · panel cargas `mt-4`:
  filas `panelAlto rounded-md px-3 py-3` gap 14 wrap, borde izq 2 px estado, hora
  mono 12 suave w 42, equipo mono semibold 13 w 54, desc·conductor 12 suave flex-1
  `min-width 150`, gal mono semibold 14 w 74 derecha, Chip.
- **Cargas:** ZonaA (derecha `min-width 226`: Eyebrow "Descargar el detalle" +
  2 BotonExcel gap 8 + nota 10.5 `lh 1.5 mt 9`) · grid `lg:grid-cols-5 gap-4`:
  tabla `col-span-3` (eyebrow `px-5 pt-5`, tabla `mt-3 px-2 pb-2 min-w 520`) +
  evidencia `col-span-2` Panel alto `p-5`: encabezado (eyebrow + equipo·gal 16
  semibold + meta 12 suave + Chip) · fotos grid 2 gap 10 (rot 11 suave mb 6, caja
  138 fondo `#0A1017` borde `linea` radio md, `object-cover`; sin foto: texto 11
  ámbar centrado "Sin foto. El conductor cerró la carga sin capturar el medidor.")
  · por foto: filas Tanda/Totalizador 11 suave / mono semibold 13 texto ·
  candados `mt-5 pt-4 border-top linea` (eyebrow "Verificación automática" + 4
  candados gap 9) · contador del equipo fila final 11/13.
- **Equipos:** ZonaA · Panel tabla 6 col `min-w 620` · pie `px-5 pb-5` 11 suave
  `lh 1.6`.
- **Suministro:** ZonaA (derecha tarjeta balance `panelAlto` borde `linea` radio md
  `p-4 min-w 210`: eyebrow + 3 filas 12 gap 7, "En tanque" separado `border-top
  linea pt-2`, cifra amarilla mono semibold; nota 10.5 `mt 10`) · Panel tabla
  entregas 5 col (incl. "Recibido por") `min-w 520` · pie 11 `lh 1.6`.
- **Pie global:** `mt-8 pt-5 border-top lineaSuave`, flex between wrap 11 suave:
  "CuadreApp · un servicio de Lubryco para sus clientes industriales · sin costo" —
  "Lubryco ve el volumen del tanque. El detalle por equipo y conductor es solo del
  cliente."

## 9. Breakpoints y responsive

El JSX usa únicamente los prefijos Tailwind `md:` (768) y `lg:` (1024):
- ZonaA: columna → fila en `md`.
- Grids Hoy/Cargas: 1 columna → 3/5 en `lg`.
- Fotos evidencia: siempre 2 columnas.
- Pestañas y tablas: `overflow-x-auto` (así resuelve móvil — sin barra inferior).
- App móvil: una columna, `px-4`, sin breakpoints.
NO DETERMINADO: comportamiento entre 768–1024 del master-detail (el mockup apila);
se conserva apilado.

## 10. Estados

- Campos: activo (borde amarillo) · alerta (ámbar) · malo (rojo) · reposo (`linea`)
  · vacío (valor `—` color `linea`).
- Botón: primario · chico · gris (no disponible).
- Cámara: sin tomar (marco amarillo, imagen atenuada, obturador) · tomada (marco
  verde, píldora "Foto tomada", sin obturador).
- Fila de tabla: reposo · activa (`panelAlto`) · desviada (`rojo+0F`).
- Chips: Cuadra/Revisar/No cuadra; sincronización verde; DEMO amarillo.
- Avisos: ok/alerta/malo.
- PIN: punto vacío (borde `linea`) · lleno (amarillo).
- NO DETERMINADO (no existen en el JSX; conservan su conducta validada, vestidos
  con este contrato): esqueletos de carga, estado de error con reintentar, estados
  offline/cola/sincronizando/error del chip, aviso de actualización, borrador
  restaurado, diagnóstico, enrolamiento.

## 11. Assets canónicos

| Asset | Archivo del ZIP | Uso |
|---|---|---|
| Logo Lubryco | `logos/lubryco_110px.webp` | cabeceras (26/44) y Splash (70) |
| Logo El Trébol | `logos/trebol_110px.webp` | chip cliente 48 |
| Fill-Rite antes | `fotos_medidor/fillrite_900_antes.webp` | guía de encuadre PWA; evidencia demo |
| Fill-Rite después | `fillrite_900_despues.webp` | ídem |
| Originales sin procesar | `originales_sin_procesar/*` | archivo, no se embeben |

Se integran como **archivos importados** (no base64). Los íconos instalables de la
PWA (C amarilla sobre azul, validados físicamente) permanecen.

## 12. Decisiones abiertas heredadas del paquete de diseño

1. Lubryco en barra del dashboard: 44 px (especificación de marca) — vigente.
2. Placa APP ausente en la bienvenida (solo logotipo) — vigente.
3. 70 px en bienvenida contradice el PDF de marca — el JSX manda (70).
4. Modo alto contraste para sol directo — pendiente de campo, fuera de alcance.
