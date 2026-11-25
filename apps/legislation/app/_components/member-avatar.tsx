const isSeal = (src: string) => src.endsWith('/BTA-logo.png')

/**
 * A member's portrait, or a stand-in for one.
 *
 * Parliament has published a photograph for some members and not others; where
 * one exists it is served from this app. Where it doesn't, the stand-in is the
 * BTA seal on a flat tint — which is what Parliament itself puts on those
 * members' pages, so the roster carries the same signal its source does.
 */
export function MemberAvatar({
	name,
	src,
	size = 'sm',
}: {
	name: string
	src?: string
	size?: 'xs' | 'sm' | 'lg'
}) {
	// Portrait proportions rather than a circle — a squared frame suits an
	// official roster, and leaves room for a real headshot later. The large
	// size heads a profile, where the person is the subject of the page, so it
	// is sized to be looked at rather than glanced past.
	// Some records give the seal itself as the photograph; frame it as the stand-in, not as a face.
	if (src && isSeal(src)) src = undefined
	const dimensions = size === 'lg' ? 'size-32 text-4xl sm:size-40 sm:text-5xl' : size === 'xs' ? 'size-11 text-sm' : 'size-14 text-base'

	if (src) {
		return (
			// eslint-disable-next-line @next/next/no-img-element -- portraits are remote and unsized
			<img
				src={src}
				alt={name}
				className={`${dimensions} shrink-0 rounded-[var(--radius)] border border-[var(--rule)] object-cover`}
			/>
		)
	}

	// The seal is set inside its frame rather than filling it: a logo cropped
	// to a portrait frame reads as a badly cropped photograph.
	return (
		<span
			className={`${dimensions} inline-flex shrink-0 select-none items-center justify-center rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper-2)] ${size === 'xs' ? 'p-1.5' : 'p-2.5'}`}
			title={`No photograph published for ${name}`}
		>
			{/* eslint-disable-next-line @next/next/no-img-element -- sized by its frame */}
			<img
				src='/images/members/BTA-logo.png'
				alt=''
				aria-hidden='true'
				className='size-full object-contain opacity-70'
			/>
			<span className='sr-only'>No photograph published for {name}</span>
		</span>
	)
}

/** A Member's face at the head of a card, as the landing site's Directory heads its own: round, centred, larger than
 *  the list avatar. Without a photograph, the Transition Authority's seal sits in the circle instead. */
export function MemberPortrait({ name, src }: { name: string; src?: string }) {
	if (src && isSeal(src)) src = undefined
	return (
		<span className='grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--rule)] bg-[var(--paper-2)] transition duration-500 group-hover:scale-105'>
			{/* eslint-disable-next-line @next/next/no-img-element -- portraits are local files of mixed sizes */}
			<img
				src={src ?? '/images/members/BTA-logo.png'}
				alt={src ? name : ''}
				aria-hidden={src ? undefined : true}
				className={src ? 'size-full object-cover object-top' : 'size-14 object-contain opacity-60'}
			/>
		</span>
	)
}

/** The landing site's card (user decision): a hairline, lifting and turning crimson at the edge on hover. */
export const MEMBER_CARD =
	'group flex h-full min-w-0 flex-col overflow-hidden border border-[var(--rule)] bg-[var(--paper)] text-center transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]'
/** The bar at a card's foot, filling crimson with the card's hover. */
export const MEMBER_CARD_FOOT =
	'mt-auto flex items-center justify-between gap-3 border-t border-[var(--rule)] px-5 py-3 text-left text-[0.78125rem] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white'
