/* A thing's picture — an office's logo, a province's or town's seal, a
   person's portrait — drawn the one way everywhere: a logo or seal whole
   inside its box, a portrait filling it, and where no picture has been
   found, initials (or the acronym) in its place. The picture comes from
   _lib/images.ts; this only draws it, so it can be used on the client too.
   The box's size and shape are the caller's, through `className`. */

type Picture = { src: string; credit?: string } | null | undefined

/** "Ministry of Health" → "MH"; "Datu Odin Sinsuat" → "DO". */
export const initials = (name: string, most = 2) =>
	name
		.split(/[\s,(/-]+/)
		.filter((w) => /^[A-Z]/.test(w))
		.map((w) => w[0])
		.join('')
		.slice(0, most)

export function Emblem({
	image,
	name,
	label,
	portrait = false,
	tile = false,
	className = '',
}: {
	image: Picture
	/** Whose picture it is: the initials come from it. */
	name: string
	/** What to show instead of the initials — an office's acronym. */
	label?: string | null
	/** A portrait fills its box; a logo or a seal sits whole inside it. */
	portrait?: boolean
	/** On the card's own ground, padded, as a card's picture panel is. */
	tile?: boolean
	className?: string
}) {
	const ground = tile ? 'bg-[var(--paper-2)]' : ''
	return image ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={image.src}
			alt=''
			title={image.credit ? `${portrait ? 'Photo' : 'Emblem'}: ${image.credit}` : undefined}
			loading='lazy'
			className={`shrink-0 ${portrait ? 'object-cover' : `object-contain! ${tile ? 'p-2 sm:p-4' : ''}`} ${ground} ${className}`}
		/>
	) : (
		<span aria-hidden='true' className={`grid shrink-0 place-items-center font-mono font-bold text-[var(--ink-3)] ${tile ? ground : 'border border-[var(--rule)] bg-[var(--paper-2)]'} ${className}`}>
			{(label ?? initials(name)).slice(0, 5)}
		</span>
	)
}
