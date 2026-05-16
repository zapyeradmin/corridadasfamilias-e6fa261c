import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site-config";

export function HeaderLogo() {
  return (
    <Link to="/" className="relative flex items-center gap-3">
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
  );
}
