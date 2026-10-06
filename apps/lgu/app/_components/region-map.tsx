import { areaHref, barmmBoundaries, lguProvinces } from '@betterbarmm/lgu-data'

const DEPTH = 9

/**
 * The region as a way in: each drawn area is a link to its own page.
 *
 * Server-rendered SVG links, so it costs no JavaScript. The Special
 * Geographic Area has no published outline, so it is never drawn — the list
 * under the map is the way to it.
 */
export function RegionMap({ className = '' }: { className?: string }) {
	const { viewBox, areas, outside, land } = barmmBoundaries

	return (
		<svg viewBox={viewBox} className={`h-auto w-full ${className}`} role='group' aria-label='Map of the Bangsamoro'>
			<g aria-hidden='true'>
				<path d={land} transform={`translate(0 ${DEPTH})`} className='fill-[color-mix(in_srgb,var(--paper-3)_86%,#000)]' />
				{outside.map((area) => (
					<path key={`${area.slug}-side`} d={area.d} transform={`translate(0 ${DEPTH})`} className='fill-[color-mix(in_srgb,var(--paper-3)_86%,#000)]' />
				))}
				<path d={land} className='fill-[var(--paper-3)]' />
				{outside.map((area) => (
					<path key={area.slug} d={area.d} className='fill-[var(--paper-3)]' />
				))}
				{areas.map((area) => (
					<path key={`${area.slug}-side`} d={area.d} transform={`translate(0 ${DEPTH})`} className='fill-[color-mix(in_srgb,var(--accent)_66%,#000)]' />
				))}
			</g>

			{areas.map((area) => {
				const province = lguProvinces.find((one) => one.slug === area.slug)
				if (!province) return null

				return (
					<a key={area.slug} href={areaHref(province)} aria-label={province.name}>
						<title>{province.name}</title>
						<path
							d={area.d}
							strokeWidth={1.4}
							strokeLinejoin='round'
							className='fill-[var(--accent)] stroke-[var(--paper)] transition-[fill] duration-200 [paint-order:stroke] hover:fill-[var(--ink)]'
						/>
					</a>
				)
			})}
		</svg>
	)
}
