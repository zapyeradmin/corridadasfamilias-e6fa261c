import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRegistrationDetail } from "@/lib/admin.functions";
import { formatCents, formatDateTimeBR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/inscricoes/$id")({
  head: () => ({ meta: [{ title: "Admin · Detalhe da inscrição" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const fetchDetail = useServerFn(getRegistrationDetail);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "registration", id],
    queryFn: () => fetchDetail({ data: { id } }),
  });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const r = data.registration;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/admin/inscricoes" className="text-xs font-semibold text-muted-foreground hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold uppercase tracking-tight">{r.full_name}</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">Protocolo {r.protocol}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Status" value={r.status} />
        <Field label="Valor" value={formatCents(r.amount_cents)} />
        <Field label="E-mail" value={r.email} />
        <Field label="WhatsApp" value={r.whatsapp} />
        <Field label="CPF" value={r.cpf} />
        <Field label="Nascimento" value={formatDateTimeBR(r.birth_date)} />
        <Field label="Gênero" value={r.gender} />
        <Field label="Categoria" value={r.category} />
        <Field label="Camiseta" value={r.shirt_size} />
        <Field label="Contato emergência" value={`${r.emergency_contact_name} — ${r.emergency_contact_phone}`} />
        <Field label="Notas médicas" value={r.medical_notes ?? "—"} />
        <Field label="Criada em" value={formatDateTimeBR(r.created_at)} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold uppercase tracking-tight">Pagamentos</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Provedor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Pago em</th>
                <th className="px-4 py-3">Criado</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">{p.provider}</td>
                  <td className="px-4 py-3">{p.status}</td>
                  <td className="px-4 py-3">{formatCents(p.amount_cents)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTimeBR(p.paid_at)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTimeBR(p.created_at)}</td>
                </tr>
              ))}
              {data.payments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">Sem pagamentos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
