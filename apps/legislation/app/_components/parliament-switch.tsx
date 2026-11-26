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
			<div className='flex gap-6 overflow-x-auto sm:gap-8 border-b border-[var(--rule)] [scrollbar-width:none]'>
				{PAGES.map((page) => {
					const on = page.href === current
					return (
						<Link
							key={page.href}
							href={page.href}
							aria-current={on ? 'page' : undefined}
							className={`-mb-px shrink-0 border-b-2 pb-4 transition-colors ${on ? 'border-[var(--accent)]' : 'border-transparent hover:border-[var(--rule)]'}`}
						>
							<span className={`block text-[1.0625rem] font-extrabold tracking-[-0.015em] ${on ? 'text-[var(--ink)]' : 'text-[var(--ink-3)]'}`}>
								{page.label}
							</span>
							<span className='mt-0.5 block text-[0.75rem] text-[var(--ink-mute)]'>{page.note}</span>
						</Link>
					)
				})}
			</div>
		</nav>
	)
}
