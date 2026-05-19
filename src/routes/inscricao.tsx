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
import { createRegistration } from "@/lib/registrations.functions";
import { getActiveEvent } from "@/lib/public.functions";
import { isValidCpf, maskCpf, maskPhone, normalizeCpf, formatBRL } from "@/lib/cpf";

export const Route = createFileRoute("/inscricao")({
  head: () => ({
    meta: [
      { title: "Inscrição — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Garanta sua vaga na II Corrida das Famílias. Inscrição online em 3 passos com pagamento via Infinity Pay.",
      },
      { property: "og:title", content: "Inscrição — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

const formSchema = z.object({
  full_name: z.string().min(3, "Informe seu nome completo"),
  cpf: z.string().refine((v) => isValidCpf(v), "CPF inválido"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z.string().refine((v) => v.replace(/\D/g, "").length >= 10, "WhatsApp inválido"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  gender: z.enum(["male", "female", "other"], { message: "Selecione" }),
  category: z.enum(
    [
      "geral_masculino",
      "geral_feminino",
      "infanto_juvenil_masculino",
      "infanto_juvenil_feminino",
      "60_masculino",
      "60_feminino",
    ],
    { message: "Selecione a categoria" },
  ),
  shirt_size: z.enum(["pp", "p", "m", "g", "gg", "xgg"], { message: "Selecione" }),
  emergency_contact_name: z.string().min(2, "Informe o contato"),
  emergency_contact_phone: z
    .string()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
  medical_notes: z.string().max(500).optional(),
  accepted_terms: z.literal(true, { message: "Aceite o regulamento" }),
  accepted_lgpd: z.literal(true, { message: "Aceite a política de privacidade" }),
});

type FormValues = z.infer<typeof formSchema>;

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
      category: "",
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
            {step === 2 && <StepReview form={form} amount={eventData?.currentLot?.price_cents} />}

            <div className="mt-10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide text-[color:var(--color-brand-purple-text)] disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange"
                >
                  Avançar <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-orange disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Confirmar inscrição
                </button>
              )}
            </div>
          </form>

          <aside className="rounded-3xl border border-border bg-[color:var(--color-brand-soft)] p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--color-brand-orange)]">
              Resumo
            </p>
            <h3 className="heading-section mt-2 text-2xl text-[color:var(--color-brand-purple-title)]">
              {eventData?.event?.name ?? "II Corrida das Famílias"}
            </h3>
            {eventData?.currentLot ? (
              <>
                <p className="mt-3 text-sm text-[color:var(--color-brand-purple-text)]">
                  Lote vigente: <strong>{eventData.currentLot.name}</strong>
                </p>
                <p className="mt-1 text-3xl font-black text-[color:var(--color-brand-purple-title)]">
                  {formatBRL(eventData.currentLot.price_cents)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-[color:var(--color-brand-purple-text)]">
                Carregando lote vigente...
              </p>
            )}
            <ul className="mt-4 space-y-2 text-xs text-[color:var(--color-brand-purple-text)]/80">
              <li>• Camisa oficial + número de peito</li>
              <li>• Medalha de finisher</li>
              <li>• Hidratação no percurso</li>
              <li>• Bênção na largada</li>
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
                ? "bg-gradient-orange text-white"
                : "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-purple-text)]/60"
            }`}
          >
            {i + 1}
          </span>
          <span
            className={`hidden text-xs font-bold uppercase tracking-wide sm:inline ${
              i === current
                ? "text-[color:var(--color-brand-purple-title)]"
                : "text-[color:var(--color-brand-purple-text)]/60"
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
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-[color:var(--color-brand-purple-text)]">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-[color:var(--color-brand-purple-text)] outline-none transition focus:border-[color:var(--color-brand-purple)] focus:ring-2 focus:ring-[color:var(--color-brand-purple)]/20";

function StepPersonal({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const { register, formState, setValue, watch } = form;
  const cpf = watch("cpf");
  const wpp = watch("whatsapp");
  useEffect(() => {
    setValue("cpf", maskCpf(cpf || ""), { shouldValidate: false });
  }, [cpf, setValue]);
  useEffect(() => {
    setValue("whatsapp", maskPhone(wpp || ""), { shouldValidate: false });
  }, [wpp, setValue]);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Nome completo" error={formState.errors.full_name?.message} className="md:col-span-2">
        <input className={inputClass} {...register("full_name")} placeholder="Como aparece no documento" />
      </Field>
      <Field label="CPF" error={formState.errors.cpf?.message}>
        <input className={inputClass} {...register("cpf")} placeholder="000.000.000-00" inputMode="numeric" />
      </Field>
      <Field label="Data de nascimento" error={formState.errors.birth_date?.message}>
        <input type="date" className={inputClass} {...register("birth_date")} />
      </Field>
      <Field label="E-mail" error={formState.errors.email?.message}>
        <input type="email" className={inputClass} {...register("email")} placeholder="voce@email.com" />
      </Field>
      <Field label="WhatsApp" error={formState.errors.whatsapp?.message}>
        <input className={inputClass} {...register("whatsapp")} placeholder="(87) 90000-0000" inputMode="numeric" />
      </Field>
      <Field label="Gênero" error={formState.errors.gender?.message}>
        <select className={inputClass} {...register("gender")} defaultValue="">
          <option value="" disabled>Selecione</option>
          <option value="female">Feminino</option>
          <option value="male">Masculino</option>
          <option value="other">Prefiro não informar</option>
        </select>
      </Field>
      <Field label="Categoria" error={formState.errors.category?.message}>
        <select className={inputClass} {...register("category")} defaultValue="">
          <option value="" disabled>Selecione</option>
          <option value="5km_geral">5km Geral</option>
          <option value="5km_familia">5km Família</option>
          <option value="caminhada">Caminhada</option>
        </select>
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
          <option value="" disabled>Selecione</option>
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
        <input className={inputClass} {...register("emergency_contact_phone")} placeholder="(87) 90000-0000" />
      </Field>
      <Field label="Observações médicas (opcional)" error={formState.errors.medical_notes?.message} className="md:col-span-2">
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
      <div className="rounded-2xl border border-border bg-[color:var(--color-brand-soft)]/40 p-5 text-sm text-[color:var(--color-brand-purple-text)]">
        <p><strong>Nome:</strong> {v.full_name}</p>
        <p><strong>CPF:</strong> {v.cpf}</p>
        <p><strong>E-mail:</strong> {v.email}</p>
        <p><strong>WhatsApp:</strong> {v.whatsapp}</p>
        <p><strong>Categoria:</strong> {v.category} — Camisa {v.shirt_size?.toUpperCase()}</p>
        {amount != null && (
          <p className="mt-3 text-base">
            <strong>Total:</strong>{" "}
            <span className="font-black text-[color:var(--color-brand-purple-title)]">
              {formatBRL(amount)}
            </span>
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-[color:var(--color-brand-purple-text)]">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-[color:var(--color-brand-orange)]" {...register("accepted_terms")} />
        <span>
          Li e aceito o <a className="font-bold underline" href="/regulamento" target="_blank">regulamento</a> da prova.
        </span>
      </label>
      {formState.errors.accepted_terms && (
        <span className="text-xs text-destructive">{formState.errors.accepted_terms.message}</span>
      )}

      <label className="flex items-start gap-3 text-sm text-[color:var(--color-brand-purple-text)]">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-[color:var(--color-brand-orange)]" {...register("accepted_lgpd")} />
        <span>
          Concordo com a <a className="font-bold underline" href="/politica-privacidade" target="_blank">política de privacidade</a> e o tratamento dos meus dados conforme a LGPD.
        </span>
      </label>
      {formState.errors.accepted_lgpd && (
        <span className="text-xs text-destructive">{formState.errors.accepted_lgpd.message}</span>
      )}
    </div>
  );
}
