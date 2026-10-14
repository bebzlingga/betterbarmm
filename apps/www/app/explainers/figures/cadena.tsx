import { CheckIcon, ClockIcon, LinkIcon, MinusIcon } from '@phosphor-icons/react/ssr'

/* ============================================================
   Graphics for the CADENA explainer

   Each is plain HTML on the site's tokens, so it reads in both themes,
   prints, and holds its meaning without colour: a state always has an
   icon and a word beside it.
   ============================================================ */

const FIG = 'bb-graphic my-10 border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-7'
const CAPTION = 'mt-5 text-[12.5px] leading-[1.6] text-[var(--ink-3)]'
const KICKER = 'text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'

/* ---- 1. Following one peso ---- */

const TRAIL = [
	{ stage: 'Appropriation', doc: 'GAA line item', who: 'Congress', side: 'national' },
	{ stage: 'Allotment', doc: 'SARO', who: 'DBM', side: 'national' },
	{ stage: 'Cash', doc: 'NCA', who: 'DBM', side: 'national' },
	{ stage: 'Obligation', doc: 'Obligation request', who: 'Agency', side: 'national' },
	{ stage: 'Bidding', doc: 'Bid notice, abstract of bids', who: 'Procuring entity', side: 'national' },
	{ stage: 'Award', doc: 'Notice of award, contract', who: 'Procuring entity', side: 'national' },
	{ stage: 'Payment', doc: 'Disbursement voucher', who: 'Agency, Treasury', side: 'national' },
	{ stage: 'Audit', doc: 'COA report', who: 'COA', side: 'national' },
] as const

export function PesoTrail() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>Following one peso</p>
			<p className='mt-2 text-[15px] font-bold leading-snug text-[var(--ink)]'>
				Every record carries the same linkage ID, so a line item can be traced to the contractor it paid.
			</p>
			<ol className='!mt-6 grid !list-none gap-0 !pl-0 sm:grid-cols-2 lg:grid-cols-4 [&>li+li]:!mt-0'>
				{TRAIL.map((step, i) => (
					<li key={step.stage} className='relative flex gap-3 pb-6 pr-4'>
						<span className='flex flex-col items-center'>
							<span className='grid size-7 shrink-0 place-items-center rounded-full border border-[var(--accent)] bg-[var(--paper)] text-[11px] font-bold text-[var(--accent)]'>
								{i + 1}
							</span>
							{i < TRAIL.length - 1 ? <span aria-hidden='true' className='mt-1 w-px flex-1 bg-[var(--rule)] sm:hidden' /> : null}
						</span>
						<span className='min-w-0'>
							<span className='block text-[13.5px] font-bold text-[var(--ink)]'>{step.stage}</span>
							<span className='block text-[12.5px] leading-snug text-[var(--ink-2)]'>{step.doc}</span>
							<span className='mt-0.5 block text-[11.5px] text-[var(--ink-mute)]'>{step.who}</span>
						</span>
					</li>
				))}
			</ol>
			<p className='flex items-center gap-2 border-t border-[var(--rule)] pt-4 text-[12.5px] text-[var(--ink-2)]'>
				<LinkIcon size={14} weight='bold' className='shrink-0 text-[var(--accent)]' aria-hidden='true' />
				One ID from step 1 to step 8, posted within 7 working days at each step.
			</p>
		</figure>
	)
}

/* ---- 2. Where the trail stops for the Bangsamoro ---- */

type Cell = 'yes' | 'no' | 'part'
const STAGES = ['Preparation', 'Legislation', 'Execution', 'Procurement', 'Accountability']
const ROWS: { who: string; note: string; cells: Cell[] }[] = [
	{ who: 'National agencies', note: 'DPWH, DepEd and the rest, including their projects in the region', cells: ['yes', 'yes', 'yes', 'yes', 'yes'] },
	{ who: 'Block grant to the region', note: 'Released by the DBM; the release is national', cells: ['yes', 'yes', 'part', 'no', 'no'] },
	{ who: 'Bangsamoro ministries', note: 'Appropriated by the BAA, spent by the ministries', cells: ['no', 'no', 'no', 'no', 'no'] },
	{ who: 'Provinces, cities, towns', note: 'Only “encouraged” to adopt something similar', cells: ['no', 'no', 'no', 'no', 'no'] },
]
const MARK: Record<Cell, { icon: React.ReactNode; label: string; tone: string }> = {
	yes: { icon: <CheckIcon size={13} weight='bold' aria-hidden='true' />, label: 'Covered', tone: 'bg-[var(--accent)] text-[var(--paper)]' },
	part: { icon: <ClockIcon size={13} weight='bold' aria-hidden='true' />, label: 'Release only', tone: 'border border-[var(--accent)] text-[var(--accent)]' },
	no: { icon: <MinusIcon size={13} weight='bold' aria-hidden='true' />, label: 'Not covered', tone: 'border border-[var(--rule)] text-[var(--ink-mute)]' },
}

export function Coverage() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>What CADENA reaches</p>
			<p className='mt-2 text-[15px] font-bold leading-snug text-[var(--ink)]'>The trail runs to the regional border, then stops.</p>
			<div className='mt-6 overflow-x-auto'>
				<table className='w-full min-w-[40rem] border-collapse text-left'>
					<thead>
						<tr>
							<th className='w-[34%] pb-3 pr-3' />
							{STAGES.map((stage) => (
								<th key={stage} className='pb-3 text-center text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)]'>
									{stage}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{ROWS.map((row, r) => (
							<tr key={row.who} className={`border-t ${r === 2 ? 'border-t-2 border-dashed border-[var(--ink)]' : 'border-[var(--rule)]'}`}>
								<td className='py-3 pr-3 align-top'>
									<span className='block text-[13.5px] font-bold text-[var(--ink)]'>{row.who}</span>
									<span className='block text-[11.5px] leading-snug text-[var(--ink-3)]'>{row.note}</span>
								</td>
								{row.cells.map((cell, c) => (
									<td key={c} className='py-3 text-center align-middle'>
										<span title={MARK[cell].label} className={`inline-grid size-7 place-items-center rounded-full ${MARK[cell].tone}`}>
											{MARK[cell].icon}
											<span className='sr-only'>{MARK[cell].label}</span>
										</span>
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className='mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[var(--ink-2)]'>
				{(['yes', 'part', 'no'] as const).map((cell) => (
					<span key={cell} className='inline-flex items-center gap-2'>
						<span className={`inline-grid size-5 place-items-center rounded-full ${MARK[cell].tone}`}>{MARK[cell].icon}</span>
						{MARK[cell].label}
					</span>
				))}
				<span className='inline-flex items-center gap-2'>
					<span aria-hidden='true' className='w-6 border-t-2 border-dashed border-[var(--ink)]' />
					The regional border
				</span>
			</div>
		</figure>
	)
}

/* ---- 3. Where the bill stands ---- */

const PATH = [
	{ when: 'Nov 2025', what: 'Renamed CADENA in Senate hearings', state: 'done' },
	{ when: '15 Dec 2025', what: 'Senate passes SB 1506, 17–0', state: 'done' },
	{ when: 'Feb 2026', what: 'House bills filed, HB 7712 and HB 6898', state: 'done' },
	{ when: 'May 2026', what: 'House Appropriations committee', state: 'now' },
	{ when: '—', what: 'House third reading', state: 'next' },
	{ when: '—', what: 'Signed into law', state: 'next' },
] as const

export function BillPath() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>Where the bill stands</p>
			<p className='mt-2 text-[15px] font-bold leading-snug text-[var(--ink)]'>Passed by one chamber, held in a House committee since May.</p>
			<ol className='!mt-6 grid !list-none gap-4 !pl-0 sm:grid-cols-3 lg:grid-cols-6 [&>li+li]:!mt-0'>
				{PATH.map((step) => (
					<li key={step.what} className='border-t-2 pt-3' style={{ borderColor: step.state === 'next' ? 'var(--rule)' : 'var(--accent)' }}>
						<span
							className={`inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] ${
								step.state === 'now' ? 'text-[var(--accent)]' : step.state === 'done' ? 'text-[var(--ink-3)]' : 'text-[var(--ink-mute)]'
							}`}
						>
							{step.state === 'done' ? <CheckIcon size={12} weight='bold' aria-hidden='true' /> : step.state === 'now' ? <ClockIcon size={12} weight='bold' aria-hidden='true' /> : null}
							{step.state === 'done' ? 'Done' : step.state === 'now' ? 'Stuck here' : 'Still to come'}
						</span>
						<span className='mt-1.5 block text-[13px] font-bold leading-snug text-[var(--ink)]'>{step.what}</span>
						<span className='num mt-0.5 block text-[11.5px] text-[var(--ink-3)]'>{step.when}</span>
					</li>
				))}
			</ol>
		</figure>
	)
}

/* ---- 4. The clock on each record ---- */

export function Deadlines() {
	const mark = (day: number) => `${(day / 34) * 100}%`
	return (
		<figure className={FIG}>
			<p className={KICKER}>The clock on each record</p>
			<p className='mt-2 text-[15px] font-bold leading-snug text-[var(--ink)]'>Working days after a document is approved or issued.</p>
			<div className='relative mt-10 h-24'>
				<div className='absolute inset-x-0 top-6 h-2 overflow-hidden rounded-full bg-[var(--rule)]'>
					<span className='absolute inset-y-0 left-0 bg-[var(--accent)]/25' style={{ width: mark(7) }} />
					<span className='absolute inset-y-0 bg-[var(--accent)]/60' style={{ left: mark(7), width: `calc(${mark(30)} - ${mark(7)})` }} />
					<span className='absolute inset-y-0 right-0 bg-[var(--accent)]' style={{ left: mark(30) }} />
				</div>
				{[
					{ day: 0, top: 'Day 0', label: 'Document approved' },
					{ day: 7, top: 'Day 7', label: 'Late: administrative offence' },
					{ day: 30, top: 'Day 30', label: 'A crime: 6–15 years, up to ₱3M' },
				].map((m) => (
					<div key={m.day} className='absolute top-0 -translate-x-[1px]' style={{ left: mark(m.day) }}>
						<span className='num block text-[11.5px] font-bold text-[var(--ink)]'>{m.top}</span>
						<span aria-hidden='true' className='mt-1 block h-6 w-px bg-[var(--ink)]' />
						<span className={`mt-1 block max-w-[10rem] text-[11.5px] leading-snug text-[var(--ink-2)] ${m.day === 30 ? '-translate-x-full text-right' : ''}`}>{m.label}</span>
					</div>
				))}
			</div>
			<div className='mt-6 grid gap-3 border-t border-[var(--rule)] pt-5 sm:grid-cols-3'>
				{[
					['9 months', 'Every agency posts on its own website'],
					['2 years', 'The 5 biggest spenders on the portal'],
					['3 years', 'Every agency on the portal'],
				].map(([when, what]) => (
					<div key={when}>
						<span className='num block text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{when}</span>
						<span className='block text-[12.5px] leading-snug text-[var(--ink-3)]'>{what}</span>
					</div>
				))}
			</div>
			<figcaption className={CAPTION}>First offence after day 7: reprimand or up to 6 months&rsquo; suspension; a second: dismissal and perpetual disqualification.</figcaption>
		</figure>
	)
}

export const CADENA_FIGURES = {
	'peso-trail': <PesoTrail />,
	coverage: <Coverage />,
	'bill-path': <BillPath />,
	deadlines: <Deadlines />,
}
