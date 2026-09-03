import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="heading-display text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-extrabold uppercase tracking-tight text-foreground">
          Página não encontrada
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-orange px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">
          Algo deu errado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente ou volte ao início.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-primary-foreground"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-foreground"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#e70202" },
      { title: "2ª Corrida Natalina | Corre +" },
      {
        name: "description",
        content:
          "2ª Corrida Natalina em Serra Talhada/PE. Corre + — Saúde, esporte, celebração e confraternização.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:title", content: "2ª Corrida Natalina | Corre +" },
      {
        property: "og:description",
        content:
          "2ª Corrida Natalina em Serra Talhada/PE. Corre + — Saúde, esporte, celebração e confraternização.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/24NXY8uInCbJ0YtSRcez5EU2T9E3/social-images/social-1778899143554-banner-1.webp",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "2ª Corrida Natalina | Corre +" },
      {
        name: "twitter:description",
        content:
          "2ª Corrida Natalina (Edição 2026) | Corre +. Uma corrida de 6km em Serra Talhada/PE no dia 20 de dezembro de 2026.",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/24NXY8uInCbJ0YtSRcez5EU2T9E3/social-images/social-1778899143554-banner-1.webp",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap",
      },
      {
        rel: "preconnect",
        href: "https://ljquyrrprrwqpmaomwsh.supabase.co",
        crossOrigin: "anonymous",
      },
      { rel: "dns-prefetch", href: "https://ljquyrrprrwqpmaomwsh.supabase.co" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        qc.clear();
      } else {
        qc.invalidateQueries();
      }
      router.invalidate();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <WhatsAppFab />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
