import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2, Plus, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  listSponsorsAdmin,
  getSponsorAdmin,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  uploadSponsorLogo,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDateTimeBR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/patrocinadores")({
  head: () => ({ meta: [{ title: "Admin · Patrocinadores" }] }),
  component: Page,
});

const PAGE_SIZE = 8;
const TIER_OPTIONS = [
  { value: "diamond", label: "Patrocínio Diamante" },
  { value: "gold", label: "Patrocínio Ouro" },
  { value: "silver", label: "Patrocínio Prata" },
] as const;
const TIER_LABEL: Record<string, string> = {
  diamond: "Patrocínio Diamante",
  gold: "Patrocínio Ouro",
  silver: "Patrocínio Prata",
  standard: "Apoiador",
};

type SponsorRow = {
  id: string;
  name: string;
  tier: string;
  logo_url: string;
  website_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

function Page() {
  const fetchList = useServerFn(listSponsorsAdmin);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<SponsorRow | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "sponsors", search, tier, page],
    queryFn: () => fetchList({ data: { search, tier, page, pageSize: PAGE_SIZE } }),
  });

  const rows = (data?.rows ?? []) as SponsorRow[];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  function goTo(n: number) {
    const clamped = Math.min(totalPages, Math.max(1, Math.floor(n) || 1));
    setPage(clamped);
  }

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["admin", "sponsors"] });
    qc.invalidateQueries({ queryKey: ["sponsors"] });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight">Patrocinadores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.total} patrocinadores` : "—"}
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpenForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar patrocinador
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar pelo nome da empresa"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="max-w-xs"
        />
        <Select value={tier} onValueChange={(v) => { setPage(1); setTier(v); }}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {TIER_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading && (
          <p className="col-span-full text-sm text-muted-foreground">Carregando…</p>
        )}
        {!isLoading && rows.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">Nenhum patrocinador encontrado.</p>
        )}
        {rows.map((s) => (
          <div key={s.id} className="flex flex-col rounded-xl border border-border bg-white p-3 shadow-soft">
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              <img
                src={s.logo_url}
                alt={s.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-3 truncate text-sm font-bold">{s.name}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {TIER_LABEL[s.tier] ?? s.tier}
            </p>
            <div className="mt-3 flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-8 flex-1 gap-1 px-2" onClick={() => setViewingId(s.id)}>
                <Eye className="h-3.5 w-3.5" /> Ver
              </Button>
              <Button size="sm" variant="ghost" className="h-8 flex-1 gap-1 px-2" onClick={() => { setEditing(s); setOpenForm(true); }}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
              <Button size="sm" variant="ghost" className="h-8 flex-1 gap-1 px-2 text-destructive hover:text-destructive" onClick={() => setDeletingId(s.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="icon" onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => goTo(Number(pageInput))}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            className="h-9 w-16 text-center"
          />
          <span className="text-muted-foreground">de {totalPages}</span>
        </div>
        <Button variant="outline" size="icon" onClick={() => goTo(page + 1)} disabled={page >= totalPages} aria-label="Próxima página">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <SponsorFormDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        editing={editing}
        onSaved={invalidateAll}
      />
      <SponsorViewDialog
        id={viewingId}
        onClose={() => setViewingId(null)}
      />
      <DeleteSponsorDialog
        id={deletingId}
        onClose={() => setDeletingId(null)}
        onDeleted={invalidateAll}
      />
    </div>
  );
}

function SponsorFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: SponsorRow | null;
  onSaved: () => void;
}) {
  const upload = useServerFn(uploadSponsorLogo);
  const create = useServerFn(createSponsor);
  const update = useServerFn(updateSponsor);

  const [name, setName] = useState("");
  const [tier, setTier] = useState<"diamond" | "gold" | "silver">("diamond");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setTier(((editing?.tier as "diamond" | "gold" | "silver") ?? "diamond"));
      setLink(editing?.website_url ?? "");
      setFile(null);
      setPreview(editing?.logo_url ?? null);
    }
  }, [open, editing]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = ["image/png", "image/webp", "image/jpeg"].includes(f.type);
    if (!ok) { toast.error("Formato inválido. Use PNG, WEBP ou JPG."); return; }
    if (f.size > 2 * 1024 * 1024) { toast.error("Arquivo excede 2 MB."); return; }
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth !== 960 || img.naturalHeight !== 540) {
        toast.error(`Dimensão inválida (${img.naturalWidth}×${img.naturalHeight}). Use exatamente 960×540.`);
        URL.revokeObjectURL(url);
        if (fileRef.current) fileRef.current.value = "";
        return;
      }
      setFile(f);
      setPreview(url);
    };
    img.onerror = () => { toast.error("Não foi possível ler a imagem."); URL.revokeObjectURL(url); };
    img.src = url;
  }

  async function fileToBase64(f: File): Promise<string> {
    const buf = await f.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Informe o nome."); return; }
    if (link.trim()) {
      try { new URL(link.trim()); } catch { toast.error("Link inválido. Inclua https://"); return; }
    }
    if (!editing && !file) { toast.error("Selecione a logomarca."); return; }
    setSubmitting(true);
    try {
      let logoUrl = editing?.logo_url ?? "";
      if (file) {
        const dataBase64 = await fileToBase64(file);
        const ct = (file.type === "image/jpeg" ? "image/jpeg" : file.type) as
          | "image/png" | "image/webp" | "image/jpeg";
        const res = await upload({ data: { filename: file.name, contentType: ct, dataBase64 } });
        logoUrl = res.publicUrl;
      }
      if (editing) {
        await update({
          data: {
            id: editing.id,
            name: name.trim(),
            tier,
            website_url: link.trim() || null,
            ...(file ? { logo_url: logoUrl } : {}),
          },
        });
        toast.success("Patrocinador atualizado.");
      } else {
        await create({
          data: {
            name: name.trim(),
            tier,
            website_url: link.trim() || null,
            logo_url: logoUrl,
          },
        });
        toast.success("Patrocinador adicionado.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar patrocinador" : "Adicionar patrocinador"}</DialogTitle>
          <DialogDescription>
            Os dados são publicados imediatamente na home e na página de patrocinadores.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sp-name">Nome do patrocinador</Label>
            <Input id="sp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Empresa XYZ" maxLength={180} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-tier">Tipo de patrocínio</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as typeof tier)}>
              <SelectTrigger id="sp-tier"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIER_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-link">Link do patrocinador</Label>
            <Input
              id="sp-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://site.com / https://instagram.com/... / https://wa.me/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Logomarca (PNG, WEBP ou JPG · 960×540 · até 2 MB)</Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" /> {file ? "Trocar arquivo" : editing ? "Trocar logo" : "Selecionar"}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/webp,image/jpeg"
                className="hidden"
                onChange={onFile}
              />
              {file && <span className="truncate text-xs text-muted-foreground">{file.name}</span>}
            </div>
            {preview && (
              <div className="mt-2 aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                <img src={preview} alt="prévia" className="h-full w-full object-contain" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Salvando…" : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SponsorViewDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const fetchOne = useServerFn(getSponsorAdmin);
  const { data } = useQuery({
    queryKey: ["admin", "sponsor", id],
    queryFn: () => fetchOne({ data: { id: id! } }),
    enabled: !!id,
  });
  const open = !!id;
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do patrocinador</DialogTitle>
        </DialogHeader>
        {!data ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <div className="space-y-3">
            <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
              <img src={data.logo_url} alt={data.name} className="h-full w-full object-contain" />
            </div>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <Row label="Nome" value={data.name} />
              <Row label="Tipo" value={TIER_LABEL[data.tier] ?? data.tier} />
              <Row label="Link" value={
                data.website_url ? (
                  <a href={data.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-2">
                    {data.website_url} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : "—"
              } />
              <Row label="Status" value={data.is_published ? "Publicado" : "Oculto"} />
              <Row label="Criado em" value={formatDateTimeBR(data.created_at)} />
              <Row label="Atualizado em" value={formatDateTimeBR(data.updated_at)} />
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/70 pb-2 last:border-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm">{value}</dd>
    </div>
  );
}

function DeleteSponsorDialog({ id, onClose, onDeleted }: { id: string | null; onClose: () => void; onDeleted: () => void }) {
  const del = useServerFn(deleteSponsor);
  const mut = useMutation({
    mutationFn: () => del({ data: { id: id! } }),
    onSuccess: () => { toast.success("Patrocinador excluído."); onDeleted(); onClose(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao excluir."),
  });
  const open = !!id;
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir patrocinador?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O patrocinador será removido da home e da página pública.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mut.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Excluindo…" : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
