import type { Metadata } from 'next'
import Link from 'next/link'
import { FacilityMap } from '../_components/facility-map'
import { Masthead } from '../_components/parts'
import { facilityTotal } from '../_lib/health'
import { mapPoints } from '../_lib/towns'

export const metadata: Metadata = {
	title: 'Map',
	description: 'The hospitals, health centres and clinics in the region that OpenStreetMap volunteers have mapped, and where to find each.',
}

const hospitals = mapPoints.filter((p) => p.kind === 'hospital').length

export default function MapPage() {
	return (
		<>
			<Masthead
				kicker='Health · Bangsamoro'
				name='Care on a map'
				note={`${mapPoints.length} health facilities that volunteers have placed on OpenStreetMap: ${hospitals} hospitals and ${mapPoints.length - hospitals} health centres and clinics. The Department of Health counted ${(facilityTotal.government + facilityTotal.private).toLocaleString('en-PH')}, so most are not mapped yet.`}
			/>
			<section className='bb-container bb-section'>
				<FacilityMap points={mapPoints} className='h-[min(44rem,75vh)]' />
				<p className='mt-6 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					Choose a dot for its name, its barangay and its town. Hospitals are the larger dots. Map data © OpenStreetMap contributors,
					under the Open Database License; each facility links to its own record there, where it can be corrected. For how many
					facilities each town has, see{' '}
					<Link href='/towns' className='rule-link'>
						town by town
					</Link>
					.
				</p>
			</section>
		</>
	)
}
