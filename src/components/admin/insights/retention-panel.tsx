import { Building2, Clock } from "lucide-react";
import { retencaoEmpresas, causasGargalo } from "@/lib/mock-insights-data";
import { SectionCard } from "./section-card";

export function RetentionPanel() {
  return (
    <SectionCard
      titulo="Retenção & dificuldade das empresas"
      descricao="Tempo de preenchimento de vagas e principais causas de gargalo"
      icon={Building2}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-2xl font-bold text-emerald-600">{retencaoEmpresas.contratacaoNormal}</p>
          <p className="mt-1 text-xs text-slate-500">Empresas contrataram normalmente</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="flex items-center gap-1.5 text-2xl font-bold text-amber-600">
            <Clock className="h-4 w-4" /> {retencaoEmpresas.vagasAbertas30dias}
          </p>
          <p className="mt-1 text-xs text-slate-500">Vagas abertas há mais de 30 dias</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="flex items-center gap-1.5 text-2xl font-bold text-red-600">
            <Clock className="h-4 w-4" /> {retencaoEmpresas.vagasAbertas60dias}
          </p>
          <p className="mt-1 text-xs text-slate-500">Vagas abertas há mais de 60 dias</p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
          Causas de gargalo mais citadas
        </p>
        <div className="space-y-2.5">
          {causasGargalo.map((c) => (
            <div key={c.causa}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-600">{c.causa}</span>
                <span className="font-medium text-slate-900">{c.percentual}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-400" style={{ width: `${c.percentual}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
