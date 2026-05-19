import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-shell";
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
          "Perguntas frequentes sobre inscrição, pagamento, kit, percurso, transferência e confirmação da II Corrida das Famílias.",
      },
      { property: "og:title", content: "FAQ — II Corrida das Famílias" },
      {
        property: "og:description",
        content:
          "Tire suas dúvidas sobre inscrição, pagamento, kit, percurso e regras da II Corrida das Famílias em Serra Talhada/PE.",
      },
    ],
  }),
  component: Page,
});

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Como faço minha inscrição?",
    a: `A inscrição para a II CORRIDA DAS FAMÍLIAS será realizada exclusivamente pelo Site Oficial do evento.

Para se inscrever, basta acessar a área de inscrição no site, preencher corretamente o formulário com seus dados pessoais, escolher sua categoria, selecionar o tamanho da camisa e aceitar os termos de participação. Após isso, clique em "Realizar Inscrição".

Em seguida, você será direcionado para a página de pagamento integrada ao checkout online. Após concluir o pagamento, sua inscrição será registrada no sistema da organização.`,
  },
  {
    q: "Quais formas de pagamento são aceitas?",
    a: `As inscrições poderão ser pagas de forma online, com praticidade e segurança.

Serão aceitas as seguintes formas de pagamento:

1. PIX
2. Cartão de Crédito à Vista
3. Cartão de Crédito Parcelado

O pagamento será realizado por meio do checkout online integrado ao site oficial da corrida.`,
  },
  {
    q: "Posso me inscrever no dia do evento?",
    a: `Não. As inscrições serão realizadas somente pelo Site Oficial e dentro do prazo estabelecido pela organização.

As inscrições se encerram no dia 12 de julho de 2026, às 23h59, horário de Brasília. Após esse prazo, o formulário de inscrição será desativado, mesmo que ainda existam pessoas interessadas em participar. Por isso, a orientação é clara:

Não deixe para a última hora. Garanta sua inscrição dentro do prazo oficial e participe dessa grande experiência de fé, esporte em família, saúde e solidariedade.`,
  },
  {
    q: "Posso transferir minha inscrição?",
    a: `Sim. A transferência de inscrição será permitida, desde que o participante informe a organização com antecedência.

No entanto, há uma regra importante: o tamanho da camisa escolhido no momento da inscrição não poderá ser alterado. Portanto, caso precise transferir sua inscrição para outra pessoa, entre em contato com a equipe organizadora o quanto antes para receber as orientações corretas.`,
  },
  {
    q: "Como e quando será a entrega dos Kits?",
    a: `A entrega dos kits será realizada nos dias 04, 05 e 06 de agosto de 2026, sempre no horário das 19h30 às 21h30.

O local de retirada será o Salão Paroquial da Igreja de Nossa Senhora da Conceição, ao lado da Igreja de Nossa Senhora da Conceição. O kit do atleta inclui:

1. Camisa oficial da corrida
2. Número de peito

Além disso os atletas terão pontos de Hidratação durante o percurso e Medalha para os participantes que concluírem o percurso completo. Cada participante deverá levar 1kg de alimento não perecível no momento da retirada do kit, reforçando o compromisso solidário da II CORRIDA DAS FAMÍLIAS.`,
  },
  {
    q: "Como posso saber que minha inscrição está confirmada?",
    a: `Sua inscrição será considerada confirmada após o preenchimento correto do formulário e a confirmação do pagamento. O processo funciona assim:

Você preenche o formulário no site oficial, aceita os termos, clica em "Realizar Inscrição" e conclui o pagamento no checkout online. Após a confirmação do pagamento, sua inscrição passa a constar como confirmada no sistema administrativo da organização.

Caso tenha feito sua inscrição e ainda esteja com dúvida sobre o status do pagamento ou da confirmação, entre em contato com a organização pelo WhatsApp oficial do evento.

Importante: preencher o formulário sem concluir o pagamento não garante a confirmação definitiva da inscrição. A vaga só estará efetivamente confirmada após a validação do pagamento.`,
  },
];

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
    </>
  );
}
