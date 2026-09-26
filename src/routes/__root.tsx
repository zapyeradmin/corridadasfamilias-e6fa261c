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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SportsEvent",
      "@id": "https://corridascorremais.com.br/#event",
      "name": "2ª Corrida Natalina | Corre +",
      "description":
        "2ª Corrida Natalina em Serra Talhada/PE (20 de Dezembro de 2026). Percurso de 6km com largada no Shopping Serra Talhada (Beach Garden), kits exclusivos, premiação em dinheiro e troféus.",
      "startDate": "2026-12-20T06:00:00-03:00",
      "endDate": "2026-12-20T11:00:00-03:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Beach Garden · Shopping Serra Talhada",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Av. Adriano Duque de Godoy Sousa",
          "addressLocality": "Serra Talhada",
          "addressRegion": "PE",
          "postalCode": "56900-000",
          "addressCountry": "BR",
        },
      },
      "image": ["https://corridascorremais.com.br/og-image.jpg"],
      "organizer": {
        "@type": "Organization",
        "@id": "https://corridascorremais.com.br/#organization",
        "name": "Corre +",
        "url": "https://corridascorremais.com.br",
      },
      "offers": {
        "@type": "Offer",
        "url": "https://corridascorremais.com.br/inscricao",
        "price": "83.60",
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "validFrom": "2026-09-01T00:00:00-03:00",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://corridascorremais.com.br/#organization",
      "name": "Corre +",
      "url": "https://corridascorremais.com.br",
      "logo": "https://corridascorremais.com.br/favicon.png",
      "sameAs": ["https://www.instagram.com/corremaisst/"],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+55-87-99201-7978",
          "contactType": "customer service",
          "areaServed": "BR",
          "availableLanguage": "Portuguese",
        },
      ],
    },
  ],
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#e70202" },
      { title: "2ª Corrida Natalina | Corre + — Serra Talhada/PE" },
      {
        name: "description",
        content:
          "2ª Corrida Natalina em Serra Talhada/PE no dia 20 de Dezembro de 2026. Percurso de 6km, kits exclusivos com coqueteleira e chaveiro para os 335 primeiros inscritos, troféus e medalha finisher. Inscrições abertas!",
      },
      {
        name: "keywords",
        content:
          "2ª Corrida Natalina, Corrida Natalina, Corre +, Serra Talhada, corrida 6km, corrida de rua, atletismo sertão pernambucano, inscrições corrida natalina, Shopping Serra Talhada, Beach Garden",
      },
      { name: "author", content: "Corre +" },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "googlebot", content: "index, follow, max-image-preview:large" },
      { name: "format-detection", content: "telephone=no" },

      // Open Graph (WhatsApp, Facebook, LinkedIn, Telegram, etc.)
      { property: "og:site_name", content: "2ª Corrida Natalina | Corre +" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:url", content: "https://corridascorremais.com.br/" },
      { property: "og:title", content: "2ª Corrida Natalina | Corre + — Inscrições Abertas!" },
      {
        property: "og:description",
        content:
          "20 de Dezembro em Serra Talhada/PE. Percurso de 6km, kit exclusivo completo com coqueteleira e chaveiro para os 335 primeiros atletas. Inscreva-se já!",
      },
      {
        property: "og:image",
        content: "https://corridascorremais.com.br/og-image.jpg",
      },
      {
        property: "og:image:secure_url",
        content: "https://corridascorremais.com.br/og-image.jpg",
      },
      {
        property: "og:image:type",
        content: "image/jpeg",
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "630",
      },
      {
        property: "og:image:alt",
        content:
          "2ª Corrida Natalina em Serra Talhada/PE - Inscrições Abertas - 20 de Dezembro de 2026",
      },

      // Twitter / X
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@corremaisst" },
      { name: "twitter:creator", content: "@corremaisst" },
      { name: "twitter:title", content: "2ª Corrida Natalina | Corre + — Inscrições Abertas!" },
      {
        name: "twitter:description",
        content:
          "20 de Dezembro em Serra Talhada/PE. Percurso de 6km, kit exclusivo completo com brindes para os 335 primeiros inscritos. Garanta sua vaga!",
      },
      {
        name: "twitter:image",
        content: "https://corridascorremais.com.br/og-image.jpg",
      },
      {
        name: "twitter:image:alt",
        content: "2ª Corrida Natalina | Corre + — Inscrições Abertas",
      },
    ],
    links: [
      { rel: "canonical", href: "https://corridascorremais.com.br/" },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
