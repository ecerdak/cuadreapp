# Controlar lo que Lubryco entrega

## Curso para usuarios del Dashboard del cliente · operación de carga sobre inventario

> `SUP-CI` · Momentos: [`catalogo-momentos.md`](../00_Fuente/catalogo-momentos.md) · Callouts: [`biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md) · Zooms: [`inventario-zooms.md`](../00_Fuente/inventario-zooms.md)
> Layout: [`../05_Layouts/SUP-CI.md`](../05_Layouts/SUP-CI.md) · Quick Guide: [`../10_QuickGuides/QG-SUP-CI.md`](../10_QuickGuides/QG-SUP-CI.md) · Video: [`../08_Storyboards/SUP-CI.md`](../08_Storyboards/SUP-CI.md)

---

## Para quién es esto

Para quien responde por lo que Lubryco entregó y por lo que se llevó cada carrotanque: gerente general, de operaciones o de mantenimiento, supervisor o administrador del cliente. Si su empresa le dio un acceso al Dashboard, este curso es suyo.

**Al terminar este curso usted podrá:** cerrar el día en cinco minutos, sustentar cada galón facturado con una fotografía, y saber cuándo una diferencia es un error de digitación y cuándo merece una llamada.

**Tiempo:** 22 minutos.

---

## Lo que esta operación sí demuestra y lo que no

Antes de mirar una sola pantalla, hay que tener claro qué prueba esta información:

| Sí demuestra                                                             | No demuestra                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Que un carrotanque específico estuvo en la estación ese día y a esa hora | Cuánto combustible hay hoy en el tanque de la estación       |
| Cuántos galones dijo el operador que entregó Lubryco                     | El nivel medido de ningún tanque                             |
| Cómo quedó el carrotanque al salir, según lo registrado                  | Que el carrotanque haya llegado realmente con lo que declaró |
| Quién registró la carga y desde qué teléfono                             | Que no haya habido trasiegos fuera del proceso               |

**Este es el punto que más se malinterpreta.** El registro es de despacho, no de aforo. Un curso que prometa lo segundo lo va a poner a usted en un problema.

---

## Cómo está organizado

```
RECIBÍ MIS CREDENCIALES              →  Decisión 0
¿HAY ALGO QUE ATENDER HOY?           →  Decisión 1
UNA CARGA QUEDÓ MARCADA              →  Decisión 2
FALTA UNA FOTOGRAFÍA                 →  Decisión 3
LOS GALONES NO COINCIDEN CON LA GUÍA →  Decisión 4
¿CUÁNTO LLEVAMOS ENTREGADO?          →  Decisión 5
ME PIDEN SUSTENTAR UNA ENTREGA       →  Decisión 6
CONTABILIDAD PIDE LOS DATOS          →  Decisión 7
EL TABLERO ESTÁ EN BLANCO            →  Decisión 8
NO PUEDO ENTRAR                      →  Decisión 9
```

---

# Decisión 0 · Recibí mis credenciales

> Momento `S-00` · Una sola vez · 2 minutos

### Si ve esto

Un mensaje de su empresa (o de Lubryco) con tres cosas: el enlace del Dashboard, su usuario (su correo) y una **contraseña temporal**.
· Capturas `dsh-07_entrar.png`, `dsh-08_crear-contrasena.png` · Callouts `C-62`, `C-63`

### Qué significa

Le crearon su acceso personal. La contraseña temporal es un pase de entrada, no una llave: **sirve para entrar UNA sola vez**. Al usarla, el Dashboard le pedirá crear su contraseña propia —mínimo 10 caracteres— antes de mostrarle nada. La suya no la conoce nadie más, ni quien se la creó.

### Qué decisión tomar

Entre el mismo día. Abra el enlace, escriba su correo y la temporal, y cuando aparezca «Crea tu contraseña», defina la suya y guárdela donde usted guarda sus contraseñas. Desde ese momento la temporal deja de existir.

Si más adelante quiere cambiarla: el enlace «Cambiar contraseña» está siempre en la parte superior del tablero.

### Qué NO hacer

- **No** comparta su acceso con un compañero. Cada cuenta es personal: es lo que permite saber quién vio qué, y revocar una sin tocar las demás.
- **No** guarde la temporal «por si acaso»: después del primer ingreso ya no sirve para nada.
- **No** se preocupe si tarda unos días en entrar y la temporal «ya no funciona» a la primera: pida una nueva a quien administra los accesos — se genera en un minuto.

---

# Decisión 1 · ¿Hay algo que deba atender hoy?

> Momento `S-01` · Cada mañana · 1 minuto

### Si ve esto

Una frase arriba de todo, en verde, ámbar o rojo.
· Captura `dsh-01_hoy.png` · Zoom `Z-60`

### Qué significa

| Color     | Significa                                                |
| --------- | -------------------------------------------------------- |
| **Verde** | Todas las cargas de hoy quedaron completas y coherentes. |
| **Ámbar** | Hay algo anotado que conviene mirar.                     |
| **Rojo**  | Al menos una carga quedó incompleta o incoherente.       |

### Qué debe revisar

Si está en verde: nada más. Si no: la lista de cargas de hoy.

### Qué decisión tomar

Verde → siga con su día. Ámbar o rojo → Decisión 2.

### A quién llamar

A nadie todavía.

### Qué NO hacer

- **No** abra las cargas una por una cuando el veredicto está en verde.
- **No** deje un rojo para mañana: el operador ya no va a recordar ese carrotanque.

---

# Decisión 2 · Una carga quedó marcada

> Momento `S-02` · Cuando aparece · 3 minutos por carga

### Si ve esto

Una carga con sello **«No cuadra»** o **«Revisar»**.
· Capturas `dsh-02_cargas.png`, `dsh-04_evidencia-inventario.png` · Zooms `Z-63`, `Z-67`

### Qué significa

En esta operación la marca casi siempre viene de una de tres cosas:

1. **Despacho en cero** — se registró una carga de 0,0 galones. A veces es real (el carrotanque se fue sin cargar), y siempre hay que confirmarlo.
2. **Falta una fotografía** — la de llegada o la final.
3. **Un número fuera de rango** — una cifra que no se parece a nada de lo que ese vehículo suele llevar.

### Qué debe revisar

El recuadro de las tres cifras, que es donde se ve todo de un vistazo:

|                        |                                           |
| ---------------------- | ----------------------------------------- |
| Llegó con              | lo que el operador anotó al empezar       |
| Despachado por Lubryco | lo que el operador anotó al terminar      |
| **Total al salir**     | **calculado por el sistema, no editable** |

**Nadie escribió la tercera cifra.** No hay forma de que el total esté «inflado» a mano: si algo está mal, está en una de las dos primeras, y las dos tienen su fotografía.

### Qué decisión tomar

| Lo que encuentra                           | Decisión                                                          |
| ------------------------------------------ | ----------------------------------------------------------------- |
| Despacho en 0,0 y el operador lo confirma  | Correcto. La carga queda como constancia de que el vehículo pasó. |
| Despacho en 0,0 sin explicación            | Llame al operador hoy.                                            |
| Falta una foto                             | Decisión 3.                                                       |
| La cifra de llegada parece la del despacho | Error clásico de digitación. Registre la corrección.              |

### A quién llamar

Al operador que registró la carga, el mismo día.

### Qué NO hacer

- **No** intente editar la carga. Una corrección es un registro nuevo con su motivo; el original queda visible.
- **No** cambie la cifra de llegada «para que cuadre». Esa cifra tiene una foto asociada.

---

# Decisión 3 · Falta una fotografía

> Momento `S-03` · Cuando aparece · **el mismo día**

### Si ve esto

Un recuadro ámbar en lugar de la foto de llegada o de la final.
· Captura `dsh-04_evidencia-inventario.png` · Zoom `Z-67`

### Qué significa

En esta operación la fotografía es la evidencia principal: es lo que demuestra que ese vehículo, con esa placa, estuvo ahí. Sin ella, el registro sigue siendo válido, pero deja de ser sustentable frente a un tercero.

### Qué debe revisar

Si le pasa al mismo operador varias veces, el problema no es de disciplina: puede que esté despachando de noche, con poca luz, o con el vehículo mal ubicado.

### Qué decisión tomar

Hable con el operador hoy. Si se repite, revise las condiciones físicas del punto de despacho — iluminación y espacio para tomar el vehículo completo.

### A quién llamar

Al operador. Si se repite, al administrador de Lubryco.

### Qué NO hacer

- **No** lo deje para el cierre de mes.
- **No** acepte una foto de galería como reemplazo: la aplicación solo admite cámara en vivo, y es a propósito.

---

# Decisión 4 · Los galones no coinciden con la guía

> Momento `S-04` · Cuando ocurre · **el capítulo más importante de este curso**

### Si ve esto

La guía de remisión dice un número y el registro dice otro.

### Qué significa

Antes de asumir cualquier cosa, hay tres explicaciones más probables que un faltante:

1. **La guía incluye lo que el vehículo ya traía** y el registro solo cuenta lo despachado por Lubryco. Es la causa número uno.
2. **Se comparó el total al salir con la guía**, cuando lo comparable es la cifra de despacho.
3. **Un dígito mal copiado** en cualquiera de los dos documentos.

### Qué debe revisar

1. Abra la evidencia y mire **las tres cifras separadas**, no el total.
2. Compare la guía contra la línea **«Despachado por Lubryco»**, no contra **«Total al salir»**.
3. Mire las dos fotografías: hora, placa y estado del vehículo.

### Qué decisión tomar

Si la diferencia desaparece al comparar contra la cifra correcta, no había diferencia. Si persiste, y las fotos son consistentes, entonces sí es una conversación con Lubryco — con la evidencia adjunta, no con una sospecha.

### A quién llamar

Primero al operador. Después a su contacto en Lubryco.

### Qué NO hacer

- **No** compare la guía contra el total al salir. Es el error que genera casi todas las falsas alarmas.
- **No** escale sin haber abierto las dos fotografías.

### Antes de escalar, tres preguntas

☐ ¿Comparé contra «Despachado por Lubryco» y no contra el total?
☐ ¿Miré las dos fotografías de esa carga?
☐ ¿Confirmé con el operador con cuánto llegó el vehículo?

**Si alguna quedó sin marcar, todavía no hay caso.**

---

# Decisión 5 · ¿Cuánto llevamos entregado?

> Momento `S-05` · Semanal o mensual · 2 minutos

### Si ve esto

El acumulado de galones despachados del período.
· Captura `dsh-06_suministro.png` · Zoom `Z-70`

### Qué significa

La suma de lo que Lubryco entregó, por vehículo y por día. Es la cifra que debe conversar con la facturación.

### Qué debe revisar

Que el período coincida con el de la factura, y que no haya días sin registros en jornadas en que sí hubo operación.

### Qué decisión tomar

Si hay un día de operación sin ninguna carga registrada, eso es lo que hay que averiguar — mucho más que una diferencia de galones.

### Qué NO hacer

- **No** use este acumulado como nivel de tanque de nadie. Es despacho, no existencia.

---

# Decisión 6 · Me piden sustentar una entrega

> Momento `S-06` · Cuando ocurre · 3 minutos

### Si ve esto

Una carga puntual que alguien está cuestionando.
· Captura `dsh-04_evidencia-inventario.png`

### Qué significa

Cada carga tiene: dos fotografías con hora y lugar, la placa del vehículo, el nombre del operador, el teléfono desde el que se registró, y las tres cifras. Eso es lo que usted entrega.

### Qué debe revisar

Que la placa de la fotografía sea la del vehículo en discusión. Es lo primero que va a mirar quien recibe el sustento.

### Qué decisión tomar

Envíe la evidencia completa, no un número suelto. Un número suelto invita a discutir; una fotografía con hora cierra la conversación.

### Qué NO hacer

- **No** recorte ni edite las imágenes.
- **No** transcriba las cifras a un correo sin adjuntar la evidencia.

---

# Decisión 7 · Contabilidad me pide los datos

> Momento `S-07` · Mensual · 2 minutos

### Si ve esto

El botón de descarga en la pantalla de cargas.
· Captura `dsh-02_cargas.png`

### Qué significa

Un archivo de Excel que habla el idioma de SU operación. La hoja de cargas trae, por cada una: fecha, hora, equipo, operador, **«Llegó con (gal)»**, **«Galones cargados (gal)»**, **«Total al salir (gal)»**, la duración y el veredicto — las tres cifras en columnas propias, listas para sumar. Completan el archivo las hojas de consumo por día y por equipo. No hay hojas de entregas ni balance: esas son de la operación con tanque propio, y este perfil no las necesita.

### Qué decisión tomar

Descargue y envíe tal cual.

### Qué NO hacer

- **No** sume a mano el total al salir: ya viene calculado y verificado.

---

# Decisión 8 · El tablero está en blanco

> Momento `S-09` · Solo al empezar la operación · 1 minuto

### Si ve esto

«**Bienvenido a CuadreApp** — Tu Dashboard está listo», con un proceso en tres pasos, en lugar de los indicadores.
· Captura `dsh-12_bienvenida-inventario.png` · Callout `C-67`

### Qué significa

Su operación es nueva: **nadie ha registrado la primera carga todavía**. No falta configurar nada y no hay ningún error. Fíjese en el paso 2 del proceso: habla de «con cuánto llega» y «el total al salir» — el tablero ya sabe cómo opera su empresa.

### Qué decisión tomar

Confirme que el operador del punto de despacho ya tiene CuadreApp funcionando en su teléfono. Con la primera carga que registre, esta pantalla se reemplaza sola por los indicadores. La pantalla se actualiza cada minuto sin que usted haga nada.

### Qué NO hacer

- **No** busque un botón de configuración: no existe, y es a propósito.
- **No** reporte un error: la bienvenida ES el estado correcto de una operación sin cargas.

---

# Decisión 9 · No puedo entrar

> Momento `S-08` · Cuando ocurre · 2 minutos

### Si ve esto

El login no lo deja pasar, o el tablero lo devolvió al login con un aviso.
· Capturas `dsh-07_entrar.png`, `dsh-10_recuperar.png`, `dsh-13_acceso-desactivado.png` · Callouts `C-64`, `C-65`

### Qué significa

Son tres casos distintos, y el aviso le dice cuál es el suyo:

| El aviso dice                                                   | Qué significa                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| «Correo o contraseña incorrectos.»                              | La contraseña no es la que usted creó. Fichas `E-24` y `E-27`.                 |
| «Tu sesión expiró. Vuelve a entrar.»                            | La sesión venció por tiempo. Es normal; no se perdió nada. Ficha `E-26`.       |
| «Tu acceso al Dashboard está desactivado. Contacta al administrador de tu empresa.» | Alguien de su empresa desactivó su cuenta. Ficha `E-25`. |

### Qué decisión tomar

- **Olvidó la contraseña** → «¿Olvidaste tu contraseña?» bajo el botón de entrar. Escriba su correo y siga el enlace que le llega: define una nueva y entra directo. Nadie tiene que dársela.
- **Sesión expirada** → vuelva a entrar con su correo y su contraseña. Nada más.
- **Acceso desactivado** → hable con quien administra los accesos al Dashboard en SU empresa. Reactivarlo toma un minuto y no borra nada.

Y si el tablero carga pero una pantalla muestra un error con una línea «**Soporte:** …»: esa referencia es todo lo que necesita darle a Lubryco para que encuentren su caso al instante. Cópiela con el botón que tiene al lado. · Callout `C-66`

### Qué NO hacer

- **No** pida la contraseña de un compañero para «mientras tanto».
- **No** pida el enlace de recuperación muchas veces seguidas: los envíos tienen límite y solo alarga la espera (ficha `E-27`).
- **No** reporte la sesión expirada como falla, salvo que ocurra a cada rato el mismo día.

---

# Su rutina

Versión imprimible en [`../06_Checklists/SUP-CI.md`](../06_Checklists/SUP-CI.md).

**Cada mañana · 5 minutos**
☐ Leí la frase de arriba ☐ Abrí las cargas marcadas ☐ Revisé las tres cifras separadas ☐ Si falta una foto, hablé con el operador hoy

**Cada semana**
☐ Revisé el acumulado del período ☐ Verifiqué que no haya días de operación sin registros

---

# Preguntas frecuentes

De [`biblioteca-faq.md`](../00_Fuente/biblioteca-faq.md): `P-40`, `P-42` a `P-49` y `P-50` a `P-53`.
`P-50` («la guía dice otra cosa que el registro») va **primera**: es la consulta más frecuente de esta operación.

---

# Cuánto tarda cada cosa

| Decisión                    | La primera vez | En rutina       |
| --------------------------- | -------------- | --------------- |
| Primer ingreso              | 2 min          | — (una vez)     |
| ¿Hay algo que atender?      | 3 min          | 1 min           |
| Una carga quedó marcada     | 5 min          | 3 min           |
| Falta una fotografía        | 2 min          | 1 min           |
| No coincide con la guía     | 6 min          | 3 min           |
| ¿Cuánto llevamos entregado? | 3 min          | 1 min (semanal) |
| **Rutina diaria**           | —              | **≈ 5 min**     |
