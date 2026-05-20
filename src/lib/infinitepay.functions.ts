import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SETTING_ADULTO = "infinitepay_checkout_adulto_url";
const SETTING_CRIANCA = "infinitepay_checkout_crianca_url";

async function readSettingString(key: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  const v = (data?.value ?? "") as unknown;
  return typeof v === "string" ? v.trim() : "";
}

export const getCheckoutUrlForRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ protocol: z.string().min(4).max(40) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: reg } = await supabaseAdmin
      .from("registrations")
      .select(
        "id, protocol, participant_type, amount_cents, status, order_nsu, full_name, email, whatsapp",
      )
      .eq("protocol", data.protocol)
      .maybeSingle();
    if (!reg) {
      return { ok: false as const, error: "Inscrição não encontrada." };
    }
    const type = (reg.participant_type ?? "adulto") as "adulto" | "crianca";
    const key = type === "crianca" ? SETTING_CRIANCA : SETTING_ADULTO;
    const baseUrl = await readSettingString(key);

    let checkoutUrl: string | null = null;
    if (baseUrl) {
      try {
        const url = new URL(baseUrl);
        if (reg.order_nsu) url.searchParams.set("order_nsu", reg.order_nsu);
        const publicSiteUrl = (
          process.env.PUBLIC_SITE_URL ||
          process.env.VITE_PUBLIC_SITE_URL ||
          "https://www.corridadasfamilias.com.br"
        ).replace(/\/+$/, "");
        url.searchParams.set(
          "redirect_url",
          `${publicSiteUrl}/pagamento?protocol=${reg.protocol}`,
        );

        if (reg.full_name) url.searchParams.set("customer_name", reg.full_name);
        if (reg.email) url.searchParams.set("customer_email", reg.email);
        if (reg.whatsapp)
          url.searchParams.set(
            "customer_cellphone",
            reg.whatsapp.replace(/\D/g, ""),
          );
        checkoutUrl = url.toString();
      } catch {
        checkoutUrl = baseUrl;
      }
    }

    return {
      ok: true as const,
      participantType: type,
      amountCents: reg.amount_cents,
      checkoutUrl,
      status: reg.status,
    };
  });

export const checkPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ protocol: z.string().min(4).max(40) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: reg } = await supabaseAdmin
      .from("registrations")
      .select("id, protocol, status")
      .eq("protocol", data.protocol)
      .maybeSingle();
    if (!reg) return { found: false as const };

    const { data: pay } = await supabaseAdmin
      .from("payments")
      .select("status, paid_at, transaction_nsu, receipt_url, capture_method")
      .eq("registration_id", reg.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      found: true as const,
      registrationStatus: reg.status,
      payment: pay
        ? {
            status: pay.status,
            paidAt: pay.paid_at,
            transactionNsu: pay.transaction_nsu,
            receiptUrl: pay.receipt_url,
            captureMethod: pay.capture_method,
          }
        : null,
    };
  });
