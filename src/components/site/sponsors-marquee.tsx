import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublishedSponsors } from "@/lib/public.functions";
import { cn } from "@/lib/utils";

// Ajuste óptico por logo (slug derivado do logo_url) para equilibrar
// logos com proporções/larguras diferentes — sem alterar os arquivos.
const LOGO_SCALE: Record<string, string> = {
  "urbano-alimentos": "scale-125",
  "prefeitura-serra-talhada": "scale-110",
  "nattivo-cafe": "scale-100",
  "oracle-digital": "scale-100",
};

function slugFromUrl(url: string) {
  const file = url.split("/").pop() ?? "";
  return file.replace(/\.[a-zA-Z0-9]+$/, "");
}

export function SponsorsMarquee() {
  const fetchSponsors = useServerFn(getPublishedSponsors);
  const { data, isLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => fetchSponsors(),
    staleTime: 5 * 60 * 1000,
  });

  const diamond = (data ?? []).filter((s) => s.tier === "diamond");

  // Skeleton com altura reservada para evitar CLS no primeiro paint
  if (isLoading && diamond.length === 0) {
    return (
      <section className="border-y border-[color:var(--color-brand-purple)]/10 bg-white py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
            Patrocínio Diamante
          </p>
          <div className="h-16 md:h-20" />
        </div>
      </section>
    );
  }

  if (diamond.length === 0) return null;

  // Duplicamos a trilha para loop infinito perfeito (translateX -50%)
  const track = [...diamond, ...diamond];
  // Velocidade constante: ~6s por item
  const duration = Math.max(20, diamond.length * 6);

  return (
    <section className="border-y border-[color:var(--color-brand-purple)]/10 bg-white py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)] md:mb-8">
          Patrocínio Diamante
        </p>

        <div className="group relative overflow-hidden">
          {/* Gradientes laterais para fade do loop */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-white to-transparent md:w-20" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-white to-transparent md:w-20" />

          <div
            className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]"
            style={{ ["--marquee-duration" as string]: `${duration}s` }}
          >
            {track.map((s, i) => {
              const slug = slugFromUrl(s.logo_url);
              const scale = LOGO_SCALE[slug] ?? "scale-100";
              const img = (
                <img
                  src={s.logo_url}
                  alt={s.name}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className={cn(
                    "max-h-full max-w-full object-contain transition-transform",
                    scale,
                  )}
                />
              );
              return (
                <div
                  key={`${s.id}-${i}`}
                  aria-hidden={i >= diamond.length}
                  className="flex h-14 w-[160px] shrink-0 items-center justify-center px-4 md:h-20 md:w-[220px] md:px-8"
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
