import { MapTrifoldIcon } from '@phosphor-icons/react/ssr'
import { barmmBoundaries } from '@betterbarmm/lgu-data'
import type { Accident } from '../_lib/accidents'

/* ============================================================
   The way into the map, in the masthead

   The map is a dialog, so the page opens on a door to it: the region's
   own outlines with the incidents on them, a line of words, a button.
   The button is a plain link to `#map`; the dialog listens for the hash
   and opens, so nothing here needs to be a client component or share
   state with the map, and the door works from the masthead's own band.

   The frame is the boundary file's: an equirectangular projection
   settled in datasets/lgu/scripts/build_boundaries.py, which ships no
   constants. These four were fitted once from the towns' centres
   against their own shapes (100 towns, median error 3 frame units of
   1000) — good enough to put a dot on the right island, which is all a
   preview owes. The frame is cropped to the region's body: Mapun and
   the Turtle Islands, 200 km west of the rest, fall outside.
   ============================================================ */

const toX = (lon: number) => 135.12 * lon - 15935.323
const toY = (lat: number) => -133.3897 * lat + 1141.245
const CROP = '170 30 800 510'

function Preview({ incidents }: { incidents: Accident[] }) {
	const { areas, outside, land } = barmmBoundaries
	return (
		<svg viewBox={CROP} className='h-auto w-full' aria-hidden='true'>
			<path d={land} fillRule='nonzero' className='fill-[var(--brass)] opacity-25' />
			{outside.map((area) => (
				<path key={area.slug} d={area.d} fillRule='nonzero' className='fill-[var(--brass)] opacity-25' />
			))}
			{areas.map((area) => (
				<path key={area.slug} d={area.d} fillRule='nonzero' className='fill-[var(--brass)] opacity-90' />
			))}
			{incidents.map((a) => (
				<circle
					key={a.id}
					cx={toX(a.lon)}
					cy={toY(a.lat)}
					r={4 + Math.min(a.deaths ?? 0, 12) * 0.5}
					style={{ fill: `var(--acc-${a.type})` }}
					opacity={a.placed === 'province' ? 0.4 : 0.9}
				/>
			))}
		</svg>
	)
}

export function AccidentOpener({ incidents }: { incidents: Accident[] }) {
	return (
		<div className='grid w-full gap-8 md:grid-cols-[18rem_minmax(0,1fr)_auto] md:items-center'>
			<div className='w-56 md:w-auto'>
				<Preview incidents={incidents} />
			</div>
			<div>
				<p className='bb-label'>Interactive map</p>
				<h1 className='mt-1 text-[clamp(1.3rem,2.4vw,1.8rem)] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
					Every incident on one map, with the report behind each mark.
				</h1>
				<p className='mt-2 max-w-[40rem] text-[13.5px] leading-[1.7] text-[var(--ink-2)]'>
					Heat for where it keeps happening; dots coloured by kind and sized by deaths. Filters, details and each report down the left.
				</p>
			</div>
			<a href='#map' className='bb-btn bb-btn-solid !px-5 !py-3 !text-[10.5px]'>
				<MapTrifoldIcon size={15} weight='bold' aria-hidden='true' />
				Open the map
			</a>
		</div>
	)
}
