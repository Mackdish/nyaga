import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "node:path";

// Standalone Vite config that produces a pure static SPA bundle suitable for
// shared/cPanel hosting (Truehost, hosting.com, etc.). It does NOT use
// TanStack Start / Cloudflare Worker / SSR. The Lovable editor still uses
// the regular vite.config.ts (TanStack Start) — this file is only for
// `bun run build:spa` to generate dist-spa/.
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: path.resolve(__dirname, "src/routes"),
      generatedRouteTree: path.resolve(__dirname, "src/routeTree.gen.ts"),
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Stub server-only entry points so the SPA build never tries to bundle them.
      "@/integrations/supabase/client.server": path.resolve(
        __dirname,
        "src/spa-stubs/empty.ts",
      ),
      "@/integrations/supabase/auth-middleware": path.resolve(
        __dirname,
        "src/spa-stubs/empty.ts",
      ),
    },
  },
  build: {
    outDir: "dist-spa",
    emptyOutDir: true,
    sourcemap: false,
    target: "es2022",
  },
});
