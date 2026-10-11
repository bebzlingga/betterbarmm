import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { LguMasthead } from '../_components/lgu-parts'

export const metadata: Metadata = {
	title: 'Ordinances — Local government directory',
	description:
		'The ordinances BARMM provinces, cities, municipalities and barangays pass: what they are, how one becomes law, and where they should be published. A searchable collection is coming soon.',
}

/* ============================================================
   Ordinances, before the collection exists

   What an ordinance is and how one becomes law under the
   Bangsamoro Local Governance Code, every step cited, so the page
   is useful now and says plainly what is coming.
   ============================================================ */

const STEPS = [
	{
		step: 'Passed',
		what: 'The council votes it through: the Sangguniang Panlalawigan, Panlungsod, Bayan or Barangay.',
		cite: 'Code s. 56',
	},
	{
		step: 'Signed or vetoed',
		what: 'The governor or mayor signs every page or vetoes it in writing, within 15 days in a province and 10 in a city or municipality. Two-thirds of the council can override a veto.',
		cite: 'Code ss. 62, 63',
	},
	{
		step: 'Reviewed',
		what: 'The province reviews a town’s ordinances, and the town a barangay’s, within 30 days. Silence means it stands.',
		cite: 'Code ss. 64, 65',
	},
	{
		step: 'In force',
		what: 'It takes effect 10 days after it is posted at the hall and in at least 2 other public places, unless it says otherwise.',
		cite: 'Code s. 67',
	},
]

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const CITE = 'mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'

export default function OrdinancesPage() {
	return (
		<>
			<LguMasthead
				kicker='Coming soon'
				name='Ordinances'
				noteBeside
				noteEnd
				note='The local laws your province, city, municipality and barangay pass. We are gathering them into one place you can search. Until then, here is how they work.'
			/>

			<div className='bb-container bb-section '>
				<section>
					<h2 className={H2}>What an ordinance is</h2>
					<div className='mt-5 max-w-[48rem] space-y-4 text-[15px] leading-7 text-[var(--ink-2)]'>
						<p>
							An ordinance is a local law. Each level of local government has a council that makes them: the
							Sangguniang Panlalawigan for a province, the Sangguniang Panlungsod for a city, the Sangguniang Bayan
							for a municipality and the Sangguniang Barangay for a barangay (s. 56). The vice-governor, the
							vice-mayor or the punong barangay presides, and votes only to break a tie (s. 57).
						</p>
						<p>
							Ordinances set the unit&rsquo;s budget for the year, the local taxes, fees and charges it collects, and
							the rules people and businesses in the area must follow, from market and traffic rules to the uses
							land may be put to. Breaking one can carry a fine and even jail: for a tax ordinance, a fine of up to
							₱1,200,000 and up to 6 months&rsquo; imprisonment set by a province, city or municipality, and up to
							₱10,000 set by a barangay (s. 576).
						</p>
						<p>
							A council&rsquo;s power has limits. A governor or mayor may veto an ordinance only if it goes beyond
							the council&rsquo;s powers or harms the public welfare (s. 63), and the province can strike down a
							town&rsquo;s ordinance for exceeding its powers (s. 64). A tax ordinance can be appealed to the
							Secretary of Justice within 30 days of taking effect, and then to the courts (s. 212). Every
							ordinance must also be made available in the language most people in the area understand (s. 67).
						</p>
					</div>
				</section>

				<section className='mt-20'>
					<h2 className={H2}>How one becomes law</h2>
					<ol className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
						{STEPS.map((s, i) => (
							<li key={s.step} className='bg-[var(--paper-2)] p-6'>
								<p className='num font-mono text-[11px] font-semibold text-[var(--brass)]'>{String(i + 1).padStart(2, '0')}</p>
								<h3 className='mt-2 text-[16px] font-extrabold tracking-[-0.01em] text-[var(--ink)]'>{s.step}</h3>
								<p className='mt-3 text-[14px] leading-6 text-[var(--ink-2)]'>{s.what}</p>
								<p className={CITE}>{s.cite}</p>
							</li>
						))}
					</ol>
				</section>


				<section className='mt-20 flex flex-col gap-6 bg-[var(--paper-2)] p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12'>
					<div className='max-w-[44rem]'>
						<h2 className='text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>Have an ordinance?</h2>
						<p className='mt-3 text-[15px] leading-7 text-[var(--ink-2)]'>
							If you have a copy of an ordinance from your town or province, a council secretary&rsquo;s file, a
							posted notice or a link, send it to us and it will be among the first we publish.
						</p>
					</div>
					<div className='flex shrink-0 flex-wrap gap-3'>
						<a href='https://betterbarmm.com/contribute' target='_blank' rel='noreferrer' className='bb-btn bb-btn-accent'>
							Contribute an ordinance
							<ArrowUpRightIcon size={14} aria-hidden='true' />
						</a>
						<Link href='/officials' className='bb-btn bb-btn-ghost'>
							See your council
						</Link>
					</div>
				</section>
			</div>
		</>
	)
}
