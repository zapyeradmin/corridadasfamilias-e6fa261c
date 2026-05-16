import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import { getPublishedGallery } from "@/lib/public.functions";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galeria — II Corrida das Famílias" },
      {
        name: "description",
        content: "Fotos e momentos das edições da Corrida das Famílias em Serra Talhada/PE.",
      },
      { property: "og:title", content: "Galeria — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

function Page() {
  const fetchGallery = useServerFn(getPublishedGallery);
  const { data: items, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: () => fetchGallery(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <PageHeader
        eyebrow="Memórias"
        title="Galeria"
        description="Imagens das edições anteriores e da preparação para a II Corrida das Famílias."
      />
      <ContentSection>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-[color:var(--color-brand-soft)]" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[color:var(--color-brand-purple)]/25 bg-white p-12 text-center shadow-soft">
            <Camera className="mx-auto h-10 w-10 text-[color:var(--color-brand-purple)]/60" />
            <p className="mt-4 text-base font-bold text-[color:var(--color-brand-purple-text)]">
              Em breve, fotos oficiais da II edição.
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-brand-purple-text)]/70">
              A galeria será publicada após o evento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((it) => (
              <figure key={it.id} className="overflow-hidden rounded-2xl bg-[color:var(--color-brand-soft)] shadow-soft">
                <img
                  src={it.image_url}
                  alt={it.title || "Foto da Corrida das Famílias"}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition hover:scale-[1.03]"
                />
                {it.caption && (
                  <figcaption className="px-3 py-2 text-xs text-[color:var(--color-brand-purple-text)]/80">
                    {it.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </ContentSection>
    </>
  );
}
