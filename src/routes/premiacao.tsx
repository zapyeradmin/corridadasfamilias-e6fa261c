import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-shell";
import { CategoriasGrid } from "@/components/site/categorias-premiacoes";

export const Route = createFileRoute("/premiacao")({
  head: () => ({
    meta: [
      { title: "Premiação — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Premiação da II Corrida das Famílias: prêmios em dinheiro no Geral Masculino e Feminino, troféus por categoria e medalha finisher para todos que cruzarem a linha de chegada.",
      },
      { property: "og:title", content: "Premiação — II Corrida das Famílias" },
      {
        property: "og:description",
        content:
          "Prêmios em dinheiro, troféus por categoria (Geral, Infanto-Juvenil e 60+) e medalha finisher para todos os participantes.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Reconhecimento"
        title="Premiação"
        description="Premiação em dinheiro no Geral, troféus por categoria e medalha finisher para todos que cruzarem a linha de chegada."
      />

      <section
        className="relative text-white"
        style={{
          background:
            "linear-gradient(180deg, #e9591b 0%, #ff5300 12%, #ff5300 100%)",
        }}
      >
        <div className="mx-auto max-w-[1200px] px-5 pt-6 pb-20 md:px-8 md:pt-8 md:pb-28">
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
              colocados de cada categoria. Todos os participantes recebem
              medalha!
            </p>
          </div>

          <div className="mt-12">
            <CategoriasGrid />
          </div>

          <p className="mt-12 rounded-2xl bg-white/10 p-6 text-sm text-white/95 ring-1 ring-white/20">
            Todos os participantes que cruzarem a linha de chegada recebem a
            medalha de finisher da II Corrida das Famílias.
          </p>
        </div>
      </section>

      <section className="bg-[color:var(--color-brand-purple)]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 py-16 text-center md:px-8 md:py-20">
          <h3 className="heading-section text-2xl text-white md:text-4xl">
            Pronto para correr com a sua família?
          </h3>
          <p className="max-w-xl text-base text-white/80">
            Garanta sua vaga e venha viver essa experiência única em Serra
            Talhada/PE.
          </p>
          <Link
            to="/inscricao"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-brand-orange)] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white shadow-orange transition hover:brightness-110"
          >
            Inscreva-se Já!
          </Link>
        </div>
      </section>
    </>
  );
}
