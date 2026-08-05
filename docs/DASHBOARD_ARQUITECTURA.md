# Dashboard Architecture Document — CuadreApp

**Versión:** 2.0 — 5 de agosto de 2026 (Etapa P.2: multiempresa contra la API real)
**Estado:** implementado
**Alcance:** el Dashboard de Cliente completo — sesión propia, datos reales de `/api/v1/tablero/*`, identidad y composición por cliente.

> La versión 1.1 describía la fase de datos simulados detrás de adaptadores. Ese diseño se cumplió y **cobró su promesa**: conectar la API real fue reemplazar la fuente en una línea de `main.tsx`. Este documento reemplaza al anterior; lo que sigue vigente se conserva textualmente.

---

## 1. Restricciones que esta arquitectura hereda (no negociables)

- **El Dashboard es una aplicación separada: `apps/dashboard`** (DEC-015): build, despliegue, router, ciclo de vida y configuración propios. Comparte con la PWA únicamente paquetes del monorepo. Las apps jamás se importan entre sí (DEC-007).
- **La UI nunca recalcula reglas de negocio** (DEC-011/DEC-013): el tablero _muestra_ veredictos, jamás los deriva. El estado y las banderas de una carga llegan como los decidió el dominio al registrarla.
- **API First** (DEC-009): el Dashboard no lee Supabase; lee la API. Toda escritura, permiso y alcance los decide el servidor.
- **El veredicto antes que los datos** (spec §8.2): cada pestaña abre con una frase que dice qué está pasando y qué hacer.
- **Un solo producto para todas las empresas** (DEC-018): una URL, un build, un código. Lo que cambia es la configuración del cliente, jamás el código.

## 2. La decisión central de la Etapa P.2

El Dashboard estaba construido alrededor de un cliente de demostración. Hoy:

| Antes                                         | Ahora                                                     |
| --------------------------------------------- | --------------------------------------------------------- |
| Identidad en `datos/contexto-cliente.ts`      | Identidad en la base, servida por `GET /tablero/contexto` |
| Pestañas fijas en el marco                    | Pestañas declaradas por el Perfil Operativo               |
| Vista de evidencia elegida por forma del dato | Elegida por el **snapshot** del perfil de la carga        |
| Datos simulados en `src/simulacion/`          | Fixtures en `src/pruebas/`, fuera del build               |
| Sin sesión                                    | Login propio, TokenStore y RBAC del servidor              |

**La empresa la decide el login, nunca la URL.** No hay subdominio, ruta ni parámetro por cliente; no existe forma de pedir el tablero de otra empresa porque la petición no tiene dónde nombrarla.

## 3. Módulos (estructura de `apps/dashboard`)

```
apps/dashboard/src/
  paginas/            Entrar · Hoy · Cargas · Equipos · Suministro
  disposicion/        DisposicionTablero.tsx (marco: marca, identidad, sedes, pestañas)
  componentes/        design system del tablero (§6)
  perfiles/           EL REGISTRO DE VISTAS (§5) — paneles, columnas y evidencia
  datos/
    puertos.ts        EL CONTRATO: FuenteDatosTablero + modelos de lectura
    fuente-api.ts     adaptador real contra /api/v1/tablero/*
    sesion.ts         TokenStore + cliente HTTP único (DEC-014)
    contexto.tsx      la empresa de la sesión, resuelta una vez
    derivaciones.ts   veredictos y candados (presentación, no reglas)
    consulta.ts       Consulta<T> + useConsulta
  pruebas/            fixtures: escenario determinista y fuente simulada
```

## 4. Rutas y sesión

| Ruta          | Contenido                                                        |
| ------------- | ---------------------------------------------------------------- |
| `/entrar`     | Login email + contraseña. No pide ni ofrece elegir empresa       |
| `/hoy`        | Veredicto del día y los paneles que declara el perfil            |
| `/cargas`     | Veredicto, filtros por estado, tabla y panel de evidencia        |
| `/cargas/:id` | La misma pantalla con esa carga seleccionada (deep-link)         |
| `/equipos`    | Consumo por equipo; desvío o llenado según lo que el equipo mida |
| `/suministro` | Entregas y balance — solo en perfiles con tanque del cliente     |

- **La URL es el estado**: pestaña activa, carga abierta y filtros viven en la URL.
- Las rutas de módulos existen siempre; entrar a mano a uno que el perfil no declara redirige a `/hoy`.
- **Sesión (DEC-014):** access token en memoria, refresh con rotación en `localStorage`, renovación única ante 401 y borrado local si también falla. Ningún componente toca tokens.

## 5. Composición por Perfil Operativo (cuarto punto de despacho, DEC-016)

El perfil **declara** en `packages/dominio` qué compone el tablero; `apps/dashboard/src/perfiles/registro.tsx` sabe dibujar cada pieza:

| Vocabulario      | Piezas                                                      |
| ---------------- | ----------------------------------------------------------- |
| `modulos`        | `hoy` · `cargas` · `equipos` · `suministro`                 |
| `panelesHoy`     | `totalizador` · `inventario` · `consumo` · `cargas_del_dia` |
| `columnasCargas` | `galones` · `llegada` · `total_salida` · `llenado`          |
| `vistaEvidencia` | `medidor` · `inventario`                                    |

Perfiles actuales:

- **Medidor Doble:** cuatro módulos, panel de totalizador con Rodillo, columna de galones, evidencia de medidor.
- **Carga sobre Inventario:** sin Suministro (ese cliente no tiene tanque propio), panel de inventario del día con capacidad y % de llenado, cuatro columnas, evidencia de inventario.

**Consecuencias, con su alcance exacto:**

- Un **cliente nuevo** con un perfil existente: cero código. Se crea en la consola y su tablero existe.
- Un **perfil nuevo** que reutiliza piezas existentes: se declara en el dominio; el Dashboard no se toca.
- Un **perfil nuevo con una pieza nueva**: su componente más una línea en el registro. Nunca un `if` en una página, nunca una comparación por cliente. Esto es lo que DEC-016 llama «un perfil es código versionado y probado».

La **vista de evidencia de una carga** se elige por el perfil con el que la carga NACIÓ, no por el actual del cliente: si un cliente cambia de perfil, su historia se sigue leyendo como se capturó.

## 6. Design System

Sin cambios respecto de la v1.1. Tokens en `src/tema.ts`; tipografías Barlow/Barlow Condensed y Yellowtail autoalojadas; los tres colores semánticos de estado son los mismos del flujo del conductor.

**Identidad del cliente (DEC-018):** la base guarda SOLO dos colores; `tema-cliente.ts` deriva hover, activo, superficies, bordes, sombras, gradiente y el texto legible por contraste WCAG. Se aplican como variables CSS sobre el contenedor. El **chrome de CuadreApp no se tiñe**: co-marca, subrayado de pestañas activo, tipografía y pie son del producto; el color del cliente acentúa lo que es suyo (su tarjeta, sus acciones). Hay pruebas que lo afirman en ambos sentidos.

## 7. Capa de datos: puertos y adaptadores

**El contrato** (`datos/puertos.ts`) espeja los endpoints método a método:

```ts
interface FuenteDatosTablero {
  contexto(): Promise<ContextoTablero>;
  resumenHoy(alcance: AlcanceConsulta): Promise<ResumenHoy>;
  listarCargas(filtro: FiltroCargas): Promise<PaginaCargas>;
  detalleCarga(id: string): Promise<DetalleCarga>;
  resumenEquipos(alcance: AlcanceConsulta): Promise<ResumenEquipos>;
  resumenSuministro(alcance: AlcanceConsulta): Promise<ResumenSuministro>;
}
```

**Diferencia deliberada con la v1.1:** la API devuelve **hechos** (conteos, totales, estados) y el adaptador compone el `Veredicto`. La frase que lee el supervisor es copia de producto: vive con la interfaz, no en el servidor. Lo mismo con los candados, que traducen banderas ya decididas por el dominio.

**Fixtures (`src/pruebas/`):** el escenario determinista y su `FuenteSimulada` sobreviven como material de prueba. Cumplen el MISMO contrato: si el contrato cambia y el fixture se queda atrás, deja de compilar.

## 8. Estados de carga, error y vacío

Un solo patrón (`datos/consulta.ts`), como en la v1.1. Sumado en esta etapa: **las cuatro puertas por las que un usuario puede quedarse sin tablero** tienen pantalla propia y probada (`clasificarFalla`):

| Falla                      | Qué ve el usuario                                                 |
| -------------------------- | ----------------------------------------------------------------- |
| Sesión vencida             | Vuelve al login                                                   |
| Usuario sin empresa        | «Tu usuario no tiene una empresa asignada» + a dónde ir           |
| Usuario sin `tablero.leer` | «Tu usuario no tiene acceso al tablero»                           |
| Cualquier otra             | `EstadoError` con reintento y el `request_id` cuando la API lo da |

**Vacío ≠ error:** cero cargas hoy, cero equipos o cero entregas son estados legítimos con su propio mensaje.

**Cifras sin línea base:** sin entregas registradas, la existencia estimada y la autonomía viajan en `null` y se muestran «—» con la explicación. Es preferible a un número que el supervisor no pueda auditar (spec §: `existencia = entregado − despachado + existencia_inicial`, y esa inicial todavía no se administra).

## 9. Estrategia de actualización de datos

Sin cambios: carga al entrar, refresco manual visible, polling suave solo en `/hoy` (60 s, pausado con `visibilitychange`). Sin websockets — el ritmo del negocio no los pide.

## 10. Responsive y accesibilidad

Sin cambios respecto de la v1.1: móvil primero, contraste AA verificado, el estado nunca solo por color, foco visible, tablas con encabezados reales, `prefers-reduced-motion` respetado.

## 11. Alcance y sedes

El alcance lo impone la API a partir de la sesión:

- Usuario **con** `sede_id`: ve solo esa sede; pedir otra responde 403.
- Usuario **sin** `sede_id`: ve todas las sedes de su cliente y puede filtrar con el selector del marco.
- El totalizador se muestra solo con un medidor en alcance: sumar los de varias sedes no significaría nada.

## 12. Fuera del alcance de esta etapa (explícito)

Registro de entregas (Etapa 3 — sin él, Suministro muestra su estado vacío); existencia inicial administrable; acciones de escritura (corregir carga, cerrar día, «Pedir a Lubryco»); vista multicliente de Lubryco (Etapa 4); pantalla de administración de usuarios supervisores (hoy es un alta manual, documentada en `OPERACIONES.md` §8).

## 13. Criterio de terminado

Un supervisor entra con su usuario y ve la operación de SU empresa, con su identidad y los módulos de su perfil, sin que nadie haya escrito código para él; un supervisor de otra empresa ve la suya y jamás la ajena; `pnpm verificar` en verde.
