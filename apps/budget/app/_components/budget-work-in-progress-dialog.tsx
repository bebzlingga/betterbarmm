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
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-[rgba(22,20,15,0.38)] px-4 py-6 sm:px-5 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-wip-title"
    >
      <div className="w-full max-w-3xl border border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[6px_6px_0_var(--ink)] sm:p-8 sm:shadow-[12px_12px_0_var(--ink)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--rule)] pb-5 sm:gap-6">
          <div>
            <p className="eyebrow">Budget portal notice</p>
            <h2
              id="budget-wip-title"
              className="num mt-2 text-4xl! font-extrabold uppercase leading-none tracking-normal sm:text-6xl!"
            >
              Work in progress.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex size-9 shrink-0 items-center justify-center border border-[var(--ink)] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)] sm:size-10"
            aria-label="Close work in progress notice"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="pt-5 text-sm leading-7 text-[var(--ink-2)] sm:pt-6 sm:text-base">
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
