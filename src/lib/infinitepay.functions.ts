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
    const publicSiteUrl = (
      process.env.PUBLIC_SITE_URL ||
      process.env.VITE_PUBLIC_SITE_URL ||
      "https://corridascorremais.com.br"
    ).replace(/\/+$/, "");

    let checkoutUrl: string | null = null;
    const handle =
      process.env.INFINITEPAY_HANDLE ||
      (await readSettingString("infinitepay_handle")) ||
      "edna-maria-4gu";

    // 1. Tenta gerar via API oficial da InfinitePay (garante order_nsu e webhook_url embutidos)
    if (handle && reg.order_nsu) {
      try {
        const body: Record<string, unknown> = {
          handle,
          order_nsu: reg.order_nsu,
          redirect_url: `${publicSiteUrl}/pagamento?protocol=${reg.protocol}`,
          webhook_url: `${publicSiteUrl}/api/webhooks/infinitepay`,
          items: [
            {
              quantity: 1,
              price: reg.amount_cents || 8360,
              description: "Inscrição 2ª Corrida Natalina | Corre +",
            },
          ],
        };
        if (reg.full_name || reg.email) {
          const customer: Record<string, string> = {};
          if (reg.full_name) customer.name = reg.full_name;
          if (reg.email) customer.email = reg.email;
          if (reg.whatsapp) {
            const cleanPhone = reg.whatsapp.replace(/\D/g, "");
            if (cleanPhone) customer.phone_number = `+${cleanPhone}`;
          }
          body.customer = customer;
        }

        const res = await fetch("https://api.checkout.infinitepay.io/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(4000),
        });

        if (res.ok) {
          const json = (await res.json()) as { url?: string };
          if (json.url) {
            checkoutUrl = json.url;
          }
        }
      } catch (err) {
        console.warn("Falha ao gerar link dinâmico InfinitePay, usando fallback:", err);
      }
    }

    // 2. Fallback para URL estática cadastrada
    if (!checkoutUrl) {
      const baseUrl =
        (await readSettingString(SETTING_ADULTO)) ||
        (await readSettingString("checkout_adulto")) ||
        "https://checkout.infinitepay.io/edna-maria-4gu/N21HTRtmjN";

      if (baseUrl) {
        try {
          const url = new URL(baseUrl);
          if (reg.order_nsu) url.searchParams.set("order_nsu", reg.order_nsu);
          url.searchParams.set("redirect_url", `${publicSiteUrl}/pagamento?protocol=${reg.protocol}`);
          url.searchParams.set("success_url", `${publicSiteUrl}/sucesso?protocol=${reg.protocol}`);

          if (reg.full_name) url.searchParams.set("customer_name", reg.full_name);
          if (reg.email) url.searchParams.set("customer_email", reg.email);
          if (reg.whatsapp)
            url.searchParams.set("customer_cellphone", reg.whatsapp.replace(/\D/g, ""));
          checkoutUrl = url.toString();
        } catch {
          checkoutUrl = baseUrl;
        }
      }
    }

    return {
      ok: true as const,
      participantType: (reg.participant_type ?? "adulto") as "adulto" | "crianca",
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
