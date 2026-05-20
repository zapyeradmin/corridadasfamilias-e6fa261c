import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listGalleryAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/galeria")({
  head: () => ({ meta: [{ title: "Admin · Galeria" }] }),
  component: Page,
});

function Page() {
  const fetchList = useServerFn(listGalleryAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "gallery"], queryFn: () => fetchList() });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Galeria</h1>
      </header>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data?.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="aspect-[4/3] bg-muted">
              <img src={g.image_url} alt={g.title ?? ""} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold">{g.title ?? "(sem título)"}</p>
              <p className="text-xs text-muted-foreground">{g.is_published ? "Publicado" : "Oculto"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
