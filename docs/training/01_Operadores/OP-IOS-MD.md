# OP-IOS-MD · Operadores iPhone — perfil Medidor Doble

> Fuente: [`catalogo-pantallas.md`](../00_Fuente/catalogo-pantallas.md) · [`biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md) · [`biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md) · [`biblioteca-faq.md`](../00_Fuente/biblioteca-faq.md)
> Layout: [`../05_Layouts/OP-IOS-MD.md`](../05_Layouts/OP-IOS-MD.md) · Checklist: [`../06_Checklists/OP-IOS-MD.md`](../06_Checklists/OP-IOS-MD.md) · Troubleshooting: [`../07_Troubleshooting/OP-IOS-MD.md`](../07_Troubleshooting/OP-IOS-MD.md) · Video: [`../08_Storyboards/OP-IOS-MD.md`](../08_Storyboards/OP-IOS-MD.md)

---

## 1. Resumen

|                        |                                                                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Audiencia**          | Operarios de campo que cargan combustible en la planta (tractoristas, camioneros, motobombas). Teléfono iPhone.                                                                                                                   |
| **Objetivo**           | Que el operador registre una carga completa en unos 40 segundos, con o sin señal, sin haber usado nunca la app.                                                                                                                   |
| **Tiempo de lectura**  | 8 minutos                                                                                                                                                                                                                         |
| **Tiempo de práctica** | 1 carga acompañada (unos 5 minutos)                                                                                                                                                                                               |
| **Prerrequisitos**     | iPhone con Safari (obligatorio: otros navegadores no pueden instalar la app) · el código de enrolamiento que entrega el supervisor · código de operador y PIN de 4 dígitos · saber dónde está el sticker con el código del equipo |
| **Perfil operativo**   | Medidor Doble — la planta despacha con un dispensador Fill-Rite de tanda y totalizador                                                                                                                                            |
| **Nivel de lectura**   | Diseñado para leerse con guantes, a pleno sol y sin experiencia previa con apps                                                                                                                                                   |
| **Páginas estimadas**  | 14                                                                                                                                                                                                                                |

**Diferencias reales frente a la versión Android** (y son las únicas): la instalación se hace desde Compartir en Safari y no con un botón; borrar los datos de Safari borra la app instalada; y el estado «Almacenamiento protegido» puede quedar en «NO» con más frecuencia. Todo lo demás —las cinco pantallas de captura, los textos, los tiempos— es idéntico.

**Nota de alcance:** este manual **no explica el negocio**. No dice por qué existen los tres candados ni qué hace el supervisor con la información. Explica qué tocar, en qué orden y qué hacer cuando algo sale distinto.

---

## 2. Storyboard — página por página

### Página 1 · Portada

- **Título:** Cargar combustible con CuadreApp
- **Subtítulo:** Guía del operador · iPhone
- **Objetivo:** que quien la reciba sepa en 3 segundos que es para él.
- **Pantalla:** `ios-01_splash.png`
- **Callouts:** ninguno
- **Texto:** «Registrar una carga toma unos 40 segundos. Funciona con o sin señal. Esta guía te lleva paso a paso.»

### Página 2 · Instalar la app _(se hace una sola vez)_

- **Título:** Primero: instala la app _(tiene que ser en Safari)_
- **Objetivo:** que la app quede instalada desde Safari, no abierta como página web.
- **Pantalla:** `ios-15_instalar.png`
- **Callouts:** `C-INS-02` (Alta), `C-INS-01` (Alta), `C-INS-03` (Alta)
- **Texto:** pasos numerados: abrir el enlace **en Safari** → tocar Compartir (el cuadrado con la flecha, abajo) → «Añadir a pantalla de inicio» → «Añadir» → abrir siempre desde el ícono nuevo.
- **Nota destacada:** «En iPhone no existe el botón automático de instalar: hay que hacerlo desde Compartir. Y tiene que ser Safari — desde Chrome o Firefox no se puede.»
- **Advertencia adicional (propia de iPhone):** «Si borras Safari o los datos de sitios web, se borra la app instalada y las cargas que no hayan subido.»

### Página 3 · Enrolar el teléfono _(una sola vez, con señal)_

- **Título:** Conecta el teléfono a tu estación
- **Objetivo:** canjear el código de enrolamiento y aceptar permisos.
- **Pantalla:** `ios-02_enrolar.png`
- **Callouts:** `C-ENR-01` (Alta), `C-ENR-02` (Media), `C-PER-01` (Alta)
- **Texto:** el supervisor entrega un código; se escribe tal cual; se acepta cámara y ubicación cuando el teléfono las pida.
- **Nota:** esta pantalla no se vuelve a ver.

### Página 4 · La pantalla de inicio

- **Título:** Tu pantalla de todos los días
- **Objetivo:** reconocer el botón de empezar y entender el semáforo de sincronización.
- **Pantalla:** `ios-03_inicio.png`
- **Callouts:** `C-INI-01` (Alta), `C-INI-02` (Alta), `C-INI-03` (Alta), `C-INI-06` (Baja)
- **Texto:** un solo botón para empezar; abajo, lo que llevas registrado hoy.

### Página 5 · Los cinco pasos de una carga

- **Título:** Una carga son cinco pasos
- **Objetivo:** dar el mapa mental completo antes del detalle.
- **Pantalla:** diagrama de la barra de avance (asset `AS-DIA-01`), no captura
- **Callouts:** ninguno
- **Texto:** Equipo → Tú → Antes de cargar → Cargando → Después de cargar. La barra amarilla de arriba te dice dónde vas.

### Página 6 · Paso 1 — ¿Qué equipo vas a cargar?

- **Título:** Paso 1 · Elige el equipo
- **Objetivo:** encontrar el equipo por el código del sticker y confirmarlo.
- **Pantallas:** `ios-04_equipo-lista.png` y `ios-05_equipo-confirma.png` (dos columnas)
- **Callouts:** `C-EQU-01` (Alta), `C-EQU-02` (Alta), `C-EQU-03` (Media)
- **Texto:** escribe las primeras letras del código; la lista se filtra sola; confirma que es la máquina correcta.

### Página 7 · Paso 2 — Identifícate

- **Título:** Paso 2 · Tu código y tu PIN
- **Objetivo:** que el operador entienda que la carga queda a su nombre.
- **Pantallas:** `ios-06_operador-codigo.png` y `ios-07_operador-pin.png` (dos columnas)
- **Callouts:** `C-OPE-01` (Alta), `C-OPE-02` (Alta), `C-OPE-03` (Alta)
- **Texto:** tu código se reconoce solo; después, cuatro dígitos. Funciona sin señal.

### Página 8 · Paso 3 — Antes de cargar

- **Título:** Paso 3 · Deja la tanda en cero y toma la foto
- **Objetivo:** el paso con más errores del flujo — merece página completa.
- **Pantalla:** `ios-08_antes.png` (grande)
- **Callouts:** `C-MD-01` (Alta), `C-MD-02` (Alta), `C-MD-03` (Media), `C-MD-04` (Alta)
- **Texto:** gira la perilla hasta 0.0 → encuadra la carátula completa → toma la foto → copia los dos números.
- **Recuadro:** cómo se ve una carátula bien encuadrada frente a una mal encuadrada (asset `AS-FOT-01`).

### Página 9 · Si aparece un aviso

- **Título:** Los avisos amarillos no te detienen
- **Objetivo:** desactivar el miedo a los avisos, que es la causa principal de abandono del registro.
- **Pantalla:** `ios-08_antes.png` recortada al área del aviso
- **Callouts:** `C-MD-05` (Media)
- **Texto:** amarillo significa «queda anotado», no «está prohibido». Puedes continuar siempre.
- **Tabla:** los tres avisos más frecuentes con una frase de qué hacer con cada uno.

### Página 10 · Paso 4 — Cargando

- **Título:** Paso 4 · Carga el combustible
- **Objetivo:** que no toque «Terminé» antes de tiempo.
- **Pantalla:** `ios-09_cargando.png`
- **Callouts:** `C-CAR-01` (Media), `C-CAR-02` (Alta)
- **Texto:** el cronómetro corre solo. Toca «Terminé de cargar» solo cuando hayas terminado de verdad.

### Página 11 · Paso 5 — Después de cargar

- **Título:** Paso 5 · Segunda foto y cierre
- **Objetivo:** cerrar el registro correctamente.
- **Pantalla:** `ios-10_despues.png` (grande)
- **Callouts:** `C-MD-06` (Alta), `C-MD-07` (Alta), `C-MD-08` (Alta), `C-MD-09` (Media), `C-MD-10` (Alta)
- **Texto:** segunda foto de la misma carátula → copia los dos números → si aparece verde, cuadra → guarda.

### Página 12 · Listo

- **Título:** Listo. Ya quedó registrada.
- **Objetivo:** cerrar el ciclo y explicar los tres resultados posibles.
- **Pantalla:** `ios-13_listo.png`
- **Callouts:** `C-LIS-01` (Alta), `C-LIS-02` (Alta), `C-LIS-03` (Alta)
- **Texto:** los tres chips posibles y qué significa cada uno; sin señal la carga también quedó guardada.

### Página 13 · Cuando algo sale distinto

- **Título:** Si algo sale distinto
- **Objetivo:** resolver sin llamar a nadie los cinco casos más frecuentes.
- **Pantalla:** `ios-14_diagnostico.png` (pequeña, lateral)
- **Callouts:** `C-DIA-01` (Media), `C-DIA-02` (Alta)
- **Contenido:** `E-OP-03`, `E-OP-04`, `E-OP-05`, `E-OP-11`, `E-OP-12` en formato problema → qué hacer → qué no hacer.

### Página 14 · Las siete reglas de oro

- **Título:** Para recordar
- **Objetivo:** página arrancable para pegar en la pared del almacén.
- **Pantalla:** ninguna
- **Contenido:** las 7 reglas (ver §6) en tipografía grande, sin adornos.

---

## 3. Capturas requeridas

Todas de iPhone, orientación vertical, con la barra de estado de iOS visible (notch o isla dinámica según el modelo del piloto). **12 capturas.**

| #   | Archivo                      | Pantalla | Estado a capturar                                                  |
| --- | ---------------------------- | -------- | ------------------------------------------------------------------ |
| 1   | `ios-01_splash.png`          | PWA-01   | Splash completa                                                    |
| 2   | `ios-15_instalar.png`        | PWA-15   | Hoja Compartir de Safari con «Añadir a pantalla de inicio» visible |
| 3   | `ios-02_enrolar.png`         | PWA-02   | Con un código de ejemplo escrito y el botón ya en amarillo         |
| 4   | `ios-03_inicio.png`          | PWA-03   | Con 2–3 cargas del día y el chip en «Todo sincronizado»            |
| 5   | `ios-04_equipo-lista.png`    | PWA-04   | Con «T-0» escrito y la lista filtrada                              |
| 6   | `ios-05_equipo-confirma.png` | PWA-05   | Tarjeta verde con equipo y horómetro                               |
| 7   | `ios-06_operador-codigo.png` | PWA-06   | Campo de código vacío, teclado visible                             |
| 8   | `ios-07_operador-pin.png`    | PWA-07   | Dos de los cuatro puntos llenos                                    |
| 9   | `ios-08_antes.png`           | PWA-08   | Foto ya tomada (marco verde) y los dos números escritos            |
| 10  | `ios-09_cargando.png`        | PWA-09   | Cronómetro en un valor realista (01:20 aprox.)                     |
| 11  | `ios-10_despues.png`         | PWA-10   | Foto tomada, números escritos y el aviso verde «Cuadra»            |
| 12  | `ios-13_listo.png`           | PWA-13   | Chip «Cuadra» y «✓ Guardado y sincronizado»                        |
| 13  | `ios-14_diagnostico.png`     | PWA-14   | Todas las filas con valores normales                               |

**Variante adicional recomendada:** una segunda toma de `ios-03_inicio.png` con el chip en «Sin conexión — 2 en cola», para la página 12. Se nombra `ios-03b_inicio-offline.png`.

**Captura extra propia de iPhone:** `ios-14b_diagnostico-persistencia.png` — el Diagnóstico con «Almacenamiento protegido» en «NO — riesgo de purga». En iPhone ese estado es bastante más probable que en Android (WebKit decide por heurística) y el manual necesita mostrarlo tal como se ve.

**Datos para las capturas:** usar el cliente de demostración, nunca datos reales de un cliente. Equipo `T-04`, operador con nombre genérico.

---

## 4. Callouts

Textos completos en [`biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md). Este manual usa **21 callouts**:

| Pantalla           | Callouts                                              | De prioridad alta |
| ------------------ | ----------------------------------------------------- | ----------------- |
| PWA-15 instalación | `C-INS-02`, `C-INS-01`, `C-INS-03`                    | 3                 |
| PWA-02 enrolar     | `C-ENR-01`, `C-ENR-02`, `C-PER-01`                    | 2                 |
| PWA-03 inicio      | `C-INI-01`, `C-INI-02`, `C-INI-03`, `C-INI-06`        | 3                 |
| PWA-04/05 equipo   | `C-EQU-01`, `C-EQU-02`, `C-EQU-03`                    | 2                 |
| PWA-06/07 operador | `C-OPE-01`, `C-OPE-02`, `C-OPE-03`                    | 3                 |
| PWA-08 antes       | `C-MD-01`, `C-MD-02`, `C-MD-03`, `C-MD-04`, `C-MD-05` | 3                 |
| PWA-09 cargando    | `C-CAR-01`, `C-CAR-02`                                | 1                 |
| PWA-10 después     | `C-MD-06`…`C-MD-10`                                   | 4                 |
| PWA-13 listo       | `C-LIS-01`, `C-LIS-02`, `C-LIS-03`                    | 3                 |
| PWA-14 diagnóstico | `C-DIA-01`, `C-DIA-02`                                | 1                 |

**Regla de composición:** máximo 4 callouts por página; si una pantalla necesita más, se parte en dos páginas (es lo que se hizo con PWA-08 → páginas 8 y 9).

---

## 5. Errores frecuentes

De [`biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md), los que aplican a este manual. En iPhone, `E-OP-01` (no aparece el botón de instalar) **no es un problema sino el comportamiento normal**: el manual debe presentarlo así para no alarmar.

| ID        | Problema                                     |
| --------- | -------------------------------------------- |
| `E-OP-01` | No me aparece el botón de instalar           |
| `E-OP-02` | El código de enrolamiento no funciona        |
| `E-OP-03` | La cámara no abre                            |
| `E-OP-04` | No encuentro el equipo en la lista           |
| `E-OP-05` | Dice «Código o PIN incorrecto»               |
| `E-OP-06` | El medidor no está en 0.0 y no puedo girarlo |
| `E-OP-07` | Los números no cuadran                       |
| `E-OP-09` | Me equivoqué de equipo y ya avancé           |
| `E-OP-10` | Se cerró la app a mitad de la carga          |
| `E-OP-11` | No hay Internet                              |
| `E-OP-12` | Dice «En cola» y no baja de ahí              |
| `E-OP-13` | Dice «{n} con error — avisa al supervisor»   |
| `E-OP-14` | «Almacenamiento protegido» dice NO           |

---

## 6. Checklist operativo

Versión imprimible en [`../06_Checklists/OP-IOS-MD.md`](../06_Checklists/OP-IOS-MD.md).

**Antes de cargar**

1. Tengo el teléfono con la app instalada (ícono, no navegador).
2. Sé el código del equipo (está en el sticker).
3. La perilla del medidor está en 0.0.

**Durante** 4. Confirmé el equipo correcto. 5. Me identifiqué con mi código y mi PIN. 6. Tomé la foto inicial con la carátula completa. 7. Copié tanda y totalizador tal como se ven. 8. Toqué «Terminé de cargar» solo al terminar de verdad. 9. Tomé la foto final y copié los dos números.

**Después** 10. Vi el chip de resultado en la pantalla «Listo». 11. Si dice «Revisar» o «No cuadra», se lo comento al supervisor hoy. 12. Si dice «En cola», abro la app unos segundos donde haya señal.

**Las siete reglas de oro** (página 14)

1. Ábrela siempre desde el ícono, nunca desde Safari.
2. La tanda en 0.0 antes de la foto.
3. Las dos fotos, siempre, con la carátula completa.
4. Copia los números tal como se ven, sin ajustarlos.
5. Amarillo no te detiene: sigue y queda anotado.
6. Sin señal se registra igual: nunca repitas una carga.
7. Nunca borres Safari ni los «datos de sitios web».

---

## 7. Troubleshooting

Matriz completa en [`../07_Troubleshooting/OP-IOS-MD.md`](../07_Troubleshooting/OP-IOS-MD.md).

---

## 8. Preguntas frecuentes

De [`biblioteca-faq.md`](../00_Fuente/biblioteca-faq.md): `F-OP-01` a `F-OP-11` (comunes) y `F-MD-01` a `F-MD-04` (perfil Medidor Doble). **15 preguntas.**

Orden sugerido en el manual: primero las de señal (`F-OP-01`, `F-OP-02`), que son las que más se preguntan; al final las de privacidad (`F-OP-11`), que son las que nadie pregunta en voz alta.

---

## 9. Tiempo esperado por pantalla

| Pantalla                               | Primera vez               | En rutina        |
| -------------------------------------- | ------------------------- | ---------------- |
| PWA-15 instalación                     | 3 min                     | — (una sola vez) |
| PWA-02 enrolar                         | 2 min                     | — (una sola vez) |
| PWA-03 inicio                          | 10 s                      | 2 s              |
| PWA-04/05 equipo                       | 25 s                      | 8 s              |
| PWA-06/07 operador                     | 20 s                      | 6 s              |
| PWA-08 antes de cargar                 | 40 s                      | 12 s             |
| PWA-09 cargando                        | duración real de la carga | igual            |
| PWA-10 después de cargar               | 45 s                      | 14 s             |
| PWA-13 listo                           | 10 s                      | 3 s              |
| **Total de app (sin la carga física)** | **≈ 3 min**               | **≈ 45 s**       |

La instalación en iPhone toma un minuto más que en Android porque son cuatro toques manuales en vez de un botón. En rutina, el rendimiento es idéntico.

El producto promete «unos 40 segundos» (texto de `PWA-03`). Esa cifra corresponde a un operador con el flujo aprendido y el medidor ya en posición; el manual debe usar ese número sin prometerlo en la primera carga.
