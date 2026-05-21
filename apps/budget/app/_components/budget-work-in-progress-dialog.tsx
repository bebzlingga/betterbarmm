"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function BudgetWorkInProgressDialog() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(22,20,15,0.38)] px-5 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-wip-title"
    >
      <div className="w-full max-w-3xl border border-[var(--ink)] bg-[var(--paper)] p-6 shadow-[12px_12px_0_var(--ink)] sm:p-8">
        <div className="flex items-start justify-between gap-6 border-b border-[var(--rule)] pb-5">
          <div>
            <p className="eyebrow">Budget portal notice</p>
            <h2
              id="budget-wip-title"
              className="num mt-2 text-5xl! font-extrabold uppercase leading-none tracking-normal sm:text-6xl!"
            >
              Work in progress.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex size-10 shrink-0 items-center justify-center border border-[var(--ink)] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            aria-label="Close work in progress notice"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="pt-6 text-base leading-7 text-[var(--ink-2)]">
          <p>
            This budget portal is still under active review. Figures,
            categories, source line mappings, and interpretations are not yet
            final, and cross-checking against the official GAAB source documents
            is ongoing.
          </p>
          <p className="mt-5!">
            If you spot an issue or have a suggestion, contact{" "}
            <a
              href="mailto:support@betterbarmm.com"
              className="rule-link"
            >
              support@betterbarmm.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
