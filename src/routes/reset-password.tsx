import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Redefinir senha — II Corrida das Famílias" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase auth helper parses recovery hash automatically when SDK loads.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível atualizar a senha.");
      return;
    }
    toast.success("Senha atualizada!");
    navigate({ to: "/admin/dashboard" });
  }

  return (
    <>
      <PageHeader eyebrow="Acesso restrito" title="Redefinir senha" />
      <ContentSection>
        <form
          onSubmit={onSubmit}
          className="mx-auto w-full max-w-md space-y-5 rounded-3xl border border-border bg-white p-8 shadow-soft"
        >
          {!ready ? (
            <p className="text-sm text-muted-foreground">
              Abra esta página pelo link enviado no seu e-mail para continuar.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </>
          )}
        </form>
      </ContentSection>
    </>
  );
}
