'use client'

import { useEffect, useState } from 'react'

const heroSlides = [
	{
		id: 'election',
		eyebrow: 'Election transparency layer',
		titleLines: ['Choose Leaders.', 'Shape Bangsamoro.'],
		description: 'Explore BARMM parliamentary parties, candidates, districts, sectoral seats, developing stories, and the election calendar shaping what voters will see before Election Day.',
		action: {
			label: 'Open election workspace',
			href: 'https://election.betterbarmm.com',
		},
	},
	{
		id: 'budget',
		eyebrow: 'Budget transparency layer',
		titleLines: ['Make public', 'money readable.'],
		description:
			'BetterBARMM turns appropriations, offices, programs, and source documents into civic infrastructure: searchable, traceable, and built for anyone who wants to follow how public money moves.',
		action: {
			label: 'Open budget portal',
			href: 'https://budget.betterbarmm.com',
		},
	},
	{
		id: 'bills',
		eyebrow: 'Legislative transparency layer',
		titleLines: ['Bangsamoro Laws,', 'Simplified.'],
		description: 'Track proposed measures, authors, committees, readings, and legislative movement as public records mature into laws, policies, and public accountability.',
		action: {
			label: 'Track public bills',
			href: 'https://bills.betterbarmm.com',
		},
	},
]

export function HomeHeroSlider() {
	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		const interval = window.setInterval(() => {
			setActiveIndex((currentIndex) => (currentIndex + 1) % heroSlides.length)
		}, 6500)

		return () => window.clearInterval(interval)
	}, [])

	return (
		<div className='relative grid'>
			{heroSlides.map((slide, slideIndex) => {
				const isActive = activeIndex === slideIndex

				return (
					<div
						key={slide.id}
						aria-hidden={!isActive}
						className={`home-hero-copy ${isActive ? 'home-hero-copy--active' : ''}`}
					>
						<p className='eyebrow home-hero-kicker'>{slide.eyebrow}</p>
						<h1 className='mt-4 max-w-6xl text-4xl font-extrabold leading-[0.92] tracking-[-0.035em] min-[380px]:text-5xl sm:mt-5 sm:text-7xl sm:tracking-[-0.04em] md:text-8xl lg:text-[8.5rem] xl:text-[9rem]'>
							{slide.titleLines.map((line, lineIndex) => (
								<span
									key={line}
									className='home-hero-title-line block'
									style={{ transitionDelay: isActive ? `${120 + lineIndex * 90}ms` : '0ms' }}
								>
									{line}
								</span>
							))}
						</h1>
						<p
							className='home-hero-description mt-6 max-w-3xl text-xl! leading-tight! text-[var(--ink-2)] sm:mt-7 sm:text-lg sm:leading-6! lg:text-xl lg:leading-8!'
							style={{ transitionDelay: isActive ? '340ms' : '0ms' }}
						>
							{slide.description}
						</p>
						<div
							className='home-hero-actions mt-8 flex flex-wrap items-center gap-3 sm:mt-14 lg:mt-16'
							style={{ transitionDelay: isActive ? '460ms' : '0ms' }}
						>
							<a
								href={slide.action.href}
								className='inline-flex w-full justify-center border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-[#16140f] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] sm:w-auto sm:text-[11px] sm:tracking-[0.14em]'
							>
								{slide.action.label}
							</a>
						</div>
					</div>
				)
			})}
		</div>
	)
}
