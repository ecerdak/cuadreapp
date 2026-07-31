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
