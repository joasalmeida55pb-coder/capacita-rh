"use client";

import { FormEvent, useState } from "react";
import { UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SETORES, SITUACOES, TURNOS } from "@/lib/constants";
import { formatarCpf, cpfValido } from "@/lib/cpf";
import { supabase } from "@/lib/supabase";
import type { CandidatoPerfil, SituacaoAtual, Turno, Setor } from "@/types";

export type CandidatoCamposEditaveis = Pick<
  CandidatoPerfil,
  | "nomeCompleto"
  | "whatsapp"
  | "bairro"
  | "situacaoAtual"
  | "disponibilidade"
  | "areasInteresse"
  | "cpf"
  | "curriculoTexto"
  | "curriculoUrl"
>;

/** Edição dos dados de perfil de um candidato já logado (não mexe em e-mail/senha). */
export function CadastroForm({
  perfilAtual,
  onSalvar,
}: {
  perfilAtual: CandidatoPerfil;
  onSalvar: (dados: CandidatoCamposEditaveis) => void;
}) {
  const [nomeCompleto, setNomeCompleto] = useState(perfilAtual.nomeCompleto);
  const [whatsapp, setWhatsapp] = useState(perfilAtual.whatsapp);
  const [bairro, setBairro] = useState(perfilAtual.bairro);
  const [cpf, setCpf] = useState(perfilAtual.cpf ?? "");
  const [curriculoTexto, setCurriculoTexto] = useState(perfilAtual.curriculoTexto ?? "");
  const [curriculoUrl, setCurriculoUrl] = useState(perfilAtual.curriculoUrl ?? "");
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const [situacaoAtual, setSituacaoAtual] = useState<SituacaoAtual>(perfilAtual.situacaoAtual);
  const [disponibilidade, setDisponibilidade] = useState<Turno[]>(perfilAtual.disponibilidade);
  const [areasInteresse, setAreasInteresse] = useState<Setor[]>(perfilAtual.areasInteresse);
  const [erro, setErro] = useState<string | null>(null);

  async function enviarArquivoCurriculo(arquivo: File) {
    if (!supabase) return;
    setEnviandoArquivo(true);
    const nomeArquivo = `${perfilAtual.email || "candidato"}-${Date.now()}-${arquivo.name}`.replace(/\s+/g, "-");
    const { error } = await supabase.storage.from("curriculos").upload(nomeArquivo, arquivo, {
      upsert: true,
    });
    if (!error) {
      const { data } = supabase.storage.from("curriculos").getPublicUrl(nomeArquivo);
      if (data?.publicUrl) setCurriculoUrl(data.publicUrl);
    }
    setEnviandoArquivo(false);
  }

  function alternarTurno(turno: Turno) {
    setDisponibilidade((atual) =>
      atual.includes(turno) ? atual.filter((t) => t !== turno) : [...atual, turno]
    );
  }

  function alternarArea(area: Setor) {
    setAreasInteresse((atual) =>
      atual.includes(area) ? atual.filter((a) => a !== area) : [...atual, area]
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!nomeCompleto.trim() || !whatsapp.trim() || !bairro.trim()) {
      setErro("Preencha nome completo, WhatsApp e bairro para continuar.");
      return;
    }
    if (cpf.trim() && !cpfValido(cpf)) {
      setErro("CPF inválido — confira os números digitados (ou deixe em branco).");
      return;
    }
    if (disponibilidade.length === 0) {
      setErro("Selecione ao menos um turno de disponibilidade.");
      return;
    }
    if (areasInteresse.length === 0) {
      setErro("Selecione ao menos uma área de interesse.");
      return;
    }

    setErro(null);
    onSalvar({
      nomeCompleto: nomeCompleto.trim(),
      whatsapp: whatsapp.trim(),
      bairro: bairro.trim(),
      cpf: cpf.trim() || undefined,
      curriculoTexto: curriculoTexto.trim() || undefined,
      curriculoUrl: curriculoUrl.trim() || undefined,
      situacaoAtual,
      disponibilidade,
      areasInteresse,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <UserCircle2 className="h-6 w-6" />
        </span>
        <div>
          <h2 className="font-semibold text-slate-900">Editar meu perfil</h2>
          <p className="text-sm text-slate-500">
            Seus dados de acesso (e-mail e senha) não mudam aqui.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="nomeCompleto">Nome completo</Label>
          <Input
            id="nomeCompleto"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            placeholder="Ex: Maria da Silva"
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(47) 99999-0000"
            inputMode="tel"
          />
        </div>

        <div>
          <Label htmlFor="bairro">Bairro em Balneário Camboriú</Label>
          <Input
            id="bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Ex: Centro, Barra Sul..."
          />
        </div>

        <div>
          <Label htmlFor="cpfPerfil">CPF (opcional)</Label>
          <Input
            id="cpfPerfil"
            value={cpf}
            onChange={(e) => setCpf(formatarCpf(e.target.value))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="curriculoTexto">Currículo (texto)</Label>
          <textarea
            id="curriculoTexto"
            value={curriculoTexto}
            onChange={(e) => setCurriculoTexto(e.target.value)}
            rows={5}
            placeholder="Experiências, cursos e qualificações — pode colar o texto do seu currículo aqui."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="curriculoArquivo">Currículo (arquivo PDF ou DOCX)</Label>
          <input
            id="curriculoArquivo"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) void enviarArquivoCurriculo(arquivo);
            }}
            className="block w-full text-sm text-slate-600"
          />
          {enviandoArquivo && <p className="mt-1 text-xs text-slate-500">Enviando arquivo…</p>}
          {curriculoUrl && !enviandoArquivo && (
            <p className="mt-1 text-xs text-teal-700">
              Arquivo enviado:{" "}
              <a href={curriculoUrl} target="_blank" rel="noreferrer" className="underline">
                ver currículo
              </a>
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="situacaoAtual">Situação atual</Label>
          <Select
            id="situacaoAtual"
            value={situacaoAtual}
            onChange={(e) => setSituacaoAtual(e.target.value as SituacaoAtual)}
          >
            {SITUACOES.map((situacao) => (
              <option key={situacao} value={situacao}>
                {situacao}
              </option>
            ))}
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Label>Disponibilidade de turnos</Label>
          <div className="flex flex-wrap gap-2">
            {TURNOS.map((turno) => {
              const selecionado = disponibilidade.includes(turno);
              return (
                <button
                  key={turno}
                  type="button"
                  onClick={() => alternarTurno(turno)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    selecionado
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {turno}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label>Áreas de interesse</Label>
          <div className="flex flex-wrap gap-2">
            {SETORES.map((area) => {
              const selecionado = areasInteresse.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => alternarArea(area)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    selecionado
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {erro && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}

      <Button type="submit" className="mt-6 w-full">
        Salvar alterações
      </Button>
    </form>
  );
}
