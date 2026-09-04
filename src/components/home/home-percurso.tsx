import { PERCURSO_INFOS, PercursoInfoItem } from "@/components/site/percurso-info";
import percursoMapa from "@/assets/percurso-mapa.png?w=1024&quality=82&format=webp";

export function HomePercurso() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c20505]">
            Percurso completo da corrida
          </p>
          <h2 className="heading-section mt-3 text-3xl text-[#c20505] md:text-5xl">
            Fique por dentro do percurso, para não errar no dia da corrida
          </h2>
          <p className="mt-4 text-base text-justify text-[#3d0000]">
            Explore um trajeto completo que celebra a beleza de Serra Talhada, com largada e chegada no portão do Shopping Serra Talhada e passagem pelo Cristo no Alto do Bom Jesus. Fique atento a todos os pontos do percurso:
          </p>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex justify-center lg:col-span-5 lg:sticky lg:top-28">
            <div className="relative w-full max-w-[420px] lg:max-w-[460px]">
              <img
                src={percursoMapa}
                alt="Mapa e estatísticas do percurso oficial da 2ª Corrida Natalina em Serra Talhada"
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
            <p className="mt-4 text-base text-justify text-[#3d0000]">
              O percurso de 6km foi desenhado para ser dinâmico e marcante, passando pelos principais pontos e avenidas de Serra Talhada, proporcionando uma experiência inesquecível a todos os atletas.
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
  );
}
