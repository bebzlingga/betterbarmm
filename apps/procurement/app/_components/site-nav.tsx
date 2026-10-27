'use client'

import { CaretDownIcon, HandHeartIcon, SquaresFourIcon } from '@phosphor-icons/react'
import { EASE, ScrollProgress, UtilityBar, useHeaderScroll, BrandLogo, UtilityMenuLinks } from '@betterbarmm/editorial'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './theme-toggle'

/* The workspace's doors, in three groups: the records themselves, what can be
   read off them, and how to read them. */
const groups = [
	{
		label: 'Records',
		pages: [
			{ href: '/', label: 'Entities', note: 'The offices that buy' },
			{ href: '/notices', label: 'Bid notices', note: 'What they put out to bid' },
			{ href: '/suppliers', label: 'Suppliers', note: 'Who wins the contracts' },
		],
	},
	{
		label: 'Analysis',
		pages: [
			{ href: '/follow-the-peso', label: 'Follow the peso', note: 'Budget, bid out, awarded' },
		],
	},
	{
		label: 'Guide',
		pages: [
			{ href: '/how-it-works', label: 'How it works', note: 'Bidding, thresholds and modes' },
			{ href: '/sources', label: 'Sources', note: 'Where the figures come from' },
		],
	},
]

const pages = groups.flatMap((g) => g.pages)

const MENU_NAME = 'text-[0.84375rem] font-bold tracking-[-0.02em] text-[var(--ink)]'
const MENU_NOTE = 'text-[0.6875rem] font-semibold text-[var(--ink-mute)]'

/** Opens on click; closes on Escape or a pointer landing outside it. The same
 *  menu as the budget workspace's bar. */
function Menu({ label, active, children }: { label: string; active: boolean; children: (close: () => void) => React.ReactNode }) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const onPointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) setOpen(false)
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false)
		}
		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [open])

	return (
		<div ref={ref} className='relative'>
			<button
				type='button'
				aria-expanded={open}
				aria-haspopup='menu'
				onClick={() => setOpen((current) => !current)}
				data-active={active}
				data-open={open}
				className='nav-item flex cursor-pointer items-center gap-1.5'
			>
				{label}
				<motion.span
					animate={{ rotate: open ? 180 : 0 }}
					transition={{ duration: 0.3, ease: EASE }}
					className='text-[var(--ink-mute)]'
				>
					<CaretDownIcon size={13} weight='bold' aria-hidden='true' />
				</motion.span>
			</button>

			<AnimatePresence>
				{open ? (
					<motion.div
						initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
						animate={{ opacity: 1, y: 0, scaleY: 1 }}
						exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
						transition={{ duration: 0.24, ease: EASE }}
						style={{ originY: 0 }}
						className='absolute right-0 top-full z-40 mt-1 w-[17rem] border border-[var(--ink)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)]'
					>
						{children(() => setOpen(false))}
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	)
}

export function SiteNav() {
	const pathname = usePathname()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const { past, hidden } = useHeaderScroll(isMenuOpen)
	const closeMenu = () => setIsMenuOpen(false)

	const isActive = (href: string) =>
		href === '/' ? !pages.some((p) => p.href !== '/' && pathname.startsWith(p.href)) : pathname.startsWith(href)

	return (
		<>
			{/* The estate's strip, above the workspace's own bar. Not sticky:
			    it belongs to the top of the document, and the navigation a
			    reader actually needs mid-page is the bar under it. */}
			<UtilityBar
				base='https://betterbarmm.com'
				current='procurement'
				className='bb-strip bg-[var(--paper-2)]'
				switchIcon={<SquaresFourIcon size={13} weight='bold' aria-hidden='true' />}
				end={
					<>
						<ThemeToggle size='size-7' />
						{/* Phones have no room for it in the strip; the wrapper hides it,
						    since the button's own display would beat `hidden`. */}
						<span className='hidden self-stretch sm:flex'>
							<a
								href='https://betterbarmm.com/contribute'
								target='_blank'
								rel='noreferrer'
								className='bb-btn bb-btn-accent !px-4 !py-0 !text-[0.59375rem]'
							>
								<HandHeartIcon size={13} weight='fill' aria-hidden='true' />
								Contribute
							</a>
						</span>
					</>
				}
			/>

			{/* The estate's masthead behaviour, the same on every workspace: it
			    takes a ground once the reader has left the top, and ducks out of the
			    way when they are reading down. `useHeaderScroll` also publishes the
			    flag the shared stylesheet reads to drop `--sticky-top`, so anything
			    sticking under this bar follows it up instead of leaving a band of
			    empty page. */}
		<motion.header
			animate={{ y: hidden ? '-100%' : '0%' }}
			transition={{ duration: 0.42, ease: EASE }}
			data-solid={past}
			className='sticky top-0 z-30 border-b border-[var(--brass-line)] bg-[var(--paper)]/86 backdrop-blur-xl'
		>
			<div className='mx-auto max-w-[var(--bb-page-width)] px-8 sm:px-6 lg:px-8'>
				<div className='grid h-[calc(var(--site-header-h)-1px)] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-2'>
					<div className='flex min-w-0 items-center gap-3'>
						<a href='https://betterbarmm.com' onClick={closeMenu} className='w-fit shrink-0'>
							<BrandLogo className='text-[var(--ink)]' />
						</a>
						<span aria-hidden='true' className='hidden h-5 w-px bg-[var(--rule)] sm:block' />
						{/* The wordmark says BetterBARMM; this says which of its
						    workspaces you are in. */}
						<Link
							href='/'
							onClick={closeMenu}
							className='hidden whitespace-nowrap font-[family-name:var(--font-display)] text-[0.65625rem] font-semibold uppercase leading-none tracking-[0.14em] text-[var(--brass)] transition hover:text-[var(--ink)] sm:block'
						>
							Procurement
						</Link>
					</div>

					{/* The menus sit on one line from 1280px; below that the menu button carries them. */}
					<nav className='hidden items-center justify-end gap-1 whitespace-nowrap md:flex'>
						{groups.map((group) => (
							<Menu key={group.label} label={group.label} active={group.pages.some((p) => isActive(p.href))}>
								{(close) =>
									group.pages.map((page) => (
										<Link
											key={page.href}
											href={page.href}
											onClick={close}
											aria-current={isActive(page.href) ? 'page' : undefined}
											className='nav-menu-item'
										>
											<span className={MENU_NAME}>{page.label}</span>
											<span className={MENU_NOTE}>{page.note}</span>
										</Link>
									))
								}
							</Menu>
						))}
					</nav>

					<div className='flex items-center justify-end gap-1.5'>
						<button
							type='button'
							aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
							aria-expanded={isMenuOpen}
							aria-controls='procurement-mobile-menu'
							onClick={() => setIsMenuOpen((current) => !current)}
							className='inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--ink)] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)] md:hidden'
						>
							<span className='sr-only'>{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
							<span aria-hidden='true' className='flex h-2.5 w-4 flex-col justify-between'>
								<motion.span
									animate={isMenuOpen ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
									transition={{ duration: 0.3, ease: EASE }}
									className='block h-px bg-current'
								/>
								<motion.span
									animate={{ opacity: isMenuOpen ? 0 : 1 }}
									transition={{ duration: 0.2 }}
									className='block h-px bg-current'
								/>
								<motion.span
									animate={isMenuOpen ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
									transition={{ duration: 0.3, ease: EASE }}
									className='block h-px bg-current'
								/>
							</span>
						</button>
					</div>
				</div>
			</div>

			<AnimatePresence initial={false}>
				{isMenuOpen ? (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.34, ease: EASE }}
						className='overflow-hidden border-t border-[var(--rule)] bg-[var(--paper)] md:hidden'
					>
						<nav
							id='procurement-mobile-menu'
							aria-label='Mobile navigation'
							className='mx-auto max-w-[var(--bb-page-width)] px-8 py-6 sm:px-6 text-sm text-[var(--ink-2)] lg:px-8 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain'
						>
							{groups.map((group, i) => (
								<div key={group.label} className={i ? 'mt-6' : ''}>
									<p className='bb-label'>{group.label}</p>
									<div className='mt-3 grid'>
										{group.pages.map((page) => (
											<Link
												key={page.href}
												href={page.href}
												onClick={closeMenu}
												data-active={isActive(page.href)}
												className='border-b border-[var(--rule-soft)] py-2.5 data-[active=true]:font-semibold data-[active=true]:text-[var(--accent)]'
											>
												{page.label}
											</Link>
										))}
									</div>
								</div>
							))}

							<UtilityMenuLinks base='https://betterbarmm.com' onNavigate={closeMenu} />
						</nav>
					</motion.div>
				) : null}
			</AnimatePresence>

			<ScrollProgress />
		</motion.header>
		</>
	)
}
