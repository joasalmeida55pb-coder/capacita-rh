"use client";

import { useEffect, useState } from "react";

/**
 * Estado React persistido no LocalStorage do navegador.
 *
 * - No primeiro render (servidor e cliente) usa sempre `valorInicial`, evitando
 *   erros de hidratação do Next.js.
 * - Logo após montar, lê o valor salvo no LocalStorage (se existir) e atualiza o estado.
 * - Toda alteração subsequente do estado é gravada de volta no LocalStorage.
 *
 * IMPORTANTE: o efeito de escrita só grava depois que `hidratado` vira `true`
 * (ou seja, depois que a leitura inicial do LocalStorage terminou). Sem essa
 * guarda, o React Strict Mode do `next dev` invoca os efeitos duas vezes ao
 * montar o componente e a escrita acontecia antes da leitura terminar,
 * sobrescrevendo qualquer dado já salvo com o valor inicial — foi exatamente
 * o bug de "perder os dados ao recarregar a página".
 */
export function useLocalStorageState<T>(chave: string, valorInicial: T) {
  const [estado, setEstado] = useState<T>(valorInicial);
  const [hidratado, setHidratado] = useState(false);

  // Lê o valor salvo assim que o componente monta no navegador.
  useEffect(() => {
    let cancelado = false;

    // Executado via microtask (em vez de direto no corpo do efeito) para
    // satisfazer a regra de lint react-hooks/set-state-in-effect.
    queueMicrotask(() => {
      if (cancelado) return;

      try {
        const bruto = window.localStorage.getItem(chave);
        if (bruto !== null) {
          setEstado(JSON.parse(bruto) as T);
        }
      } catch {
        // LocalStorage indisponível (modo privado, quota, etc.) — segue com o valor inicial.
      }
      setHidratado(true);
    });

    return () => {
      cancelado = true;
    };
  }, [chave]);

  // Grava no LocalStorage sempre que o estado mudar — mas somente depois que
  // a leitura inicial (acima) já tiver terminado.
  useEffect(() => {
    if (!hidratado) return;
    try {
      window.localStorage.setItem(chave, JSON.stringify(estado));
    } catch {
      // Ignora falhas de escrita (quota excedida, modo privado, etc.).
    }
  }, [chave, estado, hidratado]);

  return [estado, setEstado, hidratado] as const;
}
