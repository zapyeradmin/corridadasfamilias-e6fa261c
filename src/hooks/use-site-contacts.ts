import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteContacts, type SiteContacts } from "@/lib/public.functions";
import { SITE } from "@/lib/site-config";

const FALLBACK: SiteContacts = {
  local: `${SITE.location} em ${SITE.city}`,
  email_oficial: SITE.email,
  whatsapp_oficial: SITE.whatsapp,
  instagram_url: "https://www.instagram.com/corridadasfamilias",
  instagram_usuario: "corridadasfamilias",
};

function formatWhatsappLabel(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 13) return `(${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
}

export function useSiteContacts() {
  const fetchContacts = useServerFn(getSiteContacts);
  const { data } = useQuery({
    queryKey: ["public", "site-contacts"],
    queryFn: () => fetchContacts(),
    staleTime: 60 * 1000,
  });
  const merged: SiteContacts = {
    local: data?.local || FALLBACK.local,
    email_oficial: data?.email_oficial || FALLBACK.email_oficial,
    whatsapp_oficial: (data?.whatsapp_oficial || FALLBACK.whatsapp_oficial).replace(/\D/g, ""),
    instagram_url: data?.instagram_url || FALLBACK.instagram_url,
    instagram_usuario: (data?.instagram_usuario || FALLBACK.instagram_usuario).replace(/^@+/, ""),
  };
  return {
    contacts: merged,
    whatsappLabel: formatWhatsappLabel(merged.whatsapp_oficial),
    whatsappHref: (text?: string) =>
      `https://wa.me/${merged.whatsapp_oficial}${text ? `?text=${encodeURIComponent(text)}` : ""}`,
  };
}
