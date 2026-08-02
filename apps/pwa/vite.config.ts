import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Precache del shell (spec §4): la app abre sin red. La cola de
    // datos NO depende de Background Sync del navegador (no existe en
    // iOS Safari): vive en Dexie y sincroniza con la app abierta.
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "CuadreApp",
        short_name: "Cuadre",
        description: "Control de despacho de combustible — Lubryco",
        lang: "es",
        start_url: "/",
        display: "standalone",
        background_color: "#0B1219",
        theme_color: "#4A7CAB",
        icons: [
          { src: "/iconos/icono-192.png", sizes: "192x192", type: "image/png" },
          { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/iconos/icono-mascara-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
