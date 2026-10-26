import type { Icon } from "@phosphor-icons/react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

/* The pieces every dashboard page is built from, so each page says what it
   is in the same place and the same way. Server components throughout. */

export type Crumb = { label: string; href?: string };

export function PageHeader({
  crumbs,
  title,
  description,
  actions,
  children,
}: {
  crumbs?: Crumb[];
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      {crumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-[var(--ink-3)]">
          {crumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              {i ? <CaretRightIcon size={11} className="text-[var(--ink-mute)]" aria-hidden="true" /> : null}
              {c.href ? (
                <Link href={c.href} className="hover:text-[var(--ink)]">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.625rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)]">{title}</h1>
          {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--ink-3)]">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}

const TONES = {
  neutral: "bg-[var(--surface-3)] text-[var(--ink-2)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
  good: "bg-[var(--good-soft)] text-[var(--good)]",
  warn: "bg-[var(--warn-soft)] text-[var(--warn)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
} as const;

export type Tone = keyof typeof TONES;

export function StatCard({
  icon: Glyph,
  label,
  value,
  hint,
  href,
  tone = "neutral",
}: {
  icon: Icon;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  tone?: Tone;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[0.8125rem] font-medium text-[var(--ink-3)]">{label}</p>
        <span className={`grid size-8 place-items-center rounded-lg ${TONES[tone]}`}>
          <Glyph size={16} weight="bold" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-[family-name:var(--font-display)] text-[1.75rem] font-semibold tabular-nums leading-none tracking-[-0.02em]">{value}</p>
      {hint ? <p className="mt-2 text-xs text-[var(--ink-3)]">{hint}</p> : null}
    </>
  );
  const cls = "panel block p-5";
  return href ? (
    <Link href={href} className={`${cls} transition hover:-translate-y-px hover:shadow-[var(--shadow-md)]`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function EmptyState({ icon: Glyph, title, children }: { icon: Icon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--ink-3)]">
        <Glyph size={20} aria-hidden="true" />
      </span>
      <p className="mt-4 font-[family-name:var(--font-display)] text-[0.9375rem] font-semibold">{title}</p>
      {children ? <div className="mt-1.5 max-w-sm text-sm leading-6 text-[var(--ink-3)]">{children}</div> : null}
    </div>
  );
}

export function Pagination({ page, pages, href, newer = "Previous", older = "Next" }: { page: number; pages: number; href: (n: number) => string; newer?: string; older?: string }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-5 flex items-center justify-between text-[0.8125rem]" aria-label="Pages">
      <span className="text-[var(--ink-3)]">
        Page <span className="font-semibold text-[var(--ink)]">{page.toLocaleString()}</span> of {pages.toLocaleString()}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className="btn btn-secondary btn-sm">
            <CaretLeftIcon size={12} weight="bold" aria-hidden="true" /> {newer}
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={href(page + 1)} className="btn btn-secondary btn-sm">
            {older} <CaretRightIcon size={12} weight="bold" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

/** "3 minutes ago", "yesterday", or a date, for lists of changes. */
export function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 172800) return "yesterday";
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: new Date(iso).getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}

/** Two letters for an avatar from an email or name. */
export function initials(s: string) {
  const name = s.split("@")[0]!.replace(/[._-]+/g, " ").trim();
  const parts = name.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}
