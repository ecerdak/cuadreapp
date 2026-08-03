# Módulo Admin — Arquitectura (piloto interno Sacyr)

**Objetivo:** que Lubryco administre CuadreApp sin tocar la base de datos.
Consola operativa, no constructor. Respeta la arquitectura congelada:
API First (DEC-009), Thin API (DEC-011), RBAC propio (DEC-004),
observabilidad (DEC-012), Security First (DEC-013), apps separadas (DEC-015).

## 1. Modelos REUTILIZADOS (el esquema ya es multicliente)

| Necesidad del Admin      | Modelo existente                                                       | Nota                                                                                                                                                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clientes                 | `clientes` (nombre, nit, activo)                                       | Sacyr = una fila; El Trébol después, **sin cambiar código**                                                                                                                                                                                                                                         |
| Sedes                    | `sedes` (cliente_id, nombre, geocerca, zona horaria)                   | la EDS de Lubryco donde cargan los carrotanques es la sede del cliente Sacyr                                                                                                                                                                                                                        |
| Punto de despacho        | `dispensadores` (sede_id, medidor, tot_actual)                         | se crea junto con la sede                                                                                                                                                                                                                                                                           |
| Carrotanques / equipos   | `equipos` (cliente_id, codigo_interno, descripcion, categoria, activo) | **placa → `codigo_interno`** (así se identifica el carrotanque en campo); observaciones → `descripcion`; categoria "Carrotanque"                                                                                                                                                                    |
| Operadores y conductores | `conductores` (cliente_id, nombre, codigo, pin_hash, activo)           | **operador ≡ conductor**: es el MISMO rol funcional (la persona que se identifica con código+PIN al registrar). Una sola pantalla los administra. "Último acceso" = su última carga registrada. No existe (ni se inventa) "equipo asignado" ni "dispositivo asignado": el dispositivo es de la sede |
| Usuarios de consola      | `usuarios` (rol_id, cliente_id, sede_id, activo)                       | identidad en Supabase Auth, autorización SIEMPRE en RBAC propio                                                                                                                                                                                                                                     |
| Roles y permisos         | `roles`, `permisos`, `rol_permisos`                                    | ver §3                                                                                                                                                                                                                                                                                              |
| Dispositivos             | `dispositivos` (sede_id, usuario_id, ultimo_visto_en, activo)          | revocar = desactivar dispositivo **y** su usuario técnico (la API rechaza sesiones de usuarios inactivos)                                                                                                                                                                                           |
| Enrolamiento             | `codigos_enrolamiento` (sede_id, expira_en, usado_en)                  | el Admin los genera; se elimina el SQL manual                                                                                                                                                                                                                                                       |
| Cargas y evidencia       | `cargas`, `fotos`                                                      | solo lectura en el Admin                                                                                                                                                                                                                                                                            |

## 2. Modelos NUEVOS

**Ninguna tabla nueva.** Solo filas de catálogo (migración):

- Rol `admin_lubryco` (id 6): administración multicliente de la consola.
- Permisos `admin.leer` y `admin.gestionar`, otorgados SOLO a `admin_lubryco`.

## 3. Permisos

| Rol                        | admin.leer | admin.gestionar | Alcance                          |
| -------------------------- | ---------- | --------------- | -------------------------------- |
| admin_lubryco              | ✓          | ✓               | multicliente (`cliente_id` null) |
| supervisor / admin_cliente | ✗          | ✗               | su tablero llega con la Fase C   |
| dispositivo                | ✗          | ✗               | flujo del conductor              |

Toda ruta `/api/v1/admin/*` exige token válido **y** el permiso
correspondiente (`admin.leer` para GET, `admin.gestionar` para
escrituras). El PIN se recibe una vez, se guarda como bcrypt y **jamás
se devuelve**.

## 4. API (`/api/v1/admin/*` — Thin API: CRUD y lecturas, cero reglas de negocio)

| Método y ruta                                                                    | Qué hace                                                                                                                                                      |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET `/admin/resumen`                                                             | indicadores: clientes/equipos/operadores/dispositivos activos, cargas y galones de hoy, alertas (cargas de hoy que no cuadran + dispositivos sin señal >24 h) |
| GET `/admin/cargas?cliente_id&limite`                                            | recientes con cliente, equipo, operador, galones, estado, fotos                                                                                               |
| GET·POST `/admin/clientes` · PATCH `/admin/clientes/:id`                         | crear/editar/activar/desactivar; buscar por nombre                                                                                                            |
| GET `/admin/clientes/:id/sedes` · POST `/admin/sedes` · PATCH `/admin/sedes/:id` | la creación de sede incluye su dispensador (transacción)                                                                                                      |
| GET·POST `/admin/equipos` · PATCH `/admin/equipos/:id`                           | carrotanques y demás equipos, por cliente                                                                                                                     |
| GET·POST `/admin/operadores` · PATCH `/admin/operadores/:id`                     | personas con PIN; asignar/rotar PIN; última carga como último acceso                                                                                          |
| GET·POST `/admin/codigos`                                                        | generar código de enrolamiento por sede (expiración configurable), listar con estado vigente/usado/expirado                                                   |
| GET `/admin/dispositivos` · PATCH `/admin/dispositivos/:id`                      | estado, último uso; desactivar/revocar. **Reenrolar** = revocar + generar código nuevo                                                                        |
| GET `/admin/tablero/:clienteId`                                                  | dashboard operativo del cliente (Sacyr): día, por-equipo, duración promedio, operadora, historial, evidencia con URL firmada                                  |

Persistencia: interfaz `RepositorioAdmin` (implementación Postgres real +
fake en memoria para pruebas, mismo patrón existente). La evidencia usa
`AlmacenFotos.urlFirmada(ruta)` (bucket privado, URLs temporales).

## 5. Aplicación `apps/admin` (DEC-015: producto separado)

- Vite + React, misma identidad visual (marca compartida por copia,
  como PWA/Dashboard): cabecera Lubryco │ Cuadre + placa **ADMIN**.
- Sesión: login email+contraseña contra `/api/v1/auth/login` (ya
  existe), access token en memoria, refresh con rotación; un único
  cliente HTTP (patrón DEC-014).
- **Navegación** (pestañas): Resumen · Cargas · Clientes · Equipos ·
  Operadores · Dispositivos · Sacyr. Cada pantalla de catálogo: crear,
  editar, activar/desactivar, buscar y filtrar por estado.
- Despliegue: servicio propio en Railway (mismo patrón servidor.mjs).

## 6. Qué NO se construye hoy

Constructor de dashboards, widgets, reportes avanzados, analytics,
multiempresa avanzada, edición de cargas (las cargas son evidencia:
solo lectura). El dashboard del cliente (apps/dashboard) y la PWA no
se tocan.

## 7. Riesgos aceptados

1. El primer usuario admin se crea con un script de arranque documentado
   (bootstrap único); después, todo por consola.
2. `conductores` sirve a operadores y conductores: si el negocio luego
   exige distinguirlos, será una columna `tipo` con migración simple.
3. La placa del carrotanque viaja en `codigo_interno`: legible en campo
   y sin columna nueva.
