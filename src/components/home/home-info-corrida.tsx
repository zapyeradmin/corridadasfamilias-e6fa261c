import { motion } from "framer-motion";
import { Calendar, HeartPulse, MapPin, Route as RouteIcon } from "lucide-react";
import { ContentSection } from "@/components/site/page-shell";
import { SITE } from "@/lib/site-config";
import informacoesCorrida from "@/assets/informacoes-corrida.jpg?w=1024&quality=78&format=webp";

const INFOS = [
  {
    icon: Calendar,
    title: "Data e Horários",
    lines: [`Data: ${SITE.eventDateLabel}`, "Concentração: 05:00", "Largada: 06:00 (sem atrasos)"],
  },
  {
    icon: MapPin,
    title: "Localização Estratégica",
    lines: [`Local: ${SITE.location}`],
  },
  {
    icon: RouteIcon,
    title: "Percurso Oficial",
    lines: ["Distância: 6km"],
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
];

export function HomeInfoCorrida() {
  return (
    <ContentSection>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
        Informações da Corrida
      </p>
      <h2 className="heading-section mt-3 text-3xl text-[#c20505] md:text-5xl">
        Fique por dentro da corrida
      </h2>
      <p className="mt-4 text-base text-justify text-[#3d0000]">
        Esta é a 2ª Edição da Corrida Natalina, um evento que celebra o esporte, a saúde, a união e
        o espírito de confraternização. Idealizada pela CORRE+, a corrida reúne atletas, famílias,
        equipes e toda a comunidade de Serra Talhada em uma experiência marcada por movimento,
        superação, integração e celebração.
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
            className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-[color:var(--color-brand-orange)]/30 via-transparent to-[#e70202]/25 blur-2xl"
          />
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border shadow-card">
            <img
              src={informacoesCorrida}
              alt="Atletas participando da 2ª Corrida Natalina em Serra Talhada"
              loading="lazy"
              decoding="async"
              width={1024}
              height={1024}
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
          <h3 className="text-2xl font-extrabold leading-tight text-[#c20505] md:text-3xl">
            Venha viver a experiência esportiva, elevando sua saúde com muita celebração!
          </h3>
          <p className="mt-4 text-base text-[#3d0000]">
            Reúna seus amigos, sua equipe de corrida, calce o tênis e venha viver a 2ª Edição da
            Corrida Natalina. Confira todas as informações:
          </p>

          <div className="mt-8 space-y-5">
            {INFOS.map((info) => (
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
  );
}
