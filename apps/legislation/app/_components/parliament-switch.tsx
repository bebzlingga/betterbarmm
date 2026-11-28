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
			{/* Two rounded tabs (user decision: the travel look), the rulebook on show filled. */}
			<div className='flex flex-wrap gap-3'>
				{PAGES.map((page) => {
					const on = page.href === current
					return (
						<Link
							key={page.href}
							href={page.href}
							aria-current={on ? 'page' : undefined}
							className={`flex shrink-0 items-center gap-3 rounded-full border py-2.5 pl-2.5 pr-6 transition ${on ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]' : 'border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)]'}`}
						>
							<span className={`grid size-10 place-items-center rounded-full ${on ? 'bg-white/15' : 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'}`}>
								{page.href === '/how-parliament-works' ? <BankIcon size={20} weight='duotone' aria-hidden='true' /> : <ClockCounterClockwiseIcon size={20} weight='duotone' aria-hidden='true' />}
							</span>
							<span>
								<span className='block font-[family-name:var(--font-display)] text-[1rem] font-bold tracking-[-0.01em]'>{page.label}</span>
								<span className={`block text-[0.75rem] ${on ? 'opacity-70' : 'text-[var(--ink-3)]'}`}>{page.note}</span>
							</span>
						</Link>
					)
				})}
			</div>
		</nav>
	)
}
