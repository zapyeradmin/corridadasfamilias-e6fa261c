import { Link } from "@tanstack/react-router";
import { LogOut, Shield } from "lucide-react";
import { NAV_LINKS } from "@/lib/site-config";

interface Props {
  isAdmin: boolean;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function DesktopNav({ isAdmin, isAuthenticated, onLogout }: Props) {
  return (
    <nav className="relative hidden items-center gap-1 lg:flex">
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
          onClick={onLogout}
          className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white/85 hover:bg-white/10"
        >
          <LogOut className="h-3.5 w-3.5" /> Sair
        </button>
      )}
    </nav>
  );
}
