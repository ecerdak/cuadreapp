// Compresión de evidencia (spec §4): borde largo 1024 px, WebP 0.7 —
// 60–90 KB por foto, suficiente para leer un display de rodillos.

import imageCompression from "browser-image-compression";

export async function comprimirFoto(archivo: File): Promise<{ bytes: ArrayBuffer; tipo: string }> {
  const comprimida = await imageCompression(archivo, {
    maxWidthOrHeight: 1024,
    initialQuality: 0.7,
    fileType: "image/webp",
    useWebWorker: true,
  });
  return { bytes: await comprimida.arrayBuffer(), tipo: comprimida.type };
}
