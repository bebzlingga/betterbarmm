/** The BARMM verdict as a small tag, its strength told by fill and weight, not by colour alone. */
export function VerdictTag({ verdict }: { verdict: string }) {
	const style =
		verdict === 'Ready to adapt'
			? 'border-[var(--accent)] bg-[var(--accent)] text-white'
			: verdict === 'Take the idea, not the text'
				? 'border-[var(--rule)] text-[var(--ink-3)]'
				: 'border-[var(--accent)] text-[var(--accent)]'
	return <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.71875rem] font-semibold ${style}`}>{verdict}</span>
}

/** What each verdict means, in a line, as a condition on the reader's LGU rather than a promise about it. */
export const VERDICT_MEANS: Record<string, string> = {
	'Ready to adapt': 'If your LGU has the offices it names, it needs little more than re-citing the law and renaming offices.',
	'Adapt with changes': 'A sound model, but expect to rework its offices, rates, penalties or legal bases to fit your LGU.',
	'Take the idea, not the text': 'Too tied to its LGU, too old or too incomplete to copy. Borrow the approach and draft afresh.',
}
