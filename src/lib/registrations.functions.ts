import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isValidCpf, normalizeCpf } from "@/lib/cpf";

const GENDER_DB = { male: "M", female: "F", other: "O" } as const;
const SHIRT_DB = { pp: "PP", p: "P", m: "M", g: "G", gg: "GG", xgg: "XGG" } as const;

const registrationSchema = z.object({
  full_name: z.string().min(3).max(120),
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
  email: z.string().email().max(160),
  whatsapp: z.string().min(10).max(20),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  gender: z.enum(["male", "female", "other"]),
  shirt_size: z.enum(["pp", "p", "m", "g", "gg", "xgg"]),
  category: z.enum([
    "geral_masculino",
    "geral_feminino",
    "infanto_juvenil_masculino",
    "infanto_juvenil_feminino",
    "60_masculino",
    "60_feminino",
  ]),
  emergency_contact_name: z.string().min(2).max(120),
  emergency_contact_phone: z.string().min(10).max(20),
  medical_notes: z.string().max(500).optional().nullable(),
  accepted_terms: z.literal(true),
  accepted_lgpd: z.literal(true),
});

function yearsBetween(birthIso: string, refIso: string): number {
  const birth = new Date(birthIso);
  const ref = new Date(refIso);
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;
  return age;
}

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const createRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registrationSchema.parse(input))
  .handler(async ({ data }) => {
    // Buscar evento ativo + lote vigente (servidor recalcula preço)
    const { data: event } = await supabaseAdmin
      .from("events")
      .select("id")
      .eq("is_active", true)
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!event) throw new Error("Nenhum evento ativo no momento.");

    const nowIso = new Date().toISOString();
    const { data: lots } = await supabaseAdmin
      .from("lots")
      .select("id, price_cents")
      .eq("event_id", event.id)
      .eq("is_active", true)
      .lte("starts_at", nowIso)
      .gte("ends_at", nowIso)
      .order("sort_order", { ascending: true })
      .limit(1);
    const lot = lots?.[0];
    if (!lot) throw new Error("Não há lote de inscrições aberto no momento.");

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
      throw new Error(
        existing.status === "paid"
          ? `Este CPF já possui inscrição confirmada (protocolo ${existing.protocol}).`
          : `Já existe uma inscrição em andamento para este CPF (protocolo ${existing.protocol}).`,
      );
    }

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
        amount_cents: lot.price_cents,
      })
      .select("id, protocol, amount_cents")
      .single();
    if (regErr || !registration) throw new Error(regErr?.message ?? "Falha ao criar inscrição.");

    // Mock de checkout — Infinity Pay será integrado nos sprints finais.
    const checkoutUrl = `/inscricao/sucesso?protocol=${registration.protocol}`;

    const { error: payErr } = await supabaseAdmin.from("payments").insert({
      registration_id: registration.id,
      provider: "infinitypay",
      status: "pending",
      amount_cents: registration.amount_cents,
      checkout_url: checkoutUrl,
      external_reference: registration.protocol,
    });
    if (payErr) throw new Error(payErr.message);

    return {
      protocol: registration.protocol,
      amount_cents: registration.amount_cents,
      checkout_url: checkoutUrl,
    };
  });

export const getRegistrationByProtocol = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ protocol: z.string().min(4).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const { data: reg } = await supabaseAdmin
      .from("registrations")
      .select("protocol, full_name, status, amount_cents, created_at")
      .eq("protocol", data.protocol)
      .maybeSingle();
    return reg;
  });
