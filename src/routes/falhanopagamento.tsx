import { createFileRoute, Link } from "@tanstack/react-router";
import {
  XCircle,
  CreditCard,
  WifiOff,
  ShieldAlert,
  RefreshCw,
  MessageCircle,
  Home,
  Mail,
} from "lucide-react";
import { PageHeader } from "@/components/site/page-shell";
import { SITE } from "@/lib/site-config";
import { useSiteContacts } from "@/hooks/use-site-contacts";

export const Route = createFileRoute("/falhanopagamento")({
  validateSearch: (s: Record<string, unknown>) => ({
    protocol: typeof s.protocol === "string" ? s.protocol : "",
    reason: typeof s.reason === "string" ? s.reason : "",
  }),
  head: () => ({
    meta: [
      { title: "Falha no pagamento — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Não foi possível concluir o pagamento da sua inscrição. Tente novamente ou fale com a organização da II Corrida das Famílias.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Falha no pagamento — II Corrida das Famílias" },
      {
        property: "og:description",
        content:
          "Sua inscrição não foi concluída. Veja como tentar novamente e finalizar sua participação.",
      },
    ],
  }),
  component: Page,
});

const MOTIVOS = [
  {
    icon: CreditCard,
    titulo: "Dados do cartão",
    texto:
      "Número, validade, CVV ou nome do titular preenchidos de forma incorreta. Revise as informações e tente de novo.",
  },
  {
    icon: ShieldAlert,
    titulo: "Limite ou autorização",
    texto:
      "A compra pode ter sido recusada pelo banco emissor por limite insuficiente ou bloqueio de segurança.",
  },
  {
    icon: WifiOff,
    titulo: "Conexão interrompida",
    texto:
      "Pode ter ocorrido uma instabilidade durante o pagamento. Verifique sua conexão e finalize novamente.",
  },
];

const PASSOS = [
  "Confira os dados informados na hora do pagamento.",
  "Tente outra forma de pagamento disponível (PIX ou cartão).",
  "Se o problema continuar, fale com a organização pelo WhatsApp.",
];

function Page() {
  const { protocol, reason } = Route.useSearch();
  const { whatsappHref, whatsappLabel } = useSiteContacts();

  const waText = protocol
    ? `Olá! Tive um problema ao concluir o pagamento da minha inscrição na II Corrida das Famílias. Protocolo: ${protocol}`
    : "Olá! Tive um problema ao concluir o pagamento da minha inscrição na II Corrida das Famílias.";
  const waUrl = whatsappHref(waText);

  return (
    <>
      <PageHeader
        eyebrow="Pagamento não concluído"
        title="Não foi possível confirmar seu pagamento"
        description="Não se preocupe: nenhuma cobrança foi efetivada e sua vaga ainda pode ser garantida. Você pode tentar novamente em poucos passos."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-5 pt-10 pb-20 md:px-8 md:pt-14 md:pb-28">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-24 w-24 place-items-center rounded-full bg-destructive/15 text-destructive shadow-[0_10px_30px_rgba(220,38,38,0.18)] animate-in fade-in zoom-in duration-500">
              <XCircle className="h-12 w-12" strokeWidth={2.5} />
            </span>

            <h2 className="heading-section mt-6 text-3xl text-[color:var(--color-brand-purple-title)] md:text-4xl">
              Algo deu errado com a sua transação
            </h2>
            <p className="mt-4 max-w-2xl text-base text-[color:var(--color-brand-purple-text)]">
              Seu pagamento não foi processado e a inscrição <strong>ainda não está confirmada</strong>.
              Você pode tentar novamente agora mesmo — leva menos de 2 minutos.
            </p>

            {(protocol || reason) && (
              <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {protocol && (
                  <div className="rounded-2xl border border-border bg-[color:var(--color-brand-soft)] px-5 py-4 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--color-brand-purple-text)]/70">
                      Protocolo da tentativa
                    </p>
                    <p className="mt-1 break-all font-mono text-base font-extrabold text-[color:var(--color-brand-purple-title)]">
                      {protocol}
                    </p>
                  </div>
                )}
                {reason && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-destructive">
                      Motivo informado
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-[color:var(--color-brand-purple-title)]">
                      {reason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-16">
            <h3 className="text-center text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
              Possíveis motivos
            </h3>
            <p className="mt-2 text-center text-2xl font-extrabold text-[color:var(--color-brand-purple-title)] md:text-3xl">
              Por que o pagamento pode ter falhado
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {MOTIVOS.map(({ icon: Icon, titulo, texto }) => (
                <article
                  key={titulo}
                  className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-white p-6 shadow-[0_10px_30px_rgba(22,9,31,0.06)] transition hover:shadow-[0_16px_40px_rgba(22,9,31,0.12)]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--color-brand-orange)]/10 text-[color:var(--color-brand-orange)]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h4 className="text-base font-extrabold uppercase tracking-[0.14em] text-[color:var(--color-brand-purple-title)]">
                    {titulo}
                  </h4>
                  <p className="text-sm leading-relaxed text-[color:var(--color-brand-purple-text)]/85">
                    {texto}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-[color:var(--color-brand-soft)] p-6 md:p-8">
            <h4 className="text-sm font-extrabold uppercase tracking-[0.18em] text-[color:var(--color-brand-purple-title)]">
              O que fazer agora
            </h4>
            <ol className="mt-4 grid gap-3">
              {PASSOS.map((passo, i) => (
                <li
                  key={passo}
                  className="flex items-start gap-3 text-sm text-[color:var(--color-brand-purple-text)]"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[color:var(--color-brand-orange)] text-[11px] font-extrabold text-white">
                    {i + 1}
                  </span>
                  <span>{passo}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link
              to="/inscricao"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-orange)] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange transition hover:brightness-110"
            >
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Link>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:brightness-110"
            >
              <MessageCircle className="h-4 w-4" /> Falar com a organização
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[color:var(--color-brand-purple-text)] transition hover:bg-[color:var(--color-brand-soft)]"
            >
              <Home className="h-4 w-4" /> Voltar ao início
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-brand-purple)]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 py-16 text-center md:px-8 md:py-20">
          <h3 className="heading-section text-2xl text-white md:text-4xl">
            Estamos aqui para ajudar você a completar sua inscrição
          </h3>
          <p className="max-w-xl text-base text-white/80">
            Se precisar de suporte, fale com a organização da II Corrida das Famílias pelos
            canais oficiais abaixo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/15"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp {SITE.whatsappLabel}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/15"
            >
              <Mail className="h-4 w-4" /> {SITE.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
