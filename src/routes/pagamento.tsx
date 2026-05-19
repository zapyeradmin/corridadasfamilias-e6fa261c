import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import { checkPaymentStatus } from "@/lib/infinitepay.functions";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 20; // ~40s

export const Route = createFileRoute("/pagamento")({
  validateSearch: (s: Record<string, unknown>) => ({
    protocol: typeof s.protocol === "string" ? s.protocol : "",
    order_nsu: typeof s.order_nsu === "string" ? s.order_nsu : "",
    transaction_nsu: typeof s.transaction_nsu === "string" ? s.transaction_nsu : "",
    slug: typeof s.slug === "string" ? s.slug : "",
    receipt_url: typeof s.receipt_url === "string" ? s.receipt_url : "",
    capture_method: typeof s.capture_method === "string" ? s.capture_method : "",
  }),
  head: () => ({
    meta: [
      { title: "Validando pagamento — II Corrida das Famílias" },
      {
        name: "description",
        content: "Estamos validando o status do seu pagamento junto à InfinitePay.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const checkStatus = useServerFn(checkPaymentStatus);
  const [attempt, setAttempt] = useState(0);
  const cancelled = useRef(false);

  // Tenta inferir o protocolo a partir do order_nsu se não veio direto
  const protocol =
    search.protocol ||
    (search.order_nsu && /^inscricao_(adulto|crianca)_lote1_/.test(search.order_nsu)
      ? ""
      : "");

  useEffect(() => {
    cancelled.current = false;

    if (!protocol) {
      // Sem protocolo conhecido: não conseguimos validar localmente
      navigate({
        to: "/falhanopagamento",
        search: { protocol: "", reason: "Pagamento sem identificação do protocolo." },
      });
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll(currentAttempt: number) {
      if (cancelled.current) return;
      try {
        const res = await checkStatus({ data: { protocol } });

        if (res.found && res.registrationStatus === "paid") {
          navigate({ to: "/sucesso", search: { protocol, email: "" } });
          return;
        }

        if (currentAttempt + 1 >= MAX_ATTEMPTS) {
          navigate({
            to: "/falhanopagamento",
            search: {
              protocol,
              reason:
                "Ainda não recebemos a confirmação do pagamento. Tente novamente ou aguarde alguns minutos.",
            },
          });
          return;
        }

        setAttempt(currentAttempt + 1);
        timer = setTimeout(() => poll(currentAttempt + 1), POLL_INTERVAL_MS);
      } catch {
        navigate({
          to: "/falhanopagamento",
          search: { protocol, reason: "Erro ao validar o pagamento." },
        });
      }
    }

    poll(0);

    return () => {
      cancelled.current = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol]);

  return (
    <>
      <PageHeader
        eyebrow="Validando pagamento"
        title="Confirmando seu pagamento..."
        description="Aguarde alguns instantes enquanto verificamos a confirmação junto à InfinitePay."
      />
      <ContentSection>
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-white p-8 text-center shadow-soft md:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color:var(--color-brand-soft)]">
            <Loader2 className="h-7 w-7 animate-spin text-[color:var(--color-brand-orange)]" />
          </div>
          <h2 className="heading-section mt-5 text-2xl text-[color:var(--color-brand-purple-title)]">
            Validando seu pagamento
          </h2>
          <p className="mt-3 text-sm text-[color:var(--color-brand-purple-text)]">
            Estamos verificando se o pagamento foi confirmado. Não feche esta página.
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
          <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-[color:var(--color-brand-purple-text)]/60">
            Tentativa {attempt + 1} de {MAX_ATTEMPTS}
          </p>
        </div>
      </ContentSection>
    </>
  );
}
