"use client";

import { FormEvent, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PERIODOS_CONTRATACAO, SETORES } from "@/lib/constants";
import type { Empresa, PeriodoContratacao, Setor } from "@/types";

type Modo = "entrar" | "cadastro";

export function EmpresaAuthForm({
  onEntrar,
  onCadastrar,
}: {
  onEntrar: (email: string, senha: string) => boolean;
  onCadastrar: (dados: Omit<Empresa, "id" | "criadoEm">) => "ok" | "email-em-uso";
}) {
  const [modo, setModo] = useState<Modo>("entrar");
  const [erro, setErro] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [setor, setSetor] = useState<Setor>(SETORES[0]);
  const [contato, setContato] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoContratacao>(PERIODOS_CONTRATACAO[0]);

  function handleEntrar(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !senha) {
      setErro("Informe e-mail e senha.");
      return;
    }
    const ok = onEntrar(email, senha);
    setErro(ok ? null : "E-mail ou senha inválidos.");
  }

  function handleCadastrar(event: FormEvent) {
    event.preventDefault();

    if (!nome.trim() || !email.trim() || !senha || !cnpj.trim() || !contato.trim()) {
      setErro("Preencha razão social, e-mail, senha, CNPJ/MEI e contato.");
      return;
    }
    if (senha.length < 4) {
      setErro("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    const resultado = onCadastrar({
      nome: nome.trim(),
      email: email.trim(),
      senha,
      cnpj: cnpj.trim(),
      setor,
      contato: contato.trim(),
      periodo,
    });

    if (resultado === "email-em-uso") {
      setErro("Já existe uma empresa cadastrada com esse e-mail. Tente entrar.");
      return;
    }
    setErro(null);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-sm">
        <button
          type="button"
          onClick={() => {
            setModo("entrar");
            setErro(null);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 font-medium",
            modo === "entrar" ? "bg-teal-600 text-white" : "text-slate-600"
          )}
        >
          <LogIn className="h-4 w-4" /> Já tenho conta / Entrar
        </button>
        <button
          type="button"
          onClick={() => {
            setModo("cadastro");
            setErro(null);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 font-medium",
            modo === "cadastro" ? "bg-teal-600 text-white" : "text-slate-600"
          )}
        >
          <UserPlus className="h-4 w-4" /> Criar conta
        </button>
      </div>

      {modo === "entrar" ? (
        <form
          onSubmit={handleEntrar}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-slate-900">Entrar como empresa</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="loginEmailEmpresa">E-mail</Label>
              <Input
                id="loginEmailEmpresa"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@suaempresa.com"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="loginSenhaEmpresa">Senha</Label>
              <Input
                id="loginSenhaEmpresa"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>
          {erro && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
          )}
          <Button type="submit" className="mt-6 w-full">
            Entrar
          </Button>
        </form>
      ) : (
        <form
          onSubmit={handleCadastrar}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-slate-900">Cadastrar minha empresa</h2>

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
              <Label htmlFor="cadastroEmailEmpresa">E-mail</Label>
              <Input
                id="cadastroEmailEmpresa"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@suaempresa.com"
                autoComplete="username"
              />
            </div>

            <div>
              <Label htmlFor="cadastroSenhaEmpresa">Senha</Label>
              <Input
                id="cadastroSenhaEmpresa"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                autoComplete="new-password"
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

          <Button type="submit" className="mt-6 w-full">
            Cadastrar empresa
          </Button>
        </form>
      )}
    </div>
  );
}
