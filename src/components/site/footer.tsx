import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="bg-[color:var(--color-brand-dark)] text-white">
      <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-16 md:grid-cols-3 md:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            {SITE.organizer}
          </p>
          <h3 className="heading-section mt-3 text-2xl text-white">{SITE.name}</h3>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            {SITE.slogan}. {SITE.shortDescription}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Navegação</p>
          <ul className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-white/80 transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/politica-privacidade" className="text-white/80 transition hover:text-white">
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Contato</p>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-[color:var(--color-brand-orange)]" />
              {SITE.location} — {SITE.city}
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-[color:var(--color-brand-orange)]" />
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">
                {SITE.whatsappLabel}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[color:var(--color-brand-orange)]" />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li className="flex items-center gap-3">
              <Instagram className="h-4 w-4 text-[color:var(--color-brand-orange)]" />
              @corridadasfamilias
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-white/50 md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} II Corrida das Famílias. Todos os direitos reservados.</p>
          <p>Feito com fé, esporte e família.</p>
        </div>
      </div>
    </footer>
  );
}
