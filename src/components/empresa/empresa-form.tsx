"use client";

import { FormEvent, useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PERIODOS_CONTRATACAO, SETORES } from "@/lib/constants";
import type { Empresa, PeriodoContratacao, Setor } from "@/types";

export type EmpresaCamposEditaveis = Pick<
  Empresa,
  "nome" | "cnpj" | "setor" | "contato" | "periodo"
>;

/** Edição dos dados cadastrais de uma empresa já logada (não mexe em e-mail/senha). */
export function EmpresaForm({
  empresaAtual,
  onSalvar,
}: {
  empresaAtual: Empresa;
  onSalvar: (dados: EmpresaCamposEditaveis) => void;
}) {
  const [nome, setNome] = useState(empresaAtual.nome);
  const [cnpj, setCnpj] = useState(empresaAtual.cnpj);
  const [setor, setSetor] = useState<Setor>(empresaAtual.setor);
  const [contato, setContato] = useState(empresaAtual.contato);
  const [periodo, setPeriodo] = useState<PeriodoContratacao>(empresaAtual.periodo);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!nome.trim() || !cnpj.trim() || !contato.trim()) {
      setErro("Preencha razão social, CNPJ/MEI e contato para continuar.");
      setSalvo(false);
      return;
    }

    setErro(null);
    onSalvar({ nome: nome.trim(), cnpj: cnpj.trim(), setor, contato: contato.trim(), periodo });
    setSalvo(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <Building2 className="h-6 w-6" />
        </span>
        <div>
          <h2 className="font-semibold text-slate-900">Meus dados</h2>
          <p className="text-sm text-slate-500">
            Seus dados de acesso (e-mail e senha) não mudam aqui.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="nomeEmpresa">Razão Social / Nome Fantasia</Label>
          <Input
            id="nomeEmpresa"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Hotel Marazul Ltda."
          />
        </div>

        <div>
          <Label htmlFor="cnpj">CNPJ / MEI</Label>
          <Input
            id="cnpj"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0001-00"
          />
        </div>

        <div>
          <Label htmlFor="contato">Contato / WhatsApp</Label>
          <Input
            id="contato"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            placeholder="(47) 99999-0000"
            inputMode="tel"
          />
        </div>

        <div>
          <Label htmlFor="setorEmpresa">Setor</Label>
          <Select
            id="setorEmpresa"
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
          <Label htmlFor="periodo">Período de contratação</Label>
          <Select
            id="periodo"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as PeriodoContratacao)}
          >
            {PERIODOS_CONTRATACAO.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {erro && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}
      {salvo && !erro && (
        <p className="mt-4 rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-700">
          Dados atualizados com sucesso!
        </p>
      )}

      <Button type="submit" className="mt-6 w-full">
        Salvar alterações
      </Button>
    </form>
  );
}
