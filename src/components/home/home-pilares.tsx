import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { ContentSection } from "@/components/site/page-shell";
import { parseYoutubeId } from "@/lib/youtube";
import capaVideoLancamento from "@/assets/capa-video-lancamento.jpg?w=1280&quality=75&format=webp";

// Insira aqui futuramente o link do vídeo do YouTube da 2ª Edição da Corrida Natalina:
// Ex.: "https://www.youtube.com/watch?v=SEU_CODIGO" ou "https://youtu.be/SEU_CODIGO"
const YOUTUBE_VIDEO_URL = "";
const FALLBACK_VIDEO_ID = "TE_hIXiN544";

export function HomePilares() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = parseYoutubeId(YOUTUBE_VIDEO_URL) || FALLBACK_VIDEO_ID;

  return (
    <ContentSection>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
        Pilares do evento
      </p>
      <h2 className="heading-section mt-3 text-3xl text-[#c20505] md:text-5xl">
        Mais que uma corrida, um movimento
      </h2>
      <p className="mt-4 text-base text-justify text-[#3d0000]">
        A 2ª Edição da Corrida Natalina chega para consolidar um dos eventos esportivos mais
        marcantes de Serra Talhada, reunindo atletas, famílias e toda a comunidade em uma
        experiência que une esporte, saúde, celebração e confraternização.
      </p>
      <p className="mt-4 text-base text-justify text-[#3d0000]">
        Mais do que uma corrida de rua, a Corrida Natalina representa um momento de encontro,
        superação e conexão entre pessoas. Com uma proposta que transforma cada quilômetro em uma
        experiência especial, o evento celebra o movimento, incentiva hábitos saudáveis e fortalece
        o espírito de união entre atletas, equipes, famílias e toda a cidade.
      </p>

      {/* Player de Vídeo Oficial da 2ª Edição */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-10 md:mt-14"
      >
        <div className="relative mx-auto aspect-video w-full max-w-[960px] overflow-hidden rounded-3xl border border-black/10 bg-black shadow-[0_16px_40px_rgba(194,5,5,0.14)] ring-1 ring-black/5">
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="2ª Edição da Corrida Natalina — Vídeo Oficial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label="Reproduzir vídeo da 2ª Edição da Corrida Natalina"
              className="group absolute inset-0 flex h-full w-full items-center justify-center"
            >
              <img
                src={capaVideoLancamento}
                alt="Capa do vídeo da 2ª Edição da Corrida Natalina"
                loading="lazy"
                decoding="async"
                width={1280}
                height={720}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35"
              />
              <span
                aria-hidden
                className="relative grid h-20 w-20 place-items-center rounded-full bg-white/95 text-[#c20505] shadow-[0_12px_32px_rgba(194,5,5,0.4)] transition group-hover:scale-110 md:h-24 md:w-24"
              >
                <Play className="h-8 w-8 translate-x-0.5 fill-current md:h-10 md:w-10" />
              </span>
            </button>
          )}
        </div>
      </motion.div>
    </ContentSection>
  );
}
