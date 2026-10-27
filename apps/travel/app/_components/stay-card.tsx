import { BedIcon } from '@phosphor-icons/react/ssr'
import type { ExploreStay } from '@betterbarmm/travel-data/explore'
import { commonsThumb } from '../_lib/commons'
import { PhotoCredit } from './explore-card'

/** "langyaw.com" for a source link's label. */
const host = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '')
	} catch {
		return url
	}
}

/**
 * A place to stay: its own credited photograph where a free one exists, otherwise a plain ground and a bed; then its kind, name, address, the note from its source, and that source with its date. Used on a
 * place's page and an area's.
 */
export function StayCard({ stay }: { stay: ExploreStay }) {
	return (
		<li className='flex flex-col'>
			<div className='relative aspect-[4/3] overflow-hidden bg-[var(--paper-2)]'>
				{stay.image ? (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={commonsThumb(stay.image.url, 500, stay.image.width)} alt={stay.image.caption} loading='lazy' className='size-full object-cover' />
						<PhotoCredit photo={{ author: stay.image.author, license: stay.image.license, page: stay.image.page }} className='absolute bottom-2.5 left-2.5' />
					</>
				) : (
					/* No photograph of the hotel itself. Another place's would read as the hotel (user decision), so none. */
					<span className='flex size-full flex-col items-center justify-center gap-2 text-[var(--ink-mute)]'>
						<BedIcon size={30} weight='duotone' aria-hidden='true' />
						<span className='text-[0.75rem]'>No photo of this {stay.kind} yet</span>
					</span>
				)}
			</div>
			<div className='flex flex-1 flex-col pt-4'>
				<p className='tv-kind'>
					{stay.kind}
					{stay.accredited ? ' · DOT-accredited' : ''}
				</p>
				<p className='mt-1.5 !font-[family-name:var(--font-display)] text-[1rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>{stay.name}</p>
				<p className='mt-1 text-[0.84375rem] leading-snug text-[var(--ink-2)]'>{stay.address ?? stay.municipality}</p>
				{stay.note ? <p className='mt-2 text-[0.8125rem] leading-snug text-[var(--ink-3)]'>{stay.note}</p> : null}
				<a href={stay.source} target='_blank' rel='noreferrer' className='mt-auto inline-block pt-3 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[var(--ink-3)] hover:text-[var(--accent)]'>
					{host(stay.source)} · as of {stay.as_of}
				</a>
			</div>
		</li>
	)
}
