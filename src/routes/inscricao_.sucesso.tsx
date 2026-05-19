import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Loader2, MessageCircle, QrCode } from "lucide-react";
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import { SITE } from "@/lib/site-config";
import { getRegistrationByProtocol } from "@/lib/registrations.functions";
import { getCheckoutUrlForRegistration } from "@/lib/infinitepay.functions";
import { formatBRL } from "@/lib/cpf";

export const Route = createFileRoute("/inscricao_/sucesso")({
  validateSearch: (s: Record<string, unknown>) => ({
    protocol: (s.protocol as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Primeiro passo concluído — falta o pagamento" },
      {
        name: "description",
        content:
          "Sua inscrição foi registrada. Realize o pagamento para garantir sua vaga na II Corrida das Famílias.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { protocol } = Route.useSearch();
  const fetchReg = useServerFn(getRegistrationByProtocol);
  const fetchCheckout = useServerFn(getCheckoutUrlForRegistration);
  const [redirecting, setRedirecting] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["registration", protocol],
    queryFn: () => fetchReg({ data: { protocol } }),
    enabled: !!protocol,
  });

  async function handleCheckout() {
    if (!protocol || redirecting) return;
    setRedirecting(true);
    try {
      const res = await fetchCheckout({ data: { protocol } });
      if (!res.ok) {
        toast.error(res.error);
        setRedirecting(false);
        return;
      }
      if (!res.checkoutUrl) {
        toast.message("Checkout em configuração. Tente novamente em instantes.");
        setRedirecting(false);
        return;
      }
      window.location.href = res.checkoutUrl;
    } catch {
      toast.error("Não foi possível abrir o checkout. Tente novamente.");
      setRedirecting(false);
    }
  }


  if (!protocol) {
    return (
      <ContentSection className="text-center">
        <h1 className="heading-section text-2xl text-[color:var(--color-brand-purple-title)]">
          Protocolo não informado
        </h1>
        <p className="mt-3 text-sm text-[color:var(--color-brand-purple-text)]">
          Use o link enviado por e-mail ou faça uma nova inscrição.
        </p>
        <Link
          to="/inscricao"
          className="mt-6 inline-flex rounded-full bg-gradient-orange px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
        >
          Ir para inscrição
        </Link>
      </ContentSection>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Etapa 1 de 2 concluída"
        title="Primeiro passo concluído!"
        description="Agora, para confirmar e garantir de vez sua vaga, realize o seu pagamento com sucesso."
      />
      <ContentSection>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft md:p-10">
            <div className="flex justify-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              </div>
            </div>

            {isLoading ? (
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[color:var(--color-brand-orange)]" />
              </div>
            ) : data ? (
              <div className="mt-6 rounded-2xl border border-border bg-[color:var(--color-brand-soft)]/40 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--color-brand-orange)]">
                  Protocolo
                </p>
                <p className="mt-1 text-2xl font-black text-[color:var(--color-brand-purple-title)]">
                  {data.protocol}
                </p>
                <p className="mt-2 text-sm text-[color:var(--color-brand-purple-text)]">
                  {data.full_name}
                </p>
                <p className="mt-3 text-lg font-black text-[color:var(--color-brand-purple-title)]">
                  {formatBRL(data.amount_cents)}
                </p>
              </div>
            ) : null}

            <p className="mt-6 text-center text-sm text-[color:var(--color-brand-purple-text)]">
              Sua inscrição foi registrada. A vaga só será confirmada após a aprovação do
              pagamento.
            </p>

            <div className="mt-8">
              <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--color-brand-purple-text)]/60">
                Formas de pagamento
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                <PayMethod icon={<QrCode className="h-5 w-5" />} label="PIX" hint="Aprovação imediata" />
                <PayMethod icon={<CreditCard className="h-5 w-5" />} label="Cartão à vista" hint="Crédito em 1x" />
                <PayMethod icon={<CreditCard className="h-5 w-5" />} label="Cartão parcelado" hint="Até 12x" />
              </ul>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: "/pagamento", search: { protocol } })}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
              >
                <CreditCard className="h-5 w-5" /> Realizar pagamento
              </button>
              <a
                href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
                  `Olá! Preciso de ajuda com o pagamento da minha inscrição. Protocolo: ${protocol}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[color:var(--color-brand-purple-text)] underline-offset-4 hover:underline"
              >
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[color:var(--color-brand-purple-text)]/70">
            Guarde seu protocolo. Ele identifica sua inscrição em todo o atendimento.
          </p>
        </div>
      </ContentSection>
    </>
  );
}

function PayMethod({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <li className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-white p-4 text-center">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-purple-title)]">
        {icon}
      </span>
      <span className="text-sm font-bold text-[color:var(--color-brand-purple-title)]">{label}</span>
      <span className="text-[11px] text-[color:var(--color-brand-purple-text)]/70">{hint}</span>
    </li>
  );
}
