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
	size?: 'sm' | 'lg'
}) {
	// Portrait proportions rather than a circle — a squared frame suits an
	// official roster, and leaves room for a real headshot later. The large
	// size heads a profile, where the person is the subject of the page, so it
	// is sized to be looked at rather than glanced past.
	const dimensions = size === 'lg' ? 'size-32 text-4xl sm:size-40 sm:text-5xl' : 'size-14 text-base'

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
			className={`${dimensions} inline-flex shrink-0 select-none items-center justify-center rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper-2)] p-2.5`}
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
