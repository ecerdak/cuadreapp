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
      workbox: {
        // Explícito y verificado por prueba: el shell COMPLETO (incluidos
        // íconos y manifest) queda precacheado, y toda navegación offline
        // cae al index.html — la app instalada abre sin red.
        // woff2/webp: la marca (fuentes autoalojadas, logos) también
        // debe abrir sin red — son parte del shell.
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2,webmanifest}"],
        navigateFallback: "index.html",
      },
      manifest: {
        name: "CuadreApp",
        short_name: "Cuadre",
        description: "Control de despacho de combustible — Lubryco",
        lang: "es",
        start_url: "/",
        display: "standalone",
        // El azul de la bienvenida: la pantalla de arranque que Android
        // genera (ícono + nombre sobre background_color) queda del MISMO
        // azul que la Splash — el cuadro celeste sobre fondo oscuro
        // desaparece y el arranque se lee como una sola bienvenida.
        background_color: "#4A7CAB",
        theme_color: "#4A7CAB",
        // Íconos v2 (trazo grueso aprobado). Nombres nuevos a propósito:
        // el cambio de URL fuerza a Chrome a refrescar el WebAPK.
        icons: [
          { src: "/iconos/icono-v2-192.png", sizes: "192x192", type: "image/png" },
          { src: "/iconos/icono-v2-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/iconos/icono-v2-mascara-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
