'use client'

import { ArrowsLeftRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { flightSearchUrl } from '@betterbarmm/travel-data/transport'
import { useState } from 'react'

type Option = { code: string; label: string }

/* The booking-site search (user decision: a full travel site, flights included), without pretending to be one: this
   site sells nothing, so the form hands the route, date and party to Google Flights, which shows every airline's fares
   for it. */
export function FlightSearch({ origins, destinations }: { origins: Option[]; destinations: Option[] }) {
	const [from, setFrom] = useState(origins[0]?.code ?? '')
	const [to, setTo] = useState(destinations[0]?.code ?? '')
	const [date, setDate] = useState('')
	const [adults, setAdults] = useState(1)
	const all = [...origins, ...destinations.filter((d) => !origins.some((o) => o.code === d.code))]

	return (
		<form
			action={flightSearchUrl(from, to, date || undefined, adults)}
			onSubmit={(event) => {
				event.preventDefault()
				window.open(flightSearchUrl(from, to, date || undefined, adults), '_blank', 'noopener')
			}}
			className='grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_11rem_8rem_auto]'
		>
			<label className='bg-[var(--paper)] px-4 py-3'>
				<span className='tv-kind block'>From</span>
				<select value={from} onChange={(e) => setFrom(e.target.value)} className='mt-1 w-full bg-transparent text-[0.9375rem] font-semibold text-[var(--ink)] outline-none'>
					{all.map((o) => (
						<option key={o.code} value={o.code}>
							{o.label}
						</option>
					))}
				</select>
			</label>
			<button
				type='button'
				aria-label='Swap from and to'
				onClick={() => {
					setFrom(to)
					setTo(from)
				}}
				className='hidden items-center justify-center bg-[var(--paper)] px-3 text-[var(--ink-3)] transition hover:text-[var(--accent)] lg:flex'
			>
				<ArrowsLeftRightIcon size={18} weight='bold' aria-hidden='true' />
			</button>
			<label className='bg-[var(--paper)] px-4 py-3'>
				<span className='tv-kind block'>To</span>
				<select value={to} onChange={(e) => setTo(e.target.value)} className='mt-1 w-full bg-transparent text-[0.9375rem] font-semibold text-[var(--ink)] outline-none'>
					{all.map((o) => (
						<option key={o.code} value={o.code}>
							{o.label}
						</option>
					))}
				</select>
			</label>
			<label className='bg-[var(--paper)] px-4 py-3'>
				<span className='tv-kind block'>Departing</span>
				<input type='date' value={date} onChange={(e) => setDate(e.target.value)} className='mt-1 w-full bg-transparent text-[0.9375rem] font-semibold text-[var(--ink)] outline-none' />
			</label>
			<label className='bg-[var(--paper)] px-4 py-3'>
				<span className='tv-kind block'>Adults</span>
				<input
					type='number'
					min={1}
					max={9}
					value={adults}
					onChange={(e) => setAdults(Math.min(9, Math.max(1, Number(e.target.value) || 1)))}
					className='mt-1 w-full bg-transparent text-[0.9375rem] font-semibold text-[var(--ink)] outline-none'
				/>
			</label>
			<button
				type='submit'
				disabled={!from || !to || from === to}
				className='flex items-center justify-center gap-2 bg-[var(--accent)] px-6 py-4 font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:opacity-50 sm:col-span-2 lg:col-span-1'
			>
				<MagnifyingGlassIcon size={16} weight='bold' aria-hidden='true' />
				Search fares
			</button>
		</form>
	)
}
