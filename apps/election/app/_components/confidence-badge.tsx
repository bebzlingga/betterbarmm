import { type Confidence, confidenceMeta } from '../_lib/confidence'

/**
 * How far a record is to be trusted, said in one mark.
 *
 * A dot in the tone, the word beside it, and a hairline around both. The
 * badges used to be solid blocks of colour — four of them in a row read as a
 * chart of something, and on a card they shouted over the name they were
 * qualifying. The record is the loud thing here; this is a footnote to it.
 */
export const confidenceTone: Record<Confidence, string> = {
	official: 'var(--positive)',
	working: 'var(--ochre)',
	legacy: 'var(--ink-3)',
	reference: 'var(--slate)',
}

export function ConfidenceBadge({
	confidence,
	className = '',
}: {
	confidence: Confidence
	className?: string
}) {
	const meta = confidenceMeta[confidence]

	return (
		<span
			title={meta.note}
			className={`inline-flex items-center gap-1.5 border border-[var(--rule)] px-2 py-1 font-mono text-[9px] font-semibold uppercase leading-none tracking-[0.14em] text-[var(--ink-3)] ${className}`}
		>
			<span
				aria-hidden='true'
				className='size-1.5 shrink-0 rotate-45'
				style={{ background: confidenceTone[confidence] }}
			/>
			{meta.label}
		</span>
	)
}
