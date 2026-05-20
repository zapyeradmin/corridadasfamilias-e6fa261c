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
