import type { Metadata } from 'next'
import { DataTable, type DataColumn, type DataRow } from '../_components/data-table'
import { Masthead } from '../_components/parts'
import { suppliers } from '../_lib/philgeps'

export const metadata: Metadata = {
	title: 'Suppliers',
	description: 'Every supplier PhilGEPS records winning a contract from a BARMM government office, ranked by the amount awarded.',
}

/* The rest win little: the largest 1,000 hold 98% of the awarded amount. */
const SHOWN = 1000

const COLUMNS: DataColumn[] = [
	{ key: 'awards', label: 'Awards', format: 'int', hideBelow: 'md' },
	{ key: 'offices', label: 'Offices', format: 'int', hideBelow: 'lg' },
	{ key: 'last', label: 'Latest award', format: 'text', hideBelow: 'lg' },
	{ key: 'amount', label: 'Awarded', format: 'peso' },
]

export default function SuppliersPage() {
	const rows: DataRow[] = suppliers.slice(0, SHOWN).map((s) => ({
		key: s.name,
		href: `/notices?supplier=${encodeURIComponent(s.name)}`,
		name: s.name,
		mobile: `${s.awards} awards`,
		values: { awards: s.awards, offices: s.entities.size, last: s.last, amount: Math.round(s.amount) },
	}))
	return (
		<>
			<Masthead
				kicker='Procurement · Bangsamoro'
				name='Suppliers'
				note='Who wins the contracts. Each supplier PhilGEPS records as awarded a contract by a BARMM office, by the total awarded. Open one to see every contract it won.'
			/>
			<section className='bb-container bb-section'>
				<DataTable
					caption='Suppliers awarded contracts by BARMM government offices'
					nameLabel='Supplier'
					filterLabel='suppliers'
					columns={COLUMNS}
					rows={rows}
					initialSort={{ key: 'amount', down: true }}
					ranked
				/>
				<p className='mt-8 text-[13px] leading-6 text-[var(--ink-3)]'>
					The {SHOWN.toLocaleString('en-PH')} largest of {suppliers.length.toLocaleString('en-PH')} suppliers. Search{' '}
					<a href='/notices' className='rule-link'>
						Bid notices
					</a>{' '}
					by name for the rest. A supplier spelled two ways on PhilGEPS appears twice.
				</p>
			</section>
		</>
	)
}
