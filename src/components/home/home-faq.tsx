import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "./data";

export function HomeFaq() {
  return (
    <section className="bg-[color:var(--color-brand-orange)]">
      <div className="mx-auto max-w-[1200px] px-5 pt-6 pb-20 md:px-8 md:pt-10 md:pb-28">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-white">
            Tire suas dúvidas
          </p>
          <h2 className="heading-section mt-3 text-3xl text-white md:text-5xl">
            Perguntas frequentes (FAQ)
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-white text-justify md:text-lg">
            Encontre respostas para as dúvidas mais comuns sobre a 2ª Corrida das Famílias.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-10 grid gap-4 md:mt-14">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="overflow-hidden rounded-2xl border-0 bg-[#431181] px-5 shadow-[0_10px_30px_rgba(22,9,31,0.18)] md:px-7"
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
  );
}
