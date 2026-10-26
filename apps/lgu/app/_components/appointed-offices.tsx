/* ============================================================
   The appointed offices a province, city or municipality must or
   may have, as the Bangsamoro Local Governance Code sets them
   (Secs. 481, 513, 523–549). Shared by Devolution and What each
   level does, so the two pages cannot disagree.

   The IRR's lists (arts. 229–231) are shorter for a municipality;
   where the two differ the Code prevails, and this follows it.
   ============================================================ */

/** R required, O optional, — not provided for at that level. */
type Need = 'R' | 'O' | '—'

const OFFICES: { office: string; province: Need; city: Need; municipality: Need; cite: string; note?: string }[] = [
	{ office: 'Secretary to the sanggunian', province: 'R', city: 'R', municipality: 'R', cite: 's. 523' },
	{ office: 'Treasurer', province: 'R', city: 'R', municipality: 'R', cite: 's. 524' },
	{ office: 'Assessor', province: 'R', city: 'R', municipality: 'R', cite: 's. 526' },
	{ office: 'Accountant', province: 'R', city: 'R', municipality: 'R', cite: 's. 528' },
	{ office: 'Budget officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 529' },
	{ office: 'Planning and development coordinator', province: 'R', city: 'R', municipality: 'R', cite: 's. 530' },
	{ office: 'Engineer', province: 'R', city: 'R', municipality: 'R', cite: 's. 531', note: 'also the building official in a city or municipality' },
	{ office: 'Health officer', province: 'R', city: 'R', municipality: 'R', cite: 'ss. 481, 532' },
	{ office: 'Civil registrar', province: '—', city: 'R', municipality: 'R', cite: 's. 533' },
	{ office: 'Administrator', province: 'R', city: 'R', municipality: 'R', cite: 's. 534' },
	{ office: 'Legal officer', province: 'R', city: 'R', municipality: 'O', cite: 's. 535' },
	{ office: 'Agriculturist', province: 'R', city: 'R', municipality: 'R', cite: 's. 536' },
	{ office: 'Social welfare and development officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 537' },
	{ office: 'Environment and natural resources officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 538' },
	{ office: 'Information officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 540' },
	{ office: 'Cooperatives development officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 541' },
	{ office: 'Veterinarian', province: 'R', city: 'R', municipality: 'O', cite: 's. 543' },
	{ office: 'General services officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 544' },
	{ office: 'Nutrition action officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 548' },
	{ office: 'Tourism officer', province: 'R', city: 'O', municipality: 'O', cite: 's. 546', note: 'required where there are major tourism industries' },
	{ office: 'ICT officer', province: 'O', city: 'O', municipality: 'O', cite: 's. 545' },
	{ office: 'Local women’s development officer', province: 'O', city: 'O', municipality: 'O', cite: 's. 547' },
	{ office: 'Librarian', province: 'O', city: 'O', municipality: 'O', cite: 's. 549' },
]

const NEED: Record<Need, string> = { R: 'Required', O: 'Optional', '—': '—' }

export function AppointedOffices() {
	return (
		<div className='mt-6 overflow-x-auto'>
			<table className='w-full min-w-[34rem] border-collapse text-left text-[0.875rem]'>
				<thead>
					<tr className='border-b border-[var(--ink)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
						<th className='py-3 pr-4 font-semibold'>Office</th>
						<th className='px-3 py-3 text-right font-semibold'>Province</th>
						<th className='px-3 py-3 text-right font-semibold'>City</th>
						<th className='px-3 py-3 text-right font-semibold'>Municipality</th>
					</tr>
				</thead>
				<tbody>
					{OFFICES.map((row) => (
						<tr key={row.office} className='border-b border-[var(--rule-soft)] align-middle'>
							<td className='py-3 pr-4'>
								<span className='font-semibold text-[var(--ink)]'>{row.office}</span>
								<span className='block text-[0.78125rem] text-[var(--ink-3)]'>
									{row.note ? `${row.note} · ` : ''}
									{row.cite}
								</span>
							</td>
							{([row.province, row.city, row.municipality] as Need[]).map((need, i) => (
								<td
									key={i}
									className={`px-3 py-3 text-right ${need === 'R' ? 'font-semibold text-[var(--accent)]' : 'text-[var(--ink-3)]'}`}
								>
									{NEED[need]}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
