import { MapPin, AlertTriangle } from "lucide-react";
import { distribuicaoTerritorial, alertaDeslocamento } from "@/lib/mock-insights-data";
import { SectionCard } from "./section-card";

export function TerritoryPanel() {
  const maiorCandidatos = Math.max(...distribuicaoTerritorial.map((r) => r.candidatos));
  const maiorVagas = Math.max(...distribuicaoTerritorial.map((r) => r.vagas));

  return (
    <SectionCard
      titulo="Distribuição territorial de BC"
      descricao="Candidatos e vagas por região/bairro"
      icon={MapPin}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {distribuicaoTerritorial.map((r) => (
          <div key={r.bairro} className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-sm font-semibold text-slate-900">{r.bairro}</p>
            <div className="mt-3 space-y-2">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Candidatos</span>
                  <span className="font-medium text-slate-700">{r.candidatos}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${(r.candidatos / maiorCandidatos) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Vagas</span>
                  <span className="font-medium text-slate-700">{r.vagas}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-400"
                    style={{ width: `${(r.vagas / maiorVagas) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          <span className="font-semibold">Alerta de inteligência pública:</span> {alertaDeslocamento}
        </p>
      </div>
    </SectionCard>
  );
}
