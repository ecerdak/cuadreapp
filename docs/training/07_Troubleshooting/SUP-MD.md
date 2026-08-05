# Troubleshooting · SUP-MD — Supervisores · Dashboard Medidor Doble

> Formato: **problema → posible causa → solución**. El problema está escrito como lo dice el usuario, no como lo describiría un técnico: así se encuentra buscando.
> Detalle y «qué NO hacer» en [`../00_Fuente/biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md) · Manual: [`../02_Supervisores/SUP-MD.md`](../02_Supervisores/SUP-MD.md)

---

## Matriz

| Problema (lo que dice el usuario)      | Posible causa                                                                | Solución                                                                                               |
| -------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| «Una carga dice No cuadra»             | El dominio marcó una inconsistencia; la más común es un salto de totalizador | Abrir su evidencia: dos fotos y tres candados. El mensaje explica qué pasó. NO asumir robo. `E-SUP-01` |
| «Falta la foto final»                  | El operador cerró el registro sin la segunda foto                            | Hablar con el operador **hoy**; mañana ya no la recuerda. La foto no se recupera. `E-SUP-02`           |
| «Un equipo tiene desvío alto»          | Consumo fuera de su patrón histórico                                         | Revisar mantenimiento antes que sospechar: inyectores, filtro, motor encendido en esperas. `E-SUP-03`  |
| «El operador no ve un equipo nuevo»    | El catálogo del teléfono no se ha refrescado                                 | Que abra la app con señal unos segundos. NO re-enrolar. `E-SUP-04`                                     |
| «Los números no cuadran con mi conteo» | La existencia es estimada por balance, no medida                             | Contrastar con las remisiones en «Suministro». Margen ±2 %. `E-SUP-05`                                 |
| «El totalizador saltó mucho»           | Hubo cargas sin registrar entre dos registros                                | Preguntar quién cargó sin la app ese día. El combustible fue contado; falta saber a qué equipo fue.    |

---

## Cuándo escalar

| Situación                                        | A quién                  | Con qué                                       |
| ------------------------------------------------ | ------------------------ | --------------------------------------------- |
| Carga que no cuadra y el operador no la recuerda | Administrador de Lubryco | El código de soporte de la carga (request_id) |

**Regla general:** si la solución que se te ocurre implica **borrar, reinstalar o empezar de cero**, no la hagas todavía. Es casi siempre el único camino que pierde datos de forma irreversible.
