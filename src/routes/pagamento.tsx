import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MessageCircle } from "lucide-react";
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/pagamento")({
  validateSearch: (s: Record<string, unknown>) => ({
    protocol: (s.protocol as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Pagamento — II Corrida das Famílias" },
      { name: "description", content: "Finalize o pagamento da sua inscrição." },
    ],
  }),
  component: Page,
});

function Page() {
  const { protocol } = Route.useSearch();
  return (
    <>
      <PageHeader
        eyebrow="Etapa 2 de 2"
        title="Pagamento"
        description="Finalize o pagamento para confirmar sua vaga."
      />
      <ContentSection>
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-white p-8 text-center shadow-soft md:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color:var(--color-brand-soft)]">
            <Clock className="h-7 w-7 text-[color:var(--color-brand-orange)]" />
          </div>
          <h2 className="heading-section mt-5 text-2xl text-[color:var(--color-brand-purple-title)]">
            Checkout em integração
          </h2>
          <p className="mt-3 text-sm text-[color:var(--color-brand-purple-text)]">
            A integração com a Infinity Pay está em andamento. Em breve você poderá concluir o
            pagamento por aqui.
          </p>
          {protocol && (
            <div className="mt-6 rounded-2xl border border-border bg-[color:var(--color-brand-soft)]/40 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--color-brand-orange)]">
                Protocolo
              </p>
              <p className="mt-1 text-xl font-black text-[color:var(--color-brand-purple-title)]">
                {protocol}
              </p>
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
                `Olá! Quero realizar o pagamento da minha inscrição. Protocolo: ${protocol}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
            >
              <MessageCircle className="h-4 w-4" /> Pagar pelo WhatsApp
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[color:var(--color-brand-purple-text)]"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </ContentSection>
    </>
  );
}
