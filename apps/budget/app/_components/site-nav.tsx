'use client'

import { CaretDownIcon } from '@phosphor-icons/react'
import { EASE } from '@betterbarmm/editorial'
import { AnimatePresence, motion } from 'motion/react'
import { FISCAL_YEARS, LATEST_YEAR, yearFrom } from '@betterbarmm/budget-data/years'
import Image from 'next/image'
import Link from 'next/link'
import { YearLink } from './year-link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './theme-toggle'

/**
 * The four ways into the Act, under one name.
 *
 * They were five links across the bar — Sectors, Offices, Programs,
 * Projects, Sources — and at that length the nav had to be pushed out to `lg`
 * to stop it overflowing a tablet, which left 768px readers with a hamburger
 * and a mostly empty header.
 *
 * They are also not five things. Four of them are the same Act cut four ways,
 * and saying so once is shorter than listing them: what it is for, who holds
 * it, what it pays for, what it builds. The fifth was never a way into the
 * budget at all — where the figures came from is a question you ask after
 * reading one, so Sources keeps its own link rather than sitting among them.
 *
 * Sectors leads because "what does the region spend on health" is the
 * question people actually arrive with, and the Act itself cannot answer it:
 * it is filed by who spends, not by what for.
 */
/* One shape for every row in every menu on this bar — the budget sections, the
   the fiscal years, and the same lists again in the mobile sheet.
   The name carries the row and the note explains it, set apart by size and
   weight rather than by color alone.

   Constants rather than the classes written per menu: they had drifted to
   three different sizes, because each was last touched on its own. */
const MENU_NAME = 'text-[13.5px] font-bold tracking-[-0.02em] text-[var(--ink)]'
const MENU_NOTE = 'text-[11px] font-semibold text-[var(--ink-mute)]'

const sections = [
	{ href: '/sectors', label: 'Sectors', note: 'What the money is for' },
	{ href: '/offices', label: 'Offices', note: 'Who holds it' },
	{ href: '/programs', label: 'Programs', note: 'What it pays for' },
	{ href: '/projects', label: 'Projects', note: 'What is being built' },
] as const

/**
 * A menu that opens on click and closes on Escape or any pointer landing
 * outside it. A dropdown that only closes by clicking its own trigger feels
 * broken, and the panel is mounted and unmounted rather than hidden so it can
 * play out — one that vanishes on the frame you release the mouse reads as a
 * mis-click.
 */
function Menu({
	label,
	active,
	width,
	children,
}: {
	label: string
	/** Underlined when the reader is on one of the pages inside it. */
	active?: boolean
	width: string
	children: (close: () => void) => React.ReactNode
}) {
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
						className={`absolute left-1/2 top-full z-40 mt-3 -translate-x-1/2 border border-[var(--ink)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] ${width}`}
					>
						<span aria-hidden='true' className='absolute inset-x-0 top-0 h-px bg-[var(--brass)]' />
						{children(() => setOpen(false))}
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	)
}

export function SiteNav() {
	const pathname = usePathname()
	/* The year the page is showing, read off the URL rather than the data: this
	   is the one component that has to know, and importing a year's figures to
	   learn its number would put both Acts in the browser bundle. */
	const fiscalYear = yearFrom(useSearchParams().get('fy'))
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const closeMenu = () => setIsMenuOpen(false)

	return (
		<header className='sticky top-0 z-30 border-b border-[var(--brass-line)] bg-[var(--paper)]/86 backdrop-blur-xl'>
			<div className='mx-auto max-w-[88rem] px-6 lg:px-8'>
				<div className='grid h-[calc(var(--site-header-h)-1px)] grid-cols-[1fr_auto_1fr] items-center gap-4'>
					<div className='flex min-w-0 items-center gap-3'>
						<a href='https://betterbarmm.com' onClick={closeMenu} className='w-fit shrink-0'>
							<Image
								src='/logo.png'
								alt='BetterBARMM'
								width={142}
								height={26}
								priority
								className='logo-light'
								style={{ height: 26, width: 'auto' }}
							/>
							<Image
								src='/logo-dark.png'
								alt='BetterBARMM'
								width={142}
								height={26}
								priority
								className='logo-dark'
								style={{ height: 26, width: 'auto' }}
							/>
						</a>
					</div>

					<nav className='hidden items-center gap-1 md:flex'>
						{/* Left of everything else, and the workspace's front door now that
						    the wordmark no longer carries a "Budget 2026" beside it: one Act
						    is a number, seven is a direction, and which year you are reading
						    is what the year menu on the right is for.

						    A plain `Link`, not a `YearLink` — this page is about all the
						    years at once, so carrying one of them onto it would say the
						    opposite of what it is for. */}
						<Link href='/' data-active={pathname === '/'} className='nav-item'>
							All years
						</Link>

						<Menu
							label='The budget'
							active={sections.some((section) => pathname.startsWith(section.href))}
							width='w-[19rem]'
						>
							{(close) =>
								sections.map((section) => (
									<YearLink
										key={section.href}
										href={section.href}
										onClick={close}
										className='nav-menu-item'
									>
										{/* `--ink-mute` is as light as small text goes here: the next
										    step down, `--ink-display`, is 3:1 on paper and this is
										    11px, which needs 4.5. */}
										<span className={MENU_NAME}>{section.label}</span>
										<span className={MENU_NOTE}>{section.note}</span>
									</YearLink>
								))
							}
						</Menu>

						<YearLink
							href='/process'
							data-active={pathname.startsWith('/process')}
							className='nav-item'
						>
							Process
						</YearLink>

						<YearLink
							href='/faq'
							data-active={pathname.startsWith('/faq')}
							className='nav-item'
						>
							FAQs
						</YearLink>

						<YearLink
							href='/sources'
							data-active={pathname.startsWith('/sources')}
							className='nav-item'
						>
							Sources
						</YearLink>
					</nav>

					<div className='flex items-center justify-end gap-1.5'>
						{/* The year the workspace is showing, and the years it could. Built on
						    the same `Menu` as the bar's other dropdowns, so it closes on
						    Escape and on a pointer landing outside it like they do. */}
						<div className='hidden lg:block'>
							<Menu label={`FY ${fiscalYear}`} width='w-[15rem]'>
								{/* Straight off `FISCAL_YEARS`, not a list kept beside it. The
								    hand-written version of this said FY 2020 was "not yet
								    extracted" for a while after it was — a menu that describes
								    the data should be read from the data.

								    Only the open year carries a note (user decision). Every Act
								    here has been read line by line, so saying it on six rows
								    marked nothing; it is the year you are in that the menu has
								    to point at. */}
								{(close) =>
									FISCAL_YEARS.map((year) => {
										const current = year === fiscalYear

										if (current) {
											return (
												<p key={year} aria-current='true' className='nav-menu-item'>
													<span className={MENU_NAME}>FY {year}</span>
													<span className={MENU_NOTE}>Showing now</span>
												</p>
											)
										}

										/* Stays on the page it was clicked from, with the year
										   swapped: a reader comparing two years of the same office
										   wants that office in the other year, not the front door
										   of it. The latest year is the bare URL, so switching back
										   to it takes the parameter off rather than pinning it. */
										return (
											<Link
												key={year}
												href={year === LATEST_YEAR ? pathname : `${pathname}?fy=${year}`}
												onClick={close}
												className='nav-menu-item'
											>
												<span className={MENU_NAME}>FY {year}</span>
											</Link>
										)
									})
								}
							</Menu>
						</div>

						{/* To the right of the year (user decision): the year is what the bar
						    is saying, and the theme switch is a preference beside it. */}
						<ThemeToggle />

						<button
							type='button'
							aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
							aria-expanded={isMenuOpen}
							aria-controls='budget-mobile-menu'
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
							id='budget-mobile-menu'
							aria-label='Mobile navigation'
							className='mx-auto max-w-[88rem] px-6 py-6 text-sm text-[var(--ink-2)] lg:px-8'
						>
							<p className='bb-label'>The budget</p>
							<div className='mt-3 grid'>
								{[
									...sections,
									{ href: '/process', label: 'Process', note: 'How a budget is made' },
									{ href: '/faq', label: 'FAQs', note: 'What the words mean' },
									{ href: '/sources', label: 'Sources', note: 'Where the figures came from' },
								].map(
									(section) => (
										<YearLink
											key={section.href}
											href={section.href}
											onClick={closeMenu}
											className='flex items-baseline justify-between gap-3 border-b border-[var(--rule-soft)] py-2.5'
										>
											<span className={MENU_NAME}>{section.label}</span>
											<span className={MENU_NOTE}>{section.note}</span>
										</YearLink>
									),
								)}
							</div>
						</nav>
					</motion.div>
				) : null}
			</AnimatePresence>
		</header>
	)
}
