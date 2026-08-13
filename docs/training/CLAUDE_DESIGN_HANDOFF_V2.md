# Handoff a Claude Design — v2 · manuales de clientes

> **13-ago-2026.** Reemplaza a `CLAUDE_DESIGN_HANDOFF.md` (v1). Qué cambió y
> por qué: el producto cerró P.2/P.3 (ciclo de acceso del Dashboard completo),
> el kit ya lo incorpora, y el alcance del paquete se redefinió — **solo
> manuales de clientes, cortos**. Este documento dice QUÉ producir; la ley de
> CÓMO se ve sigue siendo `TRAINING_DESIGN_SYSTEM.md` + `14_Sistema/`
> (T4, sin cambios). No hace falta preguntar qué cambió en P.2/P.3: todo lo
> que un cliente ve hoy está ya en los catálogos y manuales fuente.

---

## 1. El paquete: 10 piezas, en este orden

| #   | Pieza                                          | Fuente de contenido (cerrada) | Páginas máx.         |
| --- | ---------------------------------------------- | ----------------------------- | -------------------- |
| 1   | **Operador Android · Medidor Doble**           | `01_Operadores/OP-AND-MD.md`  | 3 + 1 de instalación |
| 2   | **Operador iPhone · Medidor Doble**            | `01_Operadores/OP-IOS-MD.md`  | 3 + 1 de instalación |
| 3   | **Operador Android · Carga sobre Inventario**  | `01_Operadores/OP-AND-CI.md`  | 3 + 1 de instalación |
| 4   | **Operador iPhone · Carga sobre Inventario**   | `01_Operadores/OP-IOS-CI.md`  | 3 + 1 de instalación |
| 5   | **Dashboard Cliente · Medidor Doble**          | `02_Supervisores/SUP-MD.md`   | 3                    |
| 6   | **Dashboard Cliente · Carga sobre Inventario** | `02_Supervisores/SUP-CI.md`   | 3                    |
| 7   | Quick Guide Operador · Medidor Doble           | `10_QuickGuides/QG-OP-MD.md`  | 1                    |
| 8   | Quick Guide Operador · Carga sobre Inventario  | `10_QuickGuides/QG-OP-CI.md`  | 1                    |
| 9   | Quick Guide Dashboard · Medidor Doble          | `10_QuickGuides/QG-SUP-MD.md` | 1                    |
| 10  | Quick Guide Dashboard · Carga sobre Inventario | `10_QuickGuides/QG-SUP-CI.md` | 1                    |

**Fuera del paquete:** `ADM` y `QG-ADM` (herramienta interna de Lubryco — la
maneja su administrador, no se diagraman para clientes), los videos (guiones
cerrados en `08_Storyboards/`, producción posterior) y la Academia.

**La audiencia de las piezas 5-6 y 9-10 no es «el supervisor»:** es cualquier
usuario del Dashboard del cliente — gerente general, de operaciones o de
mantenimiento, supervisor o administrador del cliente. Los IDs `SUP-*` son
históricos; los títulos visibles no deben decir «supervisor» como cargo, y
jamás «Admin Lubryco».

## 2. El presupuesto de páginas cambió — esta regla manda

El sistema pedagógico evolucionó: **2 páginas excelentes valen más que 8
correctas**. Los layouts de `05_Layouts/` conservan la definición de bloques,
pero sus totales de páginas (14–22) quedaron reemplazados por los máximos de
la tabla de arriba (cada layout lo advierte en su cabecera).

Cómo caber: mucha imagen, muy poco texto, **una tarea por bloque**. El manual
fuente es más largo que el manual final a propósito — es la cantera, no la
página. Qué va a página y qué no:

- **Va:** el flujo feliz completo en capturas numeradas, los 2-3 «nunca» que
  rompen la operación, el bloque «si algo pasa» comprimido a tabla, y (en
  operadores) la página de instalación de su plataforma (Capítulo 0 de la
  fuente).
- **No va:** todo «Qué está ocurriendo» narrativo (es contexto del formador),
  las preguntas frecuentes completas (elegir 2-3), y cualquier cosa que la
  captura ya diga sola.
- La excepción de la página extra de instalación existe porque instalar y
  enrolar ocurre UNA vez y con acompañamiento distinto: separable, arrancable,
  y distinto entre Android y iPhone. Después de instalada, la operación es
  idéntica — por eso las Quick Guides no se separan por plataforma.

## 3. Material disponible por pieza

- **Capturas:** `12_Capturas/CATALOGO.md` — 59 catalogadas, **38 producidas**
  (14 de operador, 13 del Dashboard, 11 del Admin fuera de alcance). Las 13
  del Dashboard están regeneradas contra el producto P.3 el 13-ago-2026,
  incluido el ciclo de acceso completo (`dsh-07`–`dsh-13`) y la evidencia de
  inventario (`dsh-04`). Las 21 de operador pendientes tienen motivo
  individual en el catálogo (16 exigen teléfono real).
- **Fotografías:** `00_Fuente/inventario-fotografico.md`. Producidas: marca +
  Fill-Rite `F-02`/`F-03`. Las 17 de campo son de la visita a planta
  (pendiente, `13_Produccion/orden-fotografica.md`). **Se puede diagramar sin
  ellas**: cada hueco fotográfico se deja como marcador con su ID `F-*`.
- **Zooms:** `00_Fuente/inventario-zooms.md` (51). Los que recortan capturas
  ya producidas pueden hacerse ya.
- **Íconos:** `13_Produccion/catalogo-iconos.md` (37; 17 en P0).
- **Comparativas:** `13_Produccion/comparativas.md` (`K-01`–`K-09`).
- **Componentes, tipos de página, callouts, calidad:** `14_Sistema/` — norma
  T4 intacta.

## 4. Identidad genérica (regla de generalización)

El manual base es **universal**. Prohibido como identidad del documento:
nombres de clientes reales, sedes reales, placas reales, operadores reales, o
«caso {cliente}». Los perfiles conservan su nombre funcional (**Medidor
Doble**, **Carga sobre Inventario**). Los datos de ejemplo son los del mundo
demo neutro que ya usan capturas y fuentes (Agroindustrias del Valle,
Constructora Andina, T-04, CT-11…) — y el ejemplo pedagógico del inventario
es `150 + 600 = 750`, como ejemplo, nunca como regla.

## 5. Personalización por cliente (posterior, opcional)

El contenido operativo NO cambia por cliente. Una edición personalizada toca
únicamente:

1. **Logo del cliente** (portada/cabecera — nunca dentro de una captura).
2. **Nombre comercial** (portada y pies de página).
3. **Sede** (la línea de ubicación de la portada).
4. **Acento de color**, solo si el Design System del cliente lo define, y
   solo en los elementos que la norma permite acentuar.

Todo lo demás — capturas, textos, callouts, cifras demo — es del manual base.
Si una personalización parece requerir cambiar contenido, no es
personalización: es un perfil nuevo y vuelve por el kit.

## 6. Qué Claude Design NO puede reinterpretar

- **La norma:** `TRAINING_DESIGN_SYSTEM.md` §Prohibiciones (los 12 ítems),
  los principios `PR-*` con su precedencia, los tipos `T-*`, los callouts
  `CO-*` y los criterios `Q-*`. Un vacío es un defecto del sistema — se
  reporta, no se decide en la página.
- **El texto de interfaz:** todo lo entrecomillado en los catálogos es
  literal del código. No se parafrasea, no se «mejora», no se traduce.
- **Los máximos de páginas** de la tabla §1.
- **El eje por momentos:** las páginas siguen el trabajo, no las pantallas.
  Los títulos jamás nombran pantallas.
- **La regla de imagen real:** capturas del arnés y fotografías reales.
  Cero mockups, cero retoques, cero recreaciones.
- **La cadena de verificación:** cualquier corrección de contenido va a
  `00_Fuente/` y a los manuales, y debe dejar verde
  `node scripts/verificar-training-kit.mjs`.

## 7. Orden de producción y validación

```
1. QG-OP-MD + QG-SUP-MD          ← una guía por perfil, no por plataforma
2. OP-AND-MD + SUP-MD
3. ►►► VALIDACIÓN CON USUARIOS REALES ◄◄◄  (en planta, impreso)
4. OP-IOS-MD
5. VISITA A PLANTA               ← 17 fotografías + planos de video, una sesión
6. OP-AND-CI + OP-IOS-CI + SUP-CI + QG-OP-CI + QG-SUP-CI
```

La validación del paso 3 no se salta: es lo que impide diagramar 10 piezas
sobre un formato que nadie probó. Criterio de terminado del paquete: **un
operador que nunca ha usado la aplicación registra su primera carga solo, el
mismo día que recibe el material; un usuario nuevo del Dashboard entra con su
temporal, crea su contraseña y encuentra su primera respuesta sin llamar a
nadie.**

## 8. Estado de las fuentes (para no re-auditar)

Todo lo de esta tabla quedó verificado contra el código el 13-ago-2026, con
`verificar-training-kit.mjs` en verde (33 momentos · 38 pantallas · 7 cursos):

| Qué                                                                                                                                                                              | Estado                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Ciclo de acceso del Dashboard (login, temporal de UN ingreso, cambio obligatorio y voluntario, recuperación, desactivado, sin permiso, sesión expirada, `Soporte: {referencia}`) | En fuentes: `DSH-07`–`DSH-12`, momentos `S-00`/`S-08`/`S-09`, decisiones 0/8/9 de ambos SUP, fichas `E-24`–`E-27`, callouts `C-62`–`C-67` |
| Bienvenida del cliente nuevo y transición a la primera carga                                                                                                                     | `DSH-11`, Decisión 8, capturas por perfil                                                                                                 |
| Excel por Perfil Operativo                                                                                                                                                       | `DSH-02` + Decisión 7 de cada SUP (columnas reales de cada perfil)                                                                        |
| Identidad dinámica del cliente                                                                                                                                                   | Visible en todas las capturas `dsh-*` (tarjeta del cliente por datos)                                                                     |
| Instalación Android/iPhone + enrolamiento + qué NO borrar + cambio de teléfono                                                                                                   | Capítulo 0 de los cuatro manuales de operador                                                                                             |
| Microcopy del operador post-fixes del 10-ago (el botón nombra lo que falta, «Operadores de esta sede»)                                                                           | Catálogo `PWA-06`/`PWA-07`/`PWA-11`/`PWA-12`/`PWA-13`                                                                                     |
| Divergencias producto/documentación detectadas y NO corregidas                                                                                                                   | `docs/HALLAZGOS_PRODUCTO_TRAINING_V2.md`                                                                                                  |
