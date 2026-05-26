import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Save, Upload, Video } from "lucide-react";
import { updateSiteContacts, updateHomeVideo, uploadHomeVideoCover } from "@/lib/admin.functions";
import { getSiteContacts, getHomeVideo } from "@/lib/public.functions";
import { parseYoutubeId } from "@/lib/youtube";

export function TabContatos() {
  const fetch = useServerFn(getSiteContacts);
  const save = useServerFn(updateSiteContacts);
  const fetchVideo = useServerFn(getHomeVideo);
  const saveVideo = useServerFn(updateHomeVideo);
  const uploadCover = useServerFn(uploadHomeVideoCover);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["public", "site-contacts"], queryFn: () => fetch() });
  const { data: video } = useQuery({ queryKey: ["public", "home-video"], queryFn: () => fetchVideo() });

  const [local, setLocal] = useState("");
  const [email, setEmail] = useState("");
  const [whats, setWhats] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [igUser, setIgUser] = useState("");

  const [ytUrl, setYtUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data) return;
    setLocal(data.local);
    setEmail(data.email_oficial);
    setWhats(data.whatsapp_oficial);
    setIgUrl(data.instagram_url);
    setIgUser(data.instagram_usuario);
  }, [data]);

  useEffect(() => {
    if (!video) return;
    setYtUrl(video.youtube_url);
    setCoverUrl(video.cover_url);
  }, [video]);

  const mutation = useMutation({
    mutationFn: async () =>
      save({
        data: {
          local: local.trim(),
          email_oficial: email.trim(),
          whatsapp_oficial: whats.trim(),
          instagram_url: igUrl.trim(),
          instagram_usuario: igUser.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Contatos atualizados.");
      qc.invalidateQueries({ queryKey: ["public", "site-contacts"] });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao salvar."),
  });

  const videoMutation = useMutation({
    mutationFn: async () =>
      saveVideo({ data: { youtube_url: ytUrl.trim(), cover_url: coverUrl.trim() } }),
    onSuccess: () => {
      toast.success("Vídeo de lançamento atualizado.");
      qc.invalidateQueries({ queryKey: ["public", "home-video"] });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao salvar o vídeo."),
  });

  async function handleFile(file: File) {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Arquivo excede 3 MB.");
      return;
    }
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const res = await uploadCover({
        data: {
          filename: file.name,
          contentType: file.type as "image/png" | "image/jpeg" | "image/jpg" | "image/webp",
          dataBase64: b64,
        },
      });
      setCoverUrl(res.publicUrl);
      toast.success("Capa enviada. Lembre de salvar.");
    } catch (e) {
      toast.error((e as Error).message || "Falha no upload.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const detectedId = parseYoutubeId(ytUrl);

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <header>
          <h2 className="text-lg font-extrabold">Contatos Oficiais</h2>
          <p className="text-sm text-muted-foreground">
            Esses dados aparecem no rodapé, botão flutuante de WhatsApp e demais links de contato do site.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Local">
            <input className={inputCls} value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Igreja Matriz... em Serra Talhada/PE" />
          </Field>
          <Field label="E-mail Oficial">
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@exemplo.com" />
          </Field>
          <Field label="WhatsApp Oficial (apenas dígitos, com DDD)">
            <input className={inputCls} value={whats} onChange={(e) => setWhats(e.target.value)} placeholder="5587981149806" inputMode="numeric" />
          </Field>
          <Field label="Usuário do Instagram">
            <input className={inputCls} value={igUser} onChange={(e) => setIgUser(e.target.value)} placeholder="corridadasfamilias" />
          </Field>
          <Field label="URL do Instagram" className="md:col-span-2">
            <input type="url" className={inputCls} value={igUrl} onChange={(e) => setIgUrl(e.target.value)} placeholder="https://www.instagram.com/..." />
          </Field>
        </div>

        <div>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Salvar Contatos
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <header>
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Video className="h-5 w-5" /> Vídeo de Lançamento (Home)
          </h2>
          <p className="text-sm text-muted-foreground">
            Esta URL e capa aparecem na seção <strong>“Inscrições abertas”</strong> da página inicial. Deixe em branco para usar o vídeo e capa padrão.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Adicionar URL do YouTube" className="md:col-span-2">
            <input
              type="url"
              className={inputCls}
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {ytUrl && (
              <p className={`mt-1 text-xs ${detectedId ? "text-muted-foreground" : "text-destructive"}`}>
                {detectedId ? `ID detectado: ${detectedId}` : "URL do YouTube inválida."}
              </p>
            )}
          </Field>

          <Field label="Capa do Vídeo (JPG, PNG ou WEBP — até 3 MB)" className="md:col-span-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
                disabled={uploading}
                className="text-sm"
              />
              {uploading && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Upload className="h-3 w-3 animate-pulse" /> Enviando…
                </span>
              )}
            </div>
            {coverUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-border bg-muted">
                <img src={coverUrl} alt="Pré-visualização da capa" className="aspect-video w-full max-w-md object-cover" />
                <div className="flex items-center justify-between gap-2 px-2 py-1 text-xs">
                  <span className="truncate text-muted-foreground">{coverUrl}</span>
                  <button
                    type="button"
                    onClick={() => setCoverUrl("")}
                    className="text-destructive hover:underline"
                  >
                    Remover
                  </button>
                </div>
              </div>
            )}
          </Field>
        </div>

        <div>
          <button
            type="button"
            onClick={() => videoMutation.mutate()}
            disabled={videoMutation.isPending || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Salvar Vídeo
          </button>
        </div>
      </section>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
