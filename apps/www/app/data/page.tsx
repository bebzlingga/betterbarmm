import { ArrowRightIcon, BracketsCurlyIcon, FileCsvIcon, ScalesIcon } from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { GetInvolved } from '../_components/get-involved'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { catalogue, datasets, longDate, rowsIn } from '../_lib/open-data'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Open data',
	description:
		'The records behind BetterBARMM as tables anyone can download: laws, budgets, elections, local governments, procurement, services and more, each with its source and every column described.',
	path: '/data',
})

const tableCount = datasets.reduce((n, d) => n + d.tables.length, 0)
const rowCount = datasets.reduce((n, d) => n + rowsIn(d), 0)

/** How to use what is here, in three lines. */
const uses = [
	{ Icon: FileCsvIcon, title: 'CSV for a spreadsheet', detail: 'Opens in Excel, Google Sheets or LibreOffice as it is, accents and peso signs intact.' },
	{ Icon: BracketsCurlyIcon, title: 'JSON for code', detail: 'The same rows, with the source, the licence and every column’s meaning in the file itself.' },
	{ Icon: ScalesIcon, title: 'Free to reuse', detail: 'Copy it, change it, publish it, even commercially. Say it came from BetterBARMM.' },
]

export default function CataloguePage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='data' />
			<Masthead
				brand
				label='Open data'
				lines={['Every record,', 'yours to use.']}
				muted={[1]}
				standfirst={`The ${datasets.length} datasets behind BetterBARMM as ${tableCount} tables, ${rowCount.toLocaleString('en-PH')} rows in all. Each comes with its source, what it can and cannot tell you, and every column described. Built ${longDate(catalogue.generatedAt)}.`}
			/>

			<section className='bb-container bb-section'>
				<div className='overflow-hidden border-t border-[var(--rule)]'>
					<ul className='-ml-px -mt-px grid sm:grid-cols-2 lg:grid-cols-3'>
						{datasets.map((d) => (
							<li key={d.slug} className='relative flex flex-col border-l border-t border-[var(--rule)] py-6 transition hover:bg-[var(--paper-2)] sm:p-8'>
								<h2 className='text-[1.35rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
									<Link href={`/data/${d.slug}`} className='after:absolute after:inset-0 after:content-[""]'>
										{d.title}
									</Link>
								</h2>
								<p className='mt-3 bb-body text-[var(--ink-2)]'>{d.summary}</p>
								<ul className='mt-4 space-y-1'>
									{d.tables.map((t) => (
										<li key={t.slug} className='meta'>
											{t.title} <span className='text-[var(--ink-mute)]'>· {t.rowCount.toLocaleString('en-PH')} rows</span>
										</li>
									))}
								</ul>
								<div className='mt-auto flex flex-wrap items-center gap-1.5 pt-5'>
									<span className='badge badge-plain badge-idle'>{d.coverage}</span>
									<span className='badge badge-plain badge-done'>{d.licence}</span>
								</div>
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className='border-t border-[var(--rule)] bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<p className='eyebrow'>How to use it</p>
					<h2 className='section-title mt-4 max-w-3xl'>Two files for every table, and one rule.</h2>
					<div className='mt-10 grid gap-4 md:grid-cols-3'>
						{uses.map(({ Icon, title, detail }) => (
							<div key={title} className='flex gap-4 border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-6'>
								<span className='grid size-11 shrink-0 place-items-center bg-[var(--accent-soft)] text-[var(--accent)]'>
									<Icon size={22} weight='duotone' aria-hidden='true' />
								</span>
								<div>
									<p className='item-title font-title'>{title}</p>
									<p className='mt-1 bb-body text-[var(--ink-2)]'>{detail}</p>
								</div>
							</div>
						))}
					</div>
					<p className='mt-8 max-w-3xl bb-body text-[var(--ink-2)]'>
						Credit it as <strong className='text-[var(--ink)]'>“BetterBARMM, betterbarmm.com/data”</strong> and name the dataset.
						Most tables are under CC BY 4.0; two follow their sources’ terms instead.{' '}
						<Link href='/data/licence' className='inline-flex items-center gap-1 font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
							The licence in full <ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
						</Link>
					</p>
				</div>
			</section>

			<GetInvolved />
		</main>
	)
}
