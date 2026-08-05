# Troubleshooting · SUP-CI — Supervisores · Dashboard Carga sobre Inventario

> Formato: **problema → posible causa → solución**. El problema está escrito como lo dice el usuario, no como lo describiría un técnico: así se encuentra buscando.
> Detalle y «qué NO hacer» en [`../00_Fuente/biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md) · Manual: [`../02_Supervisores/SUP-CI.md`](../02_Supervisores/SUP-CI.md)

---

## Matriz

| Problema (lo que dice el usuario)                | Posible causa                                                    | Solución                                                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| «Una carga dice No cuadra»                       | En este perfil casi siempre es despacho en cero o falta de fotos | Abrir la evidencia y revisar las dos fotos y las tres cifras.                                           |
| «Falta una foto»                                 | El operador cerró sin capturar el carrotanque                    | Hablar con el operador **hoy**. `E-SUP-02`                                                              |
| «¿Cómo sé que no inflaron los galones?»          | Duda legítima sobre el control del perfil                        | La cifra debe coincidir con la remisión de Lubryco y con las dos fotos; el total lo calcula el sistema. |
| «Las columnas de tanda salen vacías en el Excel» | Este perfil no tiene tanda ni totalizador                        | Es correcto, no un error del archivo.                                                                   |
| «Un carrotanque tiene desvío alto»               | Consumo fuera de patrón                                          | Revisar mantenimiento antes de sospechar. `E-SUP-03`                                                    |
| «El operador no ve un carrotanque nuevo»         | Catálogo sin refrescar                                           | Que abra la app con señal unos segundos. `E-SUP-04`                                                     |

---

## Cuándo escalar

| Situación                                        | A quién                  | Con qué                                       |
| ------------------------------------------------ | ------------------------ | --------------------------------------------- |
| Carga que no cuadra y el operador no la recuerda | Administrador de Lubryco | El código de soporte de la carga (request_id) |

**Regla general:** si la solución que se te ocurre implica **borrar, reinstalar o empezar de cero**, no la hagas todavía. Es casi siempre el único camino que pierde datos de forma irreversible.
