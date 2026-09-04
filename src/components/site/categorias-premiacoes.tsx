import { PersonStanding, Trophy, Medal, Sparkles } from "lucide-react";

export type Premio = { lugar: string; texto: string };
export type SubCategoria = { genero: "M" | "F"; titulo: string; premios: Premio[] };
export type Categoria = { nomeGrupo: string; destaque?: boolean; sub: SubCategoria[] };

export const PREMIOS_GERAL: Premio[] = [
  { lugar: "1º", texto: "R$ 500,00 + Troféu + Medalha" },
  { lugar: "2º", texto: "R$ 350,00 + Troféu + Medalha" },
  { lugar: "3º", texto: "R$ 150,00 + Troféu + Medalha" },
  { lugar: "4º", texto: "Troféu + Medalha" },
  { lugar: "5º", texto: "Troféu + Medalha" },
];

export const PREMIOS_TROFEU_MEDALHA: Premio[] = [
  { lugar: "1º", texto: "Troféu + Medalha" },
  { lugar: "2º", texto: "Troféu + Medalha" },
  { lugar: "3º", texto: "Troféu + Medalha" },
];

export const CATEGORIAS: Categoria[] = [
  {
    nomeGrupo: "Geral (Idade Livre)",
    destaque: true,
    sub: [
      { genero: "M", titulo: "Geral Masculino (Idade Livre)", premios: PREMIOS_GERAL },
      { genero: "F", titulo: "Geral Feminino (Idade Livre)", premios: PREMIOS_GERAL },
    ],
  },
  {
    nomeGrupo: "Faixa Etária | 14 a 29 Anos",
    sub: [
      { genero: "M", titulo: "Faixa Etária | 14 a 29 Anos Masculino", premios: PREMIOS_TROFEU_MEDALHA },
      { genero: "F", titulo: "Faixa Etária | 14 a 29 Anos Feminino", premios: PREMIOS_TROFEU_MEDALHA },
    ],
  },
  {
    nomeGrupo: "Faixa Etária | 30 a 39 Anos",
    sub: [
      { genero: "M", titulo: "Faixa Etária | 30 a 39 Anos Masculino", premios: PREMIOS_TROFEU_MEDALHA },
      { genero: "F", titulo: "Faixa Etária | 30 a 39 Anos Feminino", premios: PREMIOS_TROFEU_MEDALHA },
    ],
  },
  {
    nomeGrupo: "Faixa Etária | 40 a 49 Anos",
    sub: [
      { genero: "M", titulo: "Faixa Etária | 40 a 49 Anos Masculino", premios: PREMIOS_TROFEU_MEDALHA },
      { genero: "F", titulo: "Faixa Etária | 40 a 49 Anos Feminino", premios: PREMIOS_TROFEU_MEDALHA },
    ],
  },
  {
    nomeGrupo: "Faixa Etária | 50 a 59 Anos",
    sub: [
      { genero: "M", titulo: "Faixa Etária | 50 a 59 Anos Masculino", premios: PREMIOS_TROFEU_MEDALHA },
      { genero: "F", titulo: "Faixa Etária | 50 a 59 Anos Feminino", premios: PREMIOS_TROFEU_MEDALHA },
    ],
  },
  {
    nomeGrupo: "Faixa Etária | 60+ Anos",
    sub: [
      { genero: "M", titulo: "Faixa Etária | 60+ Masculino", premios: PREMIOS_TROFEU_MEDALHA },
      { genero: "F", titulo: "Faixa Etária | 60+ Feminino", premios: PREMIOS_TROFEU_MEDALHA },
    ],
  },
  {
    nomeGrupo: "Atletas Corre+ (Idade Livre)",
    sub: [
      { genero: "M", titulo: "Atletas Corre+ Masculino (Idade Livre)", premios: PREMIOS_TROFEU_MEDALHA },
      { genero: "F", titulo: "Atletas Corre+ Feminino (Idade Livre)", premios: PREMIOS_TROFEU_MEDALHA },
    ],
  },
  {
    nomeGrupo: "Atletas PCD (Idade Livre)",
    sub: [
      { genero: "M", titulo: "Atletas PCD Masculino (Idade Livre)", premios: PREMIOS_TROFEU_MEDALHA },
      { genero: "F", titulo: "Atletas PCD Feminino (Idade Livre)", premios: PREMIOS_TROFEU_MEDALHA },
    ],
  },
  {
    nomeGrupo: "Segurança Pública (Idade Livre)",
    sub: [
      { genero: "M", titulo: "Segurança Pública Masculino (Idade Livre)", premios: PREMIOS_TROFEU_MEDALHA },
      { genero: "F", titulo: "Segurança Pública Feminino (Idade Livre)", premios: PREMIOS_TROFEU_MEDALHA },
    ],
  },
];

export function LugarBadge({ lugar }: { lugar: string }) {
  const tone =
    lugar === "1º"
      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
      : lugar === "2º"
        ? "bg-slate-500 text-white shadow-sm"
        : lugar === "3º"
          ? "bg-amber-800 text-white shadow-sm"
          : "bg-stone-200 text-stone-700";
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${tone}`}
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
        className={`grid h-12 w-12 place-items-center rounded-xl ring-2 ${iconWrap}`}
        aria-hidden
      >
        <PersonStanding className="h-7 w-7" strokeWidth={2.2} />
      </div>
      <h3 className="mt-3 text-sm font-extrabold uppercase tracking-tight text-[#c20505] md:text-base">
        {sub.titulo}
      </h3>
      <ul className="mt-3 w-full space-y-2 text-left">
        {sub.premios.map((p) => (
          <li
            key={p.lugar}
            className="flex items-center gap-2.5 rounded-xl bg-[color:var(--color-brand-soft)]/60 px-3 py-2"
          >
            <LugarBadge lugar={p.lugar} />
            <span className="text-xs font-semibold leading-snug text-[#3d0000] md:text-sm">
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
      {CATEGORIAS.map((cat, i) => (
        <article
          key={i}
          className={`flex h-full flex-col rounded-3xl bg-white p-6 shadow-card ring-1 md:p-7 ${
            cat.destaque
              ? "ring-2 ring-amber-400/80 shadow-lg relative overflow-hidden"
              : "ring-black/5"
          }`}
        >
          {cat.destaque && (
            <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-800 ring-1 ring-amber-300/80">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Premiação em Dinheiro (1º ao 3º) + Troféus</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#c20505] bg-[#c20505] text-white shadow-sm">
              <Trophy className="h-4.5 w-4.5" />
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#c20505] bg-[#c20505] text-white shadow-sm">
              <Medal className="h-4.5 w-4.5" />
            </span>
          </div>

          <p className="mt-3 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-[#3d0000]/70">
            {cat.nomeGrupo}
          </p>

          <div className="mt-5 flex-1">
            <SubCategoriaBlock sub={cat.sub[0]} />
          </div>
          <div className="mt-6 border-t border-black/5 pt-6">
            <SubCategoriaBlock sub={cat.sub[1]} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function CategoriasPremiacoes() {
  return (
    <section className="relative bg-[#c20505] text-white">
      <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 md:py-28">
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
            Confira todas as categorias oficiais e as premiações para os melhores colocados.
            Premiação em dinheiro para o 1º, 2º e 3º colocado do Geral (Masculino e Feminino), troféus exclusivos e medalha finisher para todos os participantes que concluírem a prova!
          </p>
        </div>

        <div className="mt-12">
          <CategoriasGrid />
        </div>
      </div>
    </section>
  );
}
