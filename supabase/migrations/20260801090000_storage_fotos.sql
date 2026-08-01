-- ============================================================
-- CuadreApp — Etapa H: bucket privado de evidencia fotográfica.
--
-- El bucket NO es público: nadie lee fotos sin pasar por la API
-- (que emite URLs firmadas de corta vida cuando el dashboard lo
-- necesite). Solo la service role escribe: no hay políticas RLS de
-- storage.objects para los roles de la Data API — denegado por
-- defecto, la API es la única puerta (DEC-009/DEC-013).
--
-- Límite de tamaño alineado con el endpoint de la API (2 MB; una foto
-- comprimida pesa 60–90 KB).
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-cargas', 'fotos-cargas', false, 2097152, array['image/webp'])
on conflict (id) do nothing;
