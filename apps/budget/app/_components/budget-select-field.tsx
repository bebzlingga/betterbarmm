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
        className={`h-12 w-full appearance-none border border-[var(--ink)] bg-[var(--paper)] py-0 pl-4 pr-12 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] ${selectClassName}`}
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
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[var(--ink)]"
        aria-hidden="true"
      />
    </label>
  );
}
