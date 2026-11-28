import { listSchoolNeeds } from '@betterbarmm/db'
import type { Icon } from '@phosphor-icons/react'
import { ArrowRightIcon, ArrowUpRightIcon, ChalkboardTeacherIcon, CheckCircleIcon, CoinsIcon, GraduationCapIcon, ListBulletsIcon, MagnifyingGlassIcon, MapPinIcon, MapTrifoldIcon, MinusCircleIcon, NewspaperIcon, PlusIcon, StudentIcon, WarningCircleIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { Hero } from './_components/hero'
import { NeedCard } from './_components/need-card'
import { longDate, peso } from './_components/parts'
import { SchoolExplorer } from './_components/school-explorer'
import {
	PLAN_URL,
	TYPES,
	areaNameOf,
	countBy,
	educationNews,
	largestSchools,
	latest,
	latestSY,
	ministryFigures,
	ministryValue,
	latestYear,
	mapSchools,
	outcomes,
	pupilsTotal,
	schoolAreas,
	schools,
	spending,
	townLoads,
	type Outcome,
} from './_lib/education'
import { NEEDS_LIVE } from './_lib/needs'
import { AUDIENCE, isScholarship, offerHref, offersTotal, offices } from './_lib/services'

// Newly approved needs show within a minute.
export const revalidate = 60

const H2 = 'dv-title'
const NOTE = 'max-w-[38rem] text-[0.9375rem] leading-[1.7] text-[var(--ink-3)]'
/** A rounded card, as travel's (user decision: the travel look). */
const CARD = 'rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] sm:p-7'
const CARD_LINK = `${CARD} flex flex-col transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))]`
const ICON_TILE = 'grid size-11 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'
const HEAD = 'flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-16'
const TH = 'px-3 py-2.5 text-left font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TD = 'px-3 py-2.5 align-top'

/* Each status in words and in a tone; the words carry it, the tone only repeats them. */
/** Each outcome's standing: a band across the card's head in its tone, with an icon so it is never colour alone. */
const STATUS = {
	met: { label: 'Target met', band: 'bg-[var(--tone-done-bg)] text-[var(--tone-done-fg)]', icon: CheckCircleIcon },
	short: { label: 'Short of target', band: 'bg-[var(--tone-move-bg)] text-[var(--tone-move-fg)]', icon: WarningCircleIcon },
	none: { label: 'No target set', band: 'bg-[var(--tone-idle-bg)] text-[var(--tone-idle-fg)]', icon: MinusCircleIcon },
} as const

export default async function EducationHome() {
	const needs = NEEDS_LIVE ? await listSchoolNeeds({ limit: 3 }) : []
	const towns = new Set(schools.map((s) => s.town)).size
	const news = educationNews(6)
	// The scholarships first, then whatever else the education ministry offers.
	const offers = offices
		.flatMap((o) => o.offers.map((x) => ({ ...x, office: o.acronym ?? o.name, slug: o.slug })))
		.sort((a, b) => Number(isScholarship(b)) - Number(isScholarship(a)))
		.slice(0, 4)
	const top = Math.max(...spending.map((s) => s.total))

	return (
		<>
			{/* The front door in the travel look (user decision): the crimson header under the clear bars, the headline,
			    the search (the one thing most come to do) as a white pill, and the ways in for everyone else. */}
			<Hero
				center
				kicker='Education · Bangsamoro'
				title={
					<>
						Every school, <span className='text-white/60'>in one place</span>
					</>
				}
				lede='Public and private, from the village elementary school to the university: where each stands, how the region’s learners are doing against the plan, the scholarships on offer and what the budget gives education.'
			>
				<form method='get' action='/schools' role='search' className='mx-auto mt-9 flex w-full max-w-2xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 text-left shadow-[0_24px_50px_-24px_rgba(0,0,0,0.55)]'>
					<label className='sr-only' htmlFor='school-search'>
						Find a school
					</label>
					{/* Fixed colours: inside the header, --paper and --ink are re-pointed to its crimson ground. */}
					<MagnifyingGlassIcon size={20} className='shrink-0 text-[#8f2328]' aria-hidden='true' />
					<input
						id='school-search'
						name='q'
						type='search'
						autoComplete='off'
						placeholder='A school, a municipality, a school ID…'
						className='h-11 min-w-0 flex-1 bg-transparent text-[1rem] text-[#191713] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
					/>
					<button type='submit' className='h-11 shrink-0 cursor-pointer rounded-full bg-[#8f2328] px-6 font-[family-name:var(--font-display)] text-[0.875rem] font-semibold text-white transition hover:brightness-110'>
						Search
					</button>
				</form>
				<div className='mt-6 flex flex-wrap justify-center gap-2.5'>
					{(
						[
							['/map', 'Open the map', MapTrifoldIcon],
							['/schools', 'By municipality', ListBulletsIcon],
							['/services', 'Scholarships', StudentIcon],
						] as const
					).map(([href, label, Glyph]) => (
						<Link key={href} href={href} className='dv-btn dv-btn-glass !px-4 !py-2.5 !text-[0.875rem]'>
							<Glyph size={16} weight='duotone' aria-hidden='true' />
							{label}
						</Link>
					))}
				</div>
			</Hero>

			{/* The four figures that size the region's schooling, as cards under the header; each opens the page behind it. */}
			<section className='edu-under bb-container'>
				<dl className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{(
						[
							[schools.length.toLocaleString('en-PH'), `Schools in ${towns} municipalities and cities`, '/map', ChalkboardTeacherIcon],
							[pupilsTotal.toLocaleString('en-PH'), `Learners in school, SY ${latestSY}`, '/schools', StudentIcon],
							[countBy('type', 'College or university').toLocaleString('en-PH'), 'Colleges and universities', `/schools?type=${encodeURIComponent('College or university')}`, GraduationCapIcon],
							[peso(latest.totals.total), `For education in FY ${latestYear}`, '/budget', CoinsIcon],
						] as const
					).map(([value, label, href, Glyph]) => (
						<Link
							key={label}
							href={href}
							className='group flex items-start justify-between gap-3 rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))]'
						>
							<span className='flex flex-col-reverse'>
								<dt className='mt-2 text-[0.84375rem] leading-snug text-[var(--ink-3)]'>{label}</dt>
								<dd className='num font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.35rem)] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>{value}</dd>
							</span>
							<span className={ICON_TILE}>
								<Glyph size={20} weight='duotone' aria-hidden='true' />
							</span>
						</Link>
					))}
				</dl>
			</section>

			{/* ---- How learners are doing ---- */}
			{outcomes.length ? (
				<section className='bb-container dv-section'>
					<div className={HEAD}>
						<h2 className={H2}>How the region&rsquo;s learners are doing</h2>
						<p className={NOTE}>
							The education results the{' '}
							<a href={PLAN_URL} className='rule-link'>
								Bangsamoro Development Plan
							</a>{' '}
							tracks, each at its latest published figure. Where the plan set a target, the tick on the bar marks it.
						</p>
					</div>
					<ul className='mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3'>
						{outcomes.map((o) => (
							<li key={o.id}>
								<OutcomeCard o={o} />
							</li>
						))}
					</ul>
					<p className='mt-8 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
						Literacy is PSA&rsquo;s 2024 survey, the lowest of any region, and probably still counts Sulu; the school figures are the
						ministry&rsquo;s for school year 2024–25. Functional literacy fell mostly because PSA changed what it measures in 2024. Every
						figure&rsquo;s source is on the{' '}
						<a href={PLAN_URL} className='rule-link'>
							scorecard
						</a>
						.
					</p>
				</section>
			) : null}

			{/* ---- What the ministry says ---- */}
			{ministryFigures.length ? (
				<section className='tv-wash'>
					<div className='bb-container dv-section'>
						<div className={HEAD}>
							<h2 className={H2}>What the ministry says</h2>
							<p className={NOTE}>
								MBHTE publishes no data of its own, so these are its figures as it and the Parliament stated them, each with where. They
								count more than DepEd does, madaris and learning centres among them, and do not always agree with each other.
							</p>
						</div>
						<ul className='mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3'>
							{ministryFigures.map((f) => (
								<li key={f.label} className={`${CARD} flex flex-col`}>
									<span className='w-fit rounded-full bg-[color-mix(in_srgb,var(--accent)_9%,transparent)] px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[var(--accent)]'>{f.topic}</span>
									<span className='num mt-4 font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)]'>
										{ministryValue(f)}
									</span>
									<span className='mt-2 text-[0.9375rem] font-semibold leading-snug text-[var(--ink)]'>{f.label}</span>
									{f.scope ? <span className='mt-1.5 text-[0.8125rem] leading-6 text-[var(--ink-2)]'>{f.scope}</span> : null}
									{f.breakdown ? (
										<dl className='mt-4 grid grid-cols-2 gap-x-6 gap-y-1 rounded-2xl bg-[var(--paper-2)] p-4 text-[0.75rem] leading-5'>
											{Object.entries(f.breakdown).map(([k, v]) => (
												<div key={k} className='flex items-baseline justify-between gap-2'>
													<dt className='min-w-0 truncate text-[var(--ink-3)]' title={k}>
														{k}
													</dt>
													<dd className='num shrink-0 font-semibold text-[var(--ink)]'>{v.toLocaleString('en-PH')}</dd>
												</div>
											))}
										</dl>
									) : null}
									<span className='mt-auto pt-4 text-[0.71875rem] leading-5 text-[var(--ink-3)]'>
										{f.saidBy}.{' '}
										<a href={f.source.url} target='_blank' rel='noreferrer' className='rule-link'>
											{f.source.outlet}
											{f.source.date ? `, ${longDate(f.source.date)}` : ''}
										</a>
									</span>
								</li>
							))}
						</ul>
					</div>
				</section>
			) : null}

			{/* ---- The map ---- */}
			<section className='bb-container dv-section'>
				<div className={HEAD}>
					<h2 className={H2}>Where the schools are</h2>
					<p className={NOTE}>
						Each dot a school, coloured by its kind: every school on DepEd&rsquo;s list for school year {latestSY}, public and private,
						and the madaris and colleges OpenStreetMap and Wikipedia add. Open the map to filter it and choose a school.
					</p>
				</div>
				<div className='mt-10 lg:mt-12'>
					<SchoolExplorer year={latestSY} schools={mapSchools} areas={schoolAreas.filter((a) => a.total).map((a) => ({ slug: a.slug, name: a.name }))} />
				</div>
			</section>

			{/* ---- Help for students ---- */}
			{offers.length ? (
				<section className='tv-wash-flip'>
					<div className='bb-container dv-section'>
						<div className={HEAD}>
							<h2 className={H2}>Scholarships and help for students</h2>
							<p className={NOTE}>
								{offersTotal} programs and services for students, teachers and schools, from {offices.length} offices, as each office
								states it.
							</p>
						</div>
						<ul className='mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4'>
							{offers.map((x) => (
								<li key={x.slug + x.name}>
									<a href={offerHref(x.slug, x)} target='_blank' rel='noreferrer' className={`${CARD_LINK} group h-full`}>
										<span className='flex items-start justify-between gap-3'>
											<span className={ICON_TILE}>
												<StudentIcon size={20} weight='duotone' aria-hidden='true' />
											</span>
											<span className='grid size-9 place-items-center rounded-full border border-[var(--rule)] text-[var(--ink-3)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white'>
												<ArrowUpRightIcon size={14} weight='bold' aria-hidden='true' />
											</span>
										</span>
										<span className='mt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>{x.office}</span>
										<span className='mt-1.5 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{x.name}</span>
										{x.summary ? <span className='mt-2 line-clamp-4 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{x.summary}</span> : null}
										<span className='mt-auto pt-5 text-[0.75rem] text-[var(--ink-3)]'>For {x.for.map((a) => AUDIENCE[a] ?? a).join(', ').toLowerCase()}</span>
									</a>
								</li>
							))}
						</ul>
						<p className='mt-8 flex justify-end'>
							<Link href='/services' className='dv-pill'>
								All {offersTotal}, with how to apply
								<ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
							</Link>
						</p>
					</div>
				</section>
			) : null}

			{/* ---- What schools need ---- */}
			{NEEDS_LIVE ? (
				<section className='bb-container dv-section'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
						<div>
							<h2 className={H2}>What schools need</h2>
							<p className='dv-lede'>
								{needs.length
									? 'Classrooms, chairs, books, teachers, water: posted by the people who know each school best, and checked by our editors.'
									: 'Nothing posted yet. If you teach, study or have a child at a school short of classrooms, chairs, books, teachers or water, be the first to say so. An editor checks every post.'}
							</p>
						</div>
						<Link href='/needs/new' className='dv-btn dv-btn-accent shrink-0'>
							<PlusIcon size={14} weight='bold' aria-hidden='true' />
							Post a need
						</Link>
					</div>
					{needs.length ? (
						<>
							<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
								{needs.map((n) => (
									<li key={n.id}>
										<NeedCard need={n} />
									</li>
								))}
							</ul>
							<p className='mt-8 flex justify-end'>
								<Link href='/needs' className='dv-pill'>
									Every need
									<ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
								</Link>
							</p>
						</>
					) : null}
				</section>
			) : null}

			{/* ---- Size and load ---- */}
			<section className='bb-container dv-section'>
				<div className={HEAD}>
					<h2 className={H2}>The biggest schools, the busiest towns</h2>
					<p className={NOTE}>
						Learners in school year {latestSY}, as DepEd counts them school by school. Classrooms and teachers are published only for
						public schools, so learners per school is the nearest measure of load there is for all of them.
					</p>
				</div>
				<div className='mt-10 grid gap-4 lg:mt-12 lg:grid-cols-2'>
					<Ranked
						title='Most pupils'
						icon={ChalkboardTeacherIcon}
						rows={largestSchools.slice(0, 8).map((s) => ({ key: s.id, href: `/schools/${s.id}`, name: s.name, sub: `${s.townName}, ${areaNameOf(s.area)}`, value: s.pupils! }))}
					/>
					<Ranked
						title='Most pupils per school, by town'
						icon={MapPinIcon}
						rows={townLoads
							.filter((t) => t.counted >= 3)
							.slice(0, 8)
							.map((t) => ({
								key: t.town,
								href: `/schools?town=${t.town}`,
								name: t.townName,
								sub: `${areaNameOf(t.area)} · ${t.schools} schools, ${t.pupils.toLocaleString('en-PH')} pupils`,
								value: t.perSchool,
							}))}
					/>
				</div>
			</section>

			{/* ---- By area ---- */}
			<section className='tv-wash'>
				<div className='bb-container dv-section'>
					<div className={HEAD}>
						<h2 className={H2}>By area</h2>
						<p className={NOTE}>
							The Special Geographic Area&rsquo;s schools, which DepEd still files under their old North Cotabato towns, are counted with
							the SGA town their barangay is now in.
						</p>
					</div>
					<div className='mt-10 overflow-x-auto rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-2 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] lg:mt-12'>
						<table className='w-full min-w-[52rem] text-[0.875rem]'>
							<thead className='border-b border-[var(--rule)]'>
								<tr>
									<th className={TH}>Area</th>
									{TYPES.map((t) => (
										<th key={t} className={`${TH} !text-right`}>
											{t}
										</th>
									))}
									<th className={`${TH} !text-right`}>All</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-[var(--rule-soft)]'>
								{schoolAreas.map((a) => (
									<tr key={a.slug} className='transition hover:bg-[var(--paper-2)]'>
										<td className={TD}>
											{a.total ? (
												<Link href={`/schools?area=${a.slug}`} className='rule-link font-semibold'>
													{a.name}
												</Link>
											) : (
												<span className='font-semibold text-[var(--ink-3)]'>{a.name}</span>
											)}
										</td>
										{TYPES.map((t) => (
											<td key={t} className={`${TD} num text-right`}>
												{a.byType[t] ? a.byType[t]!.toLocaleString('en-PH') : '–'}
											</td>
										))}
										<td className={`${TD} num text-right font-semibold`}>{a.total ? a.total.toLocaleString('en-PH') : '–'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* ---- The budget ---- */}
			<section className='bb-container dv-section'>
				<Link
					href='/budget'
					className='group grid gap-8 rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-7 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end'
				>
					<span>
						<span className={ICON_TILE}>
							<CoinsIcon size={20} weight='duotone' aria-hidden='true' />
						</span>
						<span className='mt-5 block text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>The budget</span>
						<span className='mt-2 block font-[family-name:var(--font-display)] text-[1.5rem] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)]'>
							The education ministry was given {peso(latest.totals.total)} for FY {latestYear}, {spending.at(-1)!.share.toFixed(1)}% of the
							regional budget.
						</span>
						<span className='mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 font-[family-name:var(--font-display)] text-[0.875rem] font-semibold text-white transition group-hover:brightness-110'>
							Where it goes, and who buys for the schools
							<ArrowRightIcon size={15} weight='bold' className='transition group-hover:translate-x-1' aria-hidden='true' />
						</span>
					</span>
					<span className='block' aria-hidden='true'>
						<span className='flex h-32 items-end gap-2 sm:gap-3'>
							{spending.map((s) => (
								<span key={s.year} className='flex h-full flex-1 flex-col items-center justify-end'>
									<span className='num mb-1 text-[0.65625rem] text-[var(--ink-3)]'>{(s.total / 1e9).toFixed(1)}B</span>
									<span className='w-full max-w-12 rounded-t-md bg-[var(--accent)]' style={{ height: `calc(${(s.total / top) * 100}% - 1.25rem)` }} />
								</span>
							))}
						</span>
						<span className='mt-1.5 flex gap-2 border-t border-[var(--rule)] pt-1.5 sm:gap-3'>
							{spending.map((s) => (
								<span key={s.year} className='num flex-1 text-center text-[0.6875rem] text-[var(--ink-3)]'>
									{s.year}
								</span>
							))}
						</span>
					</span>
				</Link>
			</section>

			{/* ---- In the news ---- */}
			{news.length ? (
				<section className='tv-wash'>
					<div className='bb-container dv-section'>
						<div className={HEAD}>
							<h2 className={H2}>In the news</h2>
							<p className={NOTE}>The latest headlines about the region&rsquo;s schools, students and teachers, each linked to the outlet that reported it.</p>
						</div>
						<ul className='mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3'>
							{news.map((n) => (
								<li key={n.url}>
									<a href={n.url} target='_blank' rel='noreferrer' className={`${CARD_LINK} group h-full`}>
										<span className='flex items-center gap-2 text-[0.75rem] text-[var(--ink-3)]'>
											<NewspaperIcon size={16} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
											{n.source} · {longDate(n.published_at.slice(0, 10))}
										</span>
										<span className='mt-3 font-[family-name:var(--font-display)] text-[1rem] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]'>
											{n.title}
											<ArrowUpRightIcon size={12} weight='bold' className='ml-1 inline align-baseline text-[var(--ink-3)]' aria-hidden='true' />
										</span>
									</a>
								</li>
							))}
						</ul>
						<p className='mt-8 flex justify-end'>
							<a href='https://betterbarmm.com/news' className='dv-pill'>
								All the region&rsquo;s news
								<ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
							</a>
						</p>
					</div>
				</section>
			) : null}
		</>
	)
}

/** One plan result: the figure, a bar to its target, the verdict, and what it measures. */
function OutcomeCard({ o }: { o: Outcome }) {
	const pct = o.unit === '%'
	const goal = o.target?.low ?? null
	const scale = pct ? 100 : Math.max(o.latest.value, goal ?? 0) * 1.15
	const s = STATUS[o.status]
	const at = goal != null ? (goal / scale) * 100 : null
	// Redesigned (user decision): the standing as a tinted band across the head with its icon and the year; the name, the
	// figure, a bar on its track with the target ticked and named under it; then what it means.
	return (
		<article className='flex h-full flex-col overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)]'>
			<div className={`flex items-center gap-2.5 px-6 py-3.5 sm:px-7 ${s.band}`}>
				<s.icon size={18} weight='fill' aria-hidden='true' />
				<span className='font-[family-name:var(--font-display)] text-[0.8125rem] font-semibold'>{s.label}</span>
				<span className='num ml-auto text-[0.75rem] font-semibold opacity-80'>{o.latest.year}</span>
			</div>
			<div className='flex flex-1 flex-col p-6 sm:p-7'>
				<h3 className='font-[family-name:var(--font-display)] text-[1.0625rem] font-bold leading-snug text-[var(--ink)]'>{o.name.replace(/\s*\(.*\)$/, '')}</h3>
				<p className='mt-4 flex items-baseline gap-2'>
					<span className='num font-[family-name:var(--font-display)] text-[2.75rem] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)]'>
						{pct ? `${o.latest.value.toFixed(1)}%` : o.latest.value.toLocaleString('en-PH')}
					</span>
					{pct ? null : <span className='text-[0.875rem] text-[var(--ink-3)]'>{o.unit.replace(/\s*\(.*\)$/, '')}</span>}
				</p>
				<div className={`relative mt-5 ${at != null ? 'mb-7' : ''}`} role='img' aria-label={o.verdict}>
					<div className='h-3 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]'>
						<div className='h-full rounded-full bg-[var(--accent)]' style={{ width: `${Math.min((o.latest.value / scale) * 100, 100)}%` }} />
					</div>
					{at != null ? (
						<>
							<span className='absolute -top-1 h-5 w-[3px] -translate-x-1/2 rounded-full bg-[var(--ink)] ring-2 ring-[var(--paper)]' style={{ left: `${at}%` }} aria-hidden='true' />
							<span
								className='absolute top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[0.6875rem] font-semibold text-[var(--ink-2)]'
								style={{ left: `${Math.min(Math.max(at, 12), 88)}%` }}
								aria-hidden='true'
							>
								Target {pct ? `${goal}%` : goal!.toLocaleString('en-PH')}
							</span>
						</>
					) : null}
				</div>
				<p className='mt-4 text-[0.875rem] font-semibold leading-6 text-[var(--ink)]'>{o.verdict}.</p>
				<p className='mt-1.5 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>{o.explain}</p>
			</div>
		</article>
	)
}

/** A numbered list with a figure at the end of each row, on a rounded card. */
function Ranked({ title, icon: Glyph, rows }: { title: string; icon: Icon; rows: { key: string; href: string; name: string; sub: string; value: number }[] }) {
	return (
		<div className={CARD}>
			<h3 className='flex items-center gap-3 font-[family-name:var(--font-display)] text-[1.125rem] font-bold text-[var(--ink)]'>
				<span className={ICON_TILE}>
					<Glyph size={20} weight='duotone' aria-hidden='true' />
				</span>
				{title}
			</h3>
			<ol className='mt-5 divide-y divide-[var(--rule-soft)]'>
				{rows.map((r, i) => (
					<li key={r.key} className='grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-3 py-3 text-[0.875rem]'>
						<span className='num grid size-6 place-items-center rounded-full bg-[var(--paper-2)] text-[0.6875rem] font-semibold text-[var(--ink-3)]'>{i + 1}</span>
						<span>
							<Link href={r.href} className='rule-link font-semibold'>
								{r.name}
							</Link>
							<span className='block text-[0.75rem] text-[var(--ink-3)]'>{r.sub}</span>
						</span>
						<span className='num font-semibold text-[var(--ink)]'>{r.value.toLocaleString('en-PH')}</span>
					</li>
				))}
			</ol>
		</div>
	)
}
