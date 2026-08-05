# Biblioteca de callouts — lenguaje de operador

**Reescrita por completo en T2.** Los callouts de T1 nombraban elementos de interfaz; estos dan instrucciones.

| ❌ Como estaba (T1)      | ✅ Como debe estar (T2)                                    |
| ------------------------ | ---------------------------------------------------------- |
| «Campo Totalizador»      | «Escriba exactamente el número que aparece en el medidor.» |
| «Chip de sincronización» | «Verde quiere decir que su supervisor ya lo vio.»          |
| «Botón "Sí, es este"»    | «Mire la placa de la máquina antes de tocar aquí.»         |
| «Área de nota»           | «Escriba por qué no pudo dejarlo en cero. Con eso basta.»  |

## Las cinco reglas de escritura

1. **Verbo primero, en imperativo.** «Tome la foto», nunca «se debe tomar la fotografía».
2. **Cero nombres de interfaz.** Ni «campo», ni «botón», ni «chip», ni «pantalla». Si el callout necesita esas palabras, está describiendo el producto en vez de enseñar el trabajo.
3. **Una sola idea.** Si tiene una coma que junta dos instrucciones, son dos callouts.
4. **Máximo 15 palabras.** Se lee de pie, con guantes y a pleno sol.
5. **Decir la consecuencia, no la regla.** «Si se equivoca de máquina, esos galones quedan cargados a otra» funciona; «es importante seleccionar correctamente el equipo» no.

**Prioridades:** `Alta` = si falla, el registro no sirve o se pierde. `Media` = evita un error frecuente. `Baja` = contexto útil.

---

## Momento `M-*-00` · Antes de salir a trabajar

| ID     | Callout                                                                 | Dónde señala                         | Prioridad |
| ------ | ----------------------------------------------------------------------- | ------------------------------------ | --------- |
| `C-01` | Abra siempre desde este ícono. Nunca desde el navegador.                | El ícono en la pantalla del teléfono | Alta      |
| `C-02` | En iPhone hay que hacerlo desde Safari. Con otro navegador no se puede. | La barra de Safari                   | Alta      |
| `C-03` | Este código se lo da su supervisor y sirve una sola vez.                | Donde se escribe el código           | Alta      |
| `C-04` | Diga que sí a la cámara y a la ubicación. Sin eso no puede registrar.   | El aviso del teléfono                | Alta      |
| `C-05` | Póngale un nombre al teléfono para que su supervisor sepa cuál es.      | Donde se escribe el nombre           | Media     |
| `C-06` | Verde quiere decir que su supervisor ya lo vio.                         | El aviso de arriba a la derecha      | Alta      |
| `C-07` | «En cola» es normal cuando no hay señal. Sube solo. No repita la carga. | El mismo aviso                       | Alta      |
| `C-08` | Si aparece algo en rojo, muéstrele esta pantalla a su supervisor.       | El mismo aviso                       | Alta      |
| `C-09` | Nunca borre los datos del navegador: ahí están las cargas sin subir.    | El aviso de advertencia              | Alta      |

## Momento `M-*-01` · Llega el equipo o el carrotanque

| ID     | Callout                                                         | Dónde señala          | Prioridad |
| ------ | --------------------------------------------------------------- | --------------------- | --------- |
| `C-10` | Escriba las primeras letras del código del sticker.             | Donde se busca        | Alta      |
| `C-11` | Mire la placa de la máquina antes de tocar aquí.                | El botón de confirmar | Alta      |
| `C-12` | ¿No es esta? Búsquela otra vez ahora, no después.               | El enlace para volver | Media     |
| `C-13` | Si se equivoca de máquina, esos galones quedan cargados a otra. | La tarjeta del equipo | Alta      |

## Momento de identificación _(dentro de `M-*-02`)_

| ID     | Callout                                                    | Dónde señala               | Prioridad |
| ------ | ---------------------------------------------------------- | -------------------------- | --------- |
| `C-14` | Su número, no el de la máquina.                            | Donde se escribe el código | Alta      |
| `C-15` | Sus cuatro dígitos. Funciona aunque no haya señal.         | Los cuatro puntos          | Alta      |
| `C-16` | No le preste su clave a nadie: la carga queda a su nombre. | El teclado                 | Alta      |

## Momento `M-MD-02` · Antes de abrir la manguera

| ID     | Callout                                                             | Dónde señala                        | Prioridad |
| ------ | ------------------------------------------------------------------- | ----------------------------------- | --------- |
| `C-17` | Gire la perilla hasta que arriba diga 0.0. Hágalo antes de la foto. | La perilla, en la foto real         | Alta      |
| `C-18` | Que se vean los dos números completos dentro del recuadro.          | El visor                            | Alta      |
| `C-19` | Tiene que ser foto del momento. No sirve una de la galería.         | El pie del visor                    | Media     |
| `C-20` | Escriba exactamente el número que aparece en el medidor.            | Donde se escribe el número de abajo | Alta      |
| `C-21` | Si sale un aviso amarillo, siga. Queda anotado y nadie lo culpa.    | El aviso amarillo                   | Alta      |
| `C-22` | Si el vidrio refleja, muévase de lado o tápelo con el cuerpo.       | La carátula, en la foto real        | Media     |

## Momento `M-CI-02` · Cuánto traía el carrotanque

| ID     | Callout                                                       | Dónde señala               | Prioridad |
| ------ | ------------------------------------------------------------- | -------------------------- | --------- |
| `C-23` | Cuántos galones traía **antes** de que ustedes cargaran nada. | Donde se escribe el número | Alta      |
| `C-24` | Si llegó vacío escriba 0,0. No lo deje en blanco.             | El mismo lugar             | Alta      |
| `C-25` | Que se vea el carrotanque entero y su placa.                  | El visor                   | Alta      |

## Momento `M-*-03` · Está saliendo el combustible

| ID     | Callout                                                       | Dónde señala         | Prioridad |
| ------ | ------------------------------------------------------------- | -------------------- | --------- |
| `C-26` | El reloj corre solo. Guarde el teléfono y vigile la manguera. | El cronómetro        | Media     |
| `C-27` | Toque aquí solo cuando haya terminado de verdad.              | El botón de terminar | Alta      |

## Momento `M-MD-04` · Se cerró la manguera

| ID     | Callout                                                                    | Dónde señala          | Prioridad |
| ------ | -------------------------------------------------------------------------- | --------------------- | --------- |
| `C-28` | Otra foto de la misma carátula, ahora con el resultado.                    | El visor              | Alta      |
| `C-29` | Si sale verde, quedó bien. Ya puede guardar.                               | El aviso verde        | Alta      |
| `C-30` | Si sale rojo, vuelva a mirar la carátula y corrija.                        | El aviso rojo         | Alta      |
| `C-31` | Si los números están bien copiados, guarde igual. Su supervisor lo revisa. | El botón de guardar   | Alta      |
| `C-32` | Este número se lee en la máquina, no en la bomba.                          | Donde va el horómetro | Media     |
| `C-33` | Escriba por qué no pudo dejarlo en cero. Con eso basta.                    | El espacio de la nota | Alta      |

## Momento `M-CI-04` · Cuánto despachó Lubryco

| ID     | Callout                                                         | Dónde señala                | Prioridad |
| ------ | --------------------------------------------------------------- | --------------------------- | --------- |
| `C-34` | Solo lo que ustedes le echaron. No sume lo que ya traía.        | Donde se escribe el número  | Alta      |
| `C-35` | Este número lo saca la aplicación sola. Usted nunca lo escribe. | La línea del total          | Alta      |
| `C-36` | Si pasó algo raro, escríbalo aquí. Es opcional.                 | El espacio de observaciones | Baja      |

## Momento `M-*-05` · Quedó registrada

| ID     | Callout                                                           | Dónde señala          | Prioridad |
| ------ | ----------------------------------------------------------------- | --------------------- | --------- |
| `C-37` | Estos son los galones que quedaron registrados.                   | La cifra grande       | Alta      |
| `C-38` | Si dice «Revisar» o «No cuadra», coménteselo hoy a su supervisor. | El sello de resultado | Alta      |
| `C-39` | Sin señal también quedó guardada. Sube sola. No la repita.        | El aviso de guardado  | Alta      |
| `C-40` | Si algo falla, díctele este código a su supervisor.               | El código de soporte  | Baja      |

## Momentos de excepción

| ID     | Callout                                                                | Dónde señala               | Prioridad |
| ------ | ---------------------------------------------------------------------- | -------------------------- | --------- |
| `C-41` | Cuando algo falle, abra esto y muéstreselo a su supervisor.            | La lista de datos          | Media     |
| `C-42` | Aquí debe decir «sí». Si dice «NO», avísele hoy mismo a su supervisor. | La línea de almacenamiento | Alta      |

---

## Supervisor

| ID     | Callout                                                                   | Dónde señala              | Prioridad |
| ------ | ------------------------------------------------------------------------- | ------------------------- | --------- |
| `C-50` | Lea esta frase. Si está en verde, ya terminó por hoy.                     | El veredicto de arriba    | Alta      |
| `C-51` | Este número no lo puede resetear nadie. Todo se compara contra él.        | El contador del medidor   | Alta      |
| `C-52` | Toque cualquier carga para ver sus fotos.                                 | Una fila de la lista      | Media     |
| `C-53` | Filtre por «No cuadran» y quédese solo con lo que importa.                | El filtro                 | Alta      |
| `C-54` | Descargue esto para contabilidad: los galones salen como número.          | El botón de descarga      | Media     |
| `C-55` | Estas dos fotos son la prueba. Tienen hora y lugar.                       | El par de fotos           | Alta      |
| `C-56` | Estas tres verificaciones las hace la máquina por usted.                  | El bloque de verificación | Alta      |
| `C-57` | Un salto no significa robo: falta saber a qué equipo fueron esos galones. | El mensaje de salto       | Alta      |
| `C-58` | Llegó con, se le echó, y salió con. La tercera la calcula el sistema.     | El recuadro de cifras     | Alta      |
| `C-59` | El operador no escribe el total: por eso no lo puede acomodar.            | La línea del total        | Alta      |
| `C-60` | Un consumo alto suele ser mantenimiento antes que otra cosa.              | La columna de desvío      | Media     |
| `C-61` | Si esto baja de 7 días, llame a Lubryco.                                  | Los días de autonomía     | Alta      |

## Administrador

| ID     | Callout                                                               | Dónde señala                  | Prioridad |
| ------ | --------------------------------------------------------------------- | ----------------------------- | --------- |
| `C-70` | Esta es su lista de pendientes del día.                               | El panel de alertas           | Alta      |
| `C-71` | Toque cualquier parte de la fila para abrir el cliente.               | Una fila                      | Media     |
| `C-72` | Elija bien el perfil: decide lo que verá el operador mañana.          | El selector de perfil         | Alta      |
| `C-73` | Solo dos colores. El resto lo arma CuadreApp para que siempre se lea. | Los colores                   | Alta      |
| `C-74` | Máximo 1 MB. Sin logo se muestran las iniciales del cliente.          | El logo                       | Media     |
| `C-75` | Cambiar el perfil no toca lo ya registrado.                           | El aviso amarillo             | Alta      |
| `C-76` | Primero la sede. Sin sede no se puede crear nada más.                 | El bloque de sedes            | Alta      |
| `C-77` | Verifique este número contra el medidor físico antes de guardar.      | El totalizador de instalación | Alta      |
| `C-78` | Anote el PIN ahora: no se vuelve a mostrar nunca.                     | El PIN                        | Alta      |
| `C-79` | «Todas las sedes» o solo una. Puede cambiarlo después.                | El selector de sede           | Media     |
| `C-80` | Este código vence en 7 días y sirve una sola vez.                     | El código generado            | Alta      |
| `C-81` | Si se perdió un teléfono, revóquelo ya. Deja de servir al instante.   | La acción de revocar          | Alta      |

---

## Nota de trazabilidad

Los IDs de T1 (`C-INS-01`, `C-MD-04`, `C-SUP-08`…) **quedaron sin efecto**: la numeración nueva es correlativa y agrupada por momento, no por pantalla. No hay tabla de equivalencias a propósito — mantenerla invitaría a copiar los textos viejos, que es justamente lo que esta etapa corrige.
