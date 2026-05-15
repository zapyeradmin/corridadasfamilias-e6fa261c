import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listRegistrations, updateRegistrationStatus } from "@/lib/admin.functions";
import { formatCents, formatDateTimeBR } from "@/lib/format";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/inscricoes")({
  head: () => ({ meta: [{ title: "Admin · Inscrições — II Corrida das Famílias" }] }),
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

function Page() {
  const fetchList = useServerFn(listRegistrations);
  const updateStatus = useServerFn(updateRegistrationStatus);
  const qc = useQueryClient();

  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "registrations", status, search, page],
    queryFn: () => fetchList({ data: { status, search, page, pageSize } }),
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: "pending" | "processing" | "paid" | "canceled" | "refunded" }) =>
      updateStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Status atualizado.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Inscrições</h1>
        <p className="mt-1 text-sm text-muted-foreground">{data ? `${data.total} resultados` : "—"}</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nome, e-mail, CPF ou protocolo"
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
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Protocolo</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Camiseta</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Criada</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">Carregando…</td></tr>
            )}
            {data?.rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{r.protocol}</td>
                <td className="px-4 py-3">
                  <Link to="/admin/inscricoes/$id" params={{ id: r.id }} className="font-semibold hover:underline">
                    {r.full_name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{r.email}</p>
                </td>
                <td className="px-4 py-3">{r.category}</td>
                <td className="px-4 py-3">{r.shirt_size}</td>
                <td className="px-4 py-3">
                  <Select
                    value={r.status}
                    onValueChange={(v) =>
                      mutation.mutate({
                        id: r.id,
                        status: v as "pending" | "processing" | "paid" | "canceled" | "refunded",
                      })
                    }
                  >
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.filter((s) => s !== "all").map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">{formatCents(r.amount_cents)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTimeBR(r.created_at)}</td>
                <td className="px-4 py-3">
                  <Link to="/admin/inscricoes/$id" params={{ id: r.id }} className="text-xs font-semibold text-primary hover:underline">
                    Detalhes
                  </Link>
                </td>
              </tr>
            ))}
            {data && data.rows.length === 0 && !isLoading && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma inscrição encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Página {page} de {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
