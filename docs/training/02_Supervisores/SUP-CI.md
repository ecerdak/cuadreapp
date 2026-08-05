# SUP-CI · Supervisores — Dashboard, perfil Carga sobre Inventario

> Fuente: [`catalogo-pantallas.md`](../00_Fuente/catalogo-pantallas.md) · [`biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md) · [`biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md) · [`biblioteca-faq.md`](../00_Fuente/biblioteca-faq.md)
> Layout: [`../05_Layouts/SUP-CI.md`](../05_Layouts/SUP-CI.md) · Checklist: [`../06_Checklists/SUP-CI.md`](../06_Checklists/SUP-CI.md) · Troubleshooting: [`../07_Troubleshooting/SUP-CI.md`](../07_Troubleshooting/SUP-CI.md) · Video: [`../08_Storyboards/SUP-CI.md`](../08_Storyboards/SUP-CI.md)

**Relación con SUP-MD:** comparte las pestañas «Hoy», «Equipos» y «Suministro». Cambia **la lectura de la evidencia**, que en este perfil no tiene tanda, totalizador ni candados: tiene tres cifras y dos fotos del carrotanque.

---

## 1. Resumen

|                       |                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Audiencia**         | Responsable de la operación en el cliente. Computador de escritorio, una vez al día.                                          |
| **Objetivo**          | Verificar que lo que salió del carrotanque corresponde con lo que Lubryco despachó, y detectar lo que no cuadra el mismo día. |
| **Tiempo de lectura** | 10 minutos                                                                                                                    |
| **Prerrequisitos**    | Usuario y contraseña del tablero                                                                                              |
| **Perfil operativo**  | Carga sobre Inventario — sin medidor de tanda                                                                                 |
| **Páginas estimadas** | 13                                                                                                                            |

**Diferencia de fondo con Medidor Doble:** allí la confianza la da la aritmética de un medidor que no se puede resetear. **Aquí la da la evidencia fotográfica más el hecho de que el operador no puede escribir el total.** El manual debe ser explícito en esto, porque un supervisor que espera los tres candados y no los encuentra concluye que el sistema es más débil — y no lo es: es distinto.

---

## 2. Storyboard — página por página

### Página 1 · Portada

- **Título:** El tablero de tu operación · **Subtítulo:** Guía del supervisor · Carga sobre Inventario
- **Pantalla:** `dsh-01_hoy.png` (a sangre, difuminada)

### Página 2 · Qué responde este tablero

- **Título:** Las tres preguntas · **Pantalla:** diagrama `AS-DIA-03`
- **Contenido:** ¿cuadraron los despachos de hoy? · ¿algún carrotanque se sale del patrón? · ¿cuándo pedir el próximo despacho?

### Página 3 · Empieza por «Hoy»

- **Título:** La pantalla de la mañana · **Pantalla:** `dsh-01_hoy.png`
- **Callouts:** `C-SUP-01` (Alta), `C-SUP-03` (Media)

### Página 4 · Las cargas del día

- **Título:** Lo que se registró hoy
- **Pantalla:** `dsh-01_hoy.png` recortada al panel inferior
- **Callouts:** `C-SUP-03` (Media)

### Página 5 · La pestaña Cargas

- **Título:** El historial de 14 días · **Pantalla:** `dsh-02_cargas.png`
- **Callouts:** `C-SUP-04` (Alta), `C-SUP-05` (Media)

### Página 6 · Leer una evidencia ★

- **Título:** Qué mirar en una carga
- **Objetivo:** la página más importante del manual.
- **Pantalla:** `dsh-04_evidencia-inventario.png` (grande, página completa)
- **Callouts:** `C-SUP-06` (Alta), `C-SUP-09` (Alta)
- **Texto:** arriba las tres cifras, abajo las dos fotos del carrotanque (llegada y salida), y la duración de la operación.

### Página 7 · Las tres cifras ★

- **Título:** Llegó con, despachado, total al salir
- **Objetivo:** que entienda de dónde sale cada número y cuál es verificable.
- **Pantalla:** `dsh-04_evidencia-inventario.png` recortada al recuadro de cifras
- **Callouts:** `C-SUP-09` (Alta), `C-SUP-10` (Alta)
- **Contenido:** tabla con el ejemplo canónico:

  | Cifra                            | Quién la pone  | Cómo se verifica                     |
  | -------------------------------- | -------------- | ------------------------------------ |
  | Llegó con · 150 gal              | El operador    | Foto de llegada del carrotanque      |
  | Despachado por Lubryco · 600 gal | El operador    | Foto de salida + remisión de Lubryco |
  | **Total al salir · 750 gal**     | **El sistema** | Es una suma: no se puede alterar     |

- **Texto:** «El operador escribe dos números y el sistema calcula el tercero. Por eso no puede cuadrar el total a conveniencia: tendría que mentir en las dos cifras a la vez y que las fotos lo respaldaran.»

### Página 8 · Por qué no hay candados aquí ★

- **Título:** Qué verifica este perfil
- **Objetivo:** desactivar la sensación de que este tablero verifica menos.
- **Pantalla:** ninguna (comparativa `AS-DIA-04`)
- **Contenido:** comparación honesta de los dos modelos:

  |                         | Medidor Doble                              | Carga sobre Inventario                         |
  | ----------------------- | ------------------------------------------ | ---------------------------------------------- |
  | Base de la verificación | Aritmética de un medidor que no se resetea | Evidencia fotográfica + total calculado        |
  | Lo verifica             | Tres candados automáticos                  | Fotos de llegada y salida + suma del sistema   |
  | Punto débil conocido    | Depende de que el operador copie bien      | Depende de la calidad de las fotos             |
  | Qué revisar tú          | Los candados en rojo                       | Que las fotos muestren el carrotanque completo |

### Página 9 · Todas las banderas

- **Título:** Qué te está diciendo cada aviso · **Pantalla:** ninguna (tabla)
- **Contenido:** las banderas aplicables a este perfil (`SIN_DESPACHO`, `EXCEDE_CAPACIDAD`, `FOTO_FALTANTE`, `FUERA_DE_SEDE`, `SIN_GPS`, `POSIBLE_DUPLICADO`, `TIEMPO_ATIPICO`) con su mensaje literal y qué hacer. **No incluir** las de tanda y totalizador: en este perfil no se emiten y ponerlas confundiría.

### Página 10 · Descargar para contabilidad

- **Título:** El archivo de Excel · **Pantalla:** `dsh-02_cargas.png` recortada a la zona de descarga
- **Callouts:** `C-SUP-05` (Media)
- **Nota:** en este perfil, las columnas de tanda y totalizador salen vacías. Es correcto, no un error del archivo.

### Página 11 · La pestaña Equipos

- **Título:** Consumo por carrotanque · **Pantalla:** `dsh-05_equipos.png`
- **Callouts:** `C-SUP-11` (Media)

### Página 12 · La pestaña Suministro

- **Título:** Cuándo pedir el próximo despacho · **Pantalla:** `dsh-06_suministro.png`
- **Callouts:** `C-SUP-12` (Alta)
- **Nota:** la existencia es estimada por balance, con margen ±2 %.

### Página 13 · Tu rutina de cinco minutos

- **Título:** Cada mañana · **Pantalla:** ninguna
- **Contenido:** el checklist de §6, formato arrancable.

---

## 3. Capturas requeridas

**5 capturas.** Cuatro compartidas con SUP-MD; **una exclusiva**.

| #   | Archivo                               | Pantalla | Compartida | Estado a capturar                                                |
| --- | ------------------------------------- | -------- | ---------- | ---------------------------------------------------------------- |
| 1   | `dsh-01_hoy.png`                      | DSH-01   | sí         | Con una carga marcada                                            |
| 2   | `dsh-02_cargas.png`                   | DSH-02   | sí         | Filtro «Todas», fila seleccionada                                |
| 3   | **`dsh-04_evidencia-inventario.png`** | DSH-04   | **no**     | Con 150 / 600 / 750, las dos fotos del carrotanque y la duración |
| 4   | `dsh-05_equipos.png`                  | DSH-05   | sí         | Con un desvío alto                                               |
| 5   | `dsh-06_suministro.png`               | DSH-06   | sí         | Autonomía en ámbar                                               |

**Requisito de datos:** la captura 3 exige que el escenario de demostración del Dashboard tenga al menos una carga del perfil inventario. Hoy el escenario simulado es solo Medidor Doble — **es un prerrequisito de producción de esta captura**, anotado en `09_Exports/indice-general.md` como bloqueante.

**Recortes:** panel de cargas de hoy, recuadro de tres cifras, zona de descarga. **3 recortes.**

---

## 4. Callouts

**8 callouts:** `C-SUP-01`, `C-SUP-03`, `C-SUP-04`, `C-SUP-05`, `C-SUP-06`, `C-SUP-09`, `C-SUP-10`, `C-SUP-11`, `C-SUP-12`.

**No aplican:** `C-SUP-02` (totalizador), `C-SUP-07` (candados), `C-SUP-08` (salto de totalizador) — son de Medidor Doble.

---

## 5. Errores frecuentes

`E-SUP-02` (falta la foto final) · `E-SUP-03` (desvío alto) · `E-SUP-04` (el operador no ve un equipo nuevo) · `E-SUP-05` (los números no cuadran con mi conteo).

**No aplica:** `E-SUP-01` en su forma de salto de totalizador. En este perfil, «No cuadra» se debe casi siempre a despacho en cero o a falta de fotos.

---

## 6. Checklist operativo

**Antes (una vez)**

1. Entré al tablero y cambié la contraseña provisional.
2. Confirmé que el cliente y la sede que veo son los míos.
3. Entiendo que el total al salir lo calcula el sistema, no el operador.

**Cada mañana (5 minutos)** 4. Abro «Hoy» y leo la frase de arriba. 5. Abro las cargas marcadas y reviso sus dos fotos. 6. Verifico que las tres cifras tengan sentido entre sí. 7. Si falta una foto, hablo con el operador **hoy**.

**Cada semana** 8. Reviso «Equipos» y anoto desvíos ≥15 %. 9. Reviso «Suministro» y aviso a Lubryco si la autonomía baja de 7 días. 10. Descargo el Excel de 14 días.

---

## 7. Troubleshooting

Matriz en [`../07_Troubleshooting/SUP-CI.md`](../07_Troubleshooting/SUP-CI.md).

---

## 8. Preguntas frecuentes

`F-SUP-01`, `F-SUP-03` a `F-SUP-07`, más una propia del perfil:

**¿Cómo sé que el operador no infló los galones despachados?**
Porque la cifra tiene que coincidir con la remisión de Lubryco (pestaña Suministro) y con las dos fotos del carrotanque. Y porque el total al salir lo calcula el sistema: para cuadrar una mentira tendría que mentir en las dos cifras a la vez y que las fotos lo respaldaran.

**Adaptación de `F-SUP-02`:** en este perfil, «No cuadra» significa casi siempre despacho en cero o falta de fotografías, no un salto de medidor.

---

## 9. Tiempo esperado por pantalla

| Pantalla                     | Primera vez | En rutina diaria |
| ---------------------------- | ----------- | ---------------- |
| DSH-01 Hoy                   | 3 min       | 1 min            |
| DSH-02 Cargas (lista)        | 2 min       | 1 min            |
| DSH-04 Evidencia (por carga) | 2 min       | 30 s             |
| DSH-05 Equipos               | 3 min       | 1 min (semanal)  |
| DSH-06 Suministro            | 3 min       | 1 min (semanal)  |
| **Rutina diaria completa**   | —           | **≈ 4 min**      |

Más rápido que Medidor Doble: la evidencia son tres cifras y dos fotos, sin candados que interpretar.
