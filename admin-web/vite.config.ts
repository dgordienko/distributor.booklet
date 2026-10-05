import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Префикс публикации за общим nginx, например "/booklet/". По умолчанию "/".
const rawBase = process.env.VITE_BASE_PATH?.trim() || "/";
const base = `/${rawBase.replace(/^\/+|\/+$/g, "")}/`.replace(/^\/\/$/, "/");

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
