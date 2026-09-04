import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { SponsorsMarquee } from "@/components/site/sponsors-marquee";
import { HomeHero } from "@/components/home/home-hero";
import { HomePilares } from "@/components/home/home-pilares";
import { CategoriasPremiacoes } from "@/components/site/categorias-premiacoes";
import { getPublishedSponsors } from "@/lib/public.functions";
import { SITE } from "@/lib/site-config";
import heroRunner from "@/assets/capa-hero-5.jpg?w=1280&quality=88&format=webp";
import heroRunnerSrcset from "@/assets/capa-hero-5.jpg?w=800;1024;1440;1920&quality=88&format=webp&as=srcset";

// Lazy-load below-the-fold sections so the initial JS bundle stays small.
const HomeInfoCorrida = lazy(() =>
  import("@/components/home/home-info-corrida").then((m) => ({ default: m.HomeInfoCorrida })),
);
const HomeKit = lazy(() =>
  import("@/components/home/home-kit").then((m) => ({ default: m.HomeKit })),
);
const HomeCronograma = lazy(() =>
  import("@/components/home/home-cronograma").then((m) => ({ default: m.HomeCronograma })),
);
const HomeCtaVideo = lazy(() =>
  import("@/components/home/home-cta-video").then((m) => ({ default: m.HomeCtaVideo })),
);
const HomePercurso = lazy(() =>
  import("@/components/home/home-percurso").then((m) => ({ default: m.HomePercurso })),
);
const HomePatrocinadores = lazy(() =>
  import("@/components/home/home-patrocinadores").then((m) => ({ default: m.HomePatrocinadores })),
);
const HomeFaq = lazy(() =>
  import("@/components/home/home-faq").then((m) => ({ default: m.HomeFaq })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "2ª Corrida Natalina | Corre +" },
      {
        name: "description",
        content: `Inscrições abertas para a ${SITE.name}, ${SITE.eventDateLabel}, em ${SITE.city}. Corrida de 6km com largada no ${SITE.location}.`,
      },
      { property: "og:title", content: "2ª Corrida Natalina | Corre +" },
      {
        property: "og:description",
        content: `Corrida de 6km em ${SITE.city}. ${SITE.eventDateLabel}.`,
      },
      {
        property: "og:image",
        content: "https://corridascorremais.com.br/capa-video-lancamento.jpg",
      },
      {
        property: "og:image:secure_url",
        content: "https://corridascorremais.com.br/capa-video-lancamento.jpg",
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
        content: "675",
      },
      {
        property: "og:image:alt",
        content: "2ª Corrida Natalina | Corre +",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://corridascorremais.com.br/capa-video-lancamento.jpg",
      },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: heroRunner,
        imageSrcSet: heroRunnerSrcset,
        imageSizes: "100vw",
        fetchPriority: "high",
      },
    ],
  }),
  component: HomePage,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery({
      queryKey: ["sponsors"],
      queryFn: () => getPublishedSponsors(),
      staleTime: 5 * 60 * 1000,
    });
  },
});

function HomePage() {
  return (
    <>
      <HomeHero />
      <SponsorsMarquee />
      <HomePilares />
      <Suspense fallback={null}>
        <HomeInfoCorrida />
        <HomeKit />
        <HomeCronograma />
        <HomeCtaVideo />
        <CategoriasPremiacoes />
        <HomePercurso />
        <HomePatrocinadores />
        <HomeFaq />
      </Suspense>
    </>
  );
}
