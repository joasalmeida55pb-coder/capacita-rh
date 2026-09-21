"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  Database,
  GraduationCap,
  LogOut,
  Pencil,
  RefreshCw,
  TriangleAlert,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trilhas } from "@/lib/mock-data";
import { useVagas } from "@/hooks/use-vagas";
import { useCandidatos } from "@/hooks/use-candidatos";
import { useSessao } from "@/hooks/use-sessao";
import { useTrilhasConcluidas } from "@/hooks/use-trilhas-concluidas";
import { VagaCard } from "@/components/candidato/vaga-card";
import { TrilhaCard } from "@/components/candidato/trilha-card";
import { CadastroForm, type CandidatoCamposEditaveis } from "@/components/candidato/cadastro-form";
import { CandidatoAuthForm } from "@/components/candidato/auth-form";
import { Button } from "@/components/ui/button";
import type { CandidatoPerfil } from "@/types";

type Aba = "vagas" | "trilhas" | "perfil";

export default function CandidatoPage() {
  const { sessao, entrar: entrarSessao, sair: sairSessao, hidratado: sessaoHidratada } =
    useSessao();
  const {
    cadastrar,
    autenticar,
    atualizar,
    buscarPorId,
    emailEmUso,
    hidratado: candidatosHidratado,
  } = useCandidatos();

  const candidatoLogado: CandidatoPerfil | null =
    sessao?.tipo === "candidato" ? buscarPorId(sessao.id) : null;

  if (!sessaoHidratada || !candidatosHidratado) {
    // Evita piscar a tela de login antes de sabermos se já existe sessão salva.
    return <div className="min-h-[70vh]" />;
  }

  if (!sessao || sessao.tipo !== "candidato" || !candidatoLogado) {
    return (
      <CandidatoAuthForm
        onEntrar={(email, senha) => {
          const encontrado = autenticar(email, senha);
          if (!encontrado) return false;
          entrarSessao("candidato", encontrado.id);
          return true;
        }}
        onCadastrar={(dados) => {
          if (emailEmUso(dados.email)) return "email-em-uso";
          const novo = cadastrar(dados);
          if (!novo) return "email-em-uso";
          entrarSessao("candidato", novo.id);
          return "ok";
        }}
      />
    );
  }

  return (
    <CandidatoDashboard
      candidato={candidatoLogado}
      onSalvarPerfil={(dados) => atualizar(candidatoLogado.id, dados)}
      onSair={sairSessao}
    />
  );
}

function CandidatoDashboard({
  candidato,
  onSalvarPerfil,
  onSair,
}: {
  candidato: CandidatoPerfil;
  onSalvarPerfil: (dados: CandidatoCamposEditaveis) => void;
  onSair: () => void;
}) {
  const [aba, setAba] = useState<Aba>("vagas");
  const [trilhaAberta, setTrilhaAberta] = useState<string | null>(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);

  const { vagas, fonte, carregando, erroConexao } = useVagas();
  const { trilhasConcluidasIds, concluirTrilha, estaConcluida } = useTrilhasConcluidas(
    candidato.id
  );

  const vagasOrdenadas = useMemo(() => {
    if (candidato.areasInteresse.length === 0) return vagas;
    const recomendadas = vagas.filter((v) => candidato.areasInteresse.includes(v.categoria));
    const outras = vagas.filter((v) => !candidato.areasInteresse.includes(v.categoria));
    return [...recomendadas, ...outras];
  }, [vagas, candidato.areasInteresse]);

  const trilhasRecomendadasIds = useMemo(() => {
    if (candidato.areasInteresse.length === 0) return new Set<string>();
    const ids = vagas
      .filter((v) => candidato.areasInteresse.includes(v.categoria) && v.trilhaRequeridaId)
      .map((v) => v.trilhaRequeridaId);
    return new Set(ids);
  }, [vagas, candidato.areasInteresse]);

  function irParaTrilha(trilhaId: string) {
    setAba("trilhas");
    setTrilhaAberta(trilhaId);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Olá, {candidato.nomeCompleto.split(" ")[0]}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Aqui estão suas vagas e trilhas recomendadas em Balneário Camboriú.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!editandoPerfil && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditandoPerfil(true);
                setAba("perfil");
              }}
            >
              <Pencil className="h-3.5 w-3.5" /> Editar perfil
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onSair}>
            <LogOut className="h-3.5 w-3.5" /> Sair
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 inline-flex flex-wrap rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-sm">
        <button
          onClick={() => setAba("vagas")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 font-medium",
            aba === "vagas" ? "bg-teal-600 text-white" : "text-slate-600"
          )}
        >
          <Briefcase className="h-4 w-4" /> Vagas ({vagas.length})
        </button>
        <button
          onClick={() => setAba("trilhas")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 font-medium",
            aba === "trilhas" ? "bg-teal-600 text-white" : "text-slate-600"
          )}
        >
          <GraduationCap className="h-4 w-4" /> Trilhas ({trilhas.length})
        </button>
        <button
          onClick={() => {
            setEditandoPerfil(false);
            setAba("perfil");
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 font-medium",
            aba === "perfil" ? "bg-teal-600 text-white" : "text-slate-600"
          )}
        >
          <UserCircle2 className="h-4 w-4" /> Meu Perfil
        </button>
      </div>

      {aba === "vagas" && (
        <>
          {carregando ? (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin" /> Carregando vagas do Supabase...
            </div>
          ) : fonte === "supabase" ? (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm text-teal-800">
              <Database className="h-4 w-4" /> Vagas carregadas da tabela{" "}
              <code className="rounded bg-white/70 px-1">vagas</code> do Supabase.
            </div>
          ) : (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Exibindo vagas de exemplo.{" "}
                {erroConexao
                  ? `Não foi possível ler o banco: ${erroConexao}`
                  : "Nenhuma vaga ativa cadastrada no banco ainda."}
              </span>
            </div>
          )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vagasOrdenadas.map((vaga) => (
            <VagaCard
              key={vaga.id}
              vaga={vaga}
              trilhaConcluida={estaConcluida(vaga.trilhaRequeridaId)}
              recomendada={candidato.areasInteresse.includes(vaga.categoria)}
              onIrParaTrilha={irParaTrilha}
            />
          ))}
        </div>
        </>
      )}

      {aba === "trilhas" && (
        <div className="space-y-4">
          {trilhas.map((trilha) => (
            <TrilhaCard
              key={trilha.id}
              trilha={trilha}
              concluida={trilhasConcluidasIds.includes(trilha.id)}
              recomendada={trilhasRecomendadasIds.has(trilha.id)}
              aberta={trilhaAberta === trilha.id}
              onToggle={() =>
                setTrilhaAberta((atual) => (atual === trilha.id ? null : trilha.id))
              }
              onConcluir={() => concluirTrilha(trilha.id)}
            />
          ))}
        </div>
      )}

      {aba === "perfil" &&
        (editandoPerfil ? (
          <CadastroForm
            perfilAtual={candidato}
            onSalvar={(dados) => {
              onSalvarPerfil(dados);
              setEditandoPerfil(false);
              setAba("vagas");
            }}
          />
        ) : (
          <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Meu perfil</h2>
              <Button variant="outline" size="sm" onClick={() => setEditandoPerfil(true)}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Nome completo</dt>
                <dd className="font-medium text-slate-900">{candidato.nomeCompleto}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">E-mail</dt>
                <dd className="font-medium text-slate-900">{candidato.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">WhatsApp</dt>
                <dd className="font-medium text-slate-900">{candidato.whatsapp}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Bairro</dt>
                <dd className="font-medium text-slate-900">{candidato.bairro}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Situação atual</dt>
                <dd className="font-medium text-slate-900">{candidato.situacaoAtual}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Disponibilidade</dt>
                <dd className="font-medium text-slate-900">
                  {candidato.disponibilidade.join(", ")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Áreas de interesse</dt>
                <dd className="text-right font-medium text-slate-900">
                  {candidato.areasInteresse.join(", ")}
                </dd>
              </div>
            </dl>
          </div>
        ))}
    </div>
  );
}
