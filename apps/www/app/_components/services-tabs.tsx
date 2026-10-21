import { BankIcon, MapPinAreaIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'

/* Programs & services comes in two halves, each its own address: what the
   regional government's offices give, and what the provinces, cities and
   towns give. The tab bar sits under the band on both, so either is one
   click from the other, and each can be linked to on its own. */

const TABS = [
	{ key: 'regional', href: '/services', label: 'Regional offices', icon: BankIcon },
	{ key: 'lgu', href: '/services/lgu', label: 'Local governments', icon: MapPinAreaIcon },
] as const

export function ServicesTabs({ active, counts }: { active: 'regional' | 'lgu'; counts: Record<'regional' | 'lgu', number> }) {
	return (
		<nav aria-label='Programs and services' className='bb-container pt-8 lg:pt-10'>
			<ul className='flex gap-1 border-b border-[var(--rule)]'>
				{TABS.map(({ key, href, label, icon: Icon }) => {
					const on = key === active
					return (
						<li key={key}>
							<Link
								href={href}
								aria-current={on ? 'page' : undefined}
								className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-[14.5px] font-semibold transition ${
									on ? 'border-[var(--accent)] text-[var(--ink)]' : 'border-transparent text-[var(--ink-3)] hover:border-[var(--rule)] hover:text-[var(--ink)]'
								}`}
							>
								<Icon size={17} weight={on ? 'duotone' : 'regular'} className={on ? 'text-[var(--accent)]' : ''} aria-hidden='true' />
								{label}
								<span className='tabular-nums text-[12.5px] font-medium text-[var(--ink-mute)]'>{counts[key]}</span>
							</Link>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}
