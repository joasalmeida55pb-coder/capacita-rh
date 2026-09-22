"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Clock,
  Database,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SETORES, REGIMES_CONTRATO, ESCALAS } from "@/lib/constants";
import { extrairSalarioNumero } from "@/lib/salario";
import { useVagas } from "@/hooks/use-vagas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Setor, TipoContrato, Vaga } from "@/types";

const categoriaCores: Record<Setor, string> = {
  Hotelaria: "bg-sky-50 text-sky-700",
  Restaurante: "bg-amber-50 text-amber-700",
  Comércio: "bg-fuchsia-50 text-fuchsia-700",
  Serviços: "bg-indigo-50 text-indigo-700",
};

/**
 * Listagem pública de vagas (`/vagas`).
 *
 * Lê diretamente da tabela `vagas` do Supabase através do hook `useVagas`,
 * que cai para os dados de exemplo quando o banco está vazio ou indisponível.
 * Não exige login — é a página usada nos links de divulgação.
 */
export default function VagasPage() {
  const { vagas, fonte, carregando, erroConexao, recarregar } = useVagas();
  const [busca, setBusca] = useState("");
  const [setor, setSetor] = useState<Setor | "Todos">("Todos");
  const [regime, setRegime] = useState<TipoContrato | "Todos">("Todos");
  const [escala, setEscala] = useState<string>("Todos");
  const [salarioMin, setSalarioMin] = useState("");

  const vagasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const minimo = salarioMin.trim() ? Number(salarioMin) : null;
    return vagas.filter((vaga) => {
      const casaSetor = setor === "Todos" || vaga.categoria === setor;
      if (!casaSetor) return false;
      const casaRegime = regime === "Todos" || vaga.tipoContrato === regime;
      if (!casaRegime) return false;
      const casaEscala = escala === "Todos" || (vaga.escala ?? "") === escala;
      if (!casaEscala) return false;
      if (minimo !== null) {
        const valor = extrairSalarioNumero(vaga.salario);
        if (valor === null || valor < minimo) return false;
      }
      if (!termo) return true;
      return [vaga.titulo, vaga.empresa, vaga.bairro, vaga.descricao]
        .join(" ")
        .toLowerCase()
        .includes(termo);
    });
  }, [vagas, busca, setor, regime, escala, salarioMin]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vagas abertas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Oportunidades de trabalho em Balneário Camboriú publicadas pelas empresas
            parceiras do Capacita RH.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void recarregar()}>
          <RefreshCw className={cn("h-3.5 w-3.5", carregando && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Origem dos dados */}
      {carregando ? (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin" /> Carregando vagas do Supabase...
        </div>
      ) : fonte === "supabase" ? (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm text-teal-800">
          <Database className="h-4 w-4" /> {vagas.length} vaga(s) carregada(s) da tabela{" "}
          <code className="rounded bg-white/70 px-1">vagas</code>.
        </div>
      ) : (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Exibindo vagas de exemplo.{" "}
            {erroConexao
              ? `Não foi possível ler o banco: ${erroConexao}`
              : "Nenhuma vaga ativa cadastrada ainda."}
          </span>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cargo, empresa ou bairro"
            className="pl-9"
            aria-label="Buscar vagas"
          />
        </div>
        <div className="inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-sm">
          {(["Todos", ...SETORES] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => setSetor(opcao)}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors",
                setor === opcao
                  ? "bg-teal-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {opcao}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros adicionais: regime, escala e faixa salarial */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={regime}
          onChange={(e) => setRegime(e.target.value as TipoContrato | "Todos")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
          aria-label="Filtrar por regime"
        >
          <option value="Todos">Todos os regimes</option>
          {REGIMES_CONTRATO.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={escala}
          onChange={(e) => setEscala(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
          aria-label="Filtrar por escala"
        >
          <option value="Todos">Todas as escalas</option>
          {ESCALAS.map((esc) => (
            <option key={esc} value={esc}>
              {esc}
            </option>
          ))}
        </select>

        <Input
          type="number"
          min={0}
          value={salarioMin}
          onChange={(e) => setSalarioMin(e.target.value)}
          placeholder="Salário mínimo (R$)"
          className="w-full sm:w-48"
          aria-label="Filtrar por salário mínimo"
        />
      </div>

      {vagasFiltradas.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="font-medium text-slate-900">Nenhuma vaga encontrada</p>
          <p className="mt-1 text-sm text-slate-500">
            Tente outro termo de busca ou selecione outro setor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vagasFiltradas.map((vaga) => (
            <VagaPublicaCard key={vaga.id} vaga={vaga} />
          ))}
        </div>
      )}
    </div>
  );
}

function VagaPublicaCard({ vaga }: { vaga: Vaga }) {
  return (
    <Link
      href={`/vagas/${vaga.id}`}
      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-900">{vaga.titulo}</h2>
            <p className="text-sm text-slate-500">
              {vaga.confidencial ? "Empresa Confidencial" : vaga.empresa}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${categoriaCores[vaga.categoria]}`}
          >
            {vaga.categoria}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-slate-600">{vaga.descricao}</p>

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
            <Sparkles className="h-3 w-3" /> Aceita candidatos em capacitação
          </p>
        )}
      </div>

      <span className="mt-5 inline-flex items-center gap-1.5 border-t border-slate-100 pt-4 text-sm font-medium text-teal-700">
        Ver detalhes da vaga <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
