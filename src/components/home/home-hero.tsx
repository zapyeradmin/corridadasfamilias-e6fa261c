import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, MapPin, Trophy } from "lucide-react";
import { Countdown } from "@/components/site/countdown";
import { SITE } from "@/lib/site-config";
import heroRunner from "@/assets/capa-hero-5.jpg?w=800;1024;1440;1920&quality=88&format=webp&as=srcset";
import heroRunnerFallback from "@/assets/capa-hero-5.jpg?w=1280&quality=88&format=webp";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#e70202] to-[#f76005] text-white">
      <img
        src={heroRunnerFallback}
        srcSet={heroRunner}
        sizes="100vw"
        alt="2ª Corrida Natalina | Corre +"
        fetchPriority="high"
        decoding="async"
        width={1024}
        height={447}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_35%] sm:object-center"
      />
      {/* Sobreposição degradê: superior #e70202 -> inferior #f76005 com blend de alta definição */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#e70202] to-[#f76005] opacity-60 mix-blend-multiply"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#e70202]/65 via-[#e70202]/20 to-[#f76005]/75"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#e70202]/75 via-[#e70202]/35 to-transparent lg:w-3/5"
      />

      <div className="relative mx-auto grid max-w-[1360px] items-center gap-10 px-5 py-16 sm:gap-12 sm:px-6 sm:py-20 md:py-28 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:px-8 lg:py-36">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-white backdrop-blur"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full border border-white bg-white text-[#c20505]">
              <Calendar className="h-3 w-3" />
            </span>
            {SITE.eventDateLabel} · Largada às 06:00
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-display mt-6 text-white"
          >
            <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-white/65 sm:text-xs sm:tracking-[0.55em] md:text-sm">
              2ª Edição (2026) · 6KM · Corre +
            </span>
            <span className="mt-3 block text-[3.25rem] font-black leading-[0.92] tracking-tight sm:mt-4 sm:text-6xl md:text-7xl lg:text-[6.25rem]">
              Corrida
            </span>
            <span className="mt-2 block text-[2.5rem] font-semibold italic leading-[0.95] tracking-tight text-white/95 sm:text-5xl md:text-6xl lg:text-[5.25rem]">
              NATALINA 2026
            </span>
            <span
              aria-hidden
              className="mt-5 block h-px w-16 bg-gradient-to-r from-white/70 to-transparent sm:mt-6 sm:w-24"
            />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 max-w-md text-[15px] text-white/85 sm:mt-5 sm:max-w-xl sm:text-base md:text-lg"
          >
            Uma corrida para conectar pessoas, transformar experiências e criar momentos que
            promovam saúde, coletividade e muita superação.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap"
          >
            <Link
              to="/inscricao"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-orange px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange transition hover:scale-[1.03] sm:w-auto sm:px-7 sm:py-4"
            >
              Garanta sua vaga
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/regulamento"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white backdrop-blur transition hover:bg-white/10 sm:w-auto sm:py-4"
            >
              Ver regulamento
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-4 text-[13px] text-white/85 sm:mt-10 sm:gap-6 sm:text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-white bg-white text-[#c20505] shadow-sm">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              {SITE.location}
            </span>
            <span className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-white bg-white text-[#c20505] shadow-sm">
                <Trophy className="h-3.5 w-3.5" />
              </span>
              Premiação geral e por categoria
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="relative mx-auto w-full max-w-sm sm:max-w-md lg:mx-0 lg:justify-self-end"
        >
          <div
            aria-hidden
            className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[#f76005]/35 via-white/5 to-[#e70202]/35 blur-xl"
          />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.07] p-6 backdrop-blur-2xl shadow-premium sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white">
                Contagem regressiva
              </p>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white bg-white text-[#c20505] shadow-sm">
                <Calendar className="h-4 w-4" />
              </span>
            </div>
            <h2 className="heading-section mt-3 text-xl text-white sm:text-2xl">
              Faltam para a largada
            </h2>
            <Countdown className="mt-6" />
            <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-3.5 text-center backdrop-blur">
              <p className="text-xs font-black uppercase tracking-wider text-white">
                Lote 1 (Promocional) · R$ 83,60
              </p>
              <p className="mt-1 text-[11px] leading-tight text-white/90">
                🎁 <strong>Brinde exclusivo:</strong> primeiros 335 inscritos confirmados recebem Coqueteleira + Chaveiro!
              </p>
            </div>
            <Link
              to="/inscricao"
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-[#c20505] shadow-md transition hover:bg-white/95"
            >
              Inscreva-se agora
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
