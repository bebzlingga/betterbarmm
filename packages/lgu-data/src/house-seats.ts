import file from '../../../datasets/lgu/house-seats.json'

/* Each town's seat in the House of Representatives: the district it votes
   in and who won it in May 2025. The Special Geographic Area's towns have
   none. Rebuilt by datasets/lgu/scripts/build_house_seats.py. */

export type HouseSeat = { province: string; district: string; name: string; party: string | null }

export const houseSeats = file as {
	term: string
	source: { label: string; href: string }
	districts: Record<string, HouseSeat>
	units: Record<string, string | undefined>
}

export function houseSeat(unitKey: string): HouseSeat | null {
	const seat = houseSeats.units[unitKey]
	return seat ? houseSeats.districts[seat] ?? null : null
}

/** A province's districts, first to last. */
export function provinceSeats(provinceSlug: string): HouseSeat[] {
	return Object.entries(houseSeats.districts)
		.filter(([key]) => key.startsWith(`${provinceSlug}:`))
		.map(([, seat]) => seat)
}
