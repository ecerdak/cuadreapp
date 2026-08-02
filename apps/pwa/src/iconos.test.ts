import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// RC1-A5: sin íconos, "agregar a inicio" muestra un ícono genérico y
// la primera impresión del cliente es de app improvisada. Los PNG se
// generan con herramientas/generar-iconos.mjs y se versionan.

const raiz = join(__dirname, "..");
const esPng = (ruta: string) => {
  const bytes = readFileSync(join(raiz, ruta));
  return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
};

describe("RC1-A5 — íconos de instalación de la PWA", () => {
  it("existen los PNG del manifest (192, 512 y maskable) y el apple-touch-icon, y son PNG válidos", () => {
    for (const ruta of [
      "public/iconos/icono-192.png",
      "public/iconos/icono-512.png",
      "public/iconos/icono-mascara-512.png",
      "public/iconos/apple-touch-icon.png",
    ]) {
      expect(esPng(ruta), `${ruta} debe existir y ser PNG`).toBe(true);
    }
  });

  it("el manifest declara los íconos (vite.config) y el html enlaza favicon y apple-touch-icon", () => {
    const config = readFileSync(join(raiz, "vite.config.ts"), "utf8");
    expect(config).toContain("iconos/icono-192.png");
    expect(config).toContain("iconos/icono-512.png");
    expect(config).toContain('purpose: "maskable"');

    const html = readFileSync(join(raiz, "index.html"), "utf8");
    expect(html).toContain("apple-touch-icon");
    expect(html).toContain("favicon.svg");
  });
});
