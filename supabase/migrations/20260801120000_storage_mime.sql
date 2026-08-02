-- ============================================================
-- CuadreApp — RC1-A1: el bucket acepta también jpeg y png.
--
-- Safari/iOS no exporta WebP desde canvas: el dispositivo degrada a
-- jpeg/png y la API (única puerta de escritura) ya los acepta. El
-- bucket debe permitir los mismos tipos o el guardado real fallaría
-- aunque la API lo apruebe.
-- ============================================================

update storage.buckets
set allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png']
where id = 'fotos-cargas';
