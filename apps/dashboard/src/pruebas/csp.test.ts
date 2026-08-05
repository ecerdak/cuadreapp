// La CSP es parte del producto, no del despliegue: si bloquea las
// imágenes del cliente, el tablero se ve roto en producción y en verde
// en desarrollo. Esta prueba la lee de los archivos reales.
//
// Historia que la motiva: el tablero muestra el logo del cliente y la
// evidencia fotográfica como URLs FIRMADAS de Supabase Storage
// (DEC-017). Con `img-src 'self' data: blob:` el navegador las
// bloqueaba en silencio — el mismo defecto existía en la consola.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const raiz = new URL("../../", import.meta.url).pathname;
const servidor = readFileSync(`${raiz}servidor.mjs`, "utf8");
const vercel = readFileSync(`${raiz}vercel.json`, "utf8");

/** La política declarada en cada archivo de configuración. */
const politicas = [
  ["servidor.mjs (Railway)", /"content-security-policy":\s*\n?\s*"([^"]+)"/],
  ["vercel.json (Vercel)", /"value":\s*"(default-src[^"]+)"/],
] as const;

const extraer = (fuente: string, patron: RegExp): string => {
  const encontrada = fuente.match(patron)?.[1];
  expect(encontrada, "no se encontró la CSP en el archivo").toBeTruthy();
  return encontrada!;
};

describe("CSP del Dashboard — espejo entre Railway y Vercel", () => {
  const declaradas = [extraer(servidor, politicas[0][1]), extraer(vercel, politicas[1][1])];

  it("las dos configuraciones declaran exactamente la misma política", () => {
    expect(declaradas[0]).toBe(declaradas[1]);
  });

  it("permite las imágenes firmadas de Storage: logo del cliente y evidencia", () => {
    for (const politica of declaradas) {
      expect(politica).toContain("img-src 'self' data: blob: https://*.supabase.co");
    }
  });

  it("permite hablar con la API y con nadie más", () => {
    for (const politica of declaradas) {
      expect(politica).toContain("connect-src 'self' https://*.up.railway.app");
    }
  });

  it("conserva la postura estricta del resto (Etapa H)", () => {
    for (const politica of declaradas) {
      expect(politica).toContain("default-src 'self'");
      expect(politica).toContain("script-src 'self'");
      expect(politica).toContain("frame-ancestors 'none'");
      expect(politica).not.toContain("unsafe-eval");
      // Solo los estilos en línea del design system, nada más.
      expect(politica).toContain("style-src 'self' 'unsafe-inline'");
    }
  });
});
