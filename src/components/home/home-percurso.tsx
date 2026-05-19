import { PERCURSO_INFOS, PercursoInfoItem } from "@/components/site/percurso-info";
import percursoMapa from "@/assets/percurso-mapa.png";

export function HomePercurso() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-purple-text)]/70">
            Percurso completo da corrida
          </p>
          <h2 className="heading-section mt-3 text-3xl text-[color:var(--color-brand-purple-title)] md:text-5xl">
            Fique por dentro do percurso, para não errar no dia da corrida
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[color:var(--color-brand-purple-text)]/80 text-justify md:text-lg">
            Explore um trajeto que celebra a beleza da nossa Serra Talhada,
            passando por pontos importantes da cidade. Fiquem atentos ao
            trajeto:
          </p>
        </div>

        <div className="mt-12 grid items-center gap-10 md:grid-cols-2 md:gap-12">
          <div className="aspect-[4/3] w-full">
            <img
              src={percursoMapa}
              alt="Mapa do percurso oficial da II Corrida das Famílias em Serra Talhada"
              loading="lazy"
              decoding="async"
              width={1024}
              height={768}
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
  );
}
