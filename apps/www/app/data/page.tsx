import {
	AddressBookIcon,
	ArrowRightIcon,
	BracketsCurlyIcon,
	CheckSquareOffsetIcon,
	ClipboardTextIcon,
	CoinsIcon,
	DatabaseIcon,
	DiamondsFourIcon,
	FileCsvIcon,
	HandshakeIcon,
	NewspaperIcon,
	ScalesIcon,
	ScrollIcon,
	ShoppingCartIcon,
	SirenIcon,
	TableIcon,
	UmbrellaIcon,
	BuildingsIcon,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
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

/** Each dataset's glyph and colour (user decision: the cards less plain), the colours the estate's own. */
const LOOK: Record<string, { Icon: Icon; hue: string }> = {
	legislation: { Icon: ScrollIcon, hue: '#8a2418' },
	election: { Icon: CheckSquareOffsetIcon, hue: '#6b3fa0' },
	budget: { Icon: CoinsIcon, hue: '#b7791f' },
	'local-government': { Icon: BuildingsIcon, hue: '#2f6b6b' },
	procurement: { Icon: ShoppingCartIcon, hue: '#2f4f6f' },
	services: { Icon: HandshakeIcon, hue: '#3f6b4f' },
	directory: { Icon: AddressBookIcon, hue: '#6b4f2f' },
	incidents: { Icon: SirenIcon, hue: '#b23a2e' },
	preparedness: { Icon: UmbrellaIcon, hue: '#2f5f8f' },
	audits: { Icon: ClipboardTextIcon, hue: '#5f5f2f' },
	crafts: { Icon: DiamondsFourIcon, hue: '#9a4f8a' },
	news: { Icon: NewspaperIcon, hue: '#4f4f6b' },
}

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

			<section className='bb-container dv-section'>
				<div>
					<ul className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
						{datasets.map((d) => {
							const { Icon, hue } = LOOK[d.slug] ?? { Icon: DatabaseIcon, hue: '#5c574c' }
							const rows = rowsIn(d)
							return (
								<li
									key={d.slug}
									className='group relative flex flex-col overflow-hidden rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_24px_48px_-30px_rgba(0,0,0,0.5)]'
								>
									{/* The head: the dataset's own colour washed across, its glyph, and how much is in it. */}
									<div
										className='flex items-start justify-between gap-4 px-6 pb-5 pt-6 sm:px-7 sm:pt-7'
										style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${hue} 16%, var(--paper)) 0%, var(--paper) 75%)` }}
									>
										<span className='grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-[0_12px_24px_-14px_rgba(0,0,0,0.6)]' style={{ background: hue }}>
											<Icon size={24} weight='duotone' aria-hidden='true' />
										</span>
										<span className='text-right'>
											<span className='num block font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
												{rows.toLocaleString('en-PH')}
											</span>
											<span className='mt-1 block font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
												rows · {d.tables.length} {d.tables.length === 1 ? 'table' : 'tables'}
											</span>
										</span>
									</div>

									<div className='flex flex-1 flex-col px-6 pb-6 pt-5 sm:px-7 sm:pb-7 sm:pt-6'>
										<h2 className='font-[family-name:var(--font-display)] text-[1.375rem] font-bold leading-tight tracking-[-0.025em] text-[var(--ink)]'>
											<Link href={`/data/${d.slug}`} className='after:absolute after:inset-0 after:content-[""] group-hover:text-[var(--accent)]'>
												{d.title}
											</Link>
										</h2>
										<p className='mt-2.5 text-[0.875rem] leading-[1.6] text-[var(--ink-2)]'>{d.summary}</p>

										{/* Its tables, each with its count. */}
										<ul className='mt-5 divide-y divide-[var(--rule-soft)] rounded-2xl bg-[color-mix(in_srgb,var(--paper-2)_60%,var(--paper))] px-4'>
											{d.tables.map((t) => (
												<li key={t.slug} className='flex items-center justify-between gap-3 py-2.5 text-[0.8125rem]'>
													<span className='flex min-w-0 items-center gap-2 text-[var(--ink)]'>
														<TableIcon size={14} weight='duotone' className='shrink-0' style={{ color: hue }} aria-hidden='true' />
														<span className='truncate'>{t.title}</span>
													</span>
													<span className='num shrink-0 text-[var(--ink-3)]'>{t.rowCount.toLocaleString('en-PH')}</span>
												</li>
											))}
										</ul>

										<div className='mt-auto flex items-end justify-between gap-4 pt-6'>
											<div className='flex flex-wrap gap-1.5'>
												<span className='rounded-full bg-[color-mix(in_srgb,var(--paper-2)_70%,var(--paper))] px-2.5 py-1 text-[0.6875rem] font-semibold text-[var(--ink-2)]'>{d.coverage}</span>
												<span className='rounded-full bg-[color-mix(in_srgb,#2f6b4f_12%,transparent)] px-2.5 py-1 text-[0.6875rem] font-semibold text-[#2f6b4f] dark:text-[#7fc9a1]'>{d.licence}</span>
											</div>
											<span className='grid size-10 shrink-0 place-items-center rounded-full border border-[var(--rule)] text-[var(--ink)] transition group-hover:border-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)]'>
												<ArrowRightIcon size={16} weight='bold' aria-hidden='true' />
											</span>
										</div>
									</div>
								</li>
							)
						})}
					</ul>
				</div>
			</section>

			<section className='tv-wash'>
				<div className='bb-container dv-section'>
					<p className='eyebrow'>How to use it</p>
					<h2 className='section-title mt-4 max-w-3xl'>Two files for every table, and one rule.</h2>
					<div className='mt-10 grid gap-4 md:grid-cols-3'>
						{uses.map(({ Icon, title, detail }) => (
							<div key={title} className='flex items-start gap-4 rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-6'>
								<span className='grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]'>
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
