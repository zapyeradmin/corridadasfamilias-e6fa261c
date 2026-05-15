import { createFileRoute } from "@tanstack/react-router";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/_authenticated/_admin/dashboard")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Administração" title="Dashboard" />
      <ContentSection>
        <p className="text-base text-[color:var(--color-brand-purple-text)]">
          Painel administrativo em construção.
        </p>
      </ContentSection>
    </>
  );
}
