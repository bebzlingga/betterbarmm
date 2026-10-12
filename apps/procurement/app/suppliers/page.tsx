import type { Metadata } from 'next'
import { SupplierExplorer, type SupplierRow } from '../_components/supplier-explorer'
import { Masthead } from '../_components/parts'
import { groups, supplierSlug, suppliers } from '../_lib/philgeps'

export const metadata: Metadata = {
	title: 'Suppliers',
	description: 'Every supplier PhilGEPS records winning a contract from a BARMM government office, ranked by the amount awarded.',
}

export default function SuppliersPage() {
	const rows: SupplierRow[] = suppliers.map((s) => ({
		name: s.name,
		slug: supplierSlug(s.name),
		group: s.group,
		awards: s.awards,
		offices: s.entities.size,
		last: s.last,
		amount: Math.round(s.amount),
	}))
	return (
		<>
			<Masthead
				kicker='Procurement · Bangsamoro'
				name='Suppliers'
				note='Who wins the contracts. Each supplier PhilGEPS records as awarded a contract by a BARMM office, by the total awarded. Open one to see every contract it won.'
			/>
			<section className='bb-container bb-section'>
				<SupplierExplorer rows={rows} groups={groups} />
				<p className='mt-8 text-[13px] leading-6'>
					<a href='/api/suppliers/csv' className='rule-link font-semibold text-[var(--ink)]' download>
						Download every supplier as CSV
					</a>
				</p>
				<p className='mt-4 text-[13px] leading-6 text-[var(--ink-3)]'>
					A supplier&rsquo;s category is the kind of notice it won the most money on. A supplier spelled two ways on
					PhilGEPS appears twice.
				</p>
			</section>
		</>
	)
}
