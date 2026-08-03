# Navegación hacia atrás del wizard del conductor

Modelo en `apps/pwa/src/flujo/navegacion.ts` (reglas puras) y
`apps/pwa/src/flujo/historial.ts` (Back del sistema). La UI ejecuta; el
modelo decide. Todo probado sin navegador.

## Mapa de retroceso (un paso a la vez)

```
inicio ← equipo ← conductor ← antes ← cargando ← despues        listo ✗
   ✗ (raíz)                                            (carga ya guardada)
```

Sub-pasos internos: confirmación de equipo → lista (conserva la
búsqueda); PIN → cambiar conductor (conserva el equipo, limpia el PIN).

## Qué se conserva y qué se invalida

| Retroceso                        | Conserva                                                  | Invalida                            | Confirmación                                                                                          |
| -------------------------------- | --------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| equipo → inicio                  | — (aún no hay captura)                                    | borrador vacío                      | no                                                                                                    |
| conductor → equipo               | equipo, totalizador editado                               | —                                   | no                                                                                                    |
| **cambiar de equipo**            | GPS                                                       | conductor, fotos, lecturas, tiempos | **"Si cambias de equipo, se eliminarán el conductor, las lecturas y las fotografías de esta carga."** |
| re-confirmar el MISMO equipo     | todo                                                      | nada                                | no                                                                                                    |
| antes → conductor (sin foto)     | lecturas escritas                                         | —                                   | no                                                                                                    |
| **antes → conductor (con foto)** | lecturas                                                  | **solo la foto inicial**            | **"Si vuelves, tendrás que tomar nuevamente la foto inicial."**                                       |
| **cargando → antes**             | TODO — el cronómetro no se detiene (`iniciadaEn` intacto) | nada                                | **"Esta carga ya comenzó…"**                                                                          |
| despues → cargando               | fotos, tanda/tot finales, contador                        | nada                                | no                                                                                                    |

## Estados bloqueados (sin Atrás, Back del sistema ignorado)

- **guardando** (entre "Guardar la carga" y la escritura en la cola):
  botón "Guardando…", cero doble toque, cero duplicados.
- **listo**: la carga ya está en la cola; Atrás no existe y el Back del
  sistema lleva al inicio (jamás reabre el registro).
- inicio, enrolamiento, splash: sin paso anterior — el Back del sistema
  sale con normalidad (nunca un cierre abrupto a mitad de carga).

## Back físico Android / gestos iPhone

Un ancla en el historial hace que "atrás" dispare `popstate` en vez de
salir de la PWA. El control re-ancla mientras el wizard atienda el
retroceso; con una confirmación abierta, Back = Cancelar; en la raíz
libera la salida normal. Mismo código de decisión que el botón visual.

## Borrador

Cada retroceso persiste el paso y los datos ya invalidados en Dexie:
matar y reabrir la app restaura el paso correcto, sin resucitar fotos
descartadas y sin perder fotos conservadas. Sin cambio de esquema.
