import type { Metadata } from 'next'
import { budget, formatNumber, budgetFor } from '@betterbarmm/budget-data'
import { Masthead } from '../_components/budget-parts'

export const metadata: Metadata = {
	title: 'The budget process',
	description:
		'How a Bangsamoro budget is prepared, enacted, released and audited: the twenty-five steps of MFBM’s budget cycle, told as a sequence you can follow.',
}

/* ============================================================
   The budget process

   The four phases a Bangsamoro budget moves through, from the
   budget call to the audit.

   Checked against MFBM's own budget cycle chart, which breaks
   the four phases into twenty-five numbered steps. The phases
   here carry all twenty-five — the `basis` line on each one
   names its range — but they are told as a sequence rather
   than as a numbered diagram, because a reader following the
   money does not need MFBM's numbering and a reader checking
   the page against the chart can count.

   That check moved three things. It added the steps this page
   had skipped: the stakeholder engagement in Preparation, the
   guidelines, programming and obligation at the front of
   Execution, and the two performance reviews that come before
   the audit. It corrected the order of Accountability, where
   the audit was leading and in fact comes last. And it took
   out two claims the chart disproves — that nothing in
   Preparation is consultative, and that no record of spending
   against appropriation is ever made. Both are narrower than
   they were written: the consultation happens and the record
   is made, neither is published.

   No dates. The Bangsamoro process is set by the Organic Law and
   the Bangsamoro Administrative Code rather than by the Acts this
   workspace holds, so it can be described by phase and checked,
   but a calendar for it would be invented. The chart numbers the
   steps and does not date them either.

   A comparison against how a town makes its own budget stood
   here and has been taken out for now. The local side of it is
   on the LGU workspace, where the Code and its IRR supply the
   dates this page cannot.
   ============================================================ */

const LATEST = budget.fiscalYear
const provisions = budgetFor(LATEST).provisions.length

/**
 * The four phases a budget moves through, told as what happens to the money.
 *
 * Written as a sequence somebody could follow rather than a set of
 * definitions. A budget process is explained badly almost everywhere, in the
 * vocabulary of the people who run it, and a reader who has to decode
 * "obligation" before the sentence makes sense has been lost at the first
 * step. So each phase is a stretch of the year with people in it doing things,
 * in order, with the dates and figures where there are any.
 *
 * `stakes` is why it matters to somebody outside government — usually what can
 * go wrong there, or what a citizen can and cannot do about it. `basis` is what
 * the phase was checked against: its range in MFBM's budget cycle chart, plus
 * any issuance that governs it and has been read.
 */
const PHASES = [
	{
		phase: 'Preparation',
		who: 'The ministries, and the Ministry of Finance, Budget and Management',
		what: 'Long before anyone outside government sees a budget, it is already being fought over inside one. MFBM tells every office how much it may ask for. Every office asks for more. The difference between those two numbers is settled in a room, and what comes out of that room is the budget.',
		steps: [
			'It starts with a letter. MFBM sends out a budget call telling every ministry, office and agency two things: the ceiling it has to work within, and what the year is meant to be about. The ceiling comes from the block grant, which is known ahead of time because it is a formula rather than a negotiation.',
			'MFBM convenes a budget forum to take the offices through the call. Separately, each ministry runs a stakeholder engagement on what it is about to ask for — the one point in the whole cycle where somebody outside government is consulted before the budget is written rather than after it is decided.',
			'Each office writes back with what it wants — staff, programs, projects — and has to show what it did with the last two years of money before it can ask for more.',
			'MFBM reviews every proposal on paper, then calls the office in to a technical budget hearing to defend it. Almost nobody comes in under their ceiling, so this is the room where the real choices get made: which program survives, which one waits another year. The office then goes away and rewrites its proposal to match what came out of that room.',
			'MFBM consolidates the rewritten proposals into one document — the Bangsamoro Expenditure Program — and puts it to the Chief Minister and the Cabinet.',
			'What they approve becomes the Chief Minister’s Budget: the executive’s proposal, and the first version of the budget that anyone outside government will ever see.',
		],
		stakes:
			'Most of the budget is decided here, and almost none of the deciding is on the record. There is one consultative step — the ministry stakeholder engagement — and after it the proposal disappears into technical hearings nobody outside the room sees. If your program is cut at that stage it never reaches Parliament, so there is no debate to follow and no member to write to; there is not even a record that it was asked for. No budget call, no ministry proposal, no hearing and no Expenditure Program is published. By the time you can read the budget, you are reading the answer, not the argument.',
		basis: 'Steps 1.1 to 1.10 of the MFBM budget cycle.',
	},
	{
		phase: 'Legislation',
		who: 'The Bangsamoro Parliament',
		what: 'Now it becomes public, and for a few months it belongs to people you elected. Parliament takes the executive’s proposal apart, puts it back together the way it prefers, and turns it into law.',
		steps: [
			'The Chief Minister submits the budget documents to Parliament.',
			'A committee works through them, and ministers come in to defend what they asked for — the first time anyone has to explain a number out loud where the public can hear it. They have explained it once already, in MFBM’s technical hearing, behind a closed door.',
			'The whole Parliament deliberates, moves money about, and enacts it on the third reading.',
			`Wherever members want a string attached, it becomes a special provision — a condition on one particular appropriation. This year’s Act carries ${formatNumber(provisions)} of them.`,
			'The Chief Minister signs what Parliament passed.',
			'Signed, it is a General Appropriations Act of the Bangsamoro. From that moment nothing can be spent unless a line in it says so, and anything left out waits for next year or a separate Act.',
		],
		stakes:
			'This is the only stretch with a public record, and the only one where the people deciding answer to you at an election. Parliament can shift money between offices and attach conditions to money it cannot otherwise reach — and those conditions are the real lever: they can force a ministry to publish its guidelines, report what it spent, or spend only on the thing that was named. If you want something in the budget changed, this is the moment to ask, and after it there is not another one.',
		basis: 'Steps 2.1 to 2.5 of the MFBM budget cycle.',
	},
	{
		phase: 'Execution',
		who: 'MFBM and the Bangsamoro Treasury, then every ministry',
		what: 'The Act is passed, and almost nothing happens yet. A line in the law is permission, not money. Before an office can spend a peso, MFBM has to hand it two further things — and then the clock starts, twice a year, whether the office is ready or not.',
		steps: [
			'MFBM issues the guidelines for the year’s execution: the rules every office has to release and spend under, written after the Act rather than in it.',
			'Each office programs its budget — a plan of when across the year it will commit the money it was given, and when it will need the cash to pay for it. Everything that follows is measured against this plan.',
			'MFBM releases an allotment: the authority for an office to commit money.',
			'The office obligates against that allotment — signs the contract, hires the staff, orders the work. This is the moment the money stops being an intention and becomes a debt the government owes somebody. The allotment is only permission to reach it.',
			'Separately MFBM issues a Notice of Cash Allocation, the authority to actually pay. Neither the allotment nor the NCA comes from the Act; both are decisions MFBM takes afterwards. The cash lands in the office’s account in the Bangsamoro Treasury System on Disbursement — BTS-D, built by Land Bank for the Bangsamoro Government and running since 1 January 2024. Comprehensively released allocations are credited on the first working day of each month.',
			'The office disburses: it pays the contractor, the supplier, the staff. An obligation that is never disbursed is a bill the government has run up and not settled.',
			'An NCA has a shelf life. One issued in the first half of the year is good until 30 June; one issued in the second half until 31 December.',
			'At 11.59pm on 30 June and again on 31 December, whatever cash is still sitting in those accounts reverts automatically to the Bangsamoro Treasury. Nobody decides it; the system does it.',
			'An office that lost cash it still needs can ask for a new NCA. It writes to MFBM signed by the Minister, explains why the money went undisbursed, attaches the bank’s certification of what reverted, its list of unpaid obligations and its latest accountability reports. The Bangsamoro Budget Office assesses it and answers in writing.',
			'That request has its own deadline: 15 November. Ask after that and it is dealt with next fiscal year, if the appropriation is still alive.',
			'Running underneath all of it, each ministry files accountability reports on what it obligated and what it disbursed. They are the only continuous record of the Act being carried out, they are what a replacement NCA is judged on, and they are what the next phase reads.',
		],
		stakes:
			'This is where money quietly falls out of projects without anyone breaking a rule, and the cause is almost always timing. A road can sit in the budget all year and never be built because the cash arrived late, reverted at the end of June, and took until November to come back. But it is not lost. Reverted funds go to the Bangsamoro Treasury and are held in a Special Fund for re-appropriation — they leave the office that was given them, not the region.',
		basis:
			'Steps 3.1 to 3.7 of the MFBM budget cycle. Reversion under Section 19, Article XII of RA 11054. The half-year cut-offs, the NCA validity and the 15 November deadline are MFBM Bangsamoro Budget Circular 2024-009, which does not cover local government units receiving a subsidy.',
	},
	{
		phase: 'Accountability',
		who: 'The government itself, then the Commission on Audit, then Parliament',
		what: 'Somebody checks — three times, in that order, and only the last of them is independent. This is the phase that finally answers the question the other three only make promises about: was any of it actually done?',
		steps: [
			'Halfway through the year the government reviews its own performance: what each office was given, what it has obligated and disbursed against it, and what it has to show for the difference. An office falling behind finds out here, while there is still half a year to fix it.',
			'At the close of the year the same review again, against the full twelve months — the government’s own account of what it did with the Act, settled before anyone outside it looks.',
			'Then COA audits each office — what it committed and what it paid, against what the Act allowed — and publishes a report on it. It is the first look at the year by somebody who does not work for the people who spent the money.',
			'Parliament takes up what the audit found, and the next budget call is written knowing it. An office that could not spend what it was given usually gets less next time.',
			'This is the stage that produces the record of what was really spent.',
		],
		stakes:
			'It is the only phase that tells you what happened rather than what was intended — and it is the one this site cannot show you. The reviews are held, the ministries file their reports, the auditors do the work and Parliament sees the findings. But nothing that comes out of any of it is a public, office-by-office account of what was spent against what was given. The figures exist; the gap is not that the record is never made, it is that it is never published. That is why every figure here is a promise and not a receipt.',
		basis: 'Steps 4.1 to 4.3 of the MFBM budget cycle.',
	},
] as const

const slug = (phase: string) => phase.toLowerCase()

export default function ProcessPage() {
	const steps = PHASES.reduce((n, phase) => n + phase.steps.length, 0)
	return (
		<>
			<Masthead
				kicker='How a budget is made'
				title='The budget process'
				lead={`From a budget call to an audited peso: the four phases a Bangsamoro budget moves through, ${steps} steps in all, checked against MFBM’s own budget cycle.`}
			/>

			{/* The four phases as cards, numbered in the order a budget takes them; each opens its phase below (user
			    decision: the index in the margin is gone, the cards are the way down). */}
			<section className='bb-container pt-[clamp(3.75rem,7vw,6.5rem)]'>
				<ol className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{PHASES.map((phase, index) => (
						<li key={phase.phase}>
							<a
								href={`#${slug(phase.phase)}`}
								className='group flex h-full flex-col border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]'
							>
								<span className='flex flex-1 flex-col p-5 sm:p-6'>
									<span className='num text-[2.25rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--accent)]'>{String(index + 1).padStart(2, '0')}</span>
									<span className='mt-4 text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{phase.phase}</span>
									<span className='mt-1.5 text-[0.8125rem] leading-[1.5] text-[var(--ink-3)]'>{phase.who}</span>
								</span>
								<span className='flex items-center justify-between border-t border-[var(--rule)] px-5 py-3 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white sm:px-6'>
									{phase.steps.length} steps
									<span aria-hidden='true'>↓</span>
								</span>
							</a>
						</li>
					))}
				</ol>
			</section>

			{/* Each phase: its heading and who acts, what it is, its steps as numbered cards in order, and what it means
			    for somebody watching from outside, set apart as a callout. */}
			{PHASES.map((phase, index) => (
				<section key={phase.phase} id={slug(phase.phase)} className={`scroll-mt-28 ${index % 2 ? 'bg-[var(--paper-2)]' : ''}`}>
					<div className='bb-container bb-section'>
						<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
							<h2 className='text-[1.625rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
								<span className='text-[var(--accent)]'>{String(index + 1).padStart(2, '0')}</span> {phase.phase}
							</h2>
							<span className='inline-block rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--accent)]'>{phase.who}</span>
						</div>
						<p className='mt-4 max-w-4xl text-[1rem] leading-[1.7] text-[var(--ink-2)]'>{phase.what}</p>

						<ol className='mt-8 grid gap-3 md:grid-cols-2'>
							{phase.steps.map((step, at) => (
								<li key={step} className='flex gap-4 border border-[var(--rule)] bg-[var(--paper)] p-5'>
									<span className='num grid size-8 shrink-0 place-items-center bg-[var(--accent)] text-[0.75rem] font-black text-white'>{at + 1}</span>
									<span className='text-[0.90625rem] leading-[1.65] text-[var(--ink-2)]'>{step}</span>
								</li>
							))}
						</ol>

						<div className='mt-4 bg-[#8f2328] p-6 text-white lg:p-8'>
							<p className='font-mono text-[0.625rem] font-bold uppercase tracking-[0.16em] text-[#f6cf7a]'>Why this phase matters</p>
							<p className='mt-3 max-w-4xl text-[0.9375rem] leading-[1.75] text-white/90'>{phase.stakes}</p>
							{'basis' in phase && phase.basis ? (
								<p className='mt-5 border-t border-white/20 pt-3 font-mono text-[0.625rem] uppercase leading-5 tracking-[0.1em] text-white/65'>{phase.basis}</p>
							) : null}
						</div>
					</div>
				</section>
			))}
		</>
	)
}
