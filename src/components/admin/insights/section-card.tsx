import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SectionCard({
  titulo,
  descricao,
  icon: Icon,
  action,
  children,
  className,
}: {
  titulo: string;
  descricao?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className ?? ""}`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Icon className="h-4.5 w-4.5" />
            </span>
          )}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{titulo}</h2>
            {descricao && <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{descricao}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
