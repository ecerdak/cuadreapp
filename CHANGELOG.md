# Changelog

Registro de cambios relevantes por etapa del roadmap de CuadreApp.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [Sin publicar]

### Agregado
- `docs/PRODUCT_BIBLE.md`: visión, objetivo, problema, usuarios, casos de uso, reglas de negocio, arquitectura, roadmap, decisiones y glosario del producto.
- `CLAUDE.md`: convenciones de trabajo y ritual de cierre de etapa.

### Decidido
- CuadreApp es completamente independiente de StationOS. Cualquier integración futura será únicamente vía API REST propia, sin compartir tablas, código, autenticación ni repositorio. (DEC-002)
- Cliente móvil construido como PWA (React + TypeScript + Vite + Tailwind), no React Native + Expo, para esta etapa del proyecto. (DEC-001)
- Autenticación con Supabase Auth; autorización con RBAC propio en base de datos (`roles`/`usuarios`/`dispositivos`), nunca en mecanismos específicos del framework. (DEC-004)
- Hosting en tres capas: PWA/dashboard en Vercel, API propia en Railway, base de datos y autenticación en Supabase; arquitectura preparada para un futuro cliente Expo/EAS. (DEC-005)
- Monorepo con pnpm workspaces desde el inicio, estructura pensada para escalar. (DEC-006)

## [Etapa 0] — Esquema Supabase, RLS y trigger

### Agregado
- Estructura del monorepo (pnpm workspaces): `apps/pwa`, `apps/api`, `packages/dominio`, `packages/tipos-bd` (placeholders hasta la Etapa 1) y `supabase/` inicializado.
- `supabase/migrations/`: esquema inicial completo (§6 de la especificación técnica, más `roles`/`usuarios`/`dispositivos` de DEC-004), RLS por `cliente_id` y por rol en todas las tablas, y el trigger que actualiza `dispensadores.tot_actual_gal` al aceptar una carga.
- `supabase/seed.sql`: datos de demostración (cliente, sede, dispensador, equipos, conductores) con la misma forma que el inventario real pendiente de El Trébol.
- `supabase/verificacion_etapa0.sql`: script manual que prueba el criterio de terminado de la etapa (insert de carga → trigger actualiza `tot_actual_gal`).

### Pendiente
- Ejecutar `supabase/verificacion_etapa0.sql` contra una base de datos real: este entorno de desarrollo no tenía Docker ni Postgres nativo disponibles para correr `supabase start`. El script fue revisado a mano pero no ejecutado.
- Sembrar `usuarios` y `dispositivos`: requiere cuentas reales de Supabase Auth (login de dashboard y enrolamiento de dispositivo), que llegan en las Etapas 1 y 2.
- Inventario real de El Trébol (equipos, conductores, lectura de instalación del dispensador, coordenadas de sede) — ver `docs/PRODUCT_BIBLE.md` §12.

## [Pre-Etapa 1] — Arquitectura congelada

### Decidido
- DEC-001 revisada por el propietario del producto: la PWA es la plataforma del **MVP**, no una decisión permanente. Al finalizar el MVP se hará una evaluación técnica PWA vs. React Native + Expo; la arquitectura debe soportar ambas alternativas con el menor impacto posible.
- DEC-003 cerrada como Aceptada (reglas R1–R12 en `packages/dominio`, compartidas entre cliente y API) — reforzada y generalizada por DEC-009.
- DEC-007: reglas de dependencias del monorepo — solo `apps/* → packages/*`; `packages/tipos-bd` como hoja; grafo de paquetes acíclico; cero imports entre `apps/pwa` y `apps/api` (comunicación solo por HTTP).
- DEC-008: versionado de la API bajo `/api/v1/` desde el primer día; las versiones futuras convivirán sin romper compatibilidad.
- DEC-009: **API First** — toda funcionalidad de negocio se implementa primero en la API; la PWA nunca accede directamente a Supabase para operaciones de negocio; Supabase es infraestructura; la API es la única autoridad para validaciones, reglas de negocio, escritura, auditoría y permisos.

Con este registro la arquitectura queda congelada. Cualquier cambio estructural posterior requiere una decisión nueva en `docs/PRODUCT_BIBLE.md` §9.
