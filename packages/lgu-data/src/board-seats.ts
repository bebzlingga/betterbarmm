/* ============================================================
   Sangguniang Panlalawigan seats per district, 2025

   The canvass this directory carries for the 2025 provincial boards
   ranks every candidate but does not say how many seats each district
   had, so it cannot say who won. These counts are COMELEC's:
   Resolution No. 11050 (4 Sept 2024, Annex B) as amended by
   Nos. 11050-A and 11085 (6 Dec 2024), and the seats COMELEC set for
   each contest on its 2025 results site, whose district tallies add up
   to each province's registered voters at exactly these counts.
   ============================================================ */

import type { Candidate, Contest } from './dataset'

export const boardSeatsSource = {
	label: 'COMELEC Resolution Nos. 11050 and 11085, and the 2025 results site',
	href: 'https://lawphil.net/administ/comelec/comres2024/comres_11085_2024.pdf',
}

const SEATS: Record<string, { first: number; second: number; note?: string }> = {
	basilan: { first: 4, second: 6 },
	'lanao-del-sur': {
		first: 5,
		second: 5,
		note: 'Lanao del Sur’s board was proclaimed in August 2025. In the second district COMELEC’s count puts Taha-Tanjie Macapodi fifth, 845 votes ahead of Abdullah Pacalna; check the provincial board for who holds the seat.',
	},
	'maguindanao-del-norte': { first: 4, second: 4 },
	'maguindanao-del-sur': { first: 5, second: 5 },
	'tawi-tawi': { first: 6, second: 4 },
}

/** A province's 2025 board, district by district: the top `seats` of each contest. */
export function boardWinners(
	slug: string,
	contests: Contest[] | undefined,
): { districts: { district: string; members: Candidate[] }[]; note?: string } | null {
	const seats = SEATS[slug]
	if (!seats || !contests?.length) return null
	const districts = (['first', 'second'] as const).flatMap((which) => {
		const contest = contests.find((c) => c.contestName.toUpperCase().includes(`${which.toUpperCase()} PROVDIST`))
		return contest ? [{ district: which === 'first' ? '1st district' : '2nd district', members: contest.ranked.slice(0, seats[which]) }] : []
	})
	return { districts, note: seats.note }
}
