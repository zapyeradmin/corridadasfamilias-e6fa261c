import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-shell";
import { PERCURSO_INFOS, PercursoInfoItem } from "@/components/site/percurso-info";
import percursoMapa from "@/assets/percurso-mapa.png";

export const Route = createFileRoute("/percurso")({
  head: () => ({
    meta: [
      { title: "Percurso 5km — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Percurso oficial de 5km com largada e chegada na Igreja Matriz de Nossa Senhora do Rosário, em Serra Talhada/PE.",
      },
      { property: "og:title", content: "Percurso 5km — II Corrida das Famílias" },
      {
        property: "og:description",
        content:
          "Trajeto pelas principais ruas do centro de Serra Talhada — largada e chegada na Igreja Matriz de Nossa Senhora do Rosário.",
      },
      { property: "og:image", content: percursoMapa },
      { name: "twitter:image", content: percursoMapa },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="5 quilômetros"
        title="Percurso oficial"
        description="Largada e chegada na Igreja Matriz, com trajeto pelas principais ruas do centro de Serra Talhada."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">

          <div className="mt-12 grid items-center gap-10 md:grid-cols-2 md:gap-12 my-[20px] border-0 py-0">
            <div className="aspect-[4/3] w-full">
              <img
                src={percursoMapa}
                alt="Mapa do percurso oficial da II Corrida das Famílias em Serra Talhada"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold leading-tight text-[color:var(--color-brand-purple-title)] md:text-3xl">
                O trajeto passa pelas principais ruas da Cidade
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[color:var(--color-brand-purple-text)]/80">
                O percurso de 5km foi desenhado para ser acessível a todos os
                níveis de corredores, desde iniciantes até os mais experientes,
                proporcionando uma experiência inesquecível.
              </p>

              <ul className="mt-8 flex flex-col gap-6">
                {PERCURSO_INFOS.map((info) => (
                  <PercursoInfoItem key={info.titulo} {...info} />
                ))}
              </ul>
            </div>
          </div>
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
