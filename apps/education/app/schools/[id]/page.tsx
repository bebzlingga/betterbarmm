import { listSchoolNeeds } from '@betterbarmm/db'
import { PlusIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NeedCard } from '../../_components/need-card'
import { NEEDS_LIVE } from '../../_lib/needs'
import { Masthead } from '../../_components/parts'
import { SchoolMap } from '../../_components/school-map'
import { areaNameOf, districtLabel, enrolmentYears, historyById, isExact, latestSY, nearbySchools, schoolById, schools, sizeOf, syLabel, toMapSchool } from '../../_lib/education'

// A need approved for the school shows within a minute.
export const revalidate = 60

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const school = schoolById.get((await params).id)
	if (!school) return { title: 'School not found', robots: { index: false, follow: true } }
	return { title: school.name, description: `${school.name}, a ${school.management === 'Private' ? 'private' : school.management === 'Public' ? 'public' : ''} ${school.level.toLowerCase()} school in ${school.townName}, ${areaNameOf(school.area)}: its school ID, district, size${NEEDS_LIVE ? ' and what it needs' : ''}.`.replace(/\s+/g, ' ') }
}

export default async function SchoolPage({ params }: Props) {
	const school = schoolById.get((await params).id)
	if (!school) notFound()
	const needs = NEEDS_LIVE ? await listSchoolNeeds({ school: school.id }) : []
	const neighbours = schools.filter((s) => s.town === school.town && s.id !== school.id)
	const nearby = nearbySchools(school)
	const exact = isExact(school)
	// Every count the records hold for it, newest first: DepEd's school years, then the 2019 list's two.
	const counts: [string, number][] = [
		...enrolmentYears
			.filter((y) => school.enrolment[y])
			.reverse()
			.map((y): [string, number] => [syLabel(y), school.enrolment[y]!]),
		...(school.pupils2015 ? [['2015–16', school.pupils2015] as [string, number]] : []),
		...(school.pupils2012 ? [['2012–13', school.pupils2012] as [string, number]] : []),
	]
	const year = (y: string) => counts.find(([k]) => k === syLabel(y))?.[1]
	const prev = year(enrolmentYears.at(-2) ?? '')
	const change = school.pupils && prev ? Math.round(((school.pupils - prev) / prev) * 100) : null

	const deped = school.source === 'deped'
	const history = historyById.get(school.id)
	const facts: [string, React.ReactNode][] = [
		...(deped ? [['School ID', <span key='id' className='num'>{school.id}</span>] as [string, React.ReactNode]] : []),
		['Kind', school.type],
		...(school.level !== school.type ? [['Level', school.level] as [string, React.ReactNode]] : []),
		['Run by', school.sector === 'State or local college' ? 'Public: a state or local college' : school.management === 'Not stated' ? 'Not stated in the source' : school.management],
		...(school.district || school.division ? [['District', districtLabel(school)] as [string, React.ReactNode]] : []),
		['Town', `${school.townName}, ${areaNameOf(school.area)}`],
		...(school.founded || history?.founded ? [['Founded', school.founded ?? history?.founded] as [string, React.ReactNode]] : []),
		...(deped ? [[
			'Learners',
			counts.length ? (
				<span key='p'>
					{school.pupils ? (
						<>
							<span className='num'>{school.pupils.toLocaleString('en-PH')}</span> in school year {latestSY}
							{change != null && change !== 0 ? (
								<span className='text-[var(--ink-3)]'>
									, {change > 0 ? 'up' : 'down'} {Math.abs(change)}% on the year before
								</span>
							) : null}
						</>
					) : (
						`None recorded for ${latestSY}`
					)}
					<span className='mt-1 block text-[0.8125rem] text-[var(--ink-3)]'>
						{counts
							.filter(([k]) => k !== latestSY)
							.map(([k, n]) => `${n.toLocaleString('en-PH')} in ${k}`)
							.join(' · ')}
					</span>
				</span>
			) : (
				'Not recorded'
			),
		] as [string, React.ReactNode]] : []),
	]

	return (
		<>
			<Masthead kicker={`School · ${school.townName}, ${areaNameOf(school.area)}`} name={school.name} stacked note={sizeOf(school.pupils) ?? undefined} />

			<section className='bb-container bb-section'>
				<div className='grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]'>
					<div>
						<dl className='divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]'>
							{facts.map(([k, v]) => (
								<div key={k} className='grid gap-1 py-3 sm:grid-cols-[8rem_1fr]'>
									<dt className='font-mono text-[0.65625rem] font-semibold uppercase leading-6 tracking-[0.12em] text-[var(--ink-3)]'>{k}</dt>
									<dd className='text-[0.9375rem] text-[var(--ink)]'>{v}</dd>
								</div>
							))}
						</dl>
						<p className='mt-5 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
							{school.note ? <span className='block pb-2 text-[var(--ink-2)]'>{school.note}</span> : null}
							{deped
								? `On the Department of Education’s list for school year ${latestSY}, with its learners for each year DepEd publishes; the 2012–13 and 2015–16 counts and where it stands are from DepEd’s 2019 masterlist.`
								: school.source === 'wikipedia'
									? 'Not on the Department of Education’s list nor on OpenStreetMap: it is here as Wikipedia lists it, and placed where Wikidata puts it or at its town.'
									: 'Not on the Department of Education’s list: it is here as OpenStreetMap names and maps it. Whether it is public or private is taken from OpenStreetMap or from its name.'}{' '}
							{school.url ? (
								<>
									<a href={school.url} target='_blank' rel='noreferrer' className='rule-link'>
										Its record
									</a>
									.{' '}
								</>
							) : null}
							<a href={`https://betterbarmm.com/report?url=${encodeURIComponent(`https://education.betterbarmm.com/schools/${school.id}`)}`} className='rule-link'>
								Something wrong?
							</a>
						</p>
					</div>
					<div>
						{school.image ? (
							<figure className='mb-6'>
								<img src={school.image.url} alt={school.image.caption} className='max-h-[26rem] w-full object-cover' />
								<figcaption className='mt-2 text-[0.75rem] text-[var(--ink-3)]'>
									{school.image.caption}.{' '}
									<a href={school.image.page} target='_blank' rel='noreferrer' className='rule-link'>
										{school.image.author}, {school.image.license}
									</a>
								</figcaption>
							</figure>
						) : null}
						{school.lat != null && school.lon != null ? (
							<>
								<SchoolMap schools={schools.filter((s) => s.area === school.area && s.lat != null).map(toMapSchool)} focus={{ lon: school.lon, lat: school.lat, zoom: exact ? 14 : 11 }} className='h-[22rem]' />
								<p className='mt-2 text-[0.75rem] text-[var(--ink-3)]'>
									{school.placed === 'masterlist'
										? 'Where DepEd’s list puts it.'
										: school.placed === 'openstreetmap'
											? 'Where OpenStreetMap has a school of this name in this town.'
											: school.placed === 'wikidata'
												? 'Where Wikidata puts it.'
												: `Not mapped yet: the ring is ${school.townName}’s centre, not the school.`}
								</p>
							</>
						) : null}
					</div>
				</div>
			</section>

			{history ? (
				<section className='bb-container pb-[clamp(3rem,6vw,5rem)]'>
					<div className='max-w-[48rem]'>
						<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>History</h2>
						<div className='mt-5 space-y-4 text-[0.96875rem] leading-7 text-[var(--ink-2)]'>
							{history.history.map((para, i) => (
								<p key={i}>{para}</p>
							))}
						</div>
						<ul className='mt-6 space-y-1 border-t border-[var(--rule)] pt-4 text-[0.78125rem] text-[var(--ink-3)]'>
							{history.sources.map((src) => (
								<li key={src.url}>
									<a href={src.url} target='_blank' rel='noreferrer' className='rule-link'>
										{src.title}
									</a>
								</li>
							))}
						</ul>
					</div>
				</section>
			) : null}

			{NEEDS_LIVE ? (
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
						<div>
							<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>What it needs</h2>
							<p className='mt-2 max-w-[40rem] text-[0.875rem] leading-6 text-[var(--ink-3)]'>
								Posted by its teachers, students and parents, and checked by an editor.
							</p>
						</div>
						<Link href={`/needs/new?school=${school.id}`} className='bb-btn bb-btn-accent shrink-0'>
							<PlusIcon size={14} weight='bold' aria-hidden='true' />
							Post a need for this school
						</Link>
					</div>
					{needs.length ? (
						<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
							{needs.map((n) => (
								<li key={n.id}>
									<NeedCard need={n} school={false} />
								</li>
							))}
						</ul>
					) : (
						<p className='mt-8 text-[0.9375rem] text-[var(--ink-2)]'>Nothing posted for {school.name} yet.</p>
					)}
				</div>
			</section>
			) : null}

			{nearby.length ? (
				<section className='bb-container pt-[clamp(3rem,6vw,5rem)]'>
					<h2 className='text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>Nearest schools</h2>
					<p className='mt-2 text-[0.8125rem] text-[var(--ink-3)]'>As the crow flies, among the schools pinned where they stand.</p>
					<ul className='mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4'>
						{nearby.map(({ school: s, km }) => (
							<li key={s.id} className='flex items-baseline justify-between gap-4 border-b border-[var(--rule-soft)] py-2.5'>
								<span>
									<Link href={`/schools/${s.id}`} className='rule-link text-[0.875rem] font-semibold'>
										{s.name}
									</Link>
									<span className='mt-1.5 block text-[0.75rem] text-[var(--ink-3)]'>
										{s.level}
										{s.town !== school.town ? ` · ${s.townName}` : ''}
									</span>
								</span>
								<span className='num shrink-0 text-[0.8125rem] text-[var(--ink-3)]'>{km < 10 ? km.toFixed(1) : Math.round(km)} km</span>
							</li>
						))}
					</ul>
				</section>
			) : null}

			{neighbours.length ? (
				<section className='bb-container bb-section'>
					<h2 className='text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
						Other schools in {school.townName} <span className='text-[0.875rem] font-semibold text-[var(--ink-3)]'>{neighbours.length}</span>
					</h2>
					<ul className='mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4'>
						{neighbours.map((s) => (
							<li key={s.id} className='border-b border-[var(--rule-soft)] py-2.5'>
								<Link href={`/schools/${s.id}`} className='rule-link text-[0.875rem] font-semibold'>
									{s.name}
								</Link>
								<span className='mt-1.5 block text-[0.75rem] text-[var(--ink-3)]'>
									{s.level}
									{s.pupils ? ` · ${s.pupils.toLocaleString('en-PH')} learners` : ''}
								</span>
							</li>
						))}
					</ul>
				</section>
			) : null}
		</>
	)
}
