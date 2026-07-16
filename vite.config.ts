import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("monaco-editor") || id.includes("@monaco-editor/react")) return "monaco";
          if (id.includes("react-markdown")) return "markdown";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
});
