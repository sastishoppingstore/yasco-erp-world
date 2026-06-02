import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import path from "path"

const __dirname = import.meta.dirname

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
    },
  },
  build: { outDir: path.resolve(__dirname, "dist/public"), emptyOutDir: true },
})
