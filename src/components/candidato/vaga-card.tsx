"use client";

import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrilhaById } from "@/lib/mock-data";
import type { Trilha, Vaga } from "@/types";

const categoriaCores: Record<Vaga["categoria"], string> = {
  Hotelaria: "bg-sky-50 text-sky-700",
  Restaurante: "bg-amber-50 text-amber-700",
  Comércio: "bg-fuchsia-50 text-fuchsia-700",
  Serviços: "bg-indigo-50 text-indigo-700",
};

export function VagaCard({
  vaga,
  trilhaConcluida,
  recomendada = false,
  onIrParaTrilha,
}: {
  vaga: Vaga;
  trilhaConcluida: boolean;
  recomendada?: boolean;
  onIrParaTrilha: (trilhaId: string) => void;
}) {
  const [candidatado, setCandidatado] = useState(false);
  const trilha: Trilha | undefined = vaga.trilhaRequeridaId
    ? getTrilhaById(vaga.trilhaRequeridaId)
    : undefined;
  const exigeTrilha = Boolean(vaga.trilhaRequeridaId);
  // A candidatura nunca é bloqueada pela trilha — ela só é sugerida.
  void trilhaConcluida;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-900">{vaga.titulo}</h3>
            <p className="text-sm text-slate-500">{vaga.empresa}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${categoriaCores[vaga.categoria]}`}
            >
              {vaga.categoria}
            </span>
            {recomendada && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2.5 py-1 text-xs font-medium text-white">
                <Sparkles className="h-3 w-3" /> Recomendada
              </span>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">{vaga.descricao}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {vaga.bairro}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {vaga.cargaHoraria}
          </span>
          <span className="inline-flex items-center gap-1">
            <Wallet className="h-3.5 w-3.5" /> {vaga.salario}
          </span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" /> {vaga.tipoContrato}
          </span>
        </div>

        {vaga.aceitaCapacitacao && (
          <p className="mt-3 inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
            Aceita candidatos em capacitação
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {candidatado ? (
          <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
            <CheckCircle2 className="h-4 w-4" /> Candidatura enviada!
          </div>
        ) : (
          <Button className="w-full" onClick={() => setCandidatado(true)}>
            Aplicar para esta vaga
          </Button>
        )}
        {exigeTrilha && trilha && !candidatado && (
          <button
            type="button"
            onClick={() => onIrParaTrilha(vaga.trilhaRequeridaId)}
            className="mt-2 w-full text-center text-xs text-teal-700 underline"
          >
            Curso rápido recomendado (2h): {trilha.titulo}
          </button>
        )}
      </div>
    </div>
  );
}
