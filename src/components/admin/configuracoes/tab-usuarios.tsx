import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, ShieldCheck, User as UserIcon } from "lucide-react";
import { deleteAdminUser, listAdminUsers } from "@/lib/admin.functions";
import { UserDialog, type AdminUserRow } from "./user-dialog";

export function TabUsuarios() {
  const fetchList = useServerFn(listAdminUsers);
  const del = useServerFn(deleteAdminUser);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "users"], queryFn: () => fetchList() });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);

  const delMutation = useMutation({
    mutationFn: async (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Usuário excluído.");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao excluir."),
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Usuários</h2>
          <p className="text-sm text-muted-foreground">Gerencie quem tem acesso ao painel administrativo.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Adicionar Usuário
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Função</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            )}
            {!isLoading && (data ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {(data ?? []).map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">{u.full_name || "—"}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      u.role === "admin" ? "bg-violet-100 text-violet-800" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {u.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                    {u.role === "admin" ? "Administrador" : "Usuário"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(u);
                        setDialogOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-bold hover:bg-muted"
                    >
                      <Pencil className="h-3 w-3" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Excluir usuário "${u.email}"? Esta ação não pode ser desfeita.`)) {
                          delMutation.mutate(u.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" /> Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editing} />
    </section>
  );
}
