import { motion } from "framer-motion";
import { ContentSection } from "@/components/site/page-shell";
import { PILARES } from "./data";

export function HomePilares() {
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
  );
}
