# Biblioteca de callouts

Cada callout se escribe **una vez** y los manuales lo referencian por ID. Si el texto de una pantalla cambia, se corrige aquí.

**Prioridades:** `Alta` = si el operador falla en esto, el registro no sirve o se pierde. `Media` = evita un error frecuente. `Baja` = contexto útil.

**Cómo leerlo:** `Elemento señalado` es lo que la flecha del callout apunta en la captura. Debe ser un elemento visible y único de la pantalla.

---

## PWA — instalación y sesión

| ID         | Pantalla | Título                                   | Texto                                                                                                                | Elemento                                  | Prioridad |
| ---------- | -------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------- |
| `C-INS-01` | PWA-15   | Instálala, no la uses desde el navegador | La app instalada guarda tus cargas de forma segura. Abierta como página web, el teléfono puede borrarlas.            | Ícono en la pantalla de inicio            | Alta      |
| `C-INS-02` | PWA-15   | En iPhone tiene que ser Safari           | Otros navegadores no pueden instalar la app. Si la abriste en Chrome, ciérrala y ábrela en Safari.                   | Barra de direcciones de Safari            | Alta      |
| `C-INS-03` | PWA-15   | Ábrela siempre desde el ícono            | Desde hoy, entra por el ícono nuevo. No vuelvas al enlace del navegador.                                             | Ícono nuevo                               | Alta      |
| `C-ENR-01` | PWA-02   | El código lo da el supervisor            | Escribe exactamente el código que te entregaron. Sirve una sola vez y vence a los 7 días.                            | Campo «Código de enrolamiento»            | Alta      |
| `C-ENR-02` | PWA-02   | Ponle nombre al teléfono                 | Escribe algo que lo identifique («Tablet almacén»). Así el supervisor sabe cuál es si hay que revocarlo.             | Campo «Nombre del dispositivo (opcional)» | Media     |
| `C-ENR-03` | PWA-02   | Esto se hace una sola vez                | Después de enrolar, el teléfono queda listo para siempre. No vuelvas a esta pantalla.                                | Botón «Enrolar»                           | Media     |
| `C-PER-01` | PWA-02   | Acepta cámara y ubicación                | La app las pide una vez. Sin cámara no puedes registrar; sin ubicación el registro queda marcado como no verificado. | Diálogo de permisos del sistema           | Alta      |

## PWA — inicio y estado

| ID         | Pantalla | Título                               | Texto                                                                              | Elemento                   | Prioridad |
| ---------- | -------- | ------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------- | --------- |
| `C-INI-01` | PWA-03   | Aquí empieza todo                    | Un solo botón. Toma unos 40 segundos registrar una carga completa.                 | Botón «Cargar combustible» | Alta      |
| `C-INI-02` | PWA-03   | Verde es que ya subió                | «Todo sincronizado» significa que el supervisor ya lo ve.                          | Chip de sincronización     | Alta      |
| `C-INI-03` | PWA-03   | «En cola» es normal                  | Si no hay señal, las cargas esperan aquí y suben solas. No las registres otra vez. | Chip «En cola: {n}»        | Alta      |
| `C-INI-04` | PWA-03   | Rojo: avisa al supervisor            | «{n} con error» significa que algo no pudo subir. Muéstrale esta pantalla.         | Chip de error              | Alta      |
| `C-INI-05` | PWA-03   | Nunca borres los datos del navegador | Ahí viven las cargas que todavía no suben. Borrarlos las pierde para siempre.      | Aviso de almacenamiento    | Alta      |
| `C-INI-06` | PWA-03   | Tus cargas del día                   | Lo que registraste hoy, con su resultado.                                          | Sección «Cargas de hoy»    | Baja      |

## PWA — identificación

| ID         | Pantalla | Título                       | Texto                                                                                      | Elemento                    | Prioridad |
| ---------- | -------- | ---------------------------- | ------------------------------------------------------------------------------------------ | --------------------------- | --------- |
| `C-EQU-01` | PWA-04   | El código está en el sticker | Busca la placa pegada a la máquina. Escribe las primeras letras y la lista se filtra sola. | Campo de búsqueda           | Alta      |
| `C-EQU-02` | PWA-05   | Confirma antes de seguir     | Si te equivocas de equipo, los galones quedan cargados a la máquina que no fue.            | Botón «Sí, es este»         | Alta      |
| `C-EQU-03` | PWA-05   | ¿No es este?                 | Toca «No, buscar otro». Cambiar de equipo más adelante borra lo que ya capturaste.         | Enlace «No, buscar otro»    | Media     |
| `C-OPE-01` | PWA-06   | Tu código, no el del equipo  | Es el número que te asignó el supervisor. Se reconoce solo, sin botón.                     | Campo «Código de conductor» | Alta      |
| `C-OPE-02` | PWA-07   | Cuatro dígitos               | Tu PIN identifica quién cargó. Funciona sin señal.                                         | Los cuatro puntos           | Alta      |
| `C-OPE-03` | PWA-07   | No compartas tu PIN          | Cada carga queda con tu nombre. Si otro lo usa, la carga sale a tu nombre.                 | Teclado numérico            | Alta      |

## PWA — captura, perfil Medidor Doble

| ID        | Pantalla | Título                                      | Texto                                                                                            | Elemento                          | Prioridad |
| --------- | -------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------- | --------- |
| `C-MD-01` | PWA-08   | Primero deja la tanda en 0.0                | Gira la perilla lateral antes de la foto. Es la prueba de que el conteo arrancó limpio.          | Campo «Tanda de arriba»           | Alta      |
| `C-MD-02` | PWA-08   | Una foto, los dos números                   | La carátula muestra tanda y totalizador juntos. Encuádralos completos.                           | Visor de la cámara                | Alta      |
| `C-MD-03` | PWA-08   | Solo cámara en vivo                         | No se puede subir una foto de la galería. Es lo que hace que la evidencia valga.                 | Pie «Solo cámara en vivo»         | Media     |
| `C-MD-04` | PWA-08   | Copia el totalizador tal cual               | El número de abajo, sin decimales. Si no coincide con lo esperado, igual puedes seguir.          | Campo «Total gallons»             | Alta      |
| `C-MD-05` | PWA-08   | Si el aviso amarillo aparece, no te bloquea | Puedes continuar. Queda anotado y el supervisor lo revisa.                                       | Aviso amarillo                    | Media     |
| `C-MD-06` | PWA-10   | Segunda foto: el cierre                     | Misma carátula, ahora con el resultado de la carga.                                              | Visor de la cámara                | Alta      |
| `C-MD-07` | PWA-10   | «Cuadra» en verde es lo que buscas          | Significa que la tanda coincide con lo que subió el totalizador.                                 | Aviso verde «Cuadra: {n} galones» | Alta      |
| `C-MD-08` | PWA-10   | Si sale en rojo, revisa los números         | Vuelve a mirar la carátula. Si están bien copiados, guarda igual: el supervisor lo verá marcado. | Aviso rojo                        | Alta      |
| `C-MD-09` | PWA-10   | El horómetro del equipo                     | Cópialo de la máquina, no de la bomba.                                                           | Campo «Horómetro del equipo»      | Media     |
| `C-MD-10` | PWA-10   | Nota obligatoria                            | Si la tanda no arrancó en 0,0 tienes que explicar por qué. Sin nota no guarda.                   | Área de nota                      | Alta      |

## PWA — captura, perfil Carga sobre Inventario

| ID        | Pantalla | Título                        | Texto                                                           | Elemento                                | Prioridad |
| --------- | -------- | ----------------------------- | --------------------------------------------------------------- | --------------------------------------- | --------- |
| `C-CI-01` | PWA-11   | Con cuántos galones llegó     | Es lo que el carrotanque ya traía antes de que Lubryco cargara. | Campo «Galones con los que llegó»       | Alta      |
| `C-CI-02` | PWA-11   | Si llegó vacío, escribe 0,0   | Cero es un valor válido. No lo dejes en blanco.                 | Campo «Galones con los que llegó»       | Alta      |
| `C-CI-03` | PWA-11   | Foto del carrotanque completo | Que se vea el vehículo y su placa.                              | Visor de la cámara                      | Alta      |
| `C-CI-04` | PWA-12   | Solo lo que despachó Lubryco  | No sumes lo que ya traía. Ese número va aparte.                 | Campo «Galones despachados por Lubryco» | Alta      |
| `C-CI-05` | PWA-12   | El total lo calcula la app    | «Total al salir» se suma solo. Nunca lo escribas a mano.        | Fila «Total al salir»                   | Alta      |
| `C-CI-06` | PWA-12   | Observaciones si algo pasó    | Campo libre y opcional: derrames, esperas, novedades.           | Campo «Observaciones (opcional)»        | Baja      |

## PWA — cierre

| ID         | Pantalla | Título                                     | Texto                                                                                  | Elemento                        | Prioridad |
| ---------- | -------- | ------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------- | --------- |
| `C-CAR-01` | PWA-09   | El cronómetro corre solo                   | Mide cuánto duró la carga. Déjalo correr mientras cargas de verdad.                    | Cronómetro                      | Media     |
| `C-CAR-02` | PWA-09   | Toca solo cuando termines                  | «Terminé de cargar» cierra el tiempo y te lleva a la segunda foto.                     | Botón «Terminé de cargar»       | Alta      |
| `C-LIS-01` | PWA-13   | Listo: ya quedó registrada                 | El número grande son los galones que quedaron registrados.                             | Cifra de galones                | Alta      |
| `C-LIS-02` | PWA-13   | Revisa el chip antes de irte               | «Cuadra» es normal. «Revisar» o «No cuadra» significa que el supervisor lo va a mirar. | Chip de estado                  | Alta      |
| `C-LIS-03` | PWA-13   | Sin señal también quedó guardada           | Se sube sola cuando vuelva la red. No la registres otra vez.                           | Aviso «Guardado en el celular»  | Alta      |
| `C-LIS-04` | PWA-13   | Este código es para soporte                | Si algo sale mal, díctale al supervisor el código que aparece aquí.                    | Texto «soporte: {id}»           | Baja      |
| `C-DIA-01` | PWA-14   | La pantalla que muestra al supervisor      | Cuando algo falle, abre esto y muéstraselo. Responde casi todas las preguntas.         | Lista de filas                  | Media     |
| `C-DIA-02` | PWA-14   | «Almacenamiento protegido» debe decir «sí» | Si dice «NO — riesgo de purga», avísale al supervisor el mismo día.                    | Fila «Almacenamiento protegido» | Alta      |

## Dashboard — supervisor

| ID         | Pantalla | Título                             | Texto                                                                                            | Elemento                         | Prioridad |
| ---------- | -------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------- | --------- |
| `C-SUP-01` | DSH-01   | Empieza por aquí cada mañana       | Una frase te dice si hay algo que atender hoy. Si está en verde, no hay nada pendiente.          | Zona «Acción de hoy»             | Alta      |
| `C-SUP-02` | DSH-01   | El número que no depende de nadie  | El totalizador no se puede resetear. Es la cifra contra la que se contrasta todo.                | Rodillo del totalizador          | Alta      |
| `C-SUP-03` | DSH-01   | Cada fila abre su evidencia        | Toca una carga para ver sus fotos y sus verificaciones.                                          | Fila de «Cargas de hoy»          | Media     |
| `C-SUP-04` | DSH-02   | Filtra por lo que no cuadra        | «No cuadran» te deja solo lo que necesita tu atención.                                           | Píldora «No cuadran»             | Alta      |
| `C-SUP-05` | DSH-02   | Descarga para contabilidad         | El archivo trae cinco hojas, con los galones como número (no texto).                             | Botón «Últimos 14 días»          | Media     |
| `C-SUP-06` | DSH-03   | Las dos fotos son la prueba        | Antes y después, tomadas en vivo con hora y ubicación.                                           | Par de fotos                     | Alta      |
| `C-SUP-07` | DSH-03   | Los tres candados                  | Verifican que la tanda arrancó en cero, que el totalizador es continuo y que las cifras cuadran. | Bloque «Verificación automática» | Alta      |
| `C-SUP-08` | DSH-03   | Un salto no es un robo             | El medidor ya contó esos galones. Lo que falta es saber a qué equipo fueron.                     | Mensaje de salto                 | Alta      |
| `C-SUP-09` | DSH-04   | Las tres cifras del inventario     | Llegó con, despachado y total al salir. La tercera la calcula el sistema.                        | Recuadro de tres cifras          | Alta      |
| `C-SUP-10` | DSH-04   | El operador nunca escribe el total | Por eso no puede cuadrarlo a conveniencia.                                                       | Leyenda bajo el recuadro         | Alta      |
| `C-SUP-11` | DSH-05   | El desvío señala, no acusa         | Un equipo fuera de patrón puede ser inyectores, filtro o un motor encendido en las esperas.      | Columna «Desvío»                 | Media     |
| `C-SUP-12` | DSH-06   | Cuándo pedir el próximo despacho   | La autonomía en días te dice si ya hay que llamar a Lubryco.                                     | Hecho «Autonomía restante»       | Alta      |

## Admin — consola de Lubryco

| ID         | Pantalla | Título                                 | Texto                                                                           | Elemento               | Prioridad |
| ---------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------- | ---------------------- | --------- |
| `C-ADM-01` | ADM-02   | El pulso de todos los clientes         | Un vistazo a la operación del día completa.                                     | Fila de indicadores    | Media     |
| `C-ADM-02` | ADM-02   | Las alertas son la lista de pendientes | Cargas que no cuadran y dispositivos sin señal por más de 24 h.                 | Panel «Alertas»        | Alta      |
| `C-ADM-03` | ADM-04   | Toda la fila abre la ficha             | No hay que buscar un botón: toca cualquier parte de la fila.                    | Fila de cliente        | Media     |
| `C-ADM-04` | ADM-04   | Crear cliente es el primer paso        | Razón social, nombre comercial, NIT y perfil. Logo y colores van después.       | Botón «Nuevo cliente»  | Alta      |
| `C-ADM-05` | ADM-05   | Solo se guardan dos colores            | El resto de la interfaz —bordes, estados, contrastes— lo deriva CuadreApp sola. | Campos de color        | Alta      |
| `C-ADM-06` | ADM-05   | El logo pesa máximo 1 MB               | PNG, JPEG o WebP. Si no hay logo, se muestran las iniciales.                    | Botón «Subir logo»     | Media     |
| `C-ADM-07` | ADM-06   | El perfil decide el flujo              | Es lo único que cambia lo que ve el operador. Nunca el nombre del cliente.      | Selector «Perfil»      | Alta      |
| `C-ADM-08` | ADM-06   | Cambiar el perfil no toca la historia  | Las cargas ya registradas conservan el perfil con el que nacieron.              | Aviso ámbar            | Alta      |
| `C-ADM-09` | ADM-07   | La operación va en cascada             | Primero la sede, después equipos y operadores, y al final el dispositivo.       | Bloque «Sedes»         | Alta      |
| `C-ADM-10` | ADM-07   | «Todas las sedes» o una sola           | Un equipo u operador puede ser compartido entre sedes o exclusivo de una.       | Selector «Sede»        | Media     |
| `C-ADM-11` | ADM-07   | El código vence en 7 días              | Un solo uso. Si se vence, genera otro.                                          | Botón «Generar código» | Alta      |
| `C-ADM-12` | ADM-11   | Revocar corta el acceso al instante    | Úsalo si se pierde un teléfono. «Reenrolar» lo revoca y da un código nuevo.     | Acción «Revocar»       | Alta      |
