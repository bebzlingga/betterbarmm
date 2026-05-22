"use client";

import { ArrowRight } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-[var(--ink)] bg-[var(--paper)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="hidden py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink-3)] md:flex md:flex-wrap md:items-center md:justify-between md:gap-3">
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

        <div className="flex items-center justify-between gap-4 border-b border-[var(--rule)] py-3 sm:block sm:py-0">
          <h1 className="num min-w-0 text-xl! font-extrabold leading-none tracking-normal min-[380px]:text-2xl! sm:py-4 sm:text-5xl! lg:text-6xl!">
            The <span className="text-[var(--accent)]">{brand}</span> Budget
            Portal
          </h1>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close budget navigation menu" : "Open budget navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="budget-mobile-menu"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--rule)] text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--paper-2)] sm:hidden"
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
          className={`grid overflow-hidden border-[var(--rule-soft)] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition-[grid-template-rows,opacity,margin,padding,border-width] duration-200 sm:hidden ${
            isMenuOpen ? "mt-4 grid-rows-[1fr] border-t pt-4 opacity-100" : "mt-0 grid-rows-[0fr] border-t-0 pt-0 opacity-0"
          }`}
          aria-label="Budget mobile navigation"
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-3">
              {primaryItems.map((item) => {
                const isActive = item.label === activeItem;

                return (
                  <Link
                    key={`mobile-primary-${item.href}`}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block border-b border-[var(--rule-soft)] pb-3 hover:text-[var(--accent)] ${isActive ? "font-bold text-[var(--ink)]" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {storyItems.map((item) => {
                const isActive = item.label === activeItem;

                return (
                  <Link
                    key={`mobile-story-${item.href}`}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between gap-3 border-b border-[var(--rule-soft)] pb-3 hover:text-[var(--accent)] last:border-b-0 ${isActive ? "font-bold text-[var(--ink)]" : ""}`}
                  >
                    {item.label}
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="flex flex-col gap-0 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-between sm:gap-x-8">
          <nav
            aria-label="Budget primary navigation"
            className="hidden max-w-full gap-0 overflow-x-auto text-[11px] font-normal uppercase tracking-[0.1em] text-[var(--ink-3)] sm:flex"
          >
            {primaryItems.map((item) => {
              const isActive = item.label === activeItem;

              return (
                <Link
                  key={`desktop-primary-${item.href}`}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`shrink-0 px-3 py-2.5 font-medium transition sm:px-4 ${isActive ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-transparent hover:text-[var(--accent)]"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <nav
            aria-label="Budget story navigation"
            className="hidden max-w-full items-center gap-6 overflow-x-auto py-2.5 text-[11px] font-normal uppercase tracking-[0.1em] text-[var(--ink-3)] sm:flex md:gap-8"
          >
            {storyItems.map((item) => {
              const isActive = item.label === activeItem;

              return (
                <Link
                  key={`desktop-story-${item.href}`}
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
