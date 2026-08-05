# Troubleshooting · ADM — Administrador · Consola completa

> Formato: **problema → posible causa → solución**. El problema está escrito como lo dice el usuario, no como lo describiría un técnico: así se encuentra buscando.
> Detalle y «qué NO hacer» en [`../00_Fuente/biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md) · Manual: [`../03_Admin/ADM.md`](../03_Admin/ADM.md)

---

## Matriz

| Problema (lo que dice el usuario)                  | Posible causa                                                | Solución                                                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| «El cliente no ve su logo o sus colores»           | Configuración anterior en caché                              | PWA: abrir con señal para refrescar el catálogo. Dashboard: recargar. NO resubir el logo varias veces. `E-ADM-01` |
| «Rechaza el color que puse»                        | Solo se acepta `#RRGGBB`                                     | Usar el selector de color, que siempre entrega el formato correcto. `E-ADM-02`                                    |
| «Cambié el perfil y la historia se ve rara»        | No es un error: cada carga conserva su perfil de origen      | Ninguna acción. NO intentar migrar cargas viejas. `E-ADM-03`                                                      |
| «El dispositivo del cliente dejó de funcionar»     | Se revocó, se re-enroló, o el usuario técnico quedó inactivo | Dispositivos → «Reenrolar»: revoca y da código nuevo en un paso. `E-ADM-04`                                       |
| «Se perdió un teléfono»                            | Extravío o robo                                              | Dispositivos → «Revocar», de inmediato. La sesión deja de servir en el acto. `E-ADM-05`                           |
| «El operador dice que su código no sirve»          | El código venció (7 días) o ya se usó                        | Generar otro desde la ficha del cliente → Operación → Dispositivos. `E-OP-02`                                     |
| «No encuentro dónde subir el logo»                 | Se busca en el diálogo de crear cliente, donde no está       | El logo se sube en la **ficha** del cliente → Identidad, después de crearlo.                                      |
| «¿Puedo dejar el totalizador de instalación en 0?» | Sede nueva sin conocer la lectura física                     | No conviene: es la base de todo el histórico. Verificarlo contra la carátula antes de guardar.                    |

---

## Cuándo escalar

| Situación                             | A quién                     | Con qué                                                |
| ------------------------------------- | --------------------------- | ------------------------------------------------------ |
| Algo que exige tocar la base de datos | Equipo técnico de CuadreApp | El request_id de la respuesta y qué se intentaba hacer |

**Regla general:** si la solución que se te ocurre implica **borrar, reinstalar o empezar de cero**, no la hagas todavía. Es casi siempre el único camino que pierde datos de forma irreversible.
