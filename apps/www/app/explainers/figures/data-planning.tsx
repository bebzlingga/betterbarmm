import { CheckIcon, MinusIcon, XIcon } from '@phosphor-icons/react/ssr'

/* ============================================================
   Graphics for "How data can shape the Bangsamoro's future"

   Plain HTML on the site's tokens, as the other explainers' graphics
   are, so they read in both themes and print. Every number is one a
   dataset on this site holds, or one an official source stated, and
   the caption says which.
   ============================================================ */

const FIG = 'bb-graphic my-10 leading-[1.7] border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-7'
const CAPTION = 'mt-5 text-[0.78125rem] leading-[1.7] text-[var(--ink-3)]'
const KICKER = 'text-[0.65625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'
const TITLE = 'mt-2 text-[0.9375rem] font-bold leading-snug text-[var(--ink)]'
const n = (x: number) => x.toLocaleString('en-PH')

/* ---- 1. The planning cycle, and what each step needs to know ---- */

const CYCLE = [
	{ step: 'Plan', needs: 'Where the needs are, and how big: families below the poverty line, barangays that flood, towns without a clinic, learners per school.' },
	{ step: 'Budget', needs: 'What each need costs, and which office answers for it, so the money follows the plan.' },
	{ step: 'Deliver', needs: 'What was bought, built and hired, where, and when: contracts, roads, health stations, classrooms.' },
	{ step: 'Measure', needs: 'Whether it worked: the same figures, counted the same way, a year later.' },
]

export function Cycle() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>The planning cycle</p>
			<p className={TITLE}>Every step runs on numbers. A step with old or missing numbers is a guess.</p>
			<ol className='!mt-6 grid !list-none gap-3 !pl-0 sm:grid-cols-2 lg:grid-cols-4 [&>li+li]:!mt-0'>
				{CYCLE.map((c, i) => (
					<li key={c.step} className='relative flex flex-col border border-[var(--rule)] bg-[var(--paper-2)] p-4'>
						<span className='flex items-baseline gap-2'>
							<span className='font-mono text-[0.6875rem] font-semibold tabular-nums text-[var(--accent)]'>{String(i + 1).padStart(2, '0')}</span>
							<span className='text-[0.9375rem] font-bold text-[var(--ink)]'>{c.step}</span>
						</span>
						<span className='mt-1.5 text-[0.8125rem] leading-[1.65] text-[var(--ink-3)]'>{c.needs}</span>
					</li>
				))}
			</ol>
			<p className='!mt-4 flex items-center gap-2 text-[0.78125rem] font-semibold text-[var(--ink-2)]'>
				<span className='h-px flex-1 bg-[var(--rule)]' aria-hidden='true' />
				Then the measured result goes back into the next plan
				<span className='h-px flex-1 bg-[var(--rule)]' aria-hidden='true' />
			</p>
			<figcaption className={CAPTION}>A plan sets targets, the budget funds them, offices deliver, and measurement shows whether the targets were met. Each step reads numbers from the step before it.</figcaption>
		</figure>
	)
}

/* ---- 1b. What the numbers show: what is lacking, what to adjust, what to improve ----
   Schematic, not data: the shapes show the idea, and the caption says so. */

const INK = 'var(--ink-3)'
const ACC = 'var(--accent)'

function Lacking() {
	// A grid of towns; the ones without a clinic stand out.
	const gaps = new Set([3, 8, 9, 14, 20])
	return (
		<svg viewBox='0 0 160 96' className='h-24 w-full' aria-hidden='true'>
			{Array.from({ length: 24 }, (_, i) => {
				const x = 8 + (i % 8) * 19
				const y = 8 + Math.floor(i / 8) * 28
				return gaps.has(i) ? (
					<rect key={i} x={x} y={y} width={13} height={13} fill='none' stroke={ACC} strokeWidth={2} strokeDasharray='3 2' />
				) : (
					<rect key={i} x={x} y={y} width={13} height={13} fill={INK} fillOpacity={0.35} />
				)
			})}
		</svg>
	)
}

function Adjust() {
	// A target line, a result falling below it, and the correction.
	return (
		<svg viewBox='0 0 160 96' className='h-24 w-full' aria-hidden='true'>
			<line x1={8} y1={22} x2={152} y2={22} stroke={INK} strokeWidth={1.5} strokeDasharray='4 3' />
			<text x={152} y={15} textAnchor='end' fontSize={9} fill={INK}>target</text>
			<polyline points='8,78 40,62 72,54 100,60' fill='none' stroke={INK} strokeWidth={2.5} strokeLinejoin='round' />
			<polyline points='100,60 126,40 152,26' fill='none' stroke={ACC} strokeWidth={2.5} strokeDasharray='5 3' strokeLinejoin='round' />
			<circle cx={100} cy={60} r={4.5} fill={ACC} />
		</svg>
	)
}

function Improve() {
	// The same measure in two years, side by side, town by town.
	const before = [30, 44, 26, 38]
	const after = [46, 52, 48, 50]
	return (
		<svg viewBox='0 0 160 96' className='h-24 w-full' aria-hidden='true'>
			<line x1={6} y1={88} x2={154} y2={88} stroke={INK} strokeOpacity={0.5} />
			{before.map((b, i) => {
				const x = 12 + i * 37
				return (
					<g key={i}>
						<rect x={x} y={88 - b} width={13} height={b} fill={INK} fillOpacity={0.35} />
						<rect x={x + 15} y={88 - after[i]!} width={13} height={after[i]!} fill={ACC} />
					</g>
				)
			})}
		</svg>
	)
}

const SHOWS = [
	{ job: 'What is lacking', Pic: Lacking, how: 'Counted town by town, the gaps stand out: the barangays with no evacuation site, the towns with no health station.' },
	{ job: 'What to adjust', Pic: Adjust, how: 'Counted again next year, a program that is falling behind its target shows in time to move money and people.' },
	{ job: 'What to improve', Pic: Improve, how: 'Compared across towns and years, what worked shows, so the next plan builds on it.' },
]

export function Shows() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>What the numbers show</p>
			<p className={TITLE}>Three things a planner can only see with current data.</p>
			<ol className='!mt-6 grid !list-none gap-3 !pl-0 sm:grid-cols-3 [&>li+li]:!mt-0'>
				{SHOWS.map(({ job, Pic, how }, i) => (
					<li key={job} className='flex flex-col border border-[var(--rule)] bg-[var(--paper-2)] p-4'>
						<Pic />
						<span className='mt-3 flex items-baseline gap-2'>
							<span className='font-mono text-[0.6875rem] font-semibold tabular-nums text-[var(--accent)]'>{String(i + 1).padStart(2, '0')}</span>
							<span className='text-[0.9375rem] font-bold text-[var(--ink)]'>{job}</span>
						</span>
						<span className='mt-1.5 text-[0.8125rem] leading-[1.65] text-[var(--ink-3)]'>{how}</span>
					</li>
				))}
			</ol>
			<figcaption className={CAPTION}>An illustration of the idea: the shapes are not real figures. Each of the three needs the same thing counted the same way, every year, place by place.</figcaption>
		</figure>
	)
}

/* ---- 2. How old the numbers are ---- */

const NOW = 2026
const FROM = 2015
const AGES: { what: string; year: number | null; note: string }[] = [
	{ what: 'Learners in every school', year: 2026, note: 'DepEd’s school files, school year 2025–26' },
	{ what: 'What each town collected and spent', year: 2025, note: 'Reported to the Bureau of Local Government Finance' },
	{ what: 'The development plan’s targets', year: 2025, note: 'Newest readings: 14 of 62 in 2025, 47 in 2024, 1 in 2023' },
	{ what: 'Population by barangay', year: 2024, note: 'The PSA’s 2024 census' },
	{ what: 'Health facilities by town', year: 2021, note: 'The Department of Health’s registry, as of January 2021' },
	{ what: 'Audits of the towns', year: 2020, note: 'FY 2020: the newest reports this site could read' },
	{ what: 'Audits of the regional ministries', year: null, note: 'None this site could read, for any year' },
	{ what: 'Road crashes, drownings and fires', year: null, note: 'No office keeps a public register; this site reads them from the news' },
]

export function Ages() {
	const span = NOW - FROM
	return (
		<figure className={FIG}>
			<p className={KICKER}>How old the numbers are</p>
			<p className={TITLE}>The newest figure a planner can find, record by record, against today ({NOW}).</p>
			<ul className='!mt-6 !list-none space-y-4 !pl-0'>
				{AGES.map((a) => {
					const age = a.year == null ? null : NOW - a.year
					return (
						<li key={a.what} className='!mt-0 grid gap-1.5 sm:grid-cols-[15rem_minmax(0,1fr)] sm:items-center sm:gap-5'>
							<span className='text-[0.8125rem] font-semibold leading-snug text-[var(--ink)]'>{a.what}</span>
							<span className='block'>
								<span className='relative block h-3 bg-[var(--paper-2)]'>
									{a.year == null ? (
										<span className='absolute inset-0 border border-dashed border-[var(--rule)]' aria-hidden='true' />
									) : (
										<>
											<span className='absolute inset-y-0 bg-[var(--accent)] opacity-80' style={{ left: `${((a.year - FROM) / span) * 100}%`, right: 0 }} aria-hidden='true' />
											<span className='absolute -top-1 h-5 w-0.5 bg-[var(--ink)]' style={{ left: `${((a.year - FROM) / span) * 100}%` }} aria-hidden='true' />
										</>
									)}
								</span>
								<span className='mt-1 flex justify-between gap-3 text-[0.71875rem] text-[var(--ink-3)]'>
									<span>{a.note}</span>
									<span className='shrink-0 font-semibold tabular-nums text-[var(--ink-2)]'>{age == null ? 'none' : age === 0 ? 'this year' : `${age} ${age === 1 ? 'year' : 'years'} old`}</span>
								</span>
							</span>
						</li>
					)
				})}
			</ul>
			<p className='!mt-4 flex justify-between text-[0.65625rem] tabular-nums text-[var(--ink-mute)] sm:ml-[16.25rem]'>
				<span>{FROM}</span>
				<span>{NOW}</span>
			</p>
			<figcaption className={CAPTION}>The bar runs from the year of the newest figure to today: the longer it is, the older what a planner has to work with. A dashed bar is a record nobody publishes in a form anyone can read. From the datasets on this site: education, LGU finances, the plan scorecard, health, preparedness and audits.</figcaption>
		</figure>
	)
}

/* ---- 2b. Years apart: what a planner has to combine ---- */

const Y0 = 2019
const Y1 = 2026
const RECORDS: { what: string; year: number }[] = [
	{ what: 'Town audits', year: 2020 },
	{ what: 'Health facilities', year: 2021 },
	{ what: 'Population by barangay', year: 2024 },
	{ what: 'Plan readings', year: 2024 },
	{ what: 'Town finances', year: 2025 },
	{ what: 'Learners per school', year: 2026 },
]
const CHANGES: { what: string; year: number }[] = [
	{ what: 'Maguindanao splits into del Norte and del Sur', year: 2022 },
	{ what: 'Sulu leaves the region; the Special Geographic Area’s 8 towns are created', year: 2024 },
]
const at = (y: number) => `${((y - Y0) / (Y1 - Y0)) * 100}%`

export function Apart() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>Years apart</p>
			<p className={TITLE}>The figures one town’s plan has to combine, on one timeline, and how the map changed in between.</p>
			<div className='!mt-8 hidden sm:block'>
				<div className='relative mx-8 pb-2'>
					{/* the records */}
					<div className='relative h-[13.5rem]'>
						{RECORDS.map((r, i) => (
							<div key={r.what} className='absolute flex items-center gap-2' style={{ left: at(r.year), top: `${i * 2.15}rem`, transform: r.year >= 2025 ? 'translateX(-100%)' : undefined, flexDirection: r.year >= 2025 ? 'row-reverse' : 'row' }}>
								<span className='size-3.5 shrink-0 rounded-full bg-[var(--accent)] ring-4 ring-[var(--paper)]' style={{ marginLeft: r.year >= 2025 ? 0 : '-0.4375rem', marginRight: r.year >= 2025 ? '-0.4375rem' : 0 }} aria-hidden='true' />
								<span className='whitespace-nowrap text-[0.8125rem] font-semibold text-[var(--ink)]'>
									{r.what} <span className='font-normal tabular-nums text-[var(--ink-3)]'>{r.year === 2026 ? '2025–26' : r.year}</span>
								</span>
							</div>
						))}
					</div>
					{/* the axis */}
					<div className='relative mt-2 h-px bg-[var(--ink)]'>
						{Array.from({ length: Y1 - Y0 + 1 }, (_, k) => Y0 + k).map((y) => (
							<span key={y} className='absolute -top-1.5 h-3 w-px bg-[var(--ink)]' style={{ left: at(y) }} aria-hidden='true' />
						))}
					</div>
					<div className='relative mt-2 h-5 text-[0.71875rem] tabular-nums text-[var(--ink-3)]'>
						{Array.from({ length: Y1 - Y0 + 1 }, (_, k) => Y0 + k).map((y) => (
							<span key={y} className='absolute -translate-x-1/2' style={{ left: at(y) }}>
								{y}
							</span>
						))}
					</div>
					{/* the map changing */}
					<div className='relative mt-4 h-[7.5rem]'>
						{CHANGES.map((c, i) => (
							<div key={c.what} className='absolute border-l-2 border-dashed border-[var(--brass)] pl-2.5' style={{ left: at(c.year), top: `${i * 3}rem`, width: i ? '17rem' : '16rem' }}>
								<span className='block text-[0.65625rem] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'>{c.year}</span>
								<span className='block text-[0.75rem] leading-snug text-[var(--ink-2)]'>{c.what}</span>
							</div>
						))}
					</div>
				</div>
			</div>
			{/* On a phone, the same as a list by year: the records and the map's changes in order. */}
			<ol className='!mt-6 !list-none space-y-0 !pl-0 sm:hidden'>
				{[...RECORDS.map((r) => ({ ...r, change: false })), ...CHANGES.map((c) => ({ ...c, change: true }))]
					.sort((a, b) => a.year - b.year || Number(a.change) - Number(b.change))
					.map((e) => (
						<li key={e.what} className='!mt-0 grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3 border-t border-[var(--rule)] py-2.5'>
							<span className='text-[0.8125rem] font-bold tabular-nums text-[var(--ink)]'>{e.year === 2026 ? '2025–26' : e.year}</span>
							<span className={e.change ? 'text-[0.78125rem] italic leading-snug text-[var(--brass)]' : 'text-[0.8125rem] font-semibold text-[var(--ink)]'}>{e.what}</span>
						</li>
					))}
			</ol>
			<figcaption className={CAPTION}>
				Six years separate the oldest figure from the newest. People per health station, for example, divides a 2024 census by a 2021 registry, and learners per health facility a 2025–26 count by the same 2021 one, taken before three changes to the region’s map.
			</figcaption>
		</figure>
	)
}

/* ---- 3. One school year, three totals ---- */

const COUNTS = [
	{ value: 1061213, who: 'Department of Education', counts: 'Formal schooling, public and private, Sulu included', where: 'Project Bukas school files' },
	{ value: 1079253, who: 'MBHTE, through the Bangsamoro Information Office', counts: 'Public and private schools and local colleges', where: 'Release of July 23, 2024' },
	{ value: 1258253, who: 'MBHTE, the minister', counts: 'Public schools, government madaris, learning centres and higher education', where: 'SunStar, September 15, 2023' },
]

export function ThreeCounts() {
	const top = Math.max(...COUNTS.map((c) => c.value))
	return (
		<figure className={FIG}>
			<p className={KICKER}>An example from education: one year, three totals</p>
			<p className={TITLE}>How many learners were in school in the Bangsamoro in school year 2023–24?</p>
			<ul className='!mt-6 !list-none space-y-5 !pl-0'>
				{COUNTS.map((c) => (
					<li key={c.value} className='!mt-0'>
						<span className='flex flex-wrap items-baseline justify-between gap-x-4'>
							<span className='text-[1.375rem] font-extrabold tabular-nums tracking-[-0.02em] text-[var(--ink)]'>{n(c.value)}</span>
							<span className='text-[0.75rem] text-[var(--ink-3)]'>{c.where}</span>
						</span>
						<span className='mt-1.5 block h-2.5 bg-[var(--paper-2)]'>
							<span className='block h-full bg-[var(--accent)]' style={{ width: `${(c.value / top) * 100}%` }} aria-hidden='true' />
						</span>
						<span className='mt-1.5 block text-[0.8125rem] leading-snug text-[var(--ink-2)]'>
							<span className='font-semibold text-[var(--ink)]'>{c.who}:</span> {c.counts}
						</span>
					</li>
				))}
			</ul>
			<figcaption className={CAPTION}>
				Each is right for what it counts, and the gap between the first and the last is almost 200,000 learners. A planner who takes one for another builds for the wrong number. Only one of the three comes with the schools it adds up.
			</figcaption>
		</figure>
	)
}

/* ---- 4. What the gaps look like ---- */

const GAPS = [
	{ value: 757379, label: 'learners yet to receive learner kits' },
	{ value: 567946, label: 'armchairs needed for the coming school year' },
	{ value: 277817, label: 'learners without textbooks' },
	{ value: 36773, label: 'positions from the former ARMM not yet moved over' },
	{ value: 9599, label: 'teaching positions vacant' },
]

export function Gaps() {
	const top = GAPS[0]!.value
	return (
		<figure className={FIG}>
			<p className={KICKER}>An example from education: what the gaps look like</p>
			<p className={TITLE}>The shortfalls the Parliament found when it reviewed the 2026 education budget.</p>
			<ul className='!mt-6 !list-none space-y-3 !pl-0'>
				{GAPS.map((g) => (
					<li key={g.label} className='!mt-0 grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-4'>
						<span className='text-right text-[1rem] font-extrabold tabular-nums text-[var(--ink)]'>{n(g.value)}</span>
						<span className='block'>
							<span className='block h-2.5 bg-[var(--paper-2)]'>
								<span className='block h-full bg-[var(--accent)]' style={{ width: `${Math.max(0.6, (g.value / top) * 100)}%` }} aria-hidden='true' />
							</span>
							<span className='mt-1 block text-[0.78125rem] leading-snug text-[var(--ink-3)]'>{g.label}</span>
						</span>
					</li>
				))}
			</ul>
			<div className='!mt-6 grid gap-3 border-t border-[var(--rule)] pt-5 sm:grid-cols-2'>
				<p className='!mt-0'>
					<span className='block text-[1.375rem] font-extrabold tabular-nums text-[var(--ink)]'>1,330 of 2,289</span>
					<span className='text-[0.78125rem] text-[var(--ink-3)]'>classroom construction projects completed</span>
				</p>
				<p className='!mt-0'>
					<span className='block text-[1.375rem] font-extrabold tabular-nums text-[var(--ink)]'>44%</span>
					<span className='text-[0.78125rem] text-[var(--ink-3)]'>of the ministry’s ₱26.49 billion disbursed by August 31, 2025</span>
				</p>
			</div>
			<figcaption className={CAPTION}>
				Committee on Finance, Budget and Management of the Bangsamoro Parliament, as reported by the Daily Tribune (May 28, 2026) and Newsline (May 29, 2026). The figures surfaced in a budget review, not in a register anyone can check year to year.
			</figcaption>
		</figure>
	)
}

/* ---- 5. What the audits say about the records ---- */

const OPINIONS = [
	{ label: 'Clean (unmodified)', n: 2, tone: 'bg-[var(--ink)]' },
	{ label: 'Qualified', n: 50, tone: 'bg-[var(--accent)]' },
	{ label: 'Modified, type not named', n: 1, tone: 'bg-[var(--accent)] opacity-60' },
	{ label: 'Disclaimer: no opinion possible', n: 2, tone: 'bg-[var(--ink-3)]' },
]

export function Audits() {
	const total = OPINIONS.reduce((k, o) => k + o.n, 0)
	return (
		<figure className={FIG}>
			<p className={KICKER}>What the audits say about the records</p>
			<p className={TITLE}>The Commission on Audit’s opinions on {total} towns’ books, FY 2020.</p>
			<div className='!mt-6 flex h-6 w-full gap-0.5' role='img' aria-label={OPINIONS.map((o) => `${o.n} ${o.label}`).join(', ')}>
				{OPINIONS.map((o) => (
					<span key={o.label} className={`h-full ${o.tone}`} style={{ width: `${(o.n / total) * 100}%` }} />
				))}
			</div>
			<ul className='!mt-4 grid !list-none gap-x-6 gap-y-2 !pl-0 sm:grid-cols-2'>
				{OPINIONS.map((o) => (
					<li key={o.label} className='!mt-0 flex items-center gap-2.5 text-[0.8125rem] text-[var(--ink-2)]'>
						<span className={`size-3 shrink-0 ${o.tone}`} aria-hidden='true' />
						<span className='font-bold tabular-nums text-[var(--ink)]'>{o.n}</span> {o.label}
					</li>
				))}
			</ul>
			<div className='!mt-6 grid gap-3 border-t border-[var(--rule)] pt-5 sm:grid-cols-2'>
				<p className='!mt-0'>
					<span className='block text-[1.375rem] font-extrabold tabular-nums text-[var(--ink)]'>35 of 55</span>
					<span className='text-[0.78125rem] text-[var(--ink-3)]'>audits whose main findings mention the inventory of the town’s own property or supplies</span>
				</p>
				<p className='!mt-0'>
					<span className='block text-[1.375rem] font-extrabold tabular-nums text-[var(--ink)]'>0</span>
					<span className='text-[0.78125rem] text-[var(--ink-3)]'>reports on a regional ministry this site could read, for any year from 2019 to 2024</span>
				</p>
			</div>
			<figcaption className={CAPTION}>
				Executive summaries of the Commission on Audit’s annual audit reports, read from their archived copies; the 55 include 5 Sulu towns, then part of the region. A qualified opinion means the auditors could not vouch for part of the books, often because the records behind them were missing or incomplete.
			</figcaption>
		</figure>
	)
}

/* ---- 6. The ladder: where the region stands on each rung ---- */

type Mark = 'yes' | 'part' | 'no'
const LADDER: { rung: string; what: string; mark: Mark; now: string }[] = [
	{ rung: 'Collect', what: 'Count it, the same way every year.', mark: 'part', now: 'Budgets, contracts, town finances and the plan’s indicators are counted; incidents, school needs and many services are not.' },
	{ rung: 'Publish', what: 'Put it where anyone can find it.', mark: 'no', now: 'The downloadable files this site uses are national (DepEd, DOH, BLGF, PhilGEPS, PSA); the region’s own figures come as Acts, releases and posts. 9 of 35 regional offices and 5 of 113 provinces, cities and towns publish a Citizen’s Charter.' },
	{ rung: 'Keep it current', what: 'Update on a schedule, and date every figure.', mark: 'part', now: 'The plan’s newest readings are from 2024 and 2025; the health facility registry from 2021; the town audits from 2020.' },
	{ rung: 'Join it', what: 'Use the same codes, so records line up.', mark: 'part', now: 'The PSA’s place codes and IDs like DepEd’s school ID exist; the region’s own figures rarely carry them.' },
	{ rung: 'Open it', what: 'In files people can reuse, under a clear licence.', mark: 'no', now: 'DepEd shows how, with downloadable files and terms of use; this site found no open-data portal of the region’s own.' },
]

const MARK: Record<Mark, { icon: React.ReactNode; label: string; cls: string }> = {
	yes: { icon: <CheckIcon size={13} weight='bold' aria-hidden='true' />, label: 'In place', cls: 'bg-[var(--tone-done-bg,var(--paper-2))] text-[var(--tone-done-fg,var(--ink))]' },
	part: { icon: <MinusIcon size={13} weight='bold' aria-hidden='true' />, label: 'In part', cls: 'bg-[var(--tone-move-bg,var(--paper-2))] text-[var(--tone-move-fg,var(--ink))]' },
	no: { icon: <XIcon size={13} weight='bold' aria-hidden='true' />, label: 'Not yet', cls: 'bg-[var(--tone-idle-bg,var(--paper-2))] text-[var(--tone-idle-fg,var(--ink))]' },
}

export function Ladder() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>How far to catch up</p>
			<p className={TITLE}>Five steps from a figure kept in an office to a figure anyone can plan with.</p>
			<ol className='!mt-6 !list-none !pl-0'>
				{LADDER.map((r, i) => {
					const m = MARK[r.mark]
					return (
						<li key={r.rung} className='!mt-0 grid gap-x-5 gap-y-1.5 border-t border-[var(--rule)] py-4 sm:grid-cols-[2rem_11rem_minmax(0,1fr)_6.5rem] sm:items-start'>
							<span className='font-mono text-[0.6875rem] font-semibold tabular-nums text-[var(--accent)]'>{String(i + 1).padStart(2, '0')}</span>
							<span>
								<span className='block text-[0.9375rem] font-bold text-[var(--ink)]'>{r.rung}</span>
								<span className='block text-[0.75rem] leading-snug text-[var(--ink-3)]'>{r.what}</span>
							</span>
							<span className='text-[0.8125rem] leading-[1.6] text-[var(--ink-2)]'>{r.now}</span>
							<span className={`inline-flex w-fit items-center gap-1.5 px-2 py-1 text-[0.6875rem] font-semibold sm:justify-self-end ${m.cls}`}>
								{m.icon}
								{m.label}
							</span>
						</li>
					)
				})}
			</ol>
			<figcaption className={CAPTION}>Where the region stands, from the records this site keeps: 3 of the 5 steps in place in part, 2 not yet started, none complete.</figcaption>
		</figure>
	)
}

/* ---- Health, followed through ---- */

const HEALTH = { asOf: 'January 27, 2021', facilities: 842, stations: 543, ruralUnits: 108, hospitals: 29, towns: 100 }
const PEOPLE_2024 = 4516109
const SGA = { towns: 8, people: 191235 }

export function HealthList() {
	const tiles = [
		{ n: n(HEALTH.facilities), l: 'health facilities' },
		{ n: n(HEALTH.stations), l: 'barangay health stations' },
		{ n: n(HEALTH.ruralUnits), l: 'rural health units' },
		{ n: n(HEALTH.hospitals), l: 'hospitals' },
	]
	return (
		<figure className={FIG}>
			<p className={KICKER}>One example: health</p>
			<p className={TITLE}>The newest list of the region’s health facilities, town by town, and what has changed since.</p>
			<div className='!mt-6 grid gap-3 sm:grid-cols-[13rem_minmax(0,1fr)]'>
				<div className='flex flex-col justify-center border border-[var(--rule)] bg-[var(--paper-2)] p-4'>
					<span className='text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>As of</span>
					<span className='mt-1 text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--accent)]'>Jan 2021</span>
					<span className='mt-2 text-[0.75rem] leading-snug text-[var(--ink-3)]'>Department of Health registry, {HEALTH.towns} towns</span>
				</div>
				<ul className='!m-0 grid !list-none grid-cols-2 gap-3 !pl-0 sm:grid-cols-4 [&>li+li]:!mt-0'>
					{tiles.map((t) => (
						<li key={t.l} className='border border-[var(--rule)] p-4'>
							<span className='block text-[1.5rem] font-extrabold tabular-nums leading-none text-[var(--ink)]'>{t.n}</span>
							<span className='mt-1.5 block text-[0.75rem] leading-snug text-[var(--ink-3)]'>{t.l}</span>
						</li>
					))}
				</ul>
			</div>
			<div className='!mt-6 border-t border-[var(--rule)] pt-5'>
				<p className='!m-0 text-[0.8125rem] font-semibold text-[var(--ink)]'>Since then, the map has moved</p>
				<ol className='!mt-3 !list-none space-y-2 !pl-0 text-[0.8125rem] leading-[1.6] text-[var(--ink-2)] [&>li]:!mt-0'>
					<li><span className='mr-2 font-semibold tabular-nums text-[var(--accent)]'>2022</span>Maguindanao splits into del Norte and del Sur.</li>
					<li><span className='mr-2 font-semibold tabular-nums text-[var(--accent)]'>2024</span>Sulu leaves the region; the Special Geographic Area’s {SGA.towns} towns are created.</li>
				</ol>
				<div className='!mt-4 flex flex-wrap items-center gap-4'>
					<span className='flex gap-1.5' aria-hidden='true'>
						{Array.from({ length: SGA.towns }, (_, i) => (
							<span key={i} className='size-5 border-2 border-dashed border-[var(--accent)]' />
						))}
					</span>
					<span className='text-[0.8125rem] text-[var(--ink-2)]'>
						<b className='tabular-nums text-[var(--ink)]'>{n(SGA.people)}</b> people in {SGA.towns} towns with no row in the 2021 list
					</span>
				</div>
			</div>
			<figcaption className={CAPTION}>
				Department of Health, National Health Facility Registry, as of {HEALTH.asOf}, counted by type for the region’s {HEALTH.towns} towns of the time; the 8 towns’ people from the PSA’s 2024 census. Before 2024, their barangays belonged to towns of North Cotabato.
			</figcaption>
		</figure>
	)
}

export function Ratio() {
	const per = Math.round(PEOPLE_2024 / HEALTH.stations)
	const cell = 'flex flex-col items-center text-center'
	return (
		<figure className={FIG}>
			<p className={KICKER}>Two years, one number</p>
			<p className={TITLE}>People per barangay health station, from the newest figure of each.</p>
			<div className='!mt-6 flex flex-wrap items-start justify-center gap-x-6 gap-y-4'>
				<span className={cell}>
					<span className='text-[1.75rem] font-extrabold tabular-nums leading-none text-[var(--ink)]'>{n(PEOPLE_2024)}</span>
					<span className='mt-1.5 text-[0.75rem] text-[var(--ink-3)]'>people · <b className='text-[var(--accent)]'>2024</b></span>
				</span>
				<span className='text-[1.75rem] leading-none text-[var(--ink-3)]' aria-hidden='true'>÷</span>
				<span className={cell}>
					<span className='text-[1.75rem] font-extrabold tabular-nums leading-none text-[var(--ink)]'>{n(HEALTH.stations)}</span>
					<span className='mt-1.5 text-[0.75rem] text-[var(--ink-3)]'>stations · <b className='text-[var(--accent)]'>2021</b></span>
				</span>
				<span className='text-[1.75rem] leading-none text-[var(--ink-3)]' aria-hidden='true'>≈</span>
				<span className={cell}>
					<span className='text-[1.75rem] font-extrabold tabular-nums leading-none text-[var(--accent)]'>{n(per)}</span>
					<span className='mt-1.5 text-[0.75rem] text-[var(--ink-3)]'>per station · no real year</span>
				</span>
			</div>
			<figcaption className={CAPTION}>
				The PSA’s 2024 census counts {n(PEOPLE_2024)} people in 2,174 of the region’s barangays; the 2021 registry counts {HEALTH.stations} barangay health stations, in a region of 100 towns rather than 108. The ratio mixes the two years and the two maps.
			</figcaption>
		</figure>
	)
}

export function Stunting() {
	const rows = [
		{ v: 21, what: 'The plan’s own tracker', how: 'health offices’ weighing records (Operation Timbang), as reported in the 2024 Bangsamoro Development Report' },
		{ v: 34.3, what: 'National survey', how: 'the 2023 Expanded National Nutrition Survey, as cited in the plan’s midterm update' },
	]
	return (
		<figure className={FIG}>
			<p className={KICKER}>When the numbers disagree</p>
			<p className={TITLE}>Children under five who are stunted, 2023: two official answers.</p>
			<ul className='!mt-6 !list-none space-y-5 !pl-0'>
				{rows.map((r) => (
					<li key={r.what} className='!mt-0'>
						<span className='flex items-baseline justify-between gap-4'>
							<span className='text-[0.8125rem] font-semibold text-[var(--ink)]'>{r.what}</span>
							<span className='text-[1.375rem] font-extrabold tabular-nums text-[var(--ink)]'>{r.v}%</span>
						</span>
						<span className='mt-1.5 block h-3 bg-[var(--paper-2)]'>
							<span className='block h-full bg-[var(--accent)] opacity-80' style={{ width: `${(r.v / 40) * 100}%` }} />
						</span>
						<span className='mt-1 block text-[0.71875rem] text-[var(--ink-3)]'>{r.how}</span>
					</li>
				))}
			</ul>
			<figcaption className={CAPTION}>13 points apart for the same year. The plan’s target of 23% by 2025 was set on the first kind of count; its latest reading is the second, so the two cannot be compared.</figcaption>
		</figure>
	)
}

export function Vaccines() {
	const W = 640
	const H = 240
	const x = (y: number) => 50 + ((y - 2021) / 3) * (W - 100)
	const y = (v: number) => H - 30 - (v / 100) * (H - 50)
	const pts = [
		{ yr: 2021, v: 60.7 },
		{ yr: 2023, v: 43.8 },
		{ yr: 2024, v: 51.6 },
	]
	return (
		<figure className={FIG}>
			<p className={KICKER}>Found late</p>
			<p className={TITLE}>Infants fully vaccinated before their first birthday, against the plan’s target.</p>
			<svg viewBox={`0 0 ${W} ${H}`} className='!mt-4 block h-auto w-full' role='img' aria-label='Fully immunized children: 60.7% in 2021, 43.8% in 2023, 51.6% in 2024, against a target of 75%.'>
				<line x1={30} x2={W - 20} y1={y(75)} y2={y(75)} stroke='var(--accent)' strokeWidth={2} strokeDasharray='6 5' />
				<text x={W - 20} y={y(75) - 8} textAnchor='end' fontSize={12} fontWeight={700} fill='var(--accent)'>
					Target 75%
				</text>
				<line x1={30} x2={W - 20} y1={H - 30} y2={H - 30} stroke='var(--rule)' />
				{[2021, 2022, 2023, 2024].map((yr) => (
					<text key={yr} x={x(yr)} y={H - 10} textAnchor='middle' fontSize={12} fill='var(--ink-3)'>
						{yr}
					</text>
				))}
				<text x={x(2022)} y={y(52) + 18} textAnchor='middle' fontSize={11} fill='var(--ink-3)'>
					no reading
				</text>
				<polyline points={pts.map((p) => `${x(p.yr)},${y(p.v)}`).join(' ')} fill='none' stroke='var(--ink)' strokeWidth={2.5} strokeLinejoin='round' />
				{pts.map((p) => (
					<g key={p.yr}>
						<circle cx={x(p.yr)} cy={y(p.v)} r={5} fill='var(--ink)' />
						<text x={x(p.yr)} y={y(p.v) - 12} textAnchor='middle' fontSize={13} fontWeight={700} fill='var(--ink)'>
							{p.v}%
						</text>
					</g>
				))}
			</svg>
			<figcaption className={CAPTION}>
				2021 is the plan’s baseline; 2023 is as printed in the 2023 Bangsamoro Development Report, and 2024 in the plan’s midterm update, from the Ministry of Health’s records. The 2024 Bangsamoro Development Report names national vaccine stock-outs as a cause.
			</figcaption>
		</figure>
	)
}

const OFFICES = ['Health', 'Schools', 'Social welfare', 'Planning']
const SHARED = [
	{ b: 'Counted once', d: 'A family is on one list, not four, and every office’s count matches.' },
	{ b: 'Seen together', d: 'Each office sees what the others already know, like the barangays with the most young children.' },
	{ b: 'Help sooner', d: 'No one starts a list from nothing when a need arises.' },
	{ b: 'Collected once', d: 'No office pays to gather the same numbers twice.' },
]

export function Shared() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>Shared, data does more</p>
			<p className={TITLE}>Four offices, one list on the same place codes.</p>
			<div className='!mt-6 grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'>
				<ul className='!m-0 grid !list-none grid-cols-2 gap-2 !pl-0 [&>li+li]:!mt-0'>
					{OFFICES.map((o) => (
						<li key={o} className='border border-[var(--rule)] bg-[var(--paper-2)] px-3 py-2.5 text-center text-[0.8125rem] font-semibold text-[var(--ink)]'>
							{o}
						</li>
					))}
				</ul>
				<span className='text-center text-[1.5rem] text-[var(--ink-3)]' aria-hidden='true'>
					→
				</span>
				<span className='flex flex-col items-center justify-center border-2 border-[var(--accent)] px-4 py-5 text-center'>
					<span className='text-[1rem] font-extrabold text-[var(--accent)]'>One list</span>
					<span className='mt-1 text-[0.75rem] text-[var(--ink-3)]'>the PSA’s place codes, shared IDs</span>
				</span>
			</div>
			<ul className='!mt-5 grid !list-none gap-3 !pl-0 sm:grid-cols-2 [&>li+li]:!mt-0'>
				{SHARED.map((s) => (
					<li key={s.b} className='border-l-2 border-[var(--accent)] pl-3'>
						<span className='block text-[0.875rem] font-bold text-[var(--ink)]'>{s.b}</span>
						<span className='block text-[0.78125rem] leading-[1.6] text-[var(--ink-3)]'>{s.d}</span>
					</li>
				))}
			</ul>
			<figcaption className={CAPTION}>An illustration of the idea, not a description of any one office’s system.</figcaption>
		</figure>
	)
}

export const DATA_PLANNING_FIGURES = {
	cycle: <Cycle />,
	shows: <Shows />,
	ages: <Ages />,
	apart: <Apart />,
	'three-counts': <ThreeCounts />,
	gaps: <Gaps />,
	audits: <Audits />,
	ladder: <Ladder />,
	'health-list': <HealthList />,
	ratio: <Ratio />,
	stunting: <Stunting />,
	vaccines: <Vaccines />,
	shared: <Shared />,
}
