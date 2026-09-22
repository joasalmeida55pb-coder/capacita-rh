/**
 * Camada de acesso à tabela `vagas` do Supabase.
 *
 * Todo o resto do app continua conversando com o tipo `Vaga` (src/types).
 * A tradução entre a linha do banco (snake_case) e esse tipo acontece aqui,
 * num único lugar.
 *
 * IMPORTANTE: o schema real de `public.vagas` (o mesmo que `/empresa` usa com
 * sucesso, via `select('*')`) só tem as colunas abaixo — NÃO existem
 * `empresa_nome`, `empresa_local_id`, `categoria`, `carga_horaria`,
 * `trilha_requerida_id` nem `aceita_capacitacao` (essas eram de uma versão
 * antiga do schema, em `supabase/schema.sql`, que nunca chegou a ser aplicada
 * no banco real). O nome e o setor da empresa vêm de um join com `empresas`
 * através da FK `vagas.empresa_id -> empresas.id`.
 *
 * `confidencial` e `escala` são colunas novas (ver migracao-vaga-extra.sql).
 * Enquanto essa migração não rodar no banco, `listarVagas`/`buscarVagaPorId`
 * detectam o erro de coluna inexistente e repetem a consulta sem elas — a
 * app continua funcionando, só sem esses dois campos.
 *
 * Nenhuma função abaixo lança exceção: elas sempre devolvem
 * `{ dados, erro }`, e quem chama decide se cai para o mock.
 */

import { supabase, supabaseConfigurado, mensagemDeErro } from "@/lib/supabase";
import { SETORES } from "@/lib/constants";
import type { Setor, TipoContrato, Vaga } from "@/types";

/** Linha real da tabela `public.vagas`, com o nome/setor da empresa embutidos via join. */
export interface VagaRow {
  id: string;
  created_at: string;
  empresa_id: string | null;
  titulo: string | null;
  descricao: string | null;
  regime: string | null;
  modalidade: string | null;
  salario: string | null;
  beneficios: string | null;
  requisitos: string | null;
  bairro: string | null;
  cidade: string | null;
  status: string | null;
  confidencial?: boolean | null;
  escala?: string | null;
  /** Join `vagas.empresa_id -> empresas.id` (Supabase embeda como objeto ou null). */
  empresas: { nome: string | null; setor: string | null } | null;
}

const COLUNAS_BASE =
  "id, created_at, empresa_id, titulo, descricao, regime, modalidade, salario, " +
  "beneficios, requisitos, bairro, cidade, status, empresas(nome, setor)";

/** Inclui `confidencial` e `escala` — colunas que podem não existir ainda. */
const COLUNAS_COMPLETAS = `${COLUNAS_BASE}, confidencial, escala`;

/** `true` quando o erro do Postgrest indica coluna/relação inexistente (schema desatualizado). */
function erroDeColunaInexistente(mensagem: string | undefined): boolean {
  if (!mensagem) return false;
  return /column|schema cache|does not exist/i.test(mensagem);
}

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
    titulo: row.titulo?.trim() || "Vaga sem título",
    empresa: row.empresas?.nome?.trim() || "Empresa parceira",
    empresaId: row.empresa_id ?? undefined,
    // Não há coluna `categoria` em `vagas` — usamos o setor cadastrado da
    // empresa (join acima) como aproximação mais confiável disponível.
    categoria: comoSetor(row.empresas?.setor),
    bairro: row.bairro?.trim() || row.cidade?.trim() || "Balneário Camboriú",
    tipoContrato: comoTipoContrato(row.regime),
    // Não há coluna `carga_horaria` em `vagas`.
    cargaHoraria: "A combinar",
    salario: row.salario?.trim() || "A combinar",
    descricao: row.descricao ?? "",
    requisitos: (row.requisitos ?? "")
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean),
    // Não há coluna `trilha_requerida_id` em `vagas`: vagas vindas do banco
    // não exigem trilha até essa coluna existir de fato.
    trilhaRequeridaId: "",
    // Não há coluna `aceita_capacitacao` em `vagas`; assume-se `true`.
    aceitaCapacitacao: true,
    criadoEm: row.created_at,
    origem: "empresa",
    escala: row.escala?.trim() || undefined,
    confidencial: row.confidencial ?? false,
  };
}

/** Dados do formulário -> payload de insert na tabela `vagas` (só colunas reais). */
export function vagaParaLinha(
  vaga: Omit<Vaga, "id" | "criadoEm" | "origem">
): Record<string, unknown> {
  return {
    titulo: vaga.titulo,
    descricao: vaga.descricao,
    empresa_id: vaga.empresaId ?? null,
    regime: vaga.tipoContrato,
    modalidade: "Presencial",
    salario: vaga.salario,
    requisitos: vaga.requisitos.join("\n"),
    bairro: vaga.bairro,
    cidade: "Balneário Camboriú",
    status: "ativa",
    confidencial: vaga.confidencial ?? false,
    escala: vaga.escala || null,
  };
}

/** Payload sem `confidencial`/`escala`, para o fallback quando essas colunas não existem. */
function semColunasExtras(payload: Record<string, unknown>): Record<string, unknown> {
  const { confidencial: _confidencial, escala: _escala, ...resto } = payload;
  return resto;
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

  const primeira = await supabase
    .from("vagas")
    .select(COLUNAS_COMPLETAS)
    .eq("status", "ativa")
    .order("created_at", { ascending: false });
  let data: unknown = primeira.data;
  let error = primeira.error;

  if (error && erroDeColunaInexistente(error.message)) {
    // `confidencial`/`escala` ainda não existem no banco — repete sem elas.
    const retry = await supabase
      .from("vagas")
      .select(COLUNAS_BASE)
      .eq("status", "ativa")
      .order("created_at", { ascending: false });
    data = retry.data;
    error = retry.error;
  }

  if (error) return { dados: null, erro: mensagemDeErro(error) };
  return { dados: (data as VagaRow[]).map(linhaParaVaga), erro: null };
}

/** Consulta uma vaga pelo ID (uuid) diretamente no banco. */
export async function buscarVagaPorId(id: string): Promise<Resultado<Vaga>> {
  if (!supabase) {
    return { dados: null, erro: "Supabase não configurado (.env.local)." };
  }
  if (!pareceUuid(id)) {
    return { dados: null, erro: "ID fora do formato uuid — não está no banco." };
  }

  const primeira = await supabase
    .from("vagas")
    .select(COLUNAS_COMPLETAS)
    .eq("id", id)
    .maybeSingle();
  let data: unknown = primeira.data;
  let error = primeira.error;

  if (error && erroDeColunaInexistente(error.message)) {
    const retry = await supabase.from("vagas").select(COLUNAS_BASE).eq("id", id).maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error) return { dados: null, erro: mensagemDeErro(error) };
  if (!data) return { dados: null, erro: null }; // não encontrada, sem erro
  return { dados: linhaParaVaga(data as VagaRow), erro: null };
}

/** Grava uma nova vaga e devolve o registro já criado (com o uuid do banco). */
export async function inserirVaga(
  vaga: Omit<Vaga, "id" | "criadoEm" | "origem">
): Promise<Resultado<Vaga>> {
  if (!supabase) {
    return { dados: null, erro: "Supabase não configurado (.env.local)." };
  }

  const payload = vagaParaLinha(vaga);

  const primeira = await supabase
    .from("vagas")
    .insert(payload)
    .select(COLUNAS_COMPLETAS)
    .single();
  let data: unknown = primeira.data;
  let error = primeira.error;

  if (error && erroDeColunaInexistente(error.message)) {
    const retry = await supabase
      .from("vagas")
      .insert(semColunasExtras(payload))
      .select(COLUNAS_BASE)
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) return { dados: null, erro: mensagemDeErro(error) };
  return { dados: linhaParaVaga(data as VagaRow), erro: null };
}

export { supabaseConfigurado };
