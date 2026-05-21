import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface BudgetNavItem {
  label: string;
  href: string;
}

export interface BudgetNavigationProps {
  brand?: string;
  fiscalYears?: string;
  compiledTotal: string;
  activeItem?: string;
  primaryItems?: BudgetNavItem[];
  storyItems?: BudgetNavItem[];
}

const defaultPrimaryItems: BudgetNavItem[] = [
  { label: "Overview", href: "/" },
  { label: "By Year", href: "/by-year" },
  { label: "Programs", href: "/programs" },
  { label: "Special Provisions", href: "/offices" },
  { label: "Data", href: "/data" },
  { label: "Methodology", href: "/methodology" },
];

const defaultStoryItems: BudgetNavItem[] = [
  { label: "The review", href: "/review" },
  { label: "The future story", href: "/future" },
];

export function BudgetNavigation({
  brand = "BARMM",
  fiscalYears = "2026",
  compiledTotal,
  activeItem = "Overview",
  primaryItems = defaultPrimaryItems,
  storyItems = defaultStoryItems,
}: BudgetNavigationProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--ink)] bg-[var(--paper)]">
      <div className="mx-auto max-w-[1440px] px-5">
        <div className="py-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--ink-3)]">
          <a
            href="https://betterbarmm.com"
            className="transition hover:text-[var(--accent)]"
          >
            betterbarmm.com
          </a>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 tracking-[0.18em]">
            <span>
              {brand} / Fiscal years {fiscalYears}
            </span>
            <span>
              Compiled GAAB <span className="font-bold">{compiledTotal}</span>
            </span>
          </div>
        </div>

        <h1 className="num border-b border-[var(--rule)] pb-6 text-4xl! font-extrabold leading-none tracking-normal sm:text-5xl lg:text-6xl">
          The <span className="text-[var(--accent)]">{brand}</span> Budget
          Portal
        </h1>

        <div className="flex flex-wrap items-stretch justify-between gap-x-8">
          <nav
            aria-label="Budget primary navigation"
            className="flex max-w-full gap-0 overflow-x-auto text-[11px] font-normal uppercase tracking-[0.1em] text-[var(--ink-3)]"
          >
            {primaryItems.map((item) => {
              const isActive = item.label === activeItem;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`font-medium  shrink-0  px-4 py-2.5 transition ${isActive ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-transparent hover:text-[var(--accent)]"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <nav
            aria-label="Budget story navigation"
            className="flex max-w-full items-center gap-6 overflow-x-auto py-2.5 text-[11px] font-normal uppercase tracking-[0.1em] text-[var(--ink-3)] sm:gap-8"
          >
            {storyItems.map((item) => {
              const isActive = item.label === activeItem;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`font-medium inline-flex items-center gap-1.5 hover:text-[var(--accent)] ${isActive ? "text-[var(--accent)]" : ""}`}
                >
                  {item.label}
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
