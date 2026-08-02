# Runbook de operación offline — CuadreApp

## Estados del chip de inicio (y qué hacer)

| Chip                                      | Significado                                      | Acción                                                             |
| ----------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| 🔵 Sincronizando X de Y…                  | Subiendo la cola ahora                           | Nada; no cierres la app                                            |
| 🟢 Todo sincronizado · último envío HH:MM | Cola vacía, servidor al día                      | Nada                                                               |
| 🟡 En cola: N — subiendo apenas se pueda  | Hay señal, backoff en curso                      | Nada; sube solo                                                    |
| 🟡 Sin conexión — N en cola               | Sin señal con trabajo guardado                   | Trabajar normal; sube al volver la señal                           |
| ⚪ Trabajando offline                     | Sin señal, sin pendientes                        | Trabajar normal                                                    |
| 🔴 N registro(s) con error                | El servidor rechazó algo (no es un fallo de red) | Supervisor: abrir Diagnóstico y llamar a soporte con el request_id |
| 🔵 Actualización lista                    | Hay versión nueva descargada                     | Cerrar y reabrir la app cuando se pueda; no borra nada             |

## Garantías del diseño (verificadas por pruebas)

Una carga guardada **jamás** se pierde: vive en el teléfono hasta que el servidor la confirma. Las fotos se suben **antes** que el registro y los archivos locales solo se borran tras la aceptación. Un reintento usa el mismo identificador: el servidor **no duplica**. Un fallo de red **nunca** se convierte en error de negocio: solo espera. La captura en curso (borrador, fotos incluidas) **sobrevive** a que el sistema mate la app.

## Procedimiento reproducible de validación offline (en dispositivo físico)

1. Instalar la app (guía de instalación) y enrolar con señal.
2. **Modo avión.** Cerrar la app por completo (deslizar en recientes).
3. Abrirla desde el ícono → debe abrir sin red (shell precacheado).
4. Registrar una carga completa: equipo → PIN → foto → lecturas → foto → guardar.
5. Verificar chip: "Sin conexión — 1 en cola".
6. Matar la app a MITAD de una segunda captura (tras la primera foto). Reabrir → debe volver al mismo paso con la foto intacta.
7. Quitar modo avión con la app abierta → chip "Sincronizando…" → "Todo sincronizado · último envío".
8. Supervisor verifica la carga en el Dashboard y la foto en el detalle.
9. Diagnóstico: cargas pendientes 0, fotografías pendientes 0.

## Diagnóstico

Inicio → enlace "Diagnóstico del dispositivo" (abajo). Muestra versión, modo, conectividad, almacenamiento (y si está protegido contra purga), pendientes, errores, borrador guardado, última sincronización y último error. Sin datos sensibles.
