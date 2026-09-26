import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Search,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit3,
  RefreshCw,
  Handshake,
  Users,
  Percent,
  Check,
  Calendar,
  Wallet,
  ArrowRight,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { formatCents } from "@/lib/format";
import { useRegistrationsRealtime } from "@/hooks/use-registrations-realtime";
import {
  getFinancialDashboard,
  saveRevenueAdmin,
  registerRevenuePaymentAdmin,
  updateRevenueStatusAdmin,
  deleteRevenueAdmin,
  saveExpenseAdmin,
  registerExpensePaymentAdmin,
  updateExpenseStatusAdmin,
  deleteExpenseAdmin,
  type FinancialRevenue,
  type FinancialExpense,
  type RevenueType,
  type ReceiptType,
  type FinancialStatus,
  type ExpensePaymentType,
} from "@/lib/financial.functions";

export const Route = createFileRoute("/_authenticated/admin/financeiro")({
  head: () => ({ meta: [{ title: "Admin · Financeiro — 2ª Corrida Natalina | Corre +" }] }),
  component: FinancialPage,
});

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "—";
  if (dateStr.includes("/")) return dateStr;
  const parts = dateStr.slice(0, 10).split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function parseMoneyToCents(val: string): number {
  const clean = val.replace(/[^0-9]/g, "");
  return Number(clean) || 0;
}

function formatMoneyString(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPhone(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function buildRevenueWhatsAppUrl(rev: FinancialRevenue): string {
  const digits = (rev.whatsapp || "").replace(/\D/g, "");
  const fullPhone = digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
  const text = `Olá, *${rev.payer_name}*!
Mensagem da equipe da *2ª Corrida Natalina | CORRE+*.
Referente a: *${rev.type}*
Valor: *R$ ${formatMoneyString(rev.amount_cents)}*
Status: *${rev.status}*
Qualquer dúvida ou envio de comprovante, estamos à disposição por aqui!`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
}

function buildExpenseWhatsAppUrl(exp: FinancialExpense): string {
  const digits = (exp.whatsapp || "").replace(/\D/g, "");
  const fullPhone = digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
  const text = `Olá, *${exp.paid_to}*!
Mensagem da organização da *2ª Corrida Natalina | CORRE+*.
Referente a: *${exp.expense_type}*
Valor: *R$ ${formatMoneyString(exp.amount_cents)}*
Status do Pagamento: *${exp.status}*.`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
}

function FinancialPage() {
  useRegistrationsRealtime();
  const qc = useQueryClient();

  const fetchDashboard = useServerFn(getFinancialDashboard);
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["admin", "financial"],
    queryFn: () => fetchDashboard(),
  });

  const [activeTab, setActiveTab] = useState("saude");
  const [revenueSearch, setRevenueSearch] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");

  // Modais de Receita
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<FinancialRevenue | null>(null);
  const [revenuePaymentDialogOpen, setRevenuePaymentDialogOpen] = useState(false);
  const [payingRevenue, setPayingRevenue] = useState<FinancialRevenue | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState("");
  const [deleteRevenueDialog, setDeleteRevenueDialog] = useState<FinancialRevenue | null>(null);

  // Form Receita
  const [revType, setRevType] = useState<RevenueType>("Patrocínio Ouro");
  const [revPayerName, setRevPayerName] = useState("");
  const [revAmountCents, setRevAmountCents] = useState(0);
  const [revPaidAmountCents, setRevPaidAmountCents] = useState(0);
  const [revWhatsapp, setRevWhatsapp] = useState("");
  const [revReceiptType, setRevReceiptType] = useState<ReceiptType>("Pagamento a Vista");
  const [revDate, setRevDate] = useState("");
  const [revStatus, setRevStatus] = useState<FinancialStatus>("Pago");
  const [revReceivedBy, setRevReceivedBy] = useState("");
  const [revNotes, setRevNotes] = useState("");

  // Modais de Despesa
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FinancialExpense | null>(null);
  const [expensePaymentDialogOpen, setExpensePaymentDialogOpen] = useState(false);
  const [payingExpense, setPayingExpense] = useState<FinancialExpense | null>(null);
  const [expensePaymentAmountInput, setExpensePaymentAmountInput] = useState("");
  const [deleteExpenseDialog, setDeleteExpenseDialog] = useState<FinancialExpense | null>(null);

  // Form Despesa
  const [expType, setExpType] = useState("");
  const [expPaidTo, setExpPaidTo] = useState("");
  const [expAmountCents, setExpAmountCents] = useState(0);
  const [expPaidAmountCents, setExpPaidAmountCents] = useState(0);
  const [expWhatsapp, setExpWhatsapp] = useState("");
  const [expPaymentType, setExpPaymentType] = useState<ExpensePaymentType>("Pagamento a Vista");
  const [expDate, setExpDate] = useState("");
  const [expStatus, setExpStatus] = useState<FinancialStatus>("Pago");
  const [expNotes, setExpNotes] = useState("");

  // Mutations
  const saveRevenueFn = useServerFn(saveRevenueAdmin);
  const registerRevenuePaymentFn = useServerFn(registerRevenuePaymentAdmin);
  const updateRevenueStatusFn = useServerFn(updateRevenueStatusAdmin);
  const deleteRevenueFn = useServerFn(deleteRevenueAdmin);

  const saveExpenseFn = useServerFn(saveExpenseAdmin);
  const registerExpensePaymentFn = useServerFn(registerExpensePaymentAdmin);
  const updateExpenseStatusFn = useServerFn(updateExpenseStatusAdmin);
  const deleteExpenseFn = useServerFn(deleteExpenseAdmin);

  const saveRevenueMutation = useMutation({
    mutationFn: (payload: any) => saveRevenueFn({ data: payload }),
    onSuccess: () => {
      toast.success(editingRevenue ? "Receita atualizada!" : "Nova receita registrada com sucesso!");
      setRevenueDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "financial"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao salvar receita"),
  });

  const registerRevenuePaymentMutation = useMutation({
    mutationFn: (payload: any) => registerRevenuePaymentFn({ data: payload }),
    onSuccess: (res: any) => {
      toast.success(res?.isFull ? "Pagamento quitado integralmente!" : "Pagamento parcial registrado!");
      setRevenuePaymentDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "financial"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao registrar pagamento"),
  });

  const updateRevenueStatusMutation = useMutation({
    mutationFn: (payload: any) => updateRevenueStatusFn({ data: payload }),
    onSuccess: () => {
      toast.success("Status da receita atualizado!");
      qc.invalidateQueries({ queryKey: ["admin", "financial"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar status"),
  });

  const deleteRevenueMutation = useMutation({
    mutationFn: (id: string) => deleteRevenueFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Receita excluída!");
      setDeleteRevenueDialog(null);
      qc.invalidateQueries({ queryKey: ["admin", "financial"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao excluir"),
  });

  const saveExpenseMutation = useMutation({
    mutationFn: (payload: any) => saveExpenseFn({ data: payload }),
    onSuccess: () => {
      toast.success(editingExpense ? "Despesa atualizada!" : "Nova despesa cadastrada!");
      setExpenseDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "financial"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao salvar despesa"),
  });

  const registerExpensePaymentMutation = useMutation({
    mutationFn: (payload: any) => registerExpensePaymentFn({ data: payload }),
    onSuccess: (res: any) => {
      toast.success(res?.isFull ? "Despesa quitada integralmente!" : "Pagamento parcial registrado!");
      setExpensePaymentDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "financial"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao registrar pagamento"),
  });

  const updateExpenseStatusMutation = useMutation({
    mutationFn: (payload: any) => updateExpenseStatusFn({ data: payload }),
    onSuccess: () => {
      toast.success("Status da despesa atualizado!");
      qc.invalidateQueries({ queryKey: ["admin", "financial"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar status"),
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => deleteExpenseFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Despesa excluída!");
      setDeleteExpenseDialog(null);
      qc.invalidateQueries({ queryKey: ["admin", "financial"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao excluir"),
  });

  // Handlers para abrir modais
  function openAddRevenue() {
    setEditingRevenue(null);
    setRevType("Patrocínio Ouro");
    setRevPayerName("");
    setRevAmountCents(0);
    setRevPaidAmountCents(0);
    setRevWhatsapp("");
    setRevReceiptType("Pagamento a Vista");
    setRevDate(new Date().toISOString().slice(0, 10));
    setRevStatus("Pago");
    setRevReceivedBy("");
    setRevNotes("");
    setRevenueDialogOpen(true);
  }

  function openEditRevenue(r: FinancialRevenue) {
    setEditingRevenue(r);
    setRevType(r.type);
    setRevPayerName(r.payer_name);
    setRevAmountCents(r.amount_cents);
    setRevPaidAmountCents(r.paid_amount_cents || 0);
    setRevWhatsapp(r.whatsapp);
    setRevReceiptType(r.receipt_type);
    setRevDate(r.receipt_date);
    setRevStatus(r.status);
    setRevReceivedBy(r.received_by);
    setRevNotes(r.notes);
    setRevenueDialogOpen(true);
  }

  function openAddExpense() {
    setEditingExpense(null);
    setExpType("");
    setExpPaidTo("");
    setExpAmountCents(0);
    setExpPaidAmountCents(0);
    setExpWhatsapp("");
    setExpPaymentType("Pagamento a Vista");
    setExpDate(new Date().toISOString().slice(0, 10));
    setExpStatus("Pago");
    setExpNotes("");
    setExpenseDialogOpen(true);
  }

  function openEditExpense(e: FinancialExpense) {
    setEditingExpense(e);
    setExpType(e.expense_type);
    setExpPaidTo(e.paid_to);
    setExpAmountCents(e.amount_cents);
    setExpPaidAmountCents(e.paid_amount_cents || 0);
    setExpWhatsapp(e.whatsapp);
    setExpPaymentType(e.payment_type);
    setExpDate(e.payment_date);
    setExpStatus(e.status);
    setExpNotes(e.notes);
    setExpenseDialogOpen(true);
  }

  // Filtragem de listas
  const filteredRevenues = useMemo(() => {
    const list = data?.revenues ?? [];
    if (!revenueSearch.trim()) return list;
    const q = revenueSearch.toLowerCase().trim();
    return list.filter(
      (r) =>
        r.payer_name?.toLowerCase().includes(q) ||
        r.type?.toLowerCase().includes(q) ||
        r.whatsapp?.includes(q) ||
        r.received_by?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q),
    );
  }, [data?.revenues, revenueSearch]);

  const filteredExpenses = useMemo(() => {
    const list = data?.expenses ?? [];
    if (!expenseSearch.trim()) return list;
    const q = expenseSearch.toLowerCase().trim();
    return list.filter(
      (e) =>
        e.expense_type?.toLowerCase().includes(q) ||
        e.paid_to?.toLowerCase().includes(q) ||
        e.whatsapp?.includes(q) ||
        e.status?.toLowerCase().includes(q),
    );
  }, [data?.expenses, expenseSearch]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#c20505]">
              Gestão Financeira
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Tempo Real
            </span>
          </div>
          <p className="mt-1 text-sm text-[#3d0000]">
            Controle de fluxo de caixa, receitas de patrocínio, despesas e relatórios de desempenho.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar dados agora"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-[#c20505]" : ""}`} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-white text-sm text-muted-foreground">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin text-[#c20505]" /> Carregando módulo financeiro...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Não foi possível carregar o módulo financeiro."}
        </div>
      ) : !data ? (
        <p className="text-sm text-[#3d0000]/60">Nenhum dado financeiro encontrado.</p>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/70 p-1 border border-border/60 rounded-xl">
            <TabsTrigger value="saude" className="gap-2 text-xs font-bold cursor-pointer">
              <Landmark className="h-4 w-4" />
              Saúde Financeira
            </TabsTrigger>
            <TabsTrigger value="receitas" className="gap-2 text-xs font-bold cursor-pointer">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Receitas ({data.revenues.length})
            </TabsTrigger>
            <TabsTrigger value="despesas" className="gap-2 text-xs font-bold cursor-pointer">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              Despesas ({data.expenses.length})
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="gap-2 text-xs font-bold cursor-pointer">
              <Percent className="h-4 w-4 text-purple-600" />
              Relatórios (KPIs)
            </TabsTrigger>
          </TabsList>

          {/* ======================================================== */}
          {/* TAB 1: SAÚDE FINANCEIRA */}
          {/* ======================================================== */}
          <TabsContent value="saude" className="space-y-6 m-0">
            {/* 7 Cards Principais de Métricas */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {/* 1. Inscrições Pagas */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <span>1. Inscrições Pagas</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-emerald-800">
                  {formatCents(data.inscricoesPagasCents)}
                </p>
                <p className="mt-1 text-[11px] text-emerald-700">
                  {data.pagasCount} atletas confirmados
                </p>
              </div>

              {/* 2. Inscrições Pendentes */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700">
                  <span>2. Inscrições Pendentes</span>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-amber-800">
                  {formatCents(data.inscricoesPendentesCents)}
                </p>
                <p className="mt-1 text-[11px] text-amber-700">
                  {data.pendentesCount} atletas aguardando
                </p>
              </div>

              {/* 3. Patrocínios Pagos */}
              <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c20505]">
                  <span>3. Patrocínios Pagos</span>
                  <Handshake className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-[#3d0000]">
                  {formatCents(data.patrociniosPagosCents)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Confirmados em caixa</p>
              </div>

              {/* 4. Patrocínios Pendentes */}
              <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700">
                  <span>4. Patrocínios Pendentes</span>
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-amber-800">
                  {formatCents(data.patrociniosPendentesCents)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">A receber dos parceiros</p>
              </div>

              {/* 5. Valores a Receber (Total) */}
              <div className="rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-800">
                  <span>5. Valores a Receber</span>
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
                <p className="mt-2 text-2xl font-black text-amber-900">
                  {formatCents(data.valoresAReceberCents)}
                </p>
                <p className="mt-1 text-[11px] text-amber-800 font-medium">
                  Inscrições + Patrocínios + Outros pendentes
                </p>
              </div>

              {/* 6. Receita Bruta */}
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-800">
                  <span>6. Receita Bruta</span>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <p className="mt-2 text-2xl font-black text-blue-900">
                  {formatCents(data.receitaBrutaCents)}
                </p>
                <p className="mt-1 text-[11px] text-blue-800 font-medium">
                  Total já confirmado e recebido
                </p>
              </div>

              {/* 7. Receita Líquida */}
              <div className="col-span-2 sm:col-span-1 md:col-span-2 lg:col-span-2 rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-white p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <span>7. Receita Líquida (Saldo Atual)</span>
                  <Wallet className="h-5 w-5 text-emerald-700" />
                </div>
                <p className="mt-2 text-3xl font-black text-emerald-900">
                  {formatCents(data.receitaLiquidaCents)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Receita Bruta: <strong className="text-foreground">{formatCents(data.receitaBrutaCents)}</strong>
                  </span>
                  <span>-</span>
                  <span>
                    Despesas Pagas: <strong className="text-rose-600">{formatCents(data.despesasPagasCents)}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* 8. Gráfico em Linha: Recebidos vs Valores a Receber */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-4">
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight text-[#c20505] flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Gráfico: Valores Recebidos vs Valores a Receber
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Comparativo dos valores confirmados em caixa versus os saldos a receber por frente financeira
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.comparisonChartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="categoria" tick={{ fontSize: 11, fontWeight: "bold" }} />
                    <YAxis
                      tickFormatter={(v) => `R$ ${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(v: any, name: any) => [
                        `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                        name === "recebidos" ? "Valores Recebidos (Pagos)" : "Valores a Receber (Pendentes)",
                      ]}
                    />
                    <Legend
                      formatter={(val) => (val === "recebidos" ? "Valores Recebidos (Pagos)" : "Valores a Receber (Pendentes)")}
                    />
                    <Line
                      type="monotone"
                      dataKey="recebidos"
                      name="recebidos"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#16a34a" }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="aReceber"
                      name="aReceber"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      strokeDasharray="4 4"
                      dot={{ r: 5, fill: "#f59e0b" }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 2: RECEITAS */}
          {/* ======================================================== */}
          <TabsContent value="receitas" className="space-y-6 m-0">
            {/* Top Action & KPI Cards */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#c20505]">
                  Central de Receitas & Patrocínios
                </h2>
                <p className="text-xs text-muted-foreground">
                  Cadastre e gerencie patrocínios, doações e acompanhe as inscrições dos atletas.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddRevenue}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c20505] to-[#800000] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Adicionar Receita
              </button>
            </div>

            {/* Régua de KPIs da Aba 2 */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-emerald-700">Inscrições Pagas</span>
                <p className="mt-1 text-xl font-extrabold text-emerald-800">
                  {formatCents(data.inscricoesPagasCents)}
                </p>
                <span className="inline-block mt-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Sincronizado Atletas
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-[#c20505]">Patrocínios Pagos</span>
                <p className="mt-1 text-xl font-extrabold text-[#3d0000]">
                  {formatCents(data.patrociniosPagosCents)}
                </p>
                <span className="text-[10px] text-muted-foreground">Cotas quitadas</span>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-amber-700">Patrocínios Pendentes</span>
                <p className="mt-1 text-xl font-extrabold text-amber-800">
                  {formatCents(data.patrociniosPendentesCents)}
                </p>
                <span className="text-[10px] text-muted-foreground">A receber / parcelas</span>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-purple-700">Outros Recebidos</span>
                <p className="mt-1 text-xl font-extrabold text-purple-800">
                  {formatCents(data.outrosRecebidosPagosCents + data.outrosRecebidosPendentesCents)}
                </p>
                <span className="text-[10px] text-muted-foreground">Doações e outros</span>
              </div>
            </div>

            {/* Busca & Tabela */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por pagante, tipo, whatsapp..."
                    value={revenueSearch}
                    onChange={(e) => setRevenueSearch(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-xs outline-none focus:border-[#c20505] focus:ring-1 focus:ring-[#c20505]"
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Exibindo {filteredRevenues.length} de {data.revenues.length} receita(s)
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-[#fbf6f5] text-left uppercase tracking-wider text-[#c20505] font-bold">
                    <tr>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Pagante</th>
                      <th className="px-4 py-3">Valor Total</th>
                      <th className="px-4 py-3">Valor Pago</th>
                      <th className="px-4 py-3">Saldo Pendente</th>
                      <th className="px-4 py-3">WhatsApp</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRevenues.map((rev) => {
                      const pendingBalance = Math.max(0, rev.amount_cents - (rev.paid_amount_cents || 0));
                      const isOverdue = rev.status === "Em Atraso" || (rev.status === "Pendente" && rev.receipt_date < data.today);

                      return (
                        <tr key={rev.id} className="hover:bg-muted/20 transition">
                          <td className="px-4 py-3 font-semibold text-foreground">{rev.type}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-foreground">{rev.payer_name}</span>
                            {rev.received_by && (
                              <p className="text-[10px] text-muted-foreground">Rec: {rev.received_by}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground">
                            {formatCents(rev.amount_cents)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-700">
                            {formatCents(rev.paid_amount_cents || 0)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-amber-700">
                            {formatCents(pendingBalance)}
                            {rev.status === "Pago Parcela" && pendingBalance > 0 && (
                              <span className="ml-1.5 inline-block rounded-xs bg-muted px-1 text-[9px] font-bold text-muted-foreground">
                                Sem Atraso
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{rev.whatsapp || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDisplayDate(rev.receipt_date)}</td>
                          <td className="px-4 py-3">
                            {rev.status === "Pago" ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                Pago
                              </span>
                            ) : rev.status === "Pago Parcela" ? (
                              <span className="inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                Pago Parcela
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                Em Atraso
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                Pendente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* WhatsApp */}
                              {rev.whatsapp && (
                                <a
                                  href={buildRevenueWhatsAppUrl(rev)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Falar no WhatsApp"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59]"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 fill-current" />
                                </a>
                              )}

                              {/* Registrar Pagamento */}
                              {rev.status !== "Pago" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPayingRevenue(rev);
                                    setPaymentAmountInput(formatMoneyString(pendingBalance));
                                    setRevenuePaymentDialogOpen(true);
                                  }}
                                  title="Registrar Pagamento"
                                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                                >
                                  <Check className="h-3 w-3" /> Baixar
                                </button>
                              )}

                              {/* Editar */}
                              <button
                                type="button"
                                onClick={() => openEditRevenue(rev)}
                                title="Editar Receita"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              {/* Excluir */}
                              <button
                                type="button"
                                onClick={() => setDeleteRevenueDialog(rev)}
                                title="Excluir Receita"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredRevenues.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhuma receita registrada ainda. Clique em &quot;+ Adicionar Receita&quot; para cadastrar!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 3: DESPESAS */}
          {/* ======================================================== */}
          <TabsContent value="despesas" className="space-y-6 m-0">
            {/* Top Action & KPI Cards */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#c20505]">
                  Central de Despesas & Custos do Evento
                </h2>
                <p className="text-xs text-muted-foreground">
                  Controle pagamentos a fornecedores de camisas, medalhas, estrutura, staff e outros gastos.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddExpense}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c20505] to-[#800000] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Adicionar Despesa
              </button>
            </div>

            {/* Régua de KPIs da Aba 3 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-rose-700">1. Despesas Pagas</span>
                <p className="mt-1 text-2xl font-extrabold text-rose-800">
                  {formatCents(data.despesasPagasCents)}
                </p>
                <span className="text-[10px] text-muted-foreground">Custos já quitados</span>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-amber-700">2. Despesas Pendentes</span>
                <p className="mt-1 text-2xl font-extrabold text-amber-800">
                  {formatCents(data.despesasPendentesCents)}
                </p>
                <span className="text-[10px] text-muted-foreground">Saldos e parcelas a pagar</span>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-[#c20505]">3. Total Previsto de Despesas</span>
                <p className="mt-1 text-2xl font-extrabold text-[#3d0000]">
                  {formatCents(data.despesasTotalCents)}
                </p>
                <span className="text-[10px] text-muted-foreground">Despesas pagas + a pagar</span>
              </div>
            </div>

            {/* Busca & Tabela */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por tipo de despesa, fornecedor..."
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-xs outline-none focus:border-[#c20505] focus:ring-1 focus:ring-[#c20505]"
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Exibindo {filteredExpenses.length} de {data.expenses.length} despesa(s)
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-[#fbf6f5] text-left uppercase tracking-wider text-[#c20505] font-bold">
                    <tr>
                      <th className="px-4 py-3">Tipo de Despesa</th>
                      <th className="px-4 py-3">Paga a (Fornecedor)</th>
                      <th className="px-4 py-3">Valor Total</th>
                      <th className="px-4 py-3">Valor Pago</th>
                      <th className="px-4 py-3">Saldo a Pagar</th>
                      <th className="px-4 py-3">WhatsApp</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredExpenses.map((exp) => {
                      const pendingBalance = Math.max(0, exp.amount_cents - (exp.paid_amount_cents || 0));
                      const isOverdue = exp.status === "Em Atraso" || (exp.status === "Pendente" && exp.payment_date < data.today);

                      return (
                        <tr key={exp.id} className="hover:bg-muted/20 transition">
                          <td className="px-4 py-3 font-semibold text-foreground">{exp.expense_type}</td>
                          <td className="px-4 py-3 font-bold text-foreground">{exp.paid_to}</td>
                          <td className="px-4 py-3 font-bold text-foreground">
                            {formatCents(exp.amount_cents)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-700">
                            {formatCents(exp.paid_amount_cents || 0)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-amber-700">
                            {formatCents(pendingBalance)}
                            {exp.status === "Pago Parcela" && pendingBalance > 0 && (
                              <span className="ml-1.5 inline-block rounded-xs bg-muted px-1 text-[9px] font-bold text-muted-foreground">
                                Sem Atraso
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{exp.whatsapp || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDisplayDate(exp.payment_date)}</td>
                          <td className="px-4 py-3">
                            {exp.status === "Pago" ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                Pago
                              </span>
                            ) : exp.status === "Pago Parcela" ? (
                              <span className="inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                Pago Parcela
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                Em Atraso
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                Pendente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* WhatsApp */}
                              {exp.whatsapp && (
                                <a
                                  href={buildExpenseWhatsAppUrl(exp)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Falar no WhatsApp"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59]"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 fill-current" />
                                </a>
                              )}

                              {/* Registrar Pagamento */}
                              {exp.status !== "Pago" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPayingExpense(exp);
                                    setExpensePaymentAmountInput(formatMoneyString(pendingBalance));
                                    setExpensePaymentDialogOpen(true);
                                  }}
                                  title="Registrar Pagamento"
                                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                                >
                                  <Check className="h-3 w-3" /> Pagar
                                </button>
                              )}

                              {/* Editar */}
                              <button
                                type="button"
                                onClick={() => openEditExpense(exp)}
                                title="Editar Despesa"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              {/* Excluir */}
                              <button
                                type="button"
                                onClick={() => setDeleteExpenseDialog(exp)}
                                title="Excluir Despesa"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredExpenses.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhuma despesa cadastrada ainda. Clique em &quot;+ Adicionar Despesa&quot; para registrar os custos!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 4: RELATÓRIOS (KPIS) */}
          {/* ======================================================== */}
          <TabsContent value="relatorios" className="space-y-6 m-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#c20505]">
                  Relatórios Estratégicos & KPIs Executivos
                </h2>
                <p className="text-xs text-muted-foreground">
                  Indicadores de desempenho calculados em tempo real integrando inscrições, patrocínios e custos operacionais.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddExpense}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Despesa
              </button>
            </div>

            {/* 5 KPIs Principais */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* 1. Taxa de Conversão */}
              <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c20505]">
                  <span>1. Taxa de Conversão</span>
                  <Percent className="h-4 w-4 text-blue-500" />
                </div>
                <p className="mt-2 text-3xl font-black text-[#3d0000]">{data.taxaConversao}%</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.pagasCount} confirmados de {data.totalInscricoesCount} inscritos
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, data.taxaConversao)}%` }}
                  ></div>
                </div>
              </div>

              {/* 2. Ticket Médio */}
              <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c20505]">
                  <span>2. Ticket Médio</span>
                  <DollarSign className="h-4 w-4 text-purple-500" />
                </div>
                <p className="mt-2 text-3xl font-black text-[#3d0000]">{formatCents(data.ticketMedioCents)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Valor médio recebido por atleta confirmado
                </p>
                <span className="inline-block mt-3 text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-semibold">
                  Receita Inscrições / Atletas Pagos
                </span>
              </div>

              {/* 3. Custo de Aquisição de Clientes (CAC) */}
              <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-rose-700">
                  <span>3. Custo de Aquisição (CAC)</span>
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                </div>
                <p className="mt-2 text-3xl font-black text-rose-800">{formatCents(data.cacCents)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Custo operacional/aquisição por atleta pago
                </p>
                <span className="inline-block mt-3 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-semibold">
                  Despesas Pagas / Atletas Confirmados
                </span>
              </div>

              {/* 4. Lifetime Value (LTV) */}
              <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <span>4. Lifetime Value (LTV)</span>
                  <Users className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-3xl font-black text-emerald-800">{formatCents(data.ltvCents)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Receita total gerada por atleta no evento
                </p>
                <span className="inline-block mt-3 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                  Receita Bruta Total / Atletas Pagos
                </span>
              </div>

              {/* 5. Previsibilidade de Receita */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-2 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-soft">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-800">
                  <span>5. Previsibilidade de Receita Projetada</span>
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <p className="mt-2 text-3xl font-black text-blue-900">
                  {formatCents(data.previsibilidadeReceitaCents)}
                </p>
                <p className="mt-1 text-xs text-blue-800">
                  Receita bruta atual confirmada + projeção ponderada dos valores a receber ({data.taxaConversao}% de conversão estimada).
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Confirmado: <strong>{formatCents(data.receitaBrutaCents)}</strong></span>
                  <span>+</span>
                  <span>A Receber Estimado: <strong>{formatCents(data.previsibilidadeReceitaCents - data.receitaBrutaCents)}</strong></span>
                </div>
              </div>
            </div>

            {/* Demonstrativo Sintético de Resultados (DRE) */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#c20505]">
                Demonstrativo Sintético do Evento (DRE em Tempo Real)
              </h3>
              <div className="divide-y divide-border text-xs">
                <div className="flex items-center justify-between py-2 text-muted-foreground">
                  <span>(+) Receita de Inscrições Confirmadas</span>
                  <span className="font-bold text-foreground">{formatCents(data.inscricoesPagasCents)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-muted-foreground">
                  <span>(+) Patrocínios Confirmados (Pagos)</span>
                  <span className="font-bold text-foreground">{formatCents(data.patrociniosPagosCents)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-muted-foreground">
                  <span>(+) Outras Receitas Confirmadas (Doações, etc.)</span>
                  <span className="font-bold text-foreground">{formatCents(data.outrosRecebidosPagosCents)}</span>
                </div>
                <div className="flex items-center justify-between py-3 font-bold bg-muted/20 px-2 rounded-lg">
                  <span className="uppercase text-blue-900">(=) Receita Bruta Total Realizada</span>
                  <span className="text-sm font-extrabold text-blue-900">{formatCents(data.receitaBrutaCents)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-rose-700">
                  <span>(-) Despesas Pagas (Custos Operacionais e Kits)</span>
                  <span className="font-bold text-rose-700">- {formatCents(data.despesasPagasCents)}</span>
                </div>
                <div className="flex items-center justify-between py-3 font-black bg-emerald-50 px-2 rounded-lg border border-emerald-200">
                  <span className="uppercase text-emerald-900">(=) Saldo Líquido Atual (Superávit)</span>
                  <span className="text-base font-black text-emerald-800">{formatCents(data.receitaLiquidaCents)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-amber-700">
                  <span>(+) Potencial Líquido a Receber (Inscrições + Patrocínios)</span>
                  <span className="font-bold text-amber-700">+ {formatCents(data.valoresAReceberCents)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* ======================================================== */}
      {/* MODAIS: RECEITA */}
      {/* ======================================================== */}
      {/* Modal Adicionar / Editar Receita */}
      <Dialog open={revenueDialogOpen} onOpenChange={setRevenueDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold uppercase tracking-tight text-[#c20505]">
              {editingRevenue ? "Editar Receita" : "Registrar Nova Receita"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Preencha os dados do patrocínio ou recebimento para a 2ª Corrida Natalina.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!revPayerName.trim()) {
                toast.error("Informe o nome do pagante.");
                return;
              }
              if (revAmountCents <= 0) {
                toast.error("O valor deve ser maior que zero.");
                return;
              }

              saveRevenueMutation.mutate({
                id: editingRevenue?.id,
                type: revType,
                payer_name: revPayerName.trim(),
                amount_cents: revAmountCents,
                paid_amount_cents: revStatus === "Pago" ? revAmountCents : revStatus === "Pago Parcela" ? revPaidAmountCents : 0,
                whatsapp: revWhatsapp,
                receipt_type: revReceiptType,
                receipt_date: revDate || new Date().toISOString().slice(0, 10),
                status: revStatus,
                received_by: revReceivedBy.trim(),
                notes: revNotes.trim(),
              });
            }}
            className="space-y-4 text-xs"
          >
            {/* Tipo de Receita */}
            <div>
              <label className="block font-bold text-foreground mb-1">Tipo de Receita *</label>
              <select
                value={revType}
                onChange={(e) => setRevType(e.target.value as RevenueType)}
                className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
              >
                <option value="Patrocínio Diamante">Patrocínio Diamante</option>
                <option value="Patrocínio Ouro">Patrocínio Ouro</option>
                <option value="Patrocínio Prata">Patrocínio Prata</option>
                <option value="Doação">Doação</option>
                <option value="Outro Recebimento">Outro Recebimento</option>
              </select>
            </div>

            {/* Nome do Pagante */}
            <div>
              <label className="block font-bold text-foreground mb-1">Nome do Pagante *</label>
              <input
                type="text"
                placeholder="Ex: Empresa X, Breno Araújo, etc."
                value={revPayerName}
                onChange={(e) => setRevPayerName(e.target.value)}
                required
                className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
              />
            </div>

            {/* Valor do Recebimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-foreground mb-1">Valor do Recebimento (R$) *</label>
                <div className="flex rounded-lg border border-border bg-white overflow-hidden focus-within:border-[#c20505]">
                  <span className="flex items-center bg-muted/60 px-2.5 text-xs font-bold text-muted-foreground border-r border-border">
                    R$
                  </span>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={formatMoneyString(revAmountCents)}
                    onChange={(e) => setRevAmountCents(parseMoneyToCents(e.target.value))}
                    className="h-9 w-full px-3 text-xs font-bold outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block font-bold text-foreground mb-1">WhatsApp</label>
                <div className="flex rounded-lg border border-border bg-white overflow-hidden focus-within:border-[#c20505]">
                  <span className="flex items-center bg-muted/60 px-2.5 text-xs font-bold text-muted-foreground border-r border-border">
                    +55
                  </span>
                  <input
                    type="text"
                    placeholder="(87) 99999-9999"
                    value={revWhatsapp}
                    onChange={(e) => setRevWhatsapp(formatPhone(e.target.value))}
                    className="h-9 w-full px-3 text-xs outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Recebimento & Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-foreground mb-1">Tipo de Recebimento</label>
                <select
                  value={revReceiptType}
                  onChange={(e) => setRevReceiptType(e.target.value as ReceiptType)}
                  className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
                >
                  <option value="Pagamento a Vista">Pagamento a Vista</option>
                  <option value="Pagamento Parcelado">Pagamento Parcelado</option>
                  <option value="Pagamento a Receber">Pagamento a Receber</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Data do Recebimento (Dia/Mês/Ano)</label>
                <input
                  type="date"
                  value={revDate}
                  onChange={(e) => setRevDate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
                />
              </div>
            </div>

            {/* Status do Recebimento */}
            <div>
              <label className="block font-bold text-foreground mb-1">Status do Recebimento</label>
              <select
                value={revStatus}
                onChange={(e) => setRevStatus(e.target.value as FinancialStatus)}
                className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
              >
                <option value="Pago">Pago</option>
                <option value="Pago Parcela">Pago Parcela</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Atraso">Em Atraso</option>
              </select>
            </div>

            {/* Campo Condicional se "Pago Parcela" */}
            {revStatus === "Pago Parcela" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 space-y-2">
                <label className="block font-bold text-blue-900">Valor Já Abatido / Pago Parcial (R$)</label>
                <div className="flex rounded-lg border border-blue-300 bg-white overflow-hidden">
                  <span className="flex items-center bg-blue-100 px-2.5 text-xs font-bold text-blue-800 border-r border-blue-300">
                    R$
                  </span>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={formatMoneyString(revPaidAmountCents)}
                    onChange={(e) => setRevPaidAmountCents(parseMoneyToCents(e.target.value))}
                    className="h-9 w-full px-3 text-xs font-bold outline-none bg-transparent"
                  />
                </div>
                <p className="text-[11px] text-blue-700">
                  Saldo restante de <strong>R$ {formatMoneyString(Math.max(0, revAmountCents - revPaidAmountCents))}</strong> constará como pendente com observação &quot;Sem Atraso&quot;.
                </p>
              </div>
            )}

            {/* Recebido por & Observações */}
            <div>
              <label className="block font-bold text-foreground mb-1">Recebido por</label>
              <input
                type="text"
                placeholder="Ex: Amanda, Felipe, Tesouraria..."
                value={revReceivedBy}
                onChange={(e) => setRevReceivedBy(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Observações</label>
              <textarea
                placeholder="Anotações internas sobre recibo, cota ou combinado..."
                value={revNotes}
                onChange={(e) => setRevNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-white p-2 text-xs outline-none focus:border-[#c20505]"
              ></textarea>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setRevenueDialogOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saveRevenueMutation.isPending}
                className="rounded-lg bg-[#c20505] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#800000] cursor-pointer"
              >
                {saveRevenueMutation.isPending ? "Salvando..." : "Salvar Receita"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Registrar Pagamento Receita */}
      <Dialog open={revenuePaymentDialogOpen} onOpenChange={setRevenuePaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-[#c20505]">
              Registrar Pagamento de Receita
            </DialogTitle>
            <DialogDescription className="text-xs">
              Informe o valor em R$ recebido de <strong>{payingRevenue?.payer_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {payingRevenue && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1">
                <div className="flex justify-between">
                  <span>Valor Total:</span>
                  <span className="font-bold">{formatCents(payingRevenue.amount_cents)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Já Pago Anteriormente:</span>
                  <span className="font-bold">{formatCents(payingRevenue.paid_amount_cents || 0)}</span>
                </div>
                <div className="flex justify-between text-amber-700 font-bold border-t border-border pt-1">
                  <span>Saldo Pendente Atual:</span>
                  <span>{formatCents(Math.max(0, payingRevenue.amount_cents - (payingRevenue.paid_amount_cents || 0)))}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Valor do Pagamento Agora (R$)</label>
                <div className="flex rounded-lg border border-emerald-300 bg-white overflow-hidden">
                  <span className="flex items-center bg-emerald-100 px-3 text-xs font-bold text-emerald-800 border-r border-emerald-300">
                    R$
                  </span>
                  <input
                    type="text"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(formatMoneyString(parseMoneyToCents(e.target.value)))}
                    className="h-10 w-full px-3 text-sm font-extrabold text-foreground outline-none bg-transparent"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Se o valor quitar o saldo total, o status será automaticamente atualizado para &quot;Pago&quot;.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setRevenuePaymentDialogOpen(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cents = parseMoneyToCents(paymentAmountInput);
                    if (cents <= 0) {
                      toast.error("Informe um valor válido.");
                      return;
                    }
                    registerRevenuePaymentMutation.mutate({
                      id: payingRevenue.id,
                      additional_paid_cents: cents,
                    });
                  }}
                  disabled={registerRevenuePaymentMutation.isPending}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  {registerRevenuePaymentMutation.isPending ? "Confirmando..." : "Confirmar Pagamento"}
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão Receita */}
      <Dialog open={!!deleteRevenueDialog} onOpenChange={(o) => !o && setDeleteRevenueDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-rose-600">
              Excluir Receita?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tem certeza que deseja remover o registro de <strong>{deleteRevenueDialog?.payer_name}</strong> ({formatCents(deleteRevenueDialog?.amount_cents || 0)})? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => setDeleteRevenueDialog(null)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => deleteRevenueDialog && deleteRevenueMutation.mutate(deleteRevenueDialog.id)}
              disabled={deleteRevenueMutation.isPending}
              className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
            >
              {deleteRevenueMutation.isPending ? "Excluindo..." : "Sim, Excluir"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAIS: DESPESA */}
      {/* ======================================================== */}
      {/* Modal Adicionar / Editar Despesa */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold uppercase tracking-tight text-[#c20505]">
              {editingExpense ? "Editar Despesa" : "Registrar Nova Despesa"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cadastre fornecedores, kits, custos operacionais e cronograma de pagamentos.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!expType.trim()) {
                toast.error("Informe o tipo de despesa.");
                return;
              }
              if (!expPaidTo.trim()) {
                toast.error("Informe a quem a despesa será paga.");
                return;
              }
              if (expAmountCents <= 0) {
                toast.error("O valor da despesa deve ser maior que zero.");
                return;
              }

              saveExpenseMutation.mutate({
                id: editingExpense?.id,
                expense_type: expType.trim(),
                paid_to: expPaidTo.trim(),
                amount_cents: expAmountCents,
                paid_amount_cents: expStatus === "Pago" ? expAmountCents : expStatus === "Pago Parcela" ? expPaidAmountCents : 0,
                whatsapp: expWhatsapp,
                payment_type: expPaymentType,
                payment_date: expDate || new Date().toISOString().slice(0, 10),
                status: expStatus,
                notes: expNotes.trim(),
              });
            }}
            className="space-y-4 text-xs"
          >
            {/* Tipo de Despesa */}
            <div>
              <label className="block font-bold text-foreground mb-1">Tipo de Despesa *</label>
              <input
                type="text"
                placeholder="Ex: Camisas dos Kits, Medalhas, Troféus, Cronometragem..."
                value={expType}
                onChange={(e) => setExpType(e.target.value)}
                required
                className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
              />
            </div>

            {/* Despesa Paga a */}
            <div>
              <label className="block font-bold text-foreground mb-1">Despesa Paga a (Fornecedor / Beneficiário) *</label>
              <input
                type="text"
                placeholder="Ex: Gráfica Alfa, Confecção Silva, DJ Eventos..."
                value={expPaidTo}
                onChange={(e) => setExpPaidTo(e.target.value)}
                required
                className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
              />
            </div>

            {/* Valor & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-foreground mb-1">Valor da Despesa (R$) *</label>
                <div className="flex rounded-lg border border-border bg-white overflow-hidden focus-within:border-[#c20505]">
                  <span className="flex items-center bg-muted/60 px-2.5 text-xs font-bold text-muted-foreground border-r border-border">
                    R$
                  </span>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={formatMoneyString(expAmountCents)}
                    onChange={(e) => setExpAmountCents(parseMoneyToCents(e.target.value))}
                    className="h-9 w-full px-3 text-xs font-bold outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">WhatsApp do Fornecedor</label>
                <div className="flex rounded-lg border border-border bg-white overflow-hidden focus-within:border-[#c20505]">
                  <span className="flex items-center bg-muted/60 px-2.5 text-xs font-bold text-muted-foreground border-r border-border">
                    +55
                  </span>
                  <input
                    type="text"
                    placeholder="(87) 99999-9999"
                    value={expWhatsapp}
                    onChange={(e) => setExpWhatsapp(formatPhone(e.target.value))}
                    className="h-9 w-full px-3 text-xs outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Pagamento & Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-foreground mb-1">Tipo de Pagamento</label>
                <select
                  value={expPaymentType}
                  onChange={(e) => setExpPaymentType(e.target.value as ExpensePaymentType)}
                  className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
                >
                  <option value="Pagamento a Vista">Pagamento a Vista</option>
                  <option value="Pagamento Parcelado">Pagamento Parcelado</option>
                  <option value="Pago ao Receber">Pago ao Receber</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Data do Pagamento (Dia/Mês/Ano)</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
                />
              </div>
            </div>

            {/* Status do Pagamento */}
            <div>
              <label className="block font-bold text-foreground mb-1">Status do Pagamento</label>
              <select
                value={expStatus}
                onChange={(e) => setExpStatus(e.target.value as FinancialStatus)}
                className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-[#c20505]"
              >
                <option value="Pago">Pago</option>
                <option value="Pago Parcela">Pago Parcela</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Atraso">Em Atraso</option>
              </select>
            </div>

            {/* Campo Condicional se "Pago Parcela" */}
            {expStatus === "Pago Parcela" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 space-y-2">
                <label className="block font-bold text-blue-900">Valor Já Pago / Abatido (R$)</label>
                <div className="flex rounded-lg border border-blue-300 bg-white overflow-hidden">
                  <span className="flex items-center bg-blue-100 px-2.5 text-xs font-bold text-blue-800 border-r border-blue-300">
                    R$
                  </span>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={formatMoneyString(expPaidAmountCents)}
                    onChange={(e) => setExpPaidAmountCents(parseMoneyToCents(e.target.value))}
                    className="h-9 w-full px-3 text-xs font-bold outline-none bg-transparent"
                  />
                </div>
                <p className="text-[11px] text-blue-700">
                  Saldo restante de <strong>R$ {formatMoneyString(Math.max(0, expAmountCents - expPaidAmountCents))}</strong> constará como pendente com observação &quot;Sem Atraso&quot;.
                </p>
              </div>
            )}

            <div>
              <label className="block font-bold text-foreground mb-1">Observações</label>
              <textarea
                placeholder="Anotações internas sobre entrega de nota, recibo ou contato..."
                value={expNotes}
                onChange={(e) => setExpNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-white p-2 text-xs outline-none focus:border-[#c20505]"
              ></textarea>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setExpenseDialogOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saveExpenseMutation.isPending}
                className="rounded-lg bg-[#c20505] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#800000] cursor-pointer"
              >
                {saveExpenseMutation.isPending ? "Salvando..." : "Salvar Despesa"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Registrar Pagamento Despesa */}
      <Dialog open={expensePaymentDialogOpen} onOpenChange={setExpensePaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-[#c20505]">
              Registrar Pagamento de Despesa
            </DialogTitle>
            <DialogDescription className="text-xs">
              Informe o valor pago ao fornecedor <strong>{payingExpense?.paid_to}</strong> ({payingExpense?.expense_type}).
            </DialogDescription>
          </DialogHeader>

          {payingExpense && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1">
                <div className="flex justify-between">
                  <span>Valor Total da Despesa:</span>
                  <span className="font-bold">{formatCents(payingExpense.amount_cents)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Já Pago Anteriormente:</span>
                  <span className="font-bold">{formatCents(payingExpense.paid_amount_cents || 0)}</span>
                </div>
                <div className="flex justify-between text-amber-700 font-bold border-t border-border pt-1">
                  <span>Saldo a Pagar Atual:</span>
                  <span>{formatCents(Math.max(0, payingExpense.amount_cents - (payingExpense.paid_amount_cents || 0)))}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Valor Pago Agora (R$)</label>
                <div className="flex rounded-lg border border-emerald-300 bg-white overflow-hidden">
                  <span className="flex items-center bg-emerald-100 px-3 text-xs font-bold text-emerald-800 border-r border-emerald-300">
                    R$
                  </span>
                  <input
                    type="text"
                    value={expensePaymentAmountInput}
                    onChange={(e) => setExpensePaymentAmountInput(formatMoneyString(parseMoneyToCents(e.target.value)))}
                    className="h-10 w-full px-3 text-sm font-extrabold text-foreground outline-none bg-transparent"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Se o valor quitar o saldo total, o status será automaticamente atualizado para &quot;Pago&quot;.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setExpensePaymentDialogOpen(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cents = parseMoneyToCents(expensePaymentAmountInput);
                    if (cents <= 0) {
                      toast.error("Informe um valor válido.");
                      return;
                    }
                    registerExpensePaymentMutation.mutate({
                      id: payingExpense.id,
                      additional_paid_cents: cents,
                    });
                  }}
                  disabled={registerExpensePaymentMutation.isPending}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  {registerExpensePaymentMutation.isPending ? "Confirmando..." : "Confirmar Pagamento"}
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão Despesa */}
      <Dialog open={!!deleteExpenseDialog} onOpenChange={(o) => !o && setDeleteExpenseDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-rose-600">
              Excluir Despesa?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tem certeza que deseja remover o custo de <strong>{deleteExpenseDialog?.expense_type}</strong> ({deleteExpenseDialog?.paid_to}) no valor de {formatCents(deleteExpenseDialog?.amount_cents || 0)}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => setDeleteExpenseDialog(null)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => deleteExpenseDialog && deleteExpenseMutation.mutate(deleteExpenseDialog.id)}
              disabled={deleteExpenseMutation.isPending}
              className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
            >
              {deleteExpenseMutation.isPending ? "Excluindo..." : "Sim, Excluir"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
