import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { NAV_LINKS } from "@/lib/site-config";
import { useSiteContacts } from "@/hooks/use-site-contacts";
import logo from "@/assets/logo-corrida.png?w=600&quality=88&format=webp";

export function SiteFooter() {
  const { contacts, whatsappLabel, whatsappHref } = useSiteContacts();
  const igHref =
    contacts.instagram_url || `https://www.instagram.com/${contacts.instagram_usuario}`;
  return (
    <footer className="bg-[#c20505] text-white">
      <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-16 md:grid-cols-3 md:px-8">
        <div>
          <img
            src={logo}
            alt="2ª Corrida Natalina | CORRE+"
            loading="lazy"
            decoding="async"
            width={1247}
            height={385}
            className="-mt-8 h-32 w-auto md:-mt-12 md:h-40"
          />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/90">
            Idealizada pela equipe CORRE+, a 2ª Corrida Natalina tem como objetivo uma experiência
            marcada por movimento, superação, integração e celebração.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">Navegação</p>
          <ul className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-white/90 transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/politica-privacidade"
                className="text-white/90 transition hover:text-white"
              >
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">Contato</p>
          <ul className="mt-4 space-y-3 text-sm text-white/90">
            <li className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white bg-white text-[#c20505] shadow-sm">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <span className="pt-0.5">{contacts.local}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white bg-white text-[#c20505] shadow-sm">
                <MessageCircle className="h-3.5 w-3.5" />
              </span>
              <a href={whatsappHref()} target="_blank" rel="noreferrer" className="hover:underline">
                {whatsappLabel}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white bg-white text-[#c20505] shadow-sm">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <a href={`mailto:${contacts.email_oficial}`} className="hover:underline">
                {contacts.email_oficial}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white bg-white text-[#c20505] shadow-sm">
                <Instagram className="h-3.5 w-3.5" />
              </span>
              <a href={igHref} target="_blank" rel="noreferrer" className="hover:underline">
                @{contacts.instagram_usuario}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-white/80 md:flex-row md:px-8">
          <p>
            © {new Date().getFullYear()} 2ª Corrida Natalina | CORRE+. Todos os direitos reservados.
          </p>
          <p>Feito para celebrar a saúde, união e superação.</p>
        </div>
      </div>
    </footer>
  );
}
