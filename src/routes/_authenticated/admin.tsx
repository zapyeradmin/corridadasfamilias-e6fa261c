import { Link, Outlet, createFileRoute, redirect, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Handshake,
  Settings,
  ScrollText,
  LogOut,
  type LucideIcon,
} from "lucide-react";
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

const NAV: ReadonlyArray<{ to: string; label: string; icon: LucideIcon }> = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/inscricoes", label: "Inscrições", icon: Users },
  { to: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
  { to: "/admin/patrocinadores", label: "Patrocinadores", icon: Handshake },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { to: "/admin/logs", label: "Logs", icon: ScrollText },
];

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
        <aside className="md:w-64 md:shrink-0">
          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-white to-muted/40 p-3 shadow-soft">
            <div className="px-3 pb-3 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Administração
              </p>
              <div className="mt-2 h-px bg-gradient-to-r from-primary/40 via-border to-transparent" />
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.to || pathname.startsWith(item.to + "/");
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                      active
                        ? "bg-gradient-orange text-white shadow-orange"
                        : "text-foreground hover:bg-muted hover:translate-x-0.5",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity",
                        active ? "bg-white/80 opacity-100" : "opacity-0",
                      )}
                    />
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-white" : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="my-2 h-px bg-border" />
              <button
                onClick={logout}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
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
