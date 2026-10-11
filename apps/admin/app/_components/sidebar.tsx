"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavGroup = {
  label: string;
  items: { href: string; label: string }[];
};

export function Sidebar({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Admin" className="space-y-6 text-sm">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="eyebrow px-3 text-[var(--ink-mute)]">{group.label}</p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active(item.href) ? "page" : undefined}
                  className={`block rounded-md px-3 py-1.5 ${
                    active(item.href)
                      ? "bg-[var(--ink)] font-semibold text-[var(--paper)]"
                      : "text-[var(--ink-2)] hover:bg-[var(--paper-2)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
