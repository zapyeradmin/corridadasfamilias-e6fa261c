import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NAV_LINKS, SITE } from "@/lib/site-config";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    let active = true;
    async function loadRole(userId: string) {
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (active) setIsAdmin(!!role);
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const user = data.session?.user;
      setIsAuthenticated(!!user);
      if (user) loadRole(user.id);
      else setIsAdmin(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const user = session?.user;
      setIsAuthenticated(!!user);
      if (user) loadRole(user.id);
      else setIsAdmin(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  function handleLogout() {
    setOpen(false);
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate({ to: "/", replace: true });
    toast.success("Você saiu da conta.");
    supabase.auth.signOut().then(() => {
      qc.clear();
      router.invalidate();
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[color:var(--color-brand-dark)]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-orange text-white font-black shadow-orange">
            II
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Corrida das Famílias
            </span>
            <span className="text-sm font-extrabold uppercase tracking-tight text-white">
              {SITE.eventDateLabel} · {SITE.city}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-white bg-white/10" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/inscricao"
            className="ml-2 rounded-full bg-gradient-orange px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange transition hover:scale-[1.02]"
          >
            Inscreva-se
          </Link>
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white/85 hover:bg-white/10"
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white/85 hover:bg-white/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          )}
        </nav>

        <button
          aria-label="Abrir menu"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "lg:hidden overflow-hidden border-t border-white/5 bg-[color:var(--color-brand-dark)] transition-[max-height] duration-300",
          open ? "max-h-[80vh]" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-semibold text-white/85 hover:bg-white/10"
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-white/10 text-white" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/inscricao"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-gradient-orange px-5 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
          >
            Inscreva-se
          </Link>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white/85 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
