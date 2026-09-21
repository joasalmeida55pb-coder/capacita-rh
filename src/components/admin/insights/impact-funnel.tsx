import { GraduationCap, Filter } from "lucide-react";
import { impactoTrilhas, funilEmpregabilidade } from "@/lib/mock-insights-data";
import { SectionCard } from "./section-card";

export function ImpactFunnel() {
  const maiorEtapa = funilEmpregabilidade[0].valor;

  return (
    <div className="space-y-6">
      <SectionCard
        titulo="Impacto das capacitações"
        descricao="Inscritos, concluintes e contratações por trilha — capacitados vs. não capacitados"
        icon={GraduationCap}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4 font-medium">Trilha</th>
                <th className="py-2 pr-4 font-medium">Inscritos</th>
                <th className="py-2 pr-4 font-medium">Concluintes</th>
                <th className="py-2 pr-4 font-medium">Contratados</th>
                <th className="py-2 pl-0 font-medium">% contratação (capacitados vs. não)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {impactoTrilhas.map((t) => (
                <tr key={t.trilha}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{t.trilha}</td>
                  <td className="py-3 pr-4 tabular-nums text-slate-600">{t.inscritos}</td>
                  <td className="py-3 pr-4 tabular-nums text-slate-600">{t.concluintes}</td>
                  <td className="py-3 pr-4 tabular-nums text-slate-600">{t.contratados}</td>
                  <td className="py-3 pl-0">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 font-medium text-teal-700">
                        <span className="h-2 w-2 rounded-full bg-teal-500" />
                        {t.percentualContratacaoCapacitados}%
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                        {t.percentualContratacaoNaoCapacitados}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        titulo="Funil de empregabilidade"
        descricao="Da inscrição na plataforma até a contratação"
        icon={Filter}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          {funilEmpregabilidade.map((etapa, i) => {
            const largura = Math.max((etapa.valor / maiorEtapa) * 100, 14);
            const conversao =
              i === 0
                ? null
                : Math.round((etapa.valor / funilEmpregabilidade[i - 1].valor) * 100);
            return (
              <div key={etapa.etapa} className="flex-1">
                <div
                  className="mx-auto flex h-16 items-center justify-center rounded-md bg-teal-600 text-center text-white sm:h-20"
                  style={{ width: `${largura}%`, opacity: 0.55 + (i / funilEmpregabilidade.length) * 0.45 }}
                >
                  <span className="px-1 text-sm font-bold tabular-nums sm:text-base">
                    {etapa.valor.toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="mt-1.5 text-center text-[11px] font-medium text-slate-600">
                  {etapa.etapa}
                </p>
                {conversao !== null && (
                  <p className="text-center text-[10px] text-slate-400">{conversao}% da etapa anterior</p>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
