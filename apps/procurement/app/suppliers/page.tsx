import { DownloadSimpleIcon } from '@phosphor-icons/react/ssr'
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
			<section className='bb-container py-[clamp(3.5rem,7vw,5.5rem)]'>
				<SupplierExplorer rows={rows} groups={groups} />
				<p className='mt-8 flex justify-end'>
					<a href='/api/suppliers/csv' className='dv-pill' download>
						<DownloadSimpleIcon size={16} weight='bold' aria-hidden='true' />
						Download every supplier as CSV
					</a>
				</p>
				<p className='mt-4 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					A supplier&rsquo;s category is the kind of notice it won the most money on. A supplier spelled two ways on
					PhilGEPS appears twice.
				</p>
			</section>
		</>
	)
}
