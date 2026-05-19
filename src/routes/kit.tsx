import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-shell";
import { KIT_ITENS_PAGINA, KitItem } from "@/components/site/kit-itens";
import kitExclusivo from "@/assets/kit-exclusivo.png";

export const Route = createFileRoute("/kit")({
  head: () => ({
    meta: [
      { title: "Kit do atleta — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Kit oficial da II Corrida das Famílias: camiseta exclusiva, número de peito, hidratação no percurso, medalha finisher e contribuição solidária.",
      },
      { property: "og:title", content: "Kit do atleta — II Corrida das Famílias" },
      {
        property: "og:description",
        content:
          "Conheça todos os itens do kit oficial: camiseta, número, hidratação, medalha finisher e a tradicional contribuição solidária.",
      },
      { property: "og:image", content: kitExclusivo },
      { name: "twitter:image", content: kitExclusivo },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Tudo que você recebe"
        title="Kit do atleta"
        description="Cada inscrito recebe um kit completo, pensado para a sua experiência ser inesquecível."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-5 pt-6 pb-20 md:px-8 md:pt-8 md:pb-28">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <div className="relative aspect-square">
              <img
                src={kitExclusivo}
                alt="Kit exclusivo do atleta da II Corrida das Famílias"
                loading="lazy"
                decoding="async"
                width={1024}
                height={1024}
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold leading-tight text-[color:var(--color-brand-purple-title)] md:text-3xl">
                Kit Exclusivo para sua Corrida
              </h3>
              <p className="mt-4 text-base text-[color:var(--color-brand-purple-text)]">
                Desenvolvemos um kit especial para que você tenha tudo o que precisa
                para participar da corrida com conforto e estilo. Cada item foi
                cuidadosamente selecionado pensando na sua experiência.
              </p>

              <ul className="mt-8 space-y-5">
                {KIT_ITENS_PAGINA.map((item) => (
                  <KitItem key={item.titulo} {...item} />
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-12 rounded-2xl bg-[color:var(--color-brand-soft)] p-6 text-sm text-[color:var(--color-brand-purple-text)]">
            A data, horário e local de retirada do kit serão divulgados oficialmente.
            Acompanhe as redes sociais e o WhatsApp da organização.
          </p>
        </div>
      </section>

      <section className="bg-[color:var(--color-brand-purple)]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 py-16 text-center md:px-8 md:py-20">
          <h3 className="heading-section text-2xl text-white md:text-4xl">
            Pronto para correr com a sua família?
          </h3>
          <p className="max-w-xl text-base text-white/80">
            Garanta sua vaga e venha viver essa experiência única em Serra Talhada/PE.
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
