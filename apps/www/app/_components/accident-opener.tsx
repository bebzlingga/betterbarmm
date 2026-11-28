import { accidents } from '../_lib/accidents'
import { PhotoHero } from './photo-hero'
import { RegionMapCard } from './region-map-card'

/* ============================================================
   The way into the map, as the page's header

   The map is a dialog, so the page opens on a door to it: the words on
   the left (the headline wider, user decision), and on the right the map
   itself as a card, always there (user decision): the region drawn from
   the same PSA outlines as the front page's map, the count of what is on
   it, and the button. Every link is a plain `#map`; the dialog listens
   for the hash and opens, so nothing here needs to be a client component.
   No dots are drawn on the card: they would need the map's projection,
   and a card that only looked like the data would not be the data.
   ============================================================ */

function MapCard() {
	const since = Math.min(...accidents.map((a) => Number(a.date.slice(0, 4))))
	const dead = accidents.reduce((n, a) => n + (a.deaths ?? 0), 0)
	return <RegionMapCard corner={`Since ${since}`} value={accidents.length.toLocaleString('en-PH')} caption={`incidents mapped · ${dead.toLocaleString('en-PH')} dead`} />
}

export function AccidentOpener() {
	return (
		<PhotoHero
			photos={['cotabatoPlaza', 'lakeLanao', 'budBongao']}
			kicker='Incident Watch · interactive map'
			title={<span className='block text-[clamp(2.5rem,4.6vw,4.25rem)] leading-[1.02]'>Every incident on one map, with the report behind each mark.</span>}
			lede='Heat for where it keeps happening; dots coloured by kind and sized by deaths. Filters, details and each report down the left.'
			side={<MapCard />}
		/>
	)
}
