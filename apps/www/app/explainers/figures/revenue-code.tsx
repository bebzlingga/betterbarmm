import { CheckIcon, ClockIcon, ProhibitIcon } from '@phosphor-icons/react/ssr'

/* ============================================================
   Graphics for the priority codes explainer

   Plain HTML on the site's tokens, so each reads in both themes and holds its
   meaning without colour: a state always has an icon and a word beside it.
   ============================================================ */

const FIG = 'bb-graphic my-10 leading-[1.7] border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-7'
const CAPTION = 'mt-5 text-[12.5px] leading-[1.7] text-[var(--ink-3)]'
const KICKER = 'text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'
const LEG = 'https://legislation.betterbarmm.com'

/* ---- 1. The seven priority codes ---- */

const CODES = [
	{ name: 'Administrative Code', act: 13, date: 'October 2020', does: 'How the regional government is organised: its ministries, offices and their powers.' },
	{ name: 'Civil Service Code', act: 17, date: 'February 2021', does: 'How government workers are hired, paid, promoted and disciplined.' },
	{ name: 'Education Code', act: 18, date: 'May 2021', does: 'The region’s school system, from basic education to madaris.' },
	{ name: 'Electoral Code', act: 35, date: 'March 2023', does: 'How Members of Parliament are elected, the law behind the first regional elections.' },
	{ name: 'Local Governance Code', act: 49, date: 'September 2023', does: 'What provinces, towns and barangays may do, and how they are funded.' },
	{ name: 'Indigenous Peoples’ Rights Act', act: 64, date: 'December 2024', does: 'The rights of the region’s non-Moro indigenous peoples, their lands and their governance.' },
	{ name: 'Revenue Code', act: null, date: null, does: 'What taxes the regional government may collect, at what rates, and how.' },
] as const

export function Codes() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>The seven priority codes</p>
			<p className='mt-2 text-[15px] font-bold leading-snug text-[var(--ink)]'>Six became law in the transition. The Revenue Code did not.</p>
			<ol className='!mt-6 grid !list-none gap-px border border-[var(--rule)] bg-[var(--rule)] !pl-0 sm:grid-cols-2 [&>li+li]:!mt-0'>
				{CODES.map((c) => {
					const passed = c.act !== null
					return (
						<li key={c.name} className={`flex gap-3 p-4 ${passed ? 'bg-[var(--paper)]' : 'bg-[var(--paper-2)] sm:col-span-2'}`}>
							<span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${passed ? 'bg-[var(--accent)] text-white' : 'border-2 border-dashed border-[var(--accent)] text-[var(--accent)]'}`}>
								{passed ? <CheckIcon size={13} weight='bold' aria-hidden='true' /> : <ClockIcon size={13} weight='bold' aria-hidden='true' />}
							</span>
							<span className='min-w-0'>
								<span className='block text-[14.5px] font-bold text-[var(--ink)]'>{c.name}</span>
								<span className='block text-[12.5px] font-semibold text-[var(--ink-3)]'>
									{passed ? (
										<a href={`${LEG}/acts/${c.act}`} className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
											Bangsamoro Autonomy Act No. {c.act}, {c.date}
										</a>
									) : (
										<span className='text-[var(--accent)]'>Not passed · Parliament Bill No. 286, still at second reading</span>
									)}
								</span>
								<span className='mt-1 block text-[13px] leading-[1.55] text-[var(--ink-2)]'>{c.does}</span>
							</span>
						</li>
					)
				})}
			</ol>
			<figcaption className={CAPTION}>
				The Organic Law names five codes for the transition and allows a sixth, on the civil service (Article XVI, Section 4); the Parliament counts the indigenous peoples’ law as the seventh. Dates are when each was approved, from the Parliament’s list of Bangsamoro Autonomy Acts.
			</figcaption>
		</figure>
	)
}

/* ---- 2. Where the region's money comes from ---- */

const SOURCES = [
	{ what: 'Annual block grant', how: 'A share of national tax and customs collections, sent each year. Never less than the last ARMM budget.', law: 'Art. XII, Sec. 15', code: false },
	{ what: 'Share of national taxes collected in the region', how: '75% to the region; for the first ten years, the National Government’s 25% goes to the region too.', law: 'Art. XII, Sec. 10', code: false },
	{ what: 'The region’s own taxes, fees and charges', how: 'Levied by the Bangsamoro Government itself, kept wholly by it. Needs a Revenue Code to set what, how much and who collects.', law: 'Art. XII, Secs. 6, 14', code: true },
	{ what: 'Natural resources', how: 'Shares of what is earned from the region’s land and waters.', law: 'Art. XII, Sec. 6(d)', code: false },
] as const

export function Sources() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>Where the region’s money comes from</p>
			<p className='mt-2 text-[15px] font-bold leading-snug text-[var(--ink)]'>The block grant and the tax share are set by national law. The part the region raises itself waits on the Revenue Code.</p>
			<ul className='!mt-6 grid !list-none gap-3 !pl-0 sm:grid-cols-2 [&>li+li]:!mt-0'>
				{SOURCES.map((s) => (
					<li key={s.what} className={`flex flex-col border p-4 ${s.code ? 'border-[var(--accent)] bg-[var(--accent-soft,var(--paper-2))]' : 'border-[var(--rule)] bg-[var(--paper-2)]'}`}>
						<span className='text-[14px] font-bold text-[var(--ink)]'>{s.what}</span>
						<span className='mt-1 flex-1 text-[13px] leading-[1.55] text-[var(--ink-2)]'>{s.how}</span>
						<span className='mt-3 flex items-center justify-between gap-2 font-mono text-[11px] text-[var(--ink-3)]'>
							<span>Organic Law, {s.law}</span>
							{s.code ? <span className='font-sans text-[11.5px] font-bold text-[var(--accent)]'>Needs the code</span> : null}
						</span>
					</li>
				))}
			</ul>
			<figcaption className={CAPTION}>From Republic Act No. 11054, the Bangsamoro Organic Law, Article XII (Fiscal Autonomy). The list is the law’s main sources, not all of them.</figcaption>
		</figure>
	)
}

/* ---- 2b. Why the Revenue Code matters, on the brand ground ---- */

const WHY = [
	{ head: 'Money the region decides on', body: 'The block grant and the tax share follow national formulas. The region’s own taxes are the one source its Parliament fully controls.', law: 'Art. XII, Sec. 1' },
	{ head: 'It stays in the region', body: 'Taxes, fees and charges the region levies “accrue exclusively” to the Bangsamoro Government.', law: 'Art. XII, Sec. 6' },
	{ head: 'Rules everyone can see', body: 'What is taxed, at what rate and who is exempt, set in one law, uniform and fair, so businesses and towns can plan.', law: 'Art. XII, Secs. 7, 14' },
	{ head: 'Its own collector', body: 'The code’s companion is a Bangsamoro Revenue Office. Until it exists, the national Bureau of Internal Revenue collects.', law: 'Art. XII, Sec. 11' },
	{ head: 'Before the ten-year window closes', body: 'For the first ten years, the National Government’s 25% of taxes collected in the region goes to the region too. After that, unless extended, the region’s own revenue counts for more.', law: 'Art. XII, Sec. 10' },
] as const

export function Why() {
	return (
		<figure className='bb-graphic brand-bg my-10 p-6 sm:p-9'>
			<p className='text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>Why it matters</p>
			<p className='mt-2 text-[clamp(1.35rem,3vw,1.9rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-[var(--ink)]'>The other six codes built a government. The Revenue Code is how it pays its own way.</p>
			<ol className='!mt-7 !list-none divide-y divide-[var(--rule)] border-t border-[var(--rule)] !pl-0 [&>li+li]:!mt-0'>
				{WHY.map((w, i) => (
					<li key={w.head} className='flex gap-4 py-5'>
						<span className='font-mono text-[13px] font-bold text-[var(--brass)]'>{String(i + 1).padStart(2, '0')}</span>
						<span>
							<span className='block text-[16px] font-bold leading-snug text-[var(--ink)]'>{w.head}</span>
							<span className='mt-1 block text-[14px] leading-[1.6] text-[var(--ink-2)]'>{w.body}</span>
							<span className='mt-1.5 block font-mono text-[11px] text-[var(--ink-3)]'>Organic Law, {w.law}</span>
						</span>
					</li>
				))}
			</ol>
		</figure>
	)
}

/* ---- 3. What the region may not tax ---- */

const LIMITS = [
	'Income tax, except on banks and other financial institutions',
	'Customs duties, and charges on goods passing through the region',
	'Farm and fish products sold by marginal farmers and fisherfolk',
	'Businesses certified as pioneer or new, for a set period',
] as const

export function Limits() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>Where the taxing power stops</p>
			<p className='mt-2 text-[15px] font-bold leading-snug text-[var(--ink)]'>Whatever the code says, the Organic Law already rules some taxes out.</p>
			<ul className='!mt-5 grid !list-none gap-2 !pl-0 sm:grid-cols-2 [&>li+li]:!mt-0'>
				{LIMITS.map((l) => (
					<li key={l} className='flex items-start gap-2.5 text-[14px] leading-[1.5] text-[var(--ink-2)]'>
						<ProhibitIcon size={17} weight='bold' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' /> {l}
					</li>
				))}
			</ul>
			<figcaption className={CAPTION}>From the Organic Law, Article XII, Section 9, shortened; the section lists more. Taxes must also be uniform, fair and not confiscatory (Section 7).</figcaption>
		</figure>
	)
}

/* ---- 4. The Revenue Code's road so far ---- */

const ROAD = [
	{ when: 'June 2019', what: 'Parliament forms an ad hoc committee on the Revenue Code in its first months.', state: 'done' },
	{ when: '28 Feb 2024', what: 'Parliament Bill No. 286, the Bangsamoro Revenue Code, is filed by the Government of the Day.', state: 'done' },
	{ when: '29 Oct 2025', what: 'Committee Report No. 175 is adopted. The bill goes to second reading on the floor.', state: 'done' },
	{ when: 'Nov 2025 – Jul 2026', what: 'Debate is deferred 27 times on the floor; the latest deferral on record is 16 July 2026.', state: 'stuck' },
	{ when: '22 Oct 2026', what: 'The transition Parliament holds its last session. The bill is not passed.', state: 'stuck' },
	{ when: '30 Oct 2026', what: 'The elected Parliament takes office. Lawmakers say the code will be on its priority agenda.', state: 'next' },
] as const

export function Road() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>The Revenue Code’s road so far</p>
			<p className='mt-2 text-[15px] font-bold leading-snug text-[var(--ink)]'>Seven years of the transition, and it never reached a final vote.</p>
			<ol className='!mt-6 !list-none space-y-0 !pl-0 [&>li+li]:!mt-0'>
				{ROAD.map((r, i) => (
					<li key={r.when} className='relative flex gap-4 pb-5 last:pb-0'>
						{i < ROAD.length - 1 ? <span aria-hidden='true' className='absolute left-[11px] top-6 bottom-0 w-px bg-[var(--rule)]' /> : null}
						<span
							className={`relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
								r.state === 'done' ? 'bg-[var(--accent)] text-white' : r.state === 'stuck' ? 'border-2 border-[var(--accent)] bg-[var(--paper)] text-[var(--accent)]' : 'border-2 border-dashed border-[var(--ink-3)] bg-[var(--paper)] text-[var(--ink-3)]'
							}`}
						>
							{r.state === 'done' ? <CheckIcon size={12} weight='bold' aria-hidden='true' /> : <ClockIcon size={12} weight='bold' aria-hidden='true' />}
						</span>
						<span>
							<span className='block font-mono text-[11.5px] font-semibold text-[var(--ink-3)]'>{r.when}</span>
							<span className='block text-[14px] leading-[1.55] text-[var(--ink)]'>{r.what}</span>
						</span>
					</li>
				))}
			</ol>
			<figcaption className={CAPTION}>
				From the Parliament’s journal and bill records as BetterBARMM holds them (deferrals counted to 16 July 2026), and the Speaker’s closing report of 22 October 2026.
			</figcaption>
		</figure>
	)
}

export const REVENUE_CODE_FIGURES = {
	codes: <Codes />,
	sources: <Sources />,
	why: <Why />,
	limits: <Limits />,
	road: <Road />,
}
