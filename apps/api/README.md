# @cuadreapp/api

API propia de CuadreApp. Es la única vía de escritura del sistema (DEC-009) y un orquestador puro (DEC-011): valida la forma de la solicitud, resuelve el contexto en la base, invoca `@cuadreapp/dominio` —la única autoridad de negocio—, persiste y responde. Nunca contiene, duplica ni reinterpreta reglas R1–R12.

Desplegada en **Railway**. Stack: Fastify + zod (validación estructural) + pg (Postgres de Supabase vía `DATABASE_URL`).

## Estructura

```
src/
  servidor.ts            punto de entrada real (Railway): pool + repositorio + listen
  aplicacion.ts          construcción de Fastify con dependencias inyectadas (testeable)
  esquemas/carga.ts      contrato de entrada (zod, estricto, snake_case como el spec §6)
  rutas/cargas.ts        POST /api/v1/cargas — el flujo de orquestación completo
  repositorio/tipos.ts   contrato de persistencia
  repositorio/postgres.ts implementación real (transacción carga + fotos)
  rutas/cargas.test.ts   pruebas HTTP con repositorio en memoria (sin red ni base)
```

## Endpoints

- `GET /salud` — healthcheck.
- `POST /api/v1/cargas` — registra una carga. Idempotente por `id` (uuid generado por la app; reintento = misma respuesta, spec §10.4). Nunca bloquea un registro: una carga inconsistente se persiste marcada (§7).

## Comandos

```
pnpm dev         # desarrollo con recarga
pnpm start       # producción (Railway) — requiere DATABASE_URL
pnpm test        # pruebas (no necesitan base de datos)
pnpm typecheck
```

Pendiente de fases posteriores: autenticación/autorización (slot definido en DEC-011), endpoints de lectura para el dashboard, entregas.
