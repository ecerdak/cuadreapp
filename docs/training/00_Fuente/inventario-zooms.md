# Inventario de zooms — definitivo

Una captura completa muestra el contexto. Un zoom muestra **lo que hay que hacer**.

**Regla de existencia:** un zoom existe solo si hay una acción o una lectura asociada. Ampliar algo «para que se vea mejor», sin nada que hacer con ello, es ruido y se rechaza.

**Regla de unicidad:** cada zoom aparece **una sola vez** en este inventario, aunque lo usen varios manuales. La columna «Manuales» es lo que evita que alguien lo vuelva a recortar.

**Costo:** los zooms de captura no cuestan producción — se recortan de imágenes que ya existen o que produce el arnés. Los de fotografía salen de la misma sesión de campo.

---

## Cómo se lee

| Campo        | Qué dice                                |
| ------------ | --------------------------------------- |
| **Origen**   | De qué imagen se recorta                |
| **Zona**     | Qué parte de esa imagen                 |
| **Objetivo** | Qué tiene que lograr el lector al verlo |
| **Mensaje**  | El callout que lo acompaña              |
| **Manuales** | Dónde aparece — no se recorta dos veces |

---

## Operador · perfil Medidor Doble

| ID     | Origen            | Zona                                         | Objetivo                                | Mensaje | Manuales             |
| ------ | ----------------- | -------------------------------------------- | --------------------------------------- | ------- | -------------------- |
| `Z-01` | `F-04` foto       | La perilla lateral y la mano                 | Que se vea el gesto físico exacto       | `C-17`  | OP-AND-MD, OP-IOS-MD |
| `Z-02` | `F-02` foto       | Los dos registros de la carátula             | Distinguir cuál es cuál antes de copiar | `C-18`  | OP-AND-MD, OP-IOS-MD |
| `Z-03` | `and-08_antes`    | El recuadro del visor con la carátula dentro | Enseñar qué es «encuadrar bien»         | `C-18`  | OP-AND-MD            |
| `Z-04` | `and-08_antes`    | El campo de la tanda, ya escrito             | Mostrar el formato con coma decimal     | `C-20`  | OP-AND-MD, OP-IOS-MD |
| `Z-05` | `and-08_antes`    | El campo del totalizador, ya escrito         | Mostrar que va sin decimales            | `C-20`  | OP-AND-MD, OP-IOS-MD |
| `Z-06` | `and-08_antes`    | El aviso amarillo completo                   | Aprender que no bloquea                 | `C-21`  | OP-AND-MD, OP-IOS-MD |
| `Z-07` | `and-09_cargando` | El cronómetro                                | Confirmar que corre solo                | `C-26`  | OP-AND-MD, OP-IOS-MD |
| `Z-08` | `and-09_cargando` | El botón de terminar                         | Es el punto de no retorno del tiempo    | `C-27`  | OP-AND-MD, OP-AND-CI |
| `Z-09` | `and-10_despues`  | El aviso verde de cuadre                     | La señal de que todo salió bien         | `C-29`  | OP-AND-MD, OP-IOS-MD |
| `Z-10` | `and-10_despues`  | El aviso rojo de descuadre                   | Enseñar a no entrar en pánico           | `C-30`  | OP-AND-MD, OP-IOS-MD |
| `Z-11` | `and-10_despues`  | El campo de la nota obligatoria              | Aparece solo a veces y confunde         | `C-33`  | OP-AND-MD, OP-IOS-MD |
| `Z-12` | `F-08` foto       | El horómetro en la máquina                   | Se lee en el equipo, no en la bomba     | `C-32`  | OP-AND-MD, OP-IOS-MD |
| `Z-13` | `and-13_listo`    | El sello de resultado                        | Los tres estados posibles               | `C-38`  | OP-AND-MD, OP-IOS-MD |
| `Z-14` | `and-13_listo`    | El aviso de guardado sin señal               | Es el que evita cargas duplicadas       | `C-39`  | OP-AND-MD, OP-IOS-MD |

## Operador · perfil Carga sobre Inventario

| ID     | Origen                     | Zona                                           | Objetivo                                      | Mensaje | Manuales                     |
| ------ | -------------------------- | ---------------------------------------------- | --------------------------------------------- | ------- | ---------------------------- |
| `Z-20` | `F-21` foto                | La placa del carrotanque                       | Cómo se identifica el vehículo                | `C-10`  | OP-AND-CI, OP-IOS-CI         |
| `Z-21` | `and-11_llegada`           | El recuadro del visor con el vehículo completo | Enseñar el encuadre correcto                  | `C-25`  | OP-AND-CI, OP-IOS-CI         |
| `Z-22` | `and-11_llegada`           | El campo de llegada, ya escrito                | Es la cifra que más se confunde               | `C-23`  | OP-AND-CI, OP-IOS-CI         |
| `Z-23` | `and-12_despacho`          | El campo de despacho, ya escrito               | Solo lo que echó Lubryco                      | `C-34`  | OP-AND-CI, OP-IOS-CI         |
| `Z-24` | `and-12_despacho`          | **El bloque de las tres cifras**               | Que se vea que el total lo calcula el sistema | `C-35`  | OP-AND-CI, OP-IOS-CI, SUP-CI |
| `Z-25` | `and-09_cargando`          | El cronómetro, variante de inventario          | Compartido con Medidor Doble                  | `C-26`  | OP-AND-CI, OP-IOS-CI         |
| `Z-26` | `and-13b_listo-inventario` | El sello de resultado                          | Los tres estados                              | `C-38`  | OP-AND-CI, OP-IOS-CI         |

`Z-24` es **el zoom más importante de todo el kit** para este perfil: es la única imagen que demuestra visualmente que el operador no escribe el total.

## Operador · común a los dos perfiles

| ID     | Origen                   | Zona                                  | Objetivo                                     | Mensaje | Manuales          |
| ------ | ------------------------ | ------------------------------------- | -------------------------------------------- | ------- | ----------------- |
| `Z-40` | `F-40` foto              | El ícono instalado en el teléfono     | Por dónde entrar cada día                    | `C-01`  | Los 4 de operador |
| `Z-41` | `and-03_inicio`          | El aviso de sincronización, en verde  | El estado normal                             | `C-06`  | Los 4 de operador |
| `Z-42` | `and-03b_inicio-offline` | El aviso de sincronización, «En cola» | El más malinterpretado de la app             | `C-07`  | Los 4 de operador |
| `Z-43` | `and-03_inicio` variante | El aviso de sincronización, en rojo   | Cuándo llamar al supervisor                  | `C-08`  | Los 4 de operador |
| `Z-44` | `and-04_equipo-lista`    | El buscador con letras escritas       | Basta con las primeras letras                | `C-10`  | Los 4 de operador |
| `Z-45` | `and-05_equipo-confirma` | La tarjeta verde del equipo           | El momento de verificar contra la placa      | `C-11`  | Los 4 de operador |
| `Z-46` | `and-07_operador-pin`    | Los cuatro puntos de la clave         | Cuántos dígitos faltan                       | `C-15`  | Los 4 de operador |
| `Z-47` | `and-14_diagnostico`     | La línea de almacenamiento protegido  | La única línea que el operador debe entender | `C-42`  | Los 4 de operador |

---

## Supervisor

| ID     | Origen                        | Zona                                | Objetivo                                               | Mensaje | Manuales       |
| ------ | ----------------------------- | ----------------------------------- | ------------------------------------------------------ | ------- | -------------- |
| `Z-60` | `dsh-01_hoy`                  | El veredicto del día                | Es lo único que se lee si todo está bien               | `C-50`  | SUP-MD, SUP-CI |
| `Z-61` | `dsh-01_hoy`                  | El contador del medidor             | La cifra que no depende de nadie                       | `C-51`  | SUP-MD         |
| `Z-62` | `dsh-01_hoy`                  | Una fila de carga con su color      | Leer el semáforo                                       | `C-52`  | SUP-MD, SUP-CI |
| `Z-63` | `dsh-02_cargas`               | El filtro por estado                | Quedarse solo con lo importante                        | `C-53`  | SUP-MD, SUP-CI |
| `Z-64` | `dsh-03_evidencia-medidor`    | Las dos fotos de evidencia          | La prueba central                                      | `C-55`  | SUP-MD         |
| `Z-65` | `dsh-03_evidencia-medidor`    | Las tres verificaciones automáticas | Qué revisa la máquina por él                           | `C-56`  | SUP-MD         |
| `Z-66` | `dsh-03_evidencia-medidor`    | El mensaje de salto de totalizador  | **El zoom que evita acusaciones injustas**             | `C-57`  | SUP-MD         |
| `Z-67` | `dsh-04_evidencia-inventario` | El bloque de tres cifras            | El equivalente de las verificaciones en el otro perfil | `C-58`  | SUP-CI         |
| `Z-68` | `dsh-05_equipos`              | Una fila con desvío alto            | Cómo se ve una señal de alerta                         | `C-60`  | SUP-MD         |
| `Z-69` | `dsh-06_suministro`           | Los días de autonomía               | El disparador de la llamada a Lubryco                  | `C-61`  | SUP-MD         |
| `Z-70` | `dsh-06_suministro`           | El balance de suministro            | Dónde se ve que la existencia es estimada              | —       | SUP-MD, SUP-CI |

---

## Administrador

| ID     | Origen                       | Zona                                      | Objetivo                                  | Mensaje | Manuales |
| ------ | ---------------------------- | ----------------------------------------- | ----------------------------------------- | ------- | -------- |
| `Z-80` | `adm-02_resumen`             | El panel de alertas                       | Su lista de pendientes                    | `C-70`  | ADM      |
| `Z-81` | `adm-04_clientes`            | El selector de perfil operativo           | La decisión con más consecuencias         | `C-72`  | ADM      |
| `Z-82` | `adm-05_ficha-identidad`     | Los dos campos de color                   | La restricción que hay que saber explicar | `C-73`  | ADM      |
| `Z-83` | `adm-05_ficha-identidad`     | La vista previa de identidad              | El efecto antes de guardar                | —       | ADM      |
| `Z-84` | `adm-05_ficha-identidad`     | El bloque del logo con sus límites        | Formato y peso máximo                     | `C-74`  | ADM      |
| `Z-85` | `adm-06_ficha-configuracion` | El aviso de cambio de perfil con historia | La garantía de que nada se reinterpreta   | `C-75`  | ADM      |
| `Z-86` | `adm-07_ficha-operacion`     | El totalizador de instalación             | Número irreversible: hay que verificarlo  | `C-77`  | ADM      |
| `Z-87` | `adm-07_ficha-operacion`     | El campo del PIN                          | No se vuelve a mostrar nunca              | `C-78`  | ADM      |
| `Z-88` | `adm-07_ficha-operacion`     | El selector de sede con «Todas las sedes» | Compartido frente a exclusivo             | `C-79`  | ADM      |
| `Z-89` | `adm-07_ficha-operacion`     | El código de enrolamiento generado        | Lo que hay que dictarle al operador       | `C-80`  | ADM      |
| `Z-90` | `adm-11_dispositivos`        | Las acciones de revocar y reenrolar       | Qué hacer con un teléfono perdido         | `C-81`  | ADM      |

---

## Estado de producción

| Audiencia              | Zooms  | Origen disponible hoy   | Bloqueados |
| ---------------------- | ------ | ----------------------- | ---------- |
| Operador Medidor Doble | 14     | 2 (fotos existentes)    | 12         |
| Operador Inventario    | 7      | 0                       | 7          |
| Operador común         | 8      | 6 (capturas producidas) | 2          |
| Supervisor             | 11     | 9 (capturas producidas) | 2          |
| Administrador          | 11     | **11**                  | 0          |
| **Total**              | **51** | **28**                  | **23**     |

**28 de 51 zooms se pueden recortar hoy mismo**, porque su captura de origen ya está producida. Los 23 restantes esperan a la visita de campo o a un entorno sembrado — el detalle exacto está en [`../12_Capturas/CATALOGO.md`](../12_Capturas/CATALOGO.md).
