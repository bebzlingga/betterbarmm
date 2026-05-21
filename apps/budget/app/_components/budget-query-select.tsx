"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  BudgetSelectField,
  type BudgetSelectGroup,
  type BudgetSelectOption,
} from "./budget-select-field";

export type BudgetQuerySelectOption = BudgetSelectOption;
export type BudgetQuerySelectGroup = BudgetSelectGroup;

interface BudgetQuerySelectProps {
  id: string;
  name: string;
  label: string;
  value: string;
  groups: BudgetQuerySelectGroup[];
  className?: string;
}

export function BudgetQuerySelect({
  id,
  name,
  label,
  value,
  groups,
  className = "",
}: BudgetQuerySelectProps) {
  const pathname = usePathname();
  const router = useRouter();

  function updateSelection(nextValue: string) {
    const params = new URLSearchParams(window.location.search);

    if (nextValue) {
      params.set(name, nextValue);
    } else {
      params.delete(name);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <BudgetSelectField
      id={id}
      name={name}
      label={label}
      value={value}
      groups={groups}
      selectClassName={className}
      onChange={(event) => updateSelection(event.target.value)}
    />
  );
}
