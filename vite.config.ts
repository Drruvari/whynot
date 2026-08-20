import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const base = process.env.GITHUB_PAGES === "true" ? "/whynot/" : "/"

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["audio/**/*.ogg", "brand/*.png", "icons/*.png"],
      manifest: {
        name: "WhyNot",
        short_name: "WhyNot",
        description: "Party games for the night.",
        theme_color: "#0a0a0a",
        background_color: "#080808",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,ogg,txt,json}"],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
