"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Menu,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const perfilLinks = [
  {
    href: "/vagas",
    label: "Vagas abertas",
    icon: Briefcase,
  },
  {
    href: "/candidato",
    label: "Área do candidato",
    icon: User,
  },
  {
    href: "/empresa",
    label: "Área da empresa",
    icon: Building2,
  },
  {
    href: "/admin",
    label: "Capacita Insights",
    icon: Sparkles,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-slate-900 sm:text-base">
              Capacita RH
            </span>
            <span className="text-[11px] font-medium text-teal-600 sm:text-xs">
              Balneário Camboriú
            </span>
          </span>
        </Link>

        {/* Botões de perfil - desktop */}
        <nav className="hidden items-center gap-2 md:flex">
          {perfilLinks.map(({ href, label, icon: Icon }) => {
            const ativo = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  ativo
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Botão menu mobile */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label="Abrir menu"
        >
          {menuAberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {perfilLinks.map(({ href, label, icon: Icon }) => {
              const ativo = pathname === href || pathname?.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuAberto(false)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    ativo
                      ? "bg-teal-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
