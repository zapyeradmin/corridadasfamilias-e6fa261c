import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublishedSponsors } from "@/lib/public.functions";
import { LOGO_ASSETS, LOGO_SCALE, slugFromUrl, FALLBACK_DIAMOND } from "@/lib/sponsors-assets";
import { SITE } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function HomePatrocinadores() {
  const fetchSponsors = useServerFn(getPublishedSponsors);
  const { data } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => fetchSponsors(),
    staleTime: 5 * 60 * 1000,
  });

  const diamondRows = (data ?? []).filter((s) => s.tier === "diamond");

  const diamond =
    diamondRows.length > 0
      ? diamondRows.map((s) => ({
          id: s.id,
          name: s.name,
          slug: slugFromUrl(s.logo_url),
          logo_url: s.logo_url,
          website_url: s.website_url,
        }))
      : FALLBACK_DIAMOND.map((s) => ({ ...s, logo_url: LOGO_ASSETS[s.slug] ?? "" }));

  const TOTAL = 24;
  const placeholders = Array.from(
    { length: Math.max(0, TOTAL - diamond.length) },
    (_, i) => i + diamond.length + 1,
  );

  const waMsg = encodeURIComponent(
    "Olá! Tenho interesse em patrocinar a II Corrida das Famílias.",
  );
  const waHref = `https://wa.me/${SITE.whatsapp}?text=${waMsg}`;

  return (
    <section className="bg-[color:var(--color-brand-orange)]">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-white">
            Quem apoia a corrida
          </p>
          <h2 className="heading-section mt-3 text-3xl text-white md:text-5xl">
            Veja quem são os nossos patrocinadores
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-white text-justify md:text-lg">
            Marcas que acreditam no esporte, na fé e nas famílias da nossa comunidade.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:mt-14 md:grid-cols-4 md:gap-6">
          {diamond.map((s) => {
            const bundled = LOGO_ASSETS[s.slug];
            const src = bundled ?? s.logo_url;
            const scale = LOGO_SCALE[s.slug] ?? "scale-100";
            const inner = (
              <img
                src={src}
                alt={s.name}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={cn("max-h-[78%] max-w-[82%] object-contain", scale)}
              />
            );
            return (
              <div
                key={s.id}
                className="grid aspect-[16/9] place-items-center rounded-2xl border border-white/40 bg-white p-3 shadow-[0_8px_24px_rgba(22,9,31,0.12)] ring-1 ring-black/5 md:p-4"
              >
                {s.website_url ? (
                  <a
                    href={s.website_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    className="grid h-full w-full place-items-center transition hover:scale-[1.02]"
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </div>
            );
          })}
          {placeholders.map((n) => (
            <div
              key={`ph-${n}`}
              className="grid aspect-[16/9] place-items-center rounded-2xl border border-white/40 bg-white p-3 shadow-[0_8px_24px_rgba(22,9,31,0.12)] ring-1 ring-black/5 md:p-4"
            >
              <span className="text-sm font-extrabold uppercase tracking-wider text-[color:var(--color-brand-orange)] md:text-base">
                Patrocinador {n}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-base text-white md:mt-14 md:text-lg">
          Quer apoiar o evento?{" "}
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="font-bold underline underline-offset-4 transition hover:text-white/85"
          >
            Fale conosco no WhatsApp
          </a>{" "}
          e receba nossa proposta.
        </p>

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            to="/inscricao"
            className="inline-flex items-center justify-center rounded-full bg-[#431181] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_10px_30px_rgba(67,17,129,0.35)] transition hover:bg-[#3a0e72] hover:shadow-[0_14px_36px_rgba(67,17,129,0.45)] md:text-lg"
          >
            Inscreva-se Já!
          </Link>
        </div>
      </div>
    </section>
  );
}
