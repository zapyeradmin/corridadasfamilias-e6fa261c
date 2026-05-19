import { PersonStanding, Trophy, Medal } from "lucide-react";

export type Premio = { lugar: string; texto: string };
export type SubCategoria = { genero: "M" | "F"; titulo: string; premios: Premio[] };
export type Categoria = { sub: SubCategoria[] };

export const PREMIOS_GERAL_M: Premio[] = [
  { lugar: "1º", texto: "R$ 500,00 + Troféu de Primeiro Lugar + Medalha" },
  { lugar: "2º", texto: "R$ 300,00 + Troféu de Segundo Lugar + Medalha" },
  { lugar: "3º", texto: "R$ 200,00 + Troféu de Terceiro Lugar + Medalha" },
];
export const PREMIOS_GERAL_F: Premio[] = [
  { lugar: "1º", texto: "R$ 500,00 + Troféu de Primeiro Lugar + Medalha" },
  { lugar: "2º", texto: "R$ 300,00 + Troféu de Segundo Lugar + Medalha" },
  { lugar: "3º", texto: "R$ 200,00 + Troféu de Terceiro Lugar + Medalha" },
];
export const PREMIOS_TROFEU: Premio[] = [
  { lugar: "1º", texto: "Troféu de Primeiro Lugar + Medalha" },
  { lugar: "2º", texto: "Troféu de Segundo Lugar + Medalha" },
  { lugar: "3º", texto: "Troféu de Terceiro Lugar + Medalha" },
];

export const CATEGORIAS: Categoria[] = [
  {
    sub: [
      { genero: "M", titulo: "Geral Masculino", premios: PREMIOS_GERAL_M },
      { genero: "F", titulo: "Geral Feminino", premios: PREMIOS_GERAL_F },
    ],
  },
  {
    sub: [
      { genero: "M", titulo: "Infanto-Juvenil Masculina", premios: PREMIOS_TROFEU },
      { genero: "F", titulo: "Infanto-Juvenil Feminino", premios: PREMIOS_TROFEU },
    ],
  },
  {
    sub: [
      { genero: "M", titulo: "60+ Masculina", premios: PREMIOS_TROFEU },
      { genero: "F", titulo: "60+ Feminina", premios: PREMIOS_TROFEU },
    ],
  },
];

export function LugarBadge({ lugar }: { lugar: string }) {
  const tone =
    lugar === "1º"
      ? "bg-gradient-orange text-white shadow-orange"
      : lugar === "2º"
        ? "bg-[color:var(--color-brand-purple)] text-white"
        : "bg-[color:var(--color-brand-amber)] text-[color:var(--color-brand-dark)]";
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${tone}`}
    >
      {lugar}
    </span>
  );
}

export function SubCategoriaBlock({ sub }: { sub: SubCategoria }) {
  const isMasc = sub.genero === "M";
  const iconWrap = isMasc
    ? "bg-blue-50 text-blue-600 ring-blue-100"
    : "bg-pink-50 text-pink-600 ring-pink-100";
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`grid h-16 w-16 place-items-center rounded-2xl ring-4 ${iconWrap}`}
        aria-hidden
      >
        <PersonStanding className="h-9 w-9" strokeWidth={2.2} />
      </div>
      <h3 className="mt-4 text-base font-extrabold uppercase tracking-tight text-[color:var(--color-brand-purple-text)] md:text-lg">
        {sub.titulo}
      </h3>
      <ul className="mt-4 w-full space-y-2.5 text-left">
        {sub.premios.map((p) => (
          <li
            key={p.lugar}
            className="flex items-start gap-3 rounded-2xl bg-[color:var(--color-brand-soft)]/60 p-2.5 pr-3"
          >
            <LugarBadge lugar={p.lugar} />
            <span className="pt-1 text-xs leading-snug text-[color:var(--color-brand-dark)]/85 md:text-sm">
              {p.texto}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CategoriasGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-3 md:gap-8">
      {CATEGORIAS.map((cat, i) => (
        <article
          key={i}
          className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 md:p-8"
        >
          <div className="flex items-center justify-center gap-2 text-[color:var(--color-brand-orange)]">
            <Trophy className="h-5 w-5" />
            <Medal className="h-5 w-5" />
          </div>
          <div className="mt-6 flex-1">
            <SubCategoriaBlock sub={cat.sub[0]} />
          </div>
          <div className="mt-8 border-t border-[color:var(--color-brand-purple)]/10 pt-8">
            <SubCategoriaBlock sub={cat.sub[1]} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function CategoriasPremiacoes() {
  return (
    <section
      className="relative text-white"
      style={{
        background:
          "linear-gradient(180deg, #e9591b 0%, #ff5300 12%, #ff5300 100%)",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/85">
            Categorias e premiações
          </p>
          <h2 className="heading-section mt-3 text-3xl text-white md:text-5xl">
            Categorias e premiações da corrida
          </h2>
          <p
            className="mt-5 text-base leading-relaxed text-white/95 md:text-lg"
            style={{ textAlign: "justify" }}
          >
            Confira todas categorias e as premiações para os três melhores
            colocados de cada categoria. Todos os participantes recebem medalha!
          </p>
        </div>

        <div className="mt-12">
          <CategoriasGrid />
        </div>
      </div>
    </section>
  );
}
