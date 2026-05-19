import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Play } from "lucide-react";
import capaVideoLancamento from "@/assets/capa-video-lancamento.jpg";

export function HomeCtaVideo() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section className="bg-gradient-orange text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-5 py-16 md:px-8 md:py-20">
        <div className="w-full text-left">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/80">
            Inscrições abertas
          </p>
          <h2 className="heading-section mt-2 text-3xl text-white md:text-5xl">
            Garanta sua vaga e celebre com a sua família
          </h2>
        </div>

        <div className="relative w-full max-w-[900px] overflow-hidden rounded-3xl border border-white/20 shadow-premium aspect-video bg-black">
          {isVideoPlaying ? (
            <iframe
              src="https://www.youtube.com/embed/TE_hIXiN544?autoplay=1&rel=0"
              title="II Corrida das Famílias — Vídeo de Lançamento"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsVideoPlaying(true)}
              aria-label="Reproduzir vídeo de lançamento"
              className="group absolute inset-0 h-full w-full"
            >
              <img
                src={capaVideoLancamento}
                alt="Capa do vídeo de lançamento da II Corrida das Famílias"
                loading="lazy"
                decoding="async"
                width={1280}
                height={720}
                className="h-full w-full object-cover"
              />
              <span aria-hidden className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[color:var(--color-brand-orange)] shadow-premium transition group-hover:scale-110 md:h-24 md:w-24"
              >
                <Play className="h-8 w-8 translate-x-0.5 fill-current md:h-10 md:w-10" />
              </span>
            </button>
          )}
        </div>

        <Link
          to="/inscricao"
          className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-extrabold uppercase tracking-wide text-[color:var(--color-brand-purple-text)] shadow-premium transition hover:scale-[1.03]"
        >
          Quero me inscrever
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
