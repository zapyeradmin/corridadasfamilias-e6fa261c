import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, Save, CheckCircle2 } from "lucide-react";
import { updateCheckoutConfig } from "@/lib/admin.functions";
import { getCheckoutConfig, type CheckoutConfig } from "@/lib/public.functions";

type Tipo = "adulto" | "crianca";

function formatDateBR(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TabPagamento() {
  const fetchConfig = useServerFn(getCheckoutConfig);
  const { data } = useQuery({
    queryKey: ["public", "checkout-config"],
    queryFn: () => fetchConfig(),
  });

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://corridadasfamilias.lovable.app";

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <header>
          <h2 className="text-lg font-extrabold">InfinitePay — URLs do Projeto</h2>
          <p className="text-sm text-muted-foreground">
            Use estas URLs ao configurar o Checkout no painel da InfinitePay.
          </p>
        </header>
        <ReadOnlyField label="URL do Webhook InfinitePay" value={`${origin}/api/webhooks/infinitepay`} />
        <ReadOnlyField label="URL de Redirecionamento InfinitePay" value={`${origin}/pagamento`} />
        <ReadOnlyField label="URL de Redirecionamento de Sucesso InfinitePay" value={`${origin}/sucesso`} />
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-extrabold">Links dos Checkouts InfinitePay</h2>
          <p className="text-sm text-muted-foreground">
            Cadastre, edite e salve os links dos checkouts. Eles serão usados automaticamente em <code>/inscricao</code>.
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <CheckoutCard
            title="Checkout Adulto"
            tipo="adulto"
            initial={data?.adulto}
          />
          <CheckoutCard
            title="Checkout Criança"
            tipo="crianca"
            initial={data?.crianca}
          />
        </div>
        <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          <strong>Regra de idade:</strong> inscritos com até 9 anos (inclusive) são redirecionados para o
          Checkout Criança. Acima disso, Checkout Adulto.
        </p>
      </section>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          readOnly
          value={value}
          className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("URL copiada.");
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold hover:bg-muted"
        >
          <Copy className="h-3.5 w-3.5" /> Copiar
        </button>
      </div>
    </div>
  );
}

function CheckoutCard({
  title,
  tipo,
  initial,
}: {
  title: string;
  tipo: Tipo;
  initial: CheckoutConfig | undefined;
}) {
  const save = useServerFn(updateCheckoutConfig);
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [lote, setLote] = useState<"Lote 1" | "Lote 2" | "Lote 3">("Lote 1");
  const [valorBR, setValorBR] = useState("0,00");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!initial) return;
    setNome(initial.nome_produto);
    setLote(initial.lote);
    setValorBR((initial.valor_cents / 100).toFixed(2).replace(".", ","));
    setUrl(initial.checkout_url);
  }, [initial]);

  const mutation = useMutation({
    mutationFn: async () => {
      const valor_cents = Math.round(Number(valorBR.replace(/\./g, "").replace(",", ".")) * 100);
      return save({
        data: {
          tipo,
          nome_produto: nome.trim(),
          lote,
          valor_cents,
          checkout_url: url.trim(),
        },
      });
    },
    onSuccess: () => {
      toast.success(`${title} salvo com sucesso.`);
      qc.invalidateQueries({ queryKey: ["public", "checkout-config"] });
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao salvar."),
  });

  const ativo = url.trim().length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold">{title}</h3>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
            ativo ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
          }`}
        >
          {ativo && <CheckCircle2 className="h-3 w-3" />}
          {ativo ? "Checkout Ativo" : "Pendente"}
        </span>
      </header>

      <div className="mt-4 grid gap-4">
        <Field label="Nome do Produto">
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Inscrição (Adulto)"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lote">
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={lote}
              onChange={(e) => setLote(e.target.value as typeof lote)}
            >
              <option>Lote 1</option>
              <option>Lote 2</option>
              <option>Lote 3</option>
            </select>
          </Field>
          <Field label="Valor (R$)">
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={valorBR}
              onChange={(e) => setValorBR(e.target.value.replace(/[^\d,]/g, ""))}
              placeholder="68,00"
              inputMode="decimal"
            />
          </Field>
        </div>
        <Field label="Link do Checkout InfinitePay">
          <input
            type="url"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://checkout.infinitepay.io/..."
          />
        </Field>
        <p className="text-[11px] text-muted-foreground">
          Última atualização: <strong>{formatDateBR(initial?.updated_at ?? null)}</strong>
        </p>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !nome.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> Salvar {title}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
