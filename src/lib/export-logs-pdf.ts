import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateTimeBR } from "@/lib/format";

export type AccessLogRow = {
  id: string;
  created_at: string;
  actor_email: string | null;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: unknown;
};

export function exportAccessLogsToPdf(logs: AccessLogRow[]) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const generatedAt = formatDateTimeBR(new Date());

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Relatório de Logs de Acesso — Corrida das Famílias", 40, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Gerado em: ${generatedAt}`, 40, 58);
  doc.text(`Total de registros: ${logs.length}`, 40, 72);

  autoTable(doc, {
    startY: 90,
    head: [["Quando", "Ator", "Ação", "Entidade", "Detalhes"]],
    body: logs.map((l) => [
      formatDateTimeBR(l.created_at),
      l.actor_email ?? l.actor_id ?? "—",
      l.action,
      [l.entity_type ?? "—", l.entity_id ? l.entity_id.slice(0, 8) : null]
        .filter(Boolean)
        .join(" · "),
      (() => {
        try {
          return JSON.stringify(l.details ?? {}, null, 2);
        } catch {
          return String(l.details ?? "");
        }
      })(),
    ]),
    styles: { fontSize: 8, cellPadding: 4, valign: "top", overflow: "linebreak" },
    headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 140 },
      2: { cellWidth: 110 },
      3: { cellWidth: 110 },
      4: { cellWidth: "auto", font: "courier", fontSize: 7 },
    },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      const current = doc.getCurrentPageInfo().pageNumber;
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `Página ${current} de ${pageCount}`,
        pageWidth - 40,
        pageHeight - 20,
        { align: "right" },
      );
      doc.setTextColor(0);
    },
  });

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const filename = `logs-acesso-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.pdf`;
  doc.save(filename);
}
