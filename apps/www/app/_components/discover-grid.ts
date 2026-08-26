/**
 * Row packing for the six-column grid of lead cards at the top of a chapter.
 *
 * The number of cards is whatever the edit produced, not a multiple of
 * anything: Government has 4 and Culture & Places has 5. Walking a fixed
 * pattern leaves the last row short, which reads as the layout having fallen
 * over rather than as an edge. So the pattern runs until the final row, and
 * that row shares its six columns out across whatever is left.
 */

/** Column widths per row. Every row sums to six; the cycle repeats. */
const ROW_PATTERN = [
	[3, 3],
	[2, 2, 2],
	[4, 2],
] as const

/**
 * Tailwind scans source text for whole class names, so the spans have to appear
 * literally somewhere it can see them rather than being built by interpolation.
 */
export const COL_SPAN: Record<number, string> = {
	1: 'md:col-span-1',
	2: 'md:col-span-2',
	3: 'md:col-span-3',
	4: 'md:col-span-4',
	5: 'md:col-span-5',
	6: 'md:col-span-6',
}

/**
 * Column spans for exactly `count` items, packed so every row fills.
 *
 * Four items come out as two rows of two; five as a row of two and a row of
 * three; twelve as the full pattern twice. The remainder in the last row goes
 * to the leftmost items, so any odd column lands early rather than leaving one
 * runt at the end.
 */
export function packRows(count: number): number[] {
	const spans: number[] = []
	let row = 0

	while (spans.length < count) {
		const pattern = ROW_PATTERN[row % ROW_PATTERN.length]
		const remaining = count - spans.length

		if (remaining <= pattern.length) {
			const base = Math.floor(6 / remaining)
			const extra = 6 % remaining
			for (let i = 0; i < remaining; i++) spans.push(base + (i < extra ? 1 : 0))
			break
		}

		spans.push(...pattern)
		row++
	}

	return spans
}
