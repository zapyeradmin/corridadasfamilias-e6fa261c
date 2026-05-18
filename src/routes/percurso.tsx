import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Flag, Mountain } from "lucide-react";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/percurso")({
  head: () => ({
    meta: [
      { title: "Percurso 5km — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Percurso oficial de 5km com largada e chegada na Igreja Matriz de Nossa Senhora do Rosário, em Serra Talhada/PE.",
      },
      { property: "og:title", content: "Percurso 5km — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="5 quilômetros"
        title="Percurso oficial"
        description="Largada e chegada na Igreja Matriz, com trajeto pelas principais ruas do centro de Serra Talhada."
      />
      <ContentSection>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Flag, title: "Largada", value: "Igreja Matriz de Nossa Senhora do Rosário" },
            { icon: Mountain, title: "Distância", value: "5km — terreno plano" },
            { icon: MapPin, title: "Chegada", value: "Igreja Matriz de Nossa Senhora do Rosário" },
          ].map((c) => (
            <div key={c.title} className="rounded-3xl border border-border bg-white p-6 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--color-brand-purple)]/10 text-[color:var(--color-brand-purple)]">
                <c.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-brand-purple-text)]/70">
                {c.title}
              </p>
              <p className="mt-1 text-base font-extrabold text-[color:var(--color-brand-purple-title)]">
                {c.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-border shadow-card">
          <div className="aspect-[16/9] w-full bg-gradient-hero" aria-label="Mapa do percurso (em breve)">
            <div className="flex h-full items-center justify-center text-white/80">
              <p className="text-sm font-bold uppercase tracking-[0.3em]">
                Mapa do percurso em breve
              </p>
            </div>
          </div>
        </div>
      </ContentSection>
    </>
  );
}
