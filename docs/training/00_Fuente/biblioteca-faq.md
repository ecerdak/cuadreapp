# Biblioteca de preguntas frecuentes

Escritas en el lenguaje en que se preguntan de verdad, no en el del manual. Los manuales toman de aquí las que aplican a su audiencia.

---

## Operadores — comunes a los dos perfiles

**`F-OP-01` ¿Necesito Internet para registrar una carga?**
No. La app está hecha para trabajar sin señal: ese es el caso normal, no la excepción. Lo que registras se guarda en el teléfono y sube solo cuando haya red.

**`F-OP-02` Si no hay señal, ¿la carga se perdió?**
No. Queda guardada en el teléfono y el inicio la muestra como «En cola». Cuando pases por una zona con señal, abre la app unos segundos y sube sola.

**`F-OP-03` ¿Puedo registrar la carga después, cuando vuelva a la oficina?**
No es lo mismo. Las fotos deben tomarse en el momento, frente al medidor. La app solo acepta cámara en vivo.

**`F-OP-04` ¿Por qué no me deja subir una foto de la galería?**
Porque una foto de galería puede ser de cualquier día. La cámara en vivo, con su hora y su ubicación, es lo que hace que el registro sirva como prueba.

**`F-OP-05` ¿Cuánto me toma registrar una carga?**
Unos 40 segundos si el medidor ya está en posición. El cronómetro que ves mide la carga física, no tu tiempo llenando la app.

**`F-OP-06` Me salió un aviso amarillo. ¿Hice algo mal?**
No necesariamente. Amarillo significa «esto queda anotado», no «esto está prohibido». Puedes seguir; el supervisor lo revisa.

**`F-OP-07` ¿Puedo corregir una carga que ya guardé?**
No desde el teléfono. Una carga guardada es evidencia y no se edita. Avísale al supervisor: él registra la corrección dejando rastro de ambas.

**`F-OP-08` ¿Otro operador puede usar mi teléfono?**
Sí, el teléfono es de la estación. Pero cada uno entra con su propio código y su PIN: la carga queda a nombre de quien se identificó.

**`F-OP-09` ¿Qué pasa si se me olvida el PIN?**
El supervisor lo restablece desde la consola en segundos. No hay forma de recuperarlo desde el teléfono.

**`F-OP-10` ¿Puedo borrar los datos del navegador para que el teléfono vaya más rápido?**
Nunca. Ahí viven las cargas que todavía no han subido. Borrarlos las pierde de forma definitiva.

**`F-OP-11` ¿La app me está vigilando?**
Registra la hora y la ubicación **de la carga**, no tuya. Fuera de una carga no guarda nada, y Lubryco nunca ve el detalle por operador: eso es solo del cliente.

## Operadores — perfil Medidor Doble

**`F-MD-01` ¿Por qué tengo que dejar la tanda en 0.0?**
Porque es la prueba de que el conteo de esta carga arrancó limpio. Sin eso, no se puede saber cuántos galones fueron de esta máquina.

**`F-MD-02` ¿Y si la perilla está trabada?**
Registra igual y escribe la nota que te pide la app. Queda documentado y el supervisor sabe que fue un problema mecánico, no un descuido.

**`F-MD-03` La app dice que el medidor arrancó más arriba de lo esperado. ¿Alguien robó?**
No necesariamente, y la app no lo dice. Significa que hubo una carga que no se registró. El combustible fue contado por el medidor; lo que falta es saber a qué equipo fue.

**`F-MD-04` ¿Los dos números salen en la misma foto?**
Sí. La carátula del Fill-Rite muestra la tanda arriba y el totalizador abajo. Una sola foto bien encuadrada los captura ambos.

## Operadores — perfil Carga sobre Inventario

**`F-CI-01` ¿Escribo el total al salir?**
No. Solo dos cifras: con cuántos galones llegó el carrotanque y cuántos despachó Lubryco. El total lo suma la app y no se puede editar.

**`F-CI-02` El carrotanque llegó vacío. ¿Qué escribo?**
0,0. Es un valor válido y esperado.

**`F-CI-03` ¿Por qué mi app no tiene tanda ni totalizador?**
Porque tu operación no usa el medidor doble. Cada cliente opera con el perfil que le corresponde, y el tuyo registra inventario.

**`F-CI-04` ¿Para qué sirven las observaciones?**
Para lo que no cabe en un número: una espera larga, un derrame, una novedad con el vehículo.

---

## Supervisores

**`F-SUP-01` ¿Cada cuánto debo entrar al tablero?**
Una vez al día, en la mañana. La pantalla «Hoy» te dice en una frase si hay algo que atender.

**`F-SUP-02` ¿«No cuadra» significa que alguien robó?**
No. Significa que la aritmética no cerró. Las causas más comunes son un número mal copiado o una carga que no se registró.

**`F-SUP-03` ¿Puedo editar una carga mal registrada?**
No se edita: se corrige registrando una nueva con su motivo. La original queda visible. Es lo que hace que el histórico sirva como prueba.

**`F-SUP-04` ¿La existencia del tanque es exacta?**
Es estimada por balance (entregado menos despachado), con un margen de ±2 %. No hay aforo del tanque todavía.

**`F-SUP-05` ¿Qué ve Lubryco de mi operación?**
El volumen agregado y los días de autonomía, para programar los despachos. El detalle por equipo y por operador es solo tuyo, y eso está aplicado en la base de datos, no solo en la pantalla.

**`F-SUP-06` ¿Puedo darle el tablero a mi jefe?**
Sí. Cada persona entra con su propio usuario; se solicitan al administrador de Lubryco.

**`F-SUP-07` ¿Sirve el archivo de Excel para contabilidad?**
Sí. Trae cinco hojas y los galones van como número, no como texto: se pueden sumar sin limpiar la hoja.

## Administrador

**`F-ADM-01` ¿Cómo doy de alta un cliente nuevo?**
Clientes → «Nuevo cliente» (razón social, nombre comercial, NIT y perfil). Después, en su ficha: Identidad (logo y colores) y Operación (sedes, equipos, operadores, dispositivos).

**`F-ADM-02` ¿Tengo que pedir código para un cliente nuevo?**
No. Todo se hace desde la consola, sin tocar la base de datos y sin desplegar nada.

**`F-ADM-03` ¿Qué cambia exactamente el Perfil Operativo?**
Lo que ve el operador al capturar y lo que ve el supervisor como evidencia. Es lo único que decide el flujo — nunca el nombre del cliente.

**`F-ADM-04` ¿Puedo cambiar el perfil de un cliente que ya opera?**
Sí. Las cargas ya registradas conservan el suyo y los dispositivos toman el nuevo al sincronizar. La consola te lo advierte.

**`F-ADM-05` ¿Por qué solo puedo elegir dos colores?**
Para que la identidad cambie sin que cambie la experiencia. El resto de la interfaz lo deriva CuadreApp sola, garantizando contraste y legibilidad.

**`F-ADM-06` ¿Un operador puede trabajar en varias sedes?**
Sí. Al crearlo, «Todas las sedes» lo deja disponible en todas; eligiendo una lo vuelve exclusivo de esa. Lo mismo aplica a los equipos.

**`F-ADM-07` Se perdió un teléfono. ¿Qué hago?**
Dispositivos → «Revocar», de inmediato. La sesión deja de servir en el acto.

**`F-ADM-08` ¿Cuánto dura un código de enrolamiento?**
7 días y un solo uso. Si vence, se genera otro en segundos.
