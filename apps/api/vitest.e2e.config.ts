import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/e2e/**/*.e2e.test.ts"],
    // Infraestructura real: sin paralelismo y con margen de red.
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
