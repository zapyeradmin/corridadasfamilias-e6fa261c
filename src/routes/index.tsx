import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Activity, Users, HandHeart, MapPin, Calendar, Trophy, ChevronRight } from "lucide-react";
import { Countdown } from "@/components/site/countdown";
import { ContentSection } from "@/components/site/page-shell";
import { SITE } from "@/lib/site-config";
import heroRunner from "@/assets/hero-runner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} — ${SITE.slogan}` },
      {
        name: "description",
        content: `Inscrições abertas para a ${SITE.name}, ${SITE.eventDateLabel}, em ${SITE.city}. Corrida de 5km com largada na ${SITE.location}.`,
      },
      { property: "og:title", content: `${SITE.name} — ${SITE.slogan}` },
      {
        property: "og:description",
        content: `Corrida de 5km em ${SITE.city}. ${SITE.eventDateLabel}.`,
      },
    ],
  }),
  component: HomePage,
});

const PILARES = [
  {
    icon: Heart,
    title: "Fé",
    desc: "Largada com bênção na Matriz do Rosário e oração pela família.",
  },
  {
    icon: Users,
    title: "Esporte em Família",
    desc: "Para atletas, amadores, crianças e idosos correrem juntos.",
  },
  {
    icon: Activity,
    title: "Saúde",
    desc: "Movimento, bem-estar e qualidade de vida para a comunidade.",
  },
  {
    icon: HandHeart,
    title: "Solidariedade",
    desc: "Cada atleta contribui com 1kg de alimento não perecível.",
  },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-premium text-white">
        <img
          src={heroRunner}
          alt="Corredores na largada da Corrida das Famílias"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_30%] opacity-45 sm:object-center sm:opacity-55"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(22,9,31,0.92)_0%,rgba(67,17,129,0.55)_45%,rgba(22,9,31,0.15)_75%,rgba(255,83,0,0.25)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#16091f] to-transparent sm:h-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,83,0,0.35),transparent_65%)] blur-2xl sm:-top-40 sm:-right-32 sm:h-[520px] sm:w-[520px]"
        />

        <div className="relative mx-auto grid max-w-[1360px] items-center gap-10 px-5 py-16 sm:gap-12 sm:px-6 sm:py-20 md:py-28 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:px-8 lg:py-36">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-white/80 backdrop-blur"
            >
              <Calendar className="h-3.5 w-3.5 text-[color:var(--color-brand-orange)]" />
              {SITE.eventDateLabel}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="heading-display mt-6 text-white"
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-white/65 sm:text-xs sm:tracking-[0.55em] md:text-sm">
                II Edição · 5KM
              </span>
              <span className="mt-3 block text-[3.25rem] font-black leading-[0.92] tracking-tight sm:mt-4 sm:text-6xl md:text-7xl lg:text-[6.25rem]">
                Corrida
              </span>
              <span className="mt-2 block text-[2.5rem] font-semibold italic leading-[0.95] tracking-tight text-white/95 sm:text-5xl md:text-6xl lg:text-[5.25rem]">
                das Famílias
              </span>
              <span aria-hidden className="mt-5 block h-px w-16 bg-gradient-to-r from-[color:var(--color-brand-orange)] to-transparent sm:mt-6 sm:w-24" />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-4 max-w-md text-[15px] text-white/85 sm:mt-5 sm:max-w-xl sm:text-base md:text-lg"
            >
              {SITE.slogan}. Uma corrida de 5km em {SITE.city} para celebrar a fé, fortalecer
              famílias e promover saúde e solidariedade.
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
              className="mt-8 flex flex-wrap items-center gap-4 text-[13px] text-white/75 sm:mt-10 sm:gap-6 sm:text-sm"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[color:var(--color-brand-orange)]" />
                {SITE.location}
              </span>
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[color:var(--color-brand-amber)]" />
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
              className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[color:var(--color-brand-orange)]/40 via-white/5 to-[color:var(--color-brand-purple)]/40 blur-xl"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.07] p-6 backdrop-blur-2xl shadow-premium sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
                  Contagem regressiva
                </p>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[color:var(--color-brand-orange)]">
                  <Calendar className="h-4 w-4" />
                </span>
              </div>
              <h2 className="heading-section mt-3 text-xl text-white sm:text-2xl">
                Faltam para a largada
              </h2>
              <Countdown className="mt-6" />
              <Link
                to="/inscricao"
                className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-[color:var(--color-brand-purple-text)] transition hover:bg-white/95"
              >
                Inscreva-se agora
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PILARES */}
      <ContentSection>
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
          Pilares do evento
        </p>
        <h2 className="heading-section mt-3 text-3xl text-[color:var(--color-brand-purple-title)] md:text-5xl">
          Mais que uma corrida, um movimento
        </h2>
        <p className="mt-4 max-w-3xl text-base text-justify text-[color:var(--color-brand-purple-text)]">
          A II CORRIDA DAS FAMÍLIAS vem reforçar o seu significado, que é um evento de corrida de
          rua de Serra Talhada voltado para o público familiar, que nasceu com o propósito de unir
          a comunidade em torno de quatro pilares fundamentais: Fé, Esporte em Família, Saúde e
          Solidariedade.
        </p>
        <p className="mt-4 max-w-3xl text-base text-justify text-[color:var(--color-brand-purple-text)]">
          Mais do que uma competição esportiva, a Corrida das Famílias é um movimento de integração
          social e promoção do bem-estar. Sob o lema “Juntos no Rosário, Famílias unidas na Fé”, o
          evento é um espaço que conecta pessoas, fortalece laços comunitários e celebra histórias
          reais de superação.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILARES.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl border border-border bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-orange text-white shadow-orange">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold uppercase tracking-tight text-[color:var(--color-brand-purple-title)]">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-brand-purple-text)]/85">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </ContentSection>

      {/* DETALHES */}
      <section className="bg-[color:var(--color-brand-soft)]">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 md:grid-cols-3 md:px-8 md:py-24">
          {[
            { icon: Calendar, title: "Data", value: SITE.eventDateLabel },
            { icon: MapPin, title: "Local", value: `${SITE.location}, ${SITE.city}` },
            { icon: Activity, title: "Distância", value: "Percurso oficial de 5km" },
          ].map((d) => (
            <div key={d.title} className="rounded-3xl bg-white p-7 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--color-brand-purple)]/10 text-[color:var(--color-brand-purple)]">
                <d.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-brand-purple-text)]/70">
                {d.title}
              </p>
              <p className="mt-1 text-lg font-extrabold text-[color:var(--color-brand-purple-title)]">
                {d.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-orange text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/80">
              Inscrições abertas
            </p>
            <h2 className="heading-section mt-2 text-3xl text-white md:text-5xl">
              Garanta sua vaga e celebre com a sua família
            </h2>
          </div>
          <Link
            to="/inscricao"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-extrabold uppercase tracking-wide text-[color:var(--color-brand-purple-text)] shadow-premium"
          >
            Quero me inscrever
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
