import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { NAV_LINKS } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function MobileMenu({ open, isAuthenticated, onClose, onLogout }: Props) {
  return (
    <div
      className={cn(
        "relative z-10 lg:hidden overflow-hidden border-t border-white/5 bg-[color:var(--color-brand-dark)] transition-[max-height] duration-300",
        open ? "max-h-[80vh]" : "max-h-0",
      )}
    >
      <nav className="flex flex-col gap-1 px-5 py-4">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            onClick={onClose}
            className="rounded-xl px-4 py-3 text-base font-semibold text-white/85 hover:bg-white/10"
            activeOptions={{ exact: l.to === "/" }}
            activeProps={{ className: "bg-white/10 text-white" }}
          >
            {l.label}
          </Link>
        ))}
        <Link
          to="/inscricao"
          onClick={onClose}
          className="mt-2 rounded-full bg-gradient-orange px-5 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
        >
          Inscreva-se
        </Link>
        {isAuthenticated && (
          <button
            onClick={onLogout}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white/85 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        )}
      </nav>
    </div>
  );
}
