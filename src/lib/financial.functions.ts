import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type RevenueType =
  | "Patrocínio Diamante"
  | "Patrocínio Ouro"
  | "Patrocínio Prata"
  | "Doação"
  | "Outro Recebimento";

export type ReceiptType =
  | "Pagamento a Vista"
  | "Pagamento Parcelado"
  | "Pagamento a Receber";

export type FinancialStatus =
  | "Pago"
  | "Pago Parcela"
  | "Pendente"
  | "Em Atraso";

export type ExpensePaymentType =
  | "Pagamento a Vista"
  | "Pagamento Parcelado"
  | "Pago ao Receber";

export interface FinancialRevenue {
  id: string;
  type: RevenueType;
  payer_name: string;
  amount_cents: number;
  paid_amount_cents: number;
  whatsapp: string;
  receipt_type: ReceiptType;
  receipt_date: string; // YYYY-MM-DD
  status: FinancialStatus;
  received_by: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialExpense {
  id: string;
  expense_type: string;
  paid_to: string;
  amount_cents: number;
  paid_amount_cents: number;
  whatsapp: string;
  payment_type: ExpensePaymentType;
  payment_date: string; // YYYY-MM-DD
  status: FinancialStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

async function assertAdmin(
  supabase: SupabaseClient<Database>,
  userId: string,
  claims: { email?: string },
) {
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

// Helpers para ler e gravar em settings
async function getSettingsJson<T>(key: string, defaultValue: T): Promise<T> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) {
    console.error(`Erro ao carregar settings key ${key}:`, error);
    return defaultValue;
  }
  if (!data || data.value === null || data.value === undefined) {
    return defaultValue;
  }
  return data.value as unknown as T;
}

async function setSettingsJson<T>(key: string, value: T): Promise<void> {
  const { error } = await supabaseAdmin.from("settings").upsert(
    {
      key,
      value: value as any,
      is_public: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) {
    console.error(`Erro ao salvar settings key ${key}:`, error);
    throw new Error(`Falha ao persistir ${key}: ${error.message}`);
  }
}

// 1. Dashboard Financeiro Completo (Tabs 1, 2, 3 e 4)
export const getFinancialDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });

    const [regsRes, revenues, expenses] = await Promise.all([
      supabaseAdmin
        .from("registrations")
        .select("id, status, amount_cents, created_at"),
      getSettingsJson<FinancialRevenue[]>("financial_revenues", []),
      getSettingsJson<FinancialExpense[]>("financial_expenses", []),
    ]);

    const regs = regsRes.data ?? [];
    const today = new Date().toISOString().slice(0, 10);

    // Inscrições de atletas (inscrições do Lote 1 mantêm o valor cadastrado e novas somam R$ 96,00)
    const inscricoesPagasList = regs.filter((r) => r.status === "paid");
    const inscricoesPendentesList = regs.filter(
      (r) => r.status === "pending" || r.status === "processing",
    );
    const inscricoesPagasCents = inscricoesPagasList.reduce(
      (sum, r) => sum + (r.amount_cents && r.amount_cents > 0 ? r.amount_cents : 9600),
      0,
    );
    const inscricoesPendentesCents = inscricoesPendentesList.reduce(
      (sum, r) => sum + (r.amount_cents && r.amount_cents > 0 ? r.amount_cents : 9600),
      0,
    );

    // Receitas adicionadas manualmente
    let patrociniosPagosCents = 0;
    let patrociniosPendentesCents = 0;
    let outrosRecebidosPagosCents = 0;
    let outrosRecebidosPendentesCents = 0;

    for (const rev of revenues) {
      const isSponsorship = rev.type.startsWith("Patrocínio");
      let paid = 0;
      let pending = 0;

      if (rev.status === "Pago") {
        paid = rev.amount_cents;
      } else if (rev.status === "Pago Parcela") {
        paid = rev.paid_amount_cents || 0;
        pending = Math.max(0, rev.amount_cents - paid);
      } else {
        // "Pendente" ou "Em Atraso"
        pending = rev.amount_cents;
      }

      if (isSponsorship) {
        patrociniosPagosCents += paid;
        patrociniosPendentesCents += pending;
      } else {
        outrosRecebidosPagosCents += paid;
        outrosRecebidosPendentesCents += pending;
      }
    }

    // Despesas adicionadas manualmente
    let despesasPagasCents = 0;
    let despesasPendentesCents = 0;
    let despesasTotalCents = 0;

    for (const exp of expenses) {
      despesasTotalCents += exp.amount_cents;
      let paid = 0;
      let pending = 0;

      if (exp.status === "Pago") {
        paid = exp.amount_cents;
      } else if (exp.status === "Pago Parcela") {
        paid = exp.paid_amount_cents || 0;
        pending = Math.max(0, exp.amount_cents - paid);
      } else {
        pending = exp.amount_cents;
      }

      despesasPagasCents += paid;
      despesasPendentesCents += pending;
    }

    // 5. Valores a Receber: Inscrições Pendentes + Patrocínios Pendentes + Outras Receitas Pendentes
    const valoresAReceberCents =
      inscricoesPendentesCents + patrociniosPendentesCents + outrosRecebidosPendentesCents;

    // 6. Receita Bruta: Inscrições Pagas + Patrocínios Pagos + Outros Recebidos Pagos
    const receitaBrutaCents =
      inscricoesPagasCents + patrociniosPagosCents + outrosRecebidosPagosCents;

    // 7. Receita Líquida: Receita Bruta - Despesas Pagas
    const receitaLiquidaCents = receitaBrutaCents - despesasPagasCents;

    // 8. Gráfico Comparativo "Recebidos vs A Receber"
    const comparisonChartData = [
      {
        categoria: "Inscrições Atletas",
        recebidos: inscricoesPagasCents / 100,
        aReceber: inscricoesPendentesCents / 100,
      },
      {
        categoria: "Patrocínios",
        recebidos: patrociniosPagosCents / 100,
        aReceber: patrociniosPendentesCents / 100,
      },
      {
        categoria: "Outras Receitas",
        recebidos: outrosRecebidosPagosCents / 100,
        aReceber: outrosRecebidosPendentesCents / 100,
      },
      {
        categoria: "Total Consolidado",
        recebidos: receitaBrutaCents / 100,
        aReceber: valoresAReceberCents / 100,
      },
    ];

    // KPIs Tab 4
    const totalInscricoesCount = regs.length;
    const pagasCount = inscricoesPagasList.length;
    const pendentesCount = inscricoesPendentesList.length;

    const taxaConversao =
      totalInscricoesCount > 0
        ? Number(((pagasCount / totalInscricoesCount) * 100).toFixed(1))
        : 0;

    // Ticket Médio atualizado para R$ 96,00 (valor vigente por atleta no Lote 2)
    const ticketMedioCents = 9600;

    const cacCents =
      pagasCount > 0 ? Math.round(despesasPagasCents / pagasCount) : 0;

    const ltvCents =
      pagasCount > 0 ? Math.round(receitaBrutaCents / pagasCount) : 0;

    // Previsibilidade: Receita já confirmada + conversão histórica dos pendentes
    const previsibilidadeReceitaCents =
      receitaBrutaCents + Math.round((valoresAReceberCents * (taxaConversao || 90)) / 100);

    return {
      // Tab 1: Saúde Financeira
      inscricoesPagasCents,
      inscricoesPendentesCents,
      patrociniosPagosCents,
      patrociniosPendentesCents,
      outrosRecebidosPagosCents,
      outrosRecebidosPendentesCents,
      valoresAReceberCents,
      receitaBrutaCents,
      receitaLiquidaCents,
      comparisonChartData,

      // Despesas
      despesasPagasCents,
      despesasPendentesCents,
      despesasTotalCents,

      // Contagens
      totalInscricoesCount,
      pagasCount,
      pendentesCount,

      // Tab 4: KPIs
      taxaConversao,
      ticketMedioCents,
      cacCents,
      ltvCents,
      previsibilidadeReceitaCents,

      // Listas brutas
      revenues,
      expenses,
      today,
    };
  });

// 2. Salvar Nova Receita ou Atualizar
export const saveRevenueAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().optional(),
        type: z.enum([
          "Patrocínio Diamante",
          "Patrocínio Ouro",
          "Patrocínio Prata",
          "Doação",
          "Outro Recebimento",
        ]),
        payer_name: z.string().min(2, "Nome do pagante é obrigatório"),
        amount_cents: z.number().int().min(1, "Valor deve ser maior que zero"),
        paid_amount_cents: z.number().int().min(0).default(0),
        whatsapp: z.string().default(""),
        receipt_type: z.enum([
          "Pagamento a Vista",
          "Pagamento Parcelado",
          "Pagamento a Receber",
        ]),
        receipt_date: z.string(),
        status: z.enum(["Pago", "Pago Parcela", "Pendente", "Em Atraso"]),
        received_by: z.string().default(""),
        notes: z.string().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });

    const revenues = await getSettingsJson<FinancialRevenue[]>("financial_revenues", []);
    const now = new Date().toISOString();

    let computedStatus = data.status;
    let computedPaidAmount = data.paid_amount_cents;

    if (computedStatus === "Pago") {
      computedPaidAmount = data.amount_cents;
    } else if (computedStatus === "Pago Parcela") {
      if (computedPaidAmount >= data.amount_cents) {
        computedStatus = "Pago";
        computedPaidAmount = data.amount_cents;
      }
    } else if (computedStatus === "Pendente") {
      computedPaidAmount = 0;
      // Se a data do recebimento for anterior a hoje, marca como Em Atraso
      const today = now.slice(0, 10);
      if (data.receipt_date && data.receipt_date < today) {
        computedStatus = "Em Atraso";
      }
    }

    if (data.id) {
      const idx = revenues.findIndex((r) => r.id === data.id);
      if (idx >= 0) {
        revenues[idx] = {
          ...revenues[idx],
          ...data,
          status: computedStatus,
          paid_amount_cents: computedPaidAmount,
          updated_at: now,
        };
      } else {
        revenues.unshift({
          ...data,
          id: data.id,
          status: computedStatus,
          paid_amount_cents: computedPaidAmount,
          created_at: now,
          updated_at: now,
        });
      }
    } else {
      const newId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      revenues.unshift({
        ...data,
        id: newId,
        status: computedStatus,
        paid_amount_cents: computedPaidAmount,
        created_at: now,
        updated_at: now,
      });
    }

    await setSettingsJson("financial_revenues", revenues);
    return { success: true };
  });

// 3. Registrar Pagamento em Receita
export const registerRevenuePaymentAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        additional_paid_cents: z.number().int().min(1),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });

    const revenues = await getSettingsJson<FinancialRevenue[]>("financial_revenues", []);
    const idx = revenues.findIndex((r) => r.id === data.id);
    if (idx < 0) throw new Error("Receita não encontrada.");

    const rev = revenues[idx];
    const newPaid = (rev.paid_amount_cents || 0) + data.additional_paid_cents;
    const isFull = newPaid >= rev.amount_cents;

    revenues[idx] = {
      ...rev,
      paid_amount_cents: Math.min(newPaid, rev.amount_cents),
      status: isFull ? "Pago" : "Pago Parcela",
      updated_at: new Date().toISOString(),
    };

    await setSettingsJson("financial_revenues", revenues);
    return { success: true, isFull };
  });

// 4. Atualizar Status de Receita
export const updateRevenueStatusAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        status: z.enum(["Pago", "Pago Parcela", "Pendente", "Em Atraso"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });

    const revenues = await getSettingsJson<FinancialRevenue[]>("financial_revenues", []);
    const idx = revenues.findIndex((r) => r.id === data.id);
    if (idx < 0) throw new Error("Receita não encontrada.");

    const rev = revenues[idx];
    let paidAmount = rev.paid_amount_cents;
    if (data.status === "Pago") {
      paidAmount = rev.amount_cents;
    } else if (data.status === "Pendente") {
      paidAmount = 0;
    }

    revenues[idx] = {
      ...rev,
      status: data.status,
      paid_amount_cents: paidAmount,
      updated_at: new Date().toISOString(),
    };

    await setSettingsJson("financial_revenues", revenues);
    return { success: true };
  });

// 5. Excluir Receita
export const deleteRevenueAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });

    let revenues = await getSettingsJson<FinancialRevenue[]>("financial_revenues", []);
    revenues = revenues.filter((r) => r.id !== data.id);

    await setSettingsJson("financial_revenues", revenues);
    return { success: true };
  });

// 6. Salvar Nova Despesa ou Atualizar
export const saveExpenseAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().optional(),
        expense_type: z.string().min(2, "Tipo de despesa é obrigatório"),
        paid_to: z.string().min(2, "Beneficiário/Fornecedor é obrigatório"),
        amount_cents: z.number().int().min(1, "Valor deve ser maior que zero"),
        paid_amount_cents: z.number().int().min(0).default(0),
        whatsapp: z.string().default(""),
        payment_type: z.enum([
          "Pagamento a Vista",
          "Pagamento Parcelado",
          "Pago ao Receber",
        ]),
        payment_date: z.string(),
        status: z.enum(["Pago", "Pago Parcela", "Pendente", "Em Atraso"]),
        notes: z.string().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });

    const expenses = await getSettingsJson<FinancialExpense[]>("financial_expenses", []);
    const now = new Date().toISOString();

    let computedStatus = data.status;
    let computedPaidAmount = data.paid_amount_cents;

    if (computedStatus === "Pago") {
      computedPaidAmount = data.amount_cents;
    } else if (computedStatus === "Pago Parcela") {
      if (computedPaidAmount >= data.amount_cents) {
        computedStatus = "Pago";
        computedPaidAmount = data.amount_cents;
      }
    } else if (computedStatus === "Pendente") {
      computedPaidAmount = 0;
      const today = now.slice(0, 10);
      if (data.payment_date && data.payment_date < today) {
        computedStatus = "Em Atraso";
      }
    }

    if (data.id) {
      const idx = expenses.findIndex((e) => e.id === data.id);
      if (idx >= 0) {
        expenses[idx] = {
          ...expenses[idx],
          ...data,
          status: computedStatus,
          paid_amount_cents: computedPaidAmount,
          updated_at: now,
        };
      } else {
        expenses.unshift({
          ...data,
          id: data.id,
          status: computedStatus,
          paid_amount_cents: computedPaidAmount,
          created_at: now,
          updated_at: now,
        });
      }
    } else {
      const newId = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      expenses.unshift({
        ...data,
        id: newId,
        status: computedStatus,
        paid_amount_cents: computedPaidAmount,
        created_at: now,
        updated_at: now,
      });
    }

    await setSettingsJson("financial_expenses", expenses);
    return { success: true };
  });

// 7. Registrar Pagamento em Despesa
export const registerExpensePaymentAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        additional_paid_cents: z.number().int().min(1),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });

    const expenses = await getSettingsJson<FinancialExpense[]>("financial_expenses", []);
    const idx = expenses.findIndex((e) => e.id === data.id);
    if (idx < 0) throw new Error("Despesa não encontrada.");

    const exp = expenses[idx];
    const newPaid = (exp.paid_amount_cents || 0) + data.additional_paid_cents;
    const isFull = newPaid >= exp.amount_cents;

    expenses[idx] = {
      ...exp,
      paid_amount_cents: Math.min(newPaid, exp.amount_cents),
      status: isFull ? "Pago" : "Pago Parcela",
      updated_at: new Date().toISOString(),
    };

    await setSettingsJson("financial_expenses", expenses);
    return { success: true, isFull };
  });

// 8. Atualizar Status de Despesa
export const updateExpenseStatusAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string(),
        status: z.enum(["Pago", "Pago Parcela", "Pendente", "Em Atraso"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });

    const expenses = await getSettingsJson<FinancialExpense[]>("financial_expenses", []);
    const idx = expenses.findIndex((e) => e.id === data.id);
    if (idx < 0) throw new Error("Despesa não encontrada.");

    const exp = expenses[idx];
    let paidAmount = exp.paid_amount_cents;
    if (data.status === "Pago") {
      paidAmount = exp.amount_cents;
    } else if (data.status === "Pendente") {
      paidAmount = 0;
    }

    expenses[idx] = {
      ...exp,
      status: data.status,
      paid_amount_cents: paidAmount,
      updated_at: new Date().toISOString(),
    };

    await setSettingsJson("financial_expenses", expenses);
    return { success: true };
  });

// 9. Excluir Despesa
export const deleteExpenseAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId, context.claims as { email?: string });

    let expenses = await getSettingsJson<FinancialExpense[]>("financial_expenses", []);
    expenses = expenses.filter((e) => e.id !== data.id);

    await setSettingsJson("financial_expenses", expenses);
    return { success: true };
  });
