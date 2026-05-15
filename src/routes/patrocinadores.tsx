import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import { getPublishedSponsors } from "@/lib/public.functions";
import { SITE } from "@/lib/site-config";

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
    ],
  }),
  component: Page,
});

const TIER_ORDER = ["diamond", "gold", "silver", "standard"] as const;
const TIER_LABEL: Record<string, string> = {
  diamond: "Patrocínio Diamante",
  gold: "Patrocínio Ouro",
  silver: "Patrocínio Prata",
  standard: "Apoiadores",
};

function Page() {
  const fetchSponsors = useServerFn(getPublishedSponsors);
  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => fetchSponsors(),
  });

  const grouped = (sponsors ?? []).reduce<Record<string, typeof sponsors>>((acc, s) => {
    (acc[s.tier] ??= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="Quem apoia"
        title="Nossos patrocinadores"
        description="Marcas que acreditam no esporte, na fé e nas famílias da nossa comunidade."
      />
      <ContentSection>
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/2] animate-pulse rounded-2xl bg-[color:var(--color-brand-soft)]" />
            ))}
          </div>
        )}

        {!isLoading && (!sponsors || sponsors.length === 0) && (
          <div className="rounded-3xl border border-dashed border-[color:var(--color-brand-purple)]/25 bg-white p-10 text-center shadow-soft">
            <p className="text-base font-bold text-[color:var(--color-brand-purple-text)]">
              Em breve divulgaremos os patrocinadores oficiais.
            </p>
          </div>
        )}

        {!isLoading &&
          TIER_ORDER.filter((t) => grouped[t]?.length).map((tier) => (
            <section key={tier} className="mt-12 first:mt-0">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--color-brand-orange)]">
                {TIER_LABEL[tier]}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {grouped[tier]!.map((s) => {
                  const inner = (
                    <div className="grid aspect-[3/2] place-items-center rounded-2xl border border-border bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
                      <img
                        src={s.logo_url}
                        alt={s.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  );
                  return s.website_url ? (
                    <a key={s.id} href={s.website_url} target="_blank" rel="noreferrer">
                      {inner}
                    </a>
                  ) : (
                    <div key={s.id}>{inner}</div>
                  );
                })}
              </div>
            </section>
          ))}

        <div className="mt-12 rounded-2xl bg-[color:var(--color-brand-soft)] p-6 text-sm text-[color:var(--color-brand-purple-text)]">
          Quer apoiar o evento?{" "}
          <a
            className="font-bold underline"
            href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
              "Olá! Tenho interesse em patrocinar a II Corrida das Famílias.",
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Fale conosco no WhatsApp
          </a>{" "}
          e receba nossa proposta.
        </div>
      </ContentSection>
    </>
  );
}
