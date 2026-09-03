import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-shell";
import { CategoriasGrid } from "@/components/site/categorias-premiacoes";

export const Route = createFileRoute("/premiacao")({
  head: () => ({
    meta: [
      { title: "Premiação — 2ª Corrida Natalina | CORRE+" },
      {
        name: "description",
        content:
          "Premiação da 2ª Corrida Natalina | CORRE+: prêmios em dinheiro, troféus por categoria e medalha finisher.",
      },
      { property: "og:title", content: "Premiação — 2ª Corrida Natalina | CORRE+" },
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

      <section className="relative bg-white">
        <div className="mx-auto max-w-[1200px] px-5 pt-6 pb-20 md:px-8 md:pt-8 md:pb-28">
          <CategoriasGrid />
        </div>
      </section>

      <section className="bg-[#c20505]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 py-16 text-center md:px-8 md:py-20">
          <h3 className="heading-section text-2xl text-white md:text-4xl">
            Pronto para subir no pódio?
          </h3>
          <p className="max-w-xl text-base text-white/90">
            Garanta sua vaga e venha buscar sua superação em Serra Talhada/PE.
          </p>
          <Link
            to="/inscricao"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-[#c20505] shadow-premium transition duration-300 hover:scale-[1.03]"
          >
            Inscreva-se Já!
          </Link>
        </div>
      </section>
    </>
  );
}
