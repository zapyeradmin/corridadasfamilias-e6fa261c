import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ContentSection, PageHeader } from "@/components/site/page-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/regulamento")({
  head: () => ({
    meta: [
      { title: "Regulamento Oficial — 2ª Corrida Natalina | Corre +" },
      {
        name: "description",
        content:
          "Regulamento Oficial da 2ª Corrida Natalina | Corre + (Serra Talhada/PE): inscrições, lote promocional de valor único, brindes exclusivos, percurso, kit e premiação.",
      },
      { property: "og:title", content: "Regulamento Oficial — 2ª Corrida Natalina | Corre +" },
      {
        property: "og:description",
        content:
          "Leia o Regulamento Oficial completo: inscrições com valor único de R$ 83,60, brinde especial para os 335 primeiros inscritos, percurso de 6KM e premiação.",
      },
    ],
  }),
  component: Page,
});

type Section = { title: string; items: (string | { type: "table"; render: () => ReactNode })[] };

const LotesTable = () => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lote</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Período / Benefício Especial</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-bold text-[#c20505]">Lote 1 (Promocional)</TableCell>
          <TableCell className="font-extrabold text-[#c20505]">R$ 83,60 (Valor Único)</TableCell>
          <TableCell className="font-medium text-[#3d0000]">
            🎁 <strong>Brinde Exclusivo:</strong> Os primeiros 335 inscritos com pagamento confirmado receberão 1 Coqueteleira Personalizada da Corrida + 1 Chaveiro Personalizado.
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-bold text-[#c20505]">Lote 2</TableCell>
          <TableCell className="font-extrabold text-[#c20505]">R$ 96,00 (Valor Único)</TableCell>
          <TableCell className="font-medium text-[#3d0000]">
            Data a ser definida pela Organização.
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-bold text-[#c20505]">Lote 3</TableCell>
          <TableCell className="font-extrabold text-[#c20505]">R$ 105,60 (Valor Único)</TableCell>
          <TableCell className="font-medium text-[#3d0000]">
            Data a ser definida pela Organização.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

const PremiacaoGeralTable = () => (
  <div className="overflow-x-auto">
    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#c20505]">
      Premiação — Geral Masculina e Geral Feminina
    </p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Colocação</TableHead>
          <TableHead>Premiação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-semibold">1º lugar</TableCell>
          <TableCell>R$ 500,00 + Troféu de Primeiro Lugar + Medalha</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-semibold">2º lugar</TableCell>
          <TableCell>R$ 300,00 + Troféu de Segundo Lugar + Medalha</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-semibold">3º lugar</TableCell>
          <TableCell>R$ 200,00 + Troféu de Terceiro Lugar + Medalha</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

const PremiacaoCategoriasTable = () => (
  <div className="overflow-x-auto">
    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#c20505]">
      Premiação — Infanto-Juvenil (Masc./Fem.) e 60+ (Masc./Fem.)
    </p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Colocação</TableHead>
          <TableHead>Premiação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-semibold">1º lugar</TableCell>
          <TableCell>Troféu de Primeiro Lugar + Medalha</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-semibold">2º lugar</TableCell>
          <TableCell>Troféu de Segundo Lugar + Medalha</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-semibold">3º lugar</TableCell>
          <TableCell>Troféu de Terceiro Lugar + Medalha</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

const SECTIONS: Section[] = [
  {
    title: "1. Do Evento",
    items: [
      "1.1. A 2ª Corrida Natalina (Edição 2026) | Corre + será realizada no dia 20 de dezembro de 2026, na cidade de Serra Talhada/PE, com concentração a partir das 5h00 e largada às 6h00 (sem atrasos), com ponto de encontro no Beach Garden · Shopping Serra Talhada.",
      "1.2. O evento é organizado pela equipe Corre +, promovendo a prática esportiva, o cuidado com a saúde, a celebração e a confraternização comunitária.",
      "1.3. A corrida possui caráter esportivo, social e de confraternização, incentivando hábitos de vida saudáveis e momentos inesquecíveis para todos os participantes.",
      "1.4. A modalidade principal do evento será corrida de rua em percurso de 6 km. Participantes que desejarem poderão também concluir o percurso em ritmo de caminhada, respeitando as orientações da Organização, dos fiscais e dos agentes de apoio.",
      "1.5. A Organização poderá, por motivo de segurança, logística, força maior, condições climáticas, orientação de autoridades públicas ou necessidade operacional, alterar horários, pontos de apoio, percurso, ordem de largada ou programação, sempre preservando a integridade dos participantes.",
      "1.6. O evento é aberto a atletas profissionais, amadores, entusiastas da corrida, jovens, adultos e idosos, observadas as categorias, condições de saúde e demais disposições deste Regulamento.",
    ],
  },
  {
    title: "2. Das Inscrições",
    items: [
      "2.1. As inscrições serão realizadas exclusivamente por meio do Site Oficial do evento, não sendo garantida qualquer inscrição por canais paralelos ou informais.",
      "2.2. Para efetivar a inscrição, o participante deverá preencher corretamente o formulário oficial, informando todos os dados solicitados, selecionando sua categoria e tamanho da camiseta, e concordando com os termos deste Regulamento.",
      "2.3. O participante é integralmente responsável pela veracidade, exatidão e atualização das informações fornecidas no ato da inscrição.",
      "2.4. Informações incorretas ou incompletas poderão gerar impedimento de participação, correção administrativa, cancelamento da inscrição ou impossibilidade de retirada do kit, conforme avaliação da Organização.",
      "2.5. A inscrição será considerada registrada após o envio correto do formulário. A confirmação definitiva da participação dependerá da confirmação do pagamento.",
      "2.6. Não haverá inscrição criança ou lote infantil. Todos os participantes estão sujeitos ao valor único do lote vigente.",
      "2.7. Menores de idade com idade a partir de 9 anos poderão participar mediante expressa autorização do responsável legal (conforme Anexo II deste Regulamento).",
      "2.8. Não haverá inscrição no dia do evento. As inscrições encerram-se conforme o limite técnico de vagas ou prazo final estipulado pela Organização.",
    ],
  },
  {
    title: "3. Dos Pagamentos e Lotes",
    items: [
      "3.1. O pagamento da inscrição será realizado exclusivamente online, por meio do checkout integrado ao site oficial do evento.",
      "3.2. As formas de pagamento aceitas serão: PIX, cartão de crédito à vista e cartão de crédito parcelado, conforme disponibilidade do gateway de pagamento.",
      "3.3. O valor da inscrição obedecerá aos lotes oficiais estabelecidos pela Organização. O primeiro lote é o Lote 1 (Promocional) no valor de R$ 83,60 (oitenta e três reais e sessenta centavos).",
      "3.4. Os próximos lotes serão: Lote 2 no valor de R$ 96,00 (noventa e seis reais) com data a ser definida pela Organização, e Lote 3 no valor de R$ 105,60 (cento e cinco reais e sessenta centavos) com data a ser definida pela Organização.",
      "3.5. Todos os valores dos lotes de pagamento são de valor único. Não haverá inscrição criança ou lote para criança.",
      "3.6. Como benefício promocional exclusivo, os primeiros 335 (trezentos e trinta e cinco) inscritos com pagamento confirmado no Lote 1 receberão de brinde uma Coqueteleira Personalizada da Corrida + um Chaveiro Personalizado.",
      { type: "table", render: LotesTable },
      "3.7. A inscrição somente será considerada confirmada após a validação definitiva do pagamento pelo sistema financeiro.",
      "3.8. O preenchimento do formulário de inscrição sem a conclusão do pagamento não garante a vaga nem o direito aos brindes promocionais.",
    ],
  },
  {
    title: "4. Percurso",
    items: [
      "4.1. O percurso oficial da 2ª Corrida Natalina | Corre + terá distância de 6 km.",
      "4.2. A largada e a chegada ocorrerão no Beach Garden · Shopping Serra Talhada, em Serra Talhada/PE.",
      "4.3. O percurso será predominantemente asfaltado, com sinalização clara em todo o trajeto.",
      "4.4. Haverá pontos de hidratação distribuídos estrategicamente durante todo o percurso.",
      "4.5. O participante que cortar caminho, utilizar meios externos de locomoção ou descumprir as orientações dos fiscais será desclassificado.",
    ],
  },
  {
    title: "5. Kit do Atleta",
    items: [
      "5.1. O kit oficial do atleta é composto por: Camiseta Oficial da corrida, Número de Peito personalizado, Chip de Cronometragem, pontos de hidratação no percurso e Medalha Finisher para os atletas que completarem o percurso oficial.",
      "5.2. Para os primeiros 335 participantes com pagamento confirmado, o kit incluirá adicionalmente: 1 Coqueteleira Personalizada da Corrida + 1 Chaveiro Personalizado.",
      "5.3. Os tamanhos de camiseta disponíveis para escolha na inscrição são: PP, P, M, G, GG e XGG.",
      "5.4. O tamanho da camisa escolhido no momento da inscrição não poderá ser alterado posteriormente.",
      "5.5. As datas, horários e local de entrega dos kits serão divulgados previamente pelos canais oficiais da Organização e no site oficial.",
      "5.6. Para retirada do kit, o participante deverá apresentar documento oficial com foto e o comprovante de confirmação da inscrição.",
      "5.7. A retirada de kits por terceiros será permitida mediante apresentação de autorização específica (Anexo III) e documento do atleta inscrito.",
    ],
  },
  {
    title: "6. Das Categorias e Premiações",
    items: [
      "6.1. A 2ª Corrida Natalina | Corre + contará com categorias masculinas e femininas, conforme faixa etária e regras estabelecidas neste Regulamento.",
      "6.2. As categorias oficiais previstas são: Geral Masculina; Geral Feminina; Infanto-Juvenil Masculina (9–17 anos); Infanto-Juvenil Feminina (9–17 anos); Categoria 60+ Masculina; Categoria 60+ Feminina.",
      "6.3. A idade do participante poderá ser apurada com base na data do evento, podendo a Organização solicitar documento oficial para conferência da categoria.",
      "6.4. A premiação da Categoria Geral Masculina e da Categoria Geral Feminina será:",
      { type: "table", render: PremiacaoGeralTable },
      "6.5. Nas categorias Infanto-Juvenil Masculina, Infanto-Juvenil Feminina, 60+ Masculina e 60+ Feminina, a premiação será:",
      { type: "table", render: PremiacaoCategoriasTable },
      "6.6. Todos os participantes que concluírem o percurso completo receberão medalha de participação (finisher), independentemente de colocação.",
      "6.7. A corrida contará com chip de cronometragem, garantindo mais precisão, segurança e agilidade na apuração dos resultados oficiais de cada atleta.",
      "6.8. A Organização utilizará os dados da cronometragem eletrônica por chip, combinados com fiscais de percurso e equipe de chegada para validação oficial das colocações.",
      "6.9. O participante chamado ao pódio deverá apresentar documento oficial, se solicitado, para confirmação de identidade, idade, categoria e regularidade da inscrição.",
      "6.10. A premiação não será cumulativa, salvo decisão expressa da Organização. Caso um participante faça jus a mais de uma premiação, a Organização definirá a regra de prioridade.",
      "6.11. Haverá sorteio de brindes de parceiros e patrocinadores após a entrega das premiações para os atletas presentes no local.",
    ],
  },
  {
    title: "7. Ação de Solidariedade",
    items: [
      "7.1. Como parte do compromisso solidário da 2ª Corrida Natalina | Corre +, cada participante deverá levar 1 kg de alimento não perecível no ato da retirada do kit.",
      "7.2. A ação solidária integra a proposta do evento de unir esporte, celebração, saúde e solidariedade, contribuindo para causas sociais em nossa comunidade.",
      "7.3. A entrega do alimento deverá ocorrer no mesmo momento da retirada do kit do atleta.",
      "7.4. Recomenda-se que os alimentos estejam dentro do prazo de validade, em embalagem original, lacrada e em bom estado de conservação.",
      "7.5. A Organização divulgará a destinação dos alimentos arrecadados como forma de transparência e prestação de contas à comunidade.",
    ],
  },
  {
    title: "8. Sobre a Largada e Chegada",
    items: [
      "8.1. A concentração dos participantes terá início às 5h00, no Beach Garden · Shopping Serra Talhada.",
      "8.2. O aquecimento oficial está previsto para as 5h30.",
      "8.3. As instruções finais e posicionamento no pórtico de largada ocorrerão às 5h50.",
      "8.4. A largada será realizada pontualmente às 6h00 (sem atrasos), salvo alteração excepcional por determinação de segurança pública.",
      "8.5. O participante deverá chegar com antecedência suficiente para se posicionar, utilizar a estrutura de apoio, fixar corretamente o número de peito e chip e receber as orientações da equipe organizadora.",
      "8.6. A chegada ocorrerá no mesmo local da largada, no Beach Garden · Shopping Serra Talhada.",
      "8.7. O funil de chegada, a área de dispersão e a área de premiação deverão ser respeitados por todos os participantes e público presente.",
    ],
  },
  {
    title: "9. Regras da Corrida",
    items: [
      "9.1. O participante deverá usar o número de peito e o chip de cronometragem de forma visível e correta durante todo o percurso.",
      "9.2. É proibido correr com número de peito de outro participante sem autorização formal de transferência pela Organização.",
      "9.3. É proibido cortar caminho, abandonar o percurso oficial e retornar em ponto posterior, utilizar veículos ou qualquer meio artificial de deslocamento para obter vantagem.",
      "9.4. O participante deverá respeitar os demais atletas, os fiscais, os voluntários, os organizadores, os agentes de trânsito, os profissionais de saúde e as autoridades públicas.",
      "9.5. A prática de conduta antidesportiva, agressão física ou verbal, fraude ou danos ao patrimônio ensejará desclassificação imediata.",
      "9.6. O participante deverá seguir todas as orientações de segurança, hidratação e circulação indicadas pela Organização.",
    ],
  },
  {
    title: "10. Regras de Troca e/ou Repasse",
    items: [
      "10.1. O participante poderá solicitar a transferência de sua inscrição para outra pessoa, desde que informe a Organização com antecedência oficial.",
      "10.2. A transferência somente será válida após confirmação formal da Organização.",
      "10.3. Em caso de transferência, o tamanho da camisa originalmente escolhido não poderá ser alterado.",
      "10.4. A pessoa que receber a inscrição transferida deverá fornecer seus dados completos e aceitar integralmente este Regulamento.",
    ],
  },
  {
    title: "11. Acompanhamento dos Atletas Durante a Corrida",
    items: [
      "11.1. Não será permitido que acompanhantes não inscritos utilizem veículos motorizados, bicicletas ou patinetes no percurso, de forma a preservar a segurança e o fluxo dos atletas.",
      "11.2. Familiares, amigos e público poderão incentivar os atletas em pontos permitidos ao longo do percurso, sem invadir a pista de corrida.",
    ],
  },
  {
    title: "12. Saúde do Atleta",
    items: [
      "12.1. Ao se inscrever, o participante declara estar em plenas condições físicas e de saúde compatíveis com a prática de corrida de rua em percurso de 6 km.",
      "12.2. Recomenda-se que todos os participantes façam avaliação médica prévia à prática de atividade física intensa.",
      "12.3. Haverá equipe de primeiros socorros e apoio médico de prontidão durante todo o evento para casos de urgência.",
    ],
  },
  {
    title: "13. Cancelamento com Reembolso",
    items: [
      "13.1. O participante poderá solicitar o cancelamento e reembolso no prazo de até 7 dias corridos contados da data da inscrição, conforme direito de arrependimento da legislação aplicável.",
      "13.2. A solicitação de cancelamento deverá ser enviada pelos canais oficiais da Organização acompanhada dos comprovantes da inscrição.",
    ],
  },
  {
    title: "14. Casos de Não Reembolso",
    items: [
      "14.1. Não haverá reembolso fora do prazo legal de 7 dias ou quando o participante simplesmente não comparecer no dia do evento.",
      "14.2. Não haverá reembolso em caso de desclassificação por conduta antidesportiva, fraude ou descumprimento deste Regulamento.",
    ],
  },
  {
    title: "15. Direito de Imagem e Dados dos Atletas (LGPD)",
    items: [
      "15.1. Ao realizar a inscrição e participar do evento, o atleta autoriza, de forma gratuita, o uso de sua imagem, voz e dados de classificação captados durante a 2ª Corrida Natalina | Corre + para fins de divulgação e registro institucional.",
      "15.2. Os dados pessoais fornecidos na inscrição serão tratados com segurança e transparência, estritamente para os fins de organização do evento esportivo, em conformidade com a LGPD.",
    ],
  },
  {
    title: "16. Disposições Gerais",
    items: [
      "16.1. A inscrição na 2ª Corrida Natalina | Corre + implica aceitação irrestrita e integral de todos os termos deste Regulamento.",
      "16.2. Os casos omissos serão soberanamente decididos pela comissão organizadora da 2ª Corrida Natalina | Corre +.",
    ],
  },
];

const ANEXO_I_PARAGRAFOS = [
  "Eu, participante inscrito na 2ª Corrida Natalina | Corre +, declaro que li, compreendi e aceito integralmente o Regulamento Geral do evento.",
  "Declaro estar em condições físicas e de saúde compatíveis com a participação em corrida ou caminhada de 6 km, assumindo a responsabilidade por minha condição clínica e pela decisão de participar.",
  "Declaro estar ciente de que devo respeitar o percurso, os horários, os fiscais, os voluntários, a equipe de saúde, os organizadores e as autoridades presentes.",
  "Declaro autorizar o uso gratuito de minha imagem, voz, nome, fotografia e registros audiovisuais captados durante o evento para fins institucionais, promocionais, jornalísticos, históricos e de divulgação da 2ª Corrida Natalina | Corre +.",
  "Declaro estar ciente de que meus dados pessoais serão tratados para fins de inscrição, pagamento, organização, comunicação, segurança, gestão administrativa e execução do evento, nos termos do Regulamento e da legislação aplicável.",
  "Declaro estar ciente de que a confirmação definitiva da inscrição depende da confirmação do pagamento e que o não comparecimento ao evento não gera direito automático a reembolso.",
];

const ANEXO_I_CAMPOS = ["Nome do participante", "CPF", "Data", "Assinatura"];

const ANEXO_II_PARAGRAFOS = [
  "Eu, responsável legal pelo menor participante, autorizo sua participação na 2ª Corrida Natalina | Corre +, declarando estar ciente das condições do evento, do percurso de 6 km, das regras de categoria e das normas previstas no Regulamento Geral.",
  "Declaro, ainda, autorizar o uso de imagem do menor para fins institucionais, promocionais, jornalísticos, históricos e de divulgação do evento, bem como o tratamento de seus dados pessoais estritamente para fins relacionados à inscrição, participação, organização, segurança e execução da corrida.",
];

const ANEXO_II_CAMPOS = [
  "Nome do menor",
  "CPF ou documento do menor",
  "Data de nascimento",
  "Nome do responsável",
  "CPF do responsável",
  "Telefone/WhatsApp",
  "Assinatura do responsável",
];

const ANEXO_III_PARAGRAFOS = [
  "Eu, participante inscrito na 2ª Corrida Natalina | Corre +, autorizo a pessoa abaixo identificada a retirar meu kit de atleta, declarando estar ciente de que a conferência dos itens deverá ocorrer no ato da retirada.",
  "A pessoa autorizada deverá apresentar documento de identificação próprio e cópia, foto ou documento do participante inscrito, conforme orientação da Organização.",
];

const ANEXO_III_CAMPOS = [
  "Nome do participante",
  "CPF do participante",
  "Nome da pessoa autorizada",
  "CPF da pessoa autorizada",
  "Telefone/WhatsApp",
  "Data",
  "Assinatura do participante",
  "Assinatura da pessoa autorizada",
];

function CamposAssinatura({ campos }: { campos: string[] }) {
  return (
    <dl className="mt-5 grid gap-3">
      {campos.map((c) => (
        <div key={c} className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3">
          <dt className="min-w-[230px] text-sm font-semibold text-[color:var(--color-brand-purple-title)]">
            {c}:
          </dt>
          <dd className="flex-1 border-b border-dashed border-border/80 pb-1 text-sm text-[color:var(--color-brand-purple-text)]/60">
            &nbsp;
          </dd>
        </div>
      ))}
    </dl>
  );
}

function AnexoCard({
  numero,
  titulo,
  paragrafos,
  campos,
  observacao,
}: {
  numero: string;
  titulo: string;
  paragrafos: string[];
  campos: string[];
  observacao?: string;
}) {
  return (
    <article className="rounded-3xl border-2 border-[color:var(--color-brand-orange)]/30 bg-gradient-to-br from-white to-[color:var(--color-brand-orange)]/5 p-7 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--color-brand-orange)]">
        {numero}
      </p>
      <h2 className="mt-2 text-xl font-extrabold uppercase tracking-tight text-[color:var(--color-brand-purple-title)]">
        {titulo}
      </h2>
      <div className="mt-4 space-y-3">
        {paragrafos.map((p, i) => (
          <p
            key={i}
            className="text-base leading-relaxed text-[color:var(--color-brand-purple-text)]"
          >
            {p}
          </p>
        ))}
      </div>
      <CamposAssinatura campos={campos} />
      {observacao && (
        <p className="mt-4 rounded-xl bg-[color:var(--color-brand-purple-title)]/5 p-3 text-sm italic text-[color:var(--color-brand-purple-text)]">
          {observacao}
        </p>
      )}
    </article>
  );
}

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Documento oficial"
        title="Regulamento Geral"
        description="2ª Corrida Natalina | Corre +. Leia atentamente antes de se inscrever."
      />
      <ContentSection>
        {/* Intro */}
        <div className="mb-10 rounded-3xl border border-border bg-white p-7 shadow-soft">
          <p className="text-base leading-relaxed text-[color:var(--color-brand-purple-text)]">
            Este Regulamento estabelece as condições gerais de participação, inscrição, pagamento,
            retirada de kit, percurso, premiação, segurança, saúde, uso de imagem, tratamento de
            dados pessoais e demais regras aplicáveis à 2ª Corrida Natalina | Corre +.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[color:var(--color-brand-purple-text)]">
            Ao realizar a inscrição, o participante declara ter lido, compreendido e aceitado
            integralmente as normas deste Regulamento, comprometendo-se a respeitar as orientações
            da Organização, dos fiscais, dos agentes de apoio e das autoridades competentes.
          </p>
        </div>

        {/* Preâmbulo */}
        <article className="mb-10 rounded-3xl bg-gradient-hero p-8 text-white shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/85">Preâmbulo</p>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-white/90">
            <p>
              A 2ª Corrida Natalina (Edição 2026) | Corre + é um evento de corrida de rua de caráter esportivo,
              comunitário e festivo, realizado em Serra Talhada/PE, com o propósito
              de reunir atletas, entusiastas da corrida, jovens, adultos, idosos e toda a
              comunidade em torno da saúde, do esporte, da celebração e da confraternização.
            </p>
            <p>
              O presente Regulamento foi elaborado para orientar os participantes, preservar a
              organização do evento, garantir maior segurança operacional e estabelecer regras
              claras para inscrição, pagamento, participação, retirada de kits, conduta durante a
              corrida, premiação, cancelamento, reembolso, direito de imagem e tratamento de dados
              pessoais.
            </p>
            <p>
              A participação no evento implica a aceitação integral deste Regulamento, bem como das
              orientações complementares que venham a ser divulgadas pela Organização em seus canais
              oficiais.
            </p>
          </div>
        </article>

        {/* Seções 1..16 */}
        <div className="grid gap-6">
          {SECTIONS.map((s) => (
            <article
              key={s.title}
              className="rounded-3xl border border-border bg-white p-7 shadow-soft"
            >
              <h2 className="text-lg font-extrabold uppercase tracking-tight text-[color:var(--color-brand-purple-title)]">
                {s.title}
              </h2>
              <div className="mt-4 space-y-3">
                {s.items.map((item, i) =>
                  typeof item === "string" ? (
                    <p
                      key={i}
                      className="text-base leading-relaxed text-[color:var(--color-brand-purple-text)]"
                    >
                      {item}
                    </p>
                  ) : (
                    <div key={i} className="my-2 rounded-2xl border border-border bg-muted/30 p-4">
                      {item.render()}
                    </div>
                  ),
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Anexos */}
        <div className="mt-12">
          <h2 className="heading-display text-3xl text-[color:var(--color-brand-purple-title)] md:text-4xl">
            Anexos
          </h2>
          <p className="mt-2 text-base text-[color:var(--color-brand-purple-text)]">
            Termos e autorizações para uso quando solicitados pela Organização.
          </p>
          <div className="mt-6 grid gap-6">
            <AnexoCard
              numero="Anexo I"
              titulo="Termo de Responsabilidade e Ciência do Participante"
              paragrafos={ANEXO_I_PARAGRAFOS}
              campos={ANEXO_I_CAMPOS}
            />
            <AnexoCard
              numero="Anexo II"
              titulo="Autorização para Menor de Idade"
              paragrafos={ANEXO_II_PARAGRAFOS}
              campos={ANEXO_II_CAMPOS}
            />
            <AnexoCard
              numero="Anexo III"
              titulo="Autorização para Retirada de Kit por Terceiro"
              paragrafos={ANEXO_III_PARAGRAFOS}
              campos={ANEXO_III_CAMPOS}
              observacao="Observação: a Organização poderá exigir outros documentos ou procedimentos complementares para segurança da retirada do kit."
            />
          </div>
        </div>
      </ContentSection>
    </>
  );
}
