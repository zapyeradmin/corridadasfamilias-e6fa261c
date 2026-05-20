import oracleDigital from "@/assets/sponsors/oracle-digital.png?w=520&quality=86&format=webp";
import nattivoCafe from "@/assets/sponsors/nattivo-cafe.png?w=520&quality=86&format=webp";
import urbanoAlimentos from "@/assets/sponsors/urbano-alimentos.png?w=520&quality=86&format=webp";
import prefeituraSerraTalhada from "@/assets/sponsors/prefeitura-serra-talhada.png?w=520&quality=86&format=webp";

// Mapa slug -> asset bundlado (URL estável, sem 404/redirect)
export const LOGO_ASSETS: Record<string, string> = {
  "oracle-digital": oracleDigital,
  "nattivo-cafe": nattivoCafe,
  "urbano-alimentos": urbanoAlimentos,
  "prefeitura-serra-talhada": prefeituraSerraTalhada,
};

// Ajuste óptico por logo (compensa proporções diferentes)
export const LOGO_SCALE: Record<string, string> = {
  "urbano-alimentos": "scale-[1.35]",
  "prefeitura-serra-talhada": "scale-110",
  "nattivo-cafe": "scale-100",
  "oracle-digital": "scale-100",
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

// Fallback: se a query atrasar, ainda renderiza com as 4 marcas conhecidas
export const FALLBACK_DIAMOND: DiamondSponsor[] = [
  { id: "oracle-digital", name: "Oracle Digital", slug: "oracle-digital", website_url: null },
  { id: "nattivo-cafe", name: "Nattivo Café", slug: "nattivo-cafe", website_url: null },
  { id: "urbano-alimentos", name: "Urbano Alimentos", slug: "urbano-alimentos", website_url: null },
  { id: "prefeitura-serra-talhada", name: "Prefeitura de Serra Talhada", slug: "prefeitura-serra-talhada", website_url: null },
];
