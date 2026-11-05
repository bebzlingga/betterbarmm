import { ArrowRightIcon, CheckIcon, ClockIcon, MinusIcon, WarningIcon } from '@phosphor-icons/react/ssr'

/* ============================================================
   Graphics for "How BARMM can use AI to deliver better services"

   Plain HTML and inline SVG on the site's tokens, as the other explainers'
   graphics are, so they read in both themes and print. A strength and a limit
   are told apart by their marks and their words, never by color alone.
   ============================================================ */

const FIG = 'bb-graphic my-10 leading-[1.7] border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-7'
const CAPTION = 'mt-5 text-[0.78125rem] leading-[1.7] text-[var(--ink-3)]'
const KICKER = 'text-[0.65625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'
const TITLE = 'mt-2 text-[0.9375rem] font-bold leading-snug text-[var(--ink)]'

/* ---- 1. How fast it moves ---- */

/** Months to about 100 million users, by the Reuters/UBS count of February 2023. */
const REACH = [
	{ app: 'Instagram', months: 30, said: 'about 2½ years' },
	{ app: 'TikTok', months: 9, said: 'about 9 months' },
	{ app: 'ChatGPT', months: 2, said: 'about 2 months' },
] as const

const PACE = [
	{ figure: '280×', what: 'cheaper to run an AI as capable as the 2022 ChatGPT, from late 2022 to late 2024' },
	{ figure: '+67', what: 'percentage points on one hard new AI test, gained in a single year' },
	{ figure: '50,000', what: 'public servants the DICT plans to give AI assistants first' },
] as const

export function Pace() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>How fast it moves</p>
			<p className={TITLE}>What once took years now takes months.</p>
			<p className='!mt-6 text-[0.78125rem] font-semibold text-[var(--ink-3)]'>Time to reach about 100 million users</p>
			<ul className='!mt-3 !list-none space-y-3 !pl-0 [&>li+li]:!mt-3'>
				{REACH.map((r) => (
					<li key={r.app} className='grid grid-cols-[5.5rem_1fr] items-center gap-3 sm:grid-cols-[6.5rem_1fr]'>
						<span className='text-[0.84375rem] font-bold text-[var(--ink)]'>{r.app}</span>
						<span className='flex items-center gap-2.5'>
							<span className='h-3 bg-[var(--accent)]' style={{ width: `${(r.months / 30) * 72}%`, minWidth: '0.5rem' }} aria-hidden='true' />
							<span className='shrink-0 text-[0.78125rem] tabular-nums text-[var(--ink-2)]'>{r.said}</span>
						</span>
					</li>
				))}
			</ul>
			<ul className='!mt-7 grid !list-none gap-3 !pl-0 sm:grid-cols-3 [&>li+li]:!mt-0'>
				{PACE.map((p) => (
					<li key={p.figure} className='border border-[var(--rule)] bg-[var(--paper-2)] p-4'>
						<span className='block text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>{p.figure}</span>
						<span className='mt-2 block text-[0.78125rem] leading-[1.55] text-[var(--ink-3)]'>{p.what}</span>
					</li>
				))}
			</ul>
			<figcaption className={CAPTION}>
				Users: Reuters, citing UBS and Sensor Tower, February 2023. Cost and test scores: Stanford AI Index 2025 (the test is SWE-bench, of real programming tasks). Public servants: the DICT’s plan as reported by GovInsider, 2026.
			</figcaption>
		</figure>
	)
}

/* ---- 2. The robot: what AI is good at, and where it stops ---- */

type Part = { n: number; title: string; body: string; limit?: boolean }

const PARTS: Part[] = [
	{ n: 1, title: 'Reads anything', body: 'Scanned pages, handwritten forms, photographs, a question typed in everyday words.' },
	{ n: 2, title: 'Finds patterns', body: 'Goes through years of records in minutes, and points to what stands out.' },
	{ n: 3, title: 'Never off duty', body: 'Answers at 2 in the morning, on holidays, and for many people at once.' },
	{ n: 4, title: 'Does the repetitive work', body: 'Sorts, checks, fills in and counts, the five-hundredth time as carefully as the first.' },
	{ n: 5, title: 'Speaks many languages', body: 'Translates and drafts. Weaker in Maguindanaon, Meranaw, Tausug and Sinama, so it has to be tested there.' },
	{ n: 6, title: 'Runs on data', body: 'Only as good as the records it is given. Gaps and biases in them come out in its answers.', limit: true },
	{ n: 7, title: 'Needs a person', body: 'Can be wrong with complete confidence, and cannot be held to account. A person checks and signs.', limit: true },
]

/** A part's number on the drawing: filled for a strength, dashed for a limit. */
function Badge({ n, x, y, limit }: { n: number; x: number; y: number; limit?: boolean }) {
	return (
		<g>
			<circle cx={x} cy={y} r={10} className={limit ? 'fill-[var(--paper)] stroke-[var(--accent)]' : 'fill-[var(--accent)] stroke-[var(--paper)]'} strokeWidth={2} strokeDasharray={limit ? '3 2' : undefined} />
			<text x={x} y={y + 4} textAnchor='middle' className={`font-mono text-[11px] font-bold ${limit ? 'fill-[var(--accent)]' : 'fill-white'}`}>
				{n}
			</text>
		</g>
	)
}

function PartNote({ part, side }: { part: Part; side: 'left' | 'right' }) {
	return (
		<li className={`flex gap-3 ${side === 'left' ? 'lg:flex-row-reverse lg:text-right' : ''}`}>
			<span
				className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full font-mono text-[0.6875rem] font-bold ${part.limit ? 'border-2 border-dashed border-[var(--accent)] text-[var(--accent)]' : 'bg-[var(--accent)] text-white'}`}
			>
				{part.n}
			</span>
			<span className='min-w-0'>
				<span className='block text-[0.875rem] font-bold leading-snug text-[var(--ink)]'>
					{part.title}
					{part.limit ? <span className='ml-1.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>Limit</span> : null}
				</span>
				<span className='mt-0.5 block text-[0.78125rem] leading-[1.55] text-[var(--ink-3)]'>{part.body}</span>
			</span>
		</li>
	)
}

/** An assistant drawn for this page: a floating head that reads, a screen that counts, arms that do the work. */
function RobotDrawing() {
	return (
		<svg viewBox='0 0 240 330' role='img' aria-label='A drawing of a friendly robot, its parts numbered 1 to 7' className='mx-auto h-auto w-full max-w-[17rem]'>
			{/* Shadow and the hover lines: it floats, as AI floats free of any one office. */}
			<ellipse cx={120} cy={314} rx={54} ry={6} className='fill-[var(--ink)] opacity-[0.12]' />
			{/* Antenna */}
			<line x1={120} y1={22} x2={120} y2={8} className='stroke-[var(--ink)]' strokeWidth={2.5} strokeLinecap='round' />
			<circle cx={120} cy={7} r={4.5} className='fill-[var(--accent)]' />
			{/* Head, floating above the body */}
			<ellipse cx={120} cy={70} rx={72} ry={50} className='fill-[var(--paper)] stroke-[var(--ink)]' strokeWidth={2.5} />
			<ellipse cx={120} cy={74} rx={55} ry={33} fill='#1d1b18' className='stroke-[var(--ink)]' strokeWidth={1.5} />
			<ellipse cx={97} cy={74} rx={12} ry={8} fill='#f1c453' />
			<ellipse cx={143} cy={74} rx={12} ry={8} fill='#f1c453' />
			<path d='M92 134 Q120 142 148 134' className='fill-none stroke-[var(--ink-mute)]' strokeWidth={2} strokeDasharray='4 4' strokeLinecap='round' />
			{/* Arms */}
			<ellipse cx={52} cy={212} rx={13} ry={44} transform='rotate(10 52 212)' className='fill-[var(--paper-2)] stroke-[var(--ink)]' strokeWidth={2.5} />
			<ellipse cx={188} cy={212} rx={13} ry={44} transform='rotate(-10 188 212)' className='fill-[var(--paper-2)] stroke-[var(--ink)]' strokeWidth={2.5} />
			{/* Body */}
			<path d='M74 152 Q120 138 166 152 Q182 162 178 205 Q170 276 120 296 Q70 276 62 205 Q58 162 74 152 Z' className='fill-[var(--paper)] stroke-[var(--ink)]' strokeWidth={2.5} />
			<path d='M120 146 Q150 147 166 152 Q182 162 178 205 Q170 276 120 296 Z' className='fill-[var(--paper-2)]' />
			{/* Chest screen: a small chart, the counting it does */}
			<rect x={96} y={170} width={48} height={34} rx={3} fill='#1d1b18' className='stroke-[var(--ink)]' strokeWidth={1.5} />
			<rect x={104} y={190} width={7} height={8} fill='#f1c453' />
			<rect x={116.5} y={184} width={7} height={14} fill='#f1c453' />
			<rect x={129} y={177} width={7} height={21} fill='#f1c453' />
			<Badge n={1} x={120} y={106} />
			<Badge n={2} x={186} y={34} />
			<Badge n={3} x={156} y={187} />
			<Badge n={4} x={30} y={204} />
			<Badge n={5} x={210} y={204} />
			<Badge n={6} x={120} y={250} limit />
			<Badge n={7} x={120} y={314} limit />
		</svg>
	)
}

export function Robot() {
	const left = PARTS.slice(0, 4)
	const right = PARTS.slice(4)
	return (
		<figure className={FIG}>
			<p className={KICKER}>What AI brings, and where it stops</p>
			<p className={TITLE}>A tireless assistant with no judgment of its own.</p>
			<div className='!mt-7 grid items-center gap-x-6 gap-y-6 lg:grid-cols-[1fr_17rem_1fr]'>
				<ul className='order-2 !list-none space-y-5 !pl-0 lg:order-1 [&>li+li]:!mt-5'>
					{left.map((p) => (
						<PartNote key={p.n} part={p} side='left' />
					))}
				</ul>
				<div className='order-1 lg:order-2'>
					<RobotDrawing />
				</div>
				<ul className='order-3 !list-none space-y-5 !pl-0 [&>li+li]:!mt-5'>
					{right.map((p) => (
						<PartNote key={p.n} part={p} side='right' />
					))}
				</ul>
			</div>
			<figcaption className={CAPTION}>Filled numbers are what AI does well. Dashed numbers, marked Limit, are what it cannot do without people.</figcaption>
		</figure>
	)
}

/* ---- 3. AI and people, task by task ---- */

const TASKS: { task: string; ai: string; people: string; better: 'ai' | 'people' }[] = [
	{ task: 'Reading 1,000 pages of reports', ai: 'Minutes', people: 'Days', better: 'ai' },
	{ task: 'Answering the same question for the 500th time', ai: 'The same answer, any hour', people: 'Tires; offices close', better: 'ai' },
	{ task: 'Spotting a pattern across years of records', ai: 'Strong, if the records are in order', people: 'Slow, and easy to miss', better: 'ai' },
	{ task: 'Translating and summarizing', ai: 'Fast; weaker in local languages', people: 'Slower; knows what matters', better: 'ai' },
	{ task: 'Handling a case no rule foresaw', ai: 'Guesses', people: 'Uses judgment', better: 'people' },
	{ task: 'Knowing the town, the family, the history', ai: 'Only what it was given', people: 'Knows it', better: 'people' },
	{ task: 'Calming a worried citizen', ai: 'Can sound kind', people: 'Understands', better: 'people' },
	{ task: 'Saying “I don’t know”', ai: 'Often makes something up', people: 'Usually can', better: 'people' },
	{ task: 'Being held to account', ai: 'Cannot be', people: 'Can be, and must be', better: 'people' },
]

function Cell({ who, text, better }: { who: string; text: string; better: boolean }) {
	return (
		<span className={`flex items-start gap-1.5 text-[0.8125rem] leading-[1.5] ${better ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink-3)]'}`}>
			{better ? <CheckIcon size={13} weight='bold' className='mt-[3px] shrink-0 text-[var(--accent)]' aria-hidden='true' /> : <MinusIcon size={13} weight='bold' className='mt-[3px] shrink-0 text-[var(--ink-mute)]' aria-hidden='true' />}
			<span>
				<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] sm:hidden'>{who} · </span>
				{text}
				{better ? <span className='sr-only'> (better)</span> : null}
			</span>
		</span>
	)
}

export function Compare() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>AI and people</p>
			<p className={TITLE}>Each is better at different work. The tick marks which.</p>
			<div className='!mt-6 border border-[var(--rule)]'>
				<div className='hidden grid-cols-[1.3fr_1fr_1fr] gap-4 border-b border-[var(--rule)] bg-[var(--paper-2)] px-4 py-2.5 font-mono text-[0.65625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] sm:grid'>
					<span>The task</span>
					<span>AI</span>
					<span>People</span>
				</div>
				<ul className='!m-0 !list-none divide-y divide-[var(--rule-soft)] !pl-0 [&>li+li]:!mt-0'>
					{TASKS.map((t) => (
						<li key={t.task} className='grid gap-x-4 gap-y-1.5 px-4 py-3 sm:grid-cols-[1.3fr_1fr_1fr]'>
							<span className='text-[0.84375rem] font-semibold leading-[1.5] text-[var(--ink-2)]'>{t.task}</span>
							<Cell who='AI' text={t.ai} better={t.better === 'ai'} />
							<Cell who='People' text={t.people} better={t.better === 'people'} />
						</li>
					))}
				</ul>
			</div>
			<figcaption className={CAPTION}>A general guide, not a measurement. The best results come from pairing them: AI reads, sorts and drafts; a person decides.</figcaption>
		</figure>
	)
}

/* ---- 3b. Uses, at the counter and behind it ---- */

type Tool = 'AI' | 'Automation' | 'Both'

const USES: { side: string; who: string; items: { what: string; tool: Tool }[] }[] = [
	{
		side: 'At the counter',
		who: 'Service delivery: faster, simpler, open at any hour',
		items: [
			{ what: 'Answer questions on requirements, fees and schedules, day and night, in local languages', tool: 'AI' },
			{ what: 'Apply, pay and follow a request online, from home or a Digital Bangsamoro center', tool: 'Automation' },
			{ what: 'Check an application on arrival and say at once what is missing', tool: 'Both' },
			{ what: 'Send status updates by text, so nobody is told to come back next week', tool: 'Automation' },
			{ what: 'Read field reports after a flood and show which barangays need help', tool: 'AI' },
		],
	},
	{
		side: 'Behind the counter',
		who: 'Internal operations: less paperwork, fewer errors',
		items: [
			{ what: 'Turn scanned archives into searchable text', tool: 'AI' },
			{ what: 'Route and track memos and documents between offices', tool: 'Automation' },
			{ what: 'Draft letters, minutes, briefings and translations for staff to check', tool: 'AI' },
			{ what: 'Compare spending with the budget every month and flag what is unspent', tool: 'Automation' },
			{ what: 'Flag unusual bids, prices and repeat winners in procurement', tool: 'AI' },
			{ what: 'Check attendance, leave and payroll for errors', tool: 'Automation' },
		],
	},
]

function ToolTag({ tool }: { tool: Tool }) {
	const ai = tool !== 'Automation'
	return (
		<span
			className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.59375rem] font-semibold uppercase leading-4 tracking-[0.1em] ${ai ? 'bg-[var(--accent)] text-white' : 'border border-[var(--ink-mute)] text-[var(--ink-3)]'}`}
		>
			{tool === 'Both' ? 'AI + automation' : tool}
		</span>
	)
}

export function Uses() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>Where it helps</p>
			<p className={TITLE}>Quicker for the people government serves, lighter for the people who run it.</p>
			<div className='!mt-6 grid gap-4 md:grid-cols-2'>
				{USES.map((col) => (
					<section key={col.side} className='flex flex-col border border-[var(--rule)] bg-[var(--paper-2)]'>
						<header className='border-b border-[var(--rule)] px-4 py-3'>
							<span className='block text-[0.9375rem] font-bold text-[var(--ink)]'>{col.side}</span>
							<span className='block text-[0.75rem] text-[var(--ink-3)]'>{col.who}</span>
						</header>
						<ul className='!m-0 !list-none divide-y divide-[var(--rule-soft)] !pl-0 [&>li+li]:!mt-0'>
							{col.items.map((u) => (
								<li key={u.what} className='flex items-start justify-between gap-3 px-4 py-2.5'>
									<span className='text-[0.8125rem] leading-[1.5] text-[var(--ink-2)]'>{u.what}</span>
									<ToolTag tool={u.tool} />
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
			<figcaption className={CAPTION}>Automation follows fixed rules; AI handles what fixed rules cannot. In every use, a person still decides and signs.</figcaption>
		</figure>
	)
}

/* ---- 4. From records to insight: Incident Watch ---- */

const FLOW = [
	{ figure: '798', what: 'news reports read' },
	{ figure: '264', what: 'incidents, one record each' },
	{ figure: '251', what: 'placed on the map, to a town or barangay' },
] as const

/** Incident Watch, 2019 to October 26, 2026, by kind. */
const KINDS = [
	{ kind: 'Shootings', count: 180 },
	{ kind: 'Fires and explosions', count: 35 },
	{ kind: 'Boat mishaps and drownings', count: 29 },
	{ kind: 'Other (aircraft, landslides, lightning…)', count: 10 },
	{ kind: 'Road crashes', count: 7 },
	{ kind: 'Floods', count: 3 },
] as const

export function Insight() {
	const max = KINDS[0].count
	return (
		<figure className={FIG}>
			<p className={KICKER}>From records to insight</p>
			<p className={TITLE}>Two in every three incidents the region’s news reported were shootings.</p>
			<ol className='!mt-6 flex !list-none flex-wrap items-stretch gap-2 !pl-0 [&>li+li]:!mt-0'>
				{FLOW.map((f, i) => (
					<li key={f.what} className='flex items-center gap-2'>
						<span className='border border-[var(--rule)] bg-[var(--paper-2)] px-3 py-2'>
							<span className='block text-[1.15rem] font-extrabold leading-none tabular-nums text-[var(--ink)]'>{f.figure}</span>
							<span className='mt-1 block text-[0.71875rem] leading-snug text-[var(--ink-3)]'>{f.what}</span>
						</span>
						{i < FLOW.length - 1 ? <ArrowRightIcon size={13} weight='bold' className='text-[var(--ink-mute)]' aria-hidden='true' /> : null}
					</li>
				))}
			</ol>
			<ul className='!mt-6 !list-none space-y-2.5 !pl-0 [&>li+li]:!mt-2.5'>
				{KINDS.map((k) => (
					<li key={k.kind} className='grid gap-x-3 gap-y-1 sm:grid-cols-[14rem_1fr] sm:items-center'>
						<span className='text-[0.8125rem] text-[var(--ink-2)]'>{k.kind}</span>
						<span className='flex items-center gap-2.5'>
							<span className='h-3 bg-[var(--accent)]' style={{ width: `${(k.count / max) * 80}%`, minWidth: '0.25rem' }} aria-hidden='true' />
							<span className='text-[0.78125rem] font-semibold tabular-nums text-[var(--ink)]'>{k.count}</span>
						</span>
					</li>
				))}
			</ul>
			<p className='!mt-6 flex gap-2.5 border-l-2 border-[var(--accent)] bg-[var(--paper-2)] px-4 py-3 text-[0.8125rem] leading-[1.6] text-[var(--ink-2)]'>
				<WarningIcon size={16} weight='bold' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
				<span>
					<strong className='text-[var(--ink)]'>What the count cannot see.</strong> Only 7 road crashes, because most never make the news. A pattern in the data is a pattern in what was recorded, and a person has to know the difference.
				</span>
			</p>
			<figcaption className={CAPTION}>
				BetterBARMM <a href='/accidents' className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>Incident Watch</a>, from news reports, January 2019 to October 26, 2026. Each incident is linked to the reports behind it.
			</figcaption>
		</figure>
	)
}

/* ---- 5. Where the region stands ---- */

type Standing = 'in place' | 'started' | 'not yet'

const READINESS: { what: string; standing: Standing; detail: string; source: string }[] = [
	{ what: 'A national law to go digital', standing: 'in place', detail: 'The E-Governance Act of 2025 tells government offices, local governments in the region included, to move their services online.', source: 'RA 12254 (national)' },
	{ what: 'A regional law', standing: 'not yet', detail: 'Parliament Bill No. 116, to put the regional government’s frontline services online, was filed in 2022 and stayed at first reading.', source: 'Bangsamoro Parliament' },
	{ what: 'Digital services', standing: 'started', detail: 'BGov, the regional government’s citizen app, with aid, jobs and scholarships due by early 2027; Digital Bangsamoro centers in at least 8 towns.', source: 'BGov; MILG and UNDP, LeAPS' },
	{ what: 'Leaders asking the question', standing: 'started', detail: 'A 2025 forum on “Reimagining Governance in the Age of AI,” held by the BPDA and PIDS.', source: 'PIDS' },
	{ what: 'People online', standing: 'not yet', detail: '27.7% of households in BARMM have internet, against 48.8% nationally.', source: 'PIDS, 2025' },
	{ what: 'Records in order', standing: 'not yet', detail: 'Many records exist only as scanned PDFs or Facebook posts, with offices and towns spelled several ways.', source: 'BetterBARMM' },
	{ what: 'Rules for AI', standing: 'not yet', detail: 'No regional policy on how offices may use AI, what they must disclose, or who answers for its mistakes, that we could find.', source: 'BetterBARMM' },
]

const STANDING: Record<Standing, { label: string; mark: React.ReactNode }> = {
	'in place': {
		label: 'In place',
		mark: (
			<span className='grid size-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white'>
				<CheckIcon size={13} weight='bold' aria-hidden='true' />
			</span>
		),
	},
	started: {
		label: 'Started',
		mark: (
			<span className='grid size-6 shrink-0 place-items-center rounded-full border-2 border-dashed border-[var(--accent)] text-[var(--accent)]'>
				<ClockIcon size={13} weight='bold' aria-hidden='true' />
			</span>
		),
	},
	'not yet': {
		label: 'Not yet',
		mark: (
			<span className='grid size-6 shrink-0 place-items-center rounded-full border-2 border-[var(--ink-mute)] text-[var(--ink-3)]'>
				<MinusIcon size={13} weight='bold' aria-hidden='true' />
			</span>
		),
	},
}

export function Readiness() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>Where the region starts</p>
			<p className={TITLE}>A national law is in place and the first services are online. A regional law, connections, records and rules are not.</p>
			<ul className='!mt-6 grid !list-none gap-px border border-[var(--rule)] bg-[var(--rule)] !pl-0 sm:grid-cols-2 [&>li+li]:!mt-0'>
				{READINESS.map((r) => {
					const s = STANDING[r.standing]
					return (
						<li key={r.what} className='flex gap-3 bg-[var(--paper)] p-4 sm:[&:last-child:nth-child(odd)]:col-span-2'>
							<span className='mt-0.5'>{s.mark}</span>
							<span className='min-w-0'>
								<span className='flex flex-wrap items-baseline gap-x-2'>
									<span className='text-[0.90625rem] font-bold text-[var(--ink)]'>{r.what}</span>
									<span className={`font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] ${r.standing === 'not yet' ? 'text-[var(--ink-3)]' : 'text-[var(--accent)]'}`}>{s.label}</span>
								</span>
								<span className='mt-1 block text-[0.8125rem] leading-[1.55] text-[var(--ink-2)]'>{r.detail}</span>
								<span className='mt-1.5 block font-mono text-[0.6875rem] text-[var(--ink-3)]'>{r.source}</span>
							</span>
						</li>
					)
				})}
			</ul>
			<figcaption className={CAPTION}>As of October 2026, from the sources listed at the end of this explainer.</figcaption>
		</figure>
	)
}

export const AI_READINESS_FIGURES = {
	pace: <Pace />,
	robot: <Robot />,
	compare: <Compare />,
	uses: <Uses />,
	insight: <Insight />,
	readiness: <Readiness />,
}
