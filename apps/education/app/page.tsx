import { listSchoolNeeds } from '@betterbarmm/db'
import { LineReveal, Rise } from '@betterbarmm/editorial'
import { ArrowRightIcon, ArrowUpRightIcon, MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
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

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const NOTE = 'max-w-[38rem] text-[0.875rem] leading-6 text-[var(--ink-3)] lg:text-right'
const HEAD = 'flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'
const TH = 'px-3 py-2.5 text-left font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TD = 'px-3 py-2.5 align-top'

/* Each status in words and in a tone; the words carry it, the tone only repeats them. */
const STATUS = {
	met: { label: 'Target met', cls: 'bg-[var(--tone-done-bg)] text-[var(--tone-done-fg)]' },
	short: { label: 'Short of target', cls: 'bg-[var(--tone-move-bg)] text-[var(--tone-move-fg)]' },
	none: { label: 'No target set', cls: 'bg-[var(--tone-idle-bg)] text-[var(--tone-idle-fg)]' },
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
			{/* The front door, drawn as betterbarmm.com's is: one centred column on the crimson ground under a warm light,
			    label, headline, standfirst, the search (the one thing most come to do) and the ways in for everyone else. */}
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -top-[22rem] left-1/2 h-[40rem] w-[64rem] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.75)_0%,rgba(255,170,40,0.35)_38%,transparent_70%)]! opacity-80!'
				/>
				<div className='bb-container relative py-20 lg:py-28'>
					<div className='mx-auto max-w-5xl text-center'>
						<Rise distance={14}>
							<p className='bb-label'>Education · Bangsamoro</p>
						</Rise>
						<LineReveal
							lines={[
								<span key='line'>
									Every school, <span className='bb-mute'>in one place.</span>
								</span>,
							]}
							delay={0.08}
							className='bb-display-md mt-5 text-[var(--ink)] [font-size:clamp(2.4rem,11vw,3.4rem)]! sm:[font-size:clamp(1.6rem,6.4vw,5rem)]! sm:text-nowrap!'
						/>
						<Rise delay={0.3} distance={16}>
							<p className='mx-auto mt-6 max-w-xl text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
								Public and private, from the village elementary school to the university: where each stands, how the region&rsquo;s learners are
								doing against the plan, the scholarships on offer and what the budget gives education.
							</p>
						</Rise>
						<Rise delay={0.4} distance={14}>
							<form method='get' action='/schools' role='search' className='mx-auto mt-8 flex max-w-xl text-left'>
								<label className='sr-only' htmlFor='school-search'>
									Find a school
								</label>
								{/* Fixed colours: inside the band, --paper and --ink are re-pointed to its crimson ground. */}
								<span className='flex h-12 min-w-0 flex-1 items-center gap-3 bg-white px-4 text-[#191713]'>
									<MagnifyingGlassIcon size={18} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
									<input
										id='school-search'
										name='q'
										type='search'
										autoComplete='off'
										placeholder='A school, a town, a school ID…'
										className='min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
									/>
								</span>
								<button type='submit' className='h-12 shrink-0 cursor-pointer border-l border-[#e7e2d8] bg-white px-5 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-[#8f2328] transition hover:bg-[#f7f3ec]'>
									Search
								</button>
							</form>
						</Rise>
						<Rise delay={0.5} distance={12}>
							<p className='mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[0.875rem] font-semibold'>
								{[
									['/map', 'Open the map'],
									['/schools', 'Town by town'],
									['/services', 'Scholarships'],
								].map(([href, label]) => (
									<Link key={href} href={href} className='inline-flex items-center gap-1.5 text-[var(--ink)] underline decoration-white/40 underline-offset-4 hover:decoration-white'>
										{label} <ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
									</Link>
								))}
							</p>
						</Rise>
					</div>
				</div>
			</section>

			{/* The four figures that size the region's schooling, in the band betterbarmm.com gives its marquee; each opens the page behind it. */}
			<section className='border-b border-[var(--rule)] bg-[var(--paper-2)]'>
				<dl className='bb-container grid grid-cols-2 lg:grid-cols-4'>
					{[
						[schools.length.toLocaleString('en-PH'), `Schools in ${towns} towns and cities`, '/map'],
						[pupilsTotal.toLocaleString('en-PH'), `Learners in school, SY ${latestSY}`, '/schools'],
						[countBy('type', 'College or university').toLocaleString('en-PH'), 'Colleges and universities', `/schools?type=${encodeURIComponent('College or university')}`],
						[peso(latest.totals.total), `For education in FY ${latestYear}`, '/budget'],
					].map(([value, label, href], i) => (
						<div
							key={label}
							className={`group relative flex flex-col-reverse justify-end py-7 ${i % 2 ? 'pl-5 sm:pl-8' : 'pr-5 sm:pr-8'} ${i % 2 ? 'border-l border-[var(--rule)]' : ''} ${i > 1 ? 'border-t border-[var(--rule)] lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l lg:pl-8' : ''} ${i > 0 ? 'lg:pl-8' : ''}`}
						>
							<dt className='mt-2 pr-6 text-[0.8125rem] leading-5 text-[var(--ink-3)]'>{label}</dt>
							<dd className='num font-[family-name:var(--font-display)] text-[clamp(1.625rem,3vw,2.25rem)] font-black leading-none tracking-[-0.03em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>{value}</dd>
							<Link href={href} className='absolute inset-0' aria-label={`${label}: open`} />
							<ArrowUpRightIcon size={15} weight='bold' className='absolute right-0 top-7 text-[var(--ink-3)] transition group-hover:text-[var(--accent)] lg:right-8' aria-hidden='true' />
						</div>
					))}
				</dl>
			</section>

			{/* ---- How learners are doing ---- */}
			{outcomes.length ? (
				<section className='bb-container bb-section'>
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
					<ul className='mt-10 grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:gap-x-20 lg:gap-y-20 lg:grid-cols-3'>
						{outcomes.map((o) => (
							<li key={o.id}>
								<OutcomeCard o={o} />
							</li>
						))}
					</ul>
					<p className='mt-10 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
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
				<section className='bb-container pb-[clamp(3.75rem,7vw,6.5rem)]'>
					<div className='border-t border-[var(--rule)] pt-[clamp(3.75rem,7vw,6.5rem)]'>
						<div className={HEAD}>
							<h2 className={H2}>What the ministry says</h2>
							<p className={NOTE}>
								MBHTE publishes no data of its own, so these are its figures as it and the Parliament stated them, each with where. They
								count more than DepEd does, madaris and learning centres among them, and do not always agree with each other.
							</p>
						</div>
						<ul className='mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3'>
							{ministryFigures.map((f) => (
								<li key={f.label} className='flex flex-col border-t border-[var(--rule)] pt-5'>
									<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>{f.topic}</span>
									<span className='num mt-3 font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.25rem)] font-black leading-none tracking-[-0.03em] text-[var(--ink)]'>
										{ministryValue(f)}
									</span>
									<span className='mt-2 text-[0.9375rem] font-semibold leading-snug text-[var(--ink)]'>{f.label}</span>
									{f.scope ? <span className='mt-1.5 text-[0.8125rem] leading-6 text-[var(--ink-2)]'>{f.scope}</span> : null}
									<span className='mt-auto pt-3 text-[0.71875rem] leading-5 text-[var(--ink-3)]'>
										{f.saidBy}.{' '}
										<a href={f.source.url} target='_blank' rel='noreferrer' className='rule-link'>
											{f.source.outlet}, {longDate(f.source.date)}
										</a>
									</span>
								</li>
							))}
						</ul>
					</div>
				</section>
			) : null}

			{/* ---- The map ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<div className={HEAD}>
						<h2 className={H2}>Where the schools are</h2>
						<p className={NOTE}>
							Each dot a school, coloured by its kind: every school on DepEd&rsquo;s list for school year {latestSY}, public and private,
							and the madaris and colleges OpenStreetMap and Wikipedia add. Open the map to filter it and choose a school.
						</p>
					</div>
					<div className='mt-8'>
						<SchoolExplorer year={latestSY} schools={mapSchools} areas={schoolAreas.filter((a) => a.total).map((a) => ({ slug: a.slug, name: a.name }))} />
					</div>
				</div>
			</section>

			{/* ---- Help for students ---- */}
			{offers.length ? (
				<section className='bb-container bb-section'>
					<div className={HEAD}>
						<h2 className={H2}>Scholarships and help for students</h2>
						<p className={NOTE}>
							{offersTotal} programs and services for students, teachers and schools, from {offices.length} offices, as each office
							states it.
						</p>
					</div>
					<ul className='mt-10 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4'>
						{offers.map((x) => (
							<li key={x.slug + x.name} className='bg-[var(--paper)]'>
								<a href={offerHref(x.slug, x)} target='_blank' rel='noreferrer' className='group flex h-full flex-col p-6 transition hover:bg-[var(--paper-2)]'>
									<span className='flex items-start justify-between gap-3'>
										<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>{x.office}</span>
										<ArrowUpRightIcon size={14} weight='bold' className='shrink-0 text-[var(--ink-3)] transition group-hover:text-[var(--accent)]' aria-hidden='true' />
									</span>
									<span className='mt-3 text-[1.0625rem] font-extrabold leading-snug tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{x.name}</span>
									{x.summary ? <span className='mt-2 line-clamp-4 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{x.summary}</span> : null}
									<span className='mt-auto pt-4 text-[0.75rem] text-[var(--ink-3)]'>For {x.for.map((a) => AUDIENCE[a] ?? a).join(', ').toLowerCase()}</span>
								</a>
							</li>
						))}
					</ul>
					<Link href='/services' className='rule-link ml-auto mt-6 block w-fit text-[0.875rem]'>
						All {offersTotal}, with how to apply
					</Link>
				</section>
			) : null}

			{/* ---- What schools need ---- */}
			{NEEDS_LIVE ? (
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
						<div>
							<h2 className={H2}>What schools need</h2>
							<p className='mt-2 max-w-[40rem] text-[0.875rem] leading-6 text-[var(--ink-3)]'>
								{needs.length
									? 'Classrooms, chairs, books, teachers, water: posted by the people who know each school best, and checked by our editors.'
									: 'Nothing posted yet. If you teach, study or have a child at a school short of classrooms, chairs, books, teachers or water, be the first to say so. An editor checks every post.'}
							</p>
						</div>
						<Link href='/needs/new' className='bb-btn bb-btn-accent shrink-0'>
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
							<Link href='/needs' className='rule-link ml-auto mt-6 block w-fit text-[0.875rem]'>
								Every need
							</Link>
						</>
					) : null}
				</div>
			</section>
			) : null}

			{/* ---- Size and load ---- (a rule above: the scholarships before it are on the same ground) */}
			<section className='bb-container'>
				<div className='bb-section border-t border-[var(--rule)]'>
					<div className={HEAD}>
						<h2 className={H2}>The biggest schools, the busiest towns</h2>
						<p className={NOTE}>
							Learners in school year {latestSY}, as DepEd counts them school by school. Classrooms and teachers are published only for
							public schools, so learners per school is the nearest measure of load there is for all of them.
						</p>
					</div>
					<div className='mt-10 grid gap-16 lg:grid-cols-2 lg:gap-x-24'>
						<Ranked
							title='Most pupils'
							rows={largestSchools.slice(0, 8).map((s) => ({ key: s.id, href: `/schools/${s.id}`, name: s.name, sub: `${s.townName}, ${areaNameOf(s.area)}`, value: s.pupils! }))}
						/>
						<Ranked
							title='Most pupils per school, by town'
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
				</div>
			</section>

			{/* ---- By area ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<div className={HEAD}>
						<h2 className={H2}>By area</h2>
						<p className={NOTE}>
							The Special Geographic Area&rsquo;s schools, which DepEd still files under their old North Cotabato towns, are counted with
							the SGA town their barangay is now in.
						</p>
					</div>
					<div className='mt-8 overflow-x-auto border border-[var(--rule)] bg-[var(--paper)]'>
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
									<tr key={a.slug}>
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
			<section className='bb-container bb-section'>
				<Link href='/budget' className='group grid gap-8 border border-[var(--rule)] p-6 transition hover:border-[var(--ink)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end'>
					<span>
						<span className='block font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>The budget</span>
						<span className='mt-2 block text-[1.375rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>
							The education ministry was given {peso(latest.totals.total)} for FY {latestYear}, {spending.at(-1)!.share.toFixed(1)}% of the
							regional budget.
						</span>
						<span className='mt-4 inline-flex items-center gap-2 text-[0.875rem] font-semibold text-[var(--ink-2)] group-hover:text-[var(--accent)]'>
							Where it goes, and who buys for the schools
							<ArrowRightIcon size={15} weight='bold' className='transition group-hover:translate-x-1' aria-hidden='true' />
						</span>
					</span>
					<span className='block' aria-hidden='true'>
						<span className='flex h-28 items-end gap-2 sm:gap-3'>
							{spending.map((s) => (
								<span key={s.year} className='flex h-full flex-1 flex-col items-center justify-end'>
									<span className='num mb-1 text-[0.65625rem] text-[var(--ink-3)]'>{(s.total / 1e9).toFixed(1)}B</span>
									<span className='w-full max-w-12 rounded-t-[3px] bg-[var(--accent)]' style={{ height: `calc(${(s.total / top) * 100}% - 1.25rem)` }} />
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
				<section className='bg-[var(--paper-2)]'>
					<div className='bb-container bb-section'>
						<div className={HEAD}>
							<h2 className={H2}>In the news</h2>
							<p className={NOTE}>The latest headlines about the region&rsquo;s schools, students and teachers, each linked to the outlet that reported it.</p>
						</div>
						<ul className='mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3'>
							{news.map((n) => (
								<li key={n.url} className='border-t border-[var(--rule)] py-5'>
									<a href={n.url} target='_blank' rel='noreferrer' className='group block'>
										<span className='block text-[0.71875rem] text-[var(--ink-3)]'>
											{n.source} · {longDate(n.published_at.slice(0, 10))}
										</span>
										<span className='mt-1.5 block text-[0.96875rem] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]'>
											{n.title}
											<ArrowUpRightIcon size={12} weight='bold' className='ml-1 inline align-baseline text-[var(--ink-3)]' aria-hidden='true' />
										</span>
									</a>
								</li>
							))}
						</ul>
						<a href='https://betterbarmm.com/news' className='rule-link ml-auto mt-4 block w-fit text-[0.875rem]'>
							All the region&rsquo;s news
						</a>
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
	return (
		<article className='flex h-full flex-col border-t border-[var(--rule)] pt-5'>
			<div className='flex items-start justify-between gap-4'>
				<h3 className='text-[0.9375rem] font-bold leading-snug text-[var(--ink)]'>{o.name.replace(/\s*\(.*\)$/, '')}</h3>
				<span className={`shrink-0 px-2 py-0.5 text-[0.6875rem] font-semibold ${s.cls}`}>{s.label}</span>
			</div>
			<p className='mt-4 flex items-baseline gap-2'>
				<span className='num font-[family-name:var(--font-display)] text-[2.5rem] font-black leading-none tracking-[-0.03em] text-[var(--ink)]'>
					{pct ? `${o.latest.value.toFixed(1)}%` : o.latest.value.toLocaleString('en-PH')}
				</span>
				<span className='text-[0.8125rem] text-[var(--ink-3)]'>{pct ? `in ${o.latest.year}` : `${o.unit.replace(/\s*\(.*\)$/, '')}, ${o.latest.year}`}</span>
			</p>
			<div className='relative mt-4 h-2 bg-[var(--paper-3)]' role='img' aria-label={o.verdict}>
				<div className='h-full bg-[var(--accent)]' style={{ width: `${Math.min((o.latest.value / scale) * 100, 100)}%` }} />
				{goal != null ? <span className='absolute -top-1 h-4 w-0.5 bg-[var(--ink)]' style={{ left: `${(goal / scale) * 100}%` }} aria-hidden='true' /> : null}
			</div>
			<p className='mt-3 text-[0.8125rem] font-semibold leading-5 text-[var(--ink-2)]'>{o.verdict}.</p>
			<p className='mt-1.5 text-[0.8125rem] leading-5 text-[var(--ink-3)]'>{o.explain}</p>
		</article>
	)
}

/** A numbered list with a figure at the end of each row. */
function Ranked({ title, rows }: { title: string; rows: { key: string; href: string; name: string; sub: string; value: number }[] }) {
	return (
		<div>
			<h3 className='border-b border-[var(--rule)] pb-2 text-[1rem] font-bold text-[var(--ink)]'>{title}</h3>
			<ol className='divide-y divide-[var(--rule-soft)]'>
				{rows.map((r, i) => (
					<li key={r.key} className='grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-3 py-2.5 text-[0.875rem]'>
						<span className='num text-[var(--ink-3)]'>{i + 1}</span>
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
