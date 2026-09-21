import { Target, Megaphone } from "lucide-react";
import { radarQualificacao } from "@/lib/mock-insights-data";
import { Button } from "@/components/ui/button";
import { SectionCard } from "./section-card";

export function SkillsRadar() {
  const maior = Math.max(...radarQualificacao.map((g) => g.pedem));

  return (
    <SectionCard
      titulo="Radar de qualificação"
      descricao="Gap entre competências exigidas pelas vagas e as que os candidatos possuem"
      icon={Target}
    >
      <div className="space-y-5">
        {radarQualificacao.map((g) => {
          const deficit = g.pedem - g.possuem;
          return (
            <div key={g.competencia}>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">{g.competencia}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>
                    <span className="font-semibold text-slate-700">{g.pedem}</span> pedem
                  </span>
                  <span>
                    <span className="font-semibold text-slate-700">{g.possuem}</span> possuem
                  </span>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700 ring-1 ring-inset ring-red-200">
                    Déficit: {deficit}
                  </span>
                </div>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-slate-300"
                  style={{ width: `${(g.pedem / maior) * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-teal-500"
                  style={{ width: `${(g.possuem / maior) * 100}%` }}
                />
              </div>
              {g.temCampanha && (
                <div className="mt-2">
                  <Button size="sm" variant="outline">
                    <Megaphone className="h-3.5 w-3.5" />
                    Criar Campanha de Capacitação
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-300" /> Vagas que pedem
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-500" /> Candidatos que possuem
        </span>
      </div>
    </SectionCard>
  );
}
