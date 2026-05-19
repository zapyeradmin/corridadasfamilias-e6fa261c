import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Save } from "lucide-react";
import { listSettingsAdmin, updateSettingAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Admin · Configurações" }] }),
  component: Page,
});

const CHECKOUT_KEYS = {
  adulto: "infinitepay_checkout_adulto_url",
  crianca: "infinitepay_checkout_crianca_url",
} as const;

function Page() {
  const fetchList = useServerFn(listSettingsAdmin);
  const updateSetting = useServerFn(updateSettingAdmin);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => fetchList(),
  });

  const [adultoUrl, setAdultoUrl] = useState("");
  const [criancaUrl, setCriancaUrl] = useState("");

  useEffect(() => {
    if (!data) return;
    const a = data.find((s) => s.key === CHECKOUT_KEYS.adulto);
    const c = data.find((s) => s.key === CHECKOUT_KEYS.crianca);
    setAdultoUrl(typeof a?.value === "string" ? a.value : "");
    setCriancaUrl(typeof c?.value === "string" ? c.value : "");
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (input: { key: string; value: string }) =>
      updateSetting({ data: input }),
    onSuccess: () => {
      toast.success("Configuração salva.");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao salvar."),
  });

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://corridadasfamilias.lovable.app";
  const webhookUrl = `${origin}/api/webhooks/infinitepay`;
  const redirectUrl = `${origin}/pagamento`;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          URLs de integração e configurações públicas do sistema.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-extrabold">InfinitePay — URLs do projeto</h2>
        <p className="text-sm text-muted-foreground">
          Use estas URLs ao configurar o Checkout no painel da InfinitePay.
        </p>
        <ReadOnlyField label="URL do Webhook InfinitePay" value={webhookUrl} />
        <ReadOnlyField label="URL de Redirecionamento InfinitePay" value={redirectUrl} />
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-extrabold">Links dos Checkouts (InfinitePay)</h2>
        <p className="text-sm text-muted-foreground">
          Cole aqui os links gerados pela InfinitePay. Enquanto estiverem vazios, o
          botão de pagamento exibirá uma mensagem de checkout em configuração.
        </p>

        <CheckoutField
          label="Inscrição (Adulto) | Lote 1 — R$ 68,00"
          placeholder="https://checkout.infinitepay.io/..."
          value={adultoUrl}
          onChange={setAdultoUrl}
          onSave={() =>
            mutation.mutate({ key: CHECKOUT_KEYS.adulto, value: adultoUrl.trim() })
          }
          saving={mutation.isPending}
        />
        <CheckoutField
          label="Inscrição (Criança) | Lote 1 — R$ 48,00"
          placeholder="https://checkout.infinitepay.io/..."
          value={criancaUrl}
          onChange={setCriancaUrl}
          onSave={() =>
            mutation.mutate({ key: CHECKOUT_KEYS.crianca, value: criancaUrl.trim() })
          }
          saving={mutation.isPending}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">Todas as configurações</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Chave</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Pública</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((s) => (
                <tr key={s.key} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{s.key}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(s.value, null, 2)}</pre>
                  </td>
                  <td className="px-4 py-3">{s.is_public ? "Sim" : "Não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
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

function CheckoutField({
  label,
  placeholder,
  value,
  onChange,
  onSave,
  saving,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          type="url"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" /> Salvar
        </button>
      </div>
    </div>
  );
}
