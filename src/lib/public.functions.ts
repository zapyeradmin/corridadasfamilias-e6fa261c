import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type ActiveLot = {
  id: string;
  name: string;
  price_cents: number;
  child_price_cents: number | null;
  starts_at: string;
  ends_at: string;
  max_slots: number | null;
};

export const getActiveEvent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, slug, name, edition, description, event_date, location, city, state")
    .eq("is_active", true)
    .order("event_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!event) return { event: null, currentLot: null as ActiveLot | null };

  const nowIso = new Date().toISOString();
  const { data: lots } = await supabase
    .from("lots")
    .select("id, name, price_cents, child_price_cents, starts_at, ends_at, max_slots")
    .eq("event_id", event.id)
    .eq("is_active", true)
    .lte("starts_at", nowIso)
    .gte("ends_at", nowIso)
    .order("sort_order", { ascending: true })
    .limit(1);

  return { event, currentLot: (lots?.[0] as ActiveLot | undefined) ?? null };
});

export const getPublishedSponsors = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data } = await supabase
    .from("sponsors")
    .select("id, name, logo_url, website_url, tier, sort_order, created_at")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return data ?? [];
});


export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .eq("is_public", true);
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = JSON.stringify(row.value);
  return map;
});

export type CheckoutConfig = {
  nome_produto: string;
  lote: "Lote 1" | "Lote 2" | "Lote 3";
  valor_cents: number;
  checkout_url: string;
  status: "ativo" | "pendente_configuracao";
  updated_at: string | null;
};

export type SiteContacts = {
  local: string;
  email_oficial: string;
  whatsapp_oficial: string;
  instagram_url: string;
  instagram_usuario: string;
};

function pickCheckout(value: unknown, fallbackName: string, fallbackValor: number): Omit<CheckoutConfig, "updated_at"> {
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    if ("nome_produto" in v) {
      const url = typeof v.checkout_url === "string" ? v.checkout_url : "";
      return {
        nome_produto: String(v.nome_produto ?? fallbackName),
        lote: (String(v.lote ?? "Lote 1") as CheckoutConfig["lote"]),
        valor_cents: Number(v.valor_cents ?? fallbackValor) || fallbackValor,
        checkout_url: url,
        status: url ? "ativo" : "pendente_configuracao",
      };
    }
  }
  // legacy: value is a raw url string
  const legacyUrl = typeof value === "string" ? value : "";
  return {
    nome_produto: fallbackName,
    lote: "Lote 1",
    valor_cents: fallbackValor,
    checkout_url: legacyUrl,
    status: legacyUrl ? "ativo" : "pendente_configuracao",
  };
}

export const getCheckoutConfig = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value, updated_at")
    .in("key", [
      "checkout_adulto",
      "checkout_crianca",
      "infinitepay_checkout_adulto_url",
      "infinitepay_checkout_crianca_url",
    ]);
  const rows = data ?? [];
  const findRow = (k: string) => rows.find((r) => r.key === k);
  const adultoRow = findRow("checkout_adulto") ?? findRow("infinitepay_checkout_adulto_url");
  const criancaRow = findRow("checkout_crianca") ?? findRow("infinitepay_checkout_crianca_url");
  const adulto: CheckoutConfig = {
    ...pickCheckout(adultoRow?.value, "Inscrição (Adulto)", 6800),
    updated_at: adultoRow?.updated_at ?? null,
  };
  const crianca: CheckoutConfig = {
    ...pickCheckout(criancaRow?.value, "Inscrição (Criança)", 4800),
    updated_at: criancaRow?.updated_at ?? null,
  };
  return { adulto, crianca };
});

export const getSiteContacts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "site_contacts")
    .maybeSingle();
  const v = (data?.value ?? null) as Record<string, unknown> | null;
  const contacts: SiteContacts = {
    local: typeof v?.local === "string" ? v.local : "",
    email_oficial: typeof v?.email_oficial === "string" ? v.email_oficial : "",
    whatsapp_oficial: typeof v?.whatsapp_oficial === "string" ? v.whatsapp_oficial : "",
    instagram_url: typeof v?.instagram_url === "string" ? v.instagram_url : "",
    instagram_usuario: typeof v?.instagram_usuario === "string" ? v.instagram_usuario : "",
  };
  return contacts;
});

