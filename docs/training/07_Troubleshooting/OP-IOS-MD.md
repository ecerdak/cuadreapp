# Troubleshooting · OP-IOS-MD — Operadores iPhone · Medidor Doble

> Formato: **problema → posible causa → solución**. El problema está escrito como lo dice el usuario, no como lo describiría un técnico: así se encuentra buscando.
> Detalle y «qué NO hacer» en [`../00_Fuente/biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md) · Manual: [`../01_Operadores/OP-IOS-MD.md`](../01_Operadores/OP-IOS-MD.md)

---

## Matriz

| Problema (lo que dice el usuario)    | Posible causa                                                          | Solución                                                                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| «No me aparece el botón de instalar» | En iPhone ese botón no existe; en Android, Chrome ya lo descartó antes | iPhone → Compartir → «Añadir a pantalla de inicio». Android → menú ⋮ → «Agregar a la pantalla principal». `E-OP-01`                     |
| «El código no me sirve»              | Ya se usó, venció (7 días) o tiene un carácter de más                  | Pedir otro al supervisor: se genera en segundos. `E-OP-02`                                                                              |
| «La cámara no abre»                  | El permiso quedó denegado en la primera pregunta                       | Ajustes del teléfono → la app → Permisos → Cámara → Permitir. Cerrar y reabrir. `E-OP-03`                                               |
| «No encuentro el equipo»             | No está dado de alta, está inactivo o es de otra sede                  | Buscar por las primeras letras del sticker. Si no aparece, avisar al supervisor. `E-OP-04`                                              |
| «Dice Código o PIN incorrecto»       | Código equivocado, PIN olvidado, u operador desactivado                | Verificar el código (es el del operador, no el del equipo). El supervisor restablece el PIN. `E-OP-05`                                  |
| «Me equivoqué de equipo y ya avancé» | Confirmación apresurada                                                | «← Atrás» hasta la pantalla de equipo. La app avisa qué se borra y pide confirmar. `E-OP-09`                                            |
| «Se cerró la app a mitad»            | El sistema operativo la cerró, o se apagó el teléfono                  | Volver a abrirla: la captura se restaura donde quedó. NO empezar de cero sin mirar. `E-OP-10`                                           |
| «No hay Internet»                    | La planta no tiene señal — es lo normal                                | Registrar igual: se guarda y sube sola. NUNCA repetir la carga. `E-OP-11`                                                               |
| «Dice En cola y no baja»             | La app necesita estar abierta unos segundos con señal                  | Abrir la app donde haya señal y esperar con la pantalla encendida. `E-OP-12`                                                            |
| «Dice N con error»                   | El servidor rechazó el registro de forma definitiva                    | Abrir «Diagnóstico del dispositivo» y mostrárselo al supervisor. `E-OP-13`                                                              |
| «Almacenamiento protegido dice NO»   | El navegador no garantizó la persistencia                              | Avisar al supervisor el mismo día y no dejar cargas sin subir de un día para otro. `E-OP-14`                                            |
| «El medidor no queda en 0.0»         | La perilla no volvió a cero o está trabada                             | Seguir con el registro y escribir la nota que pide la app. NO inventar un 0,0. `E-OP-06`                                                |
| «Los números no cuadran»             | Un dígito mal copiado, casi siempre                                    | Volver a mirar la carátula. Si están bien, guardar igual: queda marcado. `E-OP-07`                                                      |
| «El vidrio refleja y no se lee»      | El medidor está montado alto y su vidrio refleja la cubierta           | Cambiar el ángulo o tapar el reflejo con el cuerpo. Si nunca se logra, avisar al supervisor: hay que bajar el medidor o ponerle visera. |

## Propio de iPhone

| Problema                                       | Posible causa                                                  | Solución                                                                                    |
| ---------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| «Instalé pero no aparece el ícono»             | Se instaló desde Chrome o Firefox, no desde Safari             | En iPhone solo Safari puede instalar. Abrir el enlace en Safari y repetir.                  |
| «Desapareció la app del teléfono»              | Se borraron los datos de Safari o de sitios web                | Volver a instalar y **re-enrolar**. Las cargas que no habían subido se perdieron.           |
| «Almacenamiento protegido dice NO y no cambia» | WebKit decide por heurística y puede negarlo sin razón visible | Usar la app a diario y no dejar cargas sin subir de un día para otro. Avisar al supervisor. |

---

## Cuándo escalar

| Situación                                              | A quién                | Con qué                    |
| ------------------------------------------------------ | ---------------------- | -------------------------- |
| Registro con error, o «Almacenamiento protegido» en NO | Supervisor del cliente | La pantalla de Diagnóstico |

**Regla general:** si la solución que se te ocurre implica **borrar, reinstalar o empezar de cero**, no la hagas todavía. Es casi siempre el único camino que pierde datos de forma irreversible.
