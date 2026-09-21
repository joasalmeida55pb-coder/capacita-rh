import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase — Capacita RH
 *
 * 1. Fallback que também cobre strings vazias (env var definida mas em branco).
 * 2. Cabeçalho `apikey` forçado em TODOS os pedidos via `global.headers`.
 * 3. Instância única (singleton), evitando múltiplos clientes em HMR/Next.
 *
 * Em Next.js as variáveis NEXT_PUBLIC_* são substituídas em build time:
 * depois de alterar o .env.local é obrigatório reiniciar o `next dev`.
 */

function resolve(value: string | undefined, fallback: string): string {
  const v = (value ?? '').trim();
  return v.length > 0 ? v : fallback;
}

export const SUPABASE_URL = resolve(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  'https://htgbhowjywbplugacjbj.supabase.co',
);

export const SUPABASE_ANON_KEY = resolve(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'sb_publishable_hzHozFv7iEpkQOUj3DHi1g_c63_uBOj',
);

function criarCliente(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      // NÃO definir `Authorization` aqui: sobrepor-se-ia ao JWT do
      // utilizador autenticado quando adicionar login.
      headers: { apikey: SUPABASE_ANON_KEY },
    },
  });
}

declare global {
  // eslint-disable-next-line no-var
  var __capacitaSupabase__: SupabaseClient | undefined;
}

export const supabase: SupabaseClient =
  globalThis.__capacitaSupabase__ ?? criarCliente();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__capacitaSupabase__ = supabase;
}

/**
 * `true` quando há URL + chave anônima resolvidas (mesmo que venham do
 * fallback embutido acima). As telas que consultam o Supabase usam esta
 * flag para decidir se tentam a rede antes de caírem nos dados de exemplo.
 */
export const supabaseConfigurado: boolean = Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

/** Extrai uma mensagem legível de um erro devolvido pelo cliente Supabase. */
export function mensagemDeErro(erro: unknown): string {
  if (
    erro &&
    typeof erro === 'object' &&
    'message' in erro &&
    typeof (erro as { message?: unknown }).message === 'string'
  ) {
    return (erro as { message: string }).message;
  }
  return 'Erro desconhecido ao comunicar com o Supabase.';
}

export default supabase;
