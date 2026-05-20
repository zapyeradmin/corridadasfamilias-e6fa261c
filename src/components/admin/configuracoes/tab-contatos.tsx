import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { updateSiteContacts } from "@/lib/admin.functions";
import { getSiteContacts } from "@/lib/public.functions";

export function TabContatos() {
  const fetch = useServerFn(getSiteContacts);
  const save = useServerFn(updateSiteContacts);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["public", "site-contacts"], queryFn: () => fetch() });

  const [local, setLocal] = useState("");
  const [email, setEmail] = useState("");
  const [whats, setWhats] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [igUser, setIgUser] = useState("");

  useEffect(() => {
    if (!data) return;
    setLocal(data.local);
    setEmail(data.email_oficial);
    setWhats(data.whatsapp_oficial);
    setIgUrl(data.instagram_url);
    setIgUser(data.instagram_usuario);
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () =>
      save({
        data: {
          local: local.trim(),
          email_oficial: email.trim(),
          whatsapp_oficial: whats.trim(),
          instagram_url: igUrl.trim(),
          instagram_usuario: igUser.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Contatos atualizados.");
      qc.invalidateQueries({ queryKey: ["public", "site-contacts"] });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao salvar."),
  });

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <header>
        <h2 className="text-lg font-extrabold">Contatos Oficiais</h2>
        <p className="text-sm text-muted-foreground">
          Esses dados aparecem no rodapé, botão flutuante de WhatsApp e demais links de contato do site.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Local">
          <input className={inputCls} value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Igreja Matriz... em Serra Talhada/PE" />
        </Field>
        <Field label="E-mail Oficial">
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@exemplo.com" />
        </Field>
        <Field label="WhatsApp Oficial (apenas dígitos, com DDD)">
          <input className={inputCls} value={whats} onChange={(e) => setWhats(e.target.value)} placeholder="5587981149806" inputMode="numeric" />
        </Field>
        <Field label="Usuário do Instagram">
          <input className={inputCls} value={igUser} onChange={(e) => setIgUser(e.target.value)} placeholder="corridadasfamilias" />
        </Field>
        <Field label="URL do Instagram" className="md:col-span-2">
          <input type="url" className={inputCls} value={igUrl} onChange={(e) => setIgUrl(e.target.value)} placeholder="https://www.instagram.com/..." />
        </Field>
      </div>

      <div>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> Salvar Contatos
        </button>
      </div>
    </section>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
