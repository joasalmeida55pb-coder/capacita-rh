"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { STORAGE_KEYS } from "@/lib/storage-keys";

type MapaTrilhasConcluidas = Record<string, string[]>;

/**
 * IDs das trilhas já concluídas, persistidos em `capacita_trilhas_concluidas`
 * e organizados por candidato (`{ [candidatoId]: string[] }`), já que agora
 * várias pessoas podem ter conta no mesmo navegador.
 */
export function useTrilhasConcluidas(candidatoId: string | null) {
  const [mapa, setMapa, hidratado] = useLocalStorageState<MapaTrilhasConcluidas>(
    STORAGE_KEYS.trilhasConcluidas,
    {}
  );

  const trilhasConcluidasIds = useMemo(
    () => (candidatoId ? mapa[candidatoId] ?? [] : []),
    [mapa, candidatoId]
  );

  const concluirTrilha = useCallback(
    (trilhaId: string) => {
      if (!candidatoId) return;
      setMapa((atual) => {
        const doCandidato = atual[candidatoId] ?? [];
        if (doCandidato.includes(trilhaId)) return atual;
        return { ...atual, [candidatoId]: [...doCandidato, trilhaId] };
      });
    },
    [candidatoId, setMapa]
  );

  const estaConcluida = useCallback(
    (trilhaId: string) => trilhasConcluidasIds.includes(trilhaId),
    [trilhasConcluidasIds]
  );

  return { trilhasConcluidasIds, concluirTrilha, estaConcluida, hidratado };
}
