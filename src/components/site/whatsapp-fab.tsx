import { MessageCircle } from "lucide-react";
import { useSiteContacts } from "@/hooks/use-site-contacts";

export function WhatsAppFab() {
  const { whatsappHref } = useSiteContacts();
  return (
    <a
      href={whatsappHref("Olá! Gostaria de informações sobre a II Corrida das Famílias.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-orange transition hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={2.2} />
    </a>
  );
}
