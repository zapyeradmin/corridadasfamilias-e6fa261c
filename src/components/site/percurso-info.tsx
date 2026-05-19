import { Flag, MapPin, Route as RouteIcon, Mountain } from "lucide-react";

export const PERCURSO_INFOS: { icon: typeof Flag; titulo: string; texto: string }[] = [
  {
    icon: Flag,
    titulo: "Percurso Oficial",
    texto:
      "Largada e chegada na Igreja Matriz de Nossa Senhora do Rosário na Rua Cornélio Soares, Rua Joca Magalhães, Rua José Alves da Silveira, Avenida Afonso Magalhães (retorno no cruzamento com a Rua Neco Maranhão, próximo à Drogaria DjaFarma), Rua Enock Ignácio de Oliveira, Rua Joaquim Conrado de Lorena e Sá, retorno à Rua Cornélio Soares e chegada na Igreja Matriz de Nossa Senhora do Rosário na Rua Cornélio Soares.",
  },
  {
    icon: MapPin,
    titulo: "Sinalização e Apoio",
    texto:
      "Percurso sinalizado, com staff dedicados e pontos de hidratação durante todo percurso.",
  },
  {
    icon: RouteIcon,
    titulo: "Distância",
    texto: "5km de percurso oficial cronometrado.",
  },
  {
    icon: Mountain,
    titulo: "Altimetria",
    texto:
      "Percurso 100% asfaltado, com poucas elevações, ideal para uma corrida sem grandes dificuldades.",
  },
];

export function PercursoInfoItem({
  icon: Icon,
  titulo,
  texto,
}: {
  icon: typeof Flag;
  titulo: string;
  texto: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color:var(--color-brand-orange)]/10 text-[color:var(--color-brand-orange)]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
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
