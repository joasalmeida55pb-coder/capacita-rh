"use client";

import { useCallback } from "react";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { CandidatoPerfil } from "@/types";

/**
 * Contas de candidatos (cadastro + login), persistidas no LocalStorage em
 * `capacita_candidatos`. Inicia vazio e vai sendo mesclado com as novas
 * contas criadas — nada é perdido ao recarregar a página.
 */
export function useCandidatos() {
  const [candidatos, setCandidatos, hidratado] = useLocalStorageState<CandidatoPerfil[]>(
    STORAGE_KEYS.candidatos,
    []
  );

  const emailEmUso = useCallback(
    (email: string) =>
      candidatos.some((c) => c.email.toLowerCase() === email.trim().toLowerCase()),
    [candidatos]
  );

  const cadastrar = useCallback(
    (dados: Omit<CandidatoPerfil, "id" | "criadoEm">): CandidatoPerfil | null => {
      if (emailEmUso(dados.email)) return null;
      const candidato: CandidatoPerfil = {
        ...dados,
        email: dados.email.trim().toLowerCase(),
        id: `candidato-${Date.now()}`,
        criadoEm: new Date().toISOString(),
      };
      setCandidatos((atual) => [...atual, candidato]);
      return candidato;
    },
    [emailEmUso, setCandidatos]
  );

  const autenticar = useCallback(
    (email: string, senha: string): CandidatoPerfil | null => {
      const encontrado = candidatos.find(
        (c) => c.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!encontrado || encontrado.senha !== senha) return null;
      return encontrado;
    },
    [candidatos]
  );

  const atualizar = useCallback(
    (id: string, dados: Partial<Omit<CandidatoPerfil, "id" | "email" | "senha" | "criadoEm">>) => {
      setCandidatos((atual) =>
        atual.map((c) => (c.id === id ? { ...c, ...dados } : c))
      );
    },
    [setCandidatos]
  );

  const buscarPorId = useCallback(
    (id: string) => candidatos.find((c) => c.id === id) ?? null,
    [candidatos]
  );

  return { candidatos, cadastrar, autenticar, atualizar, buscarPorId, emailEmUso, hidratado };
}
