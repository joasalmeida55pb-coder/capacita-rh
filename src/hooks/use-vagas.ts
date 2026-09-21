"use client";

import { useCallback, useEffect, useState } from "react";
import { listarVagas } from "@/lib/vagas-service";
import { vagasSeed } from "@/lib/mock-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Vaga } from "@/types";

export type FonteVagas = "supabase" | "mock";

/**
 * Lista todas as vagas ativas.
 *
 * 1. Consulta a tabela `vagas` no Supabase (via `listarVagas`, que já
 *    traduz cada linha para o tipo `Vaga` de `@/types`).
 * 2. Quando a consulta falha, ou o banco ainda não tem nenhuma vaga ativa,
 *    cai para as vagas de exemplo (`vagasSeed`) combinadas com as vagas
 *    publicadas localmente (guardadas quando o Supabase não estava
 *    acessível no momento da publicação).
 */
export function useVagas() {
  const [vagasLocais] = useLocalStorageState<Vaga[]>(STORAGE_KEYS.vagas, []);
  const [vagasRemotas, setVagasRemotas] = useState<Vaga[] | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroConexao, setErroConexao] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { dados, erro } = await listarVagas();
    setVagasRemotas(dados);
    setErroConexao(erro);
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const temVagasRemotas = (vagasRemotas?.length ?? 0) > 0;
  const vagasMock = [...vagasLocais, ...vagasSeed];

  return {
    vagas: temVagasRemotas ? (vagasRemotas as Vaga[]) : vagasMock,
    fonte: (temVagasRemotas ? "supabase" : "mock") as FonteVagas,
    carregando,
    erroConexao,
    recarregar: carregar,
  };
}

export default useVagas;
