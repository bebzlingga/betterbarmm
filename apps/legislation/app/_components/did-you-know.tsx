import Link from 'next/link'

/* ============================================================
   What the laws actually give you

   The registry is good at telling you a law exists and bad at telling you it
   is about your life. A reader who lands on the hub sees 1,966 measures, a
   funnel of how few pass, and seven procedural stages — none of which answers
   "so what".

   These do. Every card is one entitlement, stated as the thing you can claim
   or use, with the act it comes from linked underneath. They are picked for
   being concrete: a number of days, a cost somebody else carries, a floor
   under a budget. Nothing aspirational, nothing that needs an implementing
   rule before it means anything.

   Each fact is read from the registry's own record of the act, and the source
   is on the card rather than in a footnote, because "did you know" is only
   worth reading if the next question — how do you know — is answered on the
   spot.
   ============================================================ */

type Fact = {
	sector: string
	/** The entitlement, said as the reader would use it. */
	headline: string
	detail: string
	act: { number: number; label: string }
	/** Which of the marks below stands over the card. */
	mark: MarkName
}

/* ---- The marks ----

   One small drawing per card, and each one draws the shape of the
   entitlement rather than illustrating its subject: a run of seven days, a
   cost standing on one side of a line and not the other, a five per cent
   arc off a whole. A stock icon of a briefcase would say "work", which the
   label above it already says.

   The house rule from the estate's other line art holds here — brass is the
   furniture and the crimson appears exactly once in each mark, on the part
   that is the fact. Everything is stroked rather than filled, at one weight,
   so six of them in a row read as one set.

   `aria-hidden` throughout: every one of them is a restatement of the
   headline beside it, and a screen reader that announced them would be
   reading the card twice. */

type MarkName = 'run-of-days' | 'other-side' | 'no-cost' | 'built' | 'share' | 'span'

const MARKS: Record<MarkName, React.ReactNode> = {
	// Seven days, run off together and marked as one span.
	'run-of-days': (
		<>
			<rect x='6' y='12' width='36' height='30' />
			<path d='M6 20h36M16 8v8M32 8v8' />
			{[0, 1, 2, 3, 4, 5, 6].map((day) => (
				<path key={day} d={`M${12 + day * 4.5} 26v5`} />
			))}
			<path d='M12 36h27' stroke='var(--accent)' strokeWidth='2.4' />
		</>
	),

	// The cost is a column, and it stands on the far side of the line.
	'other-side': (
		<>
			<path d='M24 8v34M8 42h32' />
			<path d='M12 42v-8' />
			<path d='M34 42V22' stroke='var(--accent)' strokeWidth='4' />
		</>
	),

	// A price, struck through: the place a figure would go, and no figure.
	'no-cost': (
		<>
			<rect x='8' y='10' width='32' height='28' />
			<path d='M14 18h20M14 24h20M14 30h12' />
			<path d='M10 40 40 8' stroke='var(--accent)' strokeWidth='2.4' />
		</>
	),

	// Built up one act at a time, and still going.
	built: (
		<>
			<path d='M6 42h36' />
			<path d='M10 42V30h7v12M19 42V24h7v18' />
			<path d='M28 42V16h8v26' stroke='var(--accent)' />
			<path d='M32 21v6M29 24h6' stroke='var(--accent)' />
		</>
	),

	// A whole, and the slice of it that is spoken for.
	share: (
		<>
			<circle cx='24' cy='24' r='14' />
			<circle
				cx='24'
				cy='24'
				r='14'
				stroke='var(--accent)'
				strokeWidth='3.5'
				strokeDasharray='4.4 87.9'
				transform='rotate(-90 24 24)'
			/>
		</>
	),

	// A range, and how much of the axis it covers.
	span: (
		<>
			<path d='M6 24h36' />
			<path d='M12 18v12M36 18v12' />
			<path d='M12 24h24' stroke='var(--accent)' strokeWidth='3.5' />
		</>
	),
}

function Mark({ name }: { name: MarkName }) {
	return (
		<svg
			viewBox='0 0 48 48'
			className='size-10 text-[var(--brass)]'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.4'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
		>
			{MARKS[name]}
		</svg>
	)
}

const FACTS: Fact[] = [
	{
		sector: 'Work',
		headline: '7 days of paid leave when someone in your family dies',
		detail:
			'Every employee in the region has it — public or private, whatever your employment status. If your employer does not act on the application within 5 working days it is automatically approved, and taking it cannot be used to dismiss you, demote you or mark down your performance rating.',
		act: { number: 72, label: 'Bangsamoro Bereavement Leave Act of 2025' },
		mark: 'run-of-days',
	},
	{
		sector: 'Working abroad',
		headline: 'Your employer pays the recruitment costs, not you',
		detail:
			'The visa, the airfare, the processing and the welfare membership are the employer’s to carry. Your basic monthly salary cannot be lower than the host country’s minimum wage or Metro Manila’s, whichever is higher.',
		act: { number: 19, label: 'Overseas Bangsamoro Workers Act of 2020' },
		mark: 'other-side',
	},
	{
		sector: 'Education',
		headline: 'A science high school place costs nothing',
		detail:
			'Qualified Bangsamoro learners attend free of charge, with scholarships, stipends and allowances, on a curriculum built to Philippine Science High School standards.',
		act: { number: 40, label: 'Bangsamoro Science High School System Act of 2023' },
		mark: 'no-cost',
	},
	{
		sector: 'Health',
		headline: '16 separate laws have built or upgraded a hospital',
		detail:
			'Since 2022, one act at a time, from a municipal infirmary in Sibutu to the 350-bed Level III teaching hospital in Maguindanao — the highest classification the region has.',
		act: { number: 74, label: 'Bangsamoro Regional Hospital and Medical Center Act of 2025' },
		mark: 'built',
	},
	{
		sector: 'Women',
		headline: '5% of every ministry’s budget is committed to women',
		detail:
			'A floor, not a target: each ministry, office and agency must run a Gender and Development Plan worth at least 5% of its budget, and file both the plan and what it achieved with the Bangsamoro Women Commission.',
		act: { number: 85, label: 'General Appropriations Act of the Bangsamoro, FY 2026' },
		mark: 'share',
	},
	{
		sector: 'Youth',
		headline: 'Youth means 15 to 40 here',
		detail:
			'Wider than almost anywhere else, which decides who qualifies for youth programmes and scholarships. The commission that runs them seats a commissioner in every province.',
		act: { number: 10, label: 'Bangsamoro Youth Commission Act of 2020' },
		mark: 'span',
	},
]

export function DidYouKnow() {
	return (
		<section className='bb-container pb-16 lg:pb-24'>
			<div className='border-t border-[var(--rule)] pt-14 lg:pt-20'>
				<p className='eyebrow'>Did you know</p>
				<h2 className='section-title mt-3 max-w-3xl'>
					Some of it is already yours to use.
				</h2>
				<p className='copy mt-4 max-w-2xl text-[var(--ink-2)]'>
					A law is easy to read as something that happens to other people. These six are not:
					each one is a thing you can claim, a cost someone else has to carry, or a share of
					public money already spoken for.
				</p>

				{/* Hairlines rather than cards. Six framed boxes read as six things to
				    inspect; ruled off, they read as one list of facts — and the rules
				    are what the rest of the site uses to separate anything. */}
				<dl className='mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-16'>
					{FACTS.map((fact) => (
						<div key={fact.sector} className='border-t border-[var(--rule-soft)] pt-6'>
							<dt>
								<Mark name={fact.mark} />
								<span className='label mt-5 block'>{fact.sector}</span>
								<p className='fact-title mt-2.5 text-[var(--ink)]'>{fact.headline}</p>
							</dt>
							<dd>
								<p className='mt-2.5 bb-body text-[var(--ink-3)]'>{fact.detail}</p>
								{/* The source, on the card. "Did you know" is worth reading only
								    if "how do you know" is answered next to it. */}
								<Link
									href={`/acts/${fact.act.number}`}
									className='rule-link rule-link-quiet mt-4 inline-block text-[13px]'
								>
									BAA {fact.act.number} &middot; {fact.act.label}
								</Link>
							</dd>
						</div>
					))}
				</dl>
			</div>
		</section>
	)
}
