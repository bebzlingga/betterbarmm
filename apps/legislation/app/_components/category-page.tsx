import { DownloadSimpleIcon } from '@phosphor-icons/react/ssr'
import type { CategorySlug } from '../_lib/categories'
import { getDataset } from '../_lib/legislation-data'
import { AwaitingData } from './awaiting-data'
import { RecordBrowser } from './record-browser'
import { RegistryBand } from './registry-band'

/** The lists Parliament publishes an index of, and so can be downloaded whole. */
const DOWNLOADABLE = new Set<CategorySlug>(['acts', 'bills', 'resolutions', 'adopted-resolutions', 'proposed-resolutions'])

export function CategoryPage({ slug }: { slug: CategorySlug }) {
	const dataset = getDataset(slug)
	const { category, metadata } = dataset

	const isLive = dataset.records.length > 0

	return (
		<>
			<RegistryBand
				label={isLive ? category.blurb.replace(/\.$/, '') : `${category.officialLabel} — awaiting capture`}
				title={category.label}
				lead={
					<>
						{isLive ? <span className='font-semibold text-[var(--ink)]'>{metadata.recordCount.toLocaleString()} {category.label.toLowerCase()}. </span> : null}
						{category.description}
					</>
				}
			/>

			{isLive ? (
				<>
					<RecordBrowser dataset={dataset} />
					{DOWNLOADABLE.has(slug) ? (
						<div className='bb-container pb-20'>
							<p className='flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--dv-r)] bg-[var(--paper-2)] px-5 py-4 text-[0.875rem] text-[var(--ink-3)] sm:px-6'>
								<a href={`/csv/${slug}`} className='dv-pill !bg-[var(--paper)] !text-[0.8125rem] font-semibold' download>
									<DownloadSimpleIcon size={15} weight='duotone' aria-hidden='true' className='text-[var(--accent)]' />
									Download Parliament&rsquo;s full list as CSV
								</a>
								<span>Number, title, status, authors and history of each.</span>
							</p>
						</div>
					) : null}
				</>
			) : (
				<AwaitingData category={category} gaps={metadata.knownGaps} />
			)}
		</>
	)
}
