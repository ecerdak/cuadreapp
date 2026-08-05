# Troubleshooting · OP-AND-CI — Operadores Android · Carga sobre Inventario

> Formato: **problema → posible causa → solución**. El problema está escrito como lo dice el usuario, no como lo describiría un técnico: así se encuentra buscando.
> Detalle y «qué NO hacer» en [`../00_Fuente/biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md) · Manual: [`../01_Operadores/OP-AND-CI.md`](../01_Operadores/OP-AND-CI.md)

---

## Matriz

| Problema (lo que dice el usuario)    | Posible causa                                                          | Solución                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| «No me aparece el botón de instalar» | En iPhone ese botón no existe; en Android, Chrome ya lo descartó antes | iPhone → Compartir → «Añadir a pantalla de inicio». Android → menú ⋮ → «Agregar a la pantalla principal». `E-OP-01` |
| «El código no me sirve»              | Ya se usó, venció (7 días) o tiene un carácter de más                  | Pedir otro al supervisor: se genera en segundos. `E-OP-02`                                                          |
| «La cámara no abre»                  | El permiso quedó denegado en la primera pregunta                       | Ajustes del teléfono → la app → Permisos → Cámara → Permitir. Cerrar y reabrir. `E-OP-03`                           |
| «No encuentro el equipo»             | No está dado de alta, está inactivo o es de otra sede                  | Buscar por las primeras letras del sticker. Si no aparece, avisar al supervisor. `E-OP-04`                          |
| «Dice Código o PIN incorrecto»       | Código equivocado, PIN olvidado, u operador desactivado                | Verificar el código (es el del operador, no el del equipo). El supervisor restablece el PIN. `E-OP-05`              |
| «Me equivoqué de equipo y ya avancé» | Confirmación apresurada                                                | «← Atrás» hasta la pantalla de equipo. La app avisa qué se borra y pide confirmar. `E-OP-09`                        |
| «Se cerró la app a mitad»            | El sistema operativo la cerró, o se apagó el teléfono                  | Volver a abrirla: la captura se restaura donde quedó. NO empezar de cero sin mirar. `E-OP-10`                       |
| «No hay Internet»                    | La planta no tiene señal — es lo normal                                | Registrar igual: se guarda y sube sola. NUNCA repetir la carga. `E-OP-11`                                           |
| «Dice En cola y no baja»             | La app necesita estar abierta unos segundos con señal                  | Abrir la app donde haya señal y esperar con la pantalla encendida. `E-OP-12`                                        |
| «Dice N con error»                   | El servidor rechazó el registro de forma definitiva                    | Abrir «Diagnóstico del dispositivo» y mostrárselo al supervisor. `E-OP-13`                                          |
| «Almacenamiento protegido dice NO»   | El navegador no garantizó la persistencia                              | Avisar al supervisor el mismo día y no dejar cargas sin subir de un día para otro. `E-OP-14`                        |
| «¿El total lo escribo yo?»           | Confusión al pasar del papel a la app                                  | No. Solo dos cifras: con cuántos llegó y cuántos despachó Lubryco. El total lo suma la app. `E-OP-08`               |
| «El total no me cuadra»              | Una de las dos cifras escritas está mal                                | Revisar primero «llegó con» y después «despachado». El total es una suma: si está mal, el error está arriba.        |
| «Llegó vacío, ¿qué escribo?»         | Duda razonable: el campo parece obligatorio                            | 0,0. Es un valor válido y esperado.                                                                                 |

---

## Cuándo escalar

| Situación                                              | A quién                | Con qué                    |
| ------------------------------------------------------ | ---------------------- | -------------------------- |
| Registro con error, o «Almacenamiento protegido» en NO | Supervisor del cliente | La pantalla de Diagnóstico |

**Regla general:** si la solución que se te ocurre implica **borrar, reinstalar o empezar de cero**, no la hagas todavía. Es casi siempre el único camino que pierde datos de forma irreversible.
