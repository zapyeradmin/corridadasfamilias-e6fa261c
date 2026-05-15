import { createFileRoute } from "@tanstack/react-router";
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Perguntas frequentes sobre inscrição, pagamento, kit, percurso e regras da II Corrida das Famílias.",
      },
      { property: "og:title", content: "FAQ — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

const FAQ = [
  { q: "Como faço minha inscrição?", a: "A inscrição é totalmente online, pelo botão ‘Inscreva-se’ no topo do site. Após preencher o formulário você é direcionado para o pagamento." },
  { q: "Quais formas de pagamento são aceitas?", a: "PIX e cartão de crédito, processados de forma segura pela Infinity Pay." },
  { q: "Posso me inscrever no dia do evento?", a: "Não. As inscrições acontecem exclusivamente pelo site, enquanto houver vagas." },
  { q: "Posso transferir minha inscrição?", a: "A inscrição é pessoal e intransferível, conforme regulamento." },
  { q: "Como funciona a contribuição solidária?", a: "Cada atleta entrega 1kg de alimento não perecível na retirada do kit. Os alimentos são doados às famílias acompanhadas pelas pastorais." },
  { q: "E se eu não puder participar?", a: "Em caso de impossibilidade, fale com a organização pelo WhatsApp para verificar as opções disponíveis." },
];

function Page() {
  return (
    <>
      <PageHeader eyebrow="Tire suas dúvidas" title="Perguntas frequentes" />
      <ContentSection>
        <Accordion type="single" collapsible className="grid gap-3">
          {FAQ.map((f, i) => (
            <AccordionItem
              key={i}
              value={`f-${i}`}
              className="overflow-hidden rounded-2xl border border-border bg-white px-5 shadow-soft"
            >
              <AccordionTrigger className="text-left text-base font-extrabold uppercase tracking-tight text-[color:var(--color-brand-purple-title)] hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-[color:var(--color-brand-purple-text)]">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ContentSection>
    </>
  );
}
