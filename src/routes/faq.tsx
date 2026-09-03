import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/components/home/data";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — 2ª Corrida Natalina | CORRE+" },
      {
        name: "description",
        content:
          "Perguntas frequentes sobre inscrição, pagamento, kit, percurso, transferência e confirmação da 2ª Corrida Natalina | CORRE+.",
      },
      { property: "og:title", content: "FAQ — 2ª Corrida Natalina | CORRE+" },
      {
        property: "og:description",
        content:
          "Tire suas dúvidas sobre inscrição, pagamento, kit, percurso e regras da 2ª Corrida Natalina em Serra Talhada/PE.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Tire suas dúvidas" title="Perguntas frequentes" />

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-5 pt-6 pb-20 md:px-8 md:pt-8 md:pb-28">
          <Accordion type="single" collapsible className="grid gap-4">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="overflow-hidden rounded-2xl border-0 bg-[#730101] px-5 shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition hover:bg-[#630101] md:px-7"
              >
                <AccordionTrigger className="py-5 text-left text-base font-extrabold uppercase tracking-tight text-white hover:no-underline md:text-lg [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-white">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line pb-6 text-sm font-normal leading-relaxed text-white md:text-base">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
