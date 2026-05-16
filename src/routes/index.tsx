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
      <section className="relative overflow-hidden bg-gradient-premium text-white">
        
        <div className="relative mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:px-8 md:py-32">
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
              className="heading-display mt-6 text-5xl text-white sm:text-7xl md:text-[5.5rem]"
            >
              II Corrida{" "}
              <span className="bg-gradient-purple bg-clip-text text-orange-600 bg-transparent">
                das Famílias
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-5 max-w-xl text-base text-white/85 md:text-lg"
            >
              {SITE.slogan}. Uma corrida de 5km em {SITE.city} para celebrar a fé, fortalecer
              famílias e promover saúde e solidariedade.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/inscricao"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-7 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange transition hover:scale-[1.03]"
              >
                Garanta sua vaga
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                to="/regulamento"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-white backdrop-blur transition hover:bg-white/10"
              >
                Ver regulamento
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/75"
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
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl shadow-premium"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--color-brand-orange)]">
              Contagem regressiva
            </p>
            <h2 className="heading-section mt-2 text-2xl text-white">Faltam para a largada</h2>
            <Countdown className="mt-6" />
            <Link
              to="/inscricao"
              className="mt-8 block rounded-full bg-white px-5 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-[color:var(--color-brand-purple-text)]"
            >
              Inscreva-se agora
            </Link>
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
        <p className="mt-4 max-w-2xl text-base text-[color:var(--color-brand-purple-text)]">
          A II Corrida das Famílias une fé, esporte, saúde e solidariedade em uma experiência
          inesquecível.
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
