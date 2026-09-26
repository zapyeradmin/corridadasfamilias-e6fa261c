import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  MessageCircle,
  RefreshCw,
  Users,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Shirt,
  PieChart as PieIcon,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { getDashboardKPIs } from "@/lib/admin.functions";
import { formatCents, formatDateTimeBR } from "@/lib/format";
import { useRegistrationsRealtime } from "@/hooks/use-registrations-realtime";
import {
  DashboardAnalyticsModal,
  buildPendingWhatsAppUrl,
  PENDING_WHATSAPP_MESSAGE,
} from "@/components/admin/dashboard-analytics-modal";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin · Dashboard — 2ª Corrida Natalina | Corre +" }] }),
  component: Page,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  processing: "Processando",
  paid: "Pago",
  canceled: "Cancelado",
  refunded: "Reembolsado",
};

const STATUS_COLOR: Record<string, string> = {
  paid: "#16a34a",
  pending: "#f59e0b",
  processing: "#3b82f6",
  canceled: "#ef4444",
  refunded: "#8b5cf6",
};

const PAGE_SIZE = 10;

function Page() {
  // Conecta ao Supabase Realtime para invalidar e recarregar os dados na hora
  useRegistrationsRealtime();

  const fetchKpis = useServerFn(getDashboardKPIs);
  const { data, error, isError, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "kpis"],
    queryFn: () => fetchKpis(),
  });

  const recent = useMemo(() => data?.recent ?? [], [data?.recent]);
  const totalPages = Math.max(1, Math.ceil(recent.length / PAGE_SIZE));
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageRows = useMemo(
    () => recent.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [recent, safePage],
  );

  const pendingList = useMemo(() => data?.pendingAthletes ?? [], [data?.pendingAthletes]);

  function goTo(p: number) {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    setPageInput(String(next));
  }

  function copyMessage(athlete: { id: string; full_name: string }) {
    navigator.clipboard.writeText(PENDING_WHATSAPP_MESSAGE);
    setCopiedId(athlete.id);
    toast.success(`Mensagem de cobrança copiada para ${athlete.full_name}!`);
    setTimeout(() => setCopiedId(null), 2500);
  }

  // Prepara dados rápidos para mini-gráficos na página
  const statusPieData = useMemo(() => {
    if (!data?.byStatus) return [];
    return [
      { name: "Pagas", value: data.byStatus.paid ?? 0, color: "#16a34a" },
      { name: "Pendentes", value: (data.byStatus.pending ?? 0) + (data.byStatus.processing ?? 0), color: "#f59e0b" },
      { name: "Canceladas", value: (data.byStatus.canceled ?? 0) + (data.byStatus.refunded ?? 0), color: "#ef4444" },
    ].filter((item) => item.value > 0);
  }, [data?.byStatus]);

  const genderPieData = useMemo(() => {
    if (!data?.byGender) return [];
    return [
      { name: "Masculino", value: data.byGender.M ?? 0, color: "#2563eb" },
      { name: "Feminino", value: data.byGender.F ?? 0, color: "#ec4899" },
    ].filter((item) => item.value > 0);
  }, [data?.byGender]);

  const categoriesBarData = useMemo(() => {
    if (!data?.byCategory) return [];
    return Object.entries(data.byCategory)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data?.byCategory]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#c20505]">
              Dashboard
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
            Visão geral em tempo real das inscrições, pagamentos e cobranças.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar dados agora"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-[#c20505]" : ""}`} />
          </button>

          {/* Modal Trigger Button */}
          <DashboardAnalyticsModal data={data} />
        </div>
      </header>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-white text-sm text-muted-foreground">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin text-[#c20505]" /> Carregando métricas em tempo real...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Não foi possível carregar o dashboard."}
        </div>
      ) : !data ? (
        <p className="text-sm text-[#3d0000]/60">Nenhum dado encontrado.</p>
      ) : (
        <>
          {/* Main KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-[#fbf6f5] p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c20505]">
                <span>Inscrições</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-[#3d0000]">{data.totalRegistrations}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {data.conversionRate}% confirmadas
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-700">
                <span>Pagas</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-emerald-700">{data.byStatus.paid ?? 0}</p>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">Inscrições efetivadas</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/50 p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700">
                <span>Pendentes</span>
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-amber-700">
                {(data.byStatus.pending ?? 0) + (data.byStatus.processing ?? 0)}
              </p>
              <p className="mt-1 text-[11px] text-amber-600 font-medium">Aguardando PIX/Cartão</p>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-[#fbf6f5] p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c20505]">
                <span>Receita Paga</span>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-xl font-extrabold text-[#3d0000]">
                {formatCents(data.revenueCents)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Confirmado no caixa</p>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-[#fbf6f5] p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700">
                <span>Receita Pendente</span>
                <DollarSign className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-xl font-extrabold text-amber-700">
                {formatCents(data.pendingRevenueCents)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Potencial a receber</p>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-[#fbf6f5] p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c20505]">
                <span>Ticket Médio</span>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <p className="mt-2 text-xl font-extrabold text-[#3d0000]">
                {formatCents(data.ticketMedioCents)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Por atleta pago</p>
            </div>
          </div>

          {/* Quick Charts Overview Card */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-tight text-[#c20505] flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Painel Visual de Desempenho
                </h2>
                <p className="text-xs text-muted-foreground">
                  Gráficos em tempo real integrados ao banco de dados do evento
                </p>
              </div>
              <DashboardAnalyticsModal
                data={data}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#c20505]/30 bg-[#c20505]/5 px-3 py-1.5 text-xs font-bold text-[#c20505] hover:bg-[#c20505]/10 cursor-pointer"
                  >
                    Ver Gráficos Detalhados no Modal →
                  </button>
                }
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mini Status Pie */}
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#c20505] mb-2 flex items-center gap-1.5">
                  <PieIcon className="h-3.5 w-3.5" /> Status das Inscrições
                </p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={60}
                        paddingAngle={3}
                      >
                        {statusPieData.map((e, idx) => (
                          <Cell key={`st-cell-${idx}`} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v} inscrições`]} />
                      <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Mini Gender Pie */}
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#c20505] mb-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Inscrições por Gênero
                </p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={60}
                        paddingAngle={3}
                      >
                        {genderPieData.map((e, idx) => (
                          <Cell key={`gd-cell-${idx}`} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v} atletas`]} />
                      <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Mini Categories Bar */}
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#c20505] mb-2 flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" /> Inscrições por Categoria
                </p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoriesBarData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: any) => [`${v} inscritos`, "Quantidade"]} />
                      <Bar dataKey="count" fill="#c20505" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Inscritos com Pagamento Pendente & Cobrança WhatsApp */}
          {pendingList.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/20 p-6 shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold uppercase tracking-tight text-amber-900 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600 fill-green-600" />
                      Inscrições Pendentes — Falar no WhatsApp
                    </h2>
                    <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-black">
                      {pendingList.length} atleta(s)
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1">
                    Envie a mensagem padronizada no WhatsApp com um clique para lembrar o atleta de confirmar sua vaga.
                  </p>
                </div>

                <DashboardAnalyticsModal
                  data={data}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#20ba59] cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4 fill-current" />
                      Abrir Central de WhatsApp Completa
                    </button>
                  }
                />
              </div>

              <div className="overflow-x-auto rounded-xl border border-amber-200 bg-white shadow-xs">
                <table className="w-full text-xs">
                  <thead className="bg-[#fbf6f5] text-left uppercase tracking-wider text-[#c20505] font-bold">
                    <tr>
                      <th className="px-4 py-3">Protocolo</th>
                      <th className="px-4 py-3">Atleta</th>
                      <th className="px-4 py-3">WhatsApp</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3 text-right">Cobrança WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingList.slice(0, 5).map((athlete) => {
                      const waUrl = buildPendingWhatsAppUrl(athlete.whatsapp);
                      const isCopied = copiedId === athlete.id;

                      return (
                        <tr key={athlete.id} className="hover:bg-muted/30 transition">
                          <td className="px-4 py-3 font-mono font-bold text-foreground">
                            {athlete.protocol}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to="/admin/inscricoes/$id"
                              params={{ id: athlete.id }}
                              className="font-bold text-foreground hover:text-[#c20505] hover:underline"
                            >
                              {athlete.full_name}
                            </Link>
                            {athlete.email && (
                              <p className="text-[11px] text-muted-foreground">{athlete.email}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {athlete.whatsapp || "Não informado"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {athlete.category || "—"}
                            </span>
                            {athlete.shirt_size && (
                              <span className="ml-1.5 inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                                {athlete.shirt_size}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground">
                            {formatCents(athlete.amount_cents)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDateTimeBR(athlete.created_at)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => copyMessage(athlete)}
                                title="Copiar mensagem"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
                              >
                                {isCopied ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {athlete.whatsapp ? (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#20ba59] active:scale-95"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 fill-current" />
                                  Falar no WhatsApp
                                </a>
                              ) : (
                                <span className="text-[11px] text-muted-foreground italic">
                                  Sem número
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pendingList.length > 5 && (
                <div className="mt-3 text-center">
                  <DashboardAnalyticsModal
                    data={data}
                    trigger={
                      <button
                        type="button"
                        className="text-xs font-bold text-amber-900 hover:underline cursor-pointer"
                      >
                        Ver todos os {pendingList.length} atletas pendentes no Modal →
                      </button>
                    }
                  />
                </div>
              )}
            </section>
          )}

          {/* Section: Últimas Inscrições */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#c20505]">
                Últimas inscrições
              </h2>
              <Link
                to="/admin/inscricoes"
                className="text-sm font-semibold text-[#c20505] hover:underline"
              >
                Ver todas →
              </Link>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-xs">
              <table className="w-full text-sm">
                <thead className="bg-[#fbf6f5] text-left text-xs uppercase tracking-wider text-[#c20505] font-bold">
                  <tr>
                    <th className="px-4 py-3">Protocolo</th>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Criada</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => {
                    const statusColor = STATUS_COLOR[r.status] ?? "#6b7280";
                    return (
                      <tr key={r.id} className="border-t border-border hover:bg-muted/20 transition">
                        <td className="px-4 py-3 font-mono text-xs font-bold">{r.protocol}</td>
                        <td className="px-4 py-3">
                          <Link
                            to="/admin/inscricoes/$id"
                            params={{ id: r.id }}
                            className="font-semibold text-foreground hover:text-[#c20505] hover:underline"
                          >
                            {r.full_name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                            style={{ backgroundColor: statusColor }}
                          >
                            {STATUS_LABEL[r.status] ?? r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{r.category || "—"}</td>
                        <td className="px-4 py-3 font-semibold">{formatCents(r.amount_cents)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDateTimeBR(r.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                  {pageRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-sm text-muted-foreground"
                      >
                        Nenhuma inscrição ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {recent.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goTo(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Página anterior"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const n = Number(pageInput);
                    if (Number.isFinite(n)) goTo(Math.floor(n));
                    else setPageInput(String(safePage));
                  }}
                  className="flex items-center gap-1.5 text-sm font-semibold"
                >
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={() => {
                      const n = Number(pageInput);
                      if (Number.isFinite(n)) goTo(Math.floor(n));
                      else setPageInput(String(safePage));
                    }}
                    className="h-9 w-14 rounded-lg border border-border bg-white text-center font-bold tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label="Página atual"
                  />
                  <span className="text-muted-foreground">/ {totalPages}</span>
                </form>
                <button
                  type="button"
                  onClick={() => goTo(safePage + 1)}
                  disabled={safePage >= totalPages}
                  aria-label="Próxima página"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
