import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Consola administrativa: app web de escritorio, sin service worker.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
