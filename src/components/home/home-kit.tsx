import { Link } from "@tanstack/react-router";
import { KIT_ITENS, KitItem } from "@/components/site/kit-itens";
import kitExclusivo from "@/assets/kit-exclusivo.png";

export function HomeKit() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
          Kit Exclusivo dos Atletas
        </p>
        <h2 className="heading-section mt-3 text-3xl text-[color:var(--color-brand-purple-title)] md:text-5xl">
          Inscreva-se e garanta o seu kit exclusivo
        </h2>
        <p className="mt-4 text-base text-justify text-[color:var(--color-brand-purple-text)]">
          Confira todos os itens exclusivos que você receberá no seu kit atleta para tornar sua
          experiência ainda mais especial.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
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
              Desenvolvemos um kit especial para que você tenha tudo o que precisa para participar
              da corrida com conforto e estilo. Cada item foi cuidadosamente selecionado pensando
              na sua experiência.
            </p>

            <ul className="mt-8 space-y-5">
              {KIT_ITENS.map((item) => (
                <KitItem key={item.titulo} {...item} />
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/inscricao"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-brand-orange)] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white shadow-card transition hover:brightness-110"
          >
            Faça a sua Inscrição
          </Link>
        </div>
      </div>
    </section>
  );
}
