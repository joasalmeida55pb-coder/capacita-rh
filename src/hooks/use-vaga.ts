"use client";

import { useEffect, useState } from "react";
import { buscarVagaPorId, pareceUuid } from "@/lib/vagas-service";
import { supabaseConfigurado } from "@/lib/supabase";
import { vagasSeed } from "@/lib/mock-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Vaga } from "@/types";

/**
 * Carrega UMA vaga pelo ID.
 *
 * 1. Consulta `vagas` no Supabase por `id` (só quando o id é um uuid — os ids
 *    das vagas de exemplo, como "vaga-1", não existem no banco).
 * 2. Se não achar no banco (ou der erro), procura nas vagas salvas localmente.
 * 3. Por último, procura no mock `vagasSeed`.
 */
export function useVaga(id: string) {
  const [vagasLocais, , localHidratado] = useLocalStorageState<Vaga[]>(
    STORAGE_KEYS.vagas,
    []
  );

  const [vagaRemota, setVagaRemota] = useState<Vaga | null>(null);
  const [buscando, setBuscando] = useState(supabaseConfigurado && pareceUuid(id));
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    // Via microtask para não chamar setState direto no corpo do efeito
    // (regra react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      if (cancelado) return;

      if (!supabaseConfigurado || !pareceUuid(id)) {
        setBuscando(false);
        return;
      }

      void (async () => {
        const { dados, erro: falha } = await buscarVagaPorId(id);
        if (cancelado) return;
        setVagaRemota(dados);
        setErro(falha);
        setBuscando(false);
      })();
    });

    return () => {
      cancelado = true;
    };
  }, [id]);

  const vagaLocal =
    vagasLocais.find((v) => v.id === id) ?? vagasSeed.find((v) => v.id === id) ?? null;

  return {
    vaga: vagaRemota ?? vagaLocal,
    fonte: (vagaRemota ? "supabase" : "mock") as "supabase" | "mock",
    erro,
    /** true quando tanto a consulta ao banco quanto a leitura local terminaram. */
    carregado: !buscando && localHidratado,
  };
}
