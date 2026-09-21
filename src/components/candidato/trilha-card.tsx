"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  ShoppingCart,
  Sparkles,
  Utensils,
  Palmtree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Trilha } from "@/types";

const icones = {
  comercio: ShoppingCart,
  garcom: Utensils,
  turismo: Palmtree,
};

export function TrilhaCard({
  trilha,
  concluida,
  recomendada = false,
  aberta,
  onToggle,
  onConcluir,
}: {
  trilha: Trilha;
  concluida: boolean;
  recomendada?: boolean;
  aberta: boolean;
  onToggle: () => void;
  onConcluir: () => void;
}) {
  const [modo, setModo] = useState<"aulas" | "quiz">("aulas");
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [resultado, setResultado] = useState<null | { acertos: number; total: number }>(
    null
  );

  const Icone = icones[trilha.icone];

  function selecionarResposta(perguntaId: string, opcaoIndex: number) {
    if (resultado) return;
    setRespostas((prev) => ({ ...prev, [perguntaId]: opcaoIndex }));
  }

  function enviarQuiz() {
    const total = trilha.quiz.length;
    const acertos = trilha.quiz.filter(
      (p) => respostas[p.id] === p.respostaCorretaIndex
    ).length;
    setResultado({ acertos, total });
    if (acertos === total) {
      onConcluir();
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Icone className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">{trilha.titulo}</h3>
            <p className="text-sm text-slate-500">{trilha.descricao}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {recomendada && !concluida && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2.5 py-1 text-xs font-medium text-white">
              <Sparkles className="h-3 w-3" /> Recomendada
            </span>
          )}
          {concluida && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Concluída
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" /> {trilha.duracaoTotal}
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-slate-400 transition-transform",
              aberta && "rotate-180"
            )}
          />
        </div>
      </button>

      {aberta && (
        <div className="border-t border-slate-100 p-5">
          {/* Tabs internas */}
          <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-1 text-sm">
            <button
              className={cn(
                "rounded-md px-3 py-1.5 font-medium",
                modo === "aulas" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
              )}
              onClick={() => setModo("aulas")}
            >
              Aulas
            </button>
            <button
              className={cn(
                "rounded-md px-3 py-1.5 font-medium",
                modo === "quiz" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
              )}
              onClick={() => setModo("quiz")}
            >
              Quiz
            </button>
          </div>

          {modo === "aulas" ? (
            <div className="space-y-4">
              {trilha.aulas.map((aula, i) => (
                <div key={aula.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <BookOpen className="h-4 w-4 text-teal-600" />
                    Aula {i + 1}: {aula.titulo}
                    <span className="ml-auto text-xs font-normal text-slate-400">
                      {aula.duracaoMin} min
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{aula.resumo}</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-slate-500">
                    {aula.conteudo.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {trilha.quiz.map((pergunta, i) => (
                <div key={pergunta.id}>
                  <p className="text-sm font-medium text-slate-900">
                    {i + 1}. {pergunta.pergunta}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {pergunta.opcoes.map((opcao, idx) => {
                      const selecionada = respostas[pergunta.id] === idx;
                      const correta = pergunta.respostaCorretaIndex === idx;
                      const mostrarResultado = !!resultado;
                      return (
                        <button
                          key={opcao}
                          type="button"
                          onClick={() => selecionarResposta(pergunta.id, idx)}
                          disabled={!!resultado}
                          className={cn(
                            "block w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
                            selecionada
                              ? "border-teal-500 bg-teal-50"
                              : "border-slate-200 hover:bg-slate-50",
                            mostrarResultado && correta && "border-teal-500 bg-teal-50",
                            mostrarResultado &&
                              selecionada &&
                              !correta &&
                              "border-red-300 bg-red-50"
                          )}
                        >
                          {opcao}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {resultado ? (
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm font-medium",
                    resultado.acertos === resultado.total
                      ? "bg-teal-50 text-teal-700"
                      : "bg-amber-50 text-amber-700"
                  )}
                >
                  {resultado.acertos === resultado.total
                    ? `Parabéns! Você acertou ${resultado.acertos}/${resultado.total} e concluiu a trilha.`
                    : `Você acertou ${resultado.acertos}/${resultado.total}. Revise as aulas e tente novamente.`}
                  {resultado.acertos !== resultado.total && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-3"
                      onClick={() => {
                        setResultado(null);
                        setRespostas({});
                      }}
                    >
                      Tentar novamente
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  className="w-full"
                  disabled={Object.keys(respostas).length < trilha.quiz.length}
                  onClick={enviarQuiz}
                >
                  Enviar respostas
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
