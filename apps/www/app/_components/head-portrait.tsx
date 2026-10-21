import { headPhoto } from '../_lib/images'

/** An office head's portrait in a circle, or their initials where no official portrait has been found. */
export function HeadPortrait({ slug, name, className = 'size-12' }: { slug: string; name: string | null; className?: string }) {
	const photo = headPhoto(slug)
	const initials = (name ?? '')
		.replace(/^(Atty|Engr|Dr|Archt|Sheikh|Hadja|Hja|Prof)\.?\s+/i, '')
		.split(/\s+/)
		.filter((w) => /^[A-Z]/.test(w) && !/^[A-Z]\.$/.test(w))
		.slice(0, 2)
		.map((w) => w[0])
		.join('')
	return photo ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={photo.src} alt={name ? `${name}, official portrait` : ''} loading='lazy' className={`shrink-0 rounded-full bg-[var(--paper-2)] object-cover ${className}`} />
	) : (
		<span aria-hidden='true' className={`grid shrink-0 place-items-center rounded-full bg-[var(--paper-2)] text-[14px] font-bold text-[var(--ink-3)] ${className}`}>
			{initials || '·'}
		</span>
	)
}
