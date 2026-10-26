"use client";

import {
  ArrowsClockwiseIcon,
  ArticleIcon,
  BuildingsIcon,
  CaretDownIcon,
  CheckSquareOffsetIcon,
  ClockCounterClockwiseIcon,
  CoinsIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  MapTrifoldIcon,
  MegaphoneIcon,
  NewspaperIcon,
  ScrollIcon,
  SirenIcon,
  AddressBookIcon,
  SquaresFourIcon,
  UsersIcon,
  type Icon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavWorkspace = { value: string; label: string; collections: { href: string; label: string }[] };

const WORKSPACE_ICONS: Record<string, Icon> = {
  legislation: ScrollIcon,
  budget: CoinsIcon,
  election: CheckSquareOffsetIcon,
  lgu: BuildingsIcon,
  travel: MapTrifoldIcon,
  accidents: SirenIcon,
  directory: AddressBookIcon,
};

export function Sidebar({
  pending,
  reviewPosts,
  newReports,
  workspaces,
  isAdmin,
  footer,
}: {
  /** Updates waiting for a decision. */
  pending: number;
  /** Social posts waiting for an approver. */
  reviewPosts: number;
  /** Reader error reports not yet closed. */
  newReports: number;
  workspaces: NavWorkspace[];
  isAdmin: boolean;
  /** The signed-in account and its sign-out, rendered on the server. */
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const current = (href: string) => (active(href) ? "page" : undefined);

  const item = (href: string, label: string, Glyph: Icon, badge?: number) => (
    <Link href={href} aria-current={current(href)} className="nav-link">
      <Glyph size={17} weight={active(href) ? "fill" : "regular"} className={active(href) ? "text-[var(--accent)]" : "text-[var(--ink-3)]"} aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {badge ? <span className="pill pill-accent tabular-nums">{badge}</span> : null}
    </Link>
  );

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <div className="space-y-0.5">
          {item("/", "Overview", SquaresFourIcon)}
          {item("/updates", "Updates", ArrowsClockwiseIcon, pending)}
          {item("/social", "Social", MegaphoneIcon, reviewPosts)}
          {item("/reports", "Reports", FlagIcon, newReports)}
          {item("/news", "News", NewspaperIcon)}
          {item("/explainers", "Explainers", ArticleIcon)}
          {item("/activity", "Activity", ClockCounterClockwiseIcon)}
          {item("/search", "Search", MagnifyingGlassIcon)}
        </div>

        <div>
          <p className="eyebrow mb-2 px-2.5">Data</p>
          <div className="space-y-0.5">
            {workspaces.map((w) => {
              const Glyph = WORKSPACE_ICONS[w.value] ?? SquaresFourIcon;
              const open = pathname.startsWith(`/data/${w.value}/`);
              return (
                <details key={w.value} open={open} className="group">
                  <summary className="nav-link cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <Glyph size={17} weight={open ? "fill" : "regular"} className={open ? "text-[var(--accent)]" : "text-[var(--ink-3)]"} aria-hidden="true" />
                    <span className="flex-1">{w.label}</span>
                    <CaretDownIcon size={12} className="text-[var(--ink-mute)] transition group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="ml-[1.15rem] mt-0.5 space-y-0.5 border-l border-[var(--rule)] pl-2.5">
                    {w.collections.map((c) => (
                      <Link key={c.href} href={c.href} aria-current={current(c.href)} className="nav-link !py-1 !text-[0.78125rem]">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        {isAdmin ? (
          <div>
            <p className="eyebrow mb-2 px-2.5">Settings</p>
            {item("/editors", "Editors", UsersIcon)}
          </div>
        ) : null}
      </nav>
      <div className="border-t border-[var(--rule)] p-3">{footer}</div>
    </div>
  );
}
