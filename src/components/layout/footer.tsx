"use client";

import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo e descrição */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-white">Capacita RH</span>
                <span className="text-xs font-medium text-teal-400">
                  Balneário Camboriú
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Conectando trabalhadores em entressafra de turismo a empresas
              locais, com qualificação rápida e candidatura direta.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-sm font-semibold text-white">Plataforma</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/candidato" className="hover:text-teal-400">
                  Ver como Candidato
                </Link>
              </li>
              <li>
                <Link href="/empresa" className="hover:text-teal-400">
                  Ver como Empresa
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-teal-400">
                  Painel Sandbox
                </Link>
              </li>
            </ul>
          </div>

          {/* Trilhas */}
          <div>
            <h3 className="text-sm font-semibold text-white">Trilhas de Qualificação</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Comércio e Vendas</li>
              <li>Garçom e Salão</li>
              <li>Turismo e Hospitalidade</li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-semibold text-white">Contato</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-teal-400" />
                Balneário Camboriú, SC
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-teal-400" />
                contato@capacitarh.com.br
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-teal-400" />
                (47) 0000-0000
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {anoAtual} Capacita RH — Sandbox Balneário Camboriú. Projeto piloto de qualificação e empregabilidade.
        </div>
      </div>
    </footer>
  );
}
