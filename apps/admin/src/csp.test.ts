// La consola muestra el logo del cliente y la evidencia fotográfica
// como URLs FIRMADAS de Supabase Storage (DEC-017). Con la CSP anterior
// (`img-src 'self' data: blob:`) el navegador las bloqueaba en
// producción sin que ninguna prueba lo notara: en desarrollo no hay CSP.
// Esta prueba lee la política del archivo real para que no vuelva a
// pasar en silencio.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const servidor = readFileSync(new URL("../servidor.mjs", import.meta.url).pathname, "utf8");
const politica = servidor.match(/"content-security-policy":\s*\n?\s*"([^"]+)"/)?.[1] ?? "";

describe("CSP de la consola", () => {
  it("declara una política", () => {
    expect(politica).toContain("default-src 'self'");
  });

  it("permite las imágenes firmadas de Storage: logos y evidencia", () => {
    expect(politica).toContain("img-src 'self' data: blob: https://*.supabase.co");
  });

  it("conserva la postura estricta del resto (Etapa H)", () => {
    expect(politica).toContain("connect-src 'self' https://*.up.railway.app");
    expect(politica).toContain("frame-ancestors 'none'");
    expect(politica).not.toContain("unsafe-eval");
  });
});
