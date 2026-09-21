import { Users } from "lucide-react";
import {
  situacaoProfissional,
  disponibilidade,
  setoresInteresse,
} from "@/lib/mock-insights-data";
import { SectionCard } from "./section-card";

export function CandidateProfile() {
  return (
    <SectionCard titulo="Perfil dos candidatos" icon={Users}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            Situação profissional
          </p>
          <div className="space-y-2.5">
            {situacaoProfissional.map((s) => (
              <BarRow key={s.label} label={s.label} percentual={s.percentual} cor="bg-teal-500" />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            Disponibilidade
          </p>
          <div className="space-y-2.5">
            {disponibilidade.map((d) => (
              <BarRow key={d.label} label={d.label} percentual={d.percentual} cor="bg-slate-400" />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            Setores de interesse
          </p>
          <div className="space-y-2.5">
            {setoresInteresse.map((s) => (
              <BarRow key={s.label} label={s.label} percentual={s.percentual} cor="bg-blue-400" />
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function BarRow({ label, percentual, cor }: { label: string; percentual: number; cor: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{percentual}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${cor}`} style={{ width: `${percentual}%` }} />
      </div>
    </div>
  );
}
