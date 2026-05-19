import { Shirt, Hash, Droplets, Medal, HandHeart, type LucideIcon } from "lucide-react";

export type KitItemData = {
  icon: LucideIcon;
  titulo: string;
  texto: string;
};

export const KIT_ITENS: KitItemData[] = [
  {
    icon: Shirt,
    titulo: "Camiseta Oficial",
    texto:
      "Camiseta exclusiva do evento para os atletas, confortável, respirável e personalizada especialmente para corrida.",
  },
  {
    icon: Hash,
    titulo: "Número de Peito",
    texto:
      "Número de identificação personalizado exclusiva para cada atleta. Cada atleta terá número único.",
  },
  {
    icon: Droplets,
    titulo: "Hidratação",
    texto:
      "Hidratação durante todo percurso, distribuimos 5 pontos de hidratação, disponibilizando água para você.",
  },
  {
    icon: Medal,
    titulo: "Medalha Finisher",
    texto:
      "Medalha Personalizada comemorativa exclusiva para todos que completarem o percurso.",
  },
];

export const KIT_ITENS_PAGINA: KitItemData[] = [
  ...KIT_ITENS,
  {
    icon: HandHeart,
    titulo: "Contribuição Solidária",
    texto:
      "Na retirada do kit, cada atleta entrega 1kg de alimento não perecível destinado a famílias em situação de vulnerabilidade.",
  },
];

export function KitItem({ icon: Icon, titulo, texto }: KitItemData) {
  return (
    <li className="flex gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color:var(--color-brand-orange)]/10 text-[color:var(--color-brand-orange)]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h4 className="text-sm font-extrabold uppercase tracking-[0.18em] text-[color:var(--color-brand-purple-title)]">
          {titulo}
        </h4>
        <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-brand-purple-text)]/80">
          {texto}
        </p>
      </div>
    </li>
  );
}
