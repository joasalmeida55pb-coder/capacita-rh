"use client";

import { useCallback } from "react";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { ADMIN_CREDENCIAIS } from "@/lib/constants";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/** Sessão de login (bem simples, apenas para o sandbox) do Painel Administrativo. */
export function useAdminAuth() {
  const [autenticado, setAutenticado, hidratado] = useLocalStorageState<boolean>(
    STORAGE_KEYS.adminSessao,
    false
  );

  const entrar = useCallback(
    (email: string, senha: string) => {
      const valido =
        email.trim().toLowerCase() === ADMIN_CREDENCIAIS.email &&
        senha === ADMIN_CREDENCIAIS.senha;
      if (valido) setAutenticado(true);
      return valido;
    },
    [setAutenticado]
  );

  const sair = useCallback(() => setAutenticado(false), [setAutenticado]);

  return { autenticado, entrar, sair, hidratado };
}
