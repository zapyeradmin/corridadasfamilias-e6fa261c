// Webhook InfinitePay — Supabase Edge Function (público, sem JWT).
// URL pública: https://ljquyrrprrwqpmaomwsh.supabase.co/functions/v1/infinitepay-webhook
//
// Replica a lógica de src/routes/api/webhooks/infinitepay.ts para que o
// webhook continue funcionando quando o app for hospedado em SPA (Hostinger
// Web App Node.js), onde server routes do TanStack Start não rodam.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const EXPECTED_AMOUNT: Record<string, number> = { adulto: 6800, crianca: 4800 };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (req.method === "GET") {
    return json({ ok: true, endpoint: "/functions/v1/infinitepay-webhook", method: "POST" });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const p = (raw ?? {}) as Record<string, unknown>;
  const transactionNsu = (p.transaction_nsu as string | null) ?? null;
  const orderNsu = (p.order_nsu as string | null) ?? null;
  const amount = (p.amount as number | null) ?? null;

  // Idempotência
  if (transactionNsu) {
    const { data: existing } = await supabase
      .from("infinitepay_events")
      .select("id")
      .eq("transaction_nsu", transactionNsu)
      .maybeSingle();
    if (existing) return json({ ok: true, duplicated: true });
  }

  let registrationId: string | null = null;
  let participantType: "adulto" | "crianca" | null = null;
  let matchStatus: "matched" | "unmatched" = "unmatched";
  let notes: string | null = null;

  if (orderNsu) {
    const { data: reg } = await supabase
      .from("registrations")
      .select("id, participant_type")
      .eq("order_nsu", orderNsu)
      .maybeSingle();
    if (reg) {
      registrationId = reg.id as string;
      participantType = (reg.participant_type as "adulto" | "crianca" | null) ?? null;
      matchStatus = "matched";
      const expected = participantType ? EXPECTED_AMOUNT[participantType] : null;
      if (expected && amount !== expected) {
        matchStatus = "unmatched";
        notes = `Valor divergente: recebido ${amount}, esperado ${expected}`;
      }
    } else {
      notes = "order_nsu sem inscrição correspondente";
    }
  } else {
    notes = "Pagamento sem order_nsu";
  }

  const { data: eventRow } = await supabase
    .from("infinitepay_events")
    .insert({
      transaction_nsu: transactionNsu,
      order_nsu: orderNsu,
      payload: p as never,
      processed: false,
      match_status: matchStatus,
      registration_id: registrationId,
      notes,
    })
    .select("id")
    .single();

  if (matchStatus === "matched" && registrationId) {
    const nowIso = new Date().toISOString();

    const { data: existingPay } = await supabase
      .from("payments")
      .select("id")
      .eq("registration_id", registrationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const paymentPatch = {
      status: "paid" as const,
      paid_at: nowIso,
      provider: "infinitypay",
      transaction_nsu: transactionNsu,
      invoice_slug: (p.invoice_slug as string | null) ?? null,
      receipt_url: (p.receipt_url as string | null) ?? null,
      capture_method: (p.capture_method as string | null) ?? null,
      installments: (p.installments as number | null) ?? null,
      paid_amount_cents: (p.paid_amount as number | null) ?? amount ?? null,
      external_reference: orderNsu,
      raw_payload: p as never,
    };

    if (existingPay) {
      await supabase.from("payments").update(paymentPatch).eq("id", existingPay.id as string);
    } else {
      await supabase.from("payments").insert({
        registration_id: registrationId,
        amount_cents: amount ?? 0,
        ...paymentPatch,
      });
    }

    await supabase.from("registrations").update({ status: "paid" }).eq("id", registrationId);
    await supabase
      .from("infinitepay_events")
      .update({ processed: true })
      .eq("id", (eventRow as { id: string }).id);
  }

  return json({ ok: true, matched: matchStatus === "matched" });
});
