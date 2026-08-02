// Genera los íconos de instalación de la PWA (RC1-A5) a partir del
// ícono de marca en SVG: cuadrado azul de esquinas redondeadas con la
// "C" amarilla — el favicon del mockup aprobado. Herramienta de
// desarrollo: los PNG resultantes se versionan; esto NO corre en
// runtime ni en el build.
//
//   node herramientas/generar-iconos.mjs

import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

// margen = espacio seguro para la variante maskable (Android recorta).
function svgMarca({ margen = 0 } = {}) {
  const lado = 512;
  const radio = margen > 0 ? 0 : Math.round(lado * 0.22);
  const tamanoLetra = Math.round(lado * 0.62 * (1 - margen * 2));
  const centroY = Math.round(lado * (0.5 + 0.22 * (1 - margen * 2)));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}">
  <rect width="${lado}" height="${lado}" rx="${radio}" fill="#4A7CAB"/>
  <text x="${lado / 2}" y="${centroY}" font-family="Georgia, serif" font-style="italic" font-weight="bold"
        font-size="${tamanoLetra}" text-anchor="middle" fill="#F5E01B"
        stroke="#0B0B0B" stroke-width="${Math.max(4, Math.round(tamanoLetra * 0.06))}" paint-order="stroke">C</text>
</svg>`;
}

function png(svg, ancho) {
  return new Resvg(svg, { fitTo: { mode: "width", value: ancho } }).render().asPng();
}

const destino = join(raiz, "public", "iconos");
mkdirSync(destino, { recursive: true });

writeFileSync(join(destino, "icono-192.png"), png(svgMarca(), 192));
writeFileSync(join(destino, "icono-512.png"), png(svgMarca(), 512));
writeFileSync(join(destino, "icono-mascara-512.png"), png(svgMarca({ margen: 0.12 }), 512));
writeFileSync(join(destino, "apple-touch-icon.png"), png(svgMarca(), 180));
writeFileSync(join(raiz, "public", "favicon.svg"), svgMarca());

console.log("Íconos generados en public/iconos y public/favicon.svg");
