import { TrendingUp } from "lucide-react";
import { tendenciaMensal, indicadoresSazonais } from "@/lib/mock-insights-data";
import { SectionCard } from "./section-card";

const WIDTH = 560;
const HEIGHT = 180;
const PAD_X = 24;
const PAD_Y = 24;

export function MarketTrend() {
  const valores = tendenciaMensal.map((p) => p.vagas);
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const range = max - min || 1;

  const pontos = tendenciaMensal.map((p, i) => {
    const x = PAD_X + (i * (WIDTH - PAD_X * 2)) / (tendenciaMensal.length - 1);
    const y = HEIGHT - PAD_Y - ((p.vagas - min) / range) * (HEIGHT - PAD_Y * 2);
    return { ...p, x, y };
  });

  const linha = pontos.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${PAD_X},${HEIGHT - PAD_Y} ${linha} ${WIDTH - PAD_X},${HEIGHT - PAD_Y}`;

  return (
    <SectionCard
      titulo="Tendência do mercado & sazonalidade"
      descricao="Evolução de vagas — entressafra e preparação para a temporada"
      icon={TrendingUp}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Gráfico de linha da evolução de vagas por mês, de abril a setembro"
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={PAD_Y + f * (HEIGHT - PAD_Y * 2)}
            y2={PAD_Y + f * (HEIGHT - PAD_Y * 2)}
            stroke="var(--color-slate-100)"
            strokeWidth={1}
          />
        ))}
        <polygon points={area} fill="var(--color-teal-500)" opacity={0.08} />
        <polyline
          points={linha}
          fill="none"
          stroke="var(--color-teal-600)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pontos.map((p) => (
          <g key={p.mes}>
            <circle cx={p.x} cy={p.y} r={4} fill="white" stroke="var(--color-teal-600)" strokeWidth={2}>
              <title>{`${p.mes}: ${p.vagas} vagas`}</title>
            </circle>
            <text x={p.x} y={HEIGHT - 4} textAnchor="middle" className="fill-slate-400 text-[10px]">
              {p.mes}
            </text>
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-slate-600 text-[10px] font-medium">
              {p.vagas}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
        {indicadoresSazonais.map((ind) => (
          <div key={ind.label}>
            <p className="text-lg font-bold text-slate-900">{ind.valor}</p>
            <p className="text-xs text-slate-500">{ind.label}</p>
            <p className="text-[11px] text-slate-400">{ind.nota}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
