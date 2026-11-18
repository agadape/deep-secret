import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Cross-origin isolation lets the Zama SDK use WASM threads (SPIKE_LOG S12, S20, S22). Same headers as vercel.json.
const isolation = { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" };

export default defineConfig({
  plugins: [react()],
  server: { headers: isolation },
  preview: { headers: isolation },
  optimizeDeps: { exclude: ["@zama-fhe/sdk"] },
  worker: { format: "es" },
  build: { chunkSizeWarningLimit: 2500 },
});
