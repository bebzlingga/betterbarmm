import { peso, pesoShort } from '@betterbarmm/budget-data'

/**
 * A peso figure in a list, rounded the way it is said: "₱49.1 billion".
 *
 * The exact amount the Act prints is a hover away, and it is the figure in every
 * download (user decision, reversing the all-exact rule for lists): a column of
 * seventeen-glyph figures with centavos was hard to scan, and the order of
 * magnitude is what a reader compares down a list. The headline figure at the
 * top of each page stays exact, so the one a reader checks against the Act is
 * printed in full.
 */
export function Money({ amount, className = '' }: { amount: number; className?: string }) {
	return (
		<span title={peso(amount)} className={className}>
			{pesoShort(amount)}
		</span>
	)
}
