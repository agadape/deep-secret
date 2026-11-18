import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

// Spike-only: the S20 wallet page POSTs its step results here so they land in web-spike/s20-results.log.
const resultLog: Plugin = {
  name: "spike-result-log",
  configureServer(server) {
    server.middlewares.use("/__log", (req, res) => {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        fs.appendFileSync(path.join(server.config.root, "spike-results.log"), body + "\n");
        res.end("ok");
      });
    });
  },
};

// `--mode isolate` turns on cross-origin isolation (SharedArrayBuffer / WASM threads) so both modes can be measured.
export default defineConfig(({ mode }) => ({
  // local spike only: read the throwaway testnet key from the hardhat workspace
  envDir: "../spike-ws",
  envPrefix: ["VITE_", "PRIVATE_KEY_ALICE"],
  plugins: [resultLog],
  server: {
    headers:
      mode === "isolate"
        ? { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" }
        : {},
  },
  // `vite build` + `vite preview` serve the production bundle with the same headers as vercel.json (spike S22).
  preview: {
    headers: { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" },
  },
  build: { rollupOptions: { input: { s22: "s22.html" } } },
  optimizeDeps: { exclude: ["@zama-fhe/sdk"] },
  worker: { format: "es" as const },
}));
