import Link from 'next/link'
import { ANNIVERSARY_KIND_LABEL, areaAnniversaries, byDayOfYear, festivals, townAnniversaries, travelAreas, type Anniversary } from '@betterbarmm/travel-data'
import { craftFestivalsInRegion, explorePlaces, findCraft } from '@betterbarmm/travel-data/explore'
import { ArrowUpRightIcon, CalendarStarIcon, ConfettiIcon, FlagBannerIcon, MapPinIcon, YarnIcon } from '@phosphor-icons/react/ssr'
import { commonsThumb } from '../_lib/commons'
import { findDestination } from '../_lib/discover'

/* ============================================================
   The calendar's parts, shared by the region's calendar (/calendar)
   and an area's (the Discover page): the months, the events and the
   founding anniversaries; a month as a section with its festivals as
   one-row photo cards and its anniversaries as day-tile rows.
   ============================================================ */

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const monthOf = (when: string) => MONTHS.findIndex((m) => when.includes(m))

export type Event = { name: string; area: string; when: string; what: string; kind: 'festival' | 'craft'; source?: string }

const AREA = new Map(travelAreas.map((a) => [a.slug, a.name]))
/** A festival's photograph: the place it happens or the cloth it celebrates; else the first photographed place of its area. Named on the card for what it shows. */
const FESTIVAL_PHOTO: Record<string, { place?: string; craft?: string }> = {
	'Shariff Kabunsuan Festival': { place: 'rio-grande-de-mindanao' },
	'Meguyaya Festival': { place: 'upi-uplands' },
	'Lami-Lamihan Festival': { place: 'lamitan' },
	'Kamahardikaan sin Tawi-Tawi': { place: 'bud-bongao' },
	'Inaul Festival': { craft: 'inaul' },
	'Langkit Festival': { craft: 'langkit' },
}
function festivalPhoto(e: Event): { src: string; label: string; page: string } | null {
	const pick = FESTIVAL_PHOTO[e.name]
	if (pick?.craft) {
		const c = findCraft(pick.craft)
		if (c?.image) return { src: commonsThumb(c.image.url, 960, c.image.width), label: c.name, page: c.image.page }
	}
	const place = pick?.place ? explorePlaces.find((p) => p.slug === pick.place) : explorePlaces.find((p) => p.area === e.area && p.images.length)
	const img = place?.images[0]
	return place && img ? { src: commonsThumb(img.url, 960, img.width), label: place.name, page: img.page } : null
}

const areaHref = (slug: string) => (findDestination(slug) ? `/discover/${slug}` : `/${slug}`)

/** One founding anniversary as a row: the day, the name and where, how old it turns, and what the date rests on. */
export function AnniversaryRow({ a, year, province = false }: { a: Anniversary; year: number; province?: boolean }) {
	const d = new Date(`${a.date}T00:00:00`)
	const turns = year - d.getFullYear()
	const body = (
		<>
			<span className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-xl ${province ? 'bg-[var(--accent)] text-white' : 'bg-[color-mix(in_srgb,var(--accent)_9%,var(--paper))] text-[var(--accent)]'}`}>
				<span className='font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold leading-none'>{d.getDate()}</span>
			</span>
			<span className='min-w-0 flex-1'>
				<span className='flex flex-wrap items-baseline gap-x-2'>
					<span className='font-semibold text-[var(--ink)]'>{a.name}</span>
					<span className='text-[0.8125rem] text-[var(--ink-3)]'>{province ? (a.kind === 'charter' ? 'City' : 'Province') : AREA.get(a.area)}</span>
				</span>
				<span className='mt-0.5 block truncate text-[0.75rem] text-[var(--ink-mute)]' title={a.basis}>
					{ANNIVERSARY_KIND_LABEL[a.kind]} · {d.getFullYear()}
				</span>
			</span>
			{turns > 0 ? (
				<span className='shrink-0 text-right'>
					<span className='block font-[family-name:var(--font-display)] text-[1.125rem] font-bold leading-none text-[var(--ink)]'>{turns}</span>
					<span className='text-[0.6875rem] text-[var(--ink-mute)]'>{turns === 1 ? 'year' : 'years'}</span>
				</span>
			) : null}
		</>
	)
	return (
		<li>
			{a.source ? (
				<a href={a.source} target='_blank' rel='noreferrer' className='flex items-center gap-4 rounded-2xl px-3 py-2.5 transition hover:bg-[var(--paper)]'>
					{body}
				</a>
			) : (
				<div className='flex items-center gap-4 px-3 py-2.5'>{body}</div>
			)}
		</li>
	)
}

/** The festivals and craft fairs, region-wide or for one area. A bare "X's anniversary" entry is left to the founding anniversaries. */
export function calendarEvents(area?: string): Event[] {
	const guide = festivals.filter((f) => f.area !== 'region' && !/anniversary$/.test(f.name) && (!area || f.area === area))
	return [
		...guide.map((f) => ({ name: f.name, area: f.area, when: f.when, what: f.what, kind: 'festival' as const, source: f.source })),
		// A craft festival the guide does not already list under its own name.
		...craftFestivalsInRegion()
			.filter((c) => (!area || c.area === area) && !guide.some((f) => f.name === c.name))
			.map((c) => ({ name: c.name, area: c.area, when: `${c.month} · ${c.place}`, what: c.note, kind: 'craft' as const, source: c.source })),
	]
}

export type Month = { name: string; events: Event[]; areas: Anniversary[]; towns: Anniversary[] }

/** The twelve months, each with its events and its province, city and town anniversaries, region-wide or for one area. */
export function calendarMonths(area?: string): Month[] {
	const events = calendarEvents(area)
	const towns = byDayOfYear(townAnniversaries.filter((a) => !area || a.area === area))
	const areas = byDayOfYear(areaAnniversaries.filter((a) => !area || a.area === area))
	return MONTHS.map((name, m) => {
		const inMonth = (a: Anniversary) => Number(a.date!.slice(5, 7)) === m + 1
		return { name, events: events.filter((e) => monthOf(e.when) === m), areas: areas.filter(inMonth), towns: towns.filter(inMonth) }
	})
}

/** One month as a section: its name and counts, its festivals as one-row photo cards, its anniversaries as day-tile rows. */
export function MonthSection({ month: { name, events, areas, towns }, m, year, thisMonth, id, best = false }: { month: Month; m: number; year: number; thisMonth: number; id?: string; best?: boolean }) {
	return (
		<section id={id} className='grid scroll-mt-20 gap-8 border-b border-[var(--rule)] py-14 last:border-b-0 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 lg:py-16'>
			<header>
				<h2 className='font-[family-name:var(--font-display)] text-[clamp(2.25rem,4vw,3.25rem)] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)]'>{name}</h2>
				<div className='mt-3 flex flex-wrap gap-2'>
					{m === thisMonth ? <p className='inline-flex rounded-full bg-[var(--ink)] px-3 py-1 text-[0.75rem] font-semibold text-[var(--paper)]'>This month</p> : null}
					{best ? <p className='inline-flex rounded-full bg-[#d4a72c] px-3 py-1 text-[0.75rem] font-semibold text-[#1a1408]'>Best of the season</p> : null}
				</div>
				<dl className='mt-5 space-y-1.5 text-[0.875rem] text-[var(--ink-3)]'>
					{events.length ? (
						<div className='flex items-center gap-2'>
							<ConfettiIcon size={16} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
							<dd>
								{events.length} {events.length === 1 ? 'festival' : 'festivals'}
							</dd>
						</div>
					) : null}
					{areas.length + towns.length ? (
						<div className='flex items-center gap-2'>
							<CalendarStarIcon size={16} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
							<dd>
								{areas.length + towns.length} {areas.length + towns.length === 1 ? 'anniversary' : 'anniversaries'}
							</dd>
						</div>
					) : null}
				</dl>
			</header>

			<div className='min-w-0 space-y-8'>
				{/* The festivals: photo cards, each on its place or its craft, the month on a calendar tile. */}
				{events.length ? (
					<ul className='grid gap-4'>
						{events.map((e) => {
							const Glyph = e.kind === 'craft' ? YarnIcon : ConfettiIcon
							const photo = festivalPhoto(e)
							return (
								<li key={e.name} className='group flex flex-col overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] sm:flex-row'>
									<div className='relative isolate aspect-[16/9] shrink-0 overflow-hidden bg-[var(--paper-3)] sm:order-last sm:aspect-auto sm:min-h-[12rem] sm:w-[38%]'>
										{photo ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={photo.src} alt='' loading='lazy' className='absolute inset-0 -z-10 size-full object-cover transition duration-700 group-hover:scale-105' />
										) : null}
										<span aria-hidden='true' className='absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(8,12,16,0.75)_0%,rgba(8,12,16,0.1)_55%,transparent_100%)]' />
										{/* The month, as a page torn from a calendar. */}
										<span className='absolute left-4 top-4 flex w-14 flex-col overflow-hidden rounded-xl bg-white text-center shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)]'>
											<span className='bg-[var(--accent)] py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-white'>{name.slice(0, 3)}</span>
											<span className='grid h-9 place-items-center text-[#10161b]'>
												<Glyph size={22} weight='duotone' aria-hidden='true' />
											</span>
										</span>
										<span className='dv-chip absolute right-4 top-4'>{e.kind === 'craft' ? 'Craft festival' : 'Festival'}</span>
										{photo ? (
											<a href={photo.page} target='_blank' rel='noreferrer' className='absolute bottom-3 left-4 inline-flex items-center gap-1 text-[0.6875rem] text-white/75 hover:text-white'>
												<MapPinIcon size={12} weight='fill' aria-hidden='true' />
												{photo.label}
											</a>
										) : null}
									</div>
									<div className='flex min-w-0 flex-1 flex-col px-6 py-5 sm:px-10 sm:py-7'>
										<p className='text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>{e.when}</p>
										<h3 className='mt-1 font-[family-name:var(--font-display)] text-[1.25rem] font-bold leading-snug tracking-[-0.015em] text-[var(--ink)]'>{e.name}</h3>
										<p className='mt-1.5 line-clamp-3 flex-1 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]'>{e.what}</p>
										<div className='mt-4 flex flex-wrap items-center gap-x-5 gap-y-2'>
											<Link href={areaHref(e.area)} className='dv-pill !py-1.5 !text-[0.8125rem]'>
												<MapPinIcon size={14} weight='fill' className='text-[var(--accent)]' aria-hidden='true' />
												{AREA.get(e.area) ?? e.area}
											</Link>
											{e.source ? (
												<a href={e.source} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--ink-3)] hover:text-[var(--accent)]'>
													Source <ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
												</a>
											) : null}
										</div>
									</div>
								</li>
							)
						})}
					</ul>
				) : null}

				{/* The founding anniversaries: provinces and cities first, then the towns, by day. */}
				{areas.length + towns.length ? (
					<div className='rounded-[1.5rem] bg-[color-mix(in_srgb,var(--accent)_4%,var(--paper-2))] p-3 sm:p-4'>
						<p className='flex items-center gap-2 px-3 pb-2 pt-1 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
							<FlagBannerIcon size={16} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
							Founding anniversaries
						</p>
						<ul className='grid gap-x-4 md:grid-cols-2'>
							{areas.map((a) => (
								<AnniversaryRow key={a.name} a={a} year={year} province />
							))}
							{towns.map((a) => (
								<AnniversaryRow key={`${a.area}/${a.slug}`} a={a} year={year} />
							))}
						</ul>
					</div>
				) : null}

				{!events.length && !areas.length && !towns.length ? <p className='text-[0.9375rem] text-[var(--ink-3)]'>Nothing in the guide falls in {name} yet.</p> : null}
			</div>
		</section>
	)
}
