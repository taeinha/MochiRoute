import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@mochiroute/shared", "zod"],
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/r": "http://localhost:3000",
      "/health": "http://localhost:3000",
    },
  },
});
