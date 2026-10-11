import type { Metadata } from 'next'
import Link from 'next/link'
import { LguMasthead } from '../_components/lgu-parts'

export const metadata: Metadata = {
	title: 'Ordinances — Local government directory',
	description: 'The ordinances BARMM provinces, cities and municipalities pass. Coming soon.',
}

/* A placeholder until local ordinances are collected. */
export default function OrdinancesPage() {
	return (
		<>
			<LguMasthead kicker='Coming soon' name='Ordinances' />

			<section className='bb-container bb-section'>
				<p className='max-w-[48rem] text-[15px] leading-7 text-[var(--ink-2)]'>
					Every province, city and municipality passes its own ordinances: its budget, its taxes and fees, and the
					rules it sets for its people. We are gathering them, so you can find what your local council has passed.
				</p>
				<Link href='/officials' className='rule-link mt-6 inline-block text-[14px]'>
					See who sits on your council in the meantime
				</Link>
			</section>
		</>
	)
}
