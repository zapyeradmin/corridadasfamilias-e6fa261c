import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import {
  createRegistration,
  CATEGORY_OPTIONS,
  type CategoryValue,
} from "@/lib/registrations.functions";
import { getActiveEvent } from "@/lib/public.functions";
import { isValidCpf, maskCpf, maskPhone, normalizeCpf, formatBRL } from "@/lib/cpf";

export const Route = createFileRoute("/inscricao")({
  head: () => ({
    meta: [
      { title: "Inscrição — 2ª Corrida Natalina | Corre +" },
      {
        name: "description",
        content:
          "Garanta sua vaga na 2ª Corrida Natalina | Corre +. Inscrição online em lote promocional único com brindes exclusivos.",
      },
      { property: "og:title", content: "Inscrição — 2ª Corrida Natalina | Corre +" },
    ],
  }),
  component: Page,
});

const formSchema = z
  .object({
    full_name: z.string().min(3, "Informe seu nome completo"),
    cpf: z.string().refine((v) => isValidCpf(v), "CPF inválido"),
    email: z.string().email("E-mail inválido"),
    whatsapp: z.string().refine((v) => v.replace(/\D/g, "").length >= 10, "WhatsApp inválido"),
    birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    gender: z.enum(["male", "female"], { message: "Selecione o gênero" }),
    category: z.enum(CATEGORY_OPTIONS, { message: "Selecione a categoria" }),
    shirt_size: z.enum(["pp", "p", "m", "g", "gg", "xgg"], { message: "Selecione" }),
    emergency_contact_name: z.string().min(2, "Informe o contato"),
    emergency_contact_phone: z
      .string()
      .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
    medical_notes: z.string().max(500).optional(),
    accepted_terms: z.literal(true, { message: "Aceite o regulamento" }),
    accepted_lgpd: z.literal(true, { message: "Aceite a política de privacidade" }),
  })
  .superRefine((data, ctx) => {
    if (!data.birth_date || !data.category) return;
    const age = ageOn(data.birth_date, "2026-12-20");
    const cat = data.category;

    // Validação de Gênero
    if (data.gender === "male" && cat.includes("FEMININO")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Categoria feminina incompatível com o gênero masculino selecionado.",
        path: ["category"],
      });
    }
    if (data.gender === "female" && cat.includes("MASCULINO")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Categoria masculina incompatível com o gênero feminino selecionado.",
        path: ["category"],
      });
    }

    // Validação de Faixa Etária condicionada à idade em 20/12/2026
    if (cat.includes("14 A 29 ANOS")) {
      if (age < 14 || age > 29) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Esta categoria é exclusiva para atletas de 14 a 29 anos em 20/12/2026 (sua idade calculada: ${age} anos).`,
          path: ["category"],
        });
      }
    } else if (cat.includes("30 A 39 ANOS")) {
      if (age < 30 || age > 39) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Esta categoria é exclusiva para atletas de 30 a 39 anos em 20/12/2026 (sua idade calculada: ${age} anos).`,
          path: ["category"],
        });
      }
    } else if (cat.includes("40 A 49 ANOS")) {
      if (age < 40 || age > 49) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Esta categoria é exclusiva para atletas de 40 a 49 anos em 20/12/2026 (sua idade calculada: ${age} anos).`,
          path: ["category"],
        });
      }
    } else if (cat.includes("50 A 59 ANOS")) {
      if (age < 50 || age > 59) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Esta categoria é exclusiva para atletas de 50 a 59 anos em 20/12/2026 (sua idade calculada: ${age} anos).`,
          path: ["category"],
        });
      }
    } else if (cat.includes("60+")) {
      if (age < 60) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Esta categoria é exclusiva para atletas com 60 anos ou mais em 20/12/2026 (sua idade calculada: ${age} anos).`,
          path: ["category"],
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

function ageOn(birthIso: string, refIso: string = "2026-12-20"): number {
  if (!birthIso || !/^\d{4}-\d{2}-\d{2}$/.test(birthIso)) return 0;
  const b = new Date(birthIso + "T00:00:00");
  const r = new Date(refIso + "T00:00:00");
  let a = r.getFullYear() - b.getFullYear();
  const m = r.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && r.getDate() < b.getDate())) a--;
  return a;
}

function resolvePrice(
  _birth: string | undefined,
  _eventDate: string | undefined,
  lot: { price_cents: number; child_price_cents?: number | null } | null | undefined,
): number | undefined {
  if (!lot) return undefined;
  return lot.price_cents;
}

const STEPS: { title: string; fields: (keyof FormValues)[] }[] = [
  {
    title: "Dados pessoais",
    fields: ["full_name", "cpf", "email", "whatsapp", "birth_date", "gender", "category"],
  },
  {
    title: "Kit & emergência",
    fields: ["shirt_size", "emergency_contact_name", "emergency_contact_phone", "medical_notes"],
  },
  { title: "Revisão & termos", fields: ["accepted_terms", "accepted_lgpd"] },
];

function Page() {
  const navigate = useNavigate();
  const submitFn = useServerFn(createRegistration);
  const fetchEvent = useServerFn(getActiveEvent);
  const { data: eventData } = useQuery({
    queryKey: ["active-event"],
    queryFn: () => fetchEvent(),
  });
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      full_name: "",
      cpf: "",
      email: "",
      whatsapp: "",
      birth_date: "",
      gender: undefined as unknown as FormValues["gender"],
      category: undefined as unknown as FormValues["category"],
      shirt_size: undefined as unknown as FormValues["shirt_size"],
      emergency_contact_name: "",
      emergency_contact_phone: "",
      medical_notes: "",
      accepted_terms: undefined as unknown as true,
      accepted_lgpd: undefined as unknown as true,
    },
  });

  const next = async () => {
    const ok = await form.trigger(STEPS[step].fields);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      const res = await submitFn({
        data: {
          ...values,
          cpf: normalizeCpf(values.cpf),
          medical_notes: values.medical_notes || null,
        },
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Inscrição registrada! Redirecionando...");
      navigate({ to: "/inscricao/sucesso", search: { protocol: res.protocol } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar inscrição.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <>
      <PageHeader
        eyebrow={`Passo ${step + 1} de ${STEPS.length}`}
        title="Inscrição"
        description="Preencha os dados abaixo para garantir sua vaga. Leva menos de 3 minutos."
      />
      <ContentSection>
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-border bg-white p-6 shadow-soft md:p-10"
          >
            <Stepper current={step} />

            {step === 0 && <StepPersonal form={form} />}
            {step === 1 && <StepKit form={form} />}
            {step === 2 && (
              <StepReview
                form={form}
                amount={resolvePrice(
                  form.watch("birth_date"),
                  eventData?.event?.event_date,
                  eventData?.currentLot,
                )}
              />
            )}

            <div className="mt-10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={back}
                disabled={step === 0 || submitting}
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#3d0000] transition hover:bg-[color:var(--color-brand-soft)] disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-full bg-[#c20505] px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-premium transition hover:scale-[1.02]"
                >
                  Avançar <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[#c20505] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-premium transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Finalizar Inscrição
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <aside className="h-fit rounded-3xl border border-border bg-white p-6 shadow-soft">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#3d0000]">
              Resumo da Inscrição
            </h2>
            {eventData?.currentLot ? (
              (() => {
                const lot = eventData.currentLot;
                return (
                  <>
                    <p className="mt-3 text-sm text-[#3d0000]">
                      Lote vigente: <strong>{lot.name}</strong>
                    </p>
                    <p className="mt-1 text-3xl font-black text-[#c20505]">
                      {formatBRL(lot.price_cents)}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#c20505]">
                      Valor Único
                    </p>
                    <div className="mt-3 rounded-2xl border border-[#c20505]/20 bg-white p-3.5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-wider text-[#c20505]">
                        🎁 Brinde Exclusivo
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#3d0000]">
                        Os primeiros <strong>335 inscritos com pagamento confirmado</strong> receberão de brinde uma <strong>Coqueteleira Personalizada da Corrida + um Chaveiro Personalizado</strong>!
                      </p>
                    </div>
                  </>
                );
              })()
            ) : (
              <p className="mt-3 text-sm text-[#3d0000]">Carregando lote vigente...</p>
            )}
            <ul className="mt-4 space-y-2 text-xs text-[#3d0000]/85">
              <li>• Camisa oficial + número de peito</li>
              <li>• Chip de cronometragem</li>
              <li>• Medalha de finisher</li>
              <li>• Pontos de hidratação no percurso</li>
              <li>• Coqueteleira + Chaveiro para os 335 primeiros confirmados</li>
            </ul>
          </aside>
        </div>
      </ContentSection>
    </>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2">
      {STEPS.map((s, i) => (
        <li key={s.title} className="flex flex-1 items-center gap-2">
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
              i <= current
                ? "border-2 border-[#c20505] bg-[#c20505] text-white shadow-sm"
                : "border border-border bg-white text-[#3d0000]/60"
            }`}
          >
            {i + 1}
          </span>
          <span
            className={`hidden text-xs font-bold uppercase tracking-wide sm:inline ${
              i === current ? "text-[#c20505]" : "text-[#3d0000]/60"
            }`}
          >
            {s.title}
          </span>
          {i < STEPS.length - 1 && (
            <span className="h-px flex-1 bg-[color:var(--color-brand-soft)]" />
          )}
        </li>
      ))}
    </ol>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#3d0000]">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-[#3d0000] outline-none transition focus:border-[#c20505] focus:ring-2 focus:ring-[#c20505]/20";

function StepPersonal({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const { register, formState, setValue, watch } = form;
  const cpf = watch("cpf");
  const wpp = watch("whatsapp");
  const birthDate = watch("birth_date");
  const gender = watch("gender");
  const category = watch("category");

  useEffect(() => {
    setValue("cpf", maskCpf(cpf || ""), { shouldValidate: false });
  }, [cpf, setValue]);
  useEffect(() => {
    setValue("whatsapp", maskPhone(wpp || ""), { shouldValidate: false });
  }, [wpp, setValue]);

  // Idade apurada na data oficial da prova (20/12/2026)
  const ageAtEvent =
    birthDate && /^\d{4}-\d{2}-\d{2}$/.test(birthDate) ? ageOn(birthDate, "2026-12-20") : null;

  // Auto-limpeza de categoria selecionada caso o atleta mude nascimento ou gênero para algo incompatível
  useEffect(() => {
    if (!category) return;
    const isMasc = category.includes("MASCULINO");
    const isFem = category.includes("FEMININO");

    if ((gender === "male" && isFem) || (gender === "female" && isMasc)) {
      setValue("category", "" as any, { shouldValidate: true });
      return;
    }

    if (ageAtEvent !== null) {
      if (category.includes("14 A 29 ANOS") && (ageAtEvent < 14 || ageAtEvent > 29)) {
        setValue("category", "" as any, { shouldValidate: true });
      } else if (category.includes("30 A 39 ANOS") && (ageAtEvent < 30 || ageAtEvent > 39)) {
        setValue("category", "" as any, { shouldValidate: true });
      } else if (category.includes("40 A 49 ANOS") && (ageAtEvent < 40 || ageAtEvent > 49)) {
        setValue("category", "" as any, { shouldValidate: true });
      } else if (category.includes("50 A 59 ANOS") && (ageAtEvent < 50 || ageAtEvent > 59)) {
        setValue("category", "" as any, { shouldValidate: true });
      } else if (category.includes("60+") && ageAtEvent < 60) {
        setValue("category", "" as any, { shouldValidate: true });
      }
    }
  }, [ageAtEvent, gender, category, setValue]);

  const getOptionStatus = (catOption: string): { disabled: boolean; reason?: string } => {
    const isMasc = catOption.includes("MASCULINO");
    const isFem = catOption.includes("FEMININO");

    // Validação de Gênero
    if (gender === "male" && isFem) {
      return { disabled: true, reason: "(Exclusivo Feminino)" };
    }
    if (gender === "female" && isMasc) {
      return { disabled: true, reason: "(Exclusivo Masculino)" };
    }

    // Categorias de Idade Livre são sempre elegíveis (se o gênero for compatível)
    if (catOption.includes("IDADE LIVRE")) {
      return { disabled: false };
    }

    // Categorias de Faixa Etária condicionadas à idade em 20/12/2026
    if (ageAtEvent === null) {
      return { disabled: true, reason: "(Informe a data de nascimento)" };
    }

    if (catOption.includes("14 A 29 ANOS")) {
      if (ageAtEvent < 14 || ageAtEvent > 29) {
        return { disabled: true, reason: "(Exclusivo 14 a 29 anos)" };
      }
    } else if (catOption.includes("30 A 39 ANOS")) {
      if (ageAtEvent < 30 || ageAtEvent > 39) {
        return { disabled: true, reason: "(Exclusivo 30 a 39 anos)" };
      }
    } else if (catOption.includes("40 A 49 ANOS")) {
      if (ageAtEvent < 40 || ageAtEvent > 49) {
        return { disabled: true, reason: "(Exclusivo 40 a 49 anos)" };
      }
    } else if (catOption.includes("50 A 59 ANOS")) {
      if (ageAtEvent < 50 || ageAtEvent > 59) {
        return { disabled: true, reason: "(Exclusivo 50 a 59 anos)" };
      }
    } else if (catOption.includes("60+")) {
      if (ageAtEvent < 60) {
        return { disabled: true, reason: "(Exclusivo 60+ anos)" };
      }
    }

    return { disabled: false };
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field
        label="Nome completo"
        error={formState.errors.full_name?.message}
        className="md:col-span-2"
      >
        <input
          className={inputClass}
          {...register("full_name")}
          placeholder="Como aparece no documento"
        />
      </Field>
      <Field label="CPF" error={formState.errors.cpf?.message}>
        <input
          className={inputClass}
          {...register("cpf")}
          placeholder="000.000.000-00"
          inputMode="numeric"
        />
      </Field>
      <Field label="Data de nascimento" error={formState.errors.birth_date?.message}>
        <input type="date" className={inputClass} {...register("birth_date")} />
        {ageAtEvent !== null && (
          <p className="mt-1.5 text-xs font-semibold text-[#c20505]">
            🎂 Idade na data da prova (20/12/2026): <strong>{ageAtEvent} anos</strong>
          </p>
        )}
      </Field>
      <Field label="E-mail" error={formState.errors.email?.message}>
        <input
          type="email"
          className={inputClass}
          {...register("email")}
          placeholder="voce@email.com"
        />
      </Field>
      <Field label="WhatsApp" error={formState.errors.whatsapp?.message}>
        <input
          className={inputClass}
          {...register("whatsapp")}
          placeholder="(87) 90000-0000"
          inputMode="numeric"
        />
      </Field>
      <Field label="Gênero" error={formState.errors.gender?.message}>
        <select className={inputClass} {...register("gender")} defaultValue="">
          <option value="" disabled>
            Selecione o gênero
          </option>
          <option value="female">Feminino</option>
          <option value="male">Masculino</option>
        </select>
      </Field>
      <Field
        label="Categoria"
        error={formState.errors.category?.message}
        className="md:col-span-2"
      >
        <select className={inputClass} {...register("category")} defaultValue="">
          <option value="" disabled>
            Selecione a categoria
          </option>
          {CATEGORY_OPTIONS.map((opt) => {
            const status = getOptionStatus(opt);
            return (
              <option key={opt} value={opt} disabled={status.disabled}>
                {opt} {status.disabled && status.reason ? `— ${status.reason}` : ""}
              </option>
            );
          })}
        </select>
        <div className="mt-2.5 rounded-xl border border-[#c20505]/15 bg-[color:var(--color-brand-soft)]/50 p-3 text-xs text-[#3d0000]">
          <p className="font-bold text-[#c20505]">Regras de seleção da categoria:</p>
          <p className="mt-1 leading-relaxed">
            • O atleta poderá se inscrever em <strong>apenas 1 categoria</strong>.
            <br />
            • Você pode selecionar qualquer categoria de <strong>"Idade Livre"</strong> correspondente ao seu gênero, ou a categoria de <strong>"Faixa Etária"</strong> estritamente compatível com a sua idade apurada na data oficial da prova (<strong>20/12/2026</strong>).
          </p>
        </div>
      </Field>
    </div>
  );
}

function StepKit({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const { register, formState, setValue, watch } = form;
  const phone = watch("emergency_contact_phone");
  useEffect(() => {
    setValue("emergency_contact_phone", maskPhone(phone || ""), { shouldValidate: false });
  }, [phone, setValue]);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Tamanho da camisa" error={formState.errors.shirt_size?.message}>
        <select className={inputClass} {...register("shirt_size")} defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          <option value="pp">PP</option>
          <option value="p">P</option>
          <option value="m">M</option>
          <option value="g">G</option>
          <option value="gg">GG</option>
          <option value="xgg">XGG</option>
        </select>
      </Field>
      <div />
      <Field label="Contato de emergência" error={formState.errors.emergency_contact_name?.message}>
        <input className={inputClass} {...register("emergency_contact_name")} placeholder="Nome" />
      </Field>
      <Field label="Telefone do contato" error={formState.errors.emergency_contact_phone?.message}>
        <input
          className={inputClass}
          {...register("emergency_contact_phone")}
          placeholder="(87) 90000-0000"
        />
      </Field>
      <Field
        label="Observações médicas (opcional)"
        error={formState.errors.medical_notes?.message}
        className="md:col-span-2"
      >
        <textarea
          className={`${inputClass} min-h-[120px]`}
          {...register("medical_notes")}
          placeholder="Alergias, medicamentos, condições relevantes..."
        />
      </Field>
    </div>
  );
}

function StepReview({
  form,
  amount,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  amount?: number;
}) {
  const { register, formState, getValues } = form;
  const v = getValues();
  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-border bg-[color:var(--color-brand-soft)]/40 p-5 text-sm text-[#3d0000]">
        <p>
          <strong>Nome:</strong> {v.full_name}
        </p>
        <p>
          <strong>CPF:</strong> {v.cpf}
        </p>
        <p>
          <strong>E-mail:</strong> {v.email}
        </p>
        <p>
          <strong>WhatsApp:</strong> {v.whatsapp}
        </p>
        <p>
          <strong>Categoria:</strong> {v.category} — Camisa {v.shirt_size?.toUpperCase()}
        </p>
        {amount != null && (
          <p className="mt-3 text-base">
            <strong>Total:</strong>{" "}
            <span className="font-black text-[#c20505]">{formatBRL(amount)}</span>
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-[#3d0000]">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 accent-[#c20505]"
          {...register("accepted_terms")}
        />
        <span>
          Li e aceito o{" "}
          <a className="font-bold text-[#c20505] underline" href="/regulamento" target="_blank">
            regulamento
          </a>{" "}
          da prova.
        </span>
      </label>
      {formState.errors.accepted_terms && (
        <span className="text-xs text-destructive">{formState.errors.accepted_terms.message}</span>
      )}

      <label className="flex items-start gap-3 text-sm text-[#3d0000]">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 accent-[#c20505]"
          {...register("accepted_lgpd")}
        />
        <span>
          Concordo com a{" "}
          <a
            className="font-bold text-[#c20505] underline"
            href="/politica-privacidade"
            target="_blank"
          >
            política de privacidade
          </a>{" "}
          e o tratamento dos meus dados conforme a LGPD.
        </span>
      </label>
      {formState.errors.accepted_lgpd && (
        <span className="text-xs text-destructive">{formState.errors.accepted_lgpd.message}</span>
      )}
    </div>
  );
}
