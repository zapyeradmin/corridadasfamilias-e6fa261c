import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Webhook InfinitePay (público).
 * POST /api/webhooks/infinitepay
 *
 * Sempre grava o evento em `infinitepay_events` (auditoria + idempotência).
 * Só marca a inscrição como `paid` quando há match por `order_nsu`,
 * o valor bate com o tipo de participante e o payload é válido.
 */

const payloadSchema = z
  .object({
    invoice_slug: z.string().optional().nullable(),
    amount: z.number().int().optional().nullable(),
    paid_amount: z.number().int().optional().nullable(),
    installments: z.number().int().optional().nullable(),
    capture_method: z.string().optional().nullable(),
    transaction_nsu: z.string().optional().nullable(),
    order_nsu: z.string().optional().nullable(),
    receipt_url: z.string().optional().nullable(),
    items: z
      .array(
        z.object({
          quantity: z.number().optional(),
          price: z.number().optional(),
          description: z.string().optional(),
        }),
      )
      .optional(),
  })
  .passthrough();

const EXPECTED_AMOUNT = { adulto: 6800, crianca: 4800 } as const;

export const Route = createFileRoute("/api/webhooks/infinitepay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = payloadSchema.safeParse(raw);
        if (!parsed.success) {
          // Mesmo assim grava bruto para auditoria
          await supabaseAdmin.from("infinitepay_events").insert({
            payload: raw as never,
            processed: false,
            match_status: "unmatched",
            notes: "Payload inválido",
          });
          return new Response(JSON.stringify({ error: "Invalid payload" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const p = parsed.data;
        const transactionNsu = p.transaction_nsu ?? null;
        const orderNsu = p.order_nsu ?? null;
        const amount = p.amount ?? null;

        // Idempotência: se já existe evento com esse transaction_nsu, responde 200
        if (transactionNsu) {
          const { data: existing } = await supabaseAdmin
            .from("infinitepay_events")
            .select("id, processed")
            .eq("transaction_nsu", transactionNsu)
            .maybeSingle();
          if (existing) {
            return new Response(
              JSON.stringify({ ok: true, duplicated: true }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          }
        }

        // Tenta casar com a inscrição via order_nsu
        let registrationId: string | null = null;
        let participantType: "adulto" | "crianca" | null = null;
        let matchStatus: "matched" | "unmatched" = "unmatched";
        let notes: string | null = null;

        if (orderNsu) {
          const { data: reg } = await supabaseAdmin
            .from("registrations")
            .select("id, participant_type, status")
            .eq("order_nsu", orderNsu)
            .maybeSingle();
          if (reg) {
            registrationId = reg.id;
            participantType =
              (reg.participant_type as "adulto" | "crianca" | null) ?? null;
            matchStatus = "matched";

            const expected = participantType
              ? EXPECTED_AMOUNT[participantType]
              : null;
            if (expected && amount !== expected) {
              matchStatus = "unmatched";
              notes = `Valor divergente: recebido ${amount}, esperado ${expected}`;
            }
          } else {
            notes = "order_nsu sem inscrição correspondente";
          }
        } else {
          notes = "Pagamento sem order_nsu (checkout estático)";
        }

        // Grava o evento (auditoria)
        const { data: eventRow } = await supabaseAdmin
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

        // Se casou e valor confere, marca como pago
        if (matchStatus === "matched" && registrationId) {
          const nowIso = new Date().toISOString();

          // Atualiza/cria payment vinculado
          const { data: existingPay } = await supabaseAdmin
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
            invoice_slug: p.invoice_slug ?? null,
            receipt_url: p.receipt_url ?? null,
            capture_method: p.capture_method ?? null,
            installments: p.installments ?? null,
            paid_amount_cents: p.paid_amount ?? amount ?? null,
            external_reference: orderNsu,
            raw_payload: p as never,
          };

          if (existingPay) {
            await supabaseAdmin
              .from("payments")
              .update(paymentPatch)
              .eq("id", existingPay.id);
          } else {
            await supabaseAdmin.from("payments").insert({
              registration_id: registrationId,
              amount_cents: amount ?? 0,
              ...paymentPatch,
            });
          }

          await supabaseAdmin
            .from("registrations")
            .update({ status: "paid" })
            .eq("id", registrationId);

          await supabaseAdmin
            .from("infinitepay_events")
            .update({ processed: true })
            .eq("id", eventRow!.id);
        }

        return new Response(
          JSON.stringify({ ok: true, matched: matchStatus === "matched" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      // Health-check simples
      GET: async () => {
        return new Response(
          JSON.stringify({
            ok: true,
            endpoint: "/api/webhooks/infinitepay",
            method: "POST",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
