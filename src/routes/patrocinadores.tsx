import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/site/page-shell";
import { getPublishedSponsors } from "@/lib/public.functions";
import { SITE } from "@/lib/site-config";
import { LOGO_ASSETS, slugFromUrl, FALLBACK_DIAMOND } from "@/lib/sponsors-assets";
import { useSponsorsRealtime } from "@/hooks/use-sponsors-realtime";

export const Route = createFileRoute("/patrocinadores")({
  head: () => ({
    meta: [
      { title: "Patrocinadores — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Marcas e instituições que apoiam a II Corrida das Famílias em Serra Talhada/PE.",
      },
      { property: "og:title", content: "Patrocinadores — II Corrida das Famílias" },
      {
        property: "og:description",
        content:
          "Conheça as marcas que acreditam no esporte, na fé e nas famílias da nossa comunidade.",
      },
    ],
  }),
  component: Page,
});

const TOTAL = 28;

type CardItem = {
  id: string;
  name: string;
  src: string;
  website_url: string | null;
};

function Page() {
  useSponsorsRealtime();
  const fetchSponsors = useServerFn(getPublishedSponsors);
  const { data: sponsors } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => fetchSponsors(),
    staleTime: 5 * 60 * 1000,
  });

  const all = sponsors ?? [];
  const diamondRows = all.filter((s) => s.tier === "diamond");
  const othersRows = all.filter((s) => s.tier !== "diamond");

  const diamondCards: CardItem[] =
    diamondRows.length > 0
      ? diamondRows.map((s) => ({
          id: s.id,
          name: s.name,
          src: LOGO_ASSETS[slugFromUrl(s.logo_url)] ?? s.logo_url,
          website_url: s.website_url,
        }))
      : FALLBACK_DIAMOND.map((s) => ({
          id: s.id,
          name: s.name,
          src: LOGO_ASSETS[s.slug] ?? "",
          website_url: s.website_url,
        }));

  const otherCards: CardItem[] = othersRows.map((s) => ({
    id: s.id,
    name: s.name,
    src: LOGO_ASSETS[slugFromUrl(s.logo_url)] ?? s.logo_url,
    website_url: s.website_url,
  }));

  const cards = [...diamondCards, ...otherCards].slice(0, TOTAL);
  const placeholders = Array.from(
    { length: Math.max(0, TOTAL - cards.length) },
    (_, i) => i + cards.length + 1,
  );

  const waHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    "Olá! Tenho interesse em patrocinar a II Corrida das Famílias.",
  )}`;

  return (
    <>
      <PageHeader
        eyebrow="Quem apoia"
        title="Nossos patrocinadores"
        description="Marcas que acreditam no esporte, na fé e nas famílias da nossa comunidade."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-5 pt-6 pb-20 md:px-8 md:pt-8 md:pb-28">
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-6">
            {cards.map((s) => {
              const img = (
                <img
                  src={s.src}
                  alt={s.name}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="h-full w-full rounded-2xl object-cover"
                />
              );
              return (
                <div
                  key={s.id}
                  className="aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  {s.website_url ? (
                    <a
                      href={s.website_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.name}
                      className="block h-full w-full"
                    >
                      {img}
                    </a>
                  ) : (
                    img
                  )}
                </div>
              );
            })}
            {placeholders.map((n) => (
              <div
                key={`ph-${n}`}
                className="grid aspect-[16/9] place-items-center rounded-2xl border border-dashed border-[color:var(--color-brand-purple)]/25 bg-white p-3 shadow-soft md:p-4"
              >
                <span className="text-sm font-extrabold uppercase tracking-wider text-[color:var(--color-brand-orange)] md:text-base">
                  Patrocinador {n}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-base text-[color:var(--color-brand-purple-text)] md:mt-14 md:text-lg">
            Quer apoiar o evento?{" "}
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline underline-offset-4 transition hover:opacity-80"
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
    </>
  );
}
