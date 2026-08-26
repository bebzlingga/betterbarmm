import type { StaticImageData } from 'next/image'

import { personPhotos, type PersonPhoto } from './portraits.generated'

export { personPhotos }
export type { PersonPhoto }

/**
 * The photographs and marks this workspace is allowed to print.
 *
 * The portraits in `portraits.generated.ts` are official ones: the Bangsamoro
 * Parliament's own member portraits and the Bangsamoro Information Office's
 * releases, which carry no copyright as works of the Philippine government and
 * are published as public domain. That is the whole of what exists — every
 * freely licensed file those two bodies have released has been checked against
 * every name on this ballot.
 *
 * Nothing here is taken from a campaign page, a news site, or a social account.
 * Those photographs are somebody's copyrighted work, usually of a private
 * citizen, and a registry whose one claim is that every record names its source
 * cannot print pictures whose source it would have to leave blank. A candidate
 * with no portrait carries a lettered plate, which is a true statement about
 * the record rather than a hole in it.
 *
 * To add a batch you have the rights to — headshots a party supplies for a
 * voter guide, a COMELEC release, your own photography — put the files in a
 * folder named after the people and run:
 *
 *     bun run portraits ./incoming --credit "Bangsamoro Federalist Party"
 *
 * It matches each file to a candidate, squares and compresses it, and rewrites
 * the generated list. The credit is required because the credit is the point.
 */

/**
 * Party emblems, once there are any to print.
 *
 * Deliberately empty. A party's emblem is its own mark, and none of the
 * thirteen on this ballot publishes one under a licence that lets a third
 * party reproduce it — so every entry carries a lettered plate built from its
 * ballot name instead. When a party releases its emblem, or COMELEC publishes
 * the ballot faces, a file dropped in `_images/parties/` and a line here is
 * all it takes.
 */
export const partyMarks: Record<string, StaticImageData> = {}

/**
 * The key both maps are read by: first and last name, lowercased, with middle
 * initials, honorifics and suffixes dropped.
 *
 * Names in this dataset arrive in three different shapes — "ABRAR JAINUDDIN
 * HATAMAN" from a district filing, "Abrar J. Hataman" from a portrait caption,
 * "Hataman, Abrar (BFP)" from a ballot line — so matching on the whole string
 * finds nothing. The first and last word survive all three.
 */
const HONORIFICS = /\b(jr|sr|ii|iii|iv|md|atty|engr|hadji|hadja|haji)\b/g

export function personKey(name: string): string {
	const words = name
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(HONORIFICS, ' ')
		.replace(/\b[a-z]\b/g, ' ')
		.replace(/[^a-z ]/g, ' ')
		.split(/\s+/)
		.filter((word) => word.length > 1)

	return words.length >= 2 ? `${words[0]} ${words[words.length - 1]}` : words.join(' ')
}

export function photoFor(name: string): PersonPhoto | undefined {
	return personPhotos[personKey(name)]
}
