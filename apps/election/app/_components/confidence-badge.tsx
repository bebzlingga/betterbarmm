import { type Confidence, confidenceMeta } from "../_lib/confidence";

const toneClass: Record<Confidence, string> = {
  official: "bg-[var(--positive)] text-white",
  working: "bg-[var(--ochre)] text-white",
  legacy: "bg-[var(--ink-3)] text-white",
  reference: "bg-[var(--slate)] text-white",
};

export function ConfidenceBadge({
  confidence,
  className = "",
}: {
  confidence: Confidence;
  className?: string;
}) {
  const meta = confidenceMeta[confidence];

  return (
    <span
      title={meta.note}
      className={`inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[8px] font-bold uppercase leading-none tracking-[0.14em] ${toneClass[confidence]} ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-white/70"
      />
      {meta.label}
    </span>
  );
}
