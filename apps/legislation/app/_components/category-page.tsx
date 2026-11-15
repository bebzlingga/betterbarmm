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
						<div className='bb-container pb-16 text-[0.8125rem]'>
							<a href={`/csv/${slug}`} className='rule-link font-semibold text-[var(--ink)]' download>
								Download Parliament&rsquo;s full list as CSV
							</a>
							<span className='text-[var(--ink-3)]'> · number, title, status, authors and history of each</span>
						</div>
					) : null}
				</>
			) : (
				<AwaitingData category={category} gaps={metadata.knownGaps} />
			)}
		</>
	)
}
