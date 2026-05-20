import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import logoLogin from "@/assets/logo-corrida-login.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Entrar — II Corrida das Famílias" }],
  }),
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/admin/dashboard",
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      throw redirect({ to: (search.redirect || "/admin/dashboard") as never });
    }
  },
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setLoading(false);
      const msg = error?.message.includes("Invalid login")
        ? "E-mail ou senha incorretos."
        : error?.message.includes("Email not confirmed")
          ? "E-mail ainda não confirmado."
          : "Não foi possível entrar. Tente novamente.";
      toast.error(msg);
      return;
    }

    toast.success("Bem-vindo!");
    navigate({ to: (search.redirect || "/admin/dashboard") as never, replace: true });
    router.invalidate();
  }

  async function onForgot() {
    if (!email) {
      toast.error("Informe seu e-mail acima primeiro.");
      return;
    }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetting(false);
    if (error) toast.error("Não foi possível enviar o e-mail de recuperação.");
    else toast.success("Enviamos um link de recuperação para seu e-mail.");
  }

  return (
    <>
      <PageHeader eyebrow="Acesso restrito" title="Entrar" description="Painel da equipe organizadora." />
      <ContentSection>
        <div className="mx-auto mb-8 flex w-full max-w-md justify-center">
          <img
            src={logoLogin}
            alt="II Corrida das Famílias"
            className="h-24 w-auto md:h-32"
            loading="eager"
            decoding="async"
          />
        </div>
        <form
          onSubmit={onSubmit}
          className="mx-auto w-full max-w-md space-y-5 rounded-3xl border border-border bg-white p-8 shadow-soft"
        >
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <button
            type="button"
            onClick={onForgot}
            disabled={resetting}
            className="block w-full text-center text-sm text-[color:var(--color-brand-purple-text)] underline-offset-4 hover:underline"
          >
            {resetting ? "Enviando..." : "Esqueci minha senha"}
          </button>
        </form>
      </ContentSection>
    </>
  );
}
