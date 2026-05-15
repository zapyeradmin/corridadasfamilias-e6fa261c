import { createFileRoute } from "@tanstack/react-router";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galeria — II Corrida das Famílias" },
      {
        name: "description",
        content: "Fotos e momentos das edições da Corrida das Famílias em Serra Talhada/PE.",
      },
      { property: "og:title", content: "Galeria — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Memórias"
        title="Galeria"
        description="Em breve, fotos oficiais da II edição. Confira por enquanto a energia das edições anteriores."
      />
      <ContentSection>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-gradient-hero opacity-90 shadow-soft"
            />
          ))}
        </div>
      </ContentSection>
    </>
  );
}
