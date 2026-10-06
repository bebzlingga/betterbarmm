import Link from 'next/link'
import { townShapes } from '@betterbarmm/travel-data'

/**
 * The area's cities and municipalities, each one a link to its page.
 *
 * Server-drawn: the shapes are PSA's outlines, already projected to path data,
 * so nothing ships to the browser but the SVG. `focus` fills the town a page
 * is about; the rest stay quiet until hovered.
 */
export function TownMap({ area, focus }: { area: string; focus?: string }) {
	const map = townShapes(area)
	if (!map) return null
	const stroke = Number(map.viewBox.split(' ')[2]) * 0.0016

	return (
		<figure>
			<svg viewBox={map.viewBox} className='h-auto w-full' role='img' aria-label='Map of the towns in this area'>
				{map.shapes.map((shape) => (
					<Link key={shape.slug} href={`/${area}/${shape.slug}`} aria-label={shape.name}>
						<path
							d={shape.d}
							strokeWidth={stroke}
							className={`stroke-[var(--paper)] transition-colors duration-200 ${
								shape.slug === focus
									? 'fill-[var(--brass)]'
									: 'fill-[var(--rule)] hover:fill-[var(--brass-line)]'
							}`}
						>
							<title>{shape.name}</title>
						</path>
					</Link>
				))}
			</svg>
			<figcaption className='tv-map-caption'>
				Town outlines from PSA&rsquo;s Philippine Standard Geographic Code, simplified. Not for
				navigation.
			</figcaption>
		</figure>
	)
}
