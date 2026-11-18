import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon, ArrowUpRightIcon, CheckCircleIcon, GavelIcon, PencilSimpleIcon, PushPinIcon, ScalesIcon, ScrollIcon } from '@phosphor-icons/react/ssr'
import { ordinanceCategories, ordinanceMeta, ordinances } from '@betterbarmm/lgu-data/ordinances'
import { LguMasthead, SectionTitle } from '../_components/lgu-parts'
import { OrdinanceLibrary, type LibraryItem } from './library'

export const metadata: Metadata = {
	title: 'Ordinances — Local government directory',
	description:
		'A reference library of ordinances other Philippine provinces, cities and municipalities have enacted, in full and by category, for BARMM councils drafting their own, each with what a council would need to replicate it. With how an ordinance becomes law under the Bangsamoro Local Governance Code.',
}

/* ============================================================
   Ordinances

   BARMM's own LGUs publish almost none of theirs, so the library
   is the other direction: ordinances enacted elsewhere in the
   country, in full, sorted by what they are about, for a council
   to read before it drafts. Under it, what an ordinance is and how
   one becomes law under the Bangsamoro Local Governance Code.
   ============================================================ */

/** What a reader needs first, in three cards. */
const BASICS = [
	{ Icon: ScrollIcon, label: 'What it is', title: 'A local law', text: 'A law a province, city, municipality or barangay makes for its own area. Its council, the sanggunian, passes it.', cite: 's. 56' },
	{ Icon: CheckCircleIcon, label: 'Who checks it', title: 'The level above', text: 'The province checks a municipality’s ordinances, and the municipality a barangay’s. If it raises nothing in 30 days, the ordinance stands.', cite: 'ss. 64, 65' },
	{ Icon: ScalesIcon, label: 'Its limit', title: '₱5,000 or 6 months', text: 'The most a municipal ordinance can set for breaking it. Tax ordinances have a range of their own.', cite: 's. 489' },
]

/** From the vote to force, one line each, with the clock on each step. */
const STEPS = [
	{ Icon: GavelIcon, step: 'Passed', when: 'In session', what: 'The council votes for it.', cite: 's. 56' },
	{ Icon: PencilSimpleIcon, step: 'Signed', when: 'Within 10 days', what: 'The mayor signs it, or vetoes it in writing.', cite: 's. 62' },
	{ Icon: CheckCircleIcon, step: 'Checked', when: 'Within 30 days', what: 'The province reviews it. Silence means it stands.', cite: 's. 64' },
	{ Icon: PushPinIcon, step: 'In force', when: '10 days after posting', what: 'It is posted at the hall and 2 other public places.', cite: 's. 67' },
]

const H2 = 'text-[1.375rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'
const LABEL = 'font-mono text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-mute)]'
const CITE = 'font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'

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
		highlights: o.highlights ?? [],
		verdict: o.barmm?.verdict ?? null,
		words: [o.shortTitle, o.title, o.lgu, o.province, o.region, o.number, o.year, o.category, o.summary, ...o.points, o.barmm?.verdict, o.barmm?.fits].join(' ').toLowerCase(),
	}))

	return (
		<>
			<LguMasthead
				kicker='A reference library'
				name='Ordinances'
				note='Ordinances other provinces, cities and municipalities have enacted, sorted by topic, for a BARMM council to read before drafting its own. Each one gives its highlights, what your LGU would need to replicate it, and what has to change under the Bangsamoro Local Governance Code.'
			/>

			<section className='bb-container bb-section'>
				<OrdinanceLibrary items={items} categories={ordinanceCategories.map(({ name, slug, about }) => ({ name, slug, about }))} />
				<p className='mt-12 border-t border-[var(--rule-soft)] pt-5 text-[0.75rem] leading-6 text-[var(--ink-3)]'>{ordinanceMeta.note}</p>
			</section>

			{/* ---- How ordinances work, kept to the basics: what one is, who checks it, its limit, and the 4 steps to law ---- */}
			<section className='border-t border-[var(--rule)] bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<SectionTitle title='How ordinances work in BARMM' lead='The basics, under the Bangsamoro Local Governance Code.' />

					<div className='mt-10 grid gap-4 md:grid-cols-3'>
						{BASICS.map(({ Icon, ...b }) => (
							<article key={b.label} className='flex flex-col border border-[var(--rule)] bg-[var(--paper)] p-6 lg:p-7'>
								<span className='grid size-11 place-items-center bg-[var(--accent)] text-white'>
									<Icon size={22} aria-hidden='true' />
								</span>
								<p className={`mt-6 ${LABEL}`}>{b.label}</p>
								<h3 className='mt-1.5 text-[1.375rem] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)]'>{b.title}</h3>
								<p className='mt-3 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{b.text}</p>
								<p className={`mt-auto pt-5 ${CITE}`}>Code {b.cite}</p>
							</article>
						))}
					</div>

					{/* ---- From vote to law: one panel, four steps joined by arrows, each with its clock ---- */}
					<div className='mt-12 border border-[var(--rule)] bg-[var(--paper)]'>
						<div className='flex flex-col gap-1 border-b border-[var(--rule)] px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between lg:px-7'>
							<h3 className={H2}>From vote to law</h3>
							<p className='text-[0.8125rem] text-[var(--ink-3)]'>For a municipal ordinance. A governor has 15 days to sign.</p>
						</div>
						<ol className='grid md:grid-cols-4'>
							{STEPS.map(({ Icon, ...s }, i) => (
								<li key={s.step} className={`relative p-6 lg:p-7 ${i ? 'border-t border-[var(--rule)] md:border-l md:border-t-0' : ''}`}>
									{i ? (
										<span aria-hidden='true' className='absolute -left-3.5 top-1/2 hidden size-7 -translate-y-1/2 place-items-center rounded-full border border-[var(--rule)] bg-[var(--paper)] text-[var(--accent)] md:grid'>
											<ArrowRightIcon size={13} weight='bold' />
										</span>
									) : null}
									<div className='flex items-center gap-3'>
										<Icon size={22} aria-hidden='true' className='text-[var(--accent)]' />
										<span className='font-mono text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[var(--brass)]'>Step {i + 1}</span>
									</div>
									<h4 className='mt-4 text-[1.125rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>{s.step}</h4>
									<p className='mt-1 inline-block bg-[var(--paper-2)] px-2 py-0.5 text-[0.75rem] font-semibold text-[var(--accent)]'>{s.when}</p>
									<p className='mt-3 text-[0.875rem] leading-6 text-[var(--ink-2)]'>{s.what}</p>
									<p className={`mt-3 ${CITE}`}>Code {s.cite}</p>
								</li>
							))}
						</ol>
					</div>

					{/* ---- Asking for the region's own ---- */}
					<div className='mt-16 grid gap-6 border border-[var(--rule)] bg-[var(--paper)] p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12'>
						<div className='max-w-[46rem]'>
							<p className={LABEL}>Wanted</p>
							<h3 className={`mt-2 ${H2}`}>Have one of BARMM&rsquo;s own ordinances?</h3>
							<p className='mt-3 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
								BARMM&rsquo;s councils publish almost none of theirs, so this library starts outside the region. A copy from your municipality or province, a council secretary&rsquo;s file, a posted notice or a link is enough. What you send will be among the first of the region&rsquo;s own we add.
							</p>
						</div>
						<div className='flex flex-wrap gap-3'>
							<a href='https://betterbarmm.com/contribute' target='_blank' rel='noreferrer' className='bb-btn bb-btn-accent'>
								Contribute an ordinance
								<ArrowUpRightIcon size={14} aria-hidden='true' />
							</a>
							<Link href='/officials' className='bb-btn bb-btn-ghost'>
								See your council
							</Link>
						</div>
					</div>
				</div>
			</section>

		</>
	)
}
