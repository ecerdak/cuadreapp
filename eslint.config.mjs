// Lint del monorepo (Etapa H). Reglas ligeras y estrictas donde
// importa; el formato es asunto de Prettier (eslint-config-prettier
// desactiva todo choque).

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/coverage/**", "**/node_modules/**", "docs/**", "**/dev-dist/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    // Scripts de herramientas y servidores estáticos: corren en Node.
    files: ["**/*.mjs"],
    languageOptions: { globals: { console: "readonly", process: "readonly", URL: "readonly" } },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "off", // el logging estructurado sale por stdout a propósito (DEC-012)
    },
  },
);
