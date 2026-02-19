import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

const isSamples = process.env.VITE_BUILD_SAMPLES === "true";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 Vite plugin
  ],
  build: {
    lib: {
      entry: isSamples
        ? resolve(__dirname, "src/sample-main.ts")
        : resolve(__dirname, "src/main.ts"),
      name: isSamples ? "ReactIslandsSamples" : "ReactIslands",
      formats: ["iife"],
      fileName: () => (isSamples ? "react-islands-samples.js" : "react-islands.js"),
    },
    outDir: isSamples ? "../demo/assets/samples" : "../demo/assets/react-islands",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names.includes("style.css")) return "react-islands.css";
          return assetInfo.names[0] || "[name].[ext]";
        },
      },
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
