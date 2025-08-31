import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import selfPackageJSON from "./package.json" with { type: "json" }
import buildToolPackageJSON from "capitalisation-fixes/package.json" with {
  type: "json"
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  define: {
    __WEB_UI_VERSION__: JSON.stringify(selfPackageJSON.version),
    __CAPITALISATION_FIXES_VERSION__: JSON.stringify(
      buildToolPackageJSON.version
    ),
  },
  server: {
    allowedHosts: [".ngrok.app", ".ngrok-free.app"]
  },
  build: {
    target: "es2021",
    rollupOptions: {
      // Prevent Vite trying to be smart and process node-specific `import()`s that don't ever get called
      external: ["node:fs/promises"]
    }
  },
  esbuild: {
    supported: {
      'top-level-await': true
    },
  }
})
