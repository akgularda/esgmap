import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the same build works on a user/organisation GitHub Pages
// site (https://user.github.io/) and a project page (https://user.github.io/esgmap/).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});
