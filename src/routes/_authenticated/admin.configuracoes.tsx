import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSettingsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Admin · Configurações" }] }),
  component: Page,
});

function Page() {
  const fetchList = useServerFn(listSettingsAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => fetchList() });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Configurações</h1>
      </header>
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
                <td className="px-4 py-3 font-mono text-xs"><pre className="whitespace-pre-wrap">{JSON.stringify(s.value, null, 2)}</pre></td>
                <td className="px-4 py-3">{s.is_public ? "Sim" : "Não"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
