import { createFileRoute } from "@tanstack/react-router";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/regulamento")({
  head: () => ({
    meta: [
      { title: "Regulamento — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Regulamento oficial da II Corrida das Famílias: distância, categorias, retirada de kit e regras gerais.",
      },
      { property: "og:title", content: "Regulamento — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

const SECTIONS = [
  {
    title: "1. Do evento",
    body: "A II Corrida das Famílias é uma corrida de rua de 5km, organizada pelo ECC da Paróquia de Nossa Senhora do Rosário, em Serra Talhada/PE, com largada e chegada na Igreja Matriz.",
  },
  {
    title: "2. Inscrições",
    body: "As inscrições são feitas exclusivamente pelo site oficial e estarão disponíveis enquanto houver vagas em cada lote. O valor varia conforme o lote vigente. A confirmação ocorre após o pagamento.",
  },
  {
    title: "3. Categorias",
    body: "Os participantes serão classificados por gênero e faixa etária no ato da inscrição, com base na data de nascimento informada.",
  },
  {
    title: "4. Kit do atleta",
    body: "Cada inscrito tem direito ao kit oficial: camisa, número de peito, chip de cronometragem (quando aplicável) e brindes dos patrocinadores. A retirada acontecerá em data e local divulgados oficialmente.",
  },
  {
    title: "5. Solidariedade",
    body: "No ato da retirada do kit, o atleta deverá entregar 1kg de alimento não perecível, que será destinado a famílias acompanhadas pelas pastorais sociais da paróquia.",
  },
  {
    title: "6. Largada e chegada",
    body: "A largada e a chegada ocorrerão na Igreja Matriz de Nossa Senhora do Rosário. Os horários oficiais serão divulgados na semana do evento.",
  },
  {
    title: "7. Premiação",
    body: "Serão premiados os primeiros colocados na geral (masculino/feminino) e por categoria, conforme detalhado na página de premiação.",
  },
  {
    title: "8. Disposições gerais",
    body: "Ao se inscrever, o participante declara estar em condições físicas adequadas e autoriza o uso de imagem para divulgação. Casos omissos serão resolvidos pela organização.",
  },
];

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Documento oficial"
        title="Regulamento"
        description="Leia atentamente antes de se inscrever. Em caso de dúvidas, fale com a organização pelo WhatsApp."
      />
      <ContentSection>
        <div className="grid gap-6">
          {SECTIONS.map((s) => (
            <article
              key={s.title}
              className="rounded-3xl border border-border bg-white p-7 shadow-soft"
            >
              <h2 className="text-lg font-extrabold uppercase tracking-tight text-[color:var(--color-brand-purple-title)]">
                {s.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[color:var(--color-brand-purple-text)]">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </ContentSection>
    </>
  );
}
