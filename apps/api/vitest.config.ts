import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // El E2E corre solo a pedido y con credenciales reales: pnpm e2e.
    exclude: ["**/node_modules/**", "**/*.e2e.test.ts"],
  },
});
