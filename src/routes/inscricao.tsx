import { createFileRoute } from "@tanstack/react-router";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/inscricao")({
  head: () => ({
    meta: [
      { title: "Inscrição — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Faça sua inscrição online para a II Corrida das Famílias. Pagamento por PIX ou cartão.",
      },
      { property: "og:title", content: "Inscrição — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Garanta sua vaga"
        title="Inscrição"
        description="O formulário de inscrição estará disponível em breve. Volte logo!"
      />
      <ContentSection>
        <div className="rounded-3xl border border-dashed border-[color:var(--color-brand-purple)]/30 bg-white p-12 text-center shadow-soft">
          <p className="text-base text-[color:var(--color-brand-purple-text)]">
            Estamos finalizando a integração com o pagamento. O formulário será liberado nos
            próximos dias.
          </p>
        </div>
      </ContentSection>
    </>
  );
}
