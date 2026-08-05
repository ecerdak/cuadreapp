# Biblioteca de errores frecuentes y troubleshooting

Cada entrada tiene **causa**, **solución** y **qué NO hacer** — esa última columna es la que evita que un problema pequeño se vuelva pérdida de datos.

Los manuales referencian por ID. Las matrices por audiencia viven en `07_Troubleshooting/`.

---

## Operadores — antes de empezar

### `E-OP-01` · «No me aparece el botón de instalar»

- **Causa:** en iPhone ese botón no existe (Apple no lo permite); en Android, a veces Chrome no lo ofrece si ya se descartó antes.
- **Solución:** iPhone → Safari → Compartir → «Añadir a pantalla de inicio». Android → menú ⋮ → «Agregar a la pantalla principal».
- **Qué NO hacer:** seguir usando la app desde el navegador. Sin instalar, el teléfono puede borrar las cargas que no han subido.

### `E-OP-02` · «El código de enrolamiento no funciona»

- **Causa:** el código ya se usó (sirve una sola vez), venció (7 días) o se escribió con un carácter de más.
- **Solución:** pedirle al supervisor uno nuevo. Se genera en segundos desde la consola.
- **Qué NO hacer:** probar códigos viejos repetidamente ni pedirle el código a otro operador — cada teléfono necesita el suyo.

### `E-OP-03` · «La cámara no abre»

- **Causa:** el permiso de cámara quedó denegado en la primera pregunta.
- **Solución:** ajustes del teléfono → la app → Permisos → Cámara → Permitir. Después cerrar y volver a abrir la app.
- **Qué NO hacer:** tomar la foto con la cámara del teléfono e intentar subirla. La app solo acepta cámara en vivo, y esa es justamente la razón por la que la evidencia vale.

---

## Operadores — durante la carga

### `E-OP-04` · «No encuentro el equipo en la lista»

- **Causa:** el equipo no está dado de alta, está inactivo, o pertenece a otra sede.
- **Solución:** buscar por las primeras letras del código del sticker. Si no aparece, avisar al supervisor: se da de alta en la consola en un minuto.
- **Qué NO hacer:** registrar la carga con otro equipo «parecido». Esos galones quedarían cargados a la máquina equivocada y el desvío aparecería en el equipo que no fue.

### `E-OP-05` · «Dice Código o PIN incorrecto»

- **Causa:** el código de operador o el PIN están mal, o el operador fue desactivado.
- **Solución:** verificar el código (es el del operador, no el del equipo). Si el PIN se olvidó, el supervisor lo restablece desde la consola («Editar / PIN»).
- **Qué NO hacer:** usar el código y el PIN de un compañero. La carga quedaría a nombre de otra persona.

### `E-OP-06` · «El medidor no está en 0.0 y no puedo girarlo» _(solo Medidor Doble)_

- **Causa:** la perilla lateral no volvió a cero, o está trabada.
- **Solución:** seguir con el registro. La app avisa pero **no bloquea**: pide una nota explicando por qué. Escribirla y continuar.
- **Qué NO hacer:** inventar un 0,0 que no es. La foto muestra el número real y la contradicción quedaría en evidencia.

### `E-OP-07` · «Los números no cuadran» _(solo Medidor Doble)_

- **Causa:** la tanda no coincide con lo que subió el totalizador — normalmente un dígito mal copiado.
- **Solución:** volver a mirar la carátula y corregir. Si están bien copiados, guardar igual: queda marcado y el supervisor lo revisa.
- **Qué NO hacer:** ajustar un número «para que cuadre». El sistema existe justamente para detectar eso.

### `E-OP-08` · «¿El total al salir lo escribo yo?» _(solo Carga sobre Inventario)_

- **Causa:** confusión habitual al pasar del papel a la app.
- **Solución:** no. Solo se escriben dos cifras: con cuántos llegó y cuántos despachó Lubryco. El total lo suma la app.
- **Qué NO hacer:** buscar dónde escribirlo. No hay campo, y es a propósito.

### `E-OP-09` · «Me equivoqué de equipo y ya avancé»

- **Causa:** confirmación apresurada.
- **Solución:** usar «← Atrás» hasta la pantalla de equipo. La app avisa que se borrarán conductor, lecturas y fotos de esa carga, y pide confirmar.
- **Qué NO hacer:** guardar la carga mal y «arreglarla después». Una carga guardada no se edita: solo se corrige con otra carga y motivo.

### `E-OP-10` · «Se cerró la app a mitad de la carga»

- **Causa:** el sistema operativo cerró la app, o se apagó el teléfono.
- **Solución:** volver a abrirla. La captura en curso se restaura donde quedó (el Diagnóstico lo confirma en «Captura en curso guardada»).
- **Qué NO hacer:** empezar de cero sin mirar: se generaría una carga duplicada.

---

## Operadores — después de guardar

### `E-OP-11` · «No hay Internet»

- **Causa:** la planta no tiene señal — es la situación normal, no la excepción.
- **Solución:** ninguna. Registrar igual: la carga se guarda en el teléfono y sube sola cuando vuelva la red. El inicio lo muestra como «En cola: {n}».
- **Qué NO hacer:** repetir la carga «por si acaso», ni esperar a tener señal para registrar. Se duplicaría el registro.

### `E-OP-12` · «Dice En cola y no baja de ahí»

- **Causa:** la app necesita estar abierta unos segundos con señal para subir.
- **Solución:** al llegar a una zona con señal, abrir la app y esperar unos segundos con la pantalla encendida.
- **Qué NO hacer:** desinstalar y reinstalar la app. Eso sí borra la cola definitivamente.

### `E-OP-13` · «Dice {n} con error — avisa al supervisor»

- **Causa:** el servidor rechazó el registro de forma definitiva (por ejemplo, un equipo que fue eliminado).
- **Solución:** abrir «Diagnóstico del dispositivo» y mostrarle esa pantalla al supervisor. Trae el último error.
- **Qué NO hacer:** ignorarlo por días. Esos galones no están contabilizados.

### `E-OP-14` · «Almacenamiento protegido dice NO»

- **Causa:** el navegador no garantizó la persistencia (más frecuente en iPhone).
- **Solución:** avisar al supervisor el mismo día y no dejar cargas sin subir de un día para otro.
- **Qué NO hacer:** borrar datos del navegador, limpiar «archivos basura» con apps de limpieza, ni usar modo incógnito.

---

## Supervisores

### `E-SUP-01` · «Una carga aparece como No cuadra»

- **Causa:** el dominio marcó una inconsistencia — la más común es un salto de totalizador.
- **Solución:** abrir su evidencia, mirar las dos fotos y los tres candados. El mensaje explica en lenguaje llano qué pasó.
- **Qué NO hacer:** asumir robo. Un salto significa que el medidor ya contó esos galones y falta saber a qué equipo fueron.

### `E-SUP-02` · «Falta la foto final de una carga»

- **Causa:** el operador cerró el registro sin capturar la segunda foto (la app lo permite marcándolo).
- **Solución:** hablar con el operador el mismo día, mientras recuerda la carga.
- **Qué NO hacer:** dejarlo para el cierre de mes. La foto no se puede recuperar después.

### `E-SUP-03` · «Un equipo tiene un desvío alto»

- **Causa:** consumo fuera de su patrón histórico.
- **Solución:** revisarlo como señal de mantenimiento antes que como sospecha: inyectores, filtros, o motor encendido durante las esperas.
- **Qué NO hacer:** acusar a un operador con el desvío como única prueba.

### `E-SUP-04` · «El operador no ve un equipo nuevo»

- **Causa:** el catálogo del teléfono se descarga con señal; si el equipo se creó después, el teléfono aún no lo tiene.
- **Solución:** que el operador abra la app con señal unos segundos. El catálogo se refresca solo.
- **Qué NO hacer:** re-enrolar el dispositivo. Es innecesario y borra la sesión.

### `E-SUP-05` · «Los números del tablero no cuadran con mi conteo»

- **Causa:** la existencia es **estimada por balance** (entregado − despachado), no medida con aforo del tanque.
- **Solución:** contrastar con las remisiones de Lubryco en la pestaña Suministro. El margen esperado es ±2 %.
- **Qué NO hacer:** tratar la existencia estimada como una medición física.

---

## Administrador

### `E-ADM-01` · «El cliente no ve su logo o sus colores»

- **Causa:** el dispositivo o el navegador tienen la configuración anterior en caché.
- **Solución:** en la PWA, abrir con señal para que refresque el catálogo. En el Dashboard, recargar.
- **Qué NO hacer:** volver a subir el logo varias veces.

### `E-ADM-02` · «Rechaza el color que puse»

- **Causa:** solo se aceptan colores en formato `#RRGGBB` (seis dígitos hexadecimales).
- **Solución:** usar el selector de color, que siempre entrega el formato correcto.
- **Qué NO hacer:** intentar nombres de color («rojo») o expresiones CSS. Están rechazados por diseño.

### `E-ADM-03` · «Cambié el perfil y la historia se ve rara»

- **Causa:** no es un error. Cada carga conserva el perfil con el que se registró.
- **Solución:** ninguna. Las cargas viejas se muestran con su formato original y las nuevas con el nuevo.
- **Qué NO hacer:** intentar «migrar» cargas viejas. La historia es evidencia y no se reinterpreta.

### `E-ADM-04` · «El dispositivo del cliente dejó de funcionar»

- **Causa:** se revocó, se re-enroló, o el usuario técnico quedó inactivo.
- **Solución:** en Dispositivos, «Reenrolar» genera un código nuevo y revoca el anterior en un paso.
- **Qué NO hacer:** borrar el cliente o su sede para «empezar limpio». Eso arrastra su historia.

### `E-ADM-05` · «Se perdió un teléfono de planta»

- **Causa:** extravío o robo.
- **Solución:** «Revocar» en Dispositivos, de inmediato. La sesión deja de servir en el acto.
- **Qué NO hacer:** esperar a recuperarlo. Las cargas sin subir de ese teléfono se pierden, pero el acceso se corta ya.
