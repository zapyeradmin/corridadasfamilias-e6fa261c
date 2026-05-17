import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import AutoScroll from "embla-carousel-auto-scroll";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { getPublishedSponsors } from "@/lib/public.functions";

export function SponsorsMarquee() {
  const fetchSponsors = useServerFn(getPublishedSponsors);
  const { data } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => fetchSponsors(),
    staleTime: 5 * 60 * 1000,
  });

  const diamond = (data ?? []).filter((s) => s.tier === "diamond");
  if (diamond.length === 0) return null;

  // Duplica para garantir loop suave quando há poucos logos
  const items = diamond.length < 6 ? [...diamond, ...diamond, ...diamond] : diamond;

  return (
    <section className="border-y border-[color:var(--color-brand-purple)]/10 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4">
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
          Patrocínio Diamante
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white to-transparent" />
          <Carousel
            opts={{ loop: true, align: "start", dragFree: true }}
            plugins={[
              AutoScroll({
                playOnInit: true,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
                speed: 1,
              }),
            ]}
          >
            <CarouselContent className="-ml-8">
              {items.map((s, i) => {
                const inner = (
                  <img
                    src={s.logo_url}
                    alt={s.name}
                    loading="lazy"
                    className="h-16 w-auto max-w-[180px] object-contain transition"
                  />
                );
                return (
                  <CarouselItem
                    key={`${s.id}-${i}`}
                    className="flex basis-1/3 items-center justify-center pl-8 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                  >
                    {s.website_url ? (
                      <a href={s.website_url} target="_blank" rel="noreferrer" aria-label={s.name}>
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
