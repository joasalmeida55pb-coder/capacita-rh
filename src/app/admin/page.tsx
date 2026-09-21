"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  MapPinned,
  GraduationCap,
  MapPin,
  Building2,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { LoginForm } from "@/components/admin/login-form";
import { MetricCards } from "@/components/admin/insights/metric-cards";
import { SupplyDemandTable } from "@/components/admin/insights/supply-demand-table";
import { ShortageMap } from "@/components/admin/insights/shortage-map";
import { MarketTrend } from "@/components/admin/insights/market-trend";
import { SkillsRadar } from "@/components/admin/insights/skills-radar";
import { TerritoryPanel } from "@/components/admin/insights/territory-panel";
import { CandidateProfile } from "@/components/admin/insights/candidate-profile";
import { RetentionPanel } from "@/components/admin/insights/retention-panel";
import { ImpactFunnel } from "@/components/admin/insights/impact-funnel";

const ABAS = [
  { id: "visao-geral", label: "Visão Geral", icon: LayoutDashboard },
  { id: "escassez", label: "Escassez & Sazonalidade", icon: MapPinned },
  { id: "qualificacao", label: "Qualificação", icon: GraduationCap },
  { id: "territorio", label: "Território & Candidatos", icon: MapPin },
  { id: "empresas", label: "Empresas", icon: Building2 },
] as const;

type AbaId = (typeof ABAS)[number]["id"];

export default function AdminPage() {
  const { autenticado, entrar, sair, hidratado } = useAdminAuth();
  const [aba, setAba] = useState<AbaId>("visao-geral");

  if (!hidratado) {
    // Evita mostrar a tela de login por um instante enquanto lemos a sessão salva.
    return <div className="min-h-[70vh]" />;
  }

  if (!autenticado) {
    return <LoginForm onEntrar={entrar} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Capacita Insights</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Inteligência de mercado do programa de qualificação e recolocação de
            Balneário Camboriú — visão executiva da Prefeitura.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={sair}>
          <LogOut className="h-3.5 w-3.5" /> Sair
        </Button>
      </div>

      <MetricCards />

      <div className="sticky top-0 z-10 -mx-4 mt-6 overflow-x-auto bg-slate-50/95 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
        <nav className="flex w-max gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
          {ABAS.map(({ id, label, icon: Icon }) => {
            const ativa = id === aba;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setAba(id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                  ativa
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 space-y-6">
        {aba === "visao-geral" && <SupplyDemandTable />}
        {aba === "escassez" && (
          <div className="space-y-6">
            <ShortageMap />
            <MarketTrend />
          </div>
        )}
        {aba === "qualificacao" && (
          <div className="space-y-6">
            <SkillsRadar />
            <ImpactFunnel />
          </div>
        )}
        {aba === "territorio" && (
          <div className="space-y-6">
            <TerritoryPanel />
            <CandidateProfile />
          </div>
        )}
        {aba === "empresas" && <RetentionPanel />}
      </div>
    </div>
  );
}
