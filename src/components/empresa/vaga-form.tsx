"use client";

import { FormEvent, useState } from "react";
import { Briefcase, Database, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SETORES, ESCALAS, REGIMES_CONTRATO, periodoParaTipoContrato } from "@/lib/constants";
import { trilhas } from "@/lib/mock-data";
import type { Empresa, Setor, TipoContrato, Vaga } from "@/types";

/** Resultado de uma tentativa de publicar a vaga (Supabase ou fallback local). */
export interface ResultadoPublicacao {
  vaga: Vaga;
  gravadoEm: "supabase" | "local";
  erro?: string | null;
}

export function VagaForm({
  empresa,
  onPublicar,
  onPublicada,
}: {
  empresa: Empresa;
  onPublicar: (
    vaga: Omit<Vaga, "id" | "criadoEm" | "origem">
  ) => Promise<ResultadoPublicacao>;
  /** Chamado com a vaga recém-criada (ex.: para abrir o modal de divulgação). */
  onPublicada: (vaga: Vaga) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [setor, setSetor] = useState<Setor>(empresa.setor);
  const [regime, setRegime] = useState<TipoContrato>(periodoParaTipoContrato(empresa.periodo));
  const [escala, setEscala] = useState("");
  const [confidencial, setConfidencial] = useState(false);
  const [salario, setSalario] = useState("");
  const [aceitaCapacitacao, setAceitaCapacitacao] = useState(true);
  const [trilhaRequeridaId, setTrilhaRequeridaId] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [avisoFallback, setAvisoFallback] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!titulo.trim() || !salario.trim()) {
      setErro("Preencha o título do cargo e o salário aproximado.");
      return;
    }

    setErro(null);
    setAvisoFallback(null);
    setEnviando(true);

    const resultado = await onPublicar({
      titulo: titulo.trim(),
      empresa: empresa.nome,
      empresaId: empresa.id,
      categoria: setor,
      bairro: "Balneário Camboriú",
      tipoContrato: regime,
      cargaHoraria: "A combinar",
      salario: salario.trim(),
      descricao: `Vaga de ${titulo.trim()} no setor de ${setor}, publicada por ${empresa.nome}.`,
      requisitos: [],
      trilhaRequeridaId,
      aceitaCapacitacao,
      escala: escala || undefined,
      confidencial,
    });

    setEnviando(false);

    if (resultado.gravadoEm === "local") {
      setAvisoFallback(
        `A vaga foi criada, mas não chegou ao banco de dados (${resultado.erro ?? "erro de conexão"}). ` +
          "Ela está salva apenas neste navegador — confira o RLS e as colunas em supabase/schema.sql."
      );
    }

    setTitulo("");
    setSalario("");
    setTrilhaRequeridaId("");
    setAceitaCapacitacao(true);
    setEscala("");
    setConfidencial(false);
    onPublicada(resultado.vaga);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <Briefcase className="h-6 w-6" />
        </span>
        <div>
          <h2 className="font-semibold text-slate-900">Publicar nova vaga</h2>
          <p className="text-sm text-slate-500">
            Publicando como <span className="font-medium text-slate-700">{empresa.nome}</span>.
            A vaga é gravada na tabela <code className="rounded bg-slate-100 px-1">vagas</code> do
            Supabase e aparece imediatamente na listagem pública para os candidatos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="tituloVaga">Título do cargo</Label>
          <Input
            id="tituloVaga"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Auxiliar de Cozinha"
          />
        </div>

        <div>
          <Label htmlFor="setorVaga">Setor</Label>
          <Select
            id="setorVaga"
            value={setor}
            onChange={(e) => setSetor(e.target.value as Setor)}
          >
            {SETORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="regimeVaga">Regime</Label>
          <Select
            id="regimeVaga"
            value={regime}
            onChange={(e) => setRegime(e.target.value as TipoContrato)}
          >
            {REGIMES_CONTRATO.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="escalaVaga">Escala</Label>
          <Select
            id="escalaVaga"
            value={escala}
            onChange={(e) => setEscala(e.target.value)}
          >
            <option value="">A combinar</option>
            {ESCALAS.map((esc) => (
              <option key={esc} value={esc}>
                {esc}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="salarioVaga">Salário aproximado</Label>
          <Input
            id="salarioVaga"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
            placeholder="Ex: R$ 1.600,00 + gorjetas"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="trilhaVaga">Trilha obrigatória vinculada</Label>
          <Select
            id="trilhaVaga"
            value={trilhaRequeridaId}
            onChange={(e) => setTrilhaRequeridaId(e.target.value)}
          >
            <option value="">Nenhuma</option>
            {trilhas.map((trilha) => (
              <option key={trilha.id} value={trilha.id}>
                {trilha.titulo}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="aceitaCapacitacao"
            type="checkbox"
            checked={aceitaCapacitacao}
            onChange={(e) => setAceitaCapacitacao(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <Label htmlFor="aceitaCapacitacao" className="mb-0 cursor-pointer">
            Aceita candidato em capacitação (ainda concluindo a trilha)
          </Label>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="vagaConfidencial"
            type="checkbox"
            checked={confidencial}
            onChange={(e) => setConfidencial(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <Label htmlFor="vagaConfidencial" className="mb-0 cursor-pointer">
            Vaga confidencial (oculta o nome da empresa na listagem pública)
          </Label>
        </div>
      </div>

      {erro && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}

      {avisoFallback && (
        <p className="mt-4 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{avisoFallback}</span>
        </p>
      )}

      <Button type="submit" className="mt-6 w-full" disabled={enviando}>
        <Database className="h-4 w-4" />
        {enviando ? "Gravando no Supabase..." : "Publicar vaga"}
      </Button>
    </form>
  );
}
