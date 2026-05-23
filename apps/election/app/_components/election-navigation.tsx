"use client";

import { useState } from "react";

export type ElectionNavItem = "overview" | "about" | "how" | "candidates";

type ElectionNavigationProps = {
  activeItem?: ElectionNavItem;
};

const navItems = [
  { key: "overview", label: "Election", href: "/" },
  { key: "candidates", label: "Candidates", href: "/candidates" },
  { key: "how", label: "How it works", href: "/how-it-works" },
  { key: "about", label: "About", href: "/about" },
] as const;

export function ElectionNavigation({
  activeItem = "overview",
}: ElectionNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinkClass = (item: ElectionNavItem) =>
    `block hover:text-[var(--accent)] ${
      activeItem === item ? "font-bold text-[var(--ink)]" : ""
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ink)] bg-[var(--paper)]">
      <div className="mx-auto max-w-7xl px-6 pb-3 pt-2 sm:px-8">
        <div className="mb-3 hidden border-b border-[var(--rule-soft)] pb-2 font-mono text-[10px] font-semibold uppercase leading-5 tracking-[0.18em] text-[var(--ink-3)] md:flex md:items-center md:justify-between md:gap-4">
          <a
            href="https://betterbarmm.com"
            className="w-fit transition hover:text-[var(--accent)]"
          >
            betterbarmm.com
          </a>
          <a
            href="mailto:support@betterbarmm.com"
            className="w-fit transition hover:text-[var(--accent)]"
          >
            support@betterbarmm.com
          </a>
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
            <a
              href="/"
              className="hidden border-l border-[var(--rule)] pl-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-3)] transition hover:text-[var(--accent)] sm:block"
              onClick={() => setIsMenuOpen(false)}
            >
              Election
            </a>
          </div>

          <nav className="hidden items-center justify-end gap-5 font-mono text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)] md:flex lg:gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                className={navLinkClass(item.key)}
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="election-mobile-menu"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-8 w-8 items-center justify-center border border-[var(--rule)] text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--paper-2)] md:hidden"
          >
            <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
            <span
              aria-hidden="true"
              className="flex h-3 w-4 flex-col justify-between"
            >
              <span
                className={`block h-px bg-current transition ${
                  isMenuOpen ? "translate-y-[5.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px bg-current transition ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-px bg-current transition ${
                  isMenuOpen ? "-translate-y-[5.5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        <nav
          id="election-mobile-menu"
          className={`grid overflow-hidden border-[var(--rule-soft)] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition-[grid-template-rows,opacity,margin,padding,border-width] duration-200 md:hidden ${
            isMenuOpen
              ? "mt-4 grid-rows-[1fr] border-t pt-4 opacity-100"
              : "mt-0 grid-rows-[0fr] border-t-0 pt-0 opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  className={`${navLinkClass(item.key)} border-b border-[var(--rule-soft)] pb-3 last:border-b-0`}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
