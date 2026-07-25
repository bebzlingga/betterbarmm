"use client";

import { useState } from "react";

export type ElectionNavItem = "overview" | "ballot" | "about";

type ElectionNavigationProps = {
  activeItem?: ElectionNavItem;
};

const navItems = [
  { key: "overview", label: "The election", href: "/" },
  { key: "ballot", label: "Your ballot", href: "/ballot" },
  { key: "about", label: "About & sources", href: "/about" },
] as const;

export function ElectionNavigation({
  activeItem = "overview",
}: ElectionNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinkClass = (item: ElectionNavItem) =>
    `block transition hover:text-white ${
      activeItem === item ? "font-bold text-white" : "text-white/80"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-black/20 bg-[var(--accent)] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.13)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.13)_1px,transparent_1px)] bg-[size:72px_72px] sm:bg-[size:96px_96px]"
          style={{
            WebkitMaskImage:
              "radial-gradient(70% 75% at 72% 18%, #000 0%, rgba(0,0,0,0.35) 45%, transparent 74%)",
            maskImage:
              "radial-gradient(70% 75% at 72% 18%, #000 0%, rgba(0,0,0,0.35) 45%, transparent 74%)",
          }}
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 pb-3 pt-1 sm:px-8">
        <div className="mb-2 hidden border-b border-white/20 pb-1.5 font-mono text-[10px] font-black uppercase leading-5 tracking-[0.18em] text-white/75 md:flex md:items-center md:justify-between md:gap-4">
          <a
            href="https://betterbarmm.com"
            className="w-fit transition hover:text-white"
          >
            betterbarmm.com
          </a>
          <a
            href="mailto:support@betterbarmm.com"
            className="w-fit transition hover:text-white"
          >
            support@betterbarmm.com
          </a>
        </div>

        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <a
              href="https://betterbarmm.com"
              className="w-fit shrink-0 text-lg font-black leading-none tracking-[-0.03em] text-white sm:text-2xl"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="bg-white px-1 text-[var(--accent)]">Better</span>
              <span>BARMM</span>
            </a>
            <a
              href="/"
              className="hidden border-l border-white/25 pl-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 transition hover:text-white sm:block"
              onClick={() => setIsMenuOpen(false)}
            >
              Election
            </a>
          </div>

          <nav className="hidden items-center justify-end gap-5 font-mono text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-white/80 md:flex lg:gap-6">
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
            className="inline-flex h-8 w-8 items-center justify-center border border-white/40 text-white transition hover:border-white hover:bg-white/10 md:hidden"
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
          className={`grid overflow-hidden border-white/20 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 transition-[grid-template-rows,opacity,margin,padding,border-width] duration-200 md:hidden ${
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
                  className={`${navLinkClass(item.key)} border-b border-white/15 pb-3 last:border-b-0`}
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
