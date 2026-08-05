# OP-AND-CI · Operadores Android — perfil Carga sobre Inventario

> Fuente: [`catalogo-pantallas.md`](../00_Fuente/catalogo-pantallas.md) · [`biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md) · [`biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md) · [`biblioteca-faq.md`](../00_Fuente/biblioteca-faq.md)
> Layout: [`../05_Layouts/OP-AND-CI.md`](../05_Layouts/OP-AND-CI.md) · Checklist: [`../06_Checklists/OP-AND-CI.md`](../06_Checklists/OP-AND-CI.md) · Troubleshooting: [`../07_Troubleshooting/OP-AND-CI.md`](../07_Troubleshooting/OP-AND-CI.md) · Video: [`../08_Storyboards/OP-AND-CI.md`](../08_Storyboards/OP-AND-CI.md)

**Relación con OP-AND-MD:** comparte las páginas 1–7 y 12–14 (instalación, enrolamiento, inicio, equipo, operador, cierre y reglas). Cambian **las páginas 8 a 11**, que son la captura propia de este perfil. Si se corrige algo en las páginas compartidas, hay que corregirlo en los dos.

---

## 1. Resumen

|                        |                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Audiencia**          | Operadores que atienden carrotanques en sitio. Teléfono Android.                                                                     |
| **Objetivo**           | Registrar cuántos galones traía el carrotanque y cuántos despachó Lubryco, con las dos fotografías, en menos de un minuto.           |
| **Tiempo de lectura**  | 7 minutos                                                                                                                            |
| **Tiempo de práctica** | 1 carga acompañada (unos 4 minutos)                                                                                                  |
| **Prerrequisitos**     | Teléfono Android con Chrome · código de enrolamiento del supervisor · código de operador y PIN · saber leer la placa del carrotanque |
| **Perfil operativo**   | Carga sobre Inventario — no hay medidor de tanda ni totalizador                                                                      |
| **Páginas estimadas**  | 13                                                                                                                                   |

**Lo que este perfil NO tiene** (y conviene decirlo explícito, porque el operador puede haber visto la otra versión): no hay «Tanda de arriba», no hay «Total gallons», no hay perilla que girar y **no se escribe ningún total**.

---

## 2. Storyboard — página por página

### Página 1 · Portada

- **Título:** Registrar una carga con CuadreApp · **Subtítulo:** Guía del operador · Android
- **Pantalla:** `and-01_splash.png` · **Callouts:** ninguno
- **Texto:** «Dos fotos y dos números. El total lo calcula la app.»

### Página 2 · Instalar la app _(una sola vez)_

- **Título:** Primero: instala la app · **Pantalla:** `and-15_instalar.png`
- **Callouts:** `C-INS-01` (Alta), `C-INS-03` (Alta)
- **Texto:** abrir en Chrome → «Instalar CuadreApp» o menú ⋮ → «Agregar a la pantalla principal» → abrir siempre desde el ícono.

### Página 3 · Enrolar el teléfono _(una sola vez, con señal)_

- **Título:** Conecta el teléfono a tu operación · **Pantalla:** `and-02_enrolar.png`
- **Callouts:** `C-ENR-01` (Alta), `C-ENR-02` (Media), `C-PER-01` (Alta)

### Página 4 · La pantalla de inicio

- **Título:** Tu pantalla de todos los días · **Pantalla:** `and-03_inicio.png`
- **Callouts:** `C-INI-01` (Alta), `C-INI-02` (Alta), `C-INI-03` (Alta), `C-INI-06` (Baja)

### Página 5 · Los cinco pasos de una carga

- **Título:** Una carga son cinco pasos · **Pantalla:** diagrama `AS-DIA-02` (variante de inventario)
- **Texto:** Carrotanque → Tú → Llegada → Cargando → Despacho.

### Página 6 · Paso 1 — ¿Qué carrotanque vas a cargar?

- **Título:** Paso 1 · Elige el carrotanque
- **Pantallas:** `and-04_equipo-lista.png` y `and-05_equipo-confirma.png` (dos columnas)
- **Callouts:** `C-EQU-01` (Alta), `C-EQU-02` (Alta), `C-EQU-03` (Media)
- **Nota de lenguaje:** la app dice «equipo»; en este perfil el equipo **es el carrotanque**. El manual usa «carrotanque» y aclara la equivalencia una vez, aquí.

### Página 7 · Paso 2 — Identifícate

- **Título:** Paso 2 · Tu código y tu PIN
- **Pantallas:** `and-06_operador-codigo.png` y `and-07_operador-pin.png`
- **Callouts:** `C-OPE-01` (Alta), `C-OPE-02` (Alta), `C-OPE-03` (Alta)

### Página 8 · Paso 3 — Llegada del carrotanque ★

- **Título:** Paso 3 · Con cuántos galones llegó
- **Objetivo:** la cifra que más se equivoca — el operador tiende a anotar lo que va a cargar, no lo que ya traía.
- **Pantalla:** `and-11_llegada.png` (grande)
- **Callouts:** `C-CI-01` (Alta), `C-CI-02` (Alta), `C-CI-03` (Alta)
- **Texto:** foto del carrotanque completo → escribe con cuántos galones **llegó** → si llegó vacío, 0,0.
- **Recuadro:** ejemplo con números: «Llegó con 150 gal» — es lo que ya traía antes de que Lubryco cargara nada.

### Página 9 · Paso 4 — Cargando

- **Título:** Paso 4 · Despacha el combustible · **Pantalla:** `and-09_cargando.png`
- **Callouts:** `C-CAR-01` (Media), `C-CAR-02` (Alta)

### Página 10 · Paso 5 — Despacho ★

- **Título:** Paso 5 · Cuántos galones despachó Lubryco
- **Objetivo:** que escriba **solo lo despachado** y entienda que el total se calcula solo.
- **Pantalla:** `and-12_despacho.png` (grande)
- **Callouts:** `C-CI-04` (Alta), `C-CI-05` (Alta), `C-CI-06` (Baja)
- **Texto:** foto final → escribe solo lo que despachó Lubryco → mira cómo el total se calcula solo → guarda.

### Página 11 · La cuenta que hace la app ★

- **Título:** Por qué no escribes el total
- **Objetivo:** cerrar de raíz el error más costoso de este perfil.
- **Pantalla:** `and-12_despacho.png` recortada a la tarjeta de tres cifras
- **Callouts:** `C-CI-05` (Alta)
- **Contenido:** el ejemplo completo, en tipografía grande:

  |                        |             |
  | ---------------------- | ----------- |
  | Llegó con              | 150 gal     |
  | Despachado por Lubryco | 600 gal     |
  | **Total al salir**     | **750 gal** |

- **Texto:** «Tú escribes 150 y 600. Los 750 los calcula la app y no se pueden editar. Si el total no te cuadra, el error está en una de las dos cifras que escribiste.»

### Página 12 · Listo

- **Título:** Listo. Ya quedó registrada. · **Pantalla:** `and-13_listo.png`
- **Callouts:** `C-LIS-01` (Alta), `C-LIS-02` (Alta), `C-LIS-03` (Alta)
- **Nota:** la tarjeta de resumen muestra «Llegó con», «Despachado por Lubryco» y «Total al salir» — las mismas tres cifras de la página 11.

### Página 13 · Si algo sale distinto + reglas de oro

- **Título:** Si algo sale distinto · **Pantalla:** `and-14_diagnostico.png` (pequeña, lateral)
- **Callouts:** `C-DIA-01` (Media), `C-DIA-02` (Alta)
- **Contenido:** `E-OP-03`, `E-OP-04`, `E-OP-05`, `E-OP-08`, `E-OP-11`, `E-OP-12` + las seis reglas de oro (§6).

---

## 3. Capturas requeridas

**12 capturas.** Nueve compartidas con OP-AND-MD (se producen una sola vez) y **dos exclusivas de este perfil**.

| #   | Archivo                      | Pantalla | Compartida | Estado a capturar                                                                                              |
| --- | ---------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | `and-01_splash.png`          | PWA-01   | sí         | Splash completa                                                                                                |
| 2   | `and-15_instalar.png`        | PWA-15   | sí         | Menú ⋮ de Chrome                                                                                               |
| 3   | `and-02_enrolar.png`         | PWA-02   | sí         | Código escrito, botón amarillo                                                                                 |
| 4   | `and-03_inicio.png`          | PWA-03   | sí         | 2–3 cargas, chip sincronizado                                                                                  |
| 5   | `and-04_equipo-lista.png`    | PWA-04   | sí         | Lista filtrada                                                                                                 |
| 6   | `and-05_equipo-confirma.png` | PWA-05   | sí         | Tarjeta verde                                                                                                  |
| 7   | `and-06_operador-codigo.png` | PWA-06   | sí         | Campo vacío                                                                                                    |
| 8   | `and-07_operador-pin.png`    | PWA-07   | sí         | Dos puntos llenos                                                                                              |
| 9   | **`and-11_llegada.png`**     | PWA-11   | **no**     | Foto tomada y «150,0» escrito                                                                                  |
| 10  | `and-09_cargando.png`        | PWA-09   | sí         | Cronómetro en 01:20                                                                                            |
| 11  | **`and-12_despacho.png`**    | PWA-12   | **no**     | Foto tomada, «600,0» escrito y la tarjeta mostrando 750,0                                                      |
| 12  | `and-13_listo.png`           | PWA-13   | parcial    | **Variante:** la tarjeta debe mostrar Llegó con / Despachado / Total al salir → `and-13b_listo-inventario.png` |
| 13  | `and-14_diagnostico.png`     | PWA-14   | sí         | Valores normales                                                                                               |

**Nota de producción:** `and-13_listo.png` NO se puede compartir entre perfiles: la tarjeta de resumen es distinta. Se necesitan las dos variantes.

**Números de las capturas:** usar 150,0 / 600,0 / 750,0 en todas. Es el ejemplo canónico del producto y aparece en la documentación técnica, en las pruebas y en el manual: usar los mismos números en todas partes evita que alguien crea que son cifras distintas.

---

## 4. Callouts

**18 callouts.** Comparte con OP-AND-MD los de instalación, enrolamiento, inicio, equipo, operador, cargando, listo y diagnóstico. Los propios:

| Pantalla        | Callouts                        | Prioridad alta |
| --------------- | ------------------------------- | -------------- |
| PWA-11 llegada  | `C-CI-01`, `C-CI-02`, `C-CI-03` | 3              |
| PWA-12 despacho | `C-CI-04`, `C-CI-05`, `C-CI-06` | 2              |

---

## 5. Errores frecuentes

`E-OP-01`, `E-OP-02`, `E-OP-03`, `E-OP-04`, `E-OP-05`, **`E-OP-08`** _(propio: «¿el total lo escribo yo?»)_, `E-OP-09`, `E-OP-10`, `E-OP-11`, `E-OP-12`, `E-OP-13`, `E-OP-14`.

**No aplican:** `E-OP-06` y `E-OP-07` (son del medidor de tanda, que este perfil no usa).

---

## 6. Checklist operativo

**Antes**

1. La app está instalada (ícono, no navegador).
2. Sé la placa o el código del carrotanque.
3. Sé con cuántos galones llegó (o confirmo que llegó vacío).

**Durante** 4. Confirmé el carrotanque correcto. 5. Me identifiqué con mi código y mi PIN. 6. Tomé la foto de llegada con el vehículo completo. 7. Escribí los galones con los que **llegó**. 8. Toqué «Terminé de cargar» al terminar de verdad. 9. Tomé la foto final y escribí **solo** lo despachado por Lubryco.

**Después** 10. Verifiqué que el total al salir tenga sentido. 11. Vi el chip de resultado. 12. Si dice «En cola», abro la app unos segundos donde haya señal.

**Las seis reglas de oro**

1. Ábrela siempre desde el ícono.
2. Dos fotos: llegada y salida, con el carrotanque completo.
3. Escribes dos cifras: con cuántos llegó y cuántos despachó Lubryco.
4. El total nunca se escribe: lo calcula la app.
5. Sin señal se registra igual: nunca repitas una carga.
6. Nunca borres los datos del navegador.

---

## 7. Troubleshooting

Matriz en [`../07_Troubleshooting/OP-AND-CI.md`](../07_Troubleshooting/OP-AND-CI.md).

---

## 8. Preguntas frecuentes

`F-OP-01` a `F-OP-11` (comunes) y `F-CI-01` a `F-CI-04` (perfil). **15 preguntas.**

`F-CI-01` («¿escribo el total al salir?») debe ir **primera**: es la duda que aparece en la primera carga de todo operador nuevo de este perfil.

---

## 9. Tiempo esperado por pantalla

| Pantalla              | Primera vez   | En rutina  |
| --------------------- | ------------- | ---------- |
| PWA-15 instalación    | 2 min         | —          |
| PWA-02 enrolar        | 2 min         | —          |
| PWA-03 inicio         | 10 s          | 2 s        |
| PWA-04/05 carrotanque | 25 s          | 8 s        |
| PWA-06/07 operador    | 20 s          | 6 s        |
| PWA-11 llegada        | 30 s          | 10 s       |
| PWA-09 cargando       | duración real | igual      |
| PWA-12 despacho       | 35 s          | 12 s       |
| PWA-13 listo          | 10 s          | 3 s        |
| **Total de app**      | **≈ 2 min**   | **≈ 40 s** |

Este perfil es más rápido que Medidor Doble: dos cifras en vez de cuatro y sin perilla que girar.
