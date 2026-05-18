import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublishedSponsors } from "@/lib/public.functions";
import { cn } from "@/lib/utils";
import {
  LOGO_ASSETS,
  LOGO_SCALE,
  slugFromUrl,
  FALLBACK_DIAMOND,
} from "@/lib/sponsors-assets";

const FALLBACK = FALLBACK_DIAMOND;

export function SponsorsMarquee() {
  const fetchSponsors = useServerFn(getPublishedSponsors);
  const { data } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => fetchSponsors(),
    staleTime: 5 * 60 * 1000,
  });

  const fromDb = (data ?? [])
    .filter((s) => s.tier === "diamond")
    .map((s) => ({
      id: s.id,
      name: s.name,
      slug: slugFromUrl(s.logo_url),
      website_url: s.website_url,
    }))
    .filter((s) => LOGO_ASSETS[s.slug]);

  const diamond = fromDb.length > 0 ? fromDb : FALLBACK;

  // Duplicamos a trilha para loop infinito perfeito (translateX -50%)
  const track = [...diamond, ...diamond];
  const duration = Math.max(24, diamond.length * 7);

  return (
    <section className="border-y border-[color:var(--color-brand-purple)]/10 bg-white py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)] md:mb-8">
          Patrocínio Diamante
        </p>

        <div className="group relative overflow-hidden">
          {/* Gradientes laterais para fade do loop */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent md:w-24" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent md:w-24" />

          <div
            className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]"
            style={{ ["--marquee-duration" as string]: `${duration}s` }}
          >
            {track.map((s, i) => {
              const src = LOGO_ASSETS[s.slug];
              const scale = LOGO_SCALE[s.slug] ?? "scale-100";
              const img = (
                <img
                  src={src}
                  alt={s.name}
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  className={cn("max-h-full max-w-full object-contain", scale)}
                />
              );
              return (
                <div
                  key={`${s.id}-${i}`}
                  aria-hidden={i >= diamond.length}
                  className="flex h-16 w-[180px] shrink-0 items-center justify-center px-6 sm:w-[200px] md:h-24 md:w-[260px] md:px-10"
                >
                  {s.website_url ? (
                    <a
                      href={s.website_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.name}
                      className="flex h-full w-full items-center justify-center"
                    >
                      {img}
                    </a>
                  ) : (
                    img
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
