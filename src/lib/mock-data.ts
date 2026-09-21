import { Trilha, Vaga } from "@/types";

// -----------------------------------------------------------------------------
// TRILHAS DE QUALIFICAÇÃO (piloto)
// -----------------------------------------------------------------------------

export const trilhas: Trilha[] = [
  {
    id: "trilha-comercio-vendas",
    titulo: "Comércio e Vendas",
    descricao:
      "Fundamentos de atendimento ao cliente, operação de PDV e controle de estoque para o comércio local.",
    duracaoTotal: "2h",
    icone: "comercio",
    aulas: [
      {
        id: "cv-aula-1",
        titulo: "Atendimento e abordagem ao cliente",
        duracaoMin: 40,
        resumo:
          "Como recepcionar bem o cliente, entender suas necessidades e conduzir uma venda com cordialidade.",
        conteudo: [
          "A importância da primeira impressão no varejo",
          "Escuta ativa: identificando o que o cliente precisa",
          "Técnicas simples de venda consultiva",
          "Como lidar com reclamações e devoluções",
        ],
      },
      {
        id: "cv-aula-2",
        titulo: "Operação de PDV e controle de estoque",
        duracaoMin: 40,
        resumo:
          "Noções práticas de caixa (PDV), formas de pagamento e organização básica de estoque.",
        conteudo: [
          "Abertura e fechamento de caixa",
          "Formas de pagamento e conferência de valores",
          "Organização e reposição de produtos na loja",
          "Boas práticas de contagem e controle de estoque",
        ],
      },
    ],
    quiz: [
      {
        id: "cv-quiz-1",
        pergunta: "Qual é a melhor forma de iniciar o atendimento a um cliente?",
        opcoes: [
          "Ignorar até que ele chame",
          "Cumprimentar com cordialidade e se colocar à disposição",
          "Perguntar logo se ele vai comprar algo",
          "Empurrar a promoção do dia antes de qualquer coisa",
        ],
        respostaCorretaIndex: 1,
      },
      {
        id: "cv-quiz-2",
        pergunta: "Ao fechar o caixa, o que deve ser sempre conferido?",
        opcoes: [
          "Apenas o dinheiro em espécie",
          "Nada, o sistema confere sozinho",
          "O total de vendas e as formas de pagamento recebidas",
          "Somente os cartões de crédito",
        ],
        respostaCorretaIndex: 2,
      },
    ],
  },
  {
    id: "trilha-garcom-salao",
    titulo: "Garçom e Salão",
    descricao:
      "Boas práticas de salão, atendimento em mesas e noções básicas de inglês e espanhol para turistas.",
    duracaoTotal: "2h",
    icone: "garcom",
    aulas: [
      {
        id: "gs-aula-1",
        titulo: "Boas práticas de salão e atendimento em mesas",
        duracaoMin: 40,
        resumo:
          "Postura profissional, organização do salão e sequência correta de atendimento ao cliente.",
        conteudo: [
          "Postura, uniforme e higiene pessoal",
          "Sequência de atendimento: recepção, pedido, serviço e conta",
          "Como sugerir pratos e bebidas sem ser invasivo",
          "Manejo de bandejas e louças com segurança",
        ],
      },
      {
        id: "gs-aula-2",
        titulo: "Inglês e espanhol básico para turistas",
        duracaoMin: 40,
        resumo:
          "Frases essenciais em inglês e espanhol para receber e atender turistas em Balneário Camboriú.",
        conteudo: [
          "Saudações e apresentação do cardápio",
          "Perguntas frequentes de turistas (preço, tempo de espera, formas de pagamento)",
          "Vocabulário de pratos e bebidas típicas",
          "Como pedir desculpas e resolver pequenos imprevistos",
        ],
      },
    ],
    quiz: [
      {
        id: "gs-quiz-1",
        pergunta: "Qual é a sequência correta de atendimento em uma mesa?",
        opcoes: [
          "Conta, pedido, recepção, serviço",
          "Recepção, pedido, serviço, conta",
          "Serviço, recepção, conta, pedido",
          "Pedido, conta, recepção, serviço",
        ],
        respostaCorretaIndex: 1,
      },
      {
        id: "gs-quiz-2",
        pergunta: "Como perguntar 'Você gostaria de ver o cardápio?' em inglês?",
        opcoes: [
          "Do you want to pay now?",
          "Would you like to see the menu?",
          "Where is the bathroom?",
          "How much does it cost?",
        ],
        respostaCorretaIndex: 1,
      },
    ],
  },
  {
    id: "trilha-turismo-hospitalidade",
    titulo: "Turismo e Hospitalidade",
    descricao:
      "Atendimento ao hóspede, principais atrativos de Balneário Camboriú e noções de primeiros socorros.",
    duracaoTotal: "2h",
    icone: "turismo",
    aulas: [
      {
        id: "th-aula-1",
        titulo: "Atendimento ao hóspede e atrativos de Balneário Camboriú",
        duracaoMin: 40,
        resumo:
          "Como acolher bem o hóspede e apresentar os principais pontos turísticos da cidade.",
        conteudo: [
          "Check-in, check-out e cordialidade no atendimento",
          "Principais atrativos: Praia Central, Unipraias, Cristo Luz, Igrejinha",
          "Como orientar sobre passeios e transporte local",
          "Lidando com pedidos especiais e reclamações",
        ],
      },
      {
        id: "th-aula-2",
        titulo: "Noções básicas de primeiros socorros",
        duracaoMin: 40,
        resumo:
          "Procedimentos essenciais para agir com segurança em pequenas emergências no trabalho.",
        conteudo: [
          "Como agir em caso de engasgo, quedas e cortes leves",
          "Quando acionar o SAMU (192) e outros serviços de emergência",
          "Kit de primeiros socorros básico do estabelecimento",
          "Cuidados com exposição solar e insolação de hóspedes",
        ],
      },
    ],
    quiz: [
      {
        id: "th-quiz-1",
        pergunta: "Qual destes é um dos principais atrativos de Balneário Camboriú?",
        opcoes: ["Cristo Luz", "Pão de Açúcar", "Beto Carrero World em SP", "Cataratas do Iguaçu"],
        respostaCorretaIndex: 0,
      },
      {
        id: "th-quiz-2",
        pergunta: "Qual é o número do SAMU para emergências médicas?",
        opcoes: ["190", "193", "192", "180"],
        respostaCorretaIndex: 2,
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// VAGAS (Balneário Camboriú)
// -----------------------------------------------------------------------------

export const vagasSeed: Vaga[] = [
  {
    id: "vaga-1",
    titulo: "Recepcionista de Hotel",
    empresa: "Hotel Marazul",
    categoria: "Hotelaria",
    bairro: "Centro",
    tipoContrato: "Temporário",
    cargaHoraria: "44h/semana",
    salario: "R$ 1.850,00 + gorjetas",
    descricao:
      "Recepção e check-in/check-out de hóspedes durante a alta temporada, com foco em atendimento cordial e resolução rápida de solicitações.",
    requisitos: [
      "Boa comunicação e simpatia no atendimento",
      "Disponibilidade para trabalhar em escala, incluindo finais de semana",
      "Noções básicas de inglês ou espanhol são um diferencial",
    ],
    trilhaRequeridaId: "trilha-turismo-hospitalidade",
    aceitaCapacitacao: true,
    criadoEm: "2026-01-01T00:00:00.000Z",
    origem: "seed",
  },
  {
    id: "vaga-2",
    titulo: "Garçom / Garçonete",
    empresa: "Restaurante Sabor & Mar",
    categoria: "Restaurante",
    bairro: "Praia Central",
    tipoContrato: "Temporário",
    cargaHoraria: "40h/semana",
    salario: "R$ 1.600,00 + gorjetas",
    descricao:
      "Atendimento em salão, anotação de pedidos e suporte ao cliente em restaurante à beira-mar durante a temporada de verão.",
    requisitos: [
      "Experiência prévia em salão é desejável, mas não obrigatória",
      "Boa comunicação e trabalho em equipe",
      "Disponibilidade para turnos noturnos e fins de semana",
    ],
    trilhaRequeridaId: "trilha-garcom-salao",
    aceitaCapacitacao: true,
    criadoEm: "2026-01-01T00:00:00.000Z",
    origem: "seed",
  },
  {
    id: "vaga-3",
    titulo: "Vendedor(a) de Loja",
    empresa: "Boutique Balneário",
    categoria: "Comércio",
    bairro: "Barra Sul",
    tipoContrato: "Meio período",
    cargaHoraria: "30h/semana",
    salario: "R$ 1.412,00 + comissão",
    descricao:
      "Atendimento ao cliente, operação de caixa (PDV) e organização de vitrine em loja de roupas e acessórios de praia.",
    requisitos: [
      "Facilidade de comunicação e interesse em moda/varejo",
      "Disponibilidade de horário flexível",
      "Não é necessária experiência prévia",
    ],
    trilhaRequeridaId: "trilha-comercio-vendas",
    aceitaCapacitacao: true,
    criadoEm: "2026-01-01T00:00:00.000Z",
    origem: "seed",
  },
  {
    id: "vaga-4",
    titulo: "Camareira(o)",
    empresa: "Hotel Vista Praia",
    categoria: "Hotelaria",
    bairro: "Praia dos Amores",
    tipoContrato: "Temporário",
    cargaHoraria: "40h/semana",
    salario: "R$ 1.550,00",
    descricao:
      "Organização e limpeza de quartos e áreas comuns, seguindo os padrões de qualidade do hotel durante a alta temporada.",
    requisitos: [
      "Atenção a detalhes e organização",
      "Disponibilidade para trabalhar em escala, incluindo finais de semana",
      "Experiência prévia é um diferencial, mas não obrigatória",
    ],
    trilhaRequeridaId: "trilha-turismo-hospitalidade",
    aceitaCapacitacao: false,
    criadoEm: "2026-01-01T00:00:00.000Z",
    origem: "seed",
  },
];

/** @deprecated use `vagasSeed` (lista fixa) combinado com o hook de LocalStorage `useVagas` para incluir vagas publicadas por empresas. */
export const vagas = vagasSeed;

export function getVagaById(id: string, listaVagas: Vaga[] = vagasSeed) {
  return listaVagas.find((v) => v.id === id);
}

export function getTrilhaById(id: string) {
  return trilhas.find((t) => t.id === id);
}
