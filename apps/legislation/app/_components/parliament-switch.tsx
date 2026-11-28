import { BankIcon, ClockCounterClockwiseIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'

/* ============================================================
   Which Parliament

   "How Parliament works" describes two rulebooks: the Standing Orders the
   elected Parliament adopted in November 2026, and the rules the appointed
   Transition Authority sat under before it. The second is kept, not replaced,
   because every act and journal from 2019 to 2026 was made under it.

   Drawn as the attendance page draws its Authority tabs, but as links: each
   rulebook is its own page with its own address.
   ============================================================ */

const PAGES = [
	{ href: '/how-parliament-works', label: 'Elected Parliament', note: 'Standing Orders · from 2026' },
	{
		href: '/how-parliament-works/transition-authority',
		label: 'Transition Authority',
		note: 'BTA rules · 2019–2026',
	},
] as const

export function ParliamentSwitch({ current }: { current: (typeof PAGES)[number]['href'] }) {
	return (
		<nav aria-label='Which Parliament' className='bb-container pt-10'>
			{/* The workspaces' tabs (user decision: one tab style everywhere), the rulebook on show the crimson pill. */}
			<div className='seg'>
				{PAGES.map((page) => {
					const on = page.href === current
					return (
						<Link
							key={page.href}
							href={page.href}
							aria-current={on ? 'page' : undefined}
							title={page.note}
							className='seg-tab'
						>
							{page.href === '/how-parliament-works' ? <BankIcon size={18} weight='duotone' aria-hidden='true' /> : <ClockCounterClockwiseIcon size={18} weight='duotone' aria-hidden='true' />}
							{page.label}
						</Link>
					)
				})}
			</div>
		</nav>
	)
}
