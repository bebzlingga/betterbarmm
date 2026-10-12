import type { Metadata } from 'next'
import Link from 'next/link'
import { PesoTable } from '../_components/peso-table'
import { Masthead } from '../_components/parts'
import { pesoRows, pesoYears } from '../_lib/peso'

export const metadata: Metadata = {
	title: 'Follow the peso',
	description:
		'Each Bangsamoro ministry and office: what the budget gave it to buy with, what it put out to bid on PhilGEPS, and what PhilGEPS records as awarded.',
}

const P = 'mt-4 max-w-[46rem] text-[15px] leading-7 text-[var(--ink-2)]'

export default function FollowThePesoPage() {
	return (
		<>
			<Masthead
				kicker='Procurement · Budget'
				name='Follow the peso'
				note='Each regional office three ways: what the Bangsamoro budget gave it to buy goods, services and works with, what it then put out to bid, and what PhilGEPS records it awarded.'
			/>
			<section className='bb-container bb-section'>
				<PesoTable rows={pesoRows} years={pesoYears} />

				<div className='mt-14 border-t border-[var(--rule)] pt-10'>
					<h2 className='text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Reading it</h2>
					<p className={P}>
						<strong>Budget to buy with</strong> is the office&rsquo;s maintenance and other operating expenses plus its
						capital outlay in that year&rsquo;s General Appropriations Act. Salaries are left out: they are not bought
						through bidding. <strong>Put out to bid</strong> is the approved budget of every notice its offices posted that
						year; <strong>awarded</strong> is the contracts PhilGEPS records on them.
					</p>
					<p className={P}>
						The three will not line up, and the gaps are not by themselves a problem:
					</p>
					<ul className={`${P} list-disc space-y-2 pl-5`}>
						<li>
							An office may bid out more than its own budget when it also carries out projects paid from special funds,
							as the Ministry of Public Works does for the infrastructure fund, or the Ministry of the Interior and Local
							Government for its local governance fund.
						</li>
						<li>A failed bidding posted again counts again, so a project re-bid twice is counted three times.</li>
						<li>Money appropriated in one year may be bid out the next; appropriations stay valid into the following year.</li>
						<li>
							Awards are only those PhilGEPS publishes by office, which leaves out most awards on its newer system. A
							small &ldquo;awarded&rdquo; figure is usually a gap in the record, not money unspent.
						</li>
						<li>Small purchases below the posting threshold never reach PhilGEPS at all.</li>
					</ul>
					<p className={P}>
						Offices are matched by name: a ministry&rsquo;s district and provincial offices on PhilGEPS all count toward
						it. The budget figures are the Acts&rsquo; own, from the{' '}
						<a href='https://budget.betterbarmm.com' className='rule-link'>
							Budget workspace
						</a>
						; the notices are PhilGEPS&rsquo;, as everywhere here. See{' '}
						<Link href='/sources' className='rule-link'>
							Sources
						</Link>
						.
					</p>
				</div>
			</section>
		</>
	)
}
