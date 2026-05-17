import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Heart, Activity, Users, HandHeart, MapPin, Calendar, Trophy, ChevronRight, Route as RouteIcon, HeartPulse, ClipboardList, Package, Flag, Play, PersonStanding, Medal } from "lucide-react";
import { Countdown } from "@/components/site/countdown";
import { ContentSection } from "@/components/site/page-shell";
import { SITE } from "@/lib/site-config";
import heroRunner from "@/assets/hero-runner.jpg";
import informacoesCorrida from "@/assets/informacoes-corrida.jpg";
import capaVideoLancamento from "@/assets/capa-video-lancamento.jpg";

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
    links: [
      // Preload da imagem LCP do hero para acelerar o First Contentful Paint
      { rel: "preload", as: "image", href: heroRunner, fetchpriority: "high" },
    ],
  }),
  component: HomePage,
});

const PILARES = [
  {
    icon: Heart,
    title: "Fé",
    desc: "A base que nos une em propósito e fortalece nossa caminhada em comunidade.",
  },
  {
    icon: Users,
    title: "Esporte em Família",
    desc: "O caminho para superar limites, integrar gerações e celebrar a vida em movimento.",
  },
  {
    icon: Activity,
    title: "Saúde",
    desc: "O cuidado essencial com o corpo e a mente, promovendo o bem-estar de toda a família.",
  },
  {
    icon: HandHeart,
    title: "Solidariedade",
    desc: "O olhar de amor ao próximo, transformando nossa união em apoio real a quem mais precisa.",
  },
];

const TIMELINE = [
  {
    icon: ClipboardList,
    title: "Abertura das Inscrições",
    body:
      "Garanta sua inscrição na corrida mais vibrante da cidade! Inscrições online com vagas limitadas. A partir das 17h do dia 17 de maio de 2026 até às 23h59 do dia 12 de julho de 2026.",
  },
  {
    icon: Package,
    title: "Entrega dos Kits",
    body:
      "Retire seu kit atleta (Camiseta Oficial, Número) das 19:30 às 21:30 nos dias 4, 5 e 6 de agosto de 2026. No Centro Pastoral da Igreja de N. Sra. da Conceição. Não esqueça de levar sua doação de 1Kg de Alimento não perecível, e para os inscritos que forem retirar seu Kit do Atleta no dia 09 de agosto, deverá receber até o horário limite das 5:30, no local da largada.",
  },
  {
    icon: Flag,
    title: "No dia da corrida",
    intro: "No dia 09 de agosto de 2026, se liguem:",
    schedule: [
      { time: "05:00", desc: "Concentração e Abertura da Arena das Famílias" },
      { time: "05:30", desc: "Limite da entrega dos Kits e início do Aquecimento Coletivo" },
      { time: "05:50", desc: "Momento de Oração e devoção antes da largada" },
      { time: "06:00", desc: "Largada Oficial da Corrida" },
      { time: "08:30", desc: "Início da Cerimônia de Premiação" },
      { time: "10:00", desc: "Encerramento do Evento" },
    ],
  },
] as const;

function HomePage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-premium text-white">
        <img
          src={heroRunner}
          alt="Corredores na largada da Corrida das Famílias"
          fetchPriority="high"
          decoding="async"
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
        <p className="mt-4 text-base text-justify text-[color:var(--color-brand-purple-text)]">
          A II CORRIDA DAS FAMÍLIAS vem reforçar o seu significado, que é um evento de corrida de
          rua de Serra Talhada voltado para o público familiar, que nasceu com o propósito de unir
          a comunidade em torno de quatro pilares fundamentais: Fé, Esporte em Família, Saúde e
          Solidariedade.
        </p>
        <p className="mt-4 text-base text-justify text-[color:var(--color-brand-purple-text)]">
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
              className="flex flex-col items-center rounded-3xl border border-border bg-white p-6 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-card"
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

      {/* INFORMAÇÕES DA CORRIDA */}
      <ContentSection>
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
          Informações da Corrida
        </p>
        <h2 className="heading-section mt-3 text-3xl text-[color:var(--color-brand-purple-title)] md:text-5xl">
          Fique por dentro da corrida
        </h2>
        <p className="mt-4 text-base text-justify text-[color:var(--color-brand-purple-text)]">
          Esta é a segunda edição da corrida que une todas as famílias, sob o lema “Juntos no
          Rosário, Famílias unidas na Fé” a II Corrida das Famílias em Serra Talhada continua
          sendo idealizada pelo ECC da Paróquia do Rosário, unindo Fé, Esporte em Família, Saúde
          e Solidariedade.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-[color:var(--color-brand-orange)]/30 via-transparent to-[color:var(--color-brand-purple)]/30 blur-2xl"
            />
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-border shadow-card">
              <img
                src={informacoesCorrida}
                alt="Famílias participando da II Corrida das Famílias em Serra Talhada"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-2xl font-extrabold leading-tight text-[color:var(--color-brand-purple-title)] md:text-3xl">
              Venha fazer parte dessa experiência única de alegria, fé e saúde com toda a família.
            </h3>
            <p className="mt-4 text-base text-[color:var(--color-brand-purple-text)]">
              Reúna a sua família, amigos e toda sua equipe de corrida, coloque o seu tênis e
              venha celebrar com a gente. Fique por dentro de todas as informações:
            </p>

            <div className="mt-8 space-y-5">
              {[
                {
                  icon: Calendar,
                  title: "Data e Horários",
                  lines: [
                    "Data: 09 de agosto de 2026",
                    "Concentração: 05:00",
                    "Largada: 06:00 (sem atrasos)",
                  ],
                },
                {
                  icon: MapPin,
                  title: "Localização Estratégica",
                  lines: ["Local: Igreja Matriz do Rosário em Serra Talhada/PE"],
                },
                {
                  icon: RouteIcon,
                  title: "Percurso Oficial",
                  lines: ["Distância: 5km"],
                },
                {
                  icon: HeartPulse,
                  title: "Suporte ao Atleta",
                  lines: [
                    "Pontos de Hidratação: 5 pontos estratégicos",
                    "Apoio de Saúde: equipe com enfermeiros e ambulância de prontidão durante toda a corrida",
                    "Suporte: banheiros químicos, massagens, frutas e repositores energéticos para todos os atletas",
                  ],
                },
              ].map((info) => (
                <div
                  key={info.title}
                  className="flex gap-4 rounded-2xl border border-border bg-white p-5 shadow-soft"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-orange text-white shadow-orange">
                    <info.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-extrabold uppercase tracking-tight text-[color:var(--color-brand-purple-title)]">
                      {info.title}
                    </h4>
                    <ul className="mt-1 space-y-1 text-sm leading-relaxed text-[color:var(--color-brand-purple-text)]/85">
                      {info.lines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </ContentSection>
      {/* CRONOGRAMA OFICIAL */}
      <section className="bg-[color:var(--color-brand-soft)]">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
              Cronograma Oficial
            </p>
            <h2 className="heading-section mt-3 text-3xl text-[color:var(--color-brand-purple-title)] md:text-5xl">
              Veja nosso cronograma completo
            </h2>
          </div>

          <div ref={timelineRef} className="relative mt-16">
            {/* Vertical track */}
            <div
              aria-hidden
              className="absolute left-6 top-0 h-full w-[3px] rounded-full bg-[color:var(--color-brand-purple)]/10 md:left-1/2 md:-translate-x-1/2"
            />
            {/* Animated fill */}
            <motion.div
              aria-hidden
              style={{ height: lineHeight }}
              className="absolute left-6 top-0 w-[3px] rounded-full bg-gradient-to-b from-[color:var(--color-brand-orange)] via-[color:var(--color-brand-orange)] to-[color:var(--color-brand-purple)] md:left-1/2 md:-translate-x-1/2"
            />

            <ol className="space-y-12 md:space-y-20">
              {TIMELINE.map((item, i) => {
                const isRight = i % 2 === 1;
                return (
                  <li key={item.title} className="relative">
                    {/* Numbered marker */}
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", stiffness: 200, damping: 18 }}
                      className="absolute left-6 top-2 z-10 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-gradient-orange text-sm font-extrabold text-white shadow-orange ring-4 ring-[color:var(--color-brand-soft)] md:left-1/2"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </motion.span>

                    <motion.div
                      initial={{ opacity: 0, x: isRight ? 40 : -40, y: 16 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className={`ml-20 md:ml-0 md:w-[calc(50%-3.5rem)] ${
                        isRight ? "md:ml-auto md:pl-4" : "md:mr-auto md:pr-4"
                      }`}
                    >
                      <div className="rounded-3xl border border-border bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-card">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:var(--color-brand-orange)]/10 text-[color:var(--color-brand-orange)]">
                          <item.icon className="h-5 w-5" />
                        </span>
                        <h3 className="mt-5 text-lg font-extrabold uppercase tracking-tight text-[color:var(--color-brand-purple-title)] md:text-xl">
                          {item.title}
                        </h3>
                        {"body" in item && item.body && (
                          <p className="mt-3 text-sm leading-relaxed text-justify text-[color:var(--color-brand-purple-text)]/90 md:text-base">
                            {item.body}
                          </p>
                        )}
                        {"schedule" in item && item.schedule && (
                          <>
                            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-brand-purple-text)]/90 md:text-base">
                              {item.intro}
                            </p>
                            <ul className="mt-5 space-y-3">
                              {item.schedule.map((s) => (
                                <li key={s.time} className="flex items-start gap-3">
                                  <span className="inline-flex shrink-0 items-center rounded-full bg-gradient-orange px-3 py-1 text-xs font-extrabold tracking-wide text-white shadow-orange">
                                    {s.time}
                                  </span>
                                  <span className="text-sm leading-relaxed text-[color:var(--color-brand-purple-text)]/90 md:text-base">
                                    {s.desc}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
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
    </>
  );
}
