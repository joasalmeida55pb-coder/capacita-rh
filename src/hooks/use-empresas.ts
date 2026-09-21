'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { COLUNAS_EMPRESAS, garantirEmpresas, type Empresa } from '@/lib/empresas';

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [semeou, setSemeou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const resultado = await garantirEmpresas();
    setEmpresas(resultado.empresas);
    setSemeou(resultado.semeou);
    setErro(resultado.erro);
    setCarregando(false);
    return resultado.empresas;
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const recarregar = useCallback(async () => {
    const { data, error } = await supabase
      .from('empresas')
      .select(COLUNAS_EMPRESAS)
      .order('nome', { ascending: true });

    if (error) setErro(error.message);
    else setEmpresas((data ?? []) as Empresa[]);
  }, []);

  return { empresas, carregando, semeou, erro, carregar, recarregar };
}

export default useEmpresas;
