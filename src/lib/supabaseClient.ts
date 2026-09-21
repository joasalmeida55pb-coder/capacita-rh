import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Capacita RH] Variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não definidas.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ---------- Tipos espelhando o schema real do projeto ---------- */

export type Vaga = {
  id: string
  created_at: string
  empresa_id: string | null
  titulo: string | null
  descricao: string | null
  regime: string | null
  modalidade: string | null
  salario: string | null
  beneficios: string | null
  requisitos: string | null
  bairro: string | null
  cidade: string | null
  status: string | null
}

export type Empresa = {
  id: string
  created_at: string
  nome: string | null
  email: string | null
  telefone: string | null
  cnpj: string | null
  setor: string | null
  logo_url: string | null
}

export type Candidatura = {
  id: string
  created_at: string
  vaga_id: string | null
  candidato_id: string | null
  status: string | null
  /* Opcionais: só existem depois de correr migracao-trilha.sql.
     O código trata `undefined` como "sem registo da trilha". */
  trilha_concluida?: boolean | null
  trilha_area?: string | null
}

export type Candidato = {
  id: string
  created_at: string
  nome: string | null
  email: string | null
  telefone: string | null
  cpf: string | null
  bairro: string | null
  experiencia: string | null
  curriculo_url: string | null
}

/** Candidatura já cruzada com a linha de `candidatos`. */
export type CandidaturaComCandidato = Candidatura & { candidato: Candidato | null }
