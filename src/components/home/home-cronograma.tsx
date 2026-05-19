import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TIMELINE } from "./data";

export function HomeCronograma() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
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
          <div
            aria-hidden
            className="absolute left-6 top-0 h-full w-[3px] rounded-full bg-[color:var(--color-brand-purple)]/10 md:left-1/2 md:-translate-x-1/2"
          />
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
  );
}
