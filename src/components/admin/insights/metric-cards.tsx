import { ArrowUpRight } from "lucide-react";
import { metricasTopo } from "@/lib/mock-insights-data";

export function MetricCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {metricasTopo.map((m) => (
        <div
          key={m.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-slate-500">{m.label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{m.valor}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            {m.variacao}
          </p>
        </div>
      ))}
    </div>
  );
}
