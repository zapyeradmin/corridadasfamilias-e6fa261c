import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  MessageCircle,
  Copy,
  Check,
  Search,
  ExternalLink,
  Users,
  DollarSign,
  AlertCircle,
  Shirt,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatCents, formatDateTimeBR } from "@/lib/format";

export const PENDING_WHATSAPP_MESSAGE = `Olá! Passando para te lembrar que sua inscrição para a *2ª Corrida Natalina* ainda está com o *pagamento pendente*.

⚠️ *Sua inscrição só será confirmada após a realização do pagamento.*

Não corra o risco de ficar de fora! Estamos avançando nas inscrições e sua vaga ainda precisa ser efetivada.

🎄🏃‍♂️ *Garanta agora sua participação na 2ª Corrida Natalina e venha viver essa experiência com a gente no dia 20 de dezembro de 2026!*

Se você já realizou o pagamento, envie o comprovante por aqui para confirmarmos sua inscrição. ✅

*Não deixe para depois. Finalize sua inscrição agora!*

*2ª Corrida Natalina*
Equipe CORRE+`;

export function buildPendingWhatsAppUrl(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  const fullPhone = digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(PENDING_WHATSAPP_MESSAGE)}`;
}

export interface PendingAthlete {
  id: string;
  protocol: string;
  full_name: string;
  email: string;
  whatsapp: string;
  amount_cents: number;
  category: string;
  shirt_size: string;
  created_at: string;
}

export interface RecentAthlete {
  id: string;
  protocol: string;
  full_name: string;
  status: string;
  amount_cents: number;
  created_at: string;
  category?: string;
  gender?: string;
  whatsapp?: string;
}

export interface TimelineItem {
  date: string;
  total: number;
  paid: number;
  pending: number;
}

export interface DashboardAnalyticsData {
  totalRegistrations: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byGender: Record<string, number>;
  byShirtSize: Record<string, number>;
  timeline: TimelineItem[];
  revenueCents: number;
  pendingRevenueCents: number;
  ticketMedioCents: number;
  conversionRate: number;
  lotCount?: number;
  recent: RecentAthlete[];
  pendingAthletes: PendingAthlete[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid: { label: "Pagas", color: "#16a34a" },
  pending: { label: "Pendentes", color: "#f59e0b" },
  processing: { label: "Processando", color: "#3b82f6" },
  canceled: { label: "Canceladas", color: "#ef4444" },
  refunded: { label: "Reembolsadas", color: "#8b5cf6" },
};

const GENDER_CONFIG: Record<string, { label: string; color: string }> = {
  M: { label: "Masculino", color: "#2563eb" },
  F: { label: "Feminino", color: "#ec4899" },
  Outro: { label: "Outro", color: "#8b5cf6" },
};

export function DashboardAnalyticsModal({
  data,
  trigger,
}: {
  data?: DashboardAnalyticsData;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("graficos");
  const [pendingSearch, setPendingSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pendingList = data?.pendingAthletes ?? [];

  const filteredPending = useMemo(() => {
    if (!pendingSearch.trim()) return pendingList;
    const q = pendingSearch.toLowerCase().trim();
    return pendingList.filter(
      (a) =>
        a.full_name?.toLowerCase().includes(q) ||
        a.protocol?.toLowerCase().includes(q) ||
        a.whatsapp?.includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q),
    );
  }, [pendingList, pendingSearch]);

  const statusChartData = useMemo(() => {
    if (!data?.byStatus) return [];
    return Object.entries(data.byStatus)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: STATUS_CONFIG[status]?.label ?? status,
        value: count,
        color: STATUS_CONFIG[status]?.color ?? "#6b7280",
      }));
  }, [data?.byStatus]);

  const genderChartData = useMemo(() => {
    if (!data?.byGender) return [];
    return Object.entries(data.byGender)
      .filter(([_, count]) => count > 0)
      .map(([gender, count]) => ({
        name: GENDER_CONFIG[gender]?.label ?? gender,
        value: count,
        color: GENDER_CONFIG[gender]?.color ?? "#9ca3af",
      }));
  }, [data?.byGender]);

  const categoryChartData = useMemo(() => {
    if (!data?.byCategory) return [];
    return Object.entries(data.byCategory)
      .map(([category, count]) => ({
        name: category || "Sem Categoria",
        inscricoes: count,
      }))
      .sort((a, b) => b.inscricoes - a.inscricoes);
  }, [data?.byCategory]);

  const shirtChartData = useMemo(() => {
    if (!data?.byShirtSize) return [];
    const order = ["PP", "P", "M", "G", "GG", "XGG"];
    return order
      .filter((size) => (data.byShirtSize[size] ?? 0) >= 0)
      .map((size) => ({
        size,
        quantidade: data.byShirtSize[size] ?? 0,
      }));
  }, [data?.byShirtSize]);

  const timelineChartData = useMemo(() => {
    if (!data?.timeline || data.timeline.length === 0) return [];
    return data.timeline.map((item) => {
      const parts = item.date.split("-");
      const day = parts[2] || "";
      const month = parts[1] || "";
      return {
        ...item,
        displayDate: `${day}/${month}`,
      };
    });
  }, [data?.timeline]);

  function copyMessage(athlete: PendingAthlete) {
    navigator.clipboard.writeText(PENDING_WHATSAPP_MESSAGE);
    setCopiedId(athlete.id);
    toast.success(`Mensagem de cobrança copiada para ${athlete.full_name}!`);
    setTimeout(() => setCopiedId(null), 2500);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c20505] to-[#800000] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <BarChart3 className="h-4 w-4" />
            Central de Gráficos & WhatsApp
            {pendingList.length > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-black">
                {pendingList.length} pendentes
              </span>
            )}
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-0 sm:max-w-6xl">
        <div className="flex h-full max-h-[92vh] flex-col bg-background">
          {/* Header */}
          <div className="border-b border-border bg-gradient-to-r from-[#fff5f5] via-white to-[#fff8f0] px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <DialogTitle className="text-xl font-extrabold uppercase tracking-tight text-[#c20505]">
                    Dashboard Analítico & Gestão de Pendentes
                  </DialogTitle>
                </div>
                <DialogDescription className="mt-1 text-xs text-muted-foreground">
                  Métricas em tempo real, gráficos de distribuição e cobrança direta via WhatsApp para a 2ª Corrida Natalina.
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Tempo Real Ativo
                </span>
              </div>
            </div>

            {/* Quick KPI Strip */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              <div className="rounded-xl border border-border bg-white p-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Inscritos</span>
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <p className="mt-1 text-xl font-extrabold text-[#3d0000]">
                  {data?.totalRegistrations ?? 0}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {data?.conversionRate ?? 0}% taxa de confirmação
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                  <span>Inscrições Pagas</span>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="mt-1 text-xl font-extrabold text-emerald-700">
                  {data?.byStatus?.paid ?? 0}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">
                  {formatCents(data?.revenueCents ?? 0)} confirmados
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-amber-700 font-semibold">
                  <span>Pendentes</span>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <p className="mt-1 text-xl font-extrabold text-amber-700">
                  {data?.byStatus?.pending ?? 0}
                </p>
                <p className="text-[10px] text-amber-600 font-medium">
                  {formatCents(data?.pendingRevenueCents ?? 0)} a receber
                </p>
              </div>

              <div className="rounded-xl border border-border bg-white p-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Ticket Médio</span>
                  <DollarSign className="h-3.5 w-3.5 text-purple-500" />
                </div>
                <p className="mt-1 text-xl font-extrabold text-[#3d0000]">
                  {formatCents(data?.ticketMedioCents ?? 9600)}
                </p>
                <p className="text-[10px] text-muted-foreground">Valor por atleta (Lote 2)</p>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-white p-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>A Cobrar WhatsApp</span>
                  <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                </div>
                <p className="mt-1 text-xl font-extrabold text-green-600">
                  {pendingList.length}
                </p>
                <p className="text-[10px] text-muted-foreground">Com contato registrado</p>
              </div>
            </div>
          </div>

          {/* Body Content with Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="border-b border-border bg-muted/20 px-6 py-2">
              <TabsList className="bg-muted">
                <TabsTrigger value="graficos" className="gap-2 text-xs font-bold cursor-pointer">
                  <BarChart3 className="h-4 w-4" />
                  Gráficos & Métricas
                </TabsTrigger>
                <TabsTrigger value="pendentes" className="gap-2 text-xs font-bold cursor-pointer">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  Inscrições Pendentes ({pendingList.length})
                </TabsTrigger>
                <TabsTrigger value="ultimas" className="gap-2 text-xs font-bold cursor-pointer">
                  <TrendingUp className="h-4 w-4" />
                  Últimas Inscrições
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: GRÁFICOS */}
            <TabsContent
              value="graficos"
              className="flex-1 overflow-y-auto p-6 space-y-6 m-0"
            >
              {/* Row 1: Pie Charts (Status and Gender) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Donut Chart */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#c20505] flex items-center gap-2">
                        <PieIcon className="h-4 w-4" /> Inscrições por Status
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Pagas vs Pendentes vs Canceladas
                      </p>
                    </div>
                  </div>
                  {statusChartData.length === 0 ? (
                    <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
                      Sem dados de inscrições no momento.
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            label={({ name, percent }) =>
                              `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-status-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any, name: any) => [`${value} inscrições`, name]}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Gender Donut Chart */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#c20505] flex items-center gap-2">
                        <Users className="h-4 w-4" /> Inscrições por Gênero
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Participação Masculina e Feminina
                      </p>
                    </div>
                  </div>
                  {genderChartData.length === 0 ? (
                    <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
                      Sem dados de gênero cadastrados.
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genderChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            label={({ name, percent }) =>
                              `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {genderChartData.map((entry, index) => (
                              <Cell key={`cell-gender-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any, name: any) => [`${value} atletas`, name]}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Timeline Line / Area Chart */}
              <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#c20505] flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Evolução de Inscrições ao Longo dos Dias
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Volume diário de novos inscritos e inscrições confirmadas (pagas)
                    </p>
                  </div>
                </div>

                {timelineChartData.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
                    Dados insuficientes para gerar a linha do tempo.
                  </div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={timelineChartData}
                        margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c20505" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#c20505" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip
                          labelFormatter={(label) => `Data: ${label}`}
                          formatter={(value: any, name: any) => [
                            value,
                            name === "total"
                              ? "Total de Inscrições"
                              : name === "paid"
                                ? "Inscrições Pagas"
                                : "Inscrições Pendentes",
                          ]}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="total"
                          name="Total de Inscrições"
                          stroke="#c20505"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorTotal)"
                        />
                        <Area
                          type="monotone"
                          dataKey="paid"
                          name="Inscrições Pagas"
                          stroke="#16a34a"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPaid)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Row 3: Bar Charts (Categories & Shirt Sizes) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories Bar Chart */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#c20505] flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Inscrições por Categoria
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Distribuição de atletas nas modalidades
                      </p>
                    </div>
                  </div>
                  {categoryChartData.length === 0 ? (
                    <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
                      Nenhuma categoria registrada ainda.
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryChartData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={110}
                            tick={{ fontSize: 10 }}
                          />
                          <Tooltip
                            formatter={(value: any) => [`${value} inscrições`, "Quantidade"]}
                          />
                          <Bar dataKey="inscricoes" fill="#c20505" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Shirt Sizes Bar Chart */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#c20505] flex items-center gap-2">
                        <Shirt className="h-4 w-4" /> Tamanhos de Camiseta
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Controle de estoque e confecção dos kits
                      </p>
                    </div>
                  </div>
                  {shirtChartData.length === 0 ? (
                    <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
                      Sem tamanhos registrados.
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={shirtChartData}
                          margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="size" tick={{ fontSize: 11, fontWeight: "bold" }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(value: any) => [`${value} unidades`, "Camisetas"]}
                          />
                          <Bar dataKey="quantidade" fill="#0284c7" radius={[4, 4, 0, 0]}>
                            {shirtChartData.map((_, index) => (
                              <Cell
                                key={`cell-shirt-${index}`}
                                fill={index % 2 === 0 ? "#0284c7" : "#0369a1"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: INSCRIÇÕES PENDENTES & WHATSAPP */}
            <TabsContent
              value="pendentes"
              className="flex-1 overflow-y-auto p-6 space-y-4 m-0"
            >
              {/* Box of message template info */}
              <div className="rounded-xl border border-green-200 bg-green-50/70 p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-green-700 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-green-900">
                      Mensagem Padronizada de Cobrança WhatsApp
                    </p>
                    <p className="mt-0.5 text-green-800">
                      Ao clicar em <strong>&quot;Falar no WhatsApp&quot;</strong>, o link abre a conversa com o atleta tendo o texto oficial já preenchido. Você também pode copiar a mensagem para a área de transferência.
                    </p>
                  </div>
                </div>
              </div>

              {/* Search & Actions Bar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, protocolo ou whatsapp..."
                    value={pendingSearch}
                    onChange={(e) => setPendingSearch(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-xs outline-none focus:border-[#c20505] focus:ring-1 focus:ring-[#c20505]"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span>
                    Exibindo {filteredPending.length} de {pendingList.length} atleta(s) pendente(s)
                  </span>
                </div>
              </div>

              {/* Table of Pending Athletes */}
              <div className="overflow-x-auto rounded-xl border border-border bg-white">
                <table className="w-full text-xs">
                  <thead className="bg-[#fbf6f5] text-left uppercase tracking-wider text-[#c20505] font-bold">
                    <tr>
                      <th className="px-4 py-3">Protocolo</th>
                      <th className="px-4 py-3">Atleta</th>
                      <th className="px-4 py-3">WhatsApp</th>
                      <th className="px-4 py-3">Categoria / Camiseta</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3 text-right">Ação WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPending.map((athlete) => {
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
                              {/* Copy message button */}
                              <button
                                type="button"
                                onClick={() => copyMessage(athlete)}
                                title="Copiar mensagem de cobrança"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
                              >
                                {isCopied ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {/* WhatsApp link button */}
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
                                  Sem telefone
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredPending.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          {pendingList.length === 0
                            ? "Nenhuma inscrição pendente no momento! Todas estão confirmadas."
                            : "Nenhum atleta pendente encontrado com os termos pesquisados."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* TAB 3: ÚLTIMAS INSCRIÇÕES */}
            <TabsContent
              value="ultimas"
              className="flex-1 overflow-y-auto p-6 space-y-4 m-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#c20505]">
                    Inscrições Mais Recentes (Feed em Tempo Real)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Lista das últimas 50 inscrições registradas no sistema
                  </p>
                </div>
                <Link
                  to="/admin/inscricoes"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#c20505] hover:underline"
                >
                  Ver todas as inscrições <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-white">
                <table className="w-full text-xs">
                  <thead className="bg-[#fbf6f5] text-left uppercase tracking-wider text-[#c20505] font-bold">
                    <tr>
                      <th className="px-4 py-3">Protocolo</th>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(data?.recent ?? []).map((r) => {
                      const stCfg = STATUS_CONFIG[r.status] ?? {
                        label: r.status,
                        color: "#6b7280",
                      };
                      return (
                        <tr key={r.id} className="hover:bg-muted/30 transition">
                          <td className="px-4 py-3 font-mono font-bold text-foreground">
                            {r.protocol}
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground">
                            <Link
                              to="/admin/inscricoes/$id"
                              params={{ id: r.id }}
                              className="hover:text-[#c20505] hover:underline"
                            >
                              {r.full_name}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                              style={{ backgroundColor: stCfg.color }}
                            >
                              {stCfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{r.category || "—"}</td>
                          <td className="px-4 py-3 font-bold">{formatCents(r.amount_cents)}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDateTimeBR(r.created_at)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to="/admin/inscricoes/$id"
                              params={{ id: r.id }}
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11px] font-bold text-foreground hover:bg-muted"
                            >
                              Detalhes <ExternalLink className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}

                    {(data?.recent ?? []).length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhuma inscrição registrada ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
