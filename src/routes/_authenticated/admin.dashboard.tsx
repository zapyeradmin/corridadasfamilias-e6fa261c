import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardKPIs } from "@/lib/admin.functions";
import { formatCents, formatDateTimeBR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin · Dashboard — II Corrida das Famílias" }] }),
  component: Page,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  processing: "Processando",
  paid: "Pago",
  canceled: "Cancelado",
  refunded: "Reembolsado",
};

function Page() {
  const fetchKpis = useServerFn(getDashboardKPIs);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "kpis"], queryFn: () => fetchKpis() });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral das inscrições e pagamentos.</p>
      </header>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi title="Inscrições" value={String(data.totalRegistrations)} />
            <Kpi title="Pagas" value={String(data.byStatus.paid ?? 0)} />
            <Kpi title="Pendentes" value={String(data.byStatus.pending ?? 0)} />
            <Kpi title="Receita confirmada" value={formatCents(data.revenueCents)} />
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold uppercase tracking-tight">Últimas inscrições</h2>
              <Link to="/admin/inscricoes" className="text-sm font-semibold text-primary hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Protocolo</th>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Criada</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-3 font-mono text-xs">{r.protocol}</td>
                      <td className="px-4 py-3">
                        <Link to="/admin/inscricoes/$id" params={{ id: r.id }} className="font-semibold hover:underline">
                          {r.full_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{STATUS_LABEL[r.status] ?? r.status}</td>
                      <td className="px-4 py-3">{formatCents(r.amount_cents)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTimeBR(r.created_at)}</td>
                    </tr>
                  ))}
                  {data.recent.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Nenhuma inscrição ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-muted/40 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-extrabold text-foreground">{value}</p>
    </div>
  );
}
