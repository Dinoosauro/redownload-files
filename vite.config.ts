import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { join } from "node:path";
import { buildSync } from "esbuild";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [{
    apply: "build",
    enforce: "post",
    transformIndexHtml() {
      buildSync({
        minify: true,
        bundle: true,
        entryPoints: [join(process.cwd(), "service-worker.js")],
        outfile: join(process.cwd(), "dist", "service-worker.js"),
      });
    },
  }, react()]
})
