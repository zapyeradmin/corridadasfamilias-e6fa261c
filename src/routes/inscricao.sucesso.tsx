import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { ContentSection } from "@/components/site/page-shell";

export const Route = createFileRoute("/inscricao/sucesso")({
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) || "" }),
  head: () => ({
    meta: [{ title: "Inscrição confirmada — II Corrida das Famílias" }],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useSearch();
  return (
    <ContentSection className="text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[color:var(--color-brand-amber)]/15 text-[color:var(--color-brand-amber)]">
        <CheckCircle2 className="h-10 w-10" />
      </span>
      <h1 className="heading-section mt-6 text-3xl text-[color:var(--color-brand-purple-title)] md:text-5xl">
        Tudo certo!
      </h1>
      <p className="mt-4 text-base text-[color:var(--color-brand-purple-text)]">
        Recebemos sua solicitação. Assim que o pagamento for confirmado, sua inscrição estará
        garantida.
      </p>
      {id && (
        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[color:var(--color-brand-purple-text)]/60">
          Protocolo: {id}
        </p>
      )}
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-orange px-7 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
      >
        Voltar ao início
      </Link>
    </ContentSection>
  );
}
