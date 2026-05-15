import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { ContentSection } from "@/components/site/page-shell";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/inscricao/sucesso")({
  validateSearch: (s: Record<string, unknown>) => ({
    protocol: (s.protocol as string) || "",
  }),
  head: () => ({
    meta: [{ title: "Inscrição confirmada — II Corrida das Famílias" }],
  }),
  component: Page,
});

function Page() {
  const { protocol } = Route.useSearch();
  return (
    <ContentSection className="text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[color:var(--color-brand-amber)]/15 text-[color:var(--color-brand-amber)]">
        <CheckCircle2 className="h-10 w-10" />
      </span>
      <h1 className="heading-section mt-6 text-3xl text-[color:var(--color-brand-purple-title)] md:text-5xl">
        Inscrição registrada!
      </h1>
      <p className="mt-4 max-w-xl mx-auto text-base text-[color:var(--color-brand-purple-text)]">
        Recebemos seus dados. Em instantes você receberá as instruções de pagamento por e-mail e
        WhatsApp. Sua vaga é confirmada após a aprovação do pagamento.
      </p>
      {protocol && (
        <p className="mt-4 inline-block rounded-full bg-[color:var(--color-brand-soft)] px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-brand-purple-text)]">
          Protocolo: {protocol}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
            `Olá! Acabei de me inscrever na II Corrida das Famílias. Protocolo: ${protocol}`,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
        >
          <MessageCircle className="h-4 w-4" /> Falar com a organização
        </a>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[color:var(--color-brand-purple-text)]"
        >
          Voltar ao início
        </Link>
      </div>
    </ContentSection>
  );
}
