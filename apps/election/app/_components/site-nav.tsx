'use client'

import { HandHeartIcon, SquaresFourIcon } from '@phosphor-icons/react'
import { EASE, ScrollProgress, UtilityBar, useHeaderScroll, BrandLogo, UtilityMenuLinks } from '@betterbarmm/editorial'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'

const pages = [
	{ href: '/', label: 'The election' },
	/* Second, not last. The count is what most people arrive for now, and a
	   workspace that puts its result behind the candidate list is answering a
	   question nobody is asking first. */
	{ href: '/results', label: 'The result' },
	{ href: '/candidates', label: 'Candidates' },
	/* What the seat actually is. The workspace could say who is standing and how
	   the seats are filled, and a reader could still leave without knowing what
	   the person they are voting for will do — which is the question underneath
	   the whole exercise. */
	{ href: '/the-job', label: 'The job' },
] as const

/**
 * The workspace bar.
 *
 * It used to be a brand band with the wordmark reversed out of it, which
 * made this workspace look like a different site that happened to share a
 * name. The estate's bar is paper with a brass hairline under it, and the
 * accent is spent on one thing — the rule that draws itself under whichever
 * page you are on.
 */
export function SiteNav() {
	const pathname = usePathname()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const { past, hidden } = useHeaderScroll(isMenuOpen)
	const closeMenu = () => setIsMenuOpen(false)

	const isActive = (href: string) =>
		href === '/' ? pathname === '/' : pathname.startsWith(href)

	return (
		<>
			{/* The estate's strip, above the workspace's own bar. Not sticky:
			    it belongs to the top of the document, and the navigation a
			    reader actually needs mid-page is the bar under it. */}
			<UtilityBar
				base='https://betterbarmm.com'
				current='election'
				className='bb-strip bg-[var(--paper-2)]'
				switchIcon={<SquaresFourIcon size={13} weight='bold' aria-hidden='true' />}
				end={
					<>
						<ThemeToggle />
						{/* Phones have no room for it in the strip; the wrapper hides it. */}
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
			<div className='mx-auto max-w-[var(--bb-page-width)] px-6 lg:px-8'>
				{/* Two tracks on a phone, three from `md` up.
				 *
				 * The center track holds a nav that is not rendered below `md`, so
				 * three equal-ish tracks gave the wordmark half the row and the
				 * controls the other half. The mark is a fixed-height image: the
				 * moment its share fell under its natural width, `max-width: 100%`
				 * squeezed it narrower while the inline height held, which is a
				 * wordmark rendered out of proportion. An `auto` track gives it
				 * exactly what it measures. */}
				<div className='grid h-[calc(var(--site-header-h)-1px)] grid-cols-[auto_1fr] items-center gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-2'>
					<div className='flex items-center gap-3'>
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
							Election
						</Link>
					</div>

					<nav className='hidden items-center justify-end gap-1 md:flex'>
						{pages.map((page) => (
							<Link
								key={page.href}
								href={page.href}
								data-active={isActive(page.href)}
								className='nav-item'
							>
								{page.label}
							</Link>
						))}
					</nav>

					<div className='flex items-center justify-end gap-2 md:gap-1.5'>
						<button
							type='button'
							aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
							aria-expanded={isMenuOpen}
							aria-controls='election-mobile-menu'
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
							id='election-mobile-menu'
							aria-label='Mobile navigation'
							className='mx-auto max-w-[var(--bb-page-width)] px-6 py-6 text-sm text-[var(--ink-2)] lg:px-8 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain'
						>
							<p className='bb-label'>This workspace</p>
							<div className='mt-3 grid'>
								{pages.map((page) => (
									<Link
										key={page.href}
										href={page.href}
										onClick={closeMenu}
										className='border-b border-[var(--rule-soft)] py-2.5'
									>
										{page.label}
									</Link>
								))}
							</div>

							{/* Last, under the links: the one row here that changes the page
							    rather than leaving it. */}
							<UtilityMenuLinks base='https://betterbarmm.com' onNavigate={closeMenu} />

							<p className='bb-label mt-7'>Appearance</p>
							<div className='mt-3 flex items-center justify-between gap-3 py-1'>
								Theme
								<span className='-mr-2 flex'>
									<ThemeToggle />
								</span>
							</div>
						</nav>
					</motion.div>
				) : null}
			</AnimatePresence>

			<ScrollProgress />
		</motion.header>
		</>
	)
}
