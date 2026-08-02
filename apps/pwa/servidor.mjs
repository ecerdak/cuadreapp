// Servidor estático de producción de la PWA para Railway.
// Node puro, cero dependencias: sirve dist/ con SPA fallback y los
// MISMOS headers de seguridad que apps/pwa/vercel.json. Atención a lo
// específico de una PWA: sw.js y el manifest jamás se cachean como
// inmutables (romperían las actualizaciones), y el manifest lleva su
// content-type propio. /salud responde el healthcheck.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "dist");
const PUERTO = Number(process.env.PORT ?? 4174);

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

// Espejo de apps/pwa/vercel.json (cámara y GPS habilitados: los usa el conductor).
const SEGURIDAD = {
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.up.railway.app; worker-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "permissions-policy": "camera=(self), geolocation=(self), microphone=()",
  "x-frame-options": "DENY",
};

const servidor = createServer(async (solicitud, respuesta) => {
  const { pathname } = new URL(solicitud.url ?? "/", "http://interno");

  if (pathname === "/salud") {
    respuesta.writeHead(200, { "content-type": "application/json", ...SEGURIDAD });
    respuesta.end('{"ok":true}');
    return;
  }

  let archivo = resolve(RAIZ, `.${pathname}`);
  if (!archivo.startsWith(RAIZ)) archivo = join(RAIZ, "index.html");

  let cuerpo = await readFile(archivo).catch(() => null);
  if (cuerpo === null || extname(archivo) === "") {
    archivo = join(RAIZ, "index.html");
    cuerpo = await readFile(archivo).catch(() => null);
  }
  if (cuerpo === null) {
    respuesta.writeHead(404, SEGURIDAD);
    respuesta.end("No encontrado");
    return;
  }

  const esInmutable = pathname.startsWith("/assets/"); // hash en el nombre; sw.js y manifest NUNCA
  respuesta.writeHead(200, {
    "content-type": TIPOS[extname(archivo)] ?? "application/octet-stream",
    "cache-control": esInmutable ? "public, max-age=31536000, immutable" : "no-cache",
    ...SEGURIDAD,
  });
  respuesta.end(cuerpo);
});

servidor.listen(PUERTO, "0.0.0.0", () => {
  console.log(JSON.stringify({ nivel: "info", mensaje: "PWA estática escuchando", puerto: PUERTO }));
});
