import { craftFestivalsInArea, craftsInArea, peoplesInArea } from '@betterbarmm/travel-data/explore'
import { CalendarStarIcon, UsersThreeIcon, YarnIcon } from '@phosphor-icons/react/ssr'
import { commonsThumb } from '../_lib/commons'
import { Credit, SeeAllCard } from './discover-card'
import { RailArrows } from './rail'

/* ============================================================
   An area's crafts and cultures (user decision: connect the crafts
   to each area)

   The peoples its towns name, with how many towns name each; the
   crafts made there, from the landing site's crafts dataset, each a
   card linking to its own page there; and the craft festivals held in
   the area. A craft's photograph shows the craft, never a place.
   ============================================================ */

const GROUP_LABEL: Record<string, string> = {
	textile: 'Textile',
	mat: 'Mat weaving',
	brass: 'Brass',
	instrument: 'Instrument',
	carving: 'Carving',
	blade: 'Blade',
	basketry: 'Basketry',
	pottery: 'Pottery',
	ornament: 'Ornament',
	attire: 'Attire',
}

export function CraftsCulture({ area, areaName }: { area: string; areaName: string }) {
	const crafts = craftsInArea(area)
	const peoples = peoplesInArea(area)
	const festivals = craftFestivalsInArea(areaName)
	if (!crafts.length && !peoples.length) return null

	return (
		<section id='crafts' className='dv-rail-section scroll-mt-8'>
			<div className='bb-container'>
				{/* The heading, and the rail's arrows level with the peoples below it (user decision). */}
				<h2 className='dv-title'>Crafts &amp; culture</h2>
				<p className='dv-lede max-w-2xl'>
					The peoples of {areaName}, what they make by hand, and where to see it.
					{crafts.length ? ` ${crafts.length} ${crafts.length === 1 ? 'craft' : 'crafts'} from the region’s crafts record.` : ''}
				</p>

				<div className='mt-6 flex items-end justify-between gap-6'>
				{peoples.length ? (
					<ul className='flex flex-wrap gap-2'>
						{peoples.map((p) => (
							<li key={p.name} className='dv-pill !cursor-default hover:!border-[var(--rule)] hover:!bg-transparent'>
								<UsersThreeIcon size={16} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
								{p.name}
								<span className='text-[var(--ink-mute)]'>
									{p.towns} {p.towns === 1 ? 'town' : 'towns'}
								</span>
							</li>
						))}
					</ul>
				) : <span />}
				<RailArrows show={crafts.length > 3} />
				</div>
			</div>

			{crafts.length ? (
				<div className='dv-rail'>
					{crafts.map((c) => (
						<article key={c.slug} className='dv-card group'>
							{c.image ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img decoding='async' src={commonsThumb(c.image.url, 500, c.image.width)} alt='' loading='lazy' className='dv-card-img' />
							) : (
								<span className='grid size-full place-items-center bg-[var(--paper-3)] text-[var(--ink-mute)]'>
									<YarnIcon size={40} weight='duotone' aria-hidden='true' />
								</span>
							)}
							<span aria-hidden='true' className='dv-card-shade' />
							<span className='dv-chip absolute left-5 top-5'>{GROUP_LABEL[c.group] ?? c.group}</span>
							<div className='absolute inset-x-0 bottom-0 p-7'>
								<p className='text-[0.75rem] font-medium text-white/75'>{c.people}</p>
								<h3 className='mt-1 font-[family-name:var(--font-display)] text-[1.375rem] font-bold leading-tight tracking-[-0.02em] text-white'>
									<a href={`https://betterbarmm.com/crafts/${c.slug}`} target='_blank' rel='noreferrer' className='after:absolute after:inset-0'>
										{c.name}
									</a>
								</h3>
								<p className='mt-1.5 line-clamp-2 text-[0.84375rem] leading-snug text-white/80'>{c.summary}</p>
							</div>
							{c.image ? <Credit photo={c.image} className='dv-card-credit absolute bottom-0 right-0 z-[1]' /> : null}
						</article>
					))}
					<SeeAllCard
						href='https://betterbarmm.com/crafts'
						external
						title='Every craft of the region'
						note='Makers, motifs and where to buy'
						images={crafts.filter((c) => c.image).slice(-4).map((c) => commonsThumb(c.image!.url, 500, c.image!.width))}
					/>
				</div>
			) : null}

			{festivals.length ? (
				<div className='bb-container mt-10'>
					<div className='grid gap-4 md:grid-cols-2'>
						{festivals.map((f) => (
							<a key={f.name} href={f.source} target='_blank' rel='noreferrer' className='tv-card group !flex-row gap-5'>
								<span className='flex h-[4.5rem] w-16 shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--rule)] text-center'>
									<span className='bg-[var(--accent)] py-1 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-white'>{f.month.slice(0, 3)}</span>
									<span className='grid flex-1 place-items-center text-[var(--accent)]'>
										<CalendarStarIcon size={24} weight='duotone' aria-hidden='true' />
									</span>
								</span>
								<span className='min-w-0'>
									<span className='block font-[family-name:var(--font-display)] text-[1.0625rem] font-bold text-[var(--ink)]'>{f.name}</span>
									<span className='mt-0.5 block text-[0.8125rem] font-semibold text-[var(--accent)]'>
										{f.month} · {f.place}
									</span>
									<span className='mt-2 block text-[0.875rem] leading-relaxed text-[var(--ink-2)]'>{f.note}</span>
								</span>
							</a>
						))}
					</div>
				</div>
			) : null}
		</section>
	)
}
