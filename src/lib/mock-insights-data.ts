/**
 * Capacita Insights — dados agregados/mockados do painel executivo da Prefeitura.
 * Baseados no ecossistema real de Balneário Camboriú (comércio, hotelaria,
 * gastronomia e turismo) e nos fluxos do Capacita RH.
 */

// ---------------------------------------------------------------------------
// 1. Cards de topo (métricas macro)
// ---------------------------------------------------------------------------

export interface MetricaTopo {
  id: string;
  label: string;
  valor: string;
  variacao: string;
  tendencia: "alta" | "baixa" | "estavel";
}

export const metricasTopo: MetricaTopo[] = [
  { id: "candidatos-ativos", label: "Candidatos ativos", valor: "3.842", variacao: "+8,4% no mês", tendencia: "alta" },
  { id: "vagas-abertas", label: "Vagas abertas", valor: "486", variacao: "+12,1% no mês", tendencia: "alta" },
  { id: "contratacoes", label: "Contratações realizadas", valor: "729", variacao: "+5,2% no mês", tendencia: "alta" },
  { id: "taxa-recolocacao", label: "Taxa de recolocação", valor: "64%", variacao: "+3 p.p. no mês", tendencia: "alta" },
  { id: "candidatos-qualificados", label: "Candidatos qualificados", valor: "1.420", variacao: "+140 no mês", tendencia: "alta" },
  { id: "empresas-ativas", label: "Empresas ativas", valor: "312", variacao: "+18 no mês", tendencia: "alta" },
];

// ---------------------------------------------------------------------------
// 2. Equilíbrio entre vagas e candidatos (oferta x demanda)
// ---------------------------------------------------------------------------

export type BadgeOfertaDemanda = "equilibrado" | "deficit" | "excesso";

export interface OfertaDemandaItem {
  profissao: string;
  candidatos: number;
  vagas: number;
  badge: BadgeOfertaDemanda;
}

export const ofertaDemanda: OfertaDemandaItem[] = [
  { profissao: "Garçom", candidatos: 340, vagas: 280, badge: "equilibrado" },
  { profissao: "Recepção", candidatos: 90, vagas: 210, badge: "deficit" },
  { profissao: "Vendas", candidatos: 520, vagas: 180, badge: "excesso" },
  { profissao: "Cozinha", candidatos: 110, vagas: 260, badge: "deficit" },
];

export const ofertaDemandaBadgeLabel: Record<BadgeOfertaDemanda, string> = {
  equilibrado: "Equilibrado",
  deficit: "Déficit",
  excesso: "Excesso",
};

// ---------------------------------------------------------------------------
// 3. Mapa de escassez profissional
// ---------------------------------------------------------------------------

export type NivelEscassez = "critico" | "atencao" | "alta-oferta";

export interface ProfissaoEscassez {
  nome: string;
  nivel: NivelEscassez;
}

export const profissoesEscassez: ProfissaoEscassez[] = [
  { nome: "Recepcionista bilíngue", nivel: "critico" },
  { nome: "Cozinheiro", nivel: "critico" },
  { nome: "Camareira", nivel: "critico" },
  { nome: "Garçom", nivel: "atencao" },
  { nome: "Auxiliar de cozinha", nivel: "atencao" },
  { nome: "Vendedor", nivel: "alta-oferta" },
  { nome: "Operador de caixa", nivel: "alta-oferta" },
];

export const nivelEscassezInfo: Record<
  NivelEscassez,
  { label: string; corBadge: string; corPonto: string }
> = {
  critico: {
    label: "Alta demanda / Crítico",
    corBadge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    corPonto: "bg-red-500",
  },
  atencao: {
    label: "Atenção",
    corBadge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    corPonto: "bg-amber-500",
  },
  "alta-oferta": {
    label: "Alta oferta",
    corBadge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    corPonto: "bg-emerald-500",
  },
};

export interface EscassezDetalhe {
  vagasAbertas: number;
  candidatosDisponiveis: number;
  qualificados: number;
  precisamCapacitacao: number;
  vagasSemCandidatos: number;
  oportunidade: string;
}

export const escassezDetalhes: Record<string, EscassezDetalhe> = {
  "Recepcionista bilíngue": {
    vagasAbertas: 210,
    candidatosDisponiveis: 90,
    qualificados: 32,
    precisamCapacitacao: 58,
    vagasSemCandidatos: 118,
    oportunidade: "Inglês básico para atendimento ao turista",
  },
  Cozinheiro: {
    vagasAbertas: 165,
    candidatosDisponiveis: 74,
    qualificados: 28,
    precisamCapacitacao: 46,
    vagasSemCandidatos: 91,
    oportunidade: "Técnicas de cozinha quente e segurança alimentar",
  },
  Camareira: {
    vagasAbertas: 140,
    candidatosDisponiveis: 61,
    qualificados: 22,
    precisamCapacitacao: 39,
    vagasSemCandidatos: 79,
    oportunidade: "Padrões de arrumação e enxoval para redes hoteleiras",
  },
  Garçom: {
    vagasAbertas: 280,
    candidatosDisponiveis: 340,
    qualificados: 190,
    precisamCapacitacao: 150,
    vagasSemCandidatos: 20,
    oportunidade: "Atendimento em inglês/espanhol para alta temporada",
  },
  "Auxiliar de cozinha": {
    vagasAbertas: 175,
    candidatosDisponiveis: 130,
    qualificados: 60,
    precisamCapacitacao: 70,
    vagasSemCandidatos: 45,
    oportunidade: "Boas práticas de manipulação de alimentos",
  },
  Vendedor: {
    vagasAbertas: 95,
    candidatosDisponiveis: 340,
    qualificados: 210,
    precisamCapacitacao: 130,
    vagasSemCandidatos: 0,
    oportunidade: "Técnicas de venda consultiva para converter excedente em recolocação",
  },
  "Operador de caixa": {
    vagasAbertas: 85,
    candidatosDisponiveis: 180,
    qualificados: 120,
    precisamCapacitacao: 60,
    vagasSemCandidatos: 0,
    oportunidade: "Redirecionar excedente para vagas de vendas com treinamento rápido",
  },
};

// ---------------------------------------------------------------------------
// 4. Tendência do mercado & sazonalidade
// ---------------------------------------------------------------------------

export interface PontoTendencia {
  mes: string;
  vagas: number;
}

export const tendenciaMensal: PontoTendencia[] = [
  { mes: "Abr", vagas: 410 },
  { mes: "Mai", vagas: 380 },
  { mes: "Jun", vagas: 420 },
  { mes: "Jul", vagas: 510 },
  { mes: "Ago", vagas: 620 },
  { mes: "Set", vagas: 780 },
];

export interface IndicadorSazonal {
  label: string;
  valor: string;
  nota: string;
}

export const indicadoresSazonais: IndicadorSazonal[] = [
  { label: "Candidatos buscando recolocação", valor: "1.260", nota: "pós-entressafra" },
  { label: "Desemprego pós-temporada", valor: "22%", nota: "estimado, jan–mar" },
  { label: "Tempo médio para contratação", valor: "18 dias", nota: "queda de 4 dias no trimestre" },
];

// ---------------------------------------------------------------------------
// 5. Radar de qualificação (gap de competências)
// ---------------------------------------------------------------------------

export interface GapCompetencia {
  competencia: string;
  pedem: number;
  possuem: number;
  temCampanha?: boolean;
}

export const radarQualificacao: GapCompetencia[] = [
  { competencia: "Inglês básico", pedem: 210, possuem: 58, temCampanha: true },
  { competencia: "Atendimento ao cliente", pedem: 380, possuem: 270 },
  { competencia: "Segurança alimentar", pedem: 190, possuem: 75 },
  { competencia: "Excel", pedem: 130, possuem: 95 },
];

// ---------------------------------------------------------------------------
// 6. Distribuição territorial (bairros de BC)
// ---------------------------------------------------------------------------

export interface RegiaoTerritorio {
  bairro: string;
  candidatos: number;
  vagas: number;
}

export const distribuicaoTerritorial: RegiaoTerritorio[] = [
  { bairro: "Centro", candidatos: 320, vagas: 87 },
  { bairro: "Nações", candidatos: 180, vagas: 43 },
  { bairro: "Barra", candidatos: 210, vagas: 92 },
  { bairro: "Municípios", candidatos: 260, vagas: 35 },
];

export const alertaDeslocamento =
  "Divergência de deslocamento: 180 trabalhadores disponíveis em determinada região, com 70% das vagas concentradas em outro bairro.";

// ---------------------------------------------------------------------------
// 7. Perfil dos candidatos
// ---------------------------------------------------------------------------

export interface SituacaoProfissional {
  label: string;
  percentual: number;
}

export const situacaoProfissional: SituacaoProfissional[] = [
  { label: "Desempregado", percentual: 47 },
  { label: "Fim de contrato sazonal", percentual: 25 },
  { label: "Empregado buscando nova vaga", percentual: 18 },
  { label: "Primeiro emprego", percentual: 10 },
];

export interface Disponibilidade {
  label: string;
  percentual: number;
}

export const disponibilidade: Disponibilidade[] = [
  { label: "Manhã", percentual: 52 },
  { label: "Tarde", percentual: 61 },
  { label: "Noite", percentual: 38 },
];

export interface SetorInteresse {
  label: string;
  percentual: number;
}

export const setoresInteresse: SetorInteresse[] = [
  { label: "Hotelaria", percentual: 34 },
  { label: "Gastronomia", percentual: 29 },
  { label: "Comércio", percentual: 24 },
  { label: "Turismo", percentual: 13 },
];

// ---------------------------------------------------------------------------
// 8. Retenção & dificuldade das empresas
// ---------------------------------------------------------------------------

export const retencaoEmpresas = {
  contratacaoNormal: 87,
  vagasAbertas30dias: 32,
  vagasAbertas60dias: 12,
};

export interface CausaGargalo {
  causa: string;
  percentual: number;
}

export const causasGargalo: CausaGargalo[] = [
  { causa: "Salário incompatível", percentual: 38 },
  { causa: "Falta de qualificação", percentual: 29 },
  { causa: "Horário/turno", percentual: 21 },
  { causa: "Deslocamento", percentual: 12 },
];

// ---------------------------------------------------------------------------
// 9. Impacto das capacitações & funil de empregabilidade
// ---------------------------------------------------------------------------

export interface ImpactoTrilha {
  trilha: string;
  inscritos: number;
  concluintes: number;
  contratados: number;
  percentualContratacaoCapacitados: number;
  percentualContratacaoNaoCapacitados: number;
}

export const impactoTrilhas: ImpactoTrilha[] = [
  {
    trilha: "Comércio e Vendas",
    inscritos: 640,
    concluintes: 498,
    contratados: 312,
    percentualContratacaoCapacitados: 63,
    percentualContratacaoNaoCapacitados: 24,
  },
  {
    trilha: "Garçom e Salão",
    inscritos: 512,
    concluintes: 401,
    contratados: 268,
    percentualContratacaoCapacitados: 67,
    percentualContratacaoNaoCapacitados: 29,
  },
  {
    trilha: "Turismo e Hospitalidade",
    inscritos: 388,
    concluintes: 275,
    contratados: 149,
    percentualContratacaoCapacitados: 54,
    percentualContratacaoNaoCapacitados: 19,
  },
];

export interface EtapaFunil {
  etapa: string;
  valor: number;
}

export const funilEmpregabilidade: EtapaFunil[] = [
  { etapa: "Cadastrados", valor: 5430 },
  { etapa: "Perfis completos", valor: 3820 },
  { etapa: "Candidaturas", valor: 2940 },
  { etapa: "Entrevistados", valor: 1680 },
  { etapa: "Propostas", valor: 940 },
  { etapa: "Contratações", valor: 812 },
];
