import { Flag, MapPin, Route as RouteIcon, Mountain } from "lucide-react";

export const PERCURSO_INFOS: { icon: typeof Flag; titulo: string; texto: string }[] = [
  {
    icon: Flag,
    titulo: "Percurso Oficial",
    texto:
      "Largada e chegada no Beach Garden no Shopping Serra Talhada, Rua Joca Magalhães, Rua José Alves da Silveira, Avenida Afonso Magalhães (retorno no cruzamento com a Rua Neco Maranhão, próximo à Drogaria DjaFarma), Rua Enock Ignácio de Oliveira, Rua Joaquim Conrado de Lorena e Sá, retorno à Rua Cornélio Soares e chegada na Igreja Matriz de Nossa Senhora do Rosário na Rua Cornélio Soares.",
  },
  {
    icon: MapPin,
    titulo: "Sinalização e Apoio",
    texto: "Percurso sinalizado, com staff dedicados e pontos de hidratação durante todo percurso.",
  },
  {
    icon: RouteIcon,
    titulo: "Distância",
    texto: "6km de percurso oficial cronometrado.",
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
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#c20505] bg-[#c20505] text-white shadow-[0_4px_14px_rgba(194,5,5,0.25)]">
        <Icon className="h-5 w-5 text-white" />
      </span>
      <div className="flex-1">
        <h4 className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#c20505]">
          {titulo}
        </h4>
        <p className="mt-1 text-sm leading-relaxed text-[#3d0000]">{texto}</p>
      </div>
    </li>
  );
}
