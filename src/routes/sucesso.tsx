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
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import { SITE } from "@/lib/site-config";
import { useSiteContacts } from "@/hooks/use-site-contacts";

export const Route = createFileRoute("/sucesso")({
  validateSearch: (s: Record<string, unknown>) => ({
    protocol: typeof s.protocol === "string" ? s.protocol : "",
    email: typeof s.email === "string" ? s.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Inscrição confirmada — 2ª Corrida Natalina | Corre +" },
      {
        name: "description",
        content:
          "Sua inscrição na 2ª Corrida Natalina | Corre + foi confirmada. Veja os próximos passos: comprovante por e-mail, retirada do kit e dia da corrida.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Pagamento confirmado — 2ª Corrida Natalina | Corre +" },
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
      "A programação detalhada de dias e horários para entrega dos kits oficiais será divulgada em nossos canais oficiais.",
  },
  {
    icon: CalendarDays,
    titulo: "Dia da corrida",
    texto:
      "20 de dezembro de 2026, com concentração às 05:00 e largada às 06:00 no Beach Garden, em Serra Talhada/PE.",
  },
];

function Page() {
  const { protocol, email } = Route.useSearch();
  const { whatsappHref } = useSiteContacts();

  const waText = protocol
    ? `Olá! Confirmei minha inscrição na 2ª Corrida Natalina | Corre + (protocolo ${protocol}) e gostaria de tirar uma dúvida.`
    : "Olá! Confirmei minha inscrição na 2ª Corrida Natalina | Corre + e gostaria de tirar uma dúvida.";

  return (
    <>
      <PageHeader
        eyebrow="Inscrição confirmada"
        title="Parabéns, você está inscrito!"
        description="Recebemos a confirmação do seu pagamento e sua vaga na 2ª Corrida Natalina | Corre + está garantida."
      />

      <ContentSection>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-24 w-24 place-items-center rounded-full border-4 border-[#c20505] bg-[#c20505] text-white shadow-[0_12px_32px_rgba(194,5,5,0.35)] animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
            </span>

            <h2 className="heading-section mt-6 text-3xl text-[#c20505] md:text-4xl">
              Tudo certo com sua inscrição!
            </h2>
            <p className="mt-4 max-w-2xl text-base text-[#3d0000]">
              Sua vaga na <strong>2ª Corrida Natalina | Corre +</strong> está confirmada. A partir de
              agora você faz parte desta grande celebração do esporte, da saúde e da superação.
            </p>

            {(protocol || email) && (
              <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {protocol && (
                  <div className="rounded-2xl border border-border bg-[color:var(--color-brand-soft)] px-5 py-4 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c20505]">
                      Protocolo da inscrição
                    </p>
                    <p className="mt-1 break-all font-mono text-base font-extrabold text-[#3d0000]">
                      {protocol}
                    </p>
                  </div>
                )}
                {email && (
                  <div className="rounded-2xl border border-border bg-[color:var(--color-brand-soft)] px-5 py-4 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c20505]">
                      Comprovante enviado para
                    </p>
                    <p className="mt-1 break-all text-base font-extrabold text-[#3d0000]">
                      {email}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-16">
            <h3 className="text-center text-xs font-bold uppercase tracking-[0.35em] text-[#c20505]">
              Próximos passos
            </h3>
            <p className="mt-2 text-center text-2xl font-extrabold text-[#c20505] md:text-3xl">
              O que acontece agora
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {PROXIMOS_PASSOS.map(({ icon: Icon, titulo, texto }) => (
                <article
                  key={titulo}
                  className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft transition hover:shadow-card"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#c20505] bg-[#c20505] text-white shadow-sm">
                    <Icon className="h-6 w-6 text-white" />
                  </span>
                  <h4 className="text-base font-extrabold uppercase tracking-[0.14em] text-[#c20505]">
                    {titulo}
                  </h4>
                  <p className="text-sm leading-relaxed text-[#3d0000]">{texto}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-start gap-4 rounded-2xl bg-[color:var(--color-brand-soft)] p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#c20505] bg-[#c20505] text-white shadow-sm">
              <HandHeart className="h-5 w-5 text-white" />
            </span>
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#c20505]">
                Contribuição solidária
              </h4>
              <p className="mt-1 text-sm text-[#3d0000]">
                Não esqueça: na retirada do kit, cada atleta entrega{" "}
                <strong>1kg de alimento não perecível</strong>, destinado a famílias e instituições
                em situação de vulnerabilidade.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappHref(waText)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange transition hover:brightness-110"
            >
              <MessageCircle className="h-4 w-4" /> Falar com a organização
            </a>
            <Link
              to="/regulamento"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[#3d0000] transition hover:bg-[color:var(--color-brand-soft)]"
            >
              <FileText className="h-4 w-4" /> Ver regulamento
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[#3d0000] transition hover:bg-[color:var(--color-brand-soft)]"
            >
              <Home className="h-4 w-4" /> Voltar ao início
            </Link>
          </div>
        </div>
      </ContentSection>

      <section className="bg-[#c20505]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 py-16 text-center md:px-8 md:py-20">
          <h3 className="heading-section text-2xl text-white md:text-4xl">
            Obrigado por correr com a gente!
          </h3>
          <p className="max-w-xl text-base text-white/90">
            {SITE.slogan}. Nos vemos em {SITE.eventDateLabel}, em {SITE.city}.
          </p>
        </div>
      </section>
    </>
  );
}
