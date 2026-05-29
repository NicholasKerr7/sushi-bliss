import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}

export function SectionHeader({ eyebrow, title, copy, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--sb-gold)]">{eyebrow}</p>
        <h2 className="editorial-title mt-2 text-3xl text-white sm:text-4xl">{title}</h2>
        {copy ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sb-muted)]">{copy}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
