import { createFileRoute } from "@tanstack/react-router";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/patrocinadores")({
  head: () => ({
    meta: [
      { title: "Patrocinadores — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Conheça as marcas e instituições que apoiam a II Corrida das Famílias em Serra Talhada/PE.",
      },
      { property: "og:title", content: "Patrocinadores — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

function Page() {
  // Placeholder — será substituído por dados do banco assim que o admin cadastrar.
  return (
    <>
      <PageHeader
        eyebrow="Quem apoia"
        title="Nossos patrocinadores"
        description="Marcas que acreditam no esporte, na fé e nas famílias da nossa comunidade."
      />
      <ContentSection>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="grid aspect-[3/2] place-items-center rounded-2xl border border-dashed border-[color:var(--color-brand-purple)]/20 bg-white text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-brand-purple-text)]/50"
            >
              Logo {i + 1}
            </div>
          ))}
        </div>
        <p className="mt-12 rounded-2xl bg-[color:var(--color-brand-soft)] p-6 text-sm text-[color:var(--color-brand-purple-text)]">
          Quer apoiar o evento? Entre em contato pelo WhatsApp e receba nossa proposta de
          patrocínio.
        </p>
      </ContentSection>
    </>
  );
}
