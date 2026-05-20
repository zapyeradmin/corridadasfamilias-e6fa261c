/// <reference types="vite/client" />

// Ambient module declarations for vite-imagetools query-string imports.
// Any image import that includes a `?` query (used to request format/srcset
// transforms) resolves to a URL string at runtime.
declare module "*&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*&format=webp" {
  const src: string;
  export default src;
}
declare module "*&format=avif" {
  const src: string;
  export default src;
}
