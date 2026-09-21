"use client";

import { useState } from "react";
import { MapPinned, Lightbulb } from "lucide-react";
import {
  profissoesEscassez,
  nivelEscassezInfo,
  escassezDetalhes,
} from "@/lib/mock-insights-data";
import { SectionCard } from "./section-card";

export function ShortageMap() {
  const [selecionada, setSelecionada] = useState(profissoesEscassez[0].nome);
  const detalhe = escassezDetalhes[selecionada];

  const grupos = (["critico", "atencao", "alta-oferta"] as const).map((nivel) => ({
    nivel,
    itens: profissoesEscassez.filter((p) => p.nivel === nivel),
  }));

  return (
    <SectionCard
      titulo="Mapa de escassez profissional"
      descricao="Selecione uma profissão para ver o raio-x da categoria"
      icon={MapPinned}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          {grupos.map(({ nivel, itens }) => (
            <div key={nivel}>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className={`h-2 w-2 rounded-full ${nivelEscassezInfo[nivel].corPonto}`} />
                {nivelEscassezInfo[nivel].label}
              </p>
              <div className="flex flex-wrap gap-2">
                {itens.map((p) => {
                  const ativa = p.nome === selecionada;
                  return (
                    <button
                      key={p.nome}
                      type="button"
                      onClick={() => setSelecionada(p.nome)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        ativa
                          ? nivelEscassezInfo[nivel].corBadge + " ring-2 ring-offset-1"
                          : "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {p.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Raio-x da profissão
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{selecionada}</p>

          {detalhe ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat label="Vagas abertas" valor={detalhe.vagasAbertas} />
                <Stat label="Candidatos disponíveis" valor={detalhe.candidatosDisponiveis} />
                <Stat label="Qualificados" valor={detalhe.qualificados} destaque="emerald" />
                <Stat label="Precisam de capacitação" valor={detalhe.precisamCapacitacao} destaque="amber" />
              </div>
              <div className="mt-3 rounded-md bg-white p-3 ring-1 ring-inset ring-slate-200">
                <Stat label="Vagas sem candidatos compatíveis" valor={detalhe.vagasSemCandidatos} destaque="red" full />
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-md bg-teal-50 p-3 text-xs text-teal-800 ring-1 ring-inset ring-teal-200">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  <span className="font-semibold">Oportunidade identificada:</span>{" "}
                  {detalhe.oportunidade}
                </p>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Sem dados detalhados para esta profissão.</p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function Stat({
  label,
  valor,
  destaque,
  full,
}: {
  label: string;
  valor: number;
  destaque?: "emerald" | "amber" | "red";
  full?: boolean;
}) {
  const cor =
    destaque === "emerald"
      ? "text-emerald-600"
      : destaque === "amber"
        ? "text-amber-600"
        : destaque === "red"
          ? "text-red-600"
          : "text-slate-900";
  return (
    <div className={full ? "flex items-center justify-between" : ""}>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${cor}`}>{valor}</p>
    </div>
  );
}
