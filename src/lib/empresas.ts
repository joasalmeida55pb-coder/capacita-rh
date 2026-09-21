import { supabase } from '@/lib/supabase';

/**
 * Espelha EXACTAMENTE `public.empresas`:
 *   id uuid NOT NULL default gen_random_uuid()
 *   created_at timestamptz NOT NULL default now()
 *   nome text NOT NULL
 *   email text NOT NULL UNIQUE
 *   telefone text NULL
 *   cnpj text NULL
 *   setor text NULL
 *   logo_url text NULL
 */
export type Empresa = {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  telefone: string | null;
  cnpj: string | null;
  setor: string | null;
  logo_url: string | null;
};

export const COLUNAS_EMPRESAS =
  'id, created_at, nome, email, telefone, cnpj, setor, logo_url';

/**
 * Empresas de demonstração do piloto de Balneário Camboriú.
 * `email` tem constraint UNIQUE — é a chave usada no upsert, o que torna
 * a operação idempotente mesmo com dois separadores abertos ao mesmo tempo.
 */
export const EMPRESAS_DEMO = [
  {
    nome: 'Hotel Marambaia Cabeçudas',
    email: 'rh@marambaia.demo.capacita.local',
    telefone: '(47) 3000-0001',
    setor: 'Hotelaria',
  },
  {
    nome: 'Restaurante Beira-Mar',
    email: 'rh@beiramar.demo.capacita.local',
    telefone: '(47) 3000-0002',
    setor: 'Restaurantes',
  },
  {
    nome: 'Supermercado Centro BC',
    email: 'rh@centrobc.demo.capacita.local',
    telefone: '(47) 3000-0003',
    setor: 'Comércio',
  },
] as const;

/** Ligue a false (ou NEXT_PUBLIC_SEED_EMPRESAS=false) para desativar o seed automático. */
export const SEED_ATIVO =
  (process.env.NEXT_PUBLIC_SEED_EMPRESAS ?? 'true').trim().toLowerCase() !== 'false';

/**
 * Garante que existe pelo menos uma empresa.
 * Só escreve quando a tabela está mesmo vazia — nunca duplica registos reais.
 */
export async function garantirEmpresas(): Promise<{
  empresas: Empresa[];
  semeou: boolean;
  erro: string | null;
}> {
  const existentes = await supabase
    .from('empresas')
    .select(COLUNAS_EMPRESAS)
    .order('nome', { ascending: true });

  if (existentes.error) {
    return { empresas: [], semeou: false, erro: existentes.error.message };
  }

  const lista = (existentes.data ?? []) as Empresa[];
  if (lista.length > 0 || !SEED_ATIVO) {
    return { empresas: lista, semeou: false, erro: null };
  }

  const inseridas = await supabase
    .from('empresas')
    .upsert(EMPRESAS_DEMO as unknown as Record<string, unknown>[], {
      onConflict: 'email',
      ignoreDuplicates: true,
    })
    .select(COLUNAS_EMPRESAS);

  if (inseridas.error) {
    // Falhou o seed (ex.: RLS ativado mais tarde) — devolvemos lista vazia
    // em vez de opções locais falsas, que violariam a FK vagas → empresas.
    return { empresas: [], semeou: false, erro: inseridas.error.message };
  }

  const semeadas = (inseridas.data ?? []) as Empresa[];
  if (semeadas.length > 0) {
    return { empresas: semeadas, semeou: true, erro: null };
  }

  // `ignoreDuplicates` pode devolver 0 linhas numa corrida entre separadores.
  const recarga = await supabase
    .from('empresas')
    .select(COLUNAS_EMPRESAS)
    .order('nome', { ascending: true });

  return {
    empresas: (recarga.data ?? []) as Empresa[],
    semeou: true,
    erro: recarga.error?.message ?? null,
  };
}
