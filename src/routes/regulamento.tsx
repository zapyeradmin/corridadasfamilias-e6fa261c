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
      { title: "Regulamento Oficial — II Corrida das Famílias" },
      {
        name: "description",
        content:
          "Regulamento Oficial da II Corrida das Famílias (5 km, Serra Talhada/PE, 09/08/2026): inscrições, pagamentos, lotes, percurso, kit, categorias, premiação, LGPD e anexos.",
      },
      { property: "og:title", content: "Regulamento Oficial — II Corrida das Famílias" },
      {
        property: "og:description",
        content:
          "Leia o Regulamento Oficial completo: inscrições, lotes, percurso, kit, categorias, premiação, cancelamento, LGPD e anexos.",
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
          <TableHead>Adulto</TableHead>
          <TableHead>Crianças até 9 anos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-semibold">Lote 1</TableCell>
          <TableCell>R$ 68,00</TableCell>
          <TableCell>R$ 48,00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-semibold">Lote 2</TableCell>
          <TableCell>R$ 78,00</TableCell>
          <TableCell>R$ 58,00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-semibold">Lote 3</TableCell>
          <TableCell>R$ 88,00</TableCell>
          <TableCell>R$ 68,00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

const PremiacaoGeralTable = () => (
  <div className="overflow-x-auto">
    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-brand-purple-title)]">
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
    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-brand-purple-title)]">
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
      "1.1. A II CORRIDA DAS FAMÍLIAS será realizada no dia 09 de agosto de 2026, na cidade de Serra Talhada/PE, com concentração, largada e chegada na Igreja Matriz de Nossa Senhora do Rosário.",
      "1.2. O evento é organizado pelo ECC — Encontro de Casais com Cristo, da Paróquia de Nossa Senhora do Rosário de Serra Talhada/PE, e tem como lema oficial: “Juntos no Rosário, Famílias unidas na Fé”.",
      "1.3. A corrida possui caráter esportivo, beneficente, comunitário e religioso, promovendo integração social, incentivo à prática esportiva, cuidado com a saúde, convivência familiar e solidariedade.",
      "1.4. A modalidade principal do evento será corrida de rua em percurso de 5 km. Participantes que não desejarem ou não puderem correr poderão concluir o percurso caminhando, respeitando as orientações da Organização, dos fiscais e dos agentes de apoio.",
      "1.5. A Organização poderá, por motivo de segurança, logística, força maior, condições climáticas, orientação de autoridades públicas ou necessidade operacional, alterar horários, pontos de apoio, percurso, ordem de largada, programação ou demais condições do evento, sempre buscando preservar a segurança dos participantes e a boa execução da corrida.",
      "1.6. O evento é aberto a atletas profissionais, amadores, entusiastas da corrida, famílias, jovens, adultos e idosos, observadas as categorias, condições de saúde, regras de idade e demais disposições deste Regulamento.",
    ],
  },
  {
    title: "2. Das Inscrições",
    items: [
      "2.1. As inscrições serão realizadas exclusivamente por meio do Site Oficial do evento, não sendo garantida qualquer inscrição por canais paralelos, mensagens avulsas, redes sociais ou atendimento informal.",
      "2.2. Para efetivar a inscrição, o participante deverá preencher corretamente o formulário oficial, informando, no mínimo: nome completo, CPF, data de nascimento, e-mail, WhatsApp, gênero, categoria, tamanho da camisa e aceite dos termos de participação.",
      "2.3. O participante é integralmente responsável pela veracidade, exatidão e atualização das informações fornecidas no ato da inscrição.",
      "2.4. Informações incorretas, incompletas, falsas ou incompatíveis com as regras de categoria poderão gerar impedimento de participação, correção administrativa, desclassificação, cancelamento da inscrição ou impossibilidade de retirada do kit, conforme avaliação da Organização.",
      "2.5. A inscrição será considerada registrada após o envio correto do formulário. Entretanto, a confirmação definitiva da participação dependerá da confirmação do pagamento, conforme previsto neste Regulamento.",
      "2.6. O prazo final para inscrição será 12 de julho de 2026, às 23h59, horário de Brasília, salvo eventual alteração expressamente divulgada pela Organização.",
      "2.7. Não haverá inscrição no dia do evento, salvo decisão extraordinária da Organização, divulgada oficialmente. A regra geral é que todas as inscrições sejam realizadas previamente pelo site oficial.",
      "2.8. As vagas são consideradas ilimitadas dentro do período de inscrição, porém a Organização poderá encerrar, suspender ou limitar inscrições por motivo operacional, produção de kits, segurança, logística ou qualquer outra necessidade justificada.",
      "2.9. Menores de idade somente poderão participar mediante autorização prévia de responsável legal e, quando aplicável, acompanhados por responsável durante o evento.",
      "2.10. Crianças até 8 anos, quando inscritas, participarão em condição especial de acompanhamento, observadas as regras do evento e a responsabilidade do responsável legal. A Organização poderá definir se essa participação terá ou não caráter competitivo, conforme regulamento complementar ou orientação oficial.",
    ],
  },
  {
    title: "3. Dos Pagamentos",
    items: [
      "3.1. O pagamento da inscrição será realizado de forma online, por meio de checkout de pagamento integrado ao site oficial do evento.",
      "3.2. As formas de pagamento aceitas serão: PIX, cartão de crédito à vista e cartão de crédito parcelado, conforme disponibilidade do gateway de pagamento utilizado.",
      "3.3. O valor da inscrição obedecerá aos lotes oficiais vigentes no momento da inscrição, conforme tabela abaixo:",
      { type: "table", render: LotesTable },
      "3.4. A Organização não oferecerá descontos por grupos, equipes ou inscrições solidárias, considerando que os valores já foram definidos com caráter popular e acessível.",
      "3.5. A inscrição somente será considerada confirmada após a confirmação do pagamento pelo sistema financeiro ou pelo painel administrativo da Organização.",
      "3.6. Caso o participante preencha o formulário, mas não finalize o pagamento, sua inscrição poderá permanecer com status pendente, não garantindo participação definitiva até a confirmação financeira.",
      "3.7. Eventuais taxas, prazos de compensação, parcelamento, contestação, estorno ou processamento seguirão as regras do gateway de pagamento e das instituições financeiras envolvidas.",
      "3.8. A Organização poderá entrar em contato com participantes que estejam com pagamento pendente, mas não se responsabiliza por inscrições não confirmadas em razão de falha, ausência ou desistência de pagamento por parte do participante.",
    ],
  },
  {
    title: "4. Percurso",
    items: [
      "4.1. O percurso oficial da II CORRIDA DAS FAMÍLIAS terá distância aproximada de 5 km.",
      "4.2. A largada e a chegada ocorrerão na Igreja Matriz de Nossa Senhora do Rosário, em Serra Talhada/PE.",
      "4.3. O percurso será predominantemente asfaltado, plano e com poucos pontos de elevação de grau baixo, conforme planejamento informado pela Organização.",
      "4.4. Haverá 5 pontos de hidratação distribuídos estrategicamente durante o percurso.",
      "4.5. O trajeto poderá ser sinalizado por cones, placas, fitas, staffs, fiscais ou demais instrumentos de orientação, devendo o participante obedecer integralmente às indicações da Organização.",
      "4.6. O participante que sair deliberadamente do percurso oficial, cortar caminho, utilizar meios externos de deslocamento ou descumprir orientação dos fiscais poderá ser desclassificado.",
      "4.7. A Organização poderá alterar o percurso em caso de necessidade técnica, segurança pública, condições climáticas, obras, trânsito, determinação de autoridades ou qualquer situação que possa afetar a segurança dos participantes.",
    ],
  },
  {
    title: "5. Kit do Atleta",
    items: [
      "5.1. O kit do atleta será composto por camisa oficial da corrida, número de peito, hidratação durante o percurso e medalha para os participantes que concluírem integralmente o percurso.",
      "5.2. A camisa oficial terá modelo próprio do evento, com identidade visual da II CORRIDA DAS FAMÍLIAS, logos institucionais e marcas de patrocinadores, conforme arte aprovada pela Organização.",
      "5.3. Os tamanhos disponíveis serão: P Infantil, M Infantil, G Infantil, PP Adulto, P Adulto, M Adulto, G Adulto e GG Adulto, sujeitos à disponibilidade e à opção escolhida no ato da inscrição.",
      "5.4. O tamanho da camisa escolhido no momento da inscrição não poderá ser alterado posteriormente, inclusive em caso de transferência de inscrição.",
      "5.5. A retirada dos kits será realizada nos dias 04, 05 e 06 de agosto de 2026, das 19h30 às 21h30, no Salão Paroquial da Igreja de Nossa Senhora da Conceição, ao lado da Igreja de Nossa Senhora da Conceição.",
      "5.6. Para retirada do kit, o participante deverá apresentar documento oficial com foto e comprovante de inscrição e/ou confirmação de pagamento, quando solicitado.",
      "5.7. A retirada do kit por terceiro poderá ser autorizada mediante apresentação de autorização simples, cópia ou foto de documento do participante inscrito e documento de identificação da pessoa responsável pela retirada.",
      "5.8. Não haverá entrega de kit em horário ou local diferente do definido pela Organização, salvo decisão expressa e excepcional.",
      "5.9. Não haverá entrega de kit no dia do evento, exceto se a Organização comunicar oficialmente procedimento extraordinário.",
      "5.10. O participante deverá conferir seus dados, tamanho da camisa, número de peito e itens do kit no ato da retirada. Após a retirada, não serão aceitas reclamações referentes a tamanho, ausência de item ou dados informados incorretamente, salvo erro comprovado da Organização.",
      "5.11. O número de peito é pessoal, individual e intransferível, salvo hipótese de transferência formal da inscrição autorizada pela Organização.",
    ],
  },
  {
    title: "6. Das Categorias e Premiações",
    items: [
      "6.1. A II CORRIDA DAS FAMÍLIAS contará com categorias masculinas e femininas, conforme faixa etária e regras estabelecidas neste Regulamento.",
      "6.2. As categorias oficiais previstas são: Geral Masculina; Geral Feminina; Infanto-Juvenil Masculina, para participantes de 9 a 16 anos; Infanto-Juvenil Feminina, para participantes de 9 a 16 anos; Categoria 60+ Masculina, para participantes com 60 anos ou mais; Categoria 60+ Feminina, para participantes com 60 anos ou mais.",
      "6.3. A idade do participante poderá ser apurada com base na data do evento, podendo a Organização solicitar documento oficial para conferência da categoria.",
      "6.4. A premiação da Categoria Geral Masculina e da Categoria Geral Feminina será:",
      { type: "table", render: PremiacaoGeralTable },
      "6.5. Nas categorias Infanto-Juvenil Masculina, Infanto-Juvenil Feminina, 60+ Masculina e 60+ Feminina, a premiação será:",
      { type: "table", render: PremiacaoCategoriasTable },
      "6.6. Todos os participantes que concluírem o percurso completo receberão medalha de participação, independentemente de colocação.",
      "6.7. Não haverá chip de cronometragem. A classificação será apurada pela Organização, fiscais, equipe de chegada e critérios operacionais definidos para o evento.",
      "6.8. A Organização poderá utilizar ordem de chegada, controle visual, número de peito, registros de fiscais e demais mecanismos internos para validação das colocações.",
      "6.9. O participante chamado ao pódio deverá apresentar documento oficial, se solicitado, para confirmação de identidade, idade, categoria e regularidade da inscrição.",
      "6.10. A premiação não será cumulativa, salvo decisão expressa da Organização. Caso um participante faça jus a mais de uma premiação, a Organização poderá definir a regra de prioridade, preservando a transparência e a equidade do evento.",
      "6.11. Haverá sorteio de brindes de patrocinadores após a entrega das premiações, sendo o sorteio destinado aos atletas presentes no local no momento da realização. O atleta ausente no momento da chamada poderá perder o direito ao brinde sorteado.",
    ],
  },
  {
    title: "7. Ação de Solidariedade",
    items: [
      "7.1. Como parte do caráter beneficente e comunitário da II CORRIDA DAS FAMÍLIAS, cada participante deverá levar 1 kg de alimento não perecível no ato da retirada do kit.",
      "7.2. A ação solidária integra a proposta do evento de unir esporte, fé, família, saúde e solidariedade, contribuindo para iniciativas sociais apoiadas pela Organização.",
      "7.3. A entrega do alimento deverá ocorrer preferencialmente no mesmo momento da retirada do kit do atleta.",
      "7.4. Recomenda-se que os alimentos estejam dentro do prazo de validade, em embalagem original, lacrada e em bom estado de conservação.",
      "7.5. A Organização poderá divulgar posteriormente o destino dos alimentos arrecadados, como forma de transparência e prestação de contas à comunidade.",
    ],
  },
  {
    title: "8. Sobre a Largada e Chegada",
    items: [
      "8.1. A concentração dos participantes terá início às 5h00, na Igreja Matriz de Nossa Senhora do Rosário.",
      "8.2. O aquecimento oficial está previsto para as 5h30.",
      "8.3. O momento de oração e fé está previsto para as 5h50.",
      "8.4. A largada será realizada pontualmente às 6h00, salvo alteração por necessidade operacional, segurança ou determinação da Organização.",
      "8.5. O participante deverá chegar com antecedência suficiente para se posicionar, utilizar o banheiro químico, aquecer, fixar corretamente o número de peito e receber orientações da equipe organizadora.",
      "8.6. A chegada ocorrerá no mesmo local da largada, na Igreja Matriz de Nossa Senhora do Rosário.",
      "8.7. O funil de chegada, a área de dispersão e a área de premiação deverão ser respeitados por todos os participantes, acompanhantes e público em geral.",
      "8.8. Participantes que chegarem após eventual tempo operacional limite definido pela Organização poderão ter sua conclusão registrada de forma não competitiva, a depender das condições de segurança e operação do evento.",
    ],
  },
  {
    title: "9. Regras da Corrida",
    items: [
      "9.1. O participante deverá usar o número de peito de forma visível durante todo o percurso, preferencialmente fixado na parte frontal da camisa.",
      "9.2. É proibido correr com número de peito de outro participante sem autorização formal de transferência pela Organização.",
      "9.3. É proibido cortar caminho, abandonar o percurso oficial e retornar em ponto posterior, utilizar veículos, bicicletas, patinetes, motocicletas ou qualquer meio artificial de deslocamento para obter vantagem.",
      "9.4. O participante deverá respeitar os demais atletas, os fiscais, os voluntários, os organizadores, os agentes de trânsito, os profissionais de saúde e as autoridades públicas.",
      "9.5. A prática de conduta antidesportiva, agressão verbal ou física, tumulto, fraude, ameaça, dano ao patrimônio, desrespeito religioso ou comunitário poderá gerar desclassificação imediata, retirada do evento e outras medidas cabíveis.",
      "9.6. O participante deverá seguir as orientações de segurança, hidratação, circulação e permanência nas áreas indicadas pela Organização.",
      "9.7. Animais de estimação, bicicletas, carrinhos, skates, patins ou outros elementos de acompanhamento somente poderão ser utilizados se expressamente autorizados pela Organização, considerando segurança, fluxo e integridade dos participantes.",
      "9.8. O descarte de copos, garrafas ou resíduos deverá ser feito preferencialmente nas áreas indicadas, respeitando a limpeza do percurso e dos espaços públicos.",
      "9.9. A Organização poderá desclassificar ou impedir a continuidade de qualquer participante que coloque em risco sua própria segurança, a segurança de terceiros ou a regularidade da prova.",
    ],
  },
  {
    title: "10. Regras de Troca e/ou Repasse",
    items: [
      "10.1. O participante poderá solicitar a transferência de sua inscrição para outra pessoa, desde que informe a Organização com antecedência e siga os procedimentos definidos oficialmente.",
      "10.2. A transferência somente será válida após confirmação da Organização. Repasse informal de número de peito, kit ou inscrição não será reconhecido oficialmente.",
      "10.3. Em caso de transferência, o tamanho da camisa originalmente escolhido não poderá ser alterado.",
      "10.4. A pessoa que receber a inscrição transferida deverá fornecer seus dados completos e aceitar integralmente este Regulamento e o termo de responsabilidade.",
      "10.5. A Organização poderá estabelecer prazo limite para solicitação de transferência, considerando fechamento de listas, produção de kits, conferência de categorias e organização operacional.",
      "10.6. A transferência não autorizada poderá implicar desclassificação, perda de premiação, impossibilidade de registro de resultado e outras medidas administrativas cabíveis.",
    ],
  },
  {
    title: "11. Acompanhamento dos Atletas Durante a Corrida",
    items: [
      "11.1. O acompanhamento dos atletas por pessoas não inscritas dentro do percurso deverá respeitar as normas de segurança, fluxo e orientação da Organização.",
      "11.2. Não será permitido que acompanhantes utilizem bicicletas, motocicletas, carros, patinetes ou quaisquer meios que possam interferir no desempenho dos atletas, obstruir o percurso ou causar risco de acidente, salvo veículos oficiais, apoio autorizado, segurança, saúde ou equipe de organização.",
      "11.3. Familiares, amigos e público poderão apoiar os atletas em pontos permitidos, desde que não invadam o percurso, não atrapalhem a passagem dos corredores e não interfiram na apuração das colocações.",
      "11.4. Crianças, idosos ou participantes que necessitem de maior atenção deverão estar acompanhados por responsáveis, quando exigido pela Organização ou pelo regulamento específico de categoria.",
      "11.5. O participante que receber auxílio irregular, vantagem indevida ou acompanhamento que prejudique a prova poderá ser advertido, desclassificado ou retirado do percurso, conforme avaliação da Organização.",
    ],
  },
  {
    title: "12. Saúde do Atleta",
    items: [
      "12.1. Ao se inscrever, o participante declara estar em condições físicas e de saúde compatíveis com a prática de corrida ou caminhada de 5 km, assumindo a responsabilidade por sua participação.",
      "12.2. Recomenda-se que todos os participantes realizem avaliação médica prévia, especialmente pessoas sedentárias, idosos, menores de idade, pessoas com doenças crônicas, histórico cardíaco, respiratório, metabólico, ortopédico ou qualquer condição que possa representar risco durante atividade física.",
      "12.3. O participante deverá observar seus próprios limites físicos, hidratar-se adequadamente, alimentar-se de forma apropriada e utilizar vestuário, calçado e acessórios compatíveis com a prática esportiva.",
      "12.4. Haverá apoio de saúde, profissionais da área e ambulância de prontidão para casos de necessidade durante o evento.",
      "12.5. A equipe de saúde e a Organização poderão retirar ou impedir a continuidade de qualquer participante que apresente sinais de mal-estar, exaustão, desorientação, lesão, alteração clínica ou risco à própria integridade.",
      "12.6. A Organização não se responsabiliza por problemas de saúde preexistentes, omissões de informação, uso inadequado de medicamentos, descumprimento de orientação médica ou participação em condição física incompatível com o esforço exigido.",
      "12.7. Em caso de emergência, o participante autoriza desde já a Organização e a equipe de apoio a acionar atendimento médico, ambulância, familiares ou serviços públicos de saúde, conforme necessidade.",
    ],
  },
  {
    title: "13. Cancelamento com Reembolso",
    items: [
      "13.1. O participante poderá solicitar o cancelamento da inscrição e o reembolso integral no prazo de até 7 dias corridos contados da data da inscrição, em conformidade com a regra de arrependimento aplicável às contratações realizadas fora do estabelecimento físico, quando cabível.",
      "13.2. Após o prazo de 7 dias corridos, o participante poderá solicitar cancelamento com reembolso de 50% do valor pago, desde que a solicitação seja realizada antes da data do evento e observados os prazos operacionais da Organização.",
      "13.3. A solicitação de cancelamento deverá ser realizada pelos canais oficiais da Organização, contendo nome completo, CPF, comprovante de inscrição/pagamento e dados necessários para localização da inscrição.",
      "13.4. O reembolso será processado preferencialmente pelo mesmo meio de pagamento utilizado na inscrição, conforme possibilidades técnicas e prazos do gateway de pagamento e das instituições financeiras envolvidas.",
      "13.5. A Organização poderá solicitar prazo operacional para análise, validação e processamento do reembolso de até 30 dias, prazo solicitado pelo Gateway de Pagamento para Reembolso.",
      "13.6. Caso o participante solicite cancelamento após já ter retirado o kit, a Organização poderá negar o reembolso, conforme avaliação do caso concreto e regras divulgadas.",
    ],
  },
  {
    title: "14. Casos de Não Reembolso",
    items: [
      "14.1. Não haverá reembolso integral fora do prazo de 7 dias corridos previsto para arrependimento, salvo decisão expressa da Organização ou hipótese legal aplicável.",
      "14.2. Não haverá reembolso quando o participante deixar de comparecer ao evento, independentemente do motivo, se não tiver solicitado cancelamento dentro dos prazos e condições previstos neste Regulamento.",
      "14.3. Não haverá reembolso por atraso do participante, perda do horário da largada, impossibilidade pessoal de comparecimento, desistência durante o percurso, não retirada do kit ou descumprimento de regras da corrida.",
      "14.4. Não haverá reembolso em caso de desclassificação por fraude, uso indevido de número de peito, cessão irregular de inscrição, conduta antidesportiva ou descumprimento de orientação da Organização.",
      "14.5. Não haverá reembolso em razão de dados incorretos informados pelo participante que inviabilizem contato, confirmação, categoria, retirada do kit ou identificação adequada.",
      "14.6. Em caso de adiamento por motivo de força maior, condições climáticas severas, decisão de autoridade pública, segurança, calamidade, caso fortuito ou outro fato alheio à vontade da Organização, a inscrição poderá ser automaticamente transferida para nova data, sem prejuízo de comunicação oficial aos participantes.",
      "14.7. Em caso de cancelamento definitivo do evento por motivo alheio à vontade da Organização, será divulgada política específica de encaminhamento, considerando despesas já assumidas, fornecedores, kits, estrutura operacional e legislação aplicável.",
    ],
  },
  {
    title: "15. Direito de Imagem e Dados dos Atletas (LGPD)",
    items: [
      "15.1. Ao realizar a inscrição e participar do evento, o participante autoriza, de forma gratuita, o uso de sua imagem, nome, voz, fotografia, vídeo, depoimento, resultado, categoria e registros audiovisuais captados durante a II CORRIDA DAS FAMÍLIAS para fins institucionais, promocionais, informativos, jornalísticos, históricos e de divulgação do evento.",
      "15.2. A autorização de uso de imagem abrange publicações em site oficial, redes sociais, materiais gráficos, vídeos, fotografias, imprensa, peças de divulgação, relatórios institucionais, campanhas futuras e registros de memória do evento, sem que seja devida qualquer remuneração adicional ao participante.",
      "15.3. No caso de menores de idade, a autorização de uso de imagem deverá ser concedida pelo responsável legal no ato da inscrição ou por termo específico, quando solicitado.",
      "15.4. Os dados pessoais coletados no processo de inscrição serão utilizados para finalidades relacionadas à organização e execução do evento, incluindo identificação do participante, validação de categoria, controle de pagamento, emissão de listas administrativas, organização de kits, comunicação oficial, segurança e eventual prestação de contas.",
      "15.5. A Organização deverá tratar os dados pessoais dos participantes com boa-fé, transparência, finalidade específica e medidas razoáveis de segurança, conforme a Lei Geral de Proteção de Dados Pessoais — LGPD.",
      "15.6. Os dados pessoais poderão ser compartilhados com prestadores de serviço estritamente necessários à execução do evento, tais como gateway de pagamento, plataforma de inscrição, equipe administrativa, fornecedores de tecnologia, equipe de comunicação, apoio operacional e autoridades competentes, quando necessário.",
      "15.7. A Organização não deverá vender, ceder ou compartilhar dados pessoais dos participantes para finalidades alheias ao evento sem base legal adequada.",
      "15.8. O participante poderá solicitar informações, correção ou atualização de seus dados pessoais pelos canais oficiais da Organização, observadas as limitações legais, contratuais, operacionais e de segurança.",
      "15.9. Dados necessários à comprovação de inscrição, pagamento, prestação de contas, defesa de direitos, cumprimento de obrigação legal ou organização do evento poderão ser mantidos pelo período necessário ao atendimento dessas finalidades.",
    ],
  },
  {
    title: "16. Disposições Gerais",
    items: [
      "16.1. A inscrição na II CORRIDA DAS FAMÍLIAS implica conhecimento e aceitação integral deste Regulamento.",
      "16.2. O participante declara estar ciente de que a corrida ocorrerá em via pública, estando sujeito a variações climáticas, condições de piso, fluxo de pessoas, limitações operacionais e demais fatores próprios de eventos esportivos de rua.",
      "16.3. A Organização poderá divulgar comunicados complementares antes do evento, os quais passarão a integrar este Regulamento para todos os fins.",
      "16.4. Os casos omissos serão analisados e decididos pela Organização, observados os princípios de segurança, razoabilidade, transparência, boa-fé, finalidade esportiva e preservação do caráter familiar, comunitário e solidário do evento.",
      "16.5. A Organização não se responsabiliza por objetos pessoais perdidos, furtados, danificados ou extraviados, especialmente considerando que não haverá guarda-volumes.",
      "16.6. Recomenda-se que os participantes não levem objetos de alto valor para o evento e estejam equipados apenas com roupas, calçados e acessórios adequados para corrida ou caminhada.",
      "16.7. O participante deverá manter conduta respeitosa com o caráter religioso, comunitário e familiar do evento, preservando o ambiente de fé, união, saúde, esporte e solidariedade.",
      "16.8. A eventual tolerância da Organização quanto ao descumprimento de alguma regra não constituirá renúncia ao direito de aplicá-la em situações futuras.",
      "16.9. Este Regulamento poderá ser atualizado até a data do evento, com publicação da versão mais recente nos canais oficiais da Organização.",
      "16.10. Fica eleito, quando necessário, o foro competente conforme as regras legais aplicáveis, sem prejuízo de tentativa prévia de solução amigável junto à Organização.",
    ],
  },
];

const ANEXO_I_PARAGRAFOS = [
  "Eu, participante inscrito na II CORRIDA DAS FAMÍLIAS, declaro que li, compreendi e aceito integralmente o Regulamento Geral do evento.",
  "Declaro estar em condições físicas e de saúde compatíveis com a participação em corrida ou caminhada de 5 km, assumindo a responsabilidade por minha condição clínica e pela decisão de participar.",
  "Declaro estar ciente de que devo respeitar o percurso, os horários, os fiscais, os voluntários, a equipe de saúde, os organizadores e as autoridades presentes.",
  "Declaro autorizar o uso gratuito de minha imagem, voz, nome, fotografia e registros audiovisuais captados durante o evento para fins institucionais, promocionais, jornalísticos, históricos e de divulgação da II CORRIDA DAS FAMÍLIAS.",
  "Declaro estar ciente de que meus dados pessoais serão tratados para fins de inscrição, pagamento, organização, comunicação, segurança, gestão administrativa e execução do evento, nos termos do Regulamento e da legislação aplicável.",
  "Declaro estar ciente de que a confirmação definitiva da inscrição depende da confirmação do pagamento e que o não comparecimento ao evento não gera direito automático a reembolso.",
];

const ANEXO_I_CAMPOS = ["Nome do participante", "CPF", "Data", "Assinatura"];

const ANEXO_II_PARAGRAFOS = [
  "Eu, responsável legal pelo menor participante, autorizo sua participação na II CORRIDA DAS FAMÍLIAS, declarando estar ciente das condições do evento, do percurso de 5 km, das regras de categoria, da necessidade de acompanhamento quando aplicável e das normas previstas no Regulamento Geral.",
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
  "Eu, participante inscrito na II CORRIDA DAS FAMÍLIAS, autorizo a pessoa abaixo identificada a retirar meu kit de atleta, declarando estar ciente de que a conferência dos itens deverá ocorrer no ato da retirada.",
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
        <div
          key={c}
          className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3"
        >
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
        description="II Corrida das Famílias — “Juntos no Rosário, Famílias unidas na Fé”. Leia atentamente antes de se inscrever."
      />
      <ContentSection>
        {/* Intro */}
        <div className="mb-10 rounded-3xl border border-border bg-white p-7 shadow-soft">
          <p className="text-base leading-relaxed text-[color:var(--color-brand-purple-text)]">
            Este Regulamento estabelece as condições gerais de participação, inscrição,
            pagamento, retirada de kit, percurso, premiação, segurança, saúde, uso de
            imagem, tratamento de dados pessoais e demais regras aplicáveis à II
            CORRIDA DAS FAMÍLIAS.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[color:var(--color-brand-purple-text)]">
            Ao realizar a inscrição, o participante declara ter lido, compreendido e
            aceitado integralmente as normas deste Regulamento, comprometendo-se a
            respeitar as orientações da Organização, dos fiscais, dos agentes de apoio e
            das autoridades competentes.
          </p>
        </div>

        {/* Preâmbulo */}
        <article className="mb-10 rounded-3xl bg-gradient-hero p-8 text-white shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
            Preâmbulo
          </p>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-white/90">
            <p>
              A II CORRIDA DAS FAMÍLIAS é um evento de corrida de rua de caráter
              esportivo, beneficente, comunitário e religioso, realizado em Serra
              Talhada/PE, com o propósito de reunir famílias, atletas, entusiastas da
              corrida, jovens, adultos, idosos e a comunidade em geral em torno dos
              pilares da fé, do esporte em família, da saúde e da solidariedade.
            </p>
            <p>
              O presente Regulamento foi elaborado para orientar os participantes,
              preservar a organização do evento, garantir maior segurança operacional e
              estabelecer regras claras para inscrição, pagamento, participação,
              retirada de kits, conduta durante a corrida, premiação, cancelamento,
              reembolso, direito de imagem e tratamento de dados pessoais.
            </p>
            <p>
              A participação no evento implica a aceitação integral deste Regulamento,
              bem como das orientações complementares que venham a ser divulgadas pela
              Organização em seus canais oficiais.
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
