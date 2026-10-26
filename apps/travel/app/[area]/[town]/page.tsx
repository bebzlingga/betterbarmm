import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Rise } from '@betterbarmm/editorial'
import {
	findTown,
	findTravelArea,
	SPOT_KIND_LABEL,
	townsInArea,
	travelAreas,
	type Source,
	type TownListing,
} from '@betterbarmm/travel-data'
import { Caution, GateList, TravelMasthead, SectionHead } from '../../_components/travel-parts'
import { TownMap } from '../../_components/town-map'
import { LocatorMap } from '../../_components/locator-map'

/** Every directory unit gets a page, researched or not — an empty page says so. */
export function generateStaticParams() {
	return travelAreas.flatMap((area) =>
		townsInArea(area.slug).map(({ unit }) => ({ area: area.slug, town: unit.slug })),
	)
}

async function load(params: Promise<{ area: string; town: string }>) {
	const { area: areaSlug, town: townSlug } = await params
	const area = findTravelArea(areaSlug)
	const entry = townsInArea(areaSlug).find(({ unit }) => unit.slug === townSlug)
	return area && entry ? { area, unit: entry.unit, town: findTown(areaSlug, townSlug) } : null
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ area: string; town: string }>
}): Promise<Metadata> {
	const page = await load(params)
	if (!page) return { title: 'Town not found' }
	return {
		title: `${page.unit.name}, ${page.area.name} — traveling the Bangsamoro`,
		description:
			page.town?.summary ??
			`Where to go, what to eat and where to stay in ${page.unit.name}, ${page.area.name}.`,
	}
}

const host = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '')
	} catch {
		return url
	}
}

function SourceLinks({ sources }: { sources: Source[] }) {
	if (!sources.length) return null
	return (
		<p className='mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.75rem] text-[var(--ink-3)]'>
			{sources.map((source) => (
				<a key={source.url} href={source.url} className='rule-link-quiet' rel='noopener' target='_blank'>
					{host(source.url)}
				</a>
			))}
		</p>
	)
}

function Listings({ label, items, empty }: { label: string; items: TownListing[]; empty: string | null }) {
	return (
		<div>
			<p className='bb-label'>{label}</p>
			{items.length ? (
				<ul className='mt-4 grid gap-4'>
					{items.map((item) => (
						<li key={item.name} className='border-b border-[var(--rule-soft)] pb-4'>
							<div className='flex flex-wrap items-baseline gap-x-3'>
								<span className='item-title'>{item.name}</span>
								<span className='tv-kind'>{item.kind}</span>
							</div>
							<p className='mt-1 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{item.note}</p>
							<SourceLinks sources={item.sources} />
						</li>
					))}
				</ul>
			) : null}
			{empty ? <p className='mt-4 text-[0.875rem] leading-7 text-[var(--ink-2)]'>{empty}</p> : null}
		</div>
	)
}

export default async function TownPage({ params }: { params: Promise<{ area: string; town: string }> }) {
	const page = await load(params)
	if (!page) notFound()
	const { area, unit, town } = page
	const siblings = townsInArea(area.slug).filter((one) => one.unit.slug !== unit.slug)

	const facts = [
		{ label: 'Kind', value: unit.isCity ? 'City' : 'Municipality', extra: unit.isCapital ? ' · capital' : '' },
		{ label: 'Population', value: unit.population ? unit.population.toLocaleString() : '—', extra: unit.population ? ' (2024)' : '' },
		{ label: 'Barangays', value: String(unit.barangays.length), extra: '' },
		{ label: 'Peoples', value: town?.peoples.length ? town.peoples.join(', ') : '—', extra: '' },
	]

	return (
		<>
			<TravelMasthead
				kicker={area.name}
				name={unit.name}
				note={town?.summary ?? 'This town has not been researched for the guide yet.'}
			>
				<Rise delay={0.35} distance={14}>
					<dl className='grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4'>
						{facts.map((fact) => (
							<div key={fact.label}>
								<dt className='bb-label'>{fact.label}</dt>
								<dd className='mt-2.5 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>
									{fact.value}
									<span className='text-[var(--ink-3)]'>{fact.extra}</span>
								</dd>
							</div>
						))}
					</dl>
				</Rise>
			</TravelMasthead>

			<div className='bb-container bb-section grid gap-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-24'>
				<div className='min-w-0'>

			{town ? (
				<>
					{/* ---- Where to go, what to do -------------------------------- */}
					<section className='mt-20 first:mt-0'>
						<div>
							<SectionHead
								index='01'
								eyebrow='Where to go'
								title={town.whereToGo.length ? `${town.whereToGo.length} ${town.whereToGo.length === 1 ? 'place' : 'places'}` : 'Nothing listed'}
								titleMuted='a visitor can find.'
								size='sm'
							/>

							<div className='mt-10'>
								<div className='grid content-start gap-5 md:grid-cols-2'>
									{town.whereToGo.map((spot) => (
										<article key={spot.name} className='tv-card'>
											<span className='tv-kind'>{SPOT_KIND_LABEL[spot.kind] ?? spot.kind}</span>
											<h3 className='item-title-lg mt-3'>{spot.name}</h3>
											<p className='mt-3 text-[0.875rem] leading-7 text-[var(--ink-2)]'>{spot.summary}</p>
											<SourceLinks sources={spot.sources} />
										</article>
									))}
									{!town.whereToGo.length ? (
										<p className='text-[0.875rem] leading-7 text-[var(--ink-2)] md:col-span-2'>
											No attraction in {unit.name} is described in any source this guide found.
										</p>
									) : null}
								</div>


							</div>
						</div>
					</section>

					{/* ---- Food, eating, sleeping ---------------------------------- */}
					<section className='mt-20 first:mt-0'>
						<div>
							<SectionHead index='02' eyebrow='Food and lodging' title='What to eat,' titleMuted='and where to sleep.' size='sm' />

							<div className='mt-10 grid gap-10 md:grid-cols-2 xl:grid-cols-3 xl:gap-12'>
								<div>
									<p className='bb-label'>Local food</p>
									{town.food.length ? (
										<ul className='mt-4 grid gap-4'>
											{town.food.map((dish) => (
												<li key={dish.name} className='border-b border-[var(--rule-soft)] pb-4'>
													<span className='item-title'>{dish.name}</span>
													<p className='mt-1 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{dish.summary}</p>
												</li>
											))}
										</ul>
									) : (
										<p className='mt-4 text-[0.875rem] leading-7 text-[var(--ink-2)]'>
											See the <Link href='/food' className='rule-link'>region&rsquo;s food</Link>.
										</p>
									)}
								</div>
								<Listings
									label='Where to eat'
									items={town.eat}
									empty={town.eat.length ? null : 'No eatery listed in any source this guide found.'}
								/>
								<Listings
									label='Where to stay'
									items={town.stay}
									empty={town.stayNote ?? (town.stay.length ? null : 'No lodging listed.')}
								/>
							</div>

							<div className='mt-12'>
								<Caution label='Not a directory'>
									Every name here appears in at least one source, linked beside it. None was visited
									or verified by this guide, and none is a recommendation. Call ahead.
								</Caution>
							</div>
							{town.sources.length ? (
								<div className='mt-12 border-t border-[var(--rule)] pt-8'>
									<p className='bb-label'>Sources</p>
									<ul className='mt-4 grid gap-2 sm:grid-cols-2'>
										{town.sources.map((source) => (
											<li key={source.url} className='text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
												<a href={source.url} className='rule-link-quiet' rel='noopener' target='_blank'>
													{source.label}
												</a>
											</li>
										))}
									</ul>
								</div>
							) : null}
						</div>
					</section>

				</>
			) : null}

			{/* ---- The neighbours --------------------------------------------- */}
			<section className='mt-20 first:mt-0'>
				<div>
					<SectionHead
						index={town ? '03' : '01'}
						eyebrow={area.name}
						title='The other towns'
						titleMuted={`in ${area.name}.`}
						aside={
							<Link href={`/${area.slug}`} className='rule-link-quiet'>
								The area guide
							</Link>
						}
						size='sm'
					/>
					<div className='mt-10 grid gap-10'>
						<div className='max-w-[30rem]'>
							<TownMap area={area.slug} focus={unit.slug} />
						</div>
						<div className='flex flex-wrap content-start gap-2.5'>
							{siblings.map(({ unit: other }) => (
								<Link key={other.slug} href={`/${area.slug}/${other.slug}`} className='bb-btn bb-btn-ghost'>
									{other.name}
								</Link>
							))}
						</div>
					</div>
				</div>
			</section>
				</div>

				<aside className='order-first grid content-start gap-8 lg:order-none'>
					<LocatorMap areaSlug={area.slug} unit={{ psgc: unit.psgc, name: unit.name }} label={unit.name} />
					{town ? (
						<>
									<GateList label='What to do' items={town.whatToDo} />
									<div>
										<p className='bb-label'>Getting there</p>
										<p className='mt-3 text-[0.875rem] leading-7 text-[var(--ink-2)]'>{town.gettingThere}</p>
									</div>
									{town.caution ? <Caution label='Before you go'>{town.caution}</Caution> : null}
						</>
					) : null}
				</aside>
			</div>
		</>
	)
}
