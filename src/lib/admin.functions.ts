import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type RegistrationStatus = "pending" | "processing" | "paid" | "canceled" | "refunded";

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
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });
    const { data, error } = await context.supabase
      .from("sponsors")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
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
