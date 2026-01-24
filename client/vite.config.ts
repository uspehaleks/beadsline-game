import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Здесь больше ничего нет
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 4000,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});