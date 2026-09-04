import logoBreno from "@/assets/sponsors/LOGO-BRENO.png?w=520&quality=86&format=webp";
import logoSerraBela from "@/assets/sponsors/LOGO-SERRA-BELA.png?w=520&quality=86&format=webp";
import logoHotelImperio from "@/assets/sponsors/LOGO-HOTEL-IMPERIO.png?w=520&quality=86&format=webp";
import logoPiracanjuba from "@/assets/sponsors/LOGO-PIRACANJUBA.png?w=520&quality=86&format=webp";
import logoBarRaimundo from "@/assets/sponsors/LOGO-BAR-RAIMUNDO.png?w=520&quality=86&format=webp";
import logoMalaquias from "@/assets/sponsors/LOGO-MALAQUIAS.png?w=520&quality=86&format=webp";

// Mapa slug -> asset bundlado (URL estável, sem 404/redirect)
export const LOGO_ASSETS: Record<string, string> = {
  "LOGO-BRENO": logoBreno,
  "logo-breno": logoBreno,
  "breno-araujo": logoBreno,

  "LOGO-SERRA-BELA": logoSerraBela,
  "logo-serra-bela": logoSerraBela,
  "supermercado-serra-bela": logoSerraBela,

  "LOGO-HOTEL-IMPERIO": logoHotelImperio,
  "logo-hotel-imperio": logoHotelImperio,
  "hotel-imperio": logoHotelImperio,
  "imperiodaserra": logoHotelImperio,
  "imperio-da-serra": logoHotelImperio,

  "LOGO-PIRACANJUBA": logoPiracanjuba,
  "logo-piracanjuba": logoPiracanjuba,
  "piracanjuba": logoPiracanjuba,

  "LOGO-BAR-RAIMUNDO": logoBarRaimundo,
  "logo-bar-raimundo": logoBarRaimundo,
  "bar-do-raimundo": logoBarRaimundo,

  "LOGO-MALAQUIAS": logoMalaquias,
  "logo-malaquias": logoMalaquias,
  "malaquias": logoMalaquias,
};

// Ajuste óptico por logo (compensa proporções diferentes)
export const LOGO_SCALE: Record<string, string> = {
  "LOGO-BRENO": "scale-100",
  "LOGO-SERRA-BELA": "scale-100",
  "LOGO-HOTEL-IMPERIO": "scale-100",
  "LOGO-PIRACANJUBA": "scale-100",
  "LOGO-BAR-RAIMUNDO": "scale-100",
  "LOGO-MALAQUIAS": "scale-100",
};

export function slugFromUrl(url: string) {
  const file = url.split("/").pop() ?? "";
  return file.replace(/\.[a-zA-Z0-9]+$/, "");
}

export type DiamondSponsor = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
};

// Fallback: marcas oficiais ativas
export const FALLBACK_DIAMOND: DiamondSponsor[] = [
  { id: "breno-araujo", name: "Breno Araújo", slug: "LOGO-BRENO", website_url: null },
  { id: "supermercado-serra-bela", name: "Supermercado Serra Bela", slug: "LOGO-SERRA-BELA", website_url: null },
  { id: "imperio-da-serra", name: "Império da Serra", slug: "LOGO-HOTEL-IMPERIO", website_url: null },
  { id: "piracanjuba", name: "Piracanjuba", slug: "LOGO-PIRACANJUBA", website_url: null },
  { id: "bar-do-raimundo", name: "Bar do Raimundo", slug: "LOGO-BAR-RAIMUNDO", website_url: null },
  { id: "malaquias", name: "Malaquias", slug: "LOGO-MALAQUIAS", website_url: null },
];
