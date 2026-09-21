import { Scale } from "lucide-react";
import {
  ofertaDemanda,
  ofertaDemandaBadgeLabel,
  type BadgeOfertaDemanda,
} from "@/lib/mock-insights-data";
import { SectionCard } from "./section-card";

const badgeClasses: Record<BadgeOfertaDemanda, string> = {
  equilibrado: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  deficit: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  excesso: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
};

export function SupplyDemandTable() {
  const maiorValor = Math.max(
    ...ofertaDemanda.flatMap((item) => [item.candidatos, item.vagas])
  );

  return (
    <SectionCard
      titulo="Equilíbrio entre vagas e candidatos"
      descricao="Oferta x demanda por profissão-chave do mercado local"
      icon={Scale}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-4 font-medium">Profissão</th>
              <th className="py-2 pr-4 font-medium">Candidatos</th>
              <th className="py-2 pr-4 font-medium">Vagas</th>
              <th className="py-2 pr-4 font-medium">Comparativo</th>
              <th className="py-2 pl-0 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ofertaDemanda.map((item) => (
              <tr key={item.profissao}>
                <td className="py-3 pr-4 font-medium text-slate-900">{item.profissao}</td>
                <td className="py-3 pr-4 tabular-nums text-slate-600">{item.candidatos}</td>
                <td className="py-3 pr-4 tabular-nums text-slate-600">{item.vagas}</td>
                <td className="py-3 pr-4">
                  <div className="flex w-40 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-[10px] text-slate-400">Candid.</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${(item.candidatos / maiorValor) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-[10px] text-slate-400">Vagas</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-400"
                          style={{ width: `${(item.vagas / maiorValor) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pl-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses[item.badge]}`}
                  >
                    {ofertaDemandaBadgeLabel[item.badge]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
