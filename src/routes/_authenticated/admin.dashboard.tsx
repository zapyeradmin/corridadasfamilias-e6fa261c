import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const PAGE_SIZE = 10;

function Page() {
  const fetchKpis = useServerFn(getDashboardKPIs);
  const { data, error, isError, isLoading } = useQuery({ queryKey: ["admin", "kpis"], queryFn: () => fetchKpis() });

  const recent = data?.recent ?? [];
  const totalPages = Math.max(1, Math.ceil(recent.length / PAGE_SIZE));
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageRows = useMemo(
    () => recent.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [recent, safePage],
  );

  function goTo(p: number) {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    setPageInput(String(next));
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral das inscrições e pagamentos.</p>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : isError ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Não foi possível carregar o dashboard."}
        </p>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">Nenhum dado encontrado.</p>
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
                  {pageRows.map((r) => (
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
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Nenhuma inscrição ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {recent.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goTo(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Página anterior"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const n = Number(pageInput);
                    if (Number.isFinite(n)) goTo(Math.floor(n));
                    else setPageInput(String(safePage));
                  }}
                  className="flex items-center gap-1.5 text-sm font-semibold"
                >
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={() => {
                      const n = Number(pageInput);
                      if (Number.isFinite(n)) goTo(Math.floor(n));
                      else setPageInput(String(safePage));
                    }}
                    className="h-9 w-14 rounded-lg border border-border bg-white text-center font-bold tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label="Página atual"
                  />
                  <span className="text-muted-foreground">/ {totalPages}</span>
                </form>
                <button
                  type="button"
                  onClick={() => goTo(safePage + 1)}
                  disabled={safePage >= totalPages}
                  aria-label="Próxima página"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
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
