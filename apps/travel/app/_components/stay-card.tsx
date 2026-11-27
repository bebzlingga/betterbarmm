import { BedIcon, ForkKnifeIcon } from '@phosphor-icons/react/ssr'
import { EAT_KIND_LABEL, type ExploreEat, type ExploreStay } from '@betterbarmm/travel-data/explore'
import { travelAreas } from '@betterbarmm/travel-data'
import { commonsThumb } from '../_lib/commons'
import { PhotoCredit } from './explore-card'
import { PlaceDetails, type PlaceDetail } from './place-details'

const areaName = new Map(travelAreas.map((area) => [area.slug, area.name]))

/** "langyaw.com" for a source link's label. */
const host = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '')
	} catch {
		return url
	}
}

/** What a place to eat's source says of its halal standing, in the dialog's words. */
const HALAL = {
	certified: 'Halal-certified, its source says; the note names the certifier where known.',
	halal: 'Halal, pork-free or Muslim-run, its source says.',
	none: 'Not stated by its source. Many places here are halal in practice; ask when you visit.',
}

/** A place to eat's kind and what its source says of its halal standing; a place to stay's kind and accreditation. */
const kindLine = (place: ExploreStay | ExploreEat) =>
	'halal' in place
		? `${EAT_KIND_LABEL[place.kind]}${place.halal === 'certified' ? ' · Halal-certified' : place.halal === 'halal' ? ' · Halal' : ''}`
		: `${place.kind}${place.accredited ? ' · DOT-accredited' : ''}`

/**
 * A place to stay or to eat: its own credited photograph where one exists, otherwise a plain ground and a bed or a fork
 * and knife; then its kind, name, address, the note from its source, and that source with its date. Used on a place's
 * page, an area's, and the places to eat.
 */
export function StayCard({ stay }: { stay: ExploreStay | ExploreEat }) {
	const Glyph = 'halal' in stay ? ForkKnifeIcon : BedIcon
	const area = areaName.get(stay.area)
	const detail: PlaceDetail = {
		name: stay.name,
		kindLine: kindLine(stay),
		note: stay.note,
		address: stay.address,
		town: area && area !== stay.municipality ? `${stay.municipality}, ${area}` : stay.municipality,
		halal: 'halal' in stay ? HALAL[stay.halal ?? 'none'] : null,
		asOf: stay.as_of,
		source: stay.source,
		sourceHost: host(stay.source),
		photos: [...(stay.image ? [stay.image] : []), ...('gallery' in stay ? (stay.gallery ?? []) : [])],
		pin: 'lat' in stay ? { lat: stay.lat, lon: stay.lon, placed: stay.placed } : null,
		contact: 'halal' in stay ? { phone: stay.phone, facebook: stay.facebook, instagram: stay.instagram, website: stay.website, email: stay.email, hours: stay.hours } : {},
		about: 'halal' in stay ? { about: stay.about, why_go: stay.why_go, tips: stay.tips, specialties: stay.specialties, services: stay.services, opened: stay.opened, branches: stay.branches } : {},
	}
	return (
		<li className='relative flex flex-col'>
			<div className='relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[var(--paper-2)]'>
				{stay.image ? (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={commonsThumb(stay.image.url, 500, stay.image.width)} alt={stay.image.caption} loading='lazy' className='size-full object-cover' />
						<PhotoCredit photo={{ author: stay.image.author, license: stay.image.license, page: stay.image.page }} className='absolute bottom-2.5 left-2.5 z-10' />
					</>
				) : (
					/* No photograph of the hotel itself. Another place's would read as the hotel (user decision), so none. */
					<span className='flex size-full flex-col items-center justify-center gap-2 text-[var(--ink-mute)]'>
						<Glyph size={30} weight='duotone' aria-hidden='true' />
						<span className='text-[0.75rem]'>No photo of this {'halal' in stay ? EAT_KIND_LABEL[stay.kind].toLowerCase() : stay.kind} yet</span>
					</span>
				)}
			</div>
			<div className='flex flex-1 flex-col pt-4'>
				<p className='tv-kind'>{kindLine(stay)}</p>
				<p className='mt-1.5 !font-[family-name:var(--font-display)] text-[1rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>
					<PlaceDetails detail={detail} />
				</p>
				<p className='mt-1 text-[0.84375rem] leading-snug text-[var(--ink-2)]'>{stay.address ?? stay.municipality}</p>
				{stay.note ? <p className='mt-2 text-[0.8125rem] leading-snug text-[var(--ink-3)]'>{stay.note}</p> : null}
				<a href={stay.source} target='_blank' rel='noreferrer' className='relative z-10 mt-auto inline-block self-start pt-3 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[var(--ink-3)] hover:text-[var(--accent)]'>
					{host(stay.source)} · as of {stay.as_of}
				</a>
			</div>
		</li>
	)
}
