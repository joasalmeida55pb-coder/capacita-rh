"use client";

import { FormEvent, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_CREDENCIAIS } from "@/lib/constants";

export function LoginForm({
  onEntrar,
}: {
  onEntrar: (email: string, senha: string) => boolean;
}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const ok = onEntrar(email, senha);
    setErro(!ok);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Lock className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-semibold text-slate-900">Capacita Insights</h1>
            <p className="text-sm text-slate-500">Acesso restrito à Prefeitura</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bc.gov.br"
              autoComplete="username"
            />
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>

        {erro && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            E-mail ou senha inválidos. Confira as credenciais de demonstração abaixo.
          </p>
        )}

        <Button type="submit" className="mt-6 w-full">
          Entrar
        </Button>

        <div className="mt-5 flex items-start gap-2 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
          <p>
            Credenciais de demonstração: <br />
            <span className="font-medium text-slate-700">{ADMIN_CREDENCIAIS.email}</span>
            {" / "}
            <span className="font-medium text-slate-700">{ADMIN_CREDENCIAIS.senha}</span>
          </p>
        </div>
      </form>
    </div>
  );
}
