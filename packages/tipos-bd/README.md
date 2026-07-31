# @cuadreapp/tipos-bd

Tipos de TypeScript generados a partir del esquema real de Supabase:

```
supabase gen types typescript --local > packages/tipos-bd/index.ts
```

No se editan a mano — se regeneran cada vez que cambian las migraciones en `supabase/migrations/`. Se genera por primera vez cuando exista una base de datos alcanzable (local con Docker, o el proyecto remoto de Supabase).
