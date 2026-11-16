import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { ordinanceCategories, ordinanceMeta, ordinances } from '@betterbarmm/lgu-data/ordinances'
import { LguFigures, LguMasthead, SectionTitle } from '../_components/lgu-parts'
import { OrdinanceLibrary, type LibraryItem } from './library'

export const metadata: Metadata = {
	title: 'Ordinances — Local government directory',
	description:
		'A reference library of ordinances other Philippine provinces, cities and towns have enacted, in full and by category, for BARMM councils drafting their own, each one copyable as a starting draft. With how an ordinance becomes law under the Bangsamoro Local Governance Code.',
}

/* ============================================================
   Ordinances

   BARMM's own LGUs publish almost none of theirs, so the library
   is the other direction: ordinances enacted elsewhere in the
   country, in full, sorted by what they are about, for a council
   to read before it drafts. Under it, what an ordinance is and how
   one becomes law under the Bangsamoro Local Governance Code.
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

const H2 = 'text-[1.625rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'
const CITE = 'mt-2 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-[var(--ink-mute)]'

export default function OrdinancesPage() {
	const items: LibraryItem[] = ordinances.map((o) => ({
		id: o.id,
		category: o.category,
		shortTitle: o.shortTitle,
		lgu: o.lgu,
		province: o.province,
		level: o.level,
		region: o.region,
		year: o.year,
		summary: o.summary,
		pages: o.pages,
		verdict: o.barmm?.verdict ?? null,
		words: [o.shortTitle, o.title, o.lgu, o.province, o.region, o.number, o.year, o.category, o.summary, ...o.points, o.barmm?.verdict, o.barmm?.fits].join(' ').toLowerCase(),
	}))
	const lgus = new Set(ordinances.map((o) => o.lgu)).size
	const regions = new Set(ordinances.map((o) => o.region)).size
	const ready = ordinances.filter((o) => o.barmm?.verdict === 'Ready to adapt').length

	return (
		<>
			<LguMasthead
				kicker='A reference library'
				name='Ordinances'
				note='Ordinances other provinces, cities and towns have enacted, sorted by topic, for a BARMM council to read before drafting its own. Each one says what can be carried over and what has to change under the Bangsamoro Local Governance Code.'
			>
				<LguFigures
					figures={[
						{ label: 'Ordinances', value: '', count: ordinances.length },
						{ label: 'Topics', value: '', count: ordinanceCategories.length },
						{ label: 'From', value: '', count: lgus, detail: `LGUs in ${regions} regions` },
						{ label: 'Ready to adapt', value: '', count: ready, detail: 'Usable in BARMM almost as drafted' },
					]}
				/>
			</LguMasthead>

			<section className='bb-container bb-section'>
				<OrdinanceLibrary items={items} categories={ordinanceCategories.map(({ name, slug, about }) => ({ name, slug, about }))} />
				<p className='mt-12 border-t border-[var(--rule-soft)] pt-5 text-[0.75rem] leading-6 text-[var(--ink-3)]'>{ordinanceMeta.note}</p>
			</section>

			<div className='bb-container bb-section-bottom'>
				<SectionTitle title='How ordinances work in BARMM' lead='Under the Bangsamoro Local Governance Code, every step cited.' />
				<section className='mt-10'>
					<h2 className={H2}>What an ordinance is</h2>
					<div className='mt-5 gap-20 text-[0.9375rem] leading-7 text-[var(--ink-2)] lg:columns-2 [&>p+p]:mt-4'>
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
							<li key={s.step} className='border border-[var(--rule)] bg-[var(--paper)] p-6'>
								<p className='num grid size-9 place-items-center bg-[var(--accent)] text-[0.8125rem] font-black text-white'>{i + 1}</p>
								<h3 className='mt-4 text-[1rem] font-extrabold tracking-[-0.01em] text-[var(--ink)]'>{s.step}</h3>
								<p className='mt-3 text-[0.875rem] leading-6 text-[var(--ink-2)]'>{s.what}</p>
								<p className={CITE}>{s.cite}</p>
							</li>
						))}
					</ol>
				</section>


				<section className='mt-20 flex flex-col gap-6 border border-[var(--rule)] bg-[var(--paper-2)] p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12'>
					<div className='max-w-[44rem]'>
						<h2 className='text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>Have one of BARMM&rsquo;s?</h2>
						<p className='mt-3 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
							The library holds ordinances from outside the region because BARMM&rsquo;s councils publish almost none of
							theirs. If you have a copy of one from your town or province, a council secretary&rsquo;s file, a posted
							notice or a link, send it and it will be among the first of the region&rsquo;s own we add.
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
