# Poner un cliente a operar

## Curso para el administrador de la plataforma · Lubryco

> `ADM` · Momentos: [`catalogo-momentos.md`](../00_Fuente/catalogo-momentos.md) · Callouts: [`biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md) · Zooms: [`inventario-zooms.md`](../00_Fuente/inventario-zooms.md)
> Layout: [`../05_Layouts/ADM.md`](../05_Layouts/ADM.md) · Quick Guide: [`../10_QuickGuides/QG-ADM.md`](../10_QuickGuides/QG-ADM.md) · Video: [`../08_Storyboards/ADM.md`](../08_Storyboards/ADM.md)

---

## Para quién es esto

Para la persona de Lubryco que deja lista la plataforma para que otros trabajen.

**Al terminar este curso usted podrá:** llevar un cliente nuevo desde la firma hasta su primera carga registrada, y resolver en minutos lo que pase después.

**Tiempo:** 35 minutos.

---

## Esto no se estudia por pantallas

Usted no va a «crear un cliente» y luego «crear un equipo». Va a ejecutar **procesos completos**, que empiezan con una llamada y terminan con un operador cargando combustible. Este curso está organizado así.

```
INCORPORAR UN CLIENTE NUEVO       →  Proceso 1   (el central)
SUMAR UNA SEDE                    →  Proceso 2
ENTRA UN OPERADOR NUEVO           →  Proceso 3
SE PERDIÓ UN TELÉFONO             →  Proceso 4   (urgente)
CAMBIÓ LA IMAGEN DEL CLIENTE      →  Proceso 5
CAMBIÓ LA FORMA DE OPERAR         →  Proceso 6   (delicado)
REVISIÓN SEMANAL                  →  Proceso 7
```

---

## Las tres decisiones que no se deshacen

Antes de cualquier proceso, tenga presente qué se puede corregir después y qué no:

| Decisión                                         | ¿Se puede cambiar?           | Consecuencia si se equivoca                                                                              |
| ------------------------------------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Perfil operativo del cliente**                 | Sí, pero solo hacia adelante | Las cargas ya registradas conservan el perfil con el que se hicieron. La historia nunca se reinterpreta. |
| **Totalizador de instalación de un dispensador** | No                           | Todas las validaciones de continuidad parten de ahí. Un error obliga a corregir con registros nuevos.    |
| **PIN de un operador**                           | Se reemplaza, no se consulta | No se puede volver a ver. Si se pierde, se asigna uno nuevo.                                             |

Verifique estas tres con el cliente **antes** de guardar, no después.

---

# Proceso 1 · Incorporar un cliente nuevo

> Momento `A-01` · 10 minutos en consola, más coordinación con la planta

Este es el proceso central. Los demás son variaciones suyas.

### Empieza cuando

Lubryco cierra con un cliente y usted recibe: razón social, NIT, nombre comercial, sedes, equipos, operadores y **cómo opera esa planta**.

### Termina cuando

Un operador registró su primera carga y su supervisor la vio en el tablero.

### Antes de tocar la consola, consiga esto

☐ Razón social y NIT exactos, como aparecen en la cámara de comercio
☐ Nombre comercial (el que verá el supervisor todos los días)
☐ Logo en PNG, JPG o WEBP, **máximo 1 MB**
☐ Dos colores corporativos en formato `#RRGGBB`
☐ **Cómo opera:** ¿tiene medidor en el surtidor, o se despacha a carrotanques?
☐ Lista de sedes, equipos con su código, y operadores

**El punto de la forma de operar es el que más se demora en aclarar** y el que más consecuencias tiene. Pregúntelo primero.

### Los pasos

**1 · Crear el cliente**
· Captura `adm-04_clientes.png` · Zoom `Z-81`

Razón social, NIT, nombre comercial y **perfil operativo**. El perfil es la decisión de la que cuelga todo lo demás:

| Si en la planta…                                      | El perfil es               | El operador va a registrar                |
| ----------------------------------------------------- | -------------------------- | ----------------------------------------- |
| Hay un medidor en el surtidor con tanda y totalizador | **Medidor Doble**          | Dos lecturas del medidor, antes y después |
| Se despacha a carrotanques y no hay medidor           | **Carga sobre Inventario** | Con cuánto llegó y cuánto se despachó     |

**2 · Cargar la identidad**
· Captura `adm-05_ficha-identidad.png` · Zooms `Z-82`, `Z-83`, `Z-84`

Logo y **exactamente dos colores**. Todo lo demás —bordes, sombras, estados, contraste del texto— lo deriva el sistema.

Esta restricción es deliberada: **no hay CSS libre**. Con dos colores es imposible que un cliente termine con un tablero ilegible o con texto que no se lee sobre su propio color. Si el cliente pide más, la respuesta es que la plataforma garantiza legibilidad y accesibilidad, y eso solo se puede garantizar controlando la derivación.

Mire la vista previa antes de guardar.

**3 · Registrar las sedes**
· Captura `adm-07_ficha-operacion.png`

Al menos una. Aunque el cliente tenga una sola planta, la sede existe: es lo que permite crecer sin migrar nada.

**4 · Registrar los equipos**
· Captura `adm-07_ficha-operacion.png` · Zoom `Z-88`

Código, descripción, y sede. **«Todas las sedes»** es una opción válida y frecuente: úsela para equipos que rotan. Un equipo asignado a una sede solo aparece en el catálogo de esa sede.

**5 · Registrar el dispensador** _(solo Medidor Doble)_
· Captura `adm-07_ficha-operacion.png` · Zoom `Z-86`

El **totalizador de instalación** es el número que marca el medidor hoy. **Verifíquelo contra una fotografía del medidor**, no contra lo que le dictaron por teléfono. No se puede cambiar después.

**6 · Registrar los operadores**
· Captura `adm-07_ficha-operacion.png` · Zoom `Z-87`

Nombre, código y PIN de cuatro dígitos. El PIN **no se vuelve a mostrar**: anótelo para dictárselo al operador en ese momento, y no lo guarde en ningún archivo.

**7 · Enrolar los teléfonos**
· Capturas `adm-07_ficha-operacion.png`, `adm-11_dispositivos.png` · Zooms `Z-89`, `Z-90`

Genere un código de enrolamiento por teléfono. Es de un solo uso y caduca. Dícteselo al operador mientras él tiene la aplicación abierta.

**8 · Dar acceso al supervisor**
· Captura `adm-08_usuarios.png`

Correo y rol. El supervisor ve el tablero de su cliente y nada más.

### Cómo sabe que salió bien

☐ El supervisor entró y ve el tablero con los colores de su empresa
☐ El operador entró y ve su lista de equipos
☐ Se registró una carga de prueba y aparece en el tablero
☐ La carga de prueba quedó identificada como tal

### Qué NO hacer

- **No** deje el perfil operativo «para confirmar después». Determina lo que el operador verá mañana.
- **No** invente el totalizador de instalación.
- **No** envíe PIN ni códigos de enrolamiento por WhatsApp ni por correo.
- **No** cree el cliente sin sede. Después toca reasignar todo a mano.

---

# Proceso 2 · Sumar una sede a un cliente que ya opera

> Momento `A-02` · 5 minutos

### Empieza cuando

El cliente abre una planta nueva.

### Los pasos

1. Cree la sede en la ficha de Operación del cliente.
2. Registre sus equipos, o marque como **«Todas las sedes»** los que van a rotar.
3. Si es Medidor Doble, registre el dispensador con su totalizador de instalación.
4. Registre los operadores de esa sede y enrole sus teléfonos.

### Qué NO hacer

- **No** mueva equipos existentes a la sede nueva sin avisar: desaparecen del catálogo de la sede anterior de un día para otro.
- **No** cree un cliente nuevo para una sede nueva. La sede vive dentro del cliente, y esa jerarquía es fija.

---

# Proceso 3 · Entra un operador nuevo

> Momento `A-03` · 3 minutos

### Empieza cuando

El cliente avisa que hay una persona nueva en la planta.

### Los pasos

1. Regístrelo con nombre, código y PIN.
2. Asígnelo a su sede, o a «Todas las sedes» si rota.
3. Genere el código de enrolamiento de su teléfono.
4. Acompáñelo en la primera carga.

### Cómo sabe que salió bien

El operador registró una carga completa sin ayuda.

### Qué NO hacer

- **No** reutilice el código de un operador que salió. Cada persona tiene el suyo, y es lo que permite saber quién registró qué.
- **No** entregue un teléfono ya enrolado a otra persona sin reenrolarlo.

---

# Proceso 4 · Se perdió o se dañó un teléfono

> Momento `A-04` · **inmediato** · 2 minutos

### Empieza cuando

Alguien avisa que un teléfono se perdió, se robó o se dañó.

### Los pasos

1. Abra Dispositivos y **revoque** ese teléfono. Deja de poder registrar de inmediato.
   · Captura `adm-11_dispositivos.png` · Zoom `Z-90`
2. Si el operador ya tiene otro teléfono, genere un código de enrolamiento nuevo.
3. Si el teléfono tenía cargas sin subir, quedaron en ese aparato. Avísele al supervisor para que las reconstruya con el operador.

### Qué NO hacer

- **No** espere «a ver si aparece». La revocación es reversible; una carga registrada por un tercero, no.
- **No** revoque el dispositivo equivocado: verifique el operador y la fecha del último uso antes de confirmar.

---

# Proceso 5 · El cliente cambió de imagen corporativa

> Momento `A-05` · 3 minutos

### Los pasos

1. Abra la ficha de Identidad.
2. Reemplace el logo, los colores, o el nombre comercial.
3. Mire la vista previa.
4. Guarde. El cambio se ve en el siguiente ingreso al tablero.

### Qué NO hacer

- **No** cambie la razón social ni el NIT por un cambio de marca: son datos legales y viven en otro campo.
- **No** acepte colores fuera de `#RRGGBB`. La consola los rechaza, y está bien que lo haga.

---

# Proceso 6 · El cliente cambia su forma de operar

> Momento `A-06` · **el proceso más delicado** · 5 minutos, más coordinación

### Empieza cuando

Una planta instala un medidor, o deja de usarlo y pasa a despachar a carrotanques.

### Qué está en juego

El perfil cambia **lo que el operador verá mañana**. No cambia nada de lo ya registrado: cada carga guardó el perfil con el que se hizo, y se sigue mostrando con esas reglas para siempre.
· Captura `adm-06_ficha-configuracion.png` · Zoom `Z-85`

### Los pasos

1. Confirme con el cliente que el cambio ya es efectivo en la planta.
2. Cambie el perfil en la ficha de Configuración.
3. **Avísele al supervisor y a los operadores antes de que abran la aplicación.**
4. Si el perfil nuevo es Medidor Doble, registre el dispensador con su totalizador de instalación.
5. Acompañe la primera carga con el perfil nuevo.

### Qué NO hacer

- **No** cambie el perfil un día de operación alta.
- **No** lo cambie sin avisar: el operador va a ver una pantalla que no reconoce.
- **No** intente «convertir» las cargas anteriores. No se puede y no debe poderse.

---

# Proceso 7 · Revisión semanal de la plataforma

> Momento `A-07` · 10 minutos

### Los pasos

1. Abra el resumen y revise las alertas.
   · Captura `adm-02_resumen.png` · Zoom `Z-80`
2. Mire los dispositivos sin actividad reciente: un teléfono que dejó de sincronizar es un problema que todavía no le han reportado.
   · Captura `adm-11_dispositivos.png`
3. Revise los clientes sin cargas en la semana. Puede ser vacaciones de la planta, o puede ser que dejaron de usar la aplicación.

### Qué NO hacer

- **No** espere a que el cliente reporte. La mayoría de los problemas de adopción se ven aquí una semana antes de que alguien llame.

---

# Sus rutinas

Versión imprimible en [`../06_Checklists/ADM.md`](../06_Checklists/ADM.md).

**Al incorporar un cliente**
☐ Confirmé la forma de operar ☐ Logo bajo 1 MB ☐ Dos colores válidos ☐ Al menos una sede ☐ Totalizador verificado con foto ☐ PIN dictados en persona ☐ Carga de prueba registrada y visible

**Cada semana**
☐ Revisé alertas ☐ Revisé dispositivos sin actividad ☐ Revisé clientes sin cargas

---

# Preguntas frecuentes

De [`biblioteca-faq.md`](../00_Fuente/biblioteca-faq.md): `P-60` a `P-72`.
`P-60` («¿qué pasa con la historia si cambio el perfil?») va **primera**: es la duda que frena más incorporaciones.

---

# Cuánto tarda cada cosa

| Proceso                   | La primera vez | Cuando ya sabe |
| ------------------------- | -------------- | -------------- |
| Incorporar un cliente     | 35 min         | 10 min         |
| Sumar una sede            | 12 min         | 5 min          |
| Operador nuevo            | 8 min          | 3 min          |
| Teléfono perdido          | 5 min          | 2 min          |
| Cambio de imagen          | 6 min          | 3 min          |
| Cambio de forma de operar | 15 min         | 5 min          |
| Revisión semanal          | 20 min         | 10 min         |
