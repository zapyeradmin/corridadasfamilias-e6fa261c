import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isValidCpf, normalizeCpf } from "@/lib/cpf";
import { sendRegistrationConfirmationEmail } from "@/lib/email.service";

const GENDER_DB = { male: "M", female: "F" } as const;
const SHIRT_DB = { pp: "PP", p: "P", m: "M", g: "G", gg: "GG", xgg: "XGG" } as const;

export const CATEGORY_OPTIONS = [
  "GERAL MASCULINO (IDADE LIVRE)",
  "GERAL FEMININO (IDADE LIVRE)",
  "FAIXA ETÁRIA | 14 A 29 ANOS MASCULINO",
  "FAIXA ETÁRIA | 14 A 29 ANOS FEMININO",
  "FAIXA ETÁRIA | 30 A 39 ANOS MASCULINO",
  "FAIXA ETÁRIA | 30 A 39 ANOS FEMININO",
  "FAIXA ETÁRIA | 40 A 49 ANOS MASCULINO",
  "FAIXA ETÁRIA | 40 A 49 ANOS FEMININO",
  "FAIXA ETÁRIA | 50 A 59 ANOS MASCULINO",
  "FAIXA ETÁRIA | 50 A 59 ANOS FEMININO",
  "FAIXA ETÁRIA | 60+ MASCULINO",
  "FAIXA ETÁRIA | 60+ FEMININO",
  "ATLETAS CORRE+ MASCULINO (IDADE LIVRE)",
  "ATLETAS CORRE+ FEMININO (IDADE LIVRE)",
  "ATLETAS PCD MASCULINO (IDADE LIVRE)",
  "ATLETAS PCD FEMININO (IDADE LIVRE)",
  "SEGURANÇA PÚBLICA MASCULINO (IDADE LIVRE)",
  "SEGURANÇA PÚBLICA FEMININO (IDADE LIVRE)",
] as const;

export type CategoryValue = (typeof CATEGORY_OPTIONS)[number];

const registrationSchema = z.object({
  full_name: z.string().min(3).max(120),
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
  email: z.string().email().max(160),
  whatsapp: z.string().min(10).max(20),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  gender: z.enum(["male", "female"]),
  shirt_size: z.enum(["pp", "p", "m", "g", "gg", "xgg"]),
  category: z.enum(CATEGORY_OPTIONS),
  emergency_contact_name: z.string().min(2).max(120),
  emergency_contact_phone: z.string().min(10).max(20),
  medical_notes: z.string().max(500).optional().nullable(),
  accepted_terms: z.literal(true),
  accepted_lgpd: z.literal(true),
});

function yearsBetween(birthIso: string, refIso: string): number {
  const birth = new Date(birthIso + "T00:00:00");
  const ref = new Date(refIso + "T00:00:00");
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;
  return age;
}

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const createRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registrationSchema.parse(input))
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; protocol: string; amount_cents: number; checkout_url: string }
      | { ok: false; error: string }
    > => {
      const fail = (error: string) => ({ ok: false as const, error });

      // Buscar evento ativo + lote vigente (servidor recalcula preço)
      const { data: event } = await supabaseAdmin
        .from("events")
        .select("id, event_date")
        .eq("is_active", true)
        .order("event_date", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!event) return fail("Nenhum evento ativo no momento.");

      const nowIso = new Date().toISOString();
      const { data: lots } = await supabaseAdmin
        .from("lots")
        .select("id, price_cents, child_price_cents")
        .eq("event_id", event.id)
        .eq("is_active", true)
        .lte("starts_at", nowIso)
        .gte("ends_at", nowIso)
        .order("sort_order", { ascending: true })
        .limit(1);
      const lot = lots?.[0];
      if (!lot) return fail("Não há lote de inscrições aberto no momento.");

      // Preço único para todos os participantes (sem lote infantil)
      const eventRefDate = event.event_date || "2026-12-20";
      const ageAtEvent = yearsBetween(data.birth_date, eventRefDate);
      const amountCents = lot.price_cents;

      // Validações de categoria por idade/gênero considerando data da prova (20/12/2026)
      const g = GENDER_DB[data.gender];
      const cat = data.category;

      // Validação de Gênero
      if (cat.includes("MASCULINO") && g === "F") {
        return fail("Categoria masculina incompatível com o gênero feminino selecionado.");
      }
      if (cat.includes("FEMININO") && g === "M") {
        return fail("Categoria feminina incompatível com o gênero masculino selecionado.");
      }

      // Validações de Faixa Etária na data da prova (20/12/2026)
      if (cat.includes("14 A 29 ANOS") && (ageAtEvent < 14 || ageAtEvent > 29)) {
        return fail(
          `A categoria de Faixa Etária (14 a 29 anos) é exclusiva para atletas dessa idade em 20/12/2026 (sua idade calculada: ${ageAtEvent} anos).`,
        );
      }
      if (cat.includes("30 A 39 ANOS") && (ageAtEvent < 30 || ageAtEvent > 39)) {
        return fail(
          `A categoria de Faixa Etária (30 a 39 anos) é exclusiva para atletas dessa idade em 20/12/2026 (sua idade calculada: ${ageAtEvent} anos).`,
        );
      }
      if (cat.includes("40 A 49 ANOS") && (ageAtEvent < 40 || ageAtEvent > 49)) {
        return fail(
          `A categoria de Faixa Etária (40 a 49 anos) é exclusiva para atletas dessa idade em 20/12/2026 (sua idade calculada: ${ageAtEvent} anos).`,
        );
      }
      if (cat.includes("50 A 59 ANOS") && (ageAtEvent < 50 || ageAtEvent > 59)) {
        return fail(
          `A categoria de Faixa Etária (50 a 59 anos) é exclusiva para atletas dessa idade em 20/12/2026 (sua idade calculada: ${ageAtEvent} anos).`,
        );
      }
      if (cat.includes("60+") && ageAtEvent < 60) {
        return fail(
          `A categoria de Faixa Etária (60+) é exclusiva para atletas com 60 anos ou mais em 20/12/2026 (sua idade calculada: ${ageAtEvent} anos).`,
        );
      }

      // Checagem de duplicidade por CPF + status ativo
      const cpfNorm = normalizeCpf(data.cpf);
      const { data: existing } = await supabaseAdmin
        .from("registrations")
        .select("id, status, protocol")
        .eq("event_id", event.id)
        .eq("cpf_normalized", cpfNorm)
        .in("status", ["pending", "processing", "paid"])
        .maybeSingle();
      if (existing) {
        return fail(
          existing.status === "paid"
            ? `Este CPF já possui inscrição confirmada (protocolo ${existing.protocol}).`
            : `Já existe uma inscrição em andamento para este CPF (protocolo ${existing.protocol}).`,
        );
      }

      const participantType = "adulto";
      const orderNsu = `inscricao_lote1_${crypto.randomUUID()}`;

      const { data: registration, error: regErr } = await supabaseAdmin
        .from("registrations")
        .insert({
          event_id: event.id,
          lot_id: lot.id,
          full_name: data.full_name.trim(),
          cpf: data.cpf,
          cpf_normalized: cpfNorm,
          email: data.email.trim().toLowerCase(),
          whatsapp: data.whatsapp,
          birth_date: data.birth_date,
          gender: GENDER_DB[data.gender],
          shirt_size: SHIRT_DB[data.shirt_size],
          category: data.category,
          emergency_contact_name: data.emergency_contact_name.trim(),
          emergency_contact_phone: data.emergency_contact_phone,
          medical_notes: data.medical_notes?.trim() || null,
          accepted_terms: true,
          accepted_lgpd: true,
          status: "pending",
          amount_cents: amountCents,
          order_nsu: orderNsu,
        })
        .select("id, protocol, amount_cents")
        .single();
      if (regErr || !registration) return fail(regErr?.message ?? "Falha ao criar inscrição.");

      const checkoutUrl = `/inscricao/sucesso?protocol=${registration.protocol}`;

      const { error: payErr } = await supabaseAdmin.from("payments").insert({
        registration_id: registration.id,
        provider: "infinitypay",
        status: "pending",
        amount_cents: registration.amount_cents,
        checkout_url: checkoutUrl,
        external_reference: orderNsu,
      });
      if (payErr) return fail(payErr.message);

      // Envia o e-mail de confirmação de inscrição via Resend (em segundo plano para não travar a resposta)
      sendRegistrationConfirmationEmail({
        to: data.email.trim().toLowerCase(),
        athleteName: data.full_name.trim(),
        protocol: registration.protocol,
      }).catch((err) => {
        console.error("[registrations] Erro no envio de e-mail de confirmação:", err);
      });

      return {
        ok: true,
        protocol: registration.protocol,
        amount_cents: registration.amount_cents,
        checkout_url: checkoutUrl,
      };
    },
  );

export const getRegistrationByProtocol = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ protocol: z.string().min(4).max(40) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: reg } = await supabaseAdmin
      .from("registrations")
      .select("id, protocol, full_name, status, amount_cents, created_at")
      .eq("protocol", data.protocol)
      .maybeSingle();
    if (!reg) return null;

    const { data: pay } = await supabaseAdmin
      .from("payments")
      .select("status, checkout_url, amount_cents")
      .eq("registration_id", reg.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      protocol: reg.protocol,
      full_name: reg.full_name,
      status: reg.status,
      amount_cents: reg.amount_cents,
      created_at: reg.created_at,
      payment: pay
        ? { status: pay.status, checkout_url: pay.checkout_url, amount_cents: pay.amount_cents }
        : null,
    };
  });
