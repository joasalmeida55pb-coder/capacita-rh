/**
 * Camada de acesso à tabela `vagas` do Supabase.
 *
 * Todo o resto do app continua conversando com o tipo `Vaga` (src/types).
 * A tradução entre a linha do banco (snake_case) e esse tipo acontece aqui,
 * num único lugar.
 *
 * Nenhuma função abaixo lança exceção: elas sempre devolvem
 * `{ dados, erro }`, e quem chama decide se cai para o mock.
 */

import { supabase, supabaseConfigurado, mensagemDeErro } from "@/lib/supabase";
import { SETORES } from "@/lib/constants";
import type { Setor, TipoContrato, Vaga } from "@/types";

/** Linha da tabela `public.vagas` (ver supabase/schema.sql). */
export interface VagaRow {
  id: string;
  created_at: string;
  empresa_id: string | null;
  empresa_nome: string | null;
  empresa_local_id: string | null;
  titulo: string;
  descricao: string;
  categoria: string | null;
  regime: string | null;
  modalidade: string | null;
  carga_horaria: string | null;
  salario: string | null;
  beneficios: string | null;
  requisitos: string | null;
  bairro: string | null;
  cidade: string | null;
  trilha_requerida_id: string | null;
  aceita_capacitacao: boolean | null;
  status: string | null;
}

const COLUNAS =
  "id, created_at, empresa_id, empresa_nome, empresa_local_id, titulo, descricao, " +
  "categoria, regime, modalidade, carga_horaria, salario, beneficios, requisitos, " +
  "bairro, cidade, trilha_requerida_id, aceita_capacitacao, status";

const TIPOS_CONTRATO: TipoContrato[] = ["CLT", "Temporário", "Meio período"];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * `id` do banco é `uuid`. Os ids das vagas de exemplo ("vaga-1") e das vagas
 * salvas localmente ("vaga-1737...") não são uuid — consultar o Postgres com
 * eles devolveria erro 22P02, então nem tentamos.
 */
export function pareceUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

function comoSetor(valor: string | null | undefined): Setor {
  return SETORES.includes(valor as Setor) ? (valor as Setor) : "Serviços";
}

function comoTipoContrato(valor: string | null | undefined): TipoContrato {
  return TIPOS_CONTRATO.includes(valor as TipoContrato)
    ? (valor as TipoContrato)
    : "Temporário";
}

/** Linha do banco -> objeto `Vaga` usado pelas telas. */
export function linhaParaVaga(row: VagaRow): Vaga {
  return {
    id: row.id,
    titulo: row.titulo,
    empresa: row.empresa_nome?.trim() || "Empresa parceira",
    empresaId: row.empresa_local_id ?? row.empresa_id ?? undefined,
    categoria: comoSetor(row.categoria),
    bairro: row.bairro?.trim() || row.cidade?.trim() || "Balneário Camboriú",
    tipoContrato: comoTipoContrato(row.regime),
    cargaHoraria: row.carga_horaria?.trim() || "A combinar",
    salario: row.salario?.trim() || "A combinar",
    descricao: row.descricao,
    requisitos: (row.requisitos ?? "")
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean),
    trilhaRequeridaId: row.trilha_requerida_id ?? "",
    aceitaCapacitacao: row.aceita_capacitacao ?? true,
    criadoEm: row.created_at,
    origem: "empresa",
  };
}

/** Dados do formulário -> payload de insert na tabela `vagas`. */
export function vagaParaLinha(
  vaga: Omit<Vaga, "id" | "criadoEm" | "origem">
): Record<string, unknown> {
  return {
    titulo: vaga.titulo,
    descricao: vaga.descricao,
    empresa_nome: vaga.empresa,
    // `empresa_id` é FK uuid para `empresas`; as contas de empresa ainda são
    // locais (LocalStorage), então guardamos o id local em outra coluna.
    empresa_local_id: vaga.empresaId ?? null,
    categoria: vaga.categoria,
    regime: vaga.tipoContrato,
    modalidade: "Presencial",
    carga_horaria: vaga.cargaHoraria,
    salario: vaga.salario,
    requisitos: vaga.requisitos.join("\n"),
    bairro: vaga.bairro,
    cidade: "Balneário Camboriú",
    trilha_requerida_id: vaga.trilhaRequeridaId || null,
    aceita_capacitacao: vaga.aceitaCapacitacao,
    status: "ativa",
  };
}

export interface Resultado<T> {
  dados: T | null;
  erro: string | null;
}

/** Lista todas as vagas ativas, mais recentes primeiro. */
export async function listarVagas(): Promise<Resultado<Vaga[]>> {
  if (!supabase) {
    return { dados: null, erro: "Supabase não configurado (.env.local)." };
  }

  const { data, error } = await supabase
    .from("vagas")
    .select(COLUNAS)
    .eq("status", "ativa")
    .order("created_at", { ascending: false });

  if (error) return { dados: null, erro: mensagemDeErro(error) };
  return { dados: (data as unknown as VagaRow[]).map(linhaParaVaga), erro: null };
}

/** Consulta uma vaga pelo ID (uuid) diretamente no banco. */
export async function buscarVagaPorId(id: string): Promise<Resultado<Vaga>> {
  if (!supabase) {
    return { dados: null, erro: "Supabase não configurado (.env.local)." };
  }
  if (!pareceUuid(id)) {
    return { dados: null, erro: "ID fora do formato uuid — não está no banco." };
  }

  const { data, error } = await supabase
    .from("vagas")
    .select(COLUNAS)
    .eq("id", id)
    .maybeSingle();

  if (error) return { dados: null, erro: mensagemDeErro(error) };
  if (!data) return { dados: null, erro: null }; // não encontrada, sem erro
  return { dados: linhaParaVaga(data as unknown as VagaRow), erro: null };
}

/** Grava uma nova vaga e devolve o registro já criado (com o uuid do banco). */
export async function inserirVaga(
  vaga: Omit<Vaga, "id" | "criadoEm" | "origem">
): Promise<Resultado<Vaga>> {
  if (!supabase) {
    return { dados: null, erro: "Supabase não configurado (.env.local)." };
  }

  const { data, error } = await supabase
    .from("vagas")
    .insert(vagaParaLinha(vaga))
    .select(COLUNAS)
    .single();

  if (error) return { dados: null, erro: mensagemDeErro(error) };
  return { dados: linhaParaVaga(data as unknown as VagaRow), erro: null };
}

export { supabaseConfigurado };
