import Image from 'next/image'
import { partyMarks, photoFor } from '../_lib/media'
import { partyColor, partyInk } from '../_lib/party-color'

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
 * A person, at whatever size the row it sits in needs.
 *
 * Square rather than round: every other frame on the estate has corners, and
 * a circle here would be the one shape breaking that.
 */
export function PersonAvatar({
	name,
	partyId,
	size = 44,
	className = '',
}: {
	name: string
	/**
	 * Whose plate this is, where the person is running under a party.
	 *
	 * Without a portrait the plate used to take one of four house tints off a
	 * hash of the name, which is a colour that means nothing — two people from
	 * the same party could sit in the same list wearing different colours. The
	 * party's own colour puts them together, and a candidate with no party
	 * falls back to the house tints, which is itself the fact.
	 */
	partyId?: string | null
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

	/* Their party's colour, or a quiet neutral where there is no party.
	 *
	 * The fallback used to be one of four house tints hashed off the name —
	 * `--slate` and `--positive` among them, which are a near-black navy and a
	 * dark olive. Beside the party colours they read as somebody's colour rather
	 * than as nobody's, and they were the darkest thing on a page of hairlines.
	 * An unpainted plate says the true thing: this person is running without a
	 * party behind them, or under one this workspace has not linked yet. */
	const color = partyColor(partyId)

	return (
		<span
			aria-hidden='true'
			className={`flex shrink-0 items-center justify-center font-extrabold leading-none tracking-[-0.02em] ${className}`}
			style={{
				width: size,
				height: size,
				background: color ?? 'var(--paper-3)',
				color: color ? partyInk(color) : 'var(--ink-3)',
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
 * The plate is one letter on the party's own colour. It carried the whole
 * ballot name, which for the longer entries meant six or seven characters
 * stepped down to nine points inside a square — small type in a box, read as
 * neither a mark nor a name. A single letter at plate size is a mark, and the
 * colour under it is what actually identifies the party: the same colour the
 * card, the party's page and its candidates' plates all carry.
 *
 * Two parties can share a first letter; they never share a colour, and the
 * ballot name is set beside the plate in every place this appears.
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

	/* Filled, not outlined. A hairline box around a letter is the lightest
	 * thing in a card that also holds a name at 24px and a paragraph under it,
	 * and it read as an empty frame where an emblem had failed to load — the
	 * one thing it must not say. Filled, it is a plate: something deliberately
	 * set in place of a picture, which is what the note under the grid says it
	 * is. */
	const color = partyColor(partyId)

	return (
		<span
			aria-hidden='true'
			className={`flex shrink-0 items-center justify-center text-center font-extrabold leading-none tracking-[-0.02em] ${className}`}
			style={{
				width: size,
				height: size,
				background: color ?? 'var(--paper-3)',
				color: color ? partyInk(color) : 'var(--ink-3)',
				boxShadow: 'inset 0 0 0 1px var(--rule)',
				fontFamily: 'var(--font-display)',
				fontSize: size * 0.44,
			}}
		>
			{label.slice(0, 1)}
		</span>
	)
}
