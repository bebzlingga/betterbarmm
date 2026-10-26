/** One office-holder: name and role on the left, party on the right. */
export function Official({ name, party, role }: { name: string; party: string | null; role: string }) {
	return (
		<li className='flex items-baseline justify-between gap-4 border-b border-[var(--rule)] py-3'>
			<span className='min-w-0'>
				<span className='block text-[0.90625rem] font-semibold leading-snug text-[var(--ink)]'>{name}</span>
				<span className='mt-0.5 block text-[0.75rem] text-[var(--ink-3)]'>{role}</span>
			</span>
			{party ? <span className='shrink-0 text-[0.75rem] font-medium text-[var(--ink-2)]'>{party}</span> : null}
		</li>
	)
}
