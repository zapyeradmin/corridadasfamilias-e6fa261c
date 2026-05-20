import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createAdminUser, updateAdminUser } from "@/lib/admin.functions";

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "staff";
  created_at: string;
};

export function UserDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: AdminUserRow | null;
}) {
  const create = useServerFn(createAdminUser);
  const update = useServerFn(updateAdminUser);
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(user?.full_name ?? "");
    setEmail(user?.email ?? "");
    setPassword("");
    setRole(user?.role ?? "staff");
    setShowPwd(false);
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (user) {
        const patch: {
          id: string;
          full_name?: string;
          email?: string;
          password?: string;
          role?: "admin" | "staff";
        } = { id: user.id };
        if (name.trim() && name !== user.full_name) patch.full_name = name.trim();
        if (email.trim() && email !== user.email) patch.email = email.trim();
        if (password.trim()) patch.password = password;
        if (role !== user.role) patch.role = role;
        return update({ data: patch });
      }
      return create({
        data: { full_name: name.trim(), email: email.trim(), password, role },
      });
    },
    onSuccess: () => {
      toast.success(user ? "Usuário atualizado." : "Usuário criado.");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message || "Falha."),
  });

  const canSubmit = name.trim().length >= 2 && /.+@.+\..+/.test(email) && (user ? true : password.length >= 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Adicionar Usuário"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Atualize os dados. Deixe a senha em branco para mantê-la."
              : "Crie um novo usuário do sistema. A senha deve ter no mínimo 8 caracteres."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label="Nome do Usuário">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="E-mail (usado para login)">
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={user ? "Nova senha (opcional)" : "Senha"}>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                className={`${inputCls} pr-10`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={user ? "Deixe em branco para manter" : "Mínimo 8 caracteres"}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Mostrar/ocultar senha"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="Função">
            <select
              className={inputCls}
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
            >
              <option value="staff">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </Field>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {user ? "Salvar" : "Criar usuário"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
