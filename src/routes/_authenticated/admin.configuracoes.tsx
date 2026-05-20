import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabPagamento } from "@/components/admin/configuracoes/tab-pagamento";
import { TabContatos } from "@/components/admin/configuracoes/tab-contatos";
import { TabUsuarios } from "@/components/admin/configuracoes/tab-usuarios";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Admin · Configurações" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as string) || "pagamento",
  }),
  component: Page,
});

function Page() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pagamentos, contatos oficiais e gerenciamento de usuários.
        </p>
      </header>

      <Tabs
        value={tab}
        onValueChange={(v) => navigate({ search: { tab: v }, replace: true })}
        className="w-full"
      >
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="pagamento">Configuração de Pagamento</TabsTrigger>
          <TabsTrigger value="contatos">Configuração de Contatos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="pagamento" className="mt-6">
          <TabPagamento />
        </TabsContent>
        <TabsContent value="contatos" className="mt-6">
          <TabContatos />
        </TabsContent>
        <TabsContent value="usuarios" className="mt-6">
          <TabUsuarios />
        </TabsContent>
      </Tabs>
    </div>
  );
}
