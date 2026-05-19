import {
  Heart,
  Activity,
  Users,
  HandHeart,
  ClipboardList,
  Package,
  Flag,
} from "lucide-react";

export const PILARES = [
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
] as const;

export const TIMELINE = [
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

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Como faço minha inscrição?",
    a: `A inscrição para a II CORRIDA DAS FAMÍLIAS será realizada exclusivamente pelo Site Oficial do evento.

Para se inscrever, basta acessar a área de inscrição no site, preencher corretamente o formulário com seus dados pessoais, escolher sua categoria, selecionar o tamanho da camisa e aceitar os termos de participação. Após isso, clique em "Realizar Inscrição".

Em seguida, você será direcionado para a página de pagamento integrada ao checkout online. Após concluir o pagamento, sua inscrição será registrada no sistema da organização.`,
  },
  {
    q: "Quais formas de pagamento são aceitas?",
    a: `As inscrições poderão ser pagas de forma online, com praticidade e segurança.

Serão aceitas as seguintes formas de pagamento:

1. PIX
2. Cartão de Crédito à Vista
3. Cartão de Crédito Parcelado

O pagamento será realizado por meio do checkout online integrado ao site oficial da corrida.`,
  },
  {
    q: "Posso me inscrever no dia do evento?",
    a: `Não. As inscrições serão realizadas somente pelo Site Oficial e dentro do prazo estabelecido pela organização.

As inscrições se encerram no dia 12 de julho de 2026, às 23h59, horário de Brasília. Após esse prazo, o formulário de inscrição será desativado, mesmo que ainda existam pessoas interessadas em participar. Por isso, a orientação é clara:

Não deixe para a última hora. Garanta sua inscrição dentro do prazo oficial e participe dessa grande experiência de fé, esporte em família, saúde e solidariedade.`,
  },
  {
    q: "Posso transferir minha inscrição?",
    a: `Sim. A transferência de inscrição será permitida, desde que o participante informe a organização com antecedência.

No entanto, há uma regra importante: o tamanho da camisa escolhido no momento da inscrição não poderá ser alterado. Portanto, caso precise transferir sua inscrição para outra pessoa, entre em contato com a equipe organizadora o quanto antes para receber as orientações corretas.`,
  },
  {
    q: "Como e quando será a entrega dos Kits?",
    a: `A entrega dos kits será realizada nos dias 04, 05 e 06 de agosto de 2026, sempre no horário das 19h30 às 21h30.

O local de retirada será o Salão Paroquial da Igreja de Nossa Senhora da Conceição, ao lado da Igreja de Nossa Senhora da Conceição. O kit do atleta inclui:

1. Camisa oficial da corrida
2. Número de peito

Além disso os atletas terão pontos de Hidratação durante o percurso e Medalha para os participantes que concluírem o percurso completo. Cada participante deverá levar 1kg de alimento não perecível no momento da retirada do kit, reforçando o compromisso solidário da II CORRIDA DAS FAMÍLIAS.`,
  },
  {
    q: "Como posso saber que minha inscrição está confirmada?",
    a: `Sua inscrição será considerada confirmada após o preenchimento correto do formulário e a confirmação do pagamento. O processo funciona assim:

Você preenche o formulário no site oficial, aceita os termos, clica em "Realizar Inscrição" e conclui o pagamento no checkout online. Após a confirmação do pagamento, sua inscrição passa a constar como confirmada no sistema administrativo da organização.

Caso tenha feito sua inscrição e ainda esteja com dúvida sobre o status do pagamento ou da confirmação, entre em contato com a organização pelo WhatsApp oficial do evento.

Importante: preencher o formulário sem concluir o pagamento não garante a confirmação definitiva da inscrição. A vaga só estará efetivamente confirmada após a validação do pagamento.`,
  },
];
