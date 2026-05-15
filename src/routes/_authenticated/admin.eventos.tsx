import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listEventsAdmin } from "@/lib/admin.functions";
import { formatCents, formatDateTimeBR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/eventos")({
  head: () => ({ meta: [{ title: "Admin · Eventos & Lotes" }] }),
  component: Page,
});

function Page() {
  const fetchList = useServerFn(listEventsAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "events"], queryFn: () => fetchList() });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Eventos & Lotes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visualização. Edição completa nas próximas sprints.</p>
      </header>

      {data.events.map((ev) => (
        <section key={ev.id} className="rounded-xl border border-border p-5">
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold">{ev.name}</h2>
              <p className="text-xs text-muted-foreground">{ev.edition} · {formatDateTimeBR(ev.event_date)} · {ev.city}/{ev.state}</p>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-bold uppercase">{ev.is_active ? "Ativo" : "Inativo"}</span>
          </header>
          <table className="mt-4 w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Lote</th>
                <th className="px-3 py-2">Preço</th>
                <th className="px-3 py-2">Início</th>
                <th className="px-3 py-2">Fim</th>
                <th className="px-3 py-2">Vagas</th>
                <th className="px-3 py-2">Ativo</th>
              </tr>
            </thead>
            <tbody>
              {data.lots.filter((l) => l.event_id === ev.id).map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">{l.name}</td>
                  <td className="px-3 py-2">{formatCents(l.price_cents)}</td>
                  <td className="px-3 py-2 text-xs">{formatDateTimeBR(l.starts_at)}</td>
                  <td className="px-3 py-2 text-xs">{formatDateTimeBR(l.ends_at)}</td>
                  <td className="px-3 py-2">{l.max_slots ?? "—"}</td>
                  <td className="px-3 py-2">{l.is_active ? "Sim" : "Não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
