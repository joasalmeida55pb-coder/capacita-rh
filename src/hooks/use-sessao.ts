"use client";

import { useCallback } from "react";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { SessaoUsuario } from "@/types";

/**
 * Sessão ativa do usuário (candidato OU empresa), persistida em
 * `capacita_user_session`. Mantém o usuário logado após F5, até que ele
 * clique em "Sair".
 */
export function useSessao() {
  const [sessao, setSessao, hidratado] = useLocalStorageState<SessaoUsuario | null>(
    STORAGE_KEYS.sessao,
    null
  );

  const entrar = useCallback(
    (tipo: SessaoUsuario["tipo"], id: string) => setSessao({ tipo, id }),
    [setSessao]
  );

  const sair = useCallback(() => setSessao(null), [setSessao]);

  return { sessao, entrar, sair, hidratado };
}
