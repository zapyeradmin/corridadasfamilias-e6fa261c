import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Loader2, MessageCircle, Clock } from "lucide-react";
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import { SITE } from "@/lib/site-config";
import { getRegistrationByProtocol } from "@/lib/registrations.functions";
import { formatBRL } from "@/lib/cpf";

export const Route = createFileRoute("/inscricao/sucesso")({
  validateSearch: (s: Record<string, unknown>) => ({
    protocol: (s.protocol as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Inscrição registrada — falta o pagamento" },
      {
        name: "description",
        content:
          "Seus dados foram registrados. Conclua o pagamento para garantir sua vaga na II Corrida das Famílias.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { protocol } = Route.useSearch();
  const fetchReg = useServerFn(getRegistrationByProtocol);
  const { data, isLoading } = useQuery({
    queryKey: ["registration", protocol],
    queryFn: () => fetchReg({ data: { protocol } }),
    enabled: !!protocol,
  });

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

  if (isLoading) {
    return (
      <ContentSection className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[color:var(--color-brand-orange)]" />
        <p className="mt-3 text-sm text-[color:var(--color-brand-purple-text)]">
          Carregando sua inscrição...
        </p>
      </ContentSection>
    );
  }

  if (!data) {
    return (
      <ContentSection className="text-center">
        <h1 className="heading-section text-2xl text-[color:var(--color-brand-purple-title)]">
          Inscrição não encontrada
        </h1>
        <p className="mt-3 text-sm text-[color:var(--color-brand-purple-text)]">
          Não encontramos uma inscrição para o protocolo <strong>{protocol}</strong>.
        </p>
        <Link
          to="/inscricao"
          className="mt-6 inline-flex rounded-full bg-gradient-orange px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
        >
          Fazer inscrição
        </Link>
      </ContentSection>
    );
  }

  const isPaid = data.status === "paid";
  const checkoutUrl = data.payment?.checkout_url;

  return (
    <>
      <PageHeader
        eyebrow={isPaid ? "Inscrição confirmada" : "Etapa 1 de 2 concluída"}
        title={isPaid ? "Tudo certo! Sua vaga está garantida" : "Inscrição registrada — falta o pagamento"}
        description={
          isPaid
            ? "Seu pagamento foi aprovado. Nos vemos na largada!"
            : "Seus dados foram registrados com sucesso. Para garantir sua vaga, conclua o pagamento abaixo."
        }
      />
      <ContentSection>
        <div className="mx-auto max-w-3xl">
          {/* Stepper 2 etapas */}
          <ol className="mb-8 grid grid-cols-2 gap-3">
            <Step number={1} label="Dados enviados" done />
            <Step number={2} label="Pagamento" done={isPaid} current={!isPaid} />
          </ol>

          {/* Card de resumo */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--color-brand-orange)]">
                  Protocolo
                </p>
                <p className="mt-1 text-2xl font-black text-[color:var(--color-brand-purple-title)]">
                  {data.protocol}
                </p>
                <p className="mt-2 text-sm text-[color:var(--color-brand-purple-text)]">
                  {data.full_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--color-brand-purple-text)]/60">
                  Valor
                </p>
                <p className="mt-1 text-2xl font-black text-[color:var(--color-brand-purple-title)]">
                  {formatBRL(data.amount_cents)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-[color:var(--color-brand-soft)]/40 p-5">
              {isPaid ? (
                <div className="flex items-start gap-3 text-sm text-[color:var(--color-brand-purple-text)]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p>
                    <strong>Pagamento confirmado.</strong> Você receberá os detalhes do kit por
                    e-mail e WhatsApp.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-sm text-[color:var(--color-brand-purple-text)]">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-brand-orange)]" />
                  <p>
                    Sua vaga ficará reservada como <strong>pendente</strong> até a aprovação do
                    pagamento. Após pagar, a confirmação é automática.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!isPaid && checkoutUrl ? (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-7 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
                >
                  <CreditCard className="h-5 w-5" /> Pagar agora
                </a>
              ) : null}
              <a
                href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
                  `Olá! ${isPaid ? "Tenho uma dúvida sobre minha inscrição" : "Preciso de ajuda com o pagamento da minha inscrição"}. Protocolo: ${data.protocol}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
              >
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[color:var(--color-brand-purple-text)]"
              >
                Voltar ao início
              </Link>
            </div>
          </div>

          {!isPaid && (
            <p className="mt-6 text-center text-xs text-[color:var(--color-brand-purple-text)]/70">
              Guarde seu protocolo <strong>{data.protocol}</strong>. Ele identifica sua inscrição.
            </p>
          )}
        </div>
      </ContentSection>
    </>
  );
}

function Step({
  number,
  label,
  done,
  current,
}: {
  number: number;
  label: string;
  done?: boolean;
  current?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border p-4 ${
        done
          ? "border-emerald-200 bg-emerald-50"
          : current
            ? "border-[color:var(--color-brand-orange)]/40 bg-[color:var(--color-brand-soft)]"
            : "border-border bg-white"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${
          done
            ? "bg-emerald-600 text-white"
            : current
              ? "bg-gradient-orange text-white"
              : "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-purple-text)]/60"
        }`}
      >
        {done ? <CheckCircle2 className="h-5 w-5" /> : number}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-brand-purple-text)]/60">
          Etapa {number}
        </p>
        <p className="text-sm font-bold text-[color:var(--color-brand-purple-title)]">{label}</p>
      </div>
    </li>
  );
}
