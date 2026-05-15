import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSponsorsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/patrocinadores")({
  head: () => ({ meta: [{ title: "Admin · Patrocinadores" }] }),
  component: Page,
});

function Page() {
  const fetchList = useServerFn(listSponsorsAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "sponsors"], queryFn: () => fetchList() });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Patrocinadores</h1>
      </header>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data?.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-white p-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img src={s.logo_url} alt={s.name} className="h-full w-full object-contain" />
            </div>
            <p className="mt-2 truncate text-sm font-semibold">{s.name}</p>
            <p className="text-xs uppercase text-muted-foreground">{s.tier} · {s.is_published ? "Publicado" : "Oculto"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
