/* ============================================================
   The same office, spelled another way

   The Acts are not consistent about their own offices: the
   interior ministry is printed three ways across seven of them
   and the Wali's office two. Read straight off `trends.json`,
   that is three separate lines for one ministry — three lines on
   a chart, three rows in a table, and three rows in the
   assistant's corpus, none of which carries the office's real
   seven-year total.

   This lived in the budget app, where it joined the lines a
   chart draws. It is here now because the assistant needs the
   same join for the same reason, and a rule about what counts as
   the same office belongs beside the file it is applied to
   rather than in one of the two places that reads it.
   ============================================================ */

export type Series = [year: number, total: number][]

export type Line = { slug: string; name: string; series: Series }

/**
 * A name reduced to the words that identify it.
 *
 * Case, punctuation, plurals and the small words all go: "Ministry of the
 * Interior and Local Government" and "Ministry of Interior and Local
 * Government" both reduce to "ministry interior local government".
 */
const reduce = (name: string) =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9 ]/g, ' ')
		.split(/\s+/)
		.map((word) => (word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word))
		.filter((word) => word && !['the', 'of', 'and', 'for', 's'].includes(word))
		.join(' ')

/**
 * Lines that are one office, joined into one line.
 *
 * Two lines are the same office when their names reduce to the same string, or
 * one reduces to a prefix of the other, AND no year appears in both. The year
 * guard is what makes this safe: the Bangsamoro Information Office and the
 * Bangsamoro Information and Communications Technology Office are a prefix pair
 * and both sit in FY 2023, so they are two offices and stay two lines. A
 * renamed office never overlaps itself.
 *
 * The surviving name is the one from the latest Act that carries the office;
 * the others come back in `was`, because a reader who knows it by the old name
 * has to be able to find it.
 */
export function joinRenames(lines: Line[]): (Line & { was?: string[] })[] {
	const groups: Line[][] = []

	for (const line of lines) {
		const key = reduce(line.name)
		const group = groups.find((one) =>
			one.some((member) => {
				const other = reduce(member.name)
				const sameName = other === key || other.startsWith(`${key} `) || key.startsWith(`${other} `)
				if (!sameName) return false
				const taken = new Set(member.series.map(([year]) => year))
				return line.series.every(([year]) => !taken.has(year))
			}),
		)
		if (group) group.push(line)
		else groups.push([line])
	}

	const newest = (line: Line) => Math.max(...line.series.map(([year]) => year))

	return groups.map((group) => {
		const current = group.reduce((held, one) => (newest(one) > newest(held) ? one : held))
		return {
			...current,
			series: group.flatMap((one) => one.series).sort((one, other) => one[0] - other[0]),
			was: group.filter((one) => one !== current).map((one) => one.name),
		}
	})
}
