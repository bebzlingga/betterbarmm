import type { Metadata } from 'next'
import { TableOfContents } from '@betterbarmm/editorial'
import { budget, formatNumber, budgetFor } from '@betterbarmm/budget-data'
import { Masthead } from '../_components/budget-parts'

export const metadata: Metadata = {
	title: 'The budget process',
	description:
		'How a Bangsamoro budget is prepared, enacted, released and audited — and how that differs from the way a province, city, municipality or barangay makes its own.',
}

/* ============================================================
   The budget process

   The four phases a Bangsamoro budget moves through, from the
   budget call to the audit.

   No dates. The Bangsamoro process is set by the Organic Law and
   the Bangsamoro Administrative Code rather than by the Acts this
   workspace holds, so it can be described by phase and checked,
   but a calendar for it would be invented.

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
 * go wrong there, or what a citizen can and cannot do about it. `basis` is the
 * issuance that governs the phase, where one exists and has been read.
 */
const PHASES = [
	{
		phase: 'Preparation',
		who: 'The ministries, and the Ministry of Finance, Budget and Management',
		what: 'Long before anyone outside government sees a budget, it is already being fought over inside one. MFBM tells every office how much it may ask for. Every office asks for more. The difference between those two numbers is settled in a room, and what comes out of that room is the budget.',
		steps: [
			'It starts with a letter. MFBM sends out a budget call telling every ministry, office and agency two things: the ceiling it has to work within, and what the year is meant to be about. The ceiling comes from the block grant, which is known ahead of time because it is a formula rather than a negotiation.',
			'Each office writes back with what it wants — staff, programs, projects — and has to show what it did with the last two years of money before it can ask for more.',
			'MFBM goes through the requests in technical hearings and cuts them to fit. Almost nobody comes in under their ceiling, so this is the room where the real choices get made: which program survives, which one waits another year.',
			'What is left is stitched into a single budget, and the Chief Minister signs it off as the executive’s proposal.',
		],
		stakes:
			'Most of the budget is decided here, and none of it is public. If your program is cut at this stage it never reaches Parliament, so there is no debate to follow and no member to write to — there is not even a record that it was asked for. No budget call, no ministry request and no hearing is published. By the time you can read the budget, you are reading the answer, not the argument.',
	},
	{
		phase: 'Legislation',
		who: 'The Bangsamoro Parliament',
		what: 'Now it becomes public, and for a few months it belongs to people you elected. Parliament takes the executive’s proposal apart, puts it back together the way it prefers, and turns it into law.',
		steps: [
			'The Chief Minister hands the budget to Parliament.',
			'A committee works through it, and ministers come in to defend what they asked for — the first time anyone has to explain a number out loud.',
			'The whole Parliament debates it, moves money about, and votes it through on the third reading.',
			`Wherever members want a string attached, it becomes a special provision — a condition on one particular appropriation. This year’s Act carries ${formatNumber(provisions)} of them.`,
			'Signed, it is a General Appropriations Act of the Bangsamoro. From that moment nothing can be spent unless a line in it says so, and anything left out waits for next year or a separate Act.',
		],
		stakes:
			'This is the only stretch you can watch, and the only one you can influence. Parliament can shift money between offices and attach conditions to money it cannot otherwise reach — and those conditions are the real lever: they can force a ministry to publish its guidelines, report what it spent, or spend only on the thing that was named. If you want something in the budget changed, this is the moment to ask, and there is not another one.',
	},
	{
		phase: 'Execution',
		who: 'MFBM and the Bangsamoro Treasury, then every ministry',
		what: 'The Act is passed, and almost nothing happens yet. A line in the law is permission, not money. Before an office can spend a peso, MFBM has to hand it two further things — and then the clock starts, twice a year, whether the office is ready or not.',
		steps: [
			'MFBM releases an allotment: the authority for an office to commit money. Separately it issues a Notice of Cash Allocation, the authority to actually pay. Neither comes from the Act; both are decisions MFBM takes afterwards.',
			'The cash lands in the office’s account in the Bangsamoro Treasury System on Disbursement — BTS-D, built by Land Bank for the Bangsamoro Government and running since 1 January 2024. Comprehensively released allocations are credited on the first working day of each month.',
			'An NCA has a shelf life. One issued in the first half of the year is good until 30 June; one issued in the second half until 31 December.',
			'At 11.59pm on 30 June and again on 31 December, whatever cash is still sitting in those accounts reverts automatically to the Bangsamoro Treasury. Nobody decides it; the system does it.',
			'An office that lost cash it still needs can ask for a new NCA. It writes to MFBM signed by the Minister, explains why the money went undisbursed, attaches the bank’s certification of what reverted, its list of unpaid obligations and its latest accountability reports. The Bangsamoro Budget Office assesses it and answers in writing.',
			'That request has its own deadline: 15 November. Ask after that and it is dealt with next fiscal year, if the appropriation is still alive.',
		],
		stakes:
			'This is where money quietly falls out of projects without anyone breaking a rule, and the cause is almost always timing. A road can sit in the budget all year and never be built because the cash arrived late, reverted at the end of June, and took until November to come back. But it is not lost. Reverted funds go to the Bangsamoro Treasury and are held in a Special Fund for re-appropriation — they leave the office that was given them, not the region.',
		basis:
			'Reversion under Section 19, Article XII of RA 11054. The half-year cut-offs, the NCA validity and the 15 November deadline are MFBM Bangsamoro Budget Circular 2024-009, which does not cover local government units receiving a subsidy.',
	},
	{
		phase: 'Accountability',
		who: 'The Commission on Audit, and Parliament',
		what: 'A year later, somebody checks. This is the phase that finally answers the question the other three only make promises about: was any of it actually done?',
		steps: [
			'COA audits each office — what it committed and what it paid, against what the Act allowed — and publishes a report on it.',
			'Parliament takes up what the audit found, and the next budget call is written knowing it. An office that could not spend what it was given usually gets less next time.',
			'This is the stage that produces the record of what was really spent.',
		],
		stakes:
			'It is the only phase that tells you what happened rather than what was intended — and it is the one this site cannot show you. The auditors do the work and Parliament sees the findings, but there is no public, office-by-office record of what was spent against what was given. That single gap is why every figure here is a promise and not a receipt.',
	},
] as const

const slug = (phase: string) => phase.toLowerCase()

export default function ProcessPage() {
	return (
		<>
			{/* The claim no longer promises a second half. It said "and a different
			    four in a town" over a comparison that has since been taken out. */}
			<Masthead
				center
				kicker='How a budget is made'
				title='From a budget call'
				titleMuted='to an audited peso.'
			/>

			{/* ---- The region ---- */}
			{/* The reading column, with a standing index in the margin beside it
			    (user decision). Four phases is a short list, but each one runs to a
			    screen and a half, and without the index a reader deep in Execution
			    has no way of knowing there is an Accountability phase under it.

			    The pair is centerd under the centerd masthead rather than ranged to
			    the container's left edge, so the column the reader is reading stays
			    where the heading above it pointed.

			    Below `lg` the index goes rather than restacking: a set of jump links
			    above the article would only delay the article. */}
			<section className='bb-container section-band'>
				<div className='gap-x-16 lg:grid lg:grid-cols-[minmax(0,54rem)_13rem] lg:justify-center xl:gap-x-24'>
				<div className='mx-auto min-w-0 max-w-[54rem]'>
					<ol>
						{PHASES.map((phase) => (
							<li
								key={phase.phase}
								id={slug(phase.phase)}
								/* Matched to the offset the index pins at, so a jump lands the
								   heading level with its own entry rather than under the bar. */
								className='scroll-mt-32 border-t border-[var(--brass-line)] py-10 first:border-t-0 first:pt-0'
							>
								<div>
									<h3 className='text-[24px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)]'>
										{phase.phase}
									</h3>
									<p className='mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
										{phase.who}
									</p>

									<p className='mt-5 max-w-3xl text-[16px] leading-[1.7] text-[var(--ink-2)]'>
										{phase.what}
									</p>

									{/* A rail rather than a list of rules.

									    The steps inside a phase are a sequence in time — a budget
									    call, then proposals against it, then the cutting back — and a
									    stack of ruled rows says only that there are four of them. The
									    line is drawn behind the nodes and stopped on the last one, so
									    it connects the steps rather than trailing off under the phase
									    that follows.

									    Square nodes, not circles: every control on this estate is
									    square, down to the chips that were pills until somebody
									    squared them. */}
									<ol className='mt-7 max-w-3xl'>
										{phase.steps.map((step, at) => (
											<li key={step} className='group relative flex gap-5 pb-7 last:pb-0'>
												<span
													aria-hidden='true'
													className='absolute bottom-0 left-3 top-6 w-px bg-[var(--rule)] group-last:hidden'
												/>
												{/* Filled, and the number in white rather than black: on the
												    crimson this sits on, black lands under 2:1 and is unreadable
												    at 10px. `font-black` is the weight. */}
												<span className='num relative z-10 flex size-6 shrink-0 items-center justify-center bg-[var(--accent)] font-mono text-[10px] font-black text-white'>
													{at + 1}
												</span>
												<span className='pt-0.5 text-[14.5px] leading-[1.65] text-[var(--ink-2)]'>
													{step}
												</span>
											</li>
										))}
									</ol>

									{/* Set apart from the steps rather than appended to them: it is
									    not another thing that happens in the phase, it is what the
									    phase means for somebody watching from outside it. */}
									<div className='mt-8 max-w-3xl border-l-2 border-[var(--accent)] bg-[var(--paper-2)] px-6 py-5'>
										<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>
											Why this phase matters
										</p>
										<p className='mt-3 text-[14.5px] leading-[1.7] text-[var(--ink-2)]'>
											{phase.stakes}
										</p>
										{'basis' in phase && phase.basis ? (
											<p className='mt-4 border-t border-[var(--rule)] pt-3 font-mono text-[10px] leading-5 uppercase tracking-[0.1em] text-[var(--ink-mute)]'>
												{phase.basis}
											</p>
										) : null}
									</div>
								</div>
							</li>
						))}
					</ol>
				</div>

					<aside className='hidden lg:block'>
						<TableOfContents
							label='The four phases'
							items={PHASES.map((phase) => ({ id: slug(phase.phase), label: phase.phase }))}
						/>
					</aside>
				</div>
			</section>

		</>
	)
}
