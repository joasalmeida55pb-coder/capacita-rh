'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Espelha EXACTAMENTE `public.vagas`:
 *   id uuid | created_at timestamptz | empresa_id uuid NULL | titulo text | descricao text
 *
 * `empresa_id` é NULLABLE mas tem FOREIGN KEY para empresas(id):
 * ou é NULL, ou é o id de uma empresa que existe mesmo na base.
 * Um uuid inventado (opção local de fallback) provoca erro 23503.
 */
export type Vaga = {
  id: string;
  created_at: string;
  empresa_id: string | null;
  titulo: string | null;
  descricao: string | null;
};

export type NovaVaga = {
  empresa_id?: string | null;
  titulo: string;
  descricao?: string | null;
};

const COLUNAS_VAGAS = 'id, created_at, empresa_id, titulo, descricao';

function sanitizar(input: NovaVaga) {
  const empresaId = (input.empresa_id ?? '').trim();
  return {
    empresa_id: empresaId.length > 0 ? empresaId : null,
    titulo: input.titulo?.trim() ?? '',
    descricao: input.descricao?.trim() || null,
  };
}

export function useVagas(empresaId?: string) {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    let query = supabase
      .from('vagas')
      .select(COLUNAS_VAGAS)
      .order('created_at', { ascending: false });

    if (empresaId) query = query.eq('empresa_id', empresaId);

    const { data, error } = await query;

    if (error) {
      setErro(error.message);
      setVagas([]);
    } else {
      setVagas((data ?? []) as Vaga[]);
    }

    setCarregando(false);
  }, [empresaId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const criarVaga = useCallback(
    async (input: NovaVaga): Promise<{ vaga: Vaga | null; erro: string | null }> => {
      const payload = sanitizar(input);

      if (!payload.titulo) {
        return { vaga: null, erro: 'O título da vaga é obrigatório.' };
      }

      const { data, error } = await supabase
        .from('vagas')
        .insert(payload)
        .select(COLUNAS_VAGAS)
        .single();

      if (error) {
        const mensagem =
          error.code === '23503'
            ? 'A empresa selecionada já não existe na base de dados. Recarregue a página.'
            : error.message;
        setErro(mensagem);
        return { vaga: null, erro: mensagem };
      }

      const vaga = data as Vaga;
      setVagas((anteriores) => [vaga, ...anteriores]);
      return { vaga, erro: null };
    },
    [],
  );

  return { vagas, carregando, erro, carregar, criarVaga };
}

export default useVagas;
