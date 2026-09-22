import { PeriodoContratacao, SituacaoAtual, Setor, Turno } from "@/types";

export const SETORES: Setor[] = ["Comércio", "Hotelaria", "Restaurante", "Serviços"];

export const REGIMES_CONTRATO = ["CLT", "Temporário", "Meio período"] as const;

export const ESCALAS = ["6x1", "5x2", "12x36", "Flexível", "A combinar"] as const;
export type Escala = (typeof ESCALAS)[number];

export const TURNOS: Turno[] = ["Manhã", "Tarde", "Noite"];

export const SITUACOES: SituacaoAtual[] = [
  "Desempregado fim de temporada",
  "Buscando 1º emprego",
  "Empregado",
];

export const PERIODOS_CONTRATACAO: PeriodoContratacao[] = [
  "Alta temporada",
  "Baixa temporada",
  "Ano todo",
];

export const ADMIN_CREDENCIAIS = {
  email: "admin@bc.gov.br",
  senha: "sandbox2026",
};

/** Mapeia o período de contratação da empresa para o tipo de contrato padrão da vaga. */
export function periodoParaTipoContrato(periodo: PeriodoContratacao) {
  if (periodo === "Ano todo") return "CLT" as const;
  return "Temporário" as const;
}
