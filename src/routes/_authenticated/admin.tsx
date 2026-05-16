import { Link, Outlet, createFileRoute, redirect, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (!userData.user) {
      throw redirect({ to: "/login", search: { redirect: "/admin/dashboard" } as never });
    }

    if (userError) {
      throw new Error("Não foi possível confirmar sua sessão. Faça login novamente.");
    }

    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      throw new Error("Não foi possível verificar seu acesso administrativo. Tente novamente.");
    }

    if (!role) {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/inscricoes", label: "Inscrições" },
  { to: "/admin/pagamentos", label: "Pagamentos" },
  { to: "/admin/eventos", label: "Eventos & Lotes" },
  { to: "/admin/patrocinadores", label: "Patrocinadores" },
  { to: "/admin/galeria", label: "Galeria" },
  { to: "/admin/configuracoes", label: "Configurações" },
  { to: "/admin/logs", label: "Logs" },
] as const;

function AdminLayout() {
  const router = useRouter();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function logout() {
    navigate({ to: "/", replace: true });
    toast.success("Você saiu da conta.");
    supabase.auth.signOut().then(() => router.invalidate());
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-muted/30">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-6 px-4 py-8 md:flex-row md:px-8">
        <aside className="md:w-60 md:shrink-0">
          <div className="rounded-2xl border border-border bg-white p-3 shadow-soft">
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Administração
            </p>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = pathname === item.to || pathname.startsWith(item.to + "/");
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-gradient-orange text-white shadow-orange"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </nav>
          </div>
        </aside>
        <section className="flex-1">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft md:p-8">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
