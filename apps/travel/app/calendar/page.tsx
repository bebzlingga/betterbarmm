import type { Metadata } from 'next'
import { explorePlaces } from '@betterbarmm/travel-data/explore'
import { MonthSection, calendarMonths } from '../_components/calendar-parts'
import { PageHero, heroFromPlace } from '../_components/page-hero'

export const metadata: Metadata = {
	title: 'Calendar',
	description: 'The festivals, craft fairs and founding anniversaries of the Bangsamoro’s provinces, cities and towns, month by month.',
}

/* ============================================================
   The Bangsamoro calendar (user decision: a page in the navigation
   for the important events across the region, with every town's
   founding anniversary)

   Month by month: the festivals and craft fairs as photo cards, then
   the founding anniversaries of the provinces, cities and
   municipalities (datasets/travel/anniversaries.json) as a list by
   day, each with how many years it turns this year and the law or
   plebiscite it is dated from. The parts are shared with each area's
   calendar (_components/calendar-parts.tsx).
   ============================================================ */

export default function CalendarPage() {
	const year = new Date().getFullYear()
	const thisMonth = new Date().getMonth()
	const months = calendarMonths()
	const events = months.flatMap((m) => m.events)
	const towns = months.flatMap((m) => m.towns)
	const areas = months.flatMap((m) => m.areas)
	const photos = [
		['lake-lanao', 1],
		['grand-mosque-cotabato', 0],
		['lamitan', 0],
	].map(([slug, image]) => heroFromPlace(explorePlaces.find((p) => p.slug === slug), image as number))

	return (
		<>
			<PageHero
				photos={photos}
				kicker='Calendar'
				title='The year in the Bangsamoro'
				lede={`${events.length} festivals and craft fairs, and the founding anniversaries of ${areas.length} provinces and cities and ${towns.length} municipalities, month by month.`}
			/>

			{/* ---- The months, a bar that stays in view ---- */}
			<nav aria-label='Months' className='sticky top-0 z-20 border-b border-[var(--rule)] bg-[var(--paper)]/90 backdrop-blur-xl'>
				<div data-drag-scroll className='bb-container flex gap-1 overflow-x-auto py-3 [scrollbar-width:none] lg:justify-between [&::-webkit-scrollbar]:hidden'>
					{months.map(({ name, events, areas, towns }, m) => {
						const n = events.length + areas.length + towns.length
						return (
							<a
								key={name}
								href={`#${name.toLowerCase()}`}
								className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-1.5 transition hover:bg-[var(--paper-2)] ${m === thisMonth ? 'bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink)]' : 'text-[var(--ink)]'}`}
							>
								<span className='font-[family-name:var(--font-display)] text-[0.875rem] font-bold'>{name.slice(0, 3)}</span>
								<span className={`text-[0.6875rem] ${m === thisMonth ? 'opacity-70' : 'text-[var(--ink-mute)]'}`}>{n}</span>
							</a>
						)
					})}
				</div>
			</nav>

			<div className='bb-container pb-[clamp(4.5rem,9vw,8rem)]'>
				{/* ---- Month by month ---- */}
				{months.map((month, m) => (
					<MonthSection key={month.name} id={month.name.toLowerCase()} month={month} m={m} year={year} thisMonth={thisMonth} />
				))}

				<p className='mt-4 border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-relaxed text-[var(--ink-3)]'>
					Each anniversary is the day the province, city or town legally began: the day its law took effect or a plebiscite ratified it where a source gives one, otherwise the
					day its law was passed or signed; a city is dated from its charter. A town may celebrate its foundation day on another date. Each row links to the law or record it rests
					on. Datu Blah T. Sinsuat (2006) and Talitay (1996) are known to the year only and are not listed by day.
				</p>
			</div>
		</>
	)
}
