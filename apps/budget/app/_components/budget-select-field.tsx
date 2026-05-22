"use client";

import { ChevronDown } from "lucide-react";
import { type ComponentPropsWithoutRef } from "react";

export type BudgetSelectOption = {
  value: string;
  label: string;
};

export type BudgetSelectGroup = {
  label: string;
  options: BudgetSelectOption[];
};

type BudgetSelectFieldProps = Omit<
  ComponentPropsWithoutRef<"select">,
  "children"
> & {
  id: string;
  label: string;
  groups: BudgetSelectGroup[];
  placeholder?: string;
  wrapperClassName?: string;
  selectClassName?: string;
};

export function BudgetSelectField({
  id,
  label,
  groups,
  placeholder,
  wrapperClassName = "",
  selectClassName = "",
  ...selectProps
}: BudgetSelectFieldProps) {
  return (
    <label htmlFor={id} className={`relative block ${wrapperClassName}`}>
      <span className="sr-only">{label}</span>
      <select
        id={id}
        className={`h-12 w-full min-w-0 appearance-none border border-[var(--ink)] bg-[var(--paper)] py-0 pl-4 pr-10 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] sm:pr-12 sm:text-[12px] sm:tracking-[0.12em] ${selectClassName}`}
        {...selectProps}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink)] sm:right-4 sm:size-4"
        aria-hidden="true"
      />
    </label>
  );
}
