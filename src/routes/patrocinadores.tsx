import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/site/page-shell";
import { getPublishedSponsors } from "@/lib/public.functions";
import { SITE } from "@/lib/site-config";
import { LOGO_ASSETS, LOGO_SCALE, slugFromUrl, FALLBACK_DIAMOND } from "@/lib/sponsors-assets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patrocinadores")({
  head: () => ({
    meta: [
      { title: "Patrocinadores — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Marcas e instituições que apoiam a II Corrida das Famílias em Serra Talhada/PE — cotas Diamante, Ouro, Prata e Apoiadores.",
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


const TIER_LABEL: Record<string, string> = {
  diamond: "Patrocínio Diamante",
  gold: "Patrocínio Ouro",
  silver: "Patrocínio Prata",
  standard: "Apoiadores",
};

const DIAMOND_TOTAL = 24;

function SponsorCard({
  name,
  logoUrl,
  websiteUrl,
}: {
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
}) {
  const slug = slugFromUrl(logoUrl);
  const bundled = LOGO_ASSETS[slug];
  const scale = LOGO_SCALE[slug] ?? "scale-100";
  const src = bundled ?? logoUrl;

  const img = (
    <img
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn("max-h-[78%] max-w-[82%] object-contain", scale)}
    />
  );

  const inner = (
    <div className="grid aspect-[16/9] place-items-center rounded-2xl border border-border bg-white p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card md:p-4">
      {img}
    </div>
  );

  return websiteUrl ? (
    <a
      href={websiteUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={name}
      className="block"
    >
      {inner}
    </a>
  ) : (
    inner
  );
}

function PlaceholderCard({ n }: { n: number }) {
  return (
    <div className="grid aspect-[16/9] place-items-center rounded-2xl border border-dashed border-[color:var(--color-brand-purple)]/25 bg-white p-3 shadow-soft md:p-4">
      <span className="text-sm font-extrabold uppercase tracking-wider text-[color:var(--color-brand-orange)] md:text-base">
        Patrocinador {n}
      </span>
    </div>
  );
}

function DiamondCard({
  name,
  slug,
  websiteUrl,
}: {
  name: string;
  slug: string;
  websiteUrl: string | null;
}) {
  const src = LOGO_ASSETS[slug];
  const scale = LOGO_SCALE[slug] ?? "scale-100";
  if (!src) return null;
  const img = (
    <img
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn("max-h-[78%] max-w-[82%] object-contain", scale)}
    />
  );
  return (
    <div className="grid aspect-[16/9] place-items-center rounded-2xl border border-border bg-white p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card md:p-4">
      {websiteUrl ? (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={name}
          className="grid h-full w-full place-items-center"
        >
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}

function Page() {
  const fetchSponsors = useServerFn(getPublishedSponsors);
  const { data: sponsors } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => fetchSponsors(),
    staleTime: 5 * 60 * 1000,
  });

  const all = sponsors ?? [];

  // Diamond: mesma lógica da Home (fallback quando DB vazio ou logos não bundled)
  const diamondFromDb = all
    .filter((s) => s.tier === "diamond")
    .map((s) => ({
      id: s.id,
      name: s.name,
      slug: slugFromUrl(s.logo_url),
      website_url: s.website_url,
    }))
    .filter((s) => LOGO_ASSETS[s.slug]);
  const diamond = diamondFromDb.length > 0 ? diamondFromDb : FALLBACK_DIAMOND;
  const diamondPlaceholders = Array.from(
    { length: Math.max(0, DIAMOND_TOTAL - diamond.length) },
    (_, i) => i + diamond.length + 1,
  );

  // Outros tiers vêm do DB
  const otherTiers = (["gold", "silver", "standard"] as const).map((tier) => ({
    tier,
    items: all.filter((s) => s.tier === tier),
  }));

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
          <section className="mt-10 first:mt-10 md:mt-14 md:first:mt-14">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
              {TIER_LABEL.diamond}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-6">
              {diamond.map((s) => (
                <DiamondCard
                  key={s.id}
                  name={s.name}
                  slug={s.slug}
                  websiteUrl={s.website_url}
                />
              ))}
              {diamondPlaceholders.map((n) => (
                <PlaceholderCard key={`ph-${n}`} n={n} />
              ))}
            </div>
          </section>

          {otherTiers
            .filter((t) => t.items.length > 0)
            .map(({ tier, items }) => (
              <section key={tier} className="mt-12">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
                  {TIER_LABEL[tier]}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-6">
                  {items.map((s) => (
                    <SponsorCard
                      key={s.id}
                      name={s.name}
                      logoUrl={s.logo_url}
                      websiteUrl={s.website_url}
                    />
                  ))}
                </div>
              </section>
            ))}


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
