/* ============================================================
   A colour per party

   These are the parties' own colours, as they use them — not a palette this
   workspace invented. That is the whole point of them: a reader who has seen a
   tarpaulin or a ballot mock-up recognises BFP's navy or ISAMA's yellow before
   they read the letters on the plate, and the same colour then carries them
   through the card, the party's page, and every candidate running under it.

   Two of the thirteen have no colour recorded here yet. They take the
   unpainted plate rather than a stand-in, for the same reason an uncaptured
   dataset shows a zero rather than a guess — a colour invented for Mushawara
   would be indistinguishable, to a reader, from one Mushawara chose.

   It is identity, not measurement: nothing here encodes a quantity, and the
   colour never appears without the name written beside it.
   ============================================================ */

/** Party id, as the dataset writes it, to the colour that party uses. */
const PARTY_COLORS: Record<string, string> = {
	ABOT: '#c48c58',
	BAPA: '#bf0405',
	BEST: '#f5bf18',
	BFP: '#1d3889',
	BGC: '#252a8a',
	ISAMA: '#fcf902',
	MAHARDIKA: '#e35f65',
	MORO_AKO: '#227006',
	PRO_BANGSAMORO: '#2b3291',
	RAAYAT: '#e99e17',
	UBJP: '#20630f',
	// Mushawara and PBB: no published colour on file.
}

/** The colour a party uses, or `null` where none is recorded. */
export function partyColor(partyId: string | null | undefined): string | null {
	if (!partyId) return null

	return PARTY_COLORS[partyId] ?? null
}

/**
 * Which ink a plate's letters take.
 *
 * Measured off the colour rather than written down beside it. These run from
 * ISAMA's near-fluorescent yellow to BGC's midnight blue, and white type
 * clears 1.1:1 on the first and 11.8:1 on the last — a single choice for all
 * of them would leave a third of the plates unreadable. Computing it means a
 * corrected hex brings its own ink with it instead of quietly keeping the
 * wrong one.
 *
 * The threshold is the point where white and near-black are equally legible on
 * the fill; every party's pick clears 5.2:1 at these values.
 */
export function partyInk(color: string): string {
	const channel = (hex: string) => {
		const value = Number.parseInt(hex, 16) / 255
		return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
	}

	const hex = color.replace('#', '')
	const luminance =
		0.2126 * channel(hex.slice(0, 2)) +
		0.7152 * channel(hex.slice(2, 4)) +
		0.0722 * channel(hex.slice(4, 6))

	return luminance > 0.19 ? '#17170f' : '#ffffff'
}
