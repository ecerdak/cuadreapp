# Catálogo de momentos — el eje del Training Experience

Esta es la **espina dorsal** de toda la capacitación. Un momento es algo que pasa **en el mundo real**, no en la aplicación.

La diferencia no es cosmética. Un operador nunca piensa «estoy en la pantalla del PIN»; piensa «llegó el carrotanque». Un supervisor nunca piensa «voy a la pestaña Cargas»; piensa «¿hay algo que deba atender?». Si la capacitación se organiza como la aplicación, obligamos a la persona a traducir de su mundo al nuestro, y esa traducción es exactamente donde se pierden los operadores nuevos.

**Regla de escritura:** el nombre de un momento nunca contiene el nombre de una pantalla. Si no se puede nombrar sin decir «pantalla», «campo» o «botón», es que no es un momento — es una pantalla disfrazada.

---

## Cómo se relaciona con las pantallas

Cada momento **usa** una o varias pantallas, y ese vínculo vive aquí. El [`catalogo-pantallas.md`](catalogo-pantallas.md) sigue existiendo, pero cambió de papel: dejó de ser el índice del curso y pasó a ser el **índice técnico** que garantiza que el kit siga sincronizado con el código. Nadie aprende leyéndolo; el verificador lo usa para detectar cuándo una pantalla cambió de nombre o desapareció.

```
MOMENTO (mundo real)  ──usa──▶  PANTALLA (producto)  ──apunta a──▶  ARCHIVO DE CÓDIGO
   lo que enseñamos                 índice técnico                 sincronía verificable
```

---

## Operador · perfil Medidor Doble

### `M-MD-00` · Antes de salir a trabajar

- **Qué pasa en el mundo:** el operador arranca su turno. Todavía no hay ningún equipo esperando.
- **Qué tiene que ser cierto para poder trabajar:** teléfono cargado, app instalada, él sabe su código y su PIN.
- **Pantallas que usa:** `PWA-15`, `PWA-01`, `PWA-02`, `PWA-03`
- **Frecuencia:** una vez al día (y la instalación, una sola vez en la vida del teléfono)
- **Dura:** 1 minuto

### `M-MD-01` · Un equipo necesita combustible

- **Qué pasa en el mundo:** llega un tractor, una alzadora o un camión al surtidor. El operador se acerca con el teléfono.
- **Decisión real que toma:** identificar **cuál** máquina es, leyendo el sticker.
- **Pantallas:** `PWA-04`, `PWA-05`
- **Dura:** 15 segundos

### `M-MD-02` · Antes de abrir la manguera

- **Qué pasa en el mundo:** el operador gira la perilla lateral del Fill-Rite hasta dejar la tanda en 0.0, y fotografía la carátula.
- **Por qué importa:** es la prueba de que el conteo de esta carga arrancó limpio. Sin eso no se puede saber cuántos galones fueron de esta máquina.
- **Pantallas:** `PWA-06`, `PWA-07`, `PWA-08`
- **Dura:** 40 segundos
- **Es el momento con más errores de todo el proceso.**

### `M-MD-03` · Está saliendo el combustible

- **Qué pasa en el mundo:** la manguera está abierta. El operador espera, vigila y no toca el teléfono.
- **Pantallas:** `PWA-09`
- **Dura:** lo que dure la carga física

### `M-MD-04` · Se cerró la manguera

- **Qué pasa en el mundo:** terminó el despacho. El operador vuelve a la carátula, fotografía y copia los números finales.
- **Pantallas:** `PWA-10`
- **Dura:** 45 segundos

### `M-MD-05` · La carga quedó registrada

- **Qué pasa en el mundo:** el equipo se va. El operador confirma que quedó bien y pasa al siguiente.
- **Pantallas:** `PWA-13`
- **Dura:** 10 segundos

---

## Operador · perfil Carga sobre Inventario

### `M-CI-00` · Antes de salir a trabajar

Idéntico a `M-MD-00`. **Pantallas:** `PWA-15`, `PWA-02`, `PWA-03`

### `M-CI-01` · Llegó el carrotanque

- **Qué pasa en el mundo:** un carrotanque entra a la estación. El operador se acerca con el teléfono.
- **Decisión real:** identificar el vehículo por su placa o código.
- **Pantallas:** `PWA-04`, `PWA-05`
- **Dura:** 15 segundos

### `M-CI-02` · Cuánto traía antes de cargar

- **Qué pasa en el mundo:** el operador fotografía el carrotanque completo y anota con cuántos galones llegó.
- **Por qué importa:** es la línea de partida. Sin ella no hay forma de saber cuánto se despachó de verdad.
- **Pantallas:** `PWA-06`, `PWA-07`, `PWA-11`
- **Dura:** 30 segundos
- **Es el número que más se confunde:** el operador tiende a anotar lo que va a cargar, no lo que ya traía.

### `M-CI-03` · Lubryco está despachando

- **Qué pasa en el mundo:** está saliendo el combustible hacia el carrotanque.
- **Pantallas:** `PWA-09`
- **Dura:** lo que dure el despacho

### `M-CI-04` · Cuánto despachó Lubryco

- **Qué pasa en el mundo:** terminó el despacho. Se fotografía el carrotanque y se anota únicamente lo que Lubryco entregó.
- **Pantallas:** `PWA-12`
- **Dura:** 35 segundos

### `M-CI-05` · El carrotanque se va

- **Qué pasa en el mundo:** el vehículo sale con su inventario nuevo.
- **Pantallas:** `PWA-13`
- **Dura:** 10 segundos

---

## Operador · momentos de excepción _(ambos perfiles)_

### `M-OP-E1` · Algo no está como debería

Equipo que no aparece, cámara que no abre, PIN que no funciona. **Pantallas:** `PWA-04`, `PWA-06`, `PWA-14`

### `M-OP-E2` · Me equivoqué

Equipo equivocado, número mal escrito. **Pantallas:** cualquiera del flujo, con el botón de volver.

### `M-OP-E3` · No hay señal en la planta

Situación normal, no excepción. **Pantallas:** `PWA-03`, `PWA-13`

### `M-OP-E4` · La aplicación se cerró sola

**Pantallas:** `PWA-03`, `PWA-14`

---

## Supervisor · momentos de decisión

Un supervisor no recorre pestañas: llega con una pregunta y necesita una respuesta.

### `S-01` · ¿Hay algo que deba atender hoy?

- **Cuándo ocurre:** cada mañana, café en mano.
- **Pantallas:** `DSH-01`
- **Dura:** 1 minuto

### `S-02` · Una carga no cuadra

- **Cuándo ocurre:** el tablero lo marcó.
- **Decisión real:** ¿es un error de digitación, una carga sin registrar, o algo que investigar?
- **Pantallas:** `DSH-02`, `DSH-03` (Medidor Doble) / `DSH-04` (Inventario)

### `S-03` · Falta una fotografía

- **Urgencia:** alta y con caducidad — mañana el operador ya no recuerda esa carga.
- **Pantallas:** `DSH-02`, `DSH-03` / `DSH-04`

### `S-04` · Un equipo está consumiendo de más

- **Decisión real:** ¿es mantenimiento o es otra cosa?
- **Pantallas:** `DSH-05`

### `S-05` · ¿Cuándo pido más combustible?

- **Pantallas:** `DSH-06`

### `S-06` · Alguien me pregunta si hubo robo

- **Cuándo ocurre:** gerencia vio un número raro y pregunta.
- **Por qué es un momento propio:** es donde un supervisor mal capacitado hace daño real acusando a alguien sin evidencia.
- **Pantallas:** `DSH-03`, `DSH-06`

### `S-07` · Contabilidad me pide los datos del mes

- **Pantallas:** `DSH-02`

---

## Administrador · procesos completos

Un administrador no crea entidades sueltas: ejecuta procesos que empiezan con una llamada comercial y terminan con un operador cargando combustible.

### `A-01` · Incorporar un cliente nuevo _(el proceso central)_

- **Empieza cuando:** Lubryco cierra con un cliente.
- **Termina cuando:** el operador registró su primera carga y el supervisor la vio en su tablero.
- **Pantallas:** `ADM-04`, `ADM-05`, `ADM-06`, `ADM-07`, `ADM-08`
- **Dura:** 10 minutos de consola + coordinación con la planta

### `A-02` · Sumar una sede a un cliente que ya opera

- **Pantallas:** `ADM-07`

### `A-03` · Entra un operador nuevo

- **Pantallas:** `ADM-07`, `ADM-10`

### `A-04` · Se perdió o se dañó un teléfono

- **Urgencia:** inmediata.
- **Pantallas:** `ADM-07`, `ADM-11`

### `A-05` · El cliente cambió de imagen corporativa

- **Pantallas:** `ADM-05`

### `A-06` · El cliente cambia su forma de operar

- **Por qué es delicado:** afecta lo que verá el operador mañana, pero no la historia.
- **Pantallas:** `ADM-06`

### `A-07` · Revisión semanal de la plataforma

- **Qué pasa en el mundo:** nadie ha llamado, y esa es exactamente la razón para mirar. Los problemas de adopción se ven aquí una semana antes de que alguien los reporte.
- **Pantallas:** `ADM-01`, `ADM-02`, `ADM-03`, `ADM-09`, `ADM-11`

---

## Resumen

| Audiencia                       | Momentos        | De los cuales, de excepción |
| ------------------------------- | --------------- | --------------------------- |
| Operador Medidor Doble          | 6               | 4 compartidos               |
| Operador Carga sobre Inventario | 6               | 4 compartidos               |
| Supervisor                      | 7               | —                           |
| Administrador                   | 7               | —                           |
| **Total**                       | **30 momentos** |                             |

Los 30 momentos cubren las 32 pantallas catalogadas. **Ninguna pantalla queda huérfana y ningún momento inventa pantallas** — el verificador lo comprueba.
