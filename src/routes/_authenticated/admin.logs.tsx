import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAccessLogs } from "@/lib/admin.functions";
import { formatDateTimeBR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/logs")({
  head: () => ({ meta: [{ title: "Admin · Logs" }] }),
  component: Page,
});

function Page() {
  const fetchList = useServerFn(listAccessLogs);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "logs"], queryFn: () => fetchList() });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Logs de acesso</h1>
      </header>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Ator</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Entidade</th>
              <th className="px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTimeBR(l.created_at)}</td>
                <td className="px-4 py-3 text-xs">{l.actor_email ?? l.actor_id ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">{l.action}</td>
                <td className="px-4 py-3 text-xs">{l.entity_type ?? "—"} {l.entity_id ? `· ${l.entity_id.slice(0, 8)}` : ""}</td>
                <td className="px-4 py-3"><pre className="whitespace-pre-wrap font-mono text-[11px]">{JSON.stringify(l.details, null, 2)}</pre></td>
              </tr>
            ))}
            {data && data.length === 0 && !isLoading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Sem logs ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
