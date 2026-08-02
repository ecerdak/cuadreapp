# Dashboard Architecture Document — CuadreApp

**Versión:** 1.0 — 1 de agosto de 2026
**Estado:** propuesta en revisión del propietario del producto — sin componentes implementados
**Alcance:** únicamente frontend, con datos simulados detrás de adaptadores. Sin consumo de la API, sin consultas reales.

---

## 1. Restricciones que esta arquitectura hereda (no negociables)

- **El dashboard vive en la misma PWA, ruta `/tablero`** (spec §4, Bible §7): un solo despliegue en Vercel. No es una app nueva del monorepo.
- **La UI nunca recalcula reglas de negocio** (DEC-011/DEC-013): el dashboard _muestra_ veredictos, jamás los deriva. `COLOR_ESTADO`/`TEXTO_ESTADO` mapean estados que vienen dados.
- **Cuando llegue la conexión real, será API First** (DEC-009): el dashboard no leerá Supabase; leerá endpoints de la API. **Consecuencia clave de esta etapa: el contrato de los adaptadores que definamos aquí se convierte en el contrato de los futuros endpoints de lectura `/api/v1/tablero/*`** — el dashboard diseña primero lo que la API servirá después.
- **El veredicto antes que los datos** (spec §8.2): cada pestaña abre con una frase que dice qué está pasando y qué hacer. Es el principio rector de la UI, no un adorno.

## 2. Qué dicen los mockups aprobados (análisis)

Del análisis de `docs/mockups/cuadre_dashboard_trebol.jsx`:

| Elemento del mockup                                                                                                                                                                                       | Qué es                                                                          | Decisión                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `PESTANAS`: Hoy · Cargas · Equipos · Suministro                                                                                                                                                           | Navegación de 4 pestañas (spec §8.2)                                            | Rutas de primer nivel                                                                            |
| `Rodillo`                                                                                                                                                                                                 | Totalizador en dígitos de rodillo (6 enteros + décima), evoca el medidor físico | Componente del design system                                                                     |
| `Chip`, `COLOR_ESTADO`/`TEXTO_ESTADO` (`Cuadra`/`Revisar`/`No cuadra`, verde/ámbar/rojo)                                                                                                                  | Semántica de estado de carga                                                    | Compartido con el flujo del conductor (misma paleta que `ui/mensajes.ts`)                        |
| `Candado`                                                                                                                                                                                                 | Visualización de los 3 candados aritméticos en el detalle de una carga          | Componente del detalle                                                                           |
| Secciones: "Acción de hoy", "Autonomía restante", "Cargas que cuadran", "Consumo por día" (14 días), "Consumo por equipo", "Desvío %", "Despachados sin equipo asignado", detalle con fotos antes/después | Contenido por pestaña                                                           | Modelos de lectura de la capa de datos                                                           |
| `CARGAS`/`ENTREGAS`/`CONSUMO`/`BALANCE` con aritmética que cierra ("si alguien saca la calculadora, cuadra")                                                                                              | Datos de demostración deliberadamente coherentes                                | Requisito para nuestros datos simulados (§7)                                                     |
| `BotonExcel` + `xlsx`                                                                                                                                                                                     | Export a Excel                                                                  | **Pospuesto** a la conexión real (exportar datos simulados sería engañoso)                       |
| Marca (`Logotipo`, `Placa`, fuentes Google)                                                                                                                                                               | Identidad CuadreApp                                                             | Se adopta, con fuentes **autoalojadas** — la CSP de la Etapa H no permite `fonts.googleapis.com` |

## 3. Módulos (estructura dentro de `apps/pwa`)

```
src/tablero/
  paginas/            Hoy.tsx · Cargas.tsx · DetalleCarga.tsx · Equipos.tsx · Suministro.tsx
  disposicion/        DisposicionTablero.tsx (marco: marca, pestañas, contenido)
  componentes/        design system del tablero (§6)
  datos/
    puertos.ts        ← EL CONTRATO: interfaz FuenteDatosTablero + modelos de lectura
    fuente-simulada.ts  adaptador de datos simulados (única implementación en esta etapa)
    proveedor.tsx     React context que inyecta la fuente; useFuenteTablero()
    consulta.ts       tipo Consulta<T> + hook useConsulta (§8)
  simulacion/
    escenario.ts      generador determinista del escenario de demostración
```

El flujo del conductor no se toca. `src/ui/` (básicos, mensajes, números) se comparte; lo específico del tablero vive en `tablero/componentes/`.

## 4. Rutas y modelo de navegación

Se introduce `react-router-dom` (hasta hoy la PWA es una máquina de estados sin URLs; el tablero exige deep-linking):

| Ruta                  | Contenido                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `/`                   | Flujo del conductor (intacto, sigue siendo la máquina de estados actual)                     |
| `/tablero`            | Redirige a `/tablero/hoy`                                                                    |
| `/tablero/hoy`        | Veredicto del día, existencia estimada (Rodillo), autonomía, consumo 14 días, cargas del día |
| `/tablero/cargas`     | Veredicto (X cuadran de Y), tabla con filtros por estado                                     |
| `/tablero/cargas/:id` | Detalle: fotos antes/después, 4 lecturas, candados, banderas                                 |
| `/tablero/equipos`    | Veredicto (quién se salió de su patrón), tabla gal/h·gal/km y desvío %                       |
| `/tablero/suministro` | Veredicto (última/próxima entrega), remisiones, balance entregado−despachado                 |

- **La URL es el estado**: pestaña activa, carga abierta y filtros (`?estado=inconsistente`) viven en la URL — un supervisor puede compartir un enlace a una carga problemática.
- **Code-splitting obligatorio**: `/tablero/*` se carga con `lazy()` — el celular del conductor jamás descarga el bundle del tablero (spec: gama media, precache del shell no crece).
- Pestañas como `<nav>` con `aria-current="page"`; en móvil, pestañas fijas abajo (pulgar), en escritorio arriba (mockup).
- En esta etapa `/tablero` muestra un **banner permanente "Modo demostración — datos simulados"**; el login real llega con la conexión.

## 5. Design System

- **Tokens** en `tablero/componentes/tema.ts`, tomados del mockup: fondo `#0B1219`, panel `#111C26`, línea `#22374A`, texto `#E7EEF6`, suave `#8AA0B6`, y la semántica verde `#3FAE7E` / ámbar `#E2A233` / rojo `#E2594C`; marca amarillo `#F5E01B`, azul `#4A7CAB`. Un solo lugar; los componentes no inventan colores.
- **Tipografías**: Barlow/Barlow Condensed (UI) y Yellowtail (solo logotipo), **autoalojadas** en `assets/` por la CSP. Si el peso preocupa, fallback documentado a `system-ui` conservando la escala.
- Los colores semánticos de estado son **los mismos tres** del flujo del conductor: un estado se ve igual en el celular y en el tablero.

## 6. Componentes compartidos (catálogo)

| Componente        | Propósito                                                         | Estados propios                      |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------ |
| `VeredictoBanner` | La frase de arriba de cada pestaña; `aria-live="polite"`          | por severidad (ok/atención/problema) |
| `Rodillo`         | Dígitos de rodillo del totalizador                                | —                                    |
| `ChipEstado`      | Cuadra/Revisar/No cuadra                                          | —                                    |
| `TarjetaMetrica`  | Cifra grande + rótulo + contexto ("estimada")                     | esqueleto                            |
| `TablaDatos`      | Tabla accesible (th/scope, caption); en móvil colapsa a tarjetas  | esqueleto, vacío                     |
| `BarrasConsumo`   | Consumo por día (14 días), CSS puro, sin librería de gráficas     | esqueleto, vacío                     |
| `Candados`        | Los 3 candados aritméticos de una carga (visual del detalle)      | —                                    |
| `ParFotos`        | Antes/después con rótulo de momento                               | cargando, sin foto                   |
| `EstadoVacio`     | Ilustración ligera + mensaje accionable ("Aún no hay cargas hoy") | —                                    |
| `EstadoError`     | Mensaje + botón Reintentar + request_id cuando exista             | —                                    |
| `Esqueleto`       | Bloques de carga con `prefers-reduced-motion` respetado           | —                                    |

## 7. Capa de datos: puertos y adaptadores

**El contrato** (`datos/puertos.ts`) — modelos de _lectura_ pensados para la pantalla, no filas de base de datos:

```ts
interface FuenteDatosTablero {
  resumenHoy(): Promise<ResumenHoy>; // veredicto, existencia, autonomía, consumo14d, cargasDeHoy
  listarCargas(filtro: FiltroCargas): Promise<PaginaCargas>;
  detalleCarga(id: string): Promise<DetalleCarga>; // lecturas, banderas, candados, urls de fotos
  resumenEquipos(): Promise<ResumenEquipos>; // gal/h, desvío %, veredicto
  resumenSuministro(): Promise<ResumenSuministro>; // remisiones, balance, próxima entrega
}
```

**Adaptador de esta etapa — `FuenteSimulada`:**

- El escenario (`simulacion/escenario.ts`) es **determinista** y su aritmética **cierra**, como en el mockup: las tandas suman el totalizador y los galones por equipo suman el despachado.
- Los estados y banderas de las cargas simuladas **no se inventan: se calculan pasando cada carga simulada por `validarCarga` de `@cuadreapp/dominio`** — ni siquiera los datos falsos reinterpretan reglas, y el escenario incluye a propósito un salto de totalizador y una carga con advertencia para ejercitar toda la UI.
- Simula latencia (300–800 ms) para que esqueletos y estados de carga sean reales, y expone un conmutador de fallos (`?simular=error` en desarrollo) para ver `EstadoError` sin tocar código.
- Las fotos simuladas son las del mockup (data-URIs de la foto real del Fill-Rite).

**Adaptador futuro — `FuenteApi`** (fuera de esta etapa): misma interfaz, implementada sobre el `ClienteHttp` único (DEC-014) contra endpoints nuevos `/api/v1/tablero/*` que espejan el contrato método a método. Autenticación y RBAC (`supervisor`/`admin_cliente` + permisos nuevos `tablero.leer`) llegan con él.

**Inyección:** `ProveedorDatosTablero` (context) recibe la fuente en la raíz del tablero. **Los componentes solo conocen `useFuenteTablero()` y los modelos de lectura** — reemplazar simulado por real es cambiar una línea en la composición, cero cambios en componentes. Esa es la garantía que pediste, y queda verificable: ninguna página importa `fuente-simulada` directamente (regla de lint futura si hace falta).

## 8. Estados de carga, error y vacío

Un solo patrón para todo el tablero (`datos/consulta.ts`):

```ts
type Consulta<T> =
  | { estado: "cargando" } // → Esqueleto de la sección
  | { estado: "error"; detalle: string; reintentar: () => void } // → EstadoError
  | { estado: "listo"; datos: T }; // T decide si hay EstadoVacio
```

`useConsulta(fn)` ejecuta el método del puerto, gestiona la transición y expone `reintentar`. Reglas: **nunca** un spinner de página completa (cada sección carga por su lado, el marco siempre responde); vacío ≠ error (cero cargas hoy es un estado legítimo con mensaje propio); todo error ofrece reintento y mostrará `request_id` cuando exista fuente real.

## 9. Estrategia de actualización de datos

- **Carga al entrar** a cada ruta + **refresco manual** visible (botón con hora del último dato: "Actualizado 10:42").
- **Polling suave solo en `/tablero/hoy`** (60 s), pausado con `visibilitychange` cuando la pestaña no está visible. Las demás rutas refrescan al navegar o a mano.
- Sin caché cliente sofisticada en esta etapa: los modelos de lectura son pequeños; si la fuente real lo pide, la caché se agrega **dentro** del adaptador (los componentes no se enteran).
- Descartado deliberadamente: websockets/realtime — el ritmo del negocio es ~6 cargas/día; polling sobra y no compromete a la API a nada.

## 10. Responsive y accesibilidad

- **Móvil primero** (el supervisor está en campo), punto de quiebre único a escritorio (~1024 px) donde las tablas muestran todas sus columnas; en móvil `TablaDatos` colapsa a tarjetas apiladas — nunca scroll horizontal de página.
- Contraste AA verificado sobre el fondo oscuro para texto y los tres colores semánticos; el estado nunca se comunica solo por color (siempre chip con texto).
- Foco visible en todo interactivo; navegación completa por teclado; `VeredictoBanner` con `aria-live`; tablas con encabezados reales; tap targets ≥44 px; `prefers-reduced-motion` respetado en esqueletos y transiciones.

## 11. Fuera del alcance de esta etapa (explícito)

Login real y RBAC del tablero; endpoints `/api/v1/tablero/*`; export a Excel; acciones de escritura (corregir carga, cerrar día, "Pedir a Lubryco" — spec §8.2, requieren API); vista multicliente de Lubryco (Etapa 4); URLs firmadas de fotos reales.

## 12. Criterio de terminado

Las 4 pestañas + detalle de carga navegables con datos simulados cuyo veredicto lo calculó el dominio; esqueletos, vacíos y errores visibles y ejercitables; responsive móvil/escritorio; accesibilidad del §10 verificada; el bundle del conductor no crece (split verificado en el build); `pnpm verificar` en verde.
