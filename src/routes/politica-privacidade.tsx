import { createFileRoute } from "@tanstack/react-router";
import { ContentSection, PageHeader } from "@/components/site/page-shell";

export const Route = createFileRoute("/politica-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — II Corrida das Famílias" },
      { name: "description", content: "Como tratamos seus dados pessoais conforme a LGPD." },
      { property: "og:title", content: "Política de Privacidade — II Corrida das Famílias" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="LGPD" title="Política de Privacidade" />
      <ContentSection>
        <article className="prose prose-sm max-w-none rounded-3xl border border-border bg-white p-8 text-[color:var(--color-brand-purple-text)] shadow-soft">
          <h2>1. Dados coletados</h2>
          <p>
            Coletamos os dados necessários à inscrição: nome completo, CPF, data de nascimento,
            e-mail, WhatsApp, gênero, categoria, tamanho da camisa, contato de emergência e aceite
            dos termos.
          </p>
          <h2>2. Finalidade</h2>
          <p>
            Os dados são utilizados para identificar o participante, processar pagamento, montar o
            kit, gerar a classificação e enviar comunicações sobre o evento.
          </p>
          <h2>3. Compartilhamento</h2>
          <p>
            Dados financeiros são compartilhados com a Infinity Pay para processamento do
            pagamento. Não vendemos nem compartilhamos dados pessoais com terceiros para fins
            comerciais.
          </p>
          <h2>4. Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo
            e-mail oficial do evento.
          </p>
          <h2>5. Segurança</h2>
          <p>
            Aplicamos políticas de segurança em nível de banco de dados (RLS) e controles de
            acesso ao painel administrativo para proteger as informações.
          </p>
        </article>
      </ContentSection>
    </>
  );
}
