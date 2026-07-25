// Standalone, dependency-free trust model so client components can use it
// without pulling the full election dataset into their bundle.

export type Confidence = "official" | "working" | "legacy" | "reference";

export const confidenceMeta: Record<
  Confidence,
  { label: string; note: string }
> = {
  official: {
    label: "Official",
    note: "From an official COMELEC certified list or statute.",
  },
  working: {
    label: "Working",
    note: "Working record pending official verification.",
  },
  legacy: {
    label: "Legacy",
    note: "Legacy reference data, not a final 2026 record.",
  },
  reference: {
    label: "Reference",
    note: "Secondary background reference, individually sourced.",
  },
};
