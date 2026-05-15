import { createFileRoute } from "@tanstack/react-router";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Entrar — II Corrida das Famílias" }],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Acesso restrito" title="Entrar" />
      <ContentSection>
        <div className="mx-auto max-w-md rounded-3xl border border-border bg-white p-8 shadow-soft">
          <p className="text-sm text-[color:var(--color-brand-purple-text)]">
            Login da equipe organizadora. Em breve.
          </p>
        </div>
      </ContentSection>
    </>
  );
}
