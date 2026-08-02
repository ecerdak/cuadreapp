import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// El Dashboard no es una PWA instalable ni necesita service worker en
// esta fase: es una app web de escritorio/móvil para el supervisor.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
