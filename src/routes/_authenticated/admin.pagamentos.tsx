import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listPayments, simulatePaymentApproval } from "@/lib/admin.functions";
import { formatCents, formatDateTimeBR } from "@/lib/format";
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

const STATUSES = ["all", "pending", "processing", "paid", "failed", "refunded"] as const;

function Page() {
  const fetchList = useServerFn(listPayments);
  const simulate = useServerFn(simulatePaymentApproval);
  const qc = useQueryClient();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [protocol, setProtocol] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "payments", status, page],
    queryFn: () => fetchList({ data: { status, page, pageSize: 25 } }),
  });

  const mutation = useMutation({
    mutationFn: (p: string) => simulate({ data: { protocol: p } }),
    onSuccess: () => {
      toast.success("Pagamento aprovado (mock).");
      setProtocol("");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Pagamentos</h1>
      </header>

      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Modo de testes (Infinity Pay desativado)</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            placeholder="Protocolo da inscrição"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value.toUpperCase())}
            className="max-w-xs"
          />
          <Button onClick={() => protocol && mutation.mutate(protocol)} disabled={!protocol || mutation.isPending}>
            Simular aprovação
          </Button>
        </div>
      </div>

      <Select value={status} onValueChange={(v) => { setPage(1); setStatus(v); }}>
        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Provedor</th>
              <th className="px-4 py-3">Protocolo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Pago em</th>
              <th className="px-4 py-3">Criado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Carregando…</td></tr>}
            {data?.rows.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">{p.provider}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.external_reference ?? "—"}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">{formatCents(p.amount_cents)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTimeBR(p.paid_at)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTimeBR(p.created_at)}</td>
              </tr>
            ))}
            {data && data.rows.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Sem pagamentos.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{data?.total ?? 0} resultados</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!data || data.rows.length < 25}>Próxima</Button>
        </div>
      </div>
    </div>
  );
}
