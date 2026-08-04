import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // El E2E corre solo a pedido y con credenciales reales: pnpm e2e.
    exclude: ["**/node_modules/**", "**/*.e2e.test.ts"],
    // La primera prueba de cada archivo levanta Fastify + jose; con el
    // monorepo completo corriendo en paralelo (pnpm -r test), 5 s no
    // alcanzan y la suite se vuelve intermitente. El margen es de
    // arranque, no de lógica: ninguna prueba tarda más de ~1 s real.
    testTimeout: 20_000,
  },
});
