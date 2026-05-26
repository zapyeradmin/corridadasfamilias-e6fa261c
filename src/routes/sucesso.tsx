import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Mail,
  Package,
  CalendarDays,
  MessageCircle,
  Home,
  FileText,
  HandHeart,
} from "lucide-react";
import { PageHeader } from "@/components/site/page-shell";
import { SITE } from "@/lib/site-config";
import { useSiteContacts } from "@/hooks/use-site-contacts";

export const Route = createFileRoute("/sucesso")({
  validateSearch: (s: Record<string, unknown>) => ({
    protocol: typeof s.protocol === "string" ? s.protocol : "",
    email: typeof s.email === "string" ? s.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Pagamento confirmado — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Sua inscrição na II Corrida das Famílias foi confirmada. Veja os próximos passos: comprovante por e-mail, retirada do kit e dia da corrida.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Pagamento confirmado — II Corrida das Famílias" },
      {
        property: "og:description",
        content:
          "Sua vaga está garantida! Confira as instruções para a retirada do kit e o dia da corrida.",
      },
    ],
  }),
  component: Page,
});

const PROXIMOS_PASSOS = [
  {
    icon: Mail,
    titulo: "Comprovante por e-mail",
    texto:
      "Enviamos o comprovante e o resumo da sua inscrição para o e-mail cadastrado. Verifique também a caixa de spam.",
  },
  {
    icon: Package,
    titulo: "Retirada do kit",
    texto:
      "Dias 04, 05 e 06 de agosto de 2026, das 19h30 às 21h30, no Salão Paroquial da Igreja de Nossa Senhora da Conceição.",
  },
  {
    icon: CalendarDays,
    titulo: "Dia da corrida",
    texto:
      "09 de agosto de 2026, com largada na Igreja Matriz de Nossa Senhora do Rosário, em Serra Talhada/PE.",
  },
];

function Page() {
  const { protocol, email } = Route.useSearch();

  const whatsappMsg = encodeURIComponent(
    protocol
      ? `Olá! Acabei de confirmar o pagamento da minha inscrição na II Corrida das Famílias. Protocolo: ${protocol}`
      : "Olá! Acabei de confirmar o pagamento da minha inscrição na II Corrida das Famílias.",
  );

  return (
    <>
      <PageHeader
        eyebrow="Pagamento confirmado"
        title="Sua inscrição está garantida!"
        description="Recebemos a confirmação do seu pagamento. Seja bem-vindo(a) à II Corrida das Famílias — agora é correr com fé, família e propósito."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-5 pt-10 pb-20 md:px-8 md:pt-14 md:pb-28">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-24 w-24 place-items-center rounded-full bg-[color:var(--color-brand-orange)]/15 text-[color:var(--color-brand-orange)] shadow-orange animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="h-12 w-12" strokeWidth={2.5} />
            </span>

            <h2 className="heading-section mt-6 text-3xl text-[color:var(--color-brand-purple-title)] md:text-4xl">
              Tudo certo com sua inscrição!
            </h2>
            <p className="mt-4 max-w-2xl text-base text-[color:var(--color-brand-purple-text)]">
              Sua vaga na <strong>II Corrida das Famílias</strong> está confirmada. A partir
              de agora você faz parte desta grande celebração da fé, da família e do esporte.
            </p>

            {(protocol || email) && (
              <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {protocol && (
                  <div className="rounded-2xl border border-border bg-[color:var(--color-brand-soft)] px-5 py-4 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--color-brand-purple-text)]/70">
                      Protocolo da inscrição
                    </p>
                    <p className="mt-1 break-all font-mono text-base font-extrabold text-[color:var(--color-brand-purple-title)]">
                      {protocol}
                    </p>
                  </div>
                )}
                {email && (
                  <div className="rounded-2xl border border-border bg-[color:var(--color-brand-soft)] px-5 py-4 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--color-brand-purple-text)]/70">
                      Comprovante enviado para
                    </p>
                    <p className="mt-1 break-all text-base font-extrabold text-[color:var(--color-brand-purple-title)]">
                      {email}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-16">
            <h3 className="text-center text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
              Próximos passos
            </h3>
            <p className="mt-2 text-center text-2xl font-extrabold text-[color:var(--color-brand-purple-title)] md:text-3xl">
              O que acontece agora
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {PROXIMOS_PASSOS.map(({ icon: Icon, titulo, texto }) => (
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

          <div className="mt-10 flex items-start gap-4 rounded-2xl bg-[color:var(--color-brand-soft)] p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color:var(--color-brand-orange)]/15 text-[color:var(--color-brand-orange)]">
              <HandHeart className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-[0.18em] text-[color:var(--color-brand-purple-title)]">
                Contribuição solidária
              </h4>
              <p className="mt-1 text-sm text-[color:var(--color-brand-purple-text)]">
                Não esqueça: na retirada do kit, cada atleta entrega <strong>1kg de alimento
                não perecível</strong>, destinado a famílias em situação de vulnerabilidade.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange transition hover:brightness-110"
            >
              <MessageCircle className="h-4 w-4" /> Falar com a organização
            </a>
            <Link
              to="/regulamento"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[color:var(--color-brand-purple-text)] transition hover:bg-[color:var(--color-brand-soft)]"
            >
              <FileText className="h-4 w-4" /> Ver regulamento
            </Link>
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
            Obrigado por correr com a gente!
          </h3>
          <p className="max-w-xl text-base text-white/80">
            {SITE.slogan}. Nos vemos em {SITE.eventDateLabel}, em {SITE.city}.
          </p>
        </div>
      </section>
    </>
  );
}
