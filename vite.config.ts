// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { imagetools } from "vite-imagetools";

// TARGET=node => build for Node.js SSR (VPS deploy). Anything else (default)
// keeps the Cloudflare Workers build used by the Lovable preview/publish.
const isNodeTarget = process.env.TARGET === "node";

export default defineConfig({
  // Disable the Cloudflare Vite plugin for Node builds so TanStack Start
  // falls back to its default Nitro node-server preset (.output/server/index.mjs).
  cloudflare: isNodeTarget ? false : undefined,
  // Our Worker SSR error wrapper lives at src/server.ts. For Node builds we
  // let TanStack Start use its default server entry.
  tanstackStart: isNodeTarget ? undefined : { server: { entry: "server" } },
  plugins: [
    // Build-time image optimization. Used via query strings on imports:
    //   import url from "./img.jpg?format=webp&quality=78"
    //   import srcset from "./img.jpg?w=800;1280;1920&format=webp&as=srcset"
    imagetools(),
  ],
});
