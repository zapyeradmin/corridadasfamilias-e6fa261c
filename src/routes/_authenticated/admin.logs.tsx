import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { listAccessLogs } from "@/lib/admin.functions";
import { formatDateTimeBR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportAccessLogsToPdf } from "@/lib/export-logs-pdf";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/_authenticated/admin/logs")({
  head: () => ({ meta: [{ title: "Admin · Logs" }] }),
  component: Page,
});

function Page() {
  const fetchList = useServerFn(listAccessLogs);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "logs"], queryFn: () => fetchList() });
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [isExporting, setIsExporting] = useState(false);

  const total = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const pageRows = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  const handleExport = async () => {
    if (!data || data.length === 0) return;
    setIsExporting(true);
    try {
      exportAccessLogsToPdf(data);
      toast.success("Relatório exportado com sucesso.");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao gerar o PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const commitPageInput = () => {
    const n = Number.parseInt(pageInput, 10);
    if (Number.isNaN(n)) {
      setPageInput(String(page));
      return;
    }
    const clamped = Math.min(Math.max(1, n), totalPages);
    setPage(clamped);
    setPageInput(String(clamped));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Logs de acesso</h1>
        <Button
          onClick={handleExport}
          disabled={isExporting || !data || data.length === 0}
          className="gap-2"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Exportar Logs de Acesso
        </Button>
      </header>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Ator</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Entidade</th>
              <th className="px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTimeBR(l.created_at)}</td>
                <td className="px-4 py-3 text-xs">{l.actor_email ?? l.actor_id ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">{l.action}</td>
                <td className="px-4 py-3 text-xs">{l.entity_type ?? "—"} {l.entity_id ? `· ${l.entity_id.slice(0, 8)}` : ""}</td>
                <td className="px-4 py-3"><pre className="whitespace-pre-wrap font-mono text-[11px]">{JSON.stringify(l.details, null, 2)}</pre></td>
              </tr>
            ))}
            {data && data.length === 0 && !isLoading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Sem logs ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Paginação dos logs" className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={commitPageInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitPageInput();
                }
              }}
              className="h-9 w-16 text-center"
              aria-label="Página atual"
            />
            <span className="text-muted-foreground">de {totalPages}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
