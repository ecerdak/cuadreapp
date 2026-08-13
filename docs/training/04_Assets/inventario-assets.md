# Inventario de assets — estado por pieza

> **v2 (13-ago-2026).** Este documento clasifica; no inventaría. Cada familia
> de assets tiene UN inventario dueño y aquí solo se dice en qué estado está
> cada cosa y dónde vive su lista completa. La versión anterior de este
> archivo era de T1 y contradecía la norma T4 (pedía ilustraciones contra
> `PR-05`, 6 íconos contra el catálogo de 37 y 7 plantillas contra los 13
> tipos `T-*`): quedó reemplazada por esta.

| Familia                      | Inventario dueño                                                             |
| ---------------------------- | ---------------------------------------------------------------------------- |
| Capturas de pantalla         | `12_Capturas/CATALOGO.md` (generado de `scripts/capturas/manifiesto.mjs`)    |
| Fotografías reales           | `00_Fuente/inventario-fotografico.md` + `13_Produccion/orden-fotografica.md` |
| Zooms                        | `00_Fuente/inventario-zooms.md`                                              |
| Íconos                       | `13_Produccion/catalogo-iconos.md`                                           |
| Comparativas                 | `13_Produccion/comparativas.md`                                              |
| Marca (logos, íconos de app) | `apps/*/src/marca/assets/` + `apps/pwa/public/iconos/` (`F-90` a `F-93`)     |

---

## Estado al cierre del Training Kit Clientes v2 (13-ago-2026)

### EXISTE Y SIGUE VÁLIDO

- **14 capturas de operador** (`and-*`, `ios-*` producidas): la PWA no cambió de UI en P.2/P.3 — los fixes del 10-ago están reflejados en el catálogo de pantallas, no alteran las capturas existentes.
- **11 capturas del Admin** (`adm-*`): válidas, pero el manual `ADM` es **interno de Lubryco** y queda fuera del paquete de manuales de clientes.
- **Fotografías de marca** `F-90` a `F-93` (logos Lubryco, íconos de instalación).
- **Fill-Rite `F-02`/`F-03`** (carátula antes/después): válidas Y con doble uso — guía de encuadre en la cámara de la PWA y evidencia demo del Dashboard. Ver clasificación fotográfica abajo.

### REGENERADO POR CAMBIO DE UI (hecho, 13-ago-2026)

- **Las 6 capturas `dsh-` originales**: se produjeron antes de P.2 (Dashboard con datos simulados). Regeneradas contra el producto real de P.3 — ahora muestran el enlace «Cambiar contraseña» y el Excel por perfil.

### NUEVO (hecho, 13-ago-2026)

- **7 capturas del ciclo de acceso del Dashboard** (`dsh-07` a `dsh-13`): entrar, crear contraseña, cambiar, recuperar, bienvenida por perfil (2) y acceso desactivado.
- **`dsh-04_evidencia-inventario`**: estaba bloqueada («exige un cambio de producto») — el arnés por escenarios la produce sin tocar producto. Desbloqueada y producida.

### PENDIENTE (sin cambio de estado)

- **21 capturas de operador** bloqueadas con motivo individual en el CATÁLOGO: 16 exigen teléfono físico (cámara real) y 5 un entorno/instante particular.
- **17 fotografías de campo** (bloques A–C de la orden fotográfica): siguen siendo **el único bloqueo que depende de un tercero** — la visita a planta.
- **Zooms**: los ~28 cuya captura base ya existe se pueden recortar ya; el resto espera sus capturas.
- **Íconos**: 17 en P0 según el catálogo congelado de 37.

### NO SE NECESITA (para el paquete de manuales de clientes)

- Capturas `adm-*`, guía `QG-ADM`, layouts/checklists/storyboard de `ADM`: el manual del administrador es interno.
- Ilustraciones, renders o diagramas dibujados: prohibidos por `PR-05`. No existe esa familia de assets.

---

## Clasificación de las fotografías Fill-Rite (regla de generalización)

El manual base es universal; la fotografía se clasifica según qué tan atada
está a un hardware concreto:

| Pieza                                                                | Clase                         | Regla                                                                                                                                                                                                                       |
| -------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `F-02`/`F-03` (carátula Serie 900)                                   | **Específica del hardware**   | Enseña a leer tanda y totalizador en ESTE tipo de medidor. Sirve para cualquier cliente que use un medidor de doble registro equivalente; el manual no la presenta como «el medidor de un cliente», sino como «el medidor». |
| `F-05`–`F-07` (carátula cortada · reflejo · bien tomada, pendientes) | **Universales**               | Enseñan encuadre, no hardware: valen para cualquier medidor.                                                                                                                                                                |
| Fotos de campo con entorno de planta (bloques A–C, pendientes)       | **Reemplazables por cliente** | La versión genérica usa la planta de la visita SIN branding visible del cliente; una versión personalizada puede re-fotografiar el mismo plano en la planta del cliente.                                                    |
| Logos de cliente                                                     | **Identidad del cliente**     | Jamás en el manual base. Entran solo en la personalización (ver `CLAUDE_DESIGN_HANDOFF_V2.md`).                                                                                                                             |
