"use client";

import Link from "next/link";
import { useState } from "react";

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

export function BudgetNavigation({
  brand = "BARMM",
  fiscalYears = "2026",
  compiledTotal,
  activeItem = "Overview",
  primaryItems = defaultPrimaryItems,
}: BudgetNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigationItems = primaryItems;
  const navLinkClass = (item: BudgetNavItem) =>
    `block hover:text-[var(--accent)] ${
      item.label === activeItem ? "font-bold text-[var(--ink)]" : ""
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ink)] bg-[var(--paper)]">
      <div className="mx-auto max-w-7xl px-6 pb-3 pt-2 sm:px-8">
        <div className="mb-3 hidden border-b border-[var(--rule-soft)] pb-2 text-[10px] font-semibold uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)] md:flex md:items-center md:justify-between md:gap-4">
          <a
            href="https://betterbarmm.com"
            className="w-fit transition hover:text-[var(--accent)]"
          >
            betterbarmm.com
          </a>
          <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 text-right">
            <span>
              {brand} / Fiscal years {fiscalYears}
            </span>
            <span>
              Compiled GAAB <span className="font-bold">{compiledTotal}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <a
              href="https://betterbarmm.com"
              className="w-fit shrink-0 text-lg font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)] sm:text-2xl"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="bg-[var(--accent)] px-1 text-white">Better</span>
              <span>BARMM</span>
            </a>
            <Link
              href="/"
              className="hidden border-l border-[var(--rule)] pl-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)] transition hover:text-[var(--accent)] sm:block"
              onClick={() => setIsMenuOpen(false)}
            >
              Budget
            </Link>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-4 overflow-x-auto whitespace-nowrap text-[11px] font-semibold uppercase leading-5 tracking-[0.1em] text-[var(--ink-3)] md:flex lg:gap-6">
            {navigationItems.map((item) => {
              const isActive = item.label === activeItem;

              return (
                <Link
                  key={`desktop-${item.href}`}
                  className={navLinkClass(item)}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close budget navigation menu" : "Open budget navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="budget-mobile-menu"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--rule)] text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--paper-2)] md:hidden"
          >
            <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
            <span
              aria-hidden="true"
              className="flex h-3 w-4 flex-col justify-between"
            >
              <span className={`block h-px bg-current transition ${isMenuOpen ? "translate-y-[5.5px] rotate-45" : ""}`} />
              <span className={`block h-px bg-current transition ${isMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px bg-current transition ${isMenuOpen ? "-translate-y-[5.5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>

        <nav
          id="budget-mobile-menu"
          className={`grid overflow-hidden border-[var(--rule-soft)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)] transition-[grid-template-rows,opacity,margin,padding,border-width] duration-200 md:hidden ${
            isMenuOpen ? "mt-4 grid-rows-[1fr] border-t pt-4 opacity-100" : "mt-0 grid-rows-[0fr] border-t-0 pt-0 opacity-0"
          }`}
          aria-label="Budget mobile navigation"
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-3">
              {navigationItems.map((item) => {
                const isActive = item.label === activeItem;

                return (
                  <Link
                    key={`mobile-${item.href}`}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className={`${navLinkClass(item)} border-b border-[var(--rule-soft)] pb-3 last:border-b-0`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
