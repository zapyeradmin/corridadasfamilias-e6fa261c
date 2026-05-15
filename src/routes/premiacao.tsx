import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Medal, Award } from "lucide-react";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/premiacao")({
  head: () => ({
    meta: [
      { title: "Premiação — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Premiação geral e por categoria da II Corrida das Famílias: troféus, medalhas e brindes especiais.",
      },
      { property: "og:title", content: "Premiação — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Reconhecimento"
        title="Premiação"
        description="Reconhecemos atletas em diferentes categorias com troféus, medalhas e brindes."
      />
      <ContentSection>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Trophy, title: "Geral", desc: "Top 3 masculino e feminino na classificação geral." },
            { icon: Medal, title: "Por categoria", desc: "Top 3 em cada faixa etária, masculino e feminino." },
            { icon: Award, title: "Todos os participantes", desc: "Medalha de participação para quem cruzar a linha de chegada." },
          ].map((p) => (
            <div key={p.title} className="rounded-3xl border border-border bg-white p-7 shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--color-brand-amber)]/15 text-[color:var(--color-brand-amber)]">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold uppercase tracking-tight text-[color:var(--color-brand-purple-title)]">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-brand-purple-text)]/85">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </ContentSection>
    </>
  );
}
