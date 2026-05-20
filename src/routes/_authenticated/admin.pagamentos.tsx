import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listPayments } from "@/lib/admin.functions";
import { formatCents, formatDateTimeBR } from "@/lib/format";
import { maskCpf } from "@/lib/cpf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/pagamentos")({
  head: () => ({ meta: [{ title: "Admin · Pagamentos" }] }),
  component: Page,
});

const STATUSES = ["all", "pending", "processing", "paid", "canceled", "refunded"] as const;
const STATUS_LABEL: Record<string, string> = {
  all: "Todos",
  pending: "Pendente",
  processing: "Processando",
  paid: "Pago",
  canceled: "Cancelado",
  refunded: "Reembolsado",
};
const PAGE_SIZE = 10;

function Page() {
  const fetchList = useServerFn(listPayments);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "payments", status, search, page],
    queryFn: () => fetchList({ data: { status, search, page, pageSize: PAGE_SIZE } }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  function goTo(n: number) {
    const clamped = Math.min(totalPages, Math.max(1, Math.floor(n) || 1));
    setPage(clamped);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Pagamentos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `${data.total} resultados` : "—"}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nome ou CPF"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setPage(1);
            setStatus(v);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Inscrito</th>
              <th className="px-4 py-3">CPF</th>
              <th className="px-4 py-3">Provedor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Pago em</th>
              <th className="px-4 py-3">Criado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            )}
            {data?.rows.map((p) => {
              const reg = (p as unknown as { registrations: { full_name: string; cpf: string } | null }).registrations;
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{reg?.full_name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{reg?.cpf ? maskCpf(reg.cpf) : "—"}</td>
                  <td className="px-4 py-3">{p.provider}</td>
                  <td className="px-4 py-3">{STATUS_LABEL[p.status] ?? p.status}</td>
                  <td className="px-4 py-3">{formatCents(p.amount_cents)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTimeBR(p.paid_at)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTimeBR(p.created_at)}</td>
                </tr>
              );
            })}
            {data && data.rows.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  Sem pagamentos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => goTo(Number(pageInput))}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="h-9 w-16 text-center"
          />
          <span className="text-muted-foreground">de {totalPages}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
