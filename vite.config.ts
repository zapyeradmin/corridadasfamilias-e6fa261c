// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { imagetools } from "vite-imagetools";

export default defineConfig({
  tanstackStart: { server: { entry: "server" } },
  plugins: [
    // Build-time image optimization. Used via query strings on imports:
    //   import url from "./img.jpg?format=webp&quality=78"
    //   import srcset from "./img.jpg?w=800;1280;1920&format=webp&as=srcset"
    imagetools(),
  ],
});
