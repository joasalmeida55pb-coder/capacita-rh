// Tipos centrais da plataforma Capacita RH

export type Setor = "Comércio" | "Hotelaria" | "Restaurante" | "Serviços";

export type TipoContrato = "CLT" | "Temporário" | "Meio período";

export type Turno = "Manhã" | "Tarde" | "Noite";

export type SituacaoAtual =
  | "Desempregado fim de temporada"
  | "Buscando 1º emprego"
  | "Empregado";

export type PeriodoContratacao = "Alta temporada" | "Baixa temporada" | "Ano todo";

export interface Vaga {
  id: string;
  titulo: string;
  empresa: string;
  empresaId?: string;
  categoria: Setor;
  bairro: string;
  tipoContrato: TipoContrato;
  cargaHoraria: string;
  salario: string;
  descricao: string;
  requisitos: string[];
  /** vazio ("") significa que a vaga não exige nenhuma trilha */
  trilhaRequeridaId: string;
  aceitaCapacitacao: boolean;
  criadoEm: string;
  /** distingue vagas de exemplo das criadas por uma empresa cadastrada */
  origem: "seed" | "empresa";
}

export interface Aula {
  id: string;
  titulo: string;
  duracaoMin: number;
  resumo: string;
  conteudo: string[];
}

export interface PerguntaQuiz {
  id: string;
  pergunta: string;
  opcoes: string[];
  respostaCorretaIndex: number;
}

export interface Trilha {
  id: string;
  titulo: string;
  descricao: string;
  duracaoTotal: string;
  icone: "comercio" | "garcom" | "turismo";
  aulas: Aula[];
  quiz: PerguntaQuiz[];
}

/** Conta + perfil do candidato (login com e-mail/senha). */
export interface CandidatoPerfil {
  id: string;
  email: string;
  /** Texto puro — ok para este sandbox 100% client-side, sem backend real. */
  senha: string;
  nomeCompleto: string;
  whatsapp: string;
  bairro: string;
  situacaoAtual: SituacaoAtual;
  disponibilidade: Turno[];
  areasInteresse: Setor[];
  criadoEm: string;
}

/** Conta + cadastro da empresa (login com e-mail/senha). */
export interface Empresa {
  id: string;
  email: string;
  /** Texto puro — ok para este sandbox 100% client-side, sem backend real. */
  senha: string;
  nome: string;
  cnpj: string;
  setor: Setor;
  contato: string;
  periodo: PeriodoContratacao;
  criadoEm: string;
}

/** Sessão ativa (candidato OU empresa) guardada em `capacita_user_session`. */
export interface SessaoUsuario {
  tipo: "candidato" | "empresa";
  id: string;
}

export type PerfilUsuario = "candidato" | "empresa" | "admin";
