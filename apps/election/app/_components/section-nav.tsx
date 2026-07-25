"use client";

import { useEffect, useState } from "react";

export type SectionNavItem = { id: string; label: string };

export function SectionNav({ items }: { items: SectionNavItem[] }) {
  const [top, setTop] = useState(0);
  const [active, setActive] = useState(items[0]?.id ?? "");

  // Stick just below the sticky site header, whatever its measured height is.
  useEffect(() => {
    const header = document.querySelector("header");
    const measure = () => setTop(header?.offsetHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <div
      className="sticky z-20 border-b border-[var(--rule)] bg-[var(--paper)]/95 backdrop-blur"
      style={{ top }}
    >
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-8">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`shrink-0 border-b-2 px-3 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition ${
              active === item.id
                ? "border-[var(--accent)] text-[var(--ink)]"
                : "border-transparent text-[var(--ink-3)] hover:text-[var(--accent)]"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
