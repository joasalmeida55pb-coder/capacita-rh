"use client";

import { FormEvent, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SETORES, SITUACOES, TURNOS } from "@/lib/constants";
import type { CandidatoPerfil, SituacaoAtual, Setor, Turno } from "@/types";

type Modo = "entrar" | "cadastro";

export function CandidatoAuthForm({
  onEntrar,
  onCadastrar,
}: {
  onEntrar: (email: string, senha: string) => boolean;
  onCadastrar: (
    dados: Omit<CandidatoPerfil, "id" | "criadoEm">
  ) => "ok" | "email-em-uso";
}) {
  const [modo, setModo] = useState<Modo>("entrar");
  const [erro, setErro] = useState<string | null>(null);

  // Campos comuns
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Campos extras do cadastro
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bairro, setBairro] = useState("");
  const [situacaoAtual, setSituacaoAtual] = useState<SituacaoAtual>(SITUACOES[0]);
  const [disponibilidade, setDisponibilidade] = useState<Turno[]>([]);
  const [areasInteresse, setAreasInteresse] = useState<Setor[]>([]);

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

    if (!nomeCompleto.trim() || !email.trim() || !senha || !whatsapp.trim() || !bairro.trim()) {
      setErro("Preencha nome completo, e-mail, senha, WhatsApp e bairro.");
      return;
    }
    if (senha.length < 4) {
      setErro("A senha deve ter pelo menos 4 caracteres.");
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

    const resultado = onCadastrar({
      nomeCompleto: nomeCompleto.trim(),
      email: email.trim(),
      senha,
      whatsapp: whatsapp.trim(),
      bairro: bairro.trim(),
      situacaoAtual,
      disponibilidade,
      areasInteresse,
    });

    if (resultado === "email-em-uso") {
      setErro("Já existe uma conta de candidato com esse e-mail. Tente entrar.");
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
          <h2 className="mb-4 font-semibold text-slate-900">Entrar como candidato</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="loginEmail">E-mail</Label>
              <Input
                id="loginEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="loginSenha">Senha</Label>
              <Input
                id="loginSenha"
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
          <h2 className="mb-4 font-semibold text-slate-900">Criar minha conta de candidato</h2>

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
              <Label htmlFor="cadastroEmail">E-mail</Label>
              <Input
                id="cadastroEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="username"
              />
            </div>

            <div>
              <Label htmlFor="cadastroSenha">Senha</Label>
              <Input
                id="cadastroSenha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                autoComplete="new-password"
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
            Criar minha conta
          </Button>
        </form>
      )}
    </div>
  );
}
