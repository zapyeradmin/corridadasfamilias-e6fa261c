import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-shell";
import { PERCURSO_INFOS, PercursoInfoItem } from "@/components/site/percurso-info";
import percursoMapa from "@/assets/percurso-mapa.png?w=1024&quality=82&format=webp";

export const Route = createFileRoute("/percurso")({
  head: () => ({
    meta: [
      { title: "Percurso 6km — 2ª Corrida Natalina | Corre +" },
      {
        name: "description",
        content:
          "Percurso oficial de 6km com largada e chegada no portão do Shopping Serra Talhada na Av. Adriano Duque de Godoy Sousa. 2ª Corrida Natalina | Corre +.",
      },
      { property: "og:title", content: "Percurso 6km — 2ª Corrida Natalina | Corre +" },
      {
        property: "og:description",
        content:
          "Trajeto pelas principais vias de Serra Talhada — largada e chegada no portão do Shopping Serra Talhada na Av. Adriano Duque de Godoy Sousa.",
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
        eyebrow="6 quilômetros"
        title="Percurso oficial"
        description="Largada e chegada no portão do Shopping Serra Talhada na Av. Adriano Duque de Godoy Sousa, com trajeto sinalizado pelas principais ruas da cidade."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-5 pt-6 pb-20 md:px-8 md:pt-8 md:pb-28">
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex justify-center lg:col-span-5 lg:sticky lg:top-28">
              <div className="relative w-full max-w-[420px] lg:max-w-[460px]">
                <img
                  src={percursoMapa}
                  alt="Mapa e estatísticas do percurso oficial da 2ª Corrida Natalina | Corre + em Serra Talhada"
                  loading="lazy"
                  decoding="async"
                  width={1122}
                  height={1402}
                  className="mx-auto h-auto w-full object-contain drop-shadow-[0_16px_36px_rgba(194,5,5,0.18)] transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <h3 className="text-2xl font-extrabold leading-tight text-[#c20505] md:text-3xl">
                O trajeto passa pelas principais ruas da Cidade
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[#3d0000]">
                O percurso de 6km foi desenhado para ser acessível a todos os níveis de corredores,
                desde iniciantes até os mais experientes, proporcionando uma experiência
                inesquecível.
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

      <section className="bg-[#c20505]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 py-16 text-center md:px-8 md:py-20">
          <h3 className="heading-section text-2xl text-white md:text-4xl">
            Pronto para viver essa emoção?
          </h3>
          <p className="max-w-xl text-base text-white/90">
            Garanta sua vaga e venha viver essa experiência esportiva inesquecível em Serra
            Talhada/PE.
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
