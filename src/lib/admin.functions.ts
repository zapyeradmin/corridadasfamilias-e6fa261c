import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type RegistrationStatus = "pending" | "processing" | "paid" | "canceled" | "refunded";
type SponsorTier = "diamond" | "gold" | "silver" | "standard";

async function assertAdmin(supabase: SupabaseClient<Database>, userId: string, claims: { email?: string }) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
  return { userId, email: claims.email ?? null };
}

async function logAction(
  supabase: SupabaseClient<Database>,
  args: {
  actorId: string;
  actorEmail: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  await supabase.from("access_logs").insert({
    actor_id: args.actorId,
    actor_email: args.actorEmail,
    action: args.action,
    entity_type: args.entityType ?? null,
    entity_id: args.entityId ?? null,
    details: (args.details ?? {}) as never,
  });
}

export const getCurrentUserRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return {
      userId: context.userId,
      email: (context.claims as { email?: string }).email ?? null,
      roles: (data ?? []).map((r) => r.role),
    };
  });

export const getDashboardKPIs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });

    const [regsRes, paymentsRes, recentRes, lotsRes] = await Promise.all([
      context.supabase.from("registrations").select("status, amount_cents"),
      context.supabase.from("payments").select("status, amount_cents, paid_at"),
      context.supabase
        .from("registrations")
        .select("id, protocol, full_name, status, amount_cents, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      context.supabase.from("lots").select("id, name, price_cents"),
    ]);

    const regs = regsRes.data ?? [];
    const payments = paymentsRes.data ?? [];

    const byStatus: Record<string, number> = {};
    for (const r of regs) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;

    // Receita confirmada = soma das INSCRIÇÕES com status = 'paid' (fonte de verdade).
    const revenueCents = regs
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + (r.amount_cents ?? 0), 0);

    return {
      totalRegistrations: regs.length,
      byStatus,
      revenueCents,
      paymentsPaid: payments.filter((p) => p.status === "paid").length,
      paymentsPending: payments.filter((p) => p.status === "pending").length,
      lotCount: (lotsRes.data ?? []).length,
      recent: recentRes.data ?? [],
    };
  });

export const listRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z.string().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(25),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    let query = context.supabase
      .from("registrations")
      .select(
        "id, protocol, full_name, email, whatsapp, cpf, category, shirt_size, status, amount_cents, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data.status && data.status !== "all") {
      query = query.eq("status", data.status as RegistrationStatus);
    }
    if (data.search && data.search.trim()) {
      const s = `%${data.search.trim()}%`;
      query = query.or(`full_name.ilike.${s},email.ilike.${s},protocol.ilike.${s},cpf.ilike.${s}`);
    }

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], total: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

export const getRegistrationDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data: reg, error } = await context.supabase
      .from("registrations")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!reg) throw new Error("Inscrição não encontrada.");
    const { data: payments } = await context.supabase
      .from("payments")
      .select("*")
      .eq("registration_id", data.id)
      .order("created_at", { ascending: false });
    return { registration: reg, payments: payments ?? [] };
  });

export const updateRegistrationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "processing", "paid", "canceled", "refunded"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { error } = await context.supabase
      .from("registrations")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    // Sincroniza pagamentos vinculados para refletir o status da inscrição.
    const paymentPatch: { status: typeof data.status; paid_at?: string | null } = {
      status: data.status,
    };
    if (data.status === "paid") {
      paymentPatch.paid_at = new Date().toISOString();
    } else {
      paymentPatch.paid_at = null;
    }
    const { error: payErr } = await context.supabase
      .from("payments")
      .update(paymentPatch)
      .eq("registration_id", data.id);
    if (payErr) throw new Error(payErr.message);

    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "registration.update_status",
      entityType: "registration",
      entityId: data.id,
      details: { status: data.status },
    });
    return { ok: true };
  });

export const simulatePaymentApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ protocol: z.string().min(4) }).parse(input))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data: reg } = await context.supabase
      .from("registrations")
      .select("id")
      .eq("protocol", data.protocol)
      .maybeSingle();
    if (!reg) throw new Error("Protocolo não encontrado.");
    const nowIso = new Date().toISOString();
    await context.supabase.from("registrations").update({ status: "paid" }).eq("id", reg.id);
    await context.supabase
      .from("payments")
      .update({ status: "paid", paid_at: nowIso })
      .eq("registration_id", reg.id);
    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "payment.simulate_approval",
      entityType: "registration",
      entityId: reg.id,
      details: { protocol: data.protocol },
    });
    return { ok: true };
  });

export const listPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z.string().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(25),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let query = context.supabase
      .from("payments")
      .select(
        "id, status, amount_cents, provider, external_reference, paid_at, created_at, registration_id, registrations!inner(full_name, cpf, cpf_normalized)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data.status && data.status !== "all") {
      query = query.eq("status", data.status as never);
    }
    if (data.search && data.search.trim()) {
      const raw = data.search.trim();
      const orParts = [`full_name.ilike.%${raw}%`];
      const digits = raw.replace(/\D/g, "");
      if (digits) orParts.push(`cpf_normalized.ilike.%${digits}%`);
      query = query.or(orParts.join(","), { referencedTable: "registrations" });
    }
    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], total: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

export const listEventsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data: events } = await context.supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    const { data: lots } = await context.supabase
      .from("lots")
      .select("*")
      .order("sort_order", { ascending: true });
    return { events: events ?? [], lots: lots ?? [] };
  });

export const listSponsorsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().optional(),
        tier: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(8),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let query = context.supabase
      .from("sponsors")
      .select("*", { count: "exact" })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data.tier && data.tier !== "all") {
      query = query.eq("tier", data.tier);
    }
    if (data.search && data.search.trim()) {
      query = query.ilike("name", `%${data.search.trim()}%`);
    }
    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], total: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

export const getSponsorAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data: row, error } = await context.supabase
      .from("sponsors")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Patrocinador não encontrado.");
    return row;
  });

const sponsorMutationSchema = z.object({
  name: z.string().trim().min(1).max(180),
  tier: z.enum(["diamond", "gold", "silver"]),
  website_url: z
    .string()
    .trim()
    .max(500)
    .url("Link inválido. Inclua https://")
    .nullable()
    .optional(),
  logo_url: z.string().trim().url().max(1000),
});

export const createSponsor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => sponsorMutationSchema.parse(input))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data: row, error } = await context.supabase
      .from("sponsors")
      .insert({
        name: data.name,
        tier: data.tier as SponsorTier,
        website_url: data.website_url ?? null,
        logo_url: data.logo_url,
        is_published: true,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "sponsor.create",
      entityType: "sponsor",
      entityId: row.id,
      details: { name: data.name, tier: data.tier },
    });
    return { ok: true, id: row.id };
  });

export const updateSponsor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    sponsorMutationSchema
      .partial()
      .extend({ id: z.string().uuid() })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { id, ...rest } = data;
    const patch: Database["public"]["Tables"]["sponsors"]["Update"] = {
      updated_at: new Date().toISOString(),
    };
    if (rest.name !== undefined) patch.name = rest.name;
    if (rest.tier !== undefined) patch.tier = rest.tier;
    if (rest.website_url !== undefined) patch.website_url = rest.website_url ?? null;
    if (rest.logo_url !== undefined) patch.logo_url = rest.logo_url;
    const { error } = await context.supabase.from("sponsors").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "sponsor.update",
      entityType: "sponsor",
      entityId: id,
      details: patch,
    });
    return { ok: true };
  });

export const deleteSponsor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data: existing } = await context.supabase
      .from("sponsors")
      .select("logo_url")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await context.supabase.from("sponsors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    // Best-effort cleanup of the storage object if it lives in our bucket.
    if (existing?.logo_url) {
      const marker = "/storage/v1/object/public/sponsors/";
      const idx = existing.logo_url.indexOf(marker);
      if (idx >= 0) {
        const path = existing.logo_url.slice(idx + marker.length);
        await supabaseAdmin.storage.from("sponsors").remove([path]).catch(() => undefined);
      }
    }
    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "sponsor.delete",
      entityType: "sponsor",
      entityId: data.id,
    });
    return { ok: true };
  });

export const uploadSponsorLogo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        filename: z.string().min(1).max(200),
        contentType: z.enum(["image/png", "image/webp", "image/jpeg", "image/jpg"]),
        dataBase64: z.string().min(10),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const bytes = Buffer.from(data.dataBase64, "base64");
    if (bytes.byteLength > 2 * 1024 * 1024) {
      throw new Error("Arquivo excede 2 MB.");
    }
    const ext = data.contentType === "image/png" ? "png" : data.contentType === "image/webp" ? "webp" : "jpg";
    const safeBase = data.filename
      .replace(/\.[a-zA-Z0-9]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "sponsor";
    const path = `${safeBase}-${Date.now()}.${ext}`;
    const ct = data.contentType === "image/jpg" ? "image/jpeg" : data.contentType;
    const { error } = await supabaseAdmin.storage
      .from("sponsors")
      .upload(path, bytes, { contentType: ct, upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("sponsors").getPublicUrl(path);
    return { publicUrl: pub.publicUrl, path };
  });


export const listSettingsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data, error } = await context.supabase
      .from("settings")
      .select("*")
      .order("key", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateSettingAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        key: z.string().min(1).max(120),
        value: z.unknown(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data: rows, error } = await context.supabase
      .from("settings")
      .upsert(
        {
          key: data.key,
          value: data.value as never,
          is_public: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      )
      .select("key");
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) {
      throw new Error("Não foi possível salvar a configuração (nenhuma linha afetada).");
    }
    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "settings.update",
      entityType: "settings",
      entityId: data.key,
      details: { key: data.key },
    });
    return { ok: true };
  });

export const listAccessLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data, error } = await context.supabase
      .from("access_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ─────────────────────────────────────────────────────────
// Checkout config (Adulto / Criança) — persisted in `settings`
// ─────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  tipo: z.enum(["adulto", "crianca"]),
  nome_produto: z.string().trim().min(1).max(160),
  lote: z.enum(["Lote 1", "Lote 2", "Lote 3"]),
  valor_cents: z.number().int().min(0).max(10_000_000),
  checkout_url: z.string().trim().max(1000).url().or(z.literal("")),
});

export const updateCheckoutConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const key = data.tipo === "crianca" ? "checkout_crianca" : "checkout_adulto";
    const value = {
      nome_produto: data.nome_produto,
      lote: data.lote,
      valor_cents: data.valor_cents,
      checkout_url: data.checkout_url,
      status: data.checkout_url ? "ativo" : "pendente_configuracao",
    };
    const { error } = await context.supabase.from("settings").upsert(
      { key, value: value as never, is_public: true, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    // Mirror to legacy keys so existing infinitepay.functions readers continue working.
    const legacyKey = data.tipo === "crianca" ? "infinitepay_checkout_crianca_url" : "infinitepay_checkout_adulto_url";
    await context.supabase.from("settings").upsert(
      { key: legacyKey, value: data.checkout_url as never, is_public: true, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "checkout.update",
      entityType: "settings",
      entityId: key,
      details: value,
    });
    return { ok: true };
  });

// ─────────────────────────────────────────────────────────
// Contatos oficiais do site — `site_contacts` setting
// ─────────────────────────────────────────────────────────

const contactsSchema = z.object({
  local: z.string().trim().max(200).default(""),
  email_oficial: z.string().trim().email("E-mail inválido").max(160),
  whatsapp_oficial: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 13, "WhatsApp inválido"),
  instagram_url: z.string().trim().url("URL inválida").max(300).or(z.literal("")),
  instagram_usuario: z.string().trim().max(60).default(""),
});

export const updateSiteContacts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => contactsSchema.parse(input))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const value = {
      local: data.local,
      email_oficial: data.email_oficial,
      whatsapp_oficial: data.whatsapp_oficial.replace(/\D/g, ""),
      instagram_url: data.instagram_url,
      instagram_usuario: data.instagram_usuario.replace(/^@+/, ""),
    };
    const { error } = await context.supabase.from("settings").upsert(
      { key: "site_contacts", value: value as never, is_public: true, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "contacts.update",
      entityType: "settings",
      entityId: "site_contacts",
      details: value,
    });
    return { ok: true };
  });

// ─────────────────────────────────────────────────────────
// Gerenciamento de usuários (Supabase Auth + user_roles)
// ─────────────────────────────────────────────────────────

type AppRole = "admin" | "staff";

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .max(72);

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);
    const { data: roles } = await context.supabase.from("user_roles").select("user_id, role");
    const roleByUser = new Map<string, AppRole>();
    for (const r of roles ?? []) roleByUser.set(r.user_id, r.role as AppRole);
    return list.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      full_name: ((u.user_metadata ?? {}) as { full_name?: string }).full_name ?? "",
      role: (roleByUser.get(u.id) ?? "staff") as AppRole,
      created_at: u.created_at,
    }));
  });

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        full_name: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(160),
        password: passwordSchema,
        role: z.enum(["admin", "staff"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Falha ao criar usuário.");
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: data.role });
    if (roleErr) throw new Error(roleErr.message);
    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "user.create",
      entityType: "user",
      entityId: created.user.id,
      details: { email: data.email, role: data.role },
    });
    return { ok: true, id: created.user.id };
  });

export const updateAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        full_name: z.string().trim().min(2).max(120).optional(),
        email: z.string().trim().email().max(160).optional(),
        password: passwordSchema.optional(),
        role: z.enum(["admin", "staff"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const patch: { email?: string; password?: string; user_metadata?: Record<string, unknown> } = {};
    if (data.email) patch.email = data.email;
    if (data.password) patch.password = data.password;
    if (data.full_name) patch.user_metadata = { full_name: data.full_name };
    if (Object.keys(patch).length > 0) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, patch);
      if (error) throw new Error(error.message);
    }
    if (data.role) {
      // Bloqueia rebaixar-se a si próprio se for o último admin
      if (data.id === admin.userId && data.role !== "admin") {
        const { count } = await supabaseAdmin
          .from("user_roles")
          .select("user_id", { count: "exact", head: true })
          .eq("role", "admin");
        if ((count ?? 0) <= 1) throw new Error("Você é o último administrador. Promova outro usuário antes.");
      }
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id);
      const { error: insErr } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.id, role: data.role });
      if (insErr) throw new Error(insErr.message);
    }
    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "user.update",
      entityType: "user",
      entityId: data.id,
      details: { fields: Object.keys(data).filter((k) => k !== "id") },
    });
    return { ok: true };
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    if (data.id === admin.userId) throw new Error("Você não pode excluir a si mesmo.");
    // Não permitir excluir o último admin
    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.id);
    const isAdminTarget = (targetRoles ?? []).some((r) => r.role === "admin");
    if (isAdminTarget) {
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) throw new Error("Não é possível excluir o último administrador.");
    }
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);
    await logAction(context.supabase, {
      actorId: admin.userId,
      actorEmail: admin.email,
      action: "user.delete",
      entityType: "user",
      entityId: data.id,
    });
    return { ok: true };
  });
