import Image from 'next/image'
import { partyMarks, photoFor } from '../_lib/media'

/* ============================================================
   Faces and marks

   A list of a hundred and thirty-eight names is a list of nobody. A face
   beside one is the difference between a record and a person — but only
   where there is a face to print, and for most of this field there is not.

   So both components below have two states, and the second is a designed
   state rather than a hole: initials cut into a tinted plate, in the display
   face, ruled like everything else. It reads as "no portrait on file", which
   is true and is itself worth knowing, instead of as a broken image or a
   grey silhouette pretending to be a person.
   ============================================================ */

/** Initials, from the first and last word of a name. */
function initials(name: string): string {
	const words = name
		.replace(/[^A-Za-z ]/g, ' ')
		.split(/\s+/)
		.filter(Boolean)

	if (words.length === 0) return '·'
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
	return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/**
 * A stable tint per name, from the site's four marking colours.
 *
 * Deterministic rather than random so a person keeps the same plate on every
 * page they appear on, and cheap enough to run for every row of a long list.
 */
const TINTS = ['var(--slate)', 'var(--ochre)', 'var(--positive)', 'var(--accent-deep)'] as const

function tintFor(seed: string): string {
	let hash = 0
	for (let index = 0; index < seed.length; index += 1) {
		hash = (hash * 31 + seed.charCodeAt(index)) % 9973
	}
	return TINTS[hash % TINTS.length]
}

/**
 * A person, at whatever size the row it sits in needs.
 *
 * Square rather than round: every other frame on the estate has corners, and
 * a circle here would be the one shape breaking that.
 */
export function PersonAvatar({
	name,
	size = 44,
	className = '',
}: {
	name: string
	size?: number
	className?: string
}) {
	const photo = photoFor(name)

	if (photo) {
		return (
			<span
				className={`relative block shrink-0 overflow-hidden bg-[var(--paper-3)] ${className}`}
				style={{ width: size, height: size }}
				title={`${name} — portrait: ${photo.credit}, public domain`}
			>
				<Image
					src={photo.src}
					alt=''
					width={size * 2}
					height={size * 2}
					className='size-full object-cover'
				/>
			</span>
		)
	}

	return (
		<span
			aria-hidden='true'
			className={`flex shrink-0 items-center justify-center font-extrabold leading-none tracking-[-0.02em] text-white ${className}`}
			style={{
				width: size,
				height: size,
				background: tintFor(name),
				fontSize: size * 0.36,
				fontFamily: 'var(--font-display)',
			}}
			title='No portrait on file'
		>
			{initials(name)}
		</span>
	)
}

/**
 * A party, as an emblem where one is publishable and a lettered plate where
 * it is not.
 *
 * The plate carries the ballot name rather than initials, because the ballot
 * name is what the voter is looking for on the paper — for eleven of the
 * thirteen it is already an acronym.
 */
export function PartyMark({
	partyId,
	ballotName,
	size = 44,
	className = '',
}: {
	partyId: string
	ballotName: string
	size?: number
	className?: string
}) {
	const mark = partyMarks[partyId]
	const label = ballotName.replace(/\s*party\s*$/i, '').trim()

	if (mark) {
		return (
			<span
				className={`relative block shrink-0 overflow-hidden bg-[var(--paper)] ${className}`}
				style={{ width: size, height: size }}
			>
				<Image
					src={mark}
					alt={`${ballotName} emblem`}
					width={size * 2}
					height={size * 2}
					className='size-full object-contain'
				/>
			</span>
		)
	}

	return (
		<span
			aria-hidden='true'
			className={`flex shrink-0 items-center justify-center border border-[var(--brass-line)] bg-[var(--paper-2)] px-1 text-center font-extrabold leading-none tracking-[-0.02em] text-[var(--ink)] ${className}`}
			style={{
				width: size,
				height: size,
				fontFamily: 'var(--font-display)',
				// Long names step down rather than overflow the plate; the acronyms
				// most of these are stay at the size the plate was drawn for.
				fontSize: label.length > 6 ? size * 0.2 : label.length > 4 ? size * 0.26 : size * 0.32,
			}}
		>
			{label}
		</span>
	)
}
