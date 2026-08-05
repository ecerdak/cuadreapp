# SUP-MD · Supervisores — Dashboard, perfil Medidor Doble

> Fuente: [`catalogo-pantallas.md`](../00_Fuente/catalogo-pantallas.md) · [`biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md) · [`biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md) · [`biblioteca-faq.md`](../00_Fuente/biblioteca-faq.md)
> Layout: [`../05_Layouts/SUP-MD.md`](../05_Layouts/SUP-MD.md) · Checklist: [`../06_Checklists/SUP-MD.md`](../06_Checklists/SUP-MD.md) · Troubleshooting: [`../07_Troubleshooting/SUP-MD.md`](../07_Troubleshooting/SUP-MD.md) · Video: [`../08_Storyboards/SUP-MD.md`](../08_Storyboards/SUP-MD.md)

---

## 1. Resumen

|                       |                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Audiencia**         | Jefe de campo o de almacén del cliente. Usa computador de escritorio, una vez al día.                       |
| **Objetivo**          | Que en cinco minutos cada mañana sepa si el combustible del día cuadró, y que sepa qué hacer con lo que no. |
| **Tiempo de lectura** | 12 minutos                                                                                                  |
| **Prerrequisitos**    | Usuario y contraseña del tablero · entender que la existencia del tanque es **estimada**, no medida         |
| **Perfil operativo**  | Medidor Doble — la evidencia incluye tanda, totalizador y los tres candados                                 |
| **Páginas estimadas** | 16                                                                                                          |

**Lo que este manual sí hace y los de operador no:** explica **por qué**. Un supervisor que no entiende qué significa un salto de totalizador toma malas decisiones con buena información — la peor combinación posible.

---

## 2. Storyboard — página por página

### Página 1 · Portada

- **Título:** El tablero de tu operación · **Subtítulo:** Guía del supervisor · Medidor Doble
- **Pantalla:** `dsh-01_hoy.png` (a sangre, difuminada bajo el título)
- **Texto:** «Cinco minutos cada mañana. Eso es todo lo que pide.»

### Página 2 · Qué responde este tablero

- **Título:** Las tres preguntas
- **Objetivo:** dar el marco antes de la primera pantalla.
- **Pantalla:** ninguna (diagrama `AS-DIA-03`)
- **Contenido:** ¿cuadró el combustible de hoy? · ¿algún equipo se salió de su patrón? · ¿cuándo hay que pedir el próximo despacho? Cada una corresponde a una pestaña.

### Página 3 · Empieza por «Hoy»

- **Título:** La pantalla de la mañana · **Pantalla:** `dsh-01_hoy.png` (completa)
- **Callouts:** `C-SUP-01` (Alta), `C-SUP-03` (Media)
- **Texto:** una frase arriba te dice si hay algo que atender. Si está en verde, cerraste el día en un minuto.

### Página 4 · El totalizador

- **Título:** El número que no depende de nadie
- **Objetivo:** entender la pieza central del modelo de confianza.
- **Pantalla:** `dsh-01_hoy.png` recortada al panel del rodillo
- **Callouts:** `C-SUP-02` (Alta)
- **Texto:** el totalizador acumula desde la instalación del dispensador y no se puede resetear. Todo lo demás se contrasta contra él.

### Página 5 · Las cargas del día

- **Título:** Lo que se registró hoy
- **Pantalla:** `dsh-01_hoy.png` recortada al panel inferior
- **Callouts:** `C-SUP-03` (Media)
- **Texto:** cada fila es una carga; el color del borde es su resultado; tocarla abre su evidencia.

### Página 6 · La pestaña Cargas

- **Título:** El historial de 14 días · **Pantalla:** `dsh-02_cargas.png` (completa)
- **Callouts:** `C-SUP-04` (Alta), `C-SUP-05` (Media)
- **Texto:** filtra por «No cuadran» para quedarte solo con lo que necesita tu atención.

### Página 7 · Leer una evidencia ★

- **Título:** Qué mirar en una carga
- **Objetivo:** la página más importante del manual.
- **Pantalla:** `dsh-03_evidencia-medidor.png` (grande, página completa)
- **Callouts:** `C-SUP-06` (Alta), `C-SUP-07` (Alta)
- **Texto:** las dos fotos son la prueba; bajo cada una, los números que el operador copió; a la derecha, las tres verificaciones automáticas.

### Página 8 · Los tres candados ★

- **Título:** Las tres verificaciones
- **Objetivo:** que el supervisor sepa qué está verificando la máquina por él.
- **Pantalla:** `dsh-03_evidencia-medidor.png` recortada al bloque «Verificación automática»
- **Contenido:** tabla de tres filas, cada una con qué verifica y qué significa que falle:

  | Candado                     | Verifica                                                   | Si falla                                                |
  | --------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
  | Tanda en 0,0                | Que el conteo arrancó limpio                               | El operador no reseteó; hay una nota explicando por qué |
  | Continuidad del totalizador | Que arrancó donde quedó la carga anterior                  | Hubo una carga sin registrar entre las dos              |
  | La tanda cuadra             | Que lo despachado coincide con lo que subió el totalizador | Un número mal copiado, o el registro no corresponde     |

- **Texto:** «Falsificar los tres al mismo tiempo, con las dos fotos, exige bombear combustible de verdad.»

### Página 9 · Un salto no es un robo ★

- **Título:** Qué significa un salto de totalizador
- **Objetivo:** evitar la acusación falsa, que es el mayor riesgo de este tablero.
- **Pantalla:** `dsh-03_evidencia-medidor.png` recortada al mensaje de salto
- **Callouts:** `C-SUP-08` (Alta)
- **Texto:** el medidor ya contó esos galones, así que el balance del tanque sigue correcto. Lo que falta es saber **a qué equipo fueron**. Casi siempre es una carga que no se registró — no combustible desaparecido.
- **Recuadro:** «Antes de acusar a alguien: pregunta quién cargó sin la app ese día. Es la respuesta correcta nueve de cada diez veces.»

### Página 10 · Todas las banderas

- **Título:** Qué te está diciendo cada aviso
- **Pantalla:** ninguna (tabla)
- **Contenido:** las 15 banderas con su mensaje de supervisor y una columna «qué hacer». Fuente literal: `MENSAJE_SUPERVISOR` del código.

### Página 11 · Descargar para contabilidad

- **Título:** El archivo de Excel · **Pantalla:** `dsh-02_cargas.png` recortada a la zona de descarga
- **Callouts:** `C-SUP-05` (Media)
- **Texto:** cinco hojas; los galones van como número, no como texto.

### Página 12 · La pestaña Equipos

- **Título:** Qué equipo se salió de su patrón · **Pantalla:** `dsh-05_equipos.png`
- **Callouts:** `C-SUP-11` (Media)
- **Texto:** el desvío compara cada equipo contra su propia mediana histórica.

### Página 13 · El desvío no acusa

- **Título:** Cómo leer un desvío alto
- **Pantalla:** `dsh-05_equipos.png` recortada a una fila marcada
- **Contenido:** las tres causas mecánicas antes de la sospecha (inyectores, filtro, motor encendido en esperas) y la cuarta como último recurso.

### Página 14 · La pestaña Suministro

- **Título:** Cuándo pedir el próximo despacho · **Pantalla:** `dsh-06_suministro.png`
- **Callouts:** `C-SUP-12` (Alta)
- **Texto:** autonomía en días y pedido sugerido; abajo, las entregas de Lubryco con su remisión.

### Página 15 · La existencia es estimada

- **Título:** Un número que hay que entender bien
- **Objetivo:** prevenir la discusión más común entre cliente y proveedor.
- **Pantalla:** `dsh-06_suministro.png` recortada al balance
- **Contenido:** la existencia es **entregado − despachado**, no una medición del tanque. Margen ±2 %. Se confirmará con aforo cuando existan las medidas del tanque.

### Página 16 · Tu rutina de cinco minutos

- **Título:** Cada mañana
- **Pantalla:** ninguna
- **Contenido:** el checklist de §6 en formato de página arrancable.

---

## 3. Capturas requeridas

Capturas de escritorio, navegador maximizado, **con datos de demostración** (el tablero muestra un chip «Demo» — debe quedar visible: es honesto y evita que alguien confunda las cifras con reales). **5 capturas.**

| #   | Archivo                        | Pantalla | Estado a capturar                                                      |
| --- | ------------------------------ | -------- | ---------------------------------------------------------------------- |
| 1   | `dsh-01_hoy.png`               | DSH-01   | Con al menos una carga marcada, para que el veredicto no esté en verde |
| 2   | `dsh-02_cargas.png`            | DSH-02   | Filtro en «Todas», con una fila seleccionada                           |
| 3   | `dsh-03_evidencia-medidor.png` | DSH-03   | Con las dos fotos, los tres candados y un candado en rojo              |
| 4   | `dsh-05_equipos.png`           | DSH-05   | Con al menos un equipo con desvío ≥15 % (fila resaltada)               |
| 5   | `dsh-06_suministro.png`        | DSH-06   | Con autonomía en zona ámbar y pedido sugerido visible                  |

**Recortes necesarios** (no son capturas nuevas; se derivan de las anteriores): panel del rodillo, panel de cargas de hoy, bloque de verificación automática, mensaje de salto, zona de descarga, fila de desvío, balance de suministro. **7 recortes.**

---

## 4. Callouts

**9 callouts** de la biblioteca: `C-SUP-01` a `C-SUP-08`, `C-SUP-11`, `C-SUP-12`. Ocho de prioridad alta — es un manual con poca redundancia porque su audiencia lee mejor.

---

## 5. Errores frecuentes

`E-SUP-01` (una carga aparece como «No cuadra») · `E-SUP-02` (falta la foto final) · `E-SUP-03` (un equipo tiene desvío alto) · `E-SUP-04` (el operador no ve un equipo nuevo) · `E-SUP-05` (los números no cuadran con mi conteo).

---

## 6. Checklist operativo

**Antes (una vez, al recibir el acceso)**

1. Entré al tablero y cambié la contraseña provisional.
2. Confirmé que la sede y el cliente que veo son los míos.
3. Entiendo que la existencia es estimada, no medida.

**Cada mañana (5 minutos)** 4. Abro «Hoy» y leo la frase de arriba. 5. Si hay cargas marcadas, abro cada una y miro sus dos fotos. 6. Reviso los tres candados de las que no cuadran. 7. Si falta una foto final, hablo con el operador **hoy**.

**Cada semana** 8. Reviso «Equipos» y anoto los desvíos ≥15 %. 9. Reviso «Suministro»: si la autonomía baja de 7 días, aviso a Lubryco. 10. Descargo el Excel de 14 días para contabilidad.

---

## 7. Troubleshooting

Matriz en [`../07_Troubleshooting/SUP-MD.md`](../07_Troubleshooting/SUP-MD.md).

---

## 8. Preguntas frecuentes

`F-SUP-01` a `F-SUP-07`. **7 preguntas.**

`F-SUP-02` («¿"No cuadra" significa que alguien robó?») debe ir primera y con el mayor peso visual del bloque: es la pregunta que determina si el supervisor usará bien la herramienta.

---

## 9. Tiempo esperado por pantalla

| Pantalla                     | Primera vez | En rutina diaria |
| ---------------------------- | ----------- | ---------------- |
| DSH-01 Hoy                   | 3 min       | 1 min            |
| DSH-02 Cargas (lista)        | 2 min       | 1 min            |
| DSH-03 Evidencia (por carga) | 3 min       | 40 s             |
| DSH-05 Equipos               | 3 min       | 1 min (semanal)  |
| DSH-06 Suministro            | 3 min       | 1 min (semanal)  |
| **Rutina diaria completa**   | —           | **≈ 5 min**      |
