import type { Metadata } from 'next'
import { explorePlaces } from '@betterbarmm/travel-data/explore'
import { SavedList } from '../_components/saved-list'
import { TravelMasthead } from '../_components/travel-parts'
import { toCard } from '../_lib/cards'

export const metadata: Metadata = {
	title: 'Saved places',
	description: 'The places you have saved in Travel & Places, kept in this browser.',
	robots: { index: false },
}

/* The places a reader has hearted. Kept in their browser, not on a server: there are no accounts here. */
export default function SavedPage() {
	return (
		<>
			<TravelMasthead kicker='Travel & Places' name='Saved places' note='Kept in this browser only: there are no accounts here. Clearing your browsing data clears them.' />
			<div className='bb-container pb-24 pt-10'>
				<SavedList places={explorePlaces.map(toCard)} />
			</div>
		</>
	)
}
