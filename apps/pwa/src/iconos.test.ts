import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// RC1-A5 + ajuste de identidad: los íconos instalables son los v2 de
// trazo grueso aprobados (cuadre_icono.zip). Los nombres llevan v2 a
// propósito: el cambio de URL en el manifest fuerza a Chrome a
// refrescar el WebAPK — el ícono viejo de trazo fino no debe existir.

const raiz = join(__dirname, "..");
const esPng = (ruta: string) => {
  const bytes = readFileSync(join(raiz, ruta));
  return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
};

describe("íconos de instalación de la PWA (v2, trazo grueso aprobado)", () => {
  it("existen los PNG v2 del manifest (192, 512 y maskable) y el apple-touch, y son PNG válidos", () => {
    for (const ruta of [
      "public/iconos/icono-v2-192.png",
      "public/iconos/icono-v2-512.png",
      "public/iconos/icono-v2-mascara-512.png",
      "public/iconos/apple-touch-icon-v2.png",
    ]) {
      expect(esPng(ruta), `${ruta} debe existir y ser PNG`).toBe(true);
    }
  });

  it("los íconos viejos de trazo fino fueron eliminados", () => {
    for (const ruta of [
      "public/iconos/icono-192.png",
      "public/iconos/icono-512.png",
      "public/iconos/icono-mascara-512.png",
      "public/iconos/apple-touch-icon.png",
      "public/favicon.svg",
    ]) {
      expect(existsSync(join(raiz, ruta)), `${ruta} NO debe existir`).toBe(false);
    }
  });

  it("el manifest declara los íconos v2 y el arranque azul de la bienvenida", () => {
    const config = readFileSync(join(raiz, "vite.config.ts"), "utf8");
    expect(config).toContain("iconos/icono-v2-192.png");
    expect(config).toContain("iconos/icono-v2-512.png");
    expect(config).toContain('purpose: "maskable"');
    // La pantalla de arranque del sistema queda del azul de la Splash:
    // sin cuadro celeste sobre fondo oscuro.
    expect(config).toContain('background_color: "#4A7CAB"');

    const html = readFileSync(join(raiz, "index.html"), "utf8");
    expect(html).toContain("apple-touch-icon-v2.png");
    expect(html).toContain("favicon-v2.svg");
  });

  it("el apple-touch-icon es de sangre completa (RGB sin alfa): iOS no pinta esquinas negras", () => {
    const bytes = readFileSync(join(raiz, "public/iconos/apple-touch-icon-v2.png"));
    // Byte 25 del PNG: tipo de color. 2 = RGB sin canal alfa.
    expect(bytes[25]).toBe(2);
  });
});
