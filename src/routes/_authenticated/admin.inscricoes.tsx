import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { listRegistrations, updateRegistrationStatus, getRegistrationDetail } from "@/lib/admin.functions";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
const PAGE_SIZE = 10;

function Page() {
  const fetchList = useServerFn(listRegistrations);
  const updateStatus = useServerFn(updateRegistrationStatus);
  const qc = useQueryClient();

  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "registrations", status, search, page],
    queryFn: () => fetchList({ data: { status, search, page, pageSize: PAGE_SIZE } }),
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
                  <p className="font-semibold">{r.full_name}</p>
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
                  <button
                    type="button"
                    onClick={() => setDetailId(r.id)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
            {data && data.rows.length === 0 && !isLoading && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma inscrição encontrada.</td></tr>
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
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
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

      <RegistrationDetailDialog
        id={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}

function RegistrationDetailDialog({
  id,
  open,
  onClose,
}: {
  id: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const fetchDetail = useServerFn(getRegistrationDetail);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "registration", id],
    queryFn: () => fetchDetail({ data: { id: id! } }),
    enabled: !!id,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold uppercase tracking-tight">
            {data?.registration.full_name ?? "Detalhes da inscrição"}
          </DialogTitle>
          {data && (
            <DialogDescription className="font-mono text-xs">
              Protocolo {data.registration.protocol}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading || !data ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-3 sm:grid-cols-2">
              <Field label="Status" value={STATUS_LABEL[data.registration.status] ?? data.registration.status} />
              <Field label="Valor" value={formatCents(data.registration.amount_cents)} />
              <Field label="E-mail" value={data.registration.email} />
              <Field label="WhatsApp" value={data.registration.whatsapp} />
              <Field label="CPF" value={data.registration.cpf} />
              <Field label="Nascimento" value={formatDateTimeBR(data.registration.birth_date)} />
              <Field label="Gênero" value={data.registration.gender} />
              <Field label="Categoria" value={data.registration.category} />
              <Field label="Camiseta" value={data.registration.shirt_size} />
              <Field label="Tipo participante" value={data.registration.participant_type ?? "—"} />
              <Field
                label="Contato emergência"
                value={`${data.registration.emergency_contact_name} — ${data.registration.emergency_contact_phone}`}
              />
              <Field label="Notas médicas" value={data.registration.medical_notes ?? "—"} />
              <Field label="LGPD aceito" value={data.registration.accepted_lgpd ? "Sim" : "Não"} />
              <Field label="Termos aceitos" value={data.registration.accepted_terms ? "Sim" : "Não"} />
              <Field label="Criada em" value={formatDateTimeBR(data.registration.created_at)} />
              <Field label="Atualizada em" value={formatDateTimeBR(data.registration.updated_at)} />
            </section>

            <section>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-tight">Pagamentos</h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Provedor</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Valor</th>
                      <th className="px-3 py-2">Pago em</th>
                      <th className="px-3 py-2">Criado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="px-3 py-2">{p.provider}</td>
                        <td className="px-3 py-2">{STATUS_LABEL[p.status] ?? p.status}</td>
                        <td className="px-3 py-2">{formatCents(p.amount_cents)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{formatDateTimeBR(p.paid_at)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{formatDateTimeBR(p.created_at)}</td>
                      </tr>
                    ))}
                    {data.payments.length === 0 && (
                      <tr><td colSpan={5} className="px-3 py-4 text-center text-xs text-muted-foreground">Sem pagamentos registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground break-words">{value}</p>
    </div>
  );
}
