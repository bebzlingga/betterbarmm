import { ArrowSquareOutIcon, BracketsCurlyIcon, DownloadSimpleIcon, FileCsvIcon } from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GetInvolved } from '../../_components/get-involved'
import { Masthead } from '../../_components/masthead'
import { SiteHeader } from '../../_components/site-header'
import { datasetBySlug, datasets, fileSize, licenceAnchor, rowsIn, type Table } from '../../_lib/open-data'
import { pageMeta } from '../../_lib/seo'

export function generateStaticParams() {
	return datasets.map((d) => ({ dataset: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ dataset: string }> }): Promise<Metadata> {
	const { dataset } = await params
	const d = datasetBySlug(dataset)
	if (!d) return {}
	return pageMeta({ title: `${d.title} · Open data`, description: d.summary, path: `/data/${d.slug}` })
}

const LINK = 'underline decoration-[var(--rule)] underline-offset-4 transition hover:decoration-[var(--accent)]'

/** A sample cell as it reads in the file, cut short so a long title does not stretch the table. */
const cell = (value: unknown) => {
	if (value == null || value === '') return '—'
	const s = typeof value === 'number' ? value.toLocaleString('en-PH', { maximumFractionDigits: 4 }) : String(value)
	return s.length > 60 ? `${s.slice(0, 58)}…` : s
}

function Download({ table }: { table: Table }) {
	const file = 'inline-flex items-center gap-2 border border-[var(--ink)] px-4 py-2.5 text-[0.84375rem] font-semibold text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]'
	return (
		<div className='flex flex-wrap gap-2'>
			<a href={table.files.csv.href} download className={file}>
				<FileCsvIcon size={18} aria-hidden='true' />
				CSV <span className='font-normal opacity-70'>{fileSize(table.files.csv.bytes)}</span>
				<DownloadSimpleIcon size={14} weight='bold' aria-hidden='true' />
			</a>
			<a href={table.files.json.href} download className={file}>
				<BracketsCurlyIcon size={18} aria-hidden='true' />
				JSON <span className='font-normal opacity-70'>{fileSize(table.files.json.bytes)}</span>
				<DownloadSimpleIcon size={14} weight='bold' aria-hidden='true' />
			</a>
		</div>
	)
}

export default async function DatasetPage({ params }: { params: Promise<{ dataset: string }> }) {
	const { dataset } = await params
	const d = datasetBySlug(dataset)
	if (!d) notFound()

	const facts = [
		{ label: 'Source', value: <a href={d.source.href} target='_blank' rel='noreferrer' className={LINK}>{d.source.label}</a> },
		{ label: 'Licence', value: <><Link href={licenceAnchor(d.licence)} className={LINK}>{d.licence}</Link>{d.licenceNote ? <span className='mt-1 block text-[var(--ink-3)]'>{d.licenceNote}</span> : null}</> },
		{ label: 'Covers', value: d.coverage },
		{ label: 'Read it as pages', value: <a href={d.workspace} className={`inline-flex items-center gap-1 ${LINK}`}>{d.workspace.replace('https://', '')} <ArrowSquareOutIcon size={13} aria-hidden='true' /></a> },
	]

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='data' />
			<Masthead
				brand
				label={`Open data · ${d.tables.length} ${d.tables.length === 1 ? 'table' : 'tables'} · ${rowsIn(d).toLocaleString('en-PH')} rows`}
				lines={[d.title]}
				standfirst={d.summary}
			/>

			<nav aria-label='Breadcrumb' className='bb-container pt-8 text-[0.8125rem] text-[var(--ink-3)]'>
				<Link href='/data' className={LINK}>
					Open data
				</Link>{' '}
				/ {d.title}
			</nav>

			<section className='bb-container bb-section'>
				<div className='grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16'>
					<dl className='grid gap-5'>
						{facts.map((f) => (
							<div key={f.label} className='border-t border-[var(--rule-soft)] pt-4'>
								<dt className='label'>{f.label}</dt>
								<dd className='mt-1.5 bb-body text-[var(--ink-2)]'>{f.value}</dd>
							</div>
						))}
					</dl>
					{d.caveats.length ? (
						<div className='self-start border-l-2 border-[var(--accent)] bg-[var(--paper-2)] px-6 py-5 sm:px-8 sm:py-6'>
							<p className='eyebrow'>Before you use it</p>
							<ul className='mt-3 space-y-3'>
								{d.caveats.map((c) => (
									<li key={c} className='bb-body text-[var(--ink-2)]'>{c}</li>
								))}
							</ul>
						</div>
					) : null}
				</div>
			</section>

			{d.tables.map((t) => (
				<section key={t.slug} id={t.slug} className='bb-container scroll-mt-[calc(var(--site-header-h)+1rem)] border-t border-[var(--rule)] py-[clamp(3rem,6vw,5rem)]'>
					<div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
						<div>
							<h2 className='section-title'>
								{t.title} <span className='text-[var(--ink-mute)]'>· {t.rowCount.toLocaleString('en-PH')} rows</span>
							</h2>
							<p className='mt-3 max-w-2xl bb-body text-[var(--ink-2)]'>{t.description}</p>
						</div>
						<Download table={t} />
					</div>

					{/* Every column, said plainly: a table nobody can read the header of is not open data. */}
					<div className='mt-8 overflow-x-auto'>
						<table className='w-full min-w-[36rem] border-collapse text-left'>
							<thead>
								<tr className='border-b border-[var(--ink)]'>
									<th className='label py-2 pr-6 font-semibold'>Column</th>
									<th className='label py-2 pr-6 font-semibold'>Kind</th>
									<th className='label py-2 font-semibold'>What it holds</th>
								</tr>
							</thead>
							<tbody>
								{t.columns.map((c) => (
									<tr key={c.name} className='border-b border-[var(--rule-soft)] align-top'>
										<td className='py-2.5 pr-6 font-mono text-[0.8125rem] text-[var(--ink)]'>{c.name}</td>
										<td className='py-2.5 pr-6 text-[0.8125rem] text-[var(--ink-3)]'>{c.type}</td>
										<td className='py-2.5 text-[0.875rem] leading-6 text-[var(--ink-2)]'>{c.description}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<p className='label mt-10'>The first {Math.min(5, t.rowCount)} rows</p>
					<div className='mt-3 overflow-x-auto border border-[var(--rule)]'>
						<table className='border-collapse text-left'>
							<thead className='bg-[var(--paper-2)]'>
								<tr>
									{t.columns.map((c) => (
										<th key={c.name} className='whitespace-nowrap border-b border-[var(--rule)] px-3 py-2 font-mono text-[0.75rem] font-semibold text-[var(--ink)]'>
											{c.name}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{t.sample.map((row, i) => (
									<tr key={i} className='border-b border-[var(--rule-soft)] last:border-0'>
										{t.columns.map((c) => (
											<td key={c.name} className='whitespace-nowrap px-3 py-2 text-[0.8125rem] text-[var(--ink-2)]'>
												{cell(row[c.name])}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			))}

			<GetInvolved />
		</main>
	)
}
