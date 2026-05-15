import { createFileRoute } from "@tanstack/react-router";
import { Shirt, Ticket, Gift, HandHeart } from "lucide-react";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/kit")({
  head: () => ({
    meta: [
      { title: "Kit do atleta — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Conheça o kit oficial da II Corrida das Famílias: camisa, número de peito, brindes e a tradicional contribuição solidária.",
      },
      { property: "og:title", content: "Kit do atleta — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

const ITENS = [
  { icon: Shirt, title: "Camisa oficial", desc: "Camisa do evento em tecido leve, com a identidade da II Corrida das Famílias." },
  { icon: Ticket, title: "Número de peito", desc: "Número personalizado para a largada, com seu nome e categoria." },
  { icon: Gift, title: "Brindes dos patrocinadores", desc: "Mimos e produtos das marcas que apoiam o evento." },
  { icon: HandHeart, title: "Contribuição solidária", desc: "1kg de alimento não perecível entregue na retirada do kit." },
];

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Tudo que você recebe"
        title="Kit do atleta"
        description="Cada inscrito recebe um kit completo, pensado para a sua experiência ser inesquecível."
      />
      <ContentSection>
        <div className="grid gap-5 sm:grid-cols-2">
          {ITENS.map((i) => (
            <div key={i.title} className="rounded-3xl border border-border bg-white p-6 shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-orange text-white shadow-orange">
                <i.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold uppercase tracking-tight text-[color:var(--color-brand-purple-title)]">
                {i.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-brand-purple-text)]/85">
                {i.desc}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-10 rounded-2xl bg-[color:var(--color-brand-soft)] p-6 text-sm text-[color:var(--color-brand-purple-text)]">
          A data, horário e local de retirada do kit serão divulgados oficialmente. Acompanhe as
          redes sociais e o WhatsApp da organização.
        </p>
      </ContentSection>
    </>
  );
}
