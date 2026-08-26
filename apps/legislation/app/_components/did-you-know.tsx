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
}

const FACTS: Fact[] = [
	{
		sector: 'Work',
		headline: '7 days of paid leave when someone in your family dies',
		detail:
			'Every employee in the region has it — public or private, whatever your employment status. If your employer does not act on the application within 5 working days it is automatically approved, and taking it cannot be used to dismiss you, demote you or mark down your performance rating.',
		act: { number: 72, label: 'Bangsamoro Bereavement Leave Act of 2025' },
	},
	{
		sector: 'Working abroad',
		headline: 'Your employer pays the recruitment costs, not you',
		detail:
			'The visa, the airfare, the processing and the welfare membership are the employer’s to carry. Your basic monthly salary cannot be lower than the host country’s minimum wage or Metro Manila’s, whichever is higher.',
		act: { number: 19, label: 'Overseas Bangsamoro Workers Act of 2020' },
	},
	{
		sector: 'Education',
		headline: 'A science high school place costs nothing',
		detail:
			'Qualified Bangsamoro learners attend free of charge, with scholarships, stipends and allowances, on a curriculum built to Philippine Science High School standards.',
		act: { number: 40, label: 'Bangsamoro Science High School System Act of 2023' },
	},
	{
		sector: 'Health',
		headline: '16 separate laws have built or upgraded a hospital',
		detail:
			'Since 2022, one act at a time, from a municipal infirmary in Sibutu to the 350-bed Level III teaching hospital in Maguindanao — the highest classification the region has.',
		act: { number: 74, label: 'Bangsamoro Regional Hospital and Medical Center Act of 2025' },
	},
	{
		sector: 'Women',
		headline: '5% of every ministry’s budget is committed to women',
		detail:
			'A floor, not a target: each ministry, office and agency must run a Gender and Development Plan worth at least 5% of its budget, and file both the plan and what it achieved with the Bangsamoro Women Commission.',
		act: { number: 85, label: 'General Appropriations Act of the Bangsamoro, FY 2026' },
	},
	{
		sector: 'Youth',
		headline: 'Youth means 15 to 40 here',
		detail:
			'Wider than almost anywhere else, which decides who qualifies for youth programmes and scholarships. The commission that runs them seats a commissioner in every province.',
		act: { number: 10, label: 'Bangsamoro Youth Commission Act of 2020' },
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
								<span className='label'>{fact.sector}</span>
								<p className='item-title mt-3 text-[var(--ink)]'>{fact.headline}</p>
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
