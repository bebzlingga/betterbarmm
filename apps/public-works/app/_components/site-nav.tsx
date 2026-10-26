'use client'

import { HandHeartIcon, SquaresFourIcon } from '@phosphor-icons/react'
import { EASE, ScrollProgress, UtilityBar, useHeaderScroll, BrandLogo, UtilityMenuLinks } from '@betterbarmm/editorial'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'

/* The workspace's doors: every project, the same by town, and where it comes from. */
const pages = [
	{ href: '/', label: 'Projects' },
	{ href: '/towns', label: 'By town' },
	{ href: '/sources', label: 'Sources' },
] as const

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
			<div className='mx-auto max-w-[88rem] px-8 sm:px-6 lg:px-8'>
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
							Public Works
						</Link>
					</div>

					{/* The menus sit on one line from 1280px; below that the menu button carries them. */}
					<nav className='hidden items-center justify-end gap-1 whitespace-nowrap md:flex'>
						{pages.map((page) => (
							<Link key={page.href} href={page.href} data-active={isActive(page.href)} className='nav-item'>
								{page.label}
							</Link>
						))}
					</nav>

					<div className='flex items-center justify-end gap-1.5'>
						<button
							type='button'
							aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
							aria-expanded={isMenuOpen}
							aria-controls='public-works-mobile-menu'
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
							id='public-works-mobile-menu'
							aria-label='Mobile navigation'
							className='mx-auto max-w-[88rem] px-8 py-6 sm:px-6 text-sm text-[var(--ink-2)] lg:px-8 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain'
						>
							<p className='bb-label'>Public Works</p>
							<div className='mt-3 grid'>
								{pages.map((page) => (
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
