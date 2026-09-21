import '../globals.css';
import Link from "next/link";
import { ArrowRight, Briefcase, GraduationCap, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vagas, trilhas } from "@/lib/mock-data";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-600 to-teal-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Capacita RH — Sandbox Balneário Camboriú
            </h1>
            <p className="mt-4 text-base text-teal-50 sm:text-lg">
              Conectamos trabalhadores em entressafra de turismo a empresas
              locais, com trilhas rápidas de qualificação e candidatura
              direta.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/candidato">
                <Button size="lg" className="w-full sm:w-auto">
                  Área do candidato <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/empresa">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Área da empresa
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 sm:w-auto"
                >
                  <Sparkles className="h-4 w-4" />
                  Capacita Insights
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats rápidas */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Briefcase className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900">{vagas.length}</p>
              <p className="text-sm text-slate-500">Vagas ativas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900">{trilhas.length}</p>
              <p className="text-sm text-slate-500">Trilhas de qualificação</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900">3</p>
              <p className="text-sm text-slate-500">Perfis de usuário</p>
            </div>
          </div>
        </div>
      </section>

      {/* Regra de ouro */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-teal-900">
            Regra de ouro do matching
          </h2>
          <p className="mt-2 text-sm text-teal-800">
            Se o candidato atende aos requisitos, ele aplica direto para a
            vaga. Se ainda falta a trilha rápida exigida, a plataforma exibe
            o botão{" "}
            <span className="font-semibold">
              &ldquo;Faça o curso rápido (2h) para liberar sua
              candidatura&rdquo;
            </span>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
