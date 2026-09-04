import { Flag, MapPin, Route as RouteIcon, Mountain } from "lucide-react";

export const PERCURSO_OFICIAL_DETALHADO =
  "Largada no portão do Shopping Serra Talhada na Av. Adriano Duque de Godoy Sousa, Avenida do Assaí, Retorno na esquina do Senac, Retorno até o Terminal das Vans, Retorno pelo Posto do Shopping, Segue reto até a Pracinha do Lampião, Passa pelo Hospam, Fazer a meia volta na Praça Barão do Pajeú, Segue para a Rua dos Correios, Espetinho do Feitosa, Nara Calçados, Segue na Rua 15 sentido bairro Alto do Bom Jesus, segue até o Cristo no bairro Alto do Bom Jesus, siga até a CEDAN Rações, Retorno até Cristo no bairro Alto do Bom Jesus, siga até o Terminal das Vans, Segue reto até a Pracinha do COVID, Faz o retorno na rotatória próximo ao Shopping Serra Talhada, Chegada no portão do Shopping Serra Talhada na Av. Adriano Duque de Godoy Sousa.";

export const PERCURSO_INFOS: { icon: typeof Flag; titulo: string; texto: string }[] = [
  {
    icon: Flag,
    titulo: "Percurso Oficial",
    texto: PERCURSO_OFICIAL_DETALHADO,
  },
  {
    icon: MapPin,
    titulo: "Sinalização e Apoio",
    texto: "Percurso sinalizado, com staff dedicado e pontos de hidratação durante todo o trajeto.",
  },
  {
    icon: RouteIcon,
    titulo: "Distância",
    texto: "6km de percurso oficial cronometrado com largada e chegada no portão do Shopping Serra Talhada.",
  },
  {
    icon: Mountain,
    titulo: "Altimetria",
    texto:
      "Percurso 100% asfaltado com passagem pelo Cristo no bairro Alto do Bom Jesus, unindo desafio e velocidade.",
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
